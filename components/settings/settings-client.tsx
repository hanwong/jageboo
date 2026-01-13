"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecurringTransactionList } from "@/components/recurring/recurring-transaction-list"
import { toggleRecurringTransactionAction } from "@/app/actions/recurring-transactions"
import type { RecurringTransaction } from "@/lib/types/database"

interface SettingsClientProps {
  initialRecurringTransactions: RecurringTransaction[]
}

/**
 * 설정 클라이언트 컴포넌트
 * - 반복 거래 토글 상태 관리
 */
export function SettingsClient({
  initialRecurringTransactions,
}: SettingsClientProps) {
  const [recurringTransactions, setRecurringTransactions] = useState(
    initialRecurringTransactions
  )

  const handleToggle = async (id: string, isActive: boolean) => {
    // 낙관적 UI 업데이트
    setRecurringTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, is_active: isActive } : t))
    )

    // Server Action 호출
    const result = await toggleRecurringTransactionAction(id, isActive)

    if (!result.success) {
      // 실패 시 원래 상태로 복구
      setRecurringTransactions(prev =>
        prev.map(t => (t.id === id ? { ...t, is_active: !isActive } : t))
      )
      console.error("Toggle failed:", result.error)
      alert(result.error)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>사용자 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">
            <p>프로필 정보</p>
            <p>로그아웃</p>
            <p className="mt-2">(Phase 4에서 구현 예정)</p>
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
  )
}
