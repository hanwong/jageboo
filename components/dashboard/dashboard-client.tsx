"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ProfitDisplay } from "./profit-display"
import { SummaryCard } from "./summary-card"
import { PeriodTabs } from "./period-tabs"
import { DateSelector } from "./date-selector"
import { PeriodScroller } from "./period-scroller"
import { TransactionList } from "@/components/transaction/transaction-list"
import { RecurringTransactionList } from "@/components/recurring/recurring-transaction-list"
import { createClient } from "@/lib/supabase/client"
import { filterRecurringByPeriod } from "@/lib/utils/recurring-filters"
import type { Transaction, RecurringTransaction } from "@/lib/types/database"
import type { Period, PeriodSelection } from "@/lib/types/transaction"

interface DashboardClientProps {
  initialTransactions: Transaction[]
  initialSummary: {
    total_income: number
    total_expense: number
    net_profit: number
  }
  initialRecurringTransactions: RecurringTransaction[]
}

/**
 * PeriodSelection을 기반으로 대표 날짜 계산
 * offset이 있으면 해당 offset을 적용한 날짜 반환
 */
function getReferenceDateFromSelection(selection: PeriodSelection): Date {
  if (selection.type === "daily") {
    return selection.date
  }

  const now = new Date()

  if (selection.type === "weekly") {
    const targetDate = new Date(now)
    targetDate.setDate(now.getDate() + selection.weekOffset * 7)
    return targetDate
  } else if (selection.type === "monthly") {
    const targetDate = new Date(now)
    targetDate.setMonth(now.getMonth() + selection.monthOffset)
    return targetDate
  } else if (selection.type === "yearly") {
    const targetDate = new Date(now)
    targetDate.setFullYear(now.getFullYear() + selection.yearOffset)
    return targetDate
  }

  return now
}

/**
 * 대시보드 클라이언트 컴포넌트
 * - 기간 선택 상태 관리
 * - 기간 변경 시 데이터 리페칭
 */
export function DashboardClient({
  initialTransactions,
  initialSummary,
  initialRecurringTransactions,
}: DashboardClientProps) {
  const router = useRouter()
  const [periodSelection, setPeriodSelection] = useState<PeriodSelection>({
    type: "daily",
    date: new Date(),
  })
  const [transactions, setTransactions] = useState(initialTransactions)
  const [summary, setSummary] = useState(initialSummary)
  const [isLoading, setIsLoading] = useState(false)

  // 기간별 반복 거래 필터링
  const filteredRecurringTransactions = useMemo(() => {
    const referenceDate = getReferenceDateFromSelection(periodSelection)
    return filterRecurringByPeriod(
      initialRecurringTransactions,
      periodSelection.type,
      referenceDate
    )
  }, [initialRecurringTransactions, periodSelection])

  // 반복 거래 클릭 핸들러
  const handleRecurringClick = (id: string) => {
    router.push(`/recurring/${id}/edit`)
  }

  // Period type change handler (resets to current period)
  const handlePeriodTypeChange = (newType: Period) => {
    setPeriodSelection({
      type: newType,
      date: newType === "daily" ? new Date() : undefined,
      weekOffset: newType === "weekly" ? 0 : undefined,
      monthOffset: newType === "monthly" ? 0 : undefined,
      yearOffset: newType === "yearly" ? 0 : undefined,
    } as PeriodSelection)
  }

  // Date change handler (for daily period)
  const handleDateChange = (date: Date) => {
    setPeriodSelection({ type: "daily", date })
  }

  // Offset change handler (for weekly/monthly/yearly periods)
  const handleOffsetChange = (offset: number) => {
    if (periodSelection.type === "weekly") {
      setPeriodSelection({ type: "weekly", weekOffset: offset })
    } else if (periodSelection.type === "monthly") {
      setPeriodSelection({ type: "monthly", monthOffset: offset })
    } else if (periodSelection.type === "yearly") {
      setPeriodSelection({ type: "yearly", yearOffset: offset })
    }
  }

  // Get current offset for scroller
  const getCurrentOffset = (): number => {
    if (periodSelection.type === "weekly" && "weekOffset" in periodSelection) {
      return periodSelection.weekOffset
    } else if (
      periodSelection.type === "monthly" &&
      "monthOffset" in periodSelection
    ) {
      return periodSelection.monthOffset
    } else if (
      periodSelection.type === "yearly" &&
      "yearOffset" in periodSelection
    ) {
      return periodSelection.yearOffset
    }
    return 0
  }

  // 기간 변경 시 데이터 다시 가져오기
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const supabase = createClient()

        // 기간별 시작일/종료일 계산
        const { startDate, endDate } =
          calculatePeriodDatesForSelection(periodSelection)

        // 거래 내역 조회
        const { data: transactionsData, error: transactionsError } =
          await supabase
            .from("transactions")
            .select("*")
            .gte("date", startDate)
            .lte("date", endDate)
            .order("date", { ascending: false })
            .order("created_at", { ascending: false })

        if (transactionsError) {
          console.error("Error fetching transactions:", transactionsError)
          return
        }

        // 날짜 문자열을 Date 객체로 변환
        const formattedTransactions = transactionsData.map(t => ({
          ...t,
          date: new Date(t.date),
          created_at: new Date(t.created_at),
          updated_at: new Date(t.updated_at),
        }))

        // 반복 거래를 포함한 요약 데이터 조회 (API)
        const referenceDate = getReferenceDateFromSelection(periodSelection)
        const summaryResponse = await fetch(
          `/api/summary?period=${periodSelection.type}&date=${referenceDate.toISOString()}`
        )
        const summaryData = await summaryResponse.json()

        setTransactions(formattedTransactions)
        setSummary(summaryData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [periodSelection])

  return (
    <>
      {/* 영업이익 대형 표시 */}
      <div className="mb-8">
        <ProfitDisplay amount={summary.net_profit} />
      </div>

      {/* 요약 카드 3개 */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <SummaryCard type="income" amount={summary.total_income} label="매출" />
        <SummaryCard
          type="expense"
          amount={summary.total_expense}
          label="매입"
        />
      </div>

      {/* 기간 탭 */}
      <div className="mb-6">
        <div className="relative">
          <PeriodTabs
            value={periodSelection.type}
            onValueChange={handlePeriodTypeChange}
          />
        </div>

        {/* Date Selector for Daily Period */}
        {periodSelection.type === "daily" && (
          <DateSelector
            value={periodSelection.date}
            onChange={handleDateChange}
          />
        )}

        {/* Period Scroller for Weekly/Monthly/Yearly */}
        {periodSelection.type !== "daily" && (
          <PeriodScroller
            periodType={periodSelection.type}
            currentOffset={getCurrentOffset()}
            onOffsetChange={handleOffsetChange}
          />
        )}
      </div>

      {/* 반복 거래 섹션 */}
      {filteredRecurringTransactions.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            반복 거래
          </h3>
          <RecurringTransactionList
            transactions={filteredRecurringTransactions}
            onClick={handleRecurringClick}
          />
        </div>
      )}

      {/* 구분선 */}
      {filteredRecurringTransactions.length > 0 && transactions.length > 0 && (
        <div className="mb-6 border-t" />
      )}

      {/* 거래 내역 리스트 */}
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">로딩 중...</div>
      ) : (
        <TransactionList transactions={transactions} />
      )}
    </>
  )
}

/**
 * 기간 선택에 따른 시작일/종료일 계산 헬퍼 함수
 * UTC를 사용하여 타임존 문제 방지
 */
function calculatePeriodDatesForSelection(selection: PeriodSelection): {
  startDate: string
  endDate: string
} {
  if (selection.type === "daily") {
    // Use the selected date
    return {
      startDate: formatDateToYYYYMMDD(selection.date),
      endDate: formatDateToYYYYMMDD(selection.date),
    }
  } else if (selection.type === "weekly") {
    // Calculate week range based on offset
    const now = new Date()
    const year = now.getUTCFullYear()
    const month = now.getUTCMonth()
    const day = now.getUTCDate()
    const targetDate = new Date(
      Date.UTC(year, month, day + selection.weekOffset * 7)
    )

    const dayOfWeek = targetDate.getUTCDay()
    const monday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const startDate = new Date(
      Date.UTC(
        targetDate.getUTCFullYear(),
        targetDate.getUTCMonth(),
        targetDate.getUTCDate() + monday
      )
    )
    const endDate = new Date(
      Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate() + 6
      )
    )

    return {
      startDate: formatDateToYYYYMMDD(startDate),
      endDate: formatDateToYYYYMMDD(endDate),
    }
  } else if (selection.type === "monthly") {
    // Calculate month range based on offset
    const now = new Date()
    const year = now.getUTCFullYear()
    const month = now.getUTCMonth() + selection.monthOffset

    const startDate = new Date(Date.UTC(year, month, 1))
    const endDate = new Date(Date.UTC(year, month + 1, 0))

    return {
      startDate: formatDateToYYYYMMDD(startDate),
      endDate: formatDateToYYYYMMDD(endDate),
    }
  } else if (selection.type === "yearly") {
    // Calculate year range based on offset
    const now = new Date()
    const targetYear = now.getUTCFullYear() + selection.yearOffset

    const startDate = new Date(Date.UTC(targetYear, 0, 1)) // January 1
    const endDate = new Date(Date.UTC(targetYear, 11, 31)) // December 31

    return {
      startDate: formatDateToYYYYMMDD(startDate),
      endDate: formatDateToYYYYMMDD(endDate),
    }
  }

  // Fallback (should never reach here)
  return {
    startDate: formatDateToYYYYMMDD(new Date()),
    endDate: formatDateToYYYYMMDD(new Date()),
  }
}

/**
 * Date 객체를 YYYY-MM-DD 형식 문자열로 변환
 * UTC를 사용하여 타임존 문제 방지
 */
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
