"use client"

import { useEffect, useRef, useMemo } from "react"
import { format, addWeeks, addMonths, startOfWeek, addDays } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Period } from "@/lib/types/transaction"

interface PeriodScrollerProps {
  periodType: Exclude<Period, "daily">
  currentOffset: number
  onOffsetChange: (offset: number) => void
  className?: string
}

interface PeriodItem {
  offset: number
  label: string
  isCurrent: boolean
}

/**
 * 기간 스크롤 선택 컴포넌트
 * - 주/월/년 기간을 과거로 탐색 (미래 기간 없음)
 * - 현재 기간을 왼쪽에 배치
 * - 오른쪽으로 스크롤하여 과거 기간 탐색
 * - 터치 친화적 수평 스크롤
 */
export function PeriodScroller({
  periodType,
  currentOffset,
  onOffsetChange,
  className,
}: PeriodScrollerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const selectedItemRef = useRef<HTMLButtonElement>(null)

  // Generate period items based on type (current to past only)
  const periods = useMemo((): PeriodItem[] => {
    const now = new Date()
    const items: PeriodItem[] = []

    if (periodType === "weekly") {
      // Generate weeks: 0 to -104 (current + 2 years past)
      for (let offset = 0; offset >= -104; offset--) {
        const weekStart = startOfWeek(addWeeks(now, offset), {
          weekStartsOn: 1,
        })
        items.push({
          offset,
          label: formatWeekLabel(weekStart, offset),
          isCurrent: offset === 0,
        })
      }
    } else if (periodType === "monthly") {
      // Generate months: 0 to -36 (current + 3 years past)
      for (let offset = 0; offset >= -36; offset--) {
        const monthDate = addMonths(now, offset)
        items.push({
          offset,
          label: formatMonthLabel(monthDate, offset),
          isCurrent: offset === 0,
        })
      }
    } else if (periodType === "yearly") {
      // Generate years: 0 to -10 (current + 10 years past)
      const currentYear = now.getFullYear()
      for (let offset = 0; offset >= -10; offset--) {
        const year = currentYear + offset
        items.push({
          offset,
          label: formatYearLabel(year, offset),
          isCurrent: offset === 0,
        })
      }
    }

    return items
  }, [periodType])

  // Auto-scroll to selected item on mount and when selection changes
  useEffect(() => {
    if (selectedItemRef.current && scrollContainerRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start", // Position at the left (start of scroll)
      })
    }
  }, [currentOffset, periodType])

  return (
    <div className={cn("py-3", className)}>
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {periods.map(period => {
          const isSelected = period.offset === currentOffset

          return (
            <button
              key={period.offset}
              ref={isSelected ? selectedItemRef : null}
              onClick={() => onOffsetChange(period.offset)}
              className={cn(
                "flex-shrink-0 rounded-lg px-4 py-2",
                "whitespace-nowrap text-sm font-medium",
                "transition-all duration-200",
                "snap-center",
                "flex min-h-[44px] items-center justify-center",
                isSelected
                  ? "scale-105 bg-primary text-primary-foreground shadow-md"
                  : period.isCurrent
                    ? "border-2 border-primary bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {period.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Format week label
 * - Current week: "이번주"
 * - Last week: "지난주"
 * - Other weeks: "MM월 DD일 - MM월 DD일"
 */
function formatWeekLabel(weekStart: Date, offset: number): string {
  if (offset === 0) return "이번주"
  if (offset === -1) return "지난주"

  const weekEnd = addDays(weekStart, 6)
  const startFormatted = format(weekStart, "M월 d일", { locale: ko })
  const endFormatted = format(weekEnd, "M월 d일", { locale: ko })

  return `${startFormatted} - ${endFormatted}`
}

/**
 * Format month label
 * - Current month: "이번달"
 * - Last month: "지난달"
 * - Other months: "YYYY년 M월"
 */
function formatMonthLabel(date: Date, offset: number): string {
  if (offset === 0) return "이번달"
  if (offset === -1) return "지난달"

  return format(date, "yyyy년 M월", { locale: ko })
}

/**
 * Format year label
 * - Current year: "올해"
 * - Last year: "작년"
 * - Other years: "YYYY년"
 */
function formatYearLabel(year: number, offset: number): string {
  if (offset === 0) return "올해"
  if (offset === -1) return "작년"

  return `${year}년`
}
