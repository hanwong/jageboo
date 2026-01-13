"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type Period = "daily" | "weekly" | "monthly"

interface PeriodTabsProps {
  value: Period
  onValueChange: (period: Period) => void
  className?: string
}

/**
 * 기간 선택 탭 컴포넌트
 * - 오늘/이번주/이번달 전환
 * - 모바일 최적화
 * - 터치 친화적 크기
 */
export function PeriodTabs({
  value,
  onValueChange,
  className,
}: PeriodTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={val => onValueChange(val as Period)}
      className={className}
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="daily" className="text-base">
          오늘
        </TabsTrigger>
        <TabsTrigger value="weekly" className="text-base">
          이번주
        </TabsTrigger>
        <TabsTrigger value="monthly" className="text-base">
          이번달
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
