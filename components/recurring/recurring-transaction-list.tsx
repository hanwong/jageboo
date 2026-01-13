"use client"

import { RecurringTransactionCard } from "./recurring-transaction-card"
import type { RecurringTransaction } from "@/lib/types"

interface RecurringTransactionListProps {
  transactions: RecurringTransaction[]
  onToggle?: (id: string, isActive: boolean) => void
}

/**
 * 반복 거래 목록 컴포넌트
 * - Phase 2: UI만 구현 (Phase 3에서 실제 데이터 연동)
 */
export function RecurringTransactionList({
  transactions,
  onToggle,
}: RecurringTransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">
          등록된 반복 거래가 없습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map(transaction => (
        <RecurringTransactionCard
          key={transaction.id}
          transaction={transaction}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}
