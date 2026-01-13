import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
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
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
      textColor: "text-green-600 dark:text-green-400",
    },
    expense: {
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900",
      textColor: "text-red-600 dark:text-red-400",
    },
    profit: {
      icon: DollarSign,
      color: amount >= 0 ? "text-blue-600" : "text-red-600",
      bgColor:
        amount >= 0
          ? "bg-blue-100 dark:bg-blue-900"
          : "bg-red-100 dark:bg-red-900",
      textColor:
        amount >= 0
          ? "text-blue-600 dark:text-blue-400"
          : "text-red-600 dark:text-red-400",
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
        <div className={cn("text-2xl font-bold tabular-nums", textColor)}>
          {type === "profit" && amount > 0 && "+"}
          {amount.toLocaleString("ko-KR")}원
        </div>
      </CardContent>
    </Card>
  )
}
