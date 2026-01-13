"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/constants/dummy-data"
import type { RecurringTransaction } from "@/lib/types"

interface RecurringTransactionCardProps {
  transaction: RecurringTransaction
  onToggle?: (id: string, isActive: boolean) => void
}

/**
 * 반복 거래 카드 컴포넌트
 * - 금액, 메모, 주기 표시
 * - 활성화/비활성화 토글
 * - Phase 2: UI만 구현 (Phase 3에서 실제 토글 연동)
 */
export function RecurringTransactionCard({
  transaction,
  onToggle,
}: RecurringTransactionCardProps) {
  const isIncome = transaction.type === "income"
  const Icon = isIncome ? TrendingUp : TrendingDown

  const frequencyText = transaction.frequency === "weekly" ? "매주" : "매월"

  const handleToggle = () => {
    if (onToggle) {
      onToggle(transaction.id, !transaction.is_active)
    }
  }

  return (
    <Card
      className={cn(
        "transition-opacity",
        !transaction.is_active && "opacity-50"
      )}
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
              <span className="text-sm text-muted-foreground">
                {frequencyText}
              </span>
            </div>
            {transaction.memo && (
              <p className="mt-1 text-sm text-muted-foreground">
                {transaction.memo}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "text-lg font-semibold tabular-nums",
              isIncome ? "text-income" : "text-expense"
            )}
          >
            {isIncome ? "+" : "-"}
            {formatCurrency(transaction.amount)}원
          </div>
          <button
            type="button"
            onClick={handleToggle}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              transaction.is_active ? "bg-income" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                transaction.is_active ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
