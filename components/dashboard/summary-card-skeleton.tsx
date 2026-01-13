import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * SummaryCard 로딩 스켈레톤
 */
export function SummaryCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        {/* Icon skeleton */}
        <Skeleton className="h-12 w-12 rounded-full" />

        <div className="flex-1 space-y-2">
          {/* Title skeleton */}
          <Skeleton className="h-4 w-16" />
          {/* Amount skeleton */}
          <Skeleton className="h-6 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}
