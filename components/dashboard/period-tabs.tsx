"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Period } from "@/lib/constants/dummy-data"

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
      <TabsList className="w-full">
        <TabsTrigger value="today">오늘</TabsTrigger>
        <TabsTrigger value="week">이번주</TabsTrigger>
        <TabsTrigger value="month">이번달</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
