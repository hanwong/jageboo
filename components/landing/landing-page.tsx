"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Clock, BarChart3 } from "lucide-react"

/**
 * 랜딩 페이지 컴포넌트
 * - 로그아웃 상태에서 보여지는 메인 화면
 * - 앱 소개 및 주요 기능 안내
 * - 로그인/회원가입 유도
 */
export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <div className="mb-8">
          <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
            자영업자 장부
          </h1>
          <p className="text-xl text-muted-foreground">
            5초 만에 기록하고, 바로 확인하는 영업이익
          </p>
        </div>

        <div className="mb-12 max-w-md space-y-4">
          <FeatureCard
            icon={<Clock className="h-6 w-6" />}
            title="빠른 기록"
            description="5초 안에 매출과 매입을 간편하게 기록하세요"
          />
          <FeatureCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="실시간 영업이익"
            description="입력 즉시 오늘/이번주/이번달 영업이익을 확인하세요"
          />
          <FeatureCard
            icon={<BarChart3 className="h-6 w-6" />}
            title="반복 거래 자동화"
            description="월세, 구독료 등 반복 거래를 자동으로 관리하세요"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="min-w-[160px]">
            <Link href="/auth/login">
              로그인
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-w-[160px]">
            <Link href="/auth/sign-up">회원가입</Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© 2026 자영업자 장부. All rights reserved.</p>
      </footer>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex gap-4 rounded-lg border bg-card p-4 text-left">
      <div className="flex-shrink-0 text-primary">{icon}</div>
      <div>
        <h3 className="mb-1 font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
