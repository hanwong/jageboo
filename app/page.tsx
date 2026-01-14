import { Suspense } from "react"
import { connection } from "next/server"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { BottomNav } from "@/components/layout/bottom-nav"
import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { LandingPage } from "@/components/landing/landing-page"
import { ProfitDisplaySkeleton } from "@/components/dashboard/profit-display-skeleton"
import { SummaryCardSkeleton } from "@/components/dashboard/summary-card-skeleton"
import { TransactionListSkeleton } from "@/components/transaction/transaction-card-skeleton"
import { getTransactionsByPeriod } from "@/lib/queries/transactions"
import { getSummaryByPeriod } from "@/lib/queries/summaries"
import { getAllRecurringTransactions } from "@/lib/queries/recurring-transactions"
import { createClient } from "@/lib/supabase/server"

/**
 * 홈 화면 (대시보드)
 * Task 004 - 대시보드 UI 구현
 * Phase 3 - 실제 데이터베이스 연동 완료
 */

async function DashboardContent() {
  // Dynamic rendering을 위해 connection() 호출
  await connection()

  // 오늘 날짜를 UTC 자정으로 정규화
  const now = new Date()
  const today = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  )

  // 오늘의 거래 내역 및 요약 데이터 가져오기
  const transactions = await getTransactionsByPeriod("daily", today)
  const summary = await getSummaryByPeriod("daily", today)
  const recurringTransactions = await getAllRecurringTransactions()

  return (
    <DashboardClient
      initialTransactions={transactions}
      initialSummary={summary}
      initialRecurringTransactions={recurringTransactions}
    />
  )
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  // OAuth callback code가 있으면 /auth/callback으로 리다이렉트
  if (params.code) {
    redirect(`/auth/callback?code=${params.code}`)
  }

  // 사용자 인증 상태 확인
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 로그인되지 않은 경우 랜딩 페이지 표시
  if (!user) {
    return <LandingPage />
  }

  // 로그인된 사용자는 대시보드 표시
  return (
    <AppLayout>
      <div className="min-h-screen px-4 pb-24 pt-6">
        <Suspense
          fallback={
            <div className="space-y-6">
              {/* 기간 선택 탭 영역 */}
              <div className="h-10" />

              {/* 영업이익 표시 */}
              <ProfitDisplaySkeleton />

              {/* 요약 카드 3개 */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryCardSkeleton />
                <SummaryCardSkeleton />
                <SummaryCardSkeleton />
              </div>

              {/* 거래 목록 */}
              <TransactionListSkeleton count={5} />
            </div>
          }
        >
          <DashboardContent />
        </Suspense>
      </div>
      <BottomNav />
    </AppLayout>
  )
}
