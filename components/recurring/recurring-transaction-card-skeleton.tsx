import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * RecurringTransactionCard 로딩 스켈레톤
 */
export function RecurringTransactionCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        {/* Icon circle skeleton */}
        <Skeleton className="h-10 w-10 rounded-full" />

        <div className="flex-1 space-y-2">
          {/* Badge skeleton */}
          <Skeleton className="h-5 w-12" />
          {/* Memo skeleton */}
          <Skeleton className="h-4 w-32" />
          {/* Frequency info skeleton */}
          <Skeleton className="h-3 w-40" />
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Amount skeleton */}
          <Skeleton className="h-6 w-20" />
          {/* Toggle skeleton */}
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * RecurringTransactionList 로딩 스켈레톤 (여러 카드)
 */
export function RecurringTransactionListSkeleton({
  count = 3,
}: {
  count?: number
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <RecurringTransactionCardSkeleton key={index} />
      ))}
    </div>
  )
}
