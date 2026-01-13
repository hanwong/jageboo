# Task 015: PWA 설정 및 배포 준비

## 개요

자영업자 장부 앱을 PWA(Progressive Web App)로 구성하고 Vercel에 배포할 수 있도록 준비합니다. 사용자가 홈 화면에 앱을 추가하여 네이티브 앱처럼 사용할 수 있도록 합니다.

## 관련 기능

- **전체**: PWA 지원으로 설치 가능한 웹 앱
- **F000-F015**: 모든 기능이 오프라인에서도 부분 작동 가능
- **배포**: Vercel을 통한 프로덕션 배포

## PWA 요구사항

### 필수 요소

1. **Web App Manifest**: 앱 메타데이터 (이름, 아이콘, 색상 등)
2. **HTTPS**: Vercel에서 자동 제공
3. **반응형 디자인**: 이미 구현됨
4. **아이콘**: 다양한 크기의 앱 아이콘

### 선택 요소

- **Service Worker**: 오프라인 지원 (선택사항)
- **Push Notifications**: 알림 기능 (향후)

## 구현 단계

### 1단계: PWA Manifest 생성

#### A. manifest.json 파일 생성

`app/manifest.ts` (Next.js 15+ 권장 방식):

```typescript
import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "자영업자 장부 - 매입매출 관리",
    short_name: "자영업자 장부",
    description: "5초 만에 매입매출을 기록하고 실시간 영업이익을 확인하세요",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#18181b",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    categories: ["business", "finance", "productivity"],
    lang: "ko-KR",
  }
}
```

#### B. 아이콘 생성

필요한 아이콘 크기:

- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)
- `apple-touch-icon.png` (180x180px) - iOS용
- `favicon.ico` - 브라우저 탭

**디자인 가이드**:

- 심플한 아이콘 (매출/매입 또는 장부 이미지)
- Safe area 내에 콘텐츠 배치 (maskable icon 규격)
- 배경색: 브랜드 컬러
- 텍스트 없이 심볼만 사용 권장

#### C. 메타 태그 추가

`app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  // 기존 메타데이터...
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "자영업자 장부",
  },
  formatDetection: {
    telephone: false,
  },
}
```

### 2단계: 앱 아이콘 생성 및 배치

#### 아이콘 제작 방법

**옵션 1: Figma/디자인 툴 사용**

- 512x512 캔버스
- 심플한 장부/계산기 아이콘
- Export: PNG, 다양한 크기

**옵션 2: Favicon Generator 사용**

- https://realfavicongenerator.net/
- 하나의 SVG/PNG로 모든 크기 생성

**옵션 3: 임시 플레이스홀더**

```bash
# ImageMagick으로 임시 아이콘 생성 (개발용)
convert -size 192x192 xc:#18181b -fill white -gravity center \
  -pointsize 80 -annotate +0+0 "장부" public/icon-192.png
convert -size 512x512 xc:#18181b -fill white -gravity center \
  -pointsize 200 -annotate +0+0 "장부" public/icon-512.png
```

#### 파일 배치

```
public/
├── icon-192.png
├── icon-512.png
├── apple-touch-icon.png
└── favicon.ico
```

### 3단계: 서비스 워커 (선택사항)

#### A. next-pwa 라이브러리 사용

```bash
pnpm add next-pwa
pnpm add -D webpack
```

`next.config.ts`:

```typescript
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
})

export default withPWA(nextConfig)
```

#### B. 캐싱 전략

**캐시할 리소스**:

- 정적 파일 (CSS, JS, 폰트)
- API 응답 (제한적)

**캐시하지 않을 리소스**:

- 인증 관련 요청
- 실시간 데이터

**참고**: MVP에서는 서비스 워커 없이도 충분 (선택사항)

### 4단계: Vercel 배포 설정

#### A. vercel.json 생성 (선택사항)

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["icn1"]
}
```

- `icn1`: Seoul region (한국 사용자 대상)

#### B. 환경 변수 설정

Vercel Dashboard → Project Settings → Environment Variables:

**필수 환경 변수**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

**참고**:

- `.env.local` 파일은 git에 포함되지 않음
- Vercel에 직접 설정 필요

#### C. .gitignore 확인

```gitignore
# 이미 포함되어야 하는 항목
.env*.local
.env
.vercel
.next
node_modules
```

### 5단계: 배포 전 체크리스트

#### 보안 체크

- [ ] `.env.local` 파일이 `.gitignore`에 포함됨
- [ ] API 키가 코드에 하드코딩되지 않음
- [ ] Supabase RLS 정책 활성화됨
- [ ] CORS 설정 확인

#### 성능 체크

- [x] `pnpm build` 성공
- [x] `pnpm check-all` 통과
- [ ] Lighthouse 점수 확인 (배포 후)

#### 기능 체크

- [ ] 로그인/로그아웃 작동
- [ ] 거래 생성/수정/삭제 작동
- [ ] 반복 거래 작동
- [ ] 기간별 요약 작동
- [ ] 모바일 반응형 디자인 확인

### 6단계: Vercel 배포

#### 첫 배포 (GitHub 연동)

1. **GitHub Repository 생성**

   ```bash
   git remote add origin https://github.com/username/jageboo-next.git
   git branch -M main
   git push -u origin main
   ```

2. **Vercel에 Import**
   - https://vercel.com/new
   - GitHub 저장소 선택
   - Framework Preset: Next.js (자동 감지)
   - 환경 변수 설정
   - Deploy 클릭

3. **배포 확인**
   - Vercel에서 할당한 URL 확인
   - 프로덕션 빌드 성공 확인

#### 이후 배포

```bash
# main 브랜치에 푸시하면 자동 배포
git add .
git commit -m "feature: ..."
git push origin main
```

#### 커스텀 도메인 (선택사항)

Vercel Dashboard → Domains:

- `jageboo.com` 추가
- DNS 설정 (A 레코드 또는 CNAME)
- HTTPS 자동 활성화

### 7단계: 배포 후 검증

#### A. PWA 설치 테스트

**데스크톱 (Chrome)**:

1. 배포된 URL 접속
2. 주소창 우측 "설치" 아이콘 클릭
3. "설치" 버튼 클릭
4. 앱이 독립 창에서 실행되는지 확인

**모바일 (iOS Safari)**:

1. 배포된 URL 접속
2. 공유 버튼 → "홈 화면에 추가"
3. 홈 화면에서 앱 아이콘 확인
4. 앱 실행 시 standalone 모드 확인

**모바일 (Android Chrome)**:

1. 배포된 URL 접속
2. 메뉴 → "홈 화면에 추가"
3. 설치 배너 표시 확인
4. 앱 실행 시 standalone 모드 확인

#### B. Lighthouse 점수 측정

Chrome DevTools → Lighthouse:

- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90
- PWA: 모든 항목 통과

#### C. 실제 사용 테스트

- [ ] 로그인/로그아웃
- [ ] 거래 입력 (5초 목표)
- [ ] 거래 수정/삭제
- [ ] 반복 거래 설정
- [ ] 기간별 요약 확인
- [ ] 다크 모드 전환
- [ ] 모바일 반응형

## 수락 기준

### 필수

- [x] PWA manifest 파일 생성 (`app/manifest.ts`)
- [x] 앱 아이콘 생성 및 배치 (icon.tsx, apple-icon.tsx)
- [x] 메타데이터 PWA 설정 추가 (layout.tsx)
- [x] `.gitignore`에 환경 변수 파일 포함
- [x] 배포 문서 작성 (DEPLOYMENT.md)
- [x] `pnpm check-all` 통과
- [x] `pnpm build` 성공
- [ ] Vercel 배포 성공 (사용자가 직접 수행)
- [ ] 배포된 앱에서 모든 기능 작동 (배포 후 테스트)
- [ ] PWA 설치 가능 (배포 후 테스트)

### 선택사항

- [ ] 서비스 워커 구성 (오프라인 지원) - MVP에서 불필요
- [ ] 커스텀 도메인 연결
- [ ] Lighthouse PWA 점수 100점 (배포 후 측정)

## 완료 내역

### PWA Manifest
- ✅ `app/manifest.ts` 생성
- ✅ 앱 이름: "자영업자 장부 - 매입매출 관리"
- ✅ display: "standalone" (앱처럼 실행)
- ✅ theme_color: "#18181b" (다크 테마)
- ✅ background_color: "#ffffff"
- ✅ orientation: "portrait-primary" (세로 모드)
- ✅ categories: ["business", "finance", "productivity"]

### 앱 아이콘
- ✅ `app/icon.tsx` 생성 (512x512, Next.js ImageResponse)
- ✅ `app/apple-icon.tsx` 생성 (180x180, iOS용)
- ✅ 자동 생성: `/icon`, `/apple-icon` 라우트
- ✅ manifest에서 `/icon.png` 참조

### 메타데이터
- ✅ `manifest: "/manifest.json"` 추가
- ✅ `appleWebApp.capable: true` (iOS standalone 모드)
- ✅ `appleWebApp.statusBarStyle: "default"`
- ✅ `appleWebApp.title: "자영업자 장부"`
- ✅ `formatDetection.telephone: false` (전화번호 자동 링크 방지)

### 배포 준비
- ✅ `.gitignore` 확인 (.env*.local, .vercel, .next 포함)
- ✅ `DEPLOYMENT.md` 작성 (상세한 배포 가이드)
- ✅ 환경 변수 문서화
- ✅ GitHub 연동 방법 안내
- ✅ Vercel 배포 단계별 가이드
- ✅ PWA 설치 테스트 방법
- ✅ 문제 해결 가이드

### 빌드 확인
- ✅ 컴파일 성공 (3초)
- ✅ manifest.webmanifest 자동 생성
- ✅ icon, apple-icon 라우트 생성
- ✅ 모든 페이지 정상 빌드

## 배포 다음 단계

사용자가 직접 수행해야 할 작업:

1. **GitHub Repository 생성 및 Push**
   ```bash
   git remote add origin https://github.com/username/jageboo-next.git
   git branch -M main
   git add .
   git commit -m "🎉 feat: 자영업자 장부 앱 완성"
   git push -u origin main
   ```

2. **Vercel에 배포**
   - https://vercel.com 로그인
   - "Add New Project" 클릭
   - GitHub 저장소 선택
   - 환경 변수 설정:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - Deploy 클릭

3. **배포 후 테스트**
   - 모든 기능 작동 확인
   - PWA 설치 테스트 (Chrome, Safari, Android)
   - Lighthouse 점수 측정

상세한 내용은 `DEPLOYMENT.md` 참조

## 참고 자료

- Next.js PWA: https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps
- Web App Manifest: https://web.dev/add-manifest/
- Vercel 배포: https://vercel.com/docs
- PWA Checklist: https://web.dev/pwa-checklist/
- Favicon Generator: https://realfavicongenerator.net/
- next-pwa: https://github.com/shadowwalker/next-pwa
