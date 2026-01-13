"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Period } from "@/lib/types/transaction"

interface PeriodTabsProps {
  value: Period
  onValueChange: (period: Period) => void
  className?: string
}

/**
 * 기간 선택 탭 컴포넌트
 * - 일/주/월/년 전환
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
      <TabsList className="w-full grid grid-cols-4">
        <TabsTrigger value="daily">일</TabsTrigger>
        <TabsTrigger value="weekly">주</TabsTrigger>
        <TabsTrigger value="monthly">월</TabsTrigger>
        <TabsTrigger value="yearly">년</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
