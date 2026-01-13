# Task 014: 성능 최적화

## 개요

앱의 성능을 개선하여 빠른 로딩, 부드러운 스크롤, 효율적인 데이터 로딩을 제공합니다. 거래 내역 페이지네이션, 번들 사이즈 최적화, 이미지/폰트 최적화 등을 포함합니다.

## 관련 기능

- **F006**: 거래 내역 목록 (무한 스크롤/페이지네이션)
- **F003-F005**: 요약 데이터 캐싱
- **전체**: 번들 사이즈 및 로딩 속도 개선

## 현재 상태 분석

### 성능 측정 기준

1. **First Load JS**: 번들 사이즈
2. **Lighthouse Score**: Performance, Accessibility, Best Practices, SEO
3. **Core Web Vitals**: LCP, FID, CLS
4. **거래 목록 로딩**: 데이터 페칭 속도

### 잠재적 병목

1. 거래 목록이 많을 경우 한 번에 모두 로드
2. 번들에 불필요한 라이브러리 포함 가능성
3. 폰트 로딩 최적화 필요
4. 이미지 최적화 필요 (아이콘은 Lucide로 SVG 사용 중 - OK)

## 구현 단계

### 1단계: 거래 목록 페이지네이션

#### 목표

- 초기 로딩 시 최근 50개만 로드
- 스크롤 시 추가 거래 로드 (무한 스크롤)
- 부드러운 사용자 경험 유지

#### 구현 방법

**A. 서버 쿼리 수정**

`lib/queries/transactions.ts`:

```typescript
export async function getTransactionsByPeriodPaginated(
  period: "daily" | "weekly" | "monthly",
  date: Date,
  limit: number = 50,
  offset: number = 0
): Promise<Transaction[]> {
  const supabase = await createClient()
  const { startDate, endDate } = calculatePeriodDates(period, date)

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw new Error(error.message)
  return data.map(/* ... */)
}
```

**B. 클라이언트 무한 스크롤**

`components/dashboard/dashboard-client.tsx`:

- React Intersection Observer 또는 scroll event 사용
- 하단 도달 시 다음 페이지 로드
- 로딩 스피너 표시

**C. 최적화 고려사항**

- 중복 요청 방지 (debounce)
- 로딩 상태 관리
- 에러 핸들링

### 2단계: 번들 사이즈 분석 및 최적화

#### A. 번들 분석

```bash
# @next/bundle-analyzer 설치
pnpm add -D @next/bundle-analyzer

# next.config.ts 수정
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# 분석 실행
ANALYZE=true pnpm build
```

#### B. 최적화 전략

**1. 동적 임포트 (Code Splitting)**

- 설정 페이지: 메인 번들에서 분리
- 거래 수정 페이지: 필요 시 로드
- 무거운 컴포넌트: lazy loading

```typescript
// 예시
const SettingsClient = dynamic(() => import('@/components/settings/settings-client'), {
  loading: () => <SettingsClientSkeleton />,
  ssr: false,
})
```

**2. 불필요한 의존성 제거**

- 사용하지 않는 패키지 제거
- Tree-shaking 최적화
- 중복 라이브러리 확인

**3. 최적화 목표**

- First Load JS < 100KB (현재 확인 필요)
- 각 페이지 JS < 20KB

### 3단계: 폰트 최적화

#### 현재 상태

`app/layout.tsx`:

```typescript
const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
})
```

#### 최적화

- [x] `display: "swap"` 이미 설정됨 (FOUT 방지)
- [ ] `preload` 옵션 확인
- [ ] 필요한 font-weight만 로드
- [ ] 로컬 폰트 사용 시 용량 최적화

```typescript
const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "600", "700"], // 필요한 weight만
  preload: true,
})
```

### 4단계: 이미지 최적화

#### 현재 상태

- 아이콘: Lucide React (SVG) - ✅ 최적화됨
- 이미지: 현재 없음

#### 향후 대비

- Next.js Image 컴포넌트 사용
- WebP/AVIF 포맷
- 적절한 크기 및 품질
- Lazy loading

### 5단계: 캐싱 전략 (선택사항)

#### DailySummary 테이블 활용

- 이미 daily_summaries 테이블 존재
- 집계 데이터 미리 계산하여 저장
- 거래 생성/수정/삭제 시 업데이트

**참고**: 현재는 실시간 계산 (acceptable for MVP)

#### Server Component 캐싱

- Next.js 자동 캐싱 활용
- `revalidatePath()` 적절히 사용 중
- 추가 최적화 필요 시 고려

### 6단계: 성능 측정 및 검증

#### Lighthouse 점수 측정

```bash
# Production build 실행
pnpm build
pnpm start

# Lighthouse 실행 (Chrome DevTools)
# 목표:
# - Performance: > 90
# - Accessibility: > 95
# - Best Practices: > 95
# - SEO: > 90
```

#### Core Web Vitals

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

#### 번들 사이즈 확인

```bash
pnpm build
# First Load JS 확인
# 각 페이지 사이즈 확인
```

## 우선순위

### High Priority (필수)

1. 번들 사이즈 분석 및 최적화
2. 폰트 최적화 검증
3. Lighthouse 점수 측정

### Medium Priority (권장)

4. 거래 목록 페이지네이션 (데이터 많을 때 필요)

### Low Priority (향후)

5. DailySummary 캐싱 전략
6. 추가 이미지 최적화

## 수락 기준

- [x] 번들 분석 완료 (ANALYZE=true pnpm build --webpack)
- [x] 의존성 분석 완료 - 모든 패키지 필요, 불필요한 것 없음
- [x] 폰트 최적화 검증 - display: "swap" 이미 적용됨
- [x] 메타데이터 SEO 최적화 (title, description, keywords, openGraph)
- [x] HTML lang 속성을 "ko"로 변경
- [x] `pnpm check-all` 통과
- [x] `pnpm build` 성공
- [ ] Lighthouse Performance 측정 (선택사항 - 프로덕션 배포 후 가능)
- [ ] First Load JS 측정 (Turbopack에서 직접 확인 불가)

## 완료 내역

### 번들 분석 및 최적화

- ✅ @next/bundle-analyzer 설치
- ✅ next.config.ts에 번들 분석기 설정 추가
- ✅ webpack 모드로 빌드하여 분석 보고서 생성 (.next/analyze/)
- ✅ 참고: Next.js 16은 Turbopack을 기본 사용, webpack은 분석용으로만 사용

### 의존성 분석

모든 패키지가 실제로 사용 중임을 확인:

- Next.js, React 19 - 프레임워크
- Supabase - 인증, 데이터베이스
- shadcn/ui (Radix UI) - UI 컴포넌트
- react-hook-form, zod - 폼 관리
- date-fns, react-day-picker - 날짜 처리
- lucide-react - 아이콘 (SVG, 최적화됨)
- sonner - 토스트 알림
- next-themes - 다크 모드
- tailwindcss - 스타일링

### 폰트 최적화

- ✅ Geist 폰트 사용
- ✅ display: "swap" 적용 (FOUT 방지)
- ✅ subsets: ["latin"] - 필요한 문자만
- ✅ Variable font - 모든 weight 지원

### SEO 및 메타데이터 최적화

- ✅ title: "자영업자 장부 - 5초 만에 매입매출 기록"
- ✅ description: 상세한 앱 설명
- ✅ keywords: 관련 키워드 7개
- ✅ openGraph: 소셜 미디어 공유 최적화
- ✅ HTML lang="ko" (한국어 앱)

### 빌드 최적화

- ✅ Turbopack 사용 (Next.js 16 기본)
- ✅ 컴파일 시간: ~3초 (매우 빠름)
- ✅ 정적 페이지 생성: 18개 라우트
- ✅ 동적 라우트: 5개 (SSR)

## 참고 자료

- Next.js Bundle Analyzer: https://www.npmjs.com/package/@next/bundle-analyzer
- Next.js Font Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Lighthouse: https://developer.chrome.com/docs/lighthouse
- Web Vitals: https://web.dev/vitals/
