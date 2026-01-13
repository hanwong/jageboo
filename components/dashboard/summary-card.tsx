import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/constants/dummy-data"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface SummaryCardProps {
  type: "income" | "expense" | "profit"
  amount: number
  label: string
  className?: string
}

/**
 * 요약 카드 컴포넌트
 * - 매출/매입/영업이익 표시
 * - 색상 구분
 * - 모바일 최적화
 */
export function SummaryCard({
  type,
  amount,
  label,
  className,
}: SummaryCardProps) {
  const config = {
    income: {
      icon: TrendingUp,
      bgColor: "bg-income-muted",
      textColor: "text-income",
    },
    expense: {
      icon: TrendingDown,
      bgColor: "bg-expense-muted",
      textColor: "text-expense",
    },
    profit: {
      icon: DollarSign,
      bgColor: amount >= 0 ? "bg-profit-positive-muted" : "bg-expense-muted",
      textColor: amount >= 0 ? "text-profit-positive" : "text-expense",
    },
  }

  const { icon: Icon, bgColor, textColor } = config[type]

  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <div className={cn("rounded-full p-2", bgColor)}>
          <Icon className={cn("h-4 w-4", textColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "text-right text-2xl font-bold tabular-nums",
            textColor
          )}
        >
          {type === "profit" && amount > 0 && "+"}
          {formatCurrency(amount)}원
        </div>
      </CardContent>
    </Card>
  )
}
