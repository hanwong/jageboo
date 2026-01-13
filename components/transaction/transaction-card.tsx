import Link from "next/link"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency, formatDate } from "@/lib/constants/dummy-data"
import type { Transaction } from "@/lib/types"

interface TransactionCardProps {
  transaction: Pick<Transaction, "id" | "type" | "amount" | "date" | "memo">
}

/**
 * 거래 카드 컴포넌트
 * - 매출/매입 구분 표시
 * - 클릭 시 수정 페이지로 이동
 * - 모바일 최적화
 */
export function TransactionCard({ transaction }: TransactionCardProps) {
  const isIncome = transaction.type === "income"
  const Icon = isIncome ? TrendingUp : TrendingDown

  return (
    <Link href={`/transaction/${transaction.id}/edit`}>
      <Card className="transition-shadow hover:shadow-md">
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
                  {formatDate(transaction.date)}
                </span>
              </div>
              {transaction.memo && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {transaction.memo}
                </p>
              )}
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
    </Link>
  )
}
