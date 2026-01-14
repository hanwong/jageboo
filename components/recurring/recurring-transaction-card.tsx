"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/constants/dummy-data"
import type { RecurringTransaction } from "@/lib/types"

interface RecurringTransactionCardProps {
  transaction: RecurringTransaction
  onClick?: (id: string) => void
}

/**
 * 반복 거래 카드 컴포넌트
 * - 금액, 메모, 주기, 기간 표시
 * - 클릭 시 수정 페이지로 이동
 */
export function RecurringTransactionCard({
  transaction,
  onClick,
}: RecurringTransactionCardProps) {
  const isIncome = transaction.type === "income"
  const Icon = isIncome ? TrendingUp : TrendingDown

  const frequencyText = transaction.frequency === "weekly" ? "매주" : "매월"

  // 기간 포맷팅
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const periodText = () => {
    const startDate = new Date(transaction.start_date)
    const startDateStr = formatDate(startDate)

    if (transaction.end_date) {
      const endDate = new Date(transaction.end_date)
      const endDateStr = formatDate(endDate)
      return `${startDateStr} ~ ${endDateStr}`
    }

    return `${startDateStr}부터`
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick(transaction.id)
    }
  }

  return (
    <Card
      className="cursor-pointer py-2 transition-all hover:shadow-md"
      onClick={handleCardClick}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              isIncome
                ? "bg-income-muted text-income"
                : "bg-expense-muted text-expense"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={isIncome ? "income" : "expense"}>
                {isIncome ? "매출" : "매입"}
              </Badge>
              <Badge variant="outline">{frequencyText}</Badge>
            </div>
            {transaction.memo && (
              <p className="mt-1 text-sm text-muted-foreground">
                {transaction.memo}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{periodText()}</p>
          </div>
        </div>
        <div
          className={cn(
            "text-lg font-semibold tabular-nums",
            isIncome ? "text-income" : "text-expense"
          )}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(transaction.amount)}원
        </div>
      </CardContent>
    </Card>
  )
}
