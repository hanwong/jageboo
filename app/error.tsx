"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 에러를 콘솔에 로그
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h2 className="text-2xl font-bold">문제가 발생했습니다</h2>
        <p className="text-muted-foreground">
          {error.message || "알 수 없는 오류가 발생했습니다"}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
        )}
        <div className="flex flex-col gap-2">
          <Button onClick={() => reset()}>다시 시도</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            홈으로 이동
          </Button>
        </div>
      </div>
    </div>
  )
}
