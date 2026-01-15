"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <html lang="ko">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              maxWidth: "28rem",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
              문제가 발생했습니다
            </h2>
            <p style={{ marginBottom: "1rem", color: "#666" }}>
              {error.message || "알 수 없는 오류가 발생했습니다"}
            </p>
            {error.digest && (
              <p style={{ fontSize: "0.75rem", color: "#999", marginBottom: "1rem" }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={() => reset()}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#000",
                color: "#fff",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                marginRight: "0.5rem",
              }}
            >
              다시 시도
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#fff",
                color: "#000",
                border: "1px solid #ddd",
                borderRadius: "0.375rem",
                cursor: "pointer",
              }}
            >
              홈으로 이동
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
