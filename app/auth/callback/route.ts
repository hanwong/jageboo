import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Google OAuth 로그인 콜백 핸들러
 * Supabase가 Google OAuth 인증 후 리디렉션하는 URL
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()

    try {
      // OAuth code를 세션으로 교환
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("OAuth callback error:", error)
        // 에러 발생 시 로그인 페이지로 리디렉션하고 에러 메시지 전달
        return NextResponse.redirect(
          `${origin}/auth/login?error=${encodeURIComponent(error.message)}`
        )
      }

      // 인증 성공 시 홈 페이지로 리디렉션
      return NextResponse.redirect(`${origin}/`)
    } catch (error) {
      console.error("Unexpected error during OAuth callback:", error)
      return NextResponse.redirect(
        `${origin}/auth/login?error=An unexpected error occurred`
      )
    }
  }

  // code가 없는 경우 로그인 페이지로 리디렉션
  return NextResponse.redirect(
    `${origin}/auth/login?error=No authorization code provided`
  )
}
