import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * ProfitDisplay 로딩 스켈레톤
 */
export function ProfitDisplaySkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        {/* Label skeleton */}
        <Skeleton className="mx-auto h-5 w-20" />

        {/* Amount skeleton */}
        <Skeleton className="mx-auto h-14 w-48" />

        {/* Percentage skeleton */}
        <Skeleton className="mx-auto h-4 w-32" />
      </CardContent>
    </Card>
  )
}
