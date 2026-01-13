import Link from "next/link"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
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
                  ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={isIncome ? "default" : "secondary"}
                  className={cn(
                    isIncome
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  )}
                >
                  {isIncome ? "매출" : "매입"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(transaction.date), "M월 d일 (EEE)", {
                    locale: ko,
                  })}
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
              isIncome ? "text-green-600" : "text-red-600"
            )}
          >
            {isIncome ? "+" : "-"}
            {transaction.amount.toLocaleString("ko-KR")}원
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
