"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function DebugPage() {
  const [info, setInfo] = useState({
    userAgent: "",
    localStorage: false,
    sessionStorage: false,
    cookies: false,
    supabaseUrl: false,
    supabaseKey: false,
    supabaseClient: false,
    error: null as string | null,
  })

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        // User Agent
        const userAgent = navigator.userAgent

        // Storage checks
        let localStorageAvailable = false
        let sessionStorageAvailable = false
        try {
          localStorage.setItem("test", "test")
          localStorage.removeItem("test")
          localStorageAvailable = true
        } catch (e) {
          // localStorage not available
        }

        try {
          sessionStorage.setItem("test", "test")
          sessionStorage.removeItem("test")
          sessionStorageAvailable = true
        } catch (e) {
          // sessionStorage not available
        }

        // Cookies
        const cookiesEnabled = navigator.cookieEnabled

        // Environment variables
        const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
        const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

        // Supabase client
        let supabaseClientWorks = false
        let errorMessage = null
        try {
          const supabase = createClient()
          supabaseClientWorks = !!supabase
        } catch (e) {
          errorMessage = e instanceof Error ? e.message : String(e)
        }

        setInfo({
          userAgent,
          localStorage: localStorageAvailable,
          sessionStorage: sessionStorageAvailable,
          cookies: cookiesEnabled,
          supabaseUrl: hasSupabaseUrl,
          supabaseKey: hasSupabaseKey,
          supabaseClient: supabaseClientWorks,
          error: errorMessage,
        })
      } catch (e) {
        setInfo(prev => ({
          ...prev,
          error: e instanceof Error ? e.message : String(e),
        }))
      }
    }

    checkEnvironment()
  }, [])

  return (
    <div className="min-h-screen p-4">
      <h1 className="mb-4 text-2xl font-bold">디버그 정보</h1>
      <div className="space-y-2 rounded-lg border p-4">
        <div>
          <strong>User Agent:</strong>
          <pre className="mt-1 overflow-x-auto text-xs">{info.userAgent}</pre>
        </div>
        <div>
          <strong>localStorage:</strong> {info.localStorage ? "✅" : "❌"}
        </div>
        <div>
          <strong>sessionStorage:</strong> {info.sessionStorage ? "✅" : "❌"}
        </div>
        <div>
          <strong>Cookies:</strong> {info.cookies ? "✅" : "❌"}
        </div>
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{" "}
          {info.supabaseUrl ? "✅" : "❌"}
        </div>
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:</strong>{" "}
          {info.supabaseKey ? "✅" : "❌"}
        </div>
        <div>
          <strong>Supabase Client:</strong> {info.supabaseClient ? "✅" : "❌"}
        </div>
        {info.error && (
          <div className="mt-4 rounded-lg border border-red-500 bg-red-50 p-4">
            <strong className="text-red-700">Error:</strong>
            <pre className="mt-1 overflow-x-auto text-xs text-red-700">
              {info.error}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
