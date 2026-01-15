import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { hasEnvVars } from "../utils"

export async function updateSession(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || ""
  const isInstagram = userAgent.toLowerCase().includes("instagram")

  // 정적 HTML 파일은 무조건 즉시 통과 (쿠키 설정 없이)
  if (request.nextUrl.pathname.endsWith('.html')) {
    return NextResponse.next({
      request,
    })
  }

  // Instagram 브라우저는 완전히 정적인 HTML 응답 (React 없이)
  if (isInstagram) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <title>자장부 - 외부 브라우저로 열어주세요</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px 30px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    .icon { font-size: 64px; margin-bottom: 20px; }
    h1 { font-size: 24px; color: #333; margin-bottom: 15px; font-weight: 700; }
    p { color: #666; line-height: 1.6; margin-bottom: 10px; font-size: 15px; }
    .steps {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
      text-align: left;
    }
    .steps h2 { font-size: 16px; color: #333; margin-bottom: 15px; font-weight: 600; }
    .step {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
      padding: 10px;
      background: white;
      border-radius: 8px;
    }
    .step:last-child { margin-bottom: 0; }
    .step-number {
      background: #667eea;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      flex-shrink: 0;
      margin-right: 12px;
    }
    .step-text { color: #444; font-size: 14px; line-height: 1.5; }
    .note { font-size: 13px; color: #999; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📱</div>
    <h1>자장부</h1>
    <p>인스타그램 앱 내 브라우저에서는<br>일부 기능이 제한됩니다.</p>
    <div class="steps">
      <h2>외부 브라우저로 여는 방법</h2>
      <div class="step">
        <div class="step-number">1</div>
        <div class="step-text">화면 우측 상단의 <strong>••• 메뉴</strong>를 탭하세요</div>
      </div>
      <div class="step">
        <div class="step-number">2</div>
        <div class="step-text"><strong>"Safari에서 열기"</strong> 또는<br><strong>"Chrome에서 열기"</strong>를 선택하세요</div>
      </div>
      <div class="step">
        <div class="step-number">3</div>
        <div class="step-text">외부 브라우저에서 정상적으로 사용하실 수 있습니다</div>
      </div>
    </div>
    <p class="note">또는 주소를 복사해서<br>Safari나 Chrome에 직접 붙여넣으세요</p>
  </div>
</body>
</html>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    )
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  // If the env vars are not set, skip proxy check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  // 보호된 라우트 접근 제어
  if (!user && request.nextUrl.pathname.startsWith("/protected")) {
    // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // 이미 로그인한 사용자가 로그인 페이지 접근 시 홈으로 리디렉션
  if (user && request.nextUrl.pathname.startsWith("/auth/login")) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // 기타 인증되지 않은 라우트 처리
  // 공개 페이지: /, /auth, /debug
  const isPublicPage =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/debug")

  if (!user && !isPublicPage) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
