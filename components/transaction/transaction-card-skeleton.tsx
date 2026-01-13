import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * TransactionCard 로딩 스켈레톤
 */
export function TransactionCardSkeleton() {
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
          {/* Date skeleton */}
          <Skeleton className="h-3 w-24" />
        </div>

        {/* Amount skeleton */}
        <Skeleton className="h-6 w-20" />
      </CardContent>
    </Card>
  )
}

/**
 * TransactionList 로딩 스켈레톤 (여러 카드)
 */
export function TransactionListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-24" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <TransactionCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
