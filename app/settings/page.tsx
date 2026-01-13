"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { RecurringTransactionList } from "@/components/recurring/recurring-transaction-list"
import { dummyRecurringTransactions } from "@/lib/constants/dummy-data"

/**
 * 설정 화면
 * Task 007.5 - 반복 거래 관리 UI 구현 (더미 데이터)
 * Phase 3에서 실제 데이터 연동 예정
 */
export default function SettingsPage() {
  const [recurringTransactions, setRecurringTransactions] = useState(
    dummyRecurringTransactions
  )

  const handleToggle = (id: string, isActive: boolean) => {
    // Phase 2: 로컬 상태만 업데이트 (Phase 3에서 실제 Server Action 연동)
    setRecurringTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, is_active: isActive } : t))
    )
  }

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
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>사용자 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                <p>프로필 정보</p>
                <p>로그아웃</p>
                <p className="mt-2">(Phase 3에서 구현 예정)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>반복 거래 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <RecurringTransactionList
                transactions={recurringTransactions}
                onToggle={handleToggle}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNav />
    </AppLayout>
  )
}
