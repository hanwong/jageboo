# Google OAuth 로그인 설정 가이드

이 문서는 Jageboo 앱에서 Google OAuth 로그인을 설정하는 방법을 설명합니다.

## 목차
1. [Google Cloud Console 설정](#1-google-cloud-console-설정)
2. [Supabase 프로젝트 설정](#2-supabase-프로젝트-설정)
3. [환경 변수 설정](#3-환경-변수-설정)
4. [테스트](#4-테스트)

---

## 1. Google Cloud Console 설정

### 1.1 Google Cloud 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속합니다
2. 새 프로젝트를 생성하거나 기존 프로젝트를 선택합니다

### 1.2 OAuth 동의 화면 구성
1. 좌측 메뉴에서 **APIs & Services** > **OAuth consent screen** 선택
2. User Type: **External** 선택 후 **Create** 클릭
3. 앱 정보 입력:
   - **App name**: Jageboo (또는 원하는 앱 이름)
   - **User support email**: 본인 이메일
   - **Developer contact information**: 본인 이메일
4. **Save and Continue** 클릭
5. Scopes 설정: 기본값 유지하고 **Save and Continue**
6. Test users 추가 (선택사항)
7. **Save and Continue**로 완료

### 1.3 OAuth 2.0 클라이언트 ID 생성
1. 좌측 메뉴에서 **APIs & Services** > **Credentials** 선택
2. **+ CREATE CREDENTIALS** > **OAuth client ID** 클릭
3. Application type: **Web application** 선택
4. Name: **Jageboo Web Client** (또는 원하는 이름)
5. **Authorized JavaScript origins** 추가:
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```
6. **Authorized redirect URIs** 추가:
   ```
   http://localhost:3000/auth/callback
   https://your-production-domain.com/auth/callback
   https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   > 중요: `YOUR_SUPABASE_PROJECT_REF`를 실제 Supabase 프로젝트 참조로 교체하세요
7. **Create** 클릭
8. **Client ID**와 **Client Secret**을 복사해 안전하게 보관합니다

---

## 2. Supabase 프로젝트 설정

### 2.1 Google Provider 활성화
1. [Supabase Dashboard](https://app.supabase.com/)에 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **Authentication** > **Providers** 선택
4. **Google** 찾아서 클릭
5. **Enable Sign in with Google** 토글 활성화
6. Google Cloud Console에서 복사한 정보 입력:
   - **Client ID**: Google OAuth 클라이언트 ID
   - **Client Secret**: Google OAuth 클라이언트 시크릿
7. **Authorized Client IDs** (선택사항): 특정 클라이언트 ID만 허용하려면 입력
8. **Save** 클릭

### 2.2 Redirect URLs 확인
1. Supabase Dashboard에서 **Authentication** > **URL Configuration** 선택
2. **Site URL** 확인:
   - 개발: `http://localhost:3000`
   - 프로덕션: `https://your-production-domain.com`
3. **Redirect URLs** 확인 및 추가:
   ```
   http://localhost:3000/auth/callback
   https://your-production-domain.com/auth/callback
   ```

---

## 3. 환경 변수 설정

### 3.1 .env.local 파일 업데이트
프로젝트 루트의 `.env.local` 파일에 다음 환경 변수를 추가합니다:

```bash
# Supabase 설정 (이미 존재)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_SUPABASE_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# 사이트 URL (Google OAuth 콜백에 필요)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3.2 프로덕션 환경 변수
프로덕션 배포 시 다음 환경 변수를 설정합니다:

```bash
# Vercel/배포 플랫폼 환경 변수
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_SUPABASE_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

---

## 4. 테스트

### 4.1 로컬 개발 서버 실행
```bash
pnpm dev
```

### 4.2 Google 로그인 테스트
1. 브라우저에서 `http://localhost:3000/auth/login` 접속
2. **Google로 계속하기** 버튼 클릭
3. Google 계정 선택 및 권한 승인
4. 로그인 성공 시 홈 페이지(`/`)로 리디렉션 확인

### 4.3 세션 확인
- 로그인 후 브라우저 개발자 도구에서 쿠키 확인
- Supabase 세션 쿠키가 생성되었는지 확인

### 4.4 문제 해결

#### 에러: "redirect_uri_mismatch"
- Google Cloud Console의 **Authorized redirect URIs**에 올바른 URL이 추가되었는지 확인
- Supabase callback URL이 포함되어 있는지 확인

#### 에러: "Access blocked: This app's request is invalid"
- Google OAuth 동의 화면이 올바르게 구성되었는지 확인
- 앱이 Publishing status가 "Testing"인 경우 Test users에 계정이 추가되었는지 확인

#### 로그인 후 리디렉션 실패
- `.env.local`의 `NEXT_PUBLIC_SITE_URL`이 올바른지 확인
- 브라우저 콘솔에서 에러 메시지 확인

---

## 5. 구현된 파일 목록

### 5.1 백엔드
- `/app/auth/callback/route.ts` - OAuth 콜백 핸들러
- `/app/actions/auth.ts` - 인증 관련 Server Actions
- `/middleware.ts` - 세션 관리 및 라우트 보호

### 5.2 프론트엔드
- `/components/login-form.tsx` - Google 로그인 버튼 포함 로그인 폼

### 5.3 Supabase 클라이언트
- `/lib/supabase/server.ts` - 서버 사이드 Supabase 클라이언트
- `/lib/supabase/client.ts` - 클라이언트 사이드 Supabase 클라이언트

---

## 6. 보안 고려사항

### 6.1 환경 변수 관리
- `.env.local` 파일을 절대 Git에 커밋하지 마세요
- `.gitignore`에 `.env*.local`이 포함되어 있는지 확인하세요

### 6.2 HTTPS 사용
- 프로덕션 환경에서는 반드시 HTTPS를 사용하세요
- Redirect URIs도 HTTPS를 사용해야 합니다

### 6.3 Row Level Security (RLS)
- Supabase 데이터베이스에 RLS 정책을 설정하여 사용자 데이터 보호
- 사용자는 자신의 데이터만 읽고 쓸 수 있도록 제한

---

## 7. 추가 리소스

- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

---

## 문의
구현 중 문제가 발생하면 Supabase Dashboard의 로그를 확인하거나 Google Cloud Console의 OAuth 설정을 재확인하세요.
