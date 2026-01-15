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
              // 인스타그램 브라우저 감지 및 즉시 리다이렉트
              (function() {
                var ua = navigator.userAgent.toLowerCase();
                if (ua.indexOf('instagram') > -1 && window.location.pathname !== '/instagram-notice.html') {
                  window.location.replace('/instagram-notice.html');
                }
              })();
            `,
          }}
        />
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
            <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#999" }}>
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
      </body>
    </html>
  )
}
