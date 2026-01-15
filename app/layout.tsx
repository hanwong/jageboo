import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import Script from "next/script"
import "./globals.css"

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "자장부 - 5초 만에 매입매출 기록하고 꿀잠",
  description:
    "1인 자영업자를 위한 초간편 매입/매출 관리 앱. 5초 만에 거래를 기록하고 실시간 영업이익을 확인하세요.",
  keywords: [
    "자장부",
    "자영업자",
    "장부",
    "매입",
    "매출",
    "영업이익",
    "거래 관리",
    "가게 관리",
  ],
  authors: [{ name: "Jageboo" }],
  openGraph: {
    title: "자장부",
    description: "5초 만에 매입매출을 기록하고 영업이익을 확인하세요",
    type: "website",
    locale: "ko_KR",
  },
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <Script
          id="instagram-detector"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // 인스타그램 브라우저 감지 및 안내 표시 (리다이렉트 없이)
              (function() {
                var ua = navigator.userAgent.toLowerCase();
                var isInstagram = ua.indexOf('instagram') > -1;

                if (isInstagram) {
                  // 인스타그램 안내 표시
                  document.addEventListener('DOMContentLoaded', function() {
                    var appContent = document.getElementById('app-content');
                    var instagramNotice = document.getElementById('instagram-notice');

                    if (appContent) appContent.style.display = 'none';
                    if (instagramNotice) instagramNotice.style.display = 'block';
                  });
                }
              })();
            `,
          }}
        />

        {/* 인스타그램 안내 (숨김) */}
        <div id="instagram-notice" style={{ display: "none" }}>
          <div
            style={{
              minHeight: "100vh",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "40px 30px",
                maxWidth: "400px",
                width: "100%",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>
                📱
              </div>
              <h1
                style={{
                  fontSize: "24px",
                  color: "#333",
                  marginBottom: "15px",
                  fontWeight: "700",
                }}
              >
                자장부
              </h1>
              <p
                style={{
                  color: "#666",
                  lineHeight: "1.6",
                  marginBottom: "10px",
                  fontSize: "15px",
                }}
              >
                인스타그램 앱 내 브라우저에서는
                <br />
                일부 기능이 제한됩니다.
              </p>

              <div
                style={{
                  background: "#f8f9fa",
                  borderRadius: "12px",
                  padding: "20px",
                  margin: "25px 0",
                  textAlign: "left",
                }}
              >
                <h2
                  style={{
                    fontSize: "16px",
                    color: "#333",
                    marginBottom: "15px",
                    fontWeight: "600",
                  }}
                >
                  외부 브라우저로 여는 방법
                </h2>
                <div
                  style={{
                    background: "white",
                    borderRadius: "8px",
                    padding: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <strong>1.</strong> 화면 우측 상단의{" "}
                  <strong>••• 메뉴</strong>를 탭하세요
                </div>
                <div
                  style={{
                    background: "white",
                    borderRadius: "8px",
                    padding: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <strong>2.</strong> <strong>"Safari에서 열기"</strong> 또는
                  <br />
                  <strong>"Chrome에서 열기"</strong>를 선택하세요
                </div>
                <div
                  style={{
                    background: "white",
                    borderRadius: "8px",
                    padding: "10px",
                  }}
                >
                  <strong>3.</strong> 외부 브라우저에서 정상적으로 사용하실 수
                  있습니다
                </div>
              </div>

              <p style={{ fontSize: "13px", color: "#999", marginTop: "20px" }}>
                또는 주소를 복사해서
                <br />
                Safari나 Chrome에 직접 붙여넣으세요
              </p>
            </div>
          </div>
        </div>

        {/* 일반 앱 콘텐츠 */}
        <div id="app-content">
          <noscript>
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
                JavaScript가 필요합니다
              </h1>
              <p style={{ color: "#666" }}>
                이 앱을 사용하려면 JavaScript를 활성화해주세요.
              </p>
              <p
                style={{
                  marginTop: "1rem",
                  fontSize: "0.875rem",
                  color: "#999",
                }}
              >
                인스타그램 인앱 브라우저를 사용 중이라면, Safari나 Chrome에서
                열어주세요.
              </p>
            </div>
          </noscript>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </div>
      </body>
    </html>
  )
}
