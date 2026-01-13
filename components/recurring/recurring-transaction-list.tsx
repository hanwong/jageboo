"use client"

import { useRouter } from "next/navigation"
import { RecurringTransactionCard } from "./recurring-transaction-card"
import { EmptyState } from "@/components/common/empty-state"
import type { RecurringTransaction } from "@/lib/types"
import { RefreshCw } from "lucide-react"

interface RecurringTransactionListProps {
  transactions: RecurringTransaction[]
  onClick?: (id: string) => void
}

/**
 * 반복 거래 목록 컴포넌트
 * - 반복 거래 카드 클릭 시 수정 페이지로 이동
 */
export function RecurringTransactionList({
  transactions,
  onClick,
}: RecurringTransactionListProps) {
  const router = useRouter()

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={RefreshCw}
        title="등록된 반복 거래가 없습니다"
        description="반복되는 수입이나 지출을 등록하세요"
        action={{
          label: "거래 입력하러 가기",
          onClick: () => router.push("/"),
        }}
      />
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map(transaction => (
        <RecurringTransactionCard
          key={transaction.id}
          transaction={transaction}
          onClick={onClick}
        />
      ))}
    </div>
  )
}
