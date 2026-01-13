import { TransactionCard } from "./transaction-card"
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
  // 빈 상태
  if (transactions.length === 0) {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">거래 내역이 없습니다</h3>
          <p className="text-sm text-muted-foreground">
            아래 버튼을 눌러 매출 또는 매입을 등록해보세요
          </p>
        </div>
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
