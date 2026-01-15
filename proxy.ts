import { updateSession } from "@/lib/supabase/proxy"
import { type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * 인증이 필요한 경로에만 middleware 적용:
     * - / (홈페이지 - 사용자 확인용)
     * - /protected/* (보호된 페이지)
     * - /settings (설정 페이지)
     * - /api/* (API 라우트)
     *
     * 제외:
     * - /auth/* (로그인/회원가입은 middleware 불필요)
     * - /_next/* (Next.js 내부 파일)
     * - /favicon.ico
     * - /test.html, /simple.html, /instagram-notice.html (정적 파일)
     */
    "/",
    "/protected/:path*",
    "/settings/:path*",
    "/api/:path*",
    "/income/:path*",
    "/expense/:path*",
    "/transaction/:path*",
    "/recurring/:path*",
  ],
}
