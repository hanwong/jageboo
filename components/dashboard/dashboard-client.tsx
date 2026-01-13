"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { isToday } from "date-fns"
import { ProfitDisplay } from "./profit-display"
import { SummaryCard } from "./summary-card"
import { PeriodTabs } from "./period-tabs"
import { DateSelector } from "./date-selector"
import { PeriodScroller } from "./period-scroller"
import { PeriodResetButton } from "./period-reset-button"
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

  // Check if viewing current period
  const isViewingCurrent = useMemo(() => {
    if (periodSelection.type === "daily") {
      return isToday(periodSelection.date)
    }
    // For weekly/monthly/yearly, check if offset is 0
    const offset =
      "weekOffset" in periodSelection
        ? periodSelection.weekOffset
        : "monthOffset" in periodSelection
          ? periodSelection.monthOffset
          : "yearOffset" in periodSelection
            ? periodSelection.yearOffset
            : 0
    return offset === 0
  }, [periodSelection])

  // 기간별 반복 거래 필터링
  const filteredRecurringTransactions = useMemo(() => {
    const referenceDate =
      periodSelection.type === "daily" ? periodSelection.date : new Date()
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

  // Reset to current period
  const handleResetToCurrent = () => {
    if (periodSelection.type === "daily") {
      setPeriodSelection({ type: "daily", date: new Date() })
    } else if (periodSelection.type === "weekly") {
      setPeriodSelection({ type: "weekly", weekOffset: 0 })
    } else if (periodSelection.type === "monthly") {
      setPeriodSelection({ type: "monthly", monthOffset: 0 })
    } else if (periodSelection.type === "yearly") {
      setPeriodSelection({ type: "yearly", yearOffset: 0 })
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
        const { startDate, endDate } = calculatePeriodDatesForSelection(
          periodSelection
        )

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
        const referenceDate =
          periodSelection.type === "daily"
            ? periodSelection.date
            : new Date()
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

          {!isViewingCurrent && (
            <PeriodResetButton onClick={handleResetToCurrent} />
          )}
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
 */
function calculatePeriodDatesForSelection(
  selection: PeriodSelection
): { startDate: string; endDate: string } {
  if (selection.type === "daily") {
    // Use the selected date
    return {
      startDate: formatDateToYYYYMMDD(selection.date),
      endDate: formatDateToYYYYMMDD(selection.date),
    }
  } else if (selection.type === "weekly") {
    // Calculate week range based on offset
    const now = new Date()
    const targetDate = new Date(now)
    targetDate.setDate(now.getDate() + selection.weekOffset * 7)

    const dayOfWeek = targetDate.getDay()
    const monday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const startDate = new Date(targetDate)
    startDate.setDate(targetDate.getDate() + monday)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)

    return {
      startDate: formatDateToYYYYMMDD(startDate),
      endDate: formatDateToYYYYMMDD(endDate),
    }
  } else if (selection.type === "monthly") {
    // Calculate month range based on offset
    const now = new Date()
    const targetDate = new Date(now)
    targetDate.setMonth(now.getMonth() + selection.monthOffset)

    const startDate = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      1
    )
    const endDate = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      0
    )

    return {
      startDate: formatDateToYYYYMMDD(startDate),
      endDate: formatDateToYYYYMMDD(endDate),
    }
  } else if (selection.type === "yearly") {
    // Calculate year range based on offset
    const now = new Date()
    const targetYear = now.getFullYear() + selection.yearOffset

    const startDate = new Date(targetYear, 0, 1) // January 1
    const endDate = new Date(targetYear, 11, 31) // December 31

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

function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
