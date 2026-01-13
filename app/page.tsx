import { Suspense } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { BottomNav } from "@/components/layout/bottom-nav"
import { DashboardClient } from "@/components/dashboard/dashboard-client"

/**
 * 홈 화면 (대시보드)
 * Task 004 - 대시보드 UI 구현 (더미 데이터)
 * Phase 3에서 실제 데이터 연동 예정
 */
export default function Home() {
  return (
    <AppLayout>
      <div className="min-h-screen px-4 pb-24 pt-6">
        <Suspense fallback={<div>Loading...</div>}>
          <DashboardClient />
        </Suspense>
      </div>
      <BottomNav />
    </AppLayout>
  )
}
