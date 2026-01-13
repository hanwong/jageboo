import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/constants/dummy-data"

interface ProfitDisplayProps {
  amount: number
  className?: string
}

/**
 * 영업이익 대형 표시 컴포넌트
 * - 큰 글씨로 영업이익 표시
 * - 양수는 초록색, 음수는 빨간색
 */
export function ProfitDisplay({ amount, className }: ProfitDisplayProps) {
  const isPositive = amount >= 0
  const sign = isPositive ? "+" : ""

  return (
    <div className={cn("text-center", className)}>
      <p className="mb-2 text-sm text-muted-foreground">영업이익</p>
      <div
        className={cn(
          "text-5xl font-bold tabular-nums",
          isPositive ? "text-profit-positive" : "text-expense"
        )}
      >
        {sign}
        {formatCurrency(amount)}
        <span className="ml-1 text-3xl">원</span>
      </div>
    </div>
  )
}
