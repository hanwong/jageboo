# 배포 가이드

자영업자 장부 앱을 Vercel에 배포하는 방법을 안내합니다.

## 사전 준비

### 1. Supabase 프로젝트 확인

배포 전에 Supabase 프로젝트가 설정되어 있어야 합니다:

- Supabase 프로젝트 생성 완료
- 데이터베이스 테이블 및 RLS 정책 설정 완료
- API URL 및 anon key 확인

### 2. 환경 변수 준비

`.env.local` 파일의 환경 변수를 확인합니다:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

**중요**: 이 값들은 Vercel에 수동으로 설정해야 합니다.

## Vercel 배포 방법

### 방법 1: GitHub 연동 (권장)

#### 1단계: GitHub Repository 생성

```bash
# GitHub에 새 저장소 생성 후
git remote add origin https://github.com/username/jageboo-next.git
git branch -M main
git add .
git commit -m "🎉 feat: 자영업자 장부 앱 완성"
git push -u origin main
```

#### 2단계: Vercel에 Import

1. https://vercel.com 로그인
2. "Add New Project" 클릭
3. GitHub 계정 연결
4. `jageboo-next` 저장소 선택
5. "Import" 클릭

#### 3단계: 프로젝트 설정

**Framework Preset**: Next.js (자동 감지됨)

**Build and Output Settings**:

- Build Command: `pnpm build` (기본값)
- Output Directory: `.next` (기본값)
- Install Command: `pnpm install` (기본값)

**Root Directory**: `.` (기본값)

#### 4단계: 환경 변수 설정

"Environment Variables" 섹션에서 추가:

| Name                                   | Value                              | Environment                      |
| -------------------------------------- | ---------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | `https://your-project.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `your-anon-key`                    | Production, Preview, Development |

**참고**:

- Production: 프로덕션 배포
- Preview: PR/브랜치 프리뷰
- Development: 로컬 개발 (선택사항)

#### 5단계: Deploy

"Deploy" 버튼 클릭 → 배포 시작

**배포 시간**: 약 2-3분

### 방법 2: Vercel CLI

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

## 배포 후 확인

### 1. 배포 URL 확인

Vercel이 자동으로 생성한 URL:

- `https://jageboo-next-username.vercel.app`

### 2. 기능 테스트

- [ ] 홈 페이지 로딩
- [ ] 로그인/로그아웃
- [ ] 거래 생성 (매출/매입)
- [ ] 거래 수정/삭제
- [ ] 반복 거래 설정
- [ ] 기간별 요약 (일/주/월)
- [ ] 다크 모드 전환
- [ ] 모바일 반응형

### 3. PWA 설치 테스트

#### 데스크톱 (Chrome)

1. 배포된 URL 접속
2. 주소창 우측 "설치" 아이콘 클릭
3. "설치" 버튼 클릭
4. 독립 창에서 앱 실행 확인

#### 모바일 (iOS Safari)

1. 배포된 URL 접속
2. 공유 버튼 → "홈 화면에 추가"
3. 홈 화면에서 앱 아이콘 확인
4. 앱 터치 → standalone 모드 확인

#### 모바일 (Android Chrome)

1. 배포된 URL 접속
2. 메뉴 → "홈 화면에 추가"
3. 설치 배너 확인
4. 앱 터치 → standalone 모드 확인

### 4. Lighthouse 점수 측정

Chrome DevTools (F12) → Lighthouse 탭:

- Performance: > 85
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90
- PWA: 모든 항목 통과

## 자동 배포

### Git Push 시 자동 배포

GitHub에 push하면 자동으로 배포됩니다:

```bash
git add .
git commit -m "feat: 새 기능 추가"
git push origin main
```

- `main` 브랜치 → 프로덕션 배포
- 다른 브랜치 → 프리뷰 배포

### Pull Request 프리뷰

PR 생성 시 자동으로 프리뷰 환경이 생성됩니다.

## 커스텀 도메인 (선택사항)

### 1. 도메인 구매

예: `jageboo.com` (가비아, Cloudflare, Namecheap 등)

### 2. Vercel에 도메인 추가

1. Vercel Dashboard → Settings → Domains
2. "Add" 클릭
3. 도메인 입력: `jageboo.com`
4. DNS 설정 안내 확인

### 3. DNS 설정

**A Record (권장)**:

```
Type: A
Name: @
Value: 76.76.21.21
```

**또는 CNAME**:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4. HTTPS 자동 적용

Vercel이 자동으로 SSL 인증서를 발급합니다 (Let's Encrypt).

## 환경별 설정

### Production

- URL: `https://jageboo.com` (또는 Vercel URL)
- 환경 변수: Production values
- 에러 추적: 활성화
- 분석: 활성화

### Preview

- URL: `https://jageboo-git-[branch]-username.vercel.app`
- 환경 변수: Preview values (또는 Production과 동일)
- PR 리뷰용

### Development

- URL: `http://localhost:3000`
- 환경 변수: `.env.local`

## 배포 문제 해결

### 빌드 실패

**증상**: "Build failed" 에러

**해결**:

1. 로컬에서 `pnpm build` 실행 → 에러 확인
2. TypeScript 에러 수정
3. 다시 push

### 환경 변수 누락

**증상**: Supabase 연결 실패, "Invalid API key" 에러

**해결**:

1. Vercel Dashboard → Settings → Environment Variables
2. 필수 환경 변수 추가
3. Redeploy

### 이미지 로딩 실패

**증상**: 아이콘이 표시되지 않음

**해결**:

1. `app/icon.tsx`, `app/apple-icon.tsx` 확인
2. `app/manifest.ts`에서 icon 경로 확인
3. Redeploy

## 모니터링

### Vercel Analytics

무료 플랜에서 기본 분석 제공:

- Page views
- Unique visitors
- Top pages

### 에러 로깅

Vercel Functions 로그에서 에러 확인:

- Vercel Dashboard → Deployments → [최신 배포] → Logs

### 성능 모니터링

Vercel Speed Insights (Pro 플랜):

- Real User Monitoring (RUM)
- Core Web Vitals
- Performance 점수

## 보안 체크리스트

배포 전 확인사항:

- [ ] `.env` 파일이 `.gitignore`에 포함됨
- [ ] API 키가 코드에 하드코딩되지 않음
- [ ] Supabase RLS 정책 활성화됨
- [ ] CORS 설정 확인 (Supabase)
- [ ] 민감한 데이터가 클라이언트에 노출되지 않음

## 롤백

문제가 발생한 경우 이전 버전으로 롤백:

1. Vercel Dashboard → Deployments
2. 이전 성공한 배포 선택
3. "Promote to Production" 클릭

## 참고 자료

- [Vercel 배포 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Supabase 환경 변수](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [PWA 체크리스트](https://web.dev/pwa-checklist/)
