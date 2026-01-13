"use client"

import { useRouter } from "next/navigation"
import { TransactionCard } from "./transaction-card"
import { EmptyState } from "@/components/common/empty-state"
import type { Transaction } from "@/lib/types"
import { FileText } from "lucide-react"

interface TransactionListProps {
  transactions: Transaction[]
  className?: string
}

/**
 * 거래 목록 컴포넌트
 * - 거래 카드 리스트
 * - 최신순 정렬
 * - 빈 상태(Empty State) UI
 */
export function TransactionList({
  transactions,
  className,
}: TransactionListProps) {
  const router = useRouter()

  // 빈 상태
  if (transactions.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          icon={FileText}
          title="거래 내역이 없습니다"
          description="기록을 남기려면 매출 또는 매입을 입력하세요"
          action={{
            label: "매출 입력",
            onClick: () => router.push("/income/new"),
          }}
          secondaryAction={{
            label: "매입 입력",
            onClick: () => router.push("/expense/new"),
          }}
        />
      </div>
    )
  }

  // 최신순 정렬
  const sortedTransactions = [...transactions].sort((a, b) => {
    return b.date.getTime() - a.date.getTime()
  })

  return (
    <div className={className}>
      <h2 className="mb-4 text-lg font-semibold">거래 내역</h2>
      <div className="flex flex-col gap-2">
        {sortedTransactions.map(transaction => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  )
}
