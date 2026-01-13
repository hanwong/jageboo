import { Suspense } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SettingsClient } from "@/components/settings/settings-client"
import { getAllRecurringTransactions } from "@/lib/queries/recurring-transactions"

/**
 * 설정 화면
 * Task 007.5 - 반복 거래 관리 UI 구현
 * Phase 3 - 실제 데이터베이스 연동 완료
 */

async function SettingsContent() {
  // 반복 거래 데이터 가져오기
  const recurringTransactions = await getAllRecurringTransactions()

  return <SettingsClient initialRecurringTransactions={recurringTransactions} />
}

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="min-h-screen px-6 pb-24 pt-6">
        {/* 헤더 */}
        <div className="mb-6 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">설정</h1>
        </div>

        {/* 설정 섹션 */}
        <Suspense
          fallback={
            <div className="py-8 text-center text-muted-foreground">
              로딩 중...
            </div>
          }
        >
          <SettingsContent />
        </Suspense>
      </div>
      <BottomNav />
    </AppLayout>
  )
}
