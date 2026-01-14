"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

/**
 * Google OAuth 로그인 Server Action
 * 사용자를 Google OAuth 인증 페이지로 리디렉션
 */
export async function signInWithGoogle() {
  const supabase = await createClient()

  // Vercel 배포 환경에서는 VERCEL_URL 사용, 로컬에서는 localhost 사용
  const origin = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"
  const redirectTo = `${origin}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error) {
    console.error("Google OAuth sign-in error:", error)
    throw error
  }

  // Google OAuth URL로 리디렉션
  if (data.url) {
    redirect(data.url)
  }
}

/**
 * 로그아웃 Server Action
 */
export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Sign out error:", error)
    throw error
  }

  redirect("/")
}

/**
 * 현재 로그인한 사용자 정보 가져오기
 */
export async function getUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error("Get user error:", error)
    return null
  }

  return user
}
