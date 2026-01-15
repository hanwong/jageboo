import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables")
    throw new Error(
      "Supabase 환경 변수가 설정되지 않았습니다. 관리자에게 문의해주세요."
    )
  }

  try {
    return createBrowserClient(supabaseUrl, supabaseKey)
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    throw new Error("Supabase 클라이언트를 초기화할 수 없습니다.")
  }
}
