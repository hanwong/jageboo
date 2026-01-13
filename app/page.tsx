import { Suspense } from "react"
import { connection } from "next/server"
import { AppLayout } from "@/components/layout/app-layout"
import { BottomNav } from "@/components/layout/bottom-nav"
import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { ProfitDisplaySkeleton } from "@/components/dashboard/profit-display-skeleton"
import { SummaryCardSkeleton } from "@/components/dashboard/summary-card-skeleton"
import { TransactionListSkeleton } from "@/components/transaction/transaction-card-skeleton"
import { getTransactionsByPeriod } from "@/lib/queries/transactions"
import { getSummaryByPeriod } from "@/lib/queries/summaries"
import { getAllRecurringTransactions } from "@/lib/queries/recurring-transactions"

/**
 * 홈 화면 (대시보드)
 * Task 004 - 대시보드 UI 구현
 * Phase 3 - 실제 데이터베이스 연동 완료
 */

async function DashboardContent() {
  // Dynamic rendering을 위해 connection() 호출
  await connection()

  // 오늘의 거래 내역 및 요약 데이터 가져오기
  const transactions = await getTransactionsByPeriod("daily", new Date())
  const summary = await getSummaryByPeriod("daily", new Date())
  const recurringTransactions = await getAllRecurringTransactions()

  return (
    <DashboardClient
      initialTransactions={transactions}
      initialSummary={summary}
      initialRecurringTransactions={recurringTransactions}
    />
  )
}

export default function Home() {
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
