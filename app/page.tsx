import { Suspense } from "react"
import { connection } from "next/server"
import { AppLayout } from "@/components/layout/app-layout"
import { BottomNav } from "@/components/layout/bottom-nav"
import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { getTransactionsByPeriod } from "@/lib/queries/transactions"
import { getSummaryByPeriod } from "@/lib/queries/summaries"

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

  return (
    <DashboardClient
      initialTransactions={transactions}
      initialSummary={summary}
    />
  )
}

export default function Home() {
  return (
    <AppLayout>
      <div className="min-h-screen px-4 pb-24 pt-6">
        <Suspense
          fallback={
            <div className="py-8 text-center text-muted-foreground">
              로딩 중...
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
