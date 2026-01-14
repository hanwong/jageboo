import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
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
  // PWA 설정 (manifest.ts가 자동으로 처리함)
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "자장부",
  },
  formatDetection: {
    telephone: false,
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
