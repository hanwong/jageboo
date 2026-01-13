"use client"

import { useState, useEffect } from "react"
import { ProfitDisplay } from "./profit-display"
import { SummaryCard } from "./summary-card"
import { PeriodTabs } from "./period-tabs"
import { TransactionList } from "@/components/transaction/transaction-list"
import { createClient } from "@/lib/supabase/client"
import type { Transaction } from "@/lib/types/database"

type Period = "daily" | "weekly" | "monthly"

interface DashboardClientProps {
  initialTransactions: Transaction[]
  initialSummary: {
    total_income: number
    total_expense: number
    net_profit: number
  }
}

/**
 * 대시보드 클라이언트 컴포넌트
 * - 기간 선택 상태 관리
 * - 기간 변경 시 데이터 리페칭
 */
export function DashboardClient({
  initialTransactions,
  initialSummary,
}: DashboardClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("daily")
  const [transactions, setTransactions] = useState(initialTransactions)
  const [summary, setSummary] = useState(initialSummary)
  const [isLoading, setIsLoading] = useState(false)

  // 기간 변경 시 데이터 다시 가져오기
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const supabase = createClient()

        // 기간별 시작일/종료일 계산
        const { startDate, endDate } = calculatePeriodDates(
          selectedPeriod,
          new Date()
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

        // 매출/매입 합계 계산
        const totalIncome = formattedTransactions
          .filter(t => t.type === "income")
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const totalExpense = formattedTransactions
          .filter(t => t.type === "expense")
          .reduce((sum, t) => sum + Number(t.amount), 0)

        setTransactions(formattedTransactions)
        setSummary({
          total_income: totalIncome,
          total_expense: totalExpense,
          net_profit: totalIncome - totalExpense,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedPeriod])

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
        <PeriodTabs value={selectedPeriod} onValueChange={setSelectedPeriod} />
      </div>

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
 * 기간별 시작일/종료일 계산 헬퍼 함수
 */
function calculatePeriodDates(
  period: Period,
  date: Date
): { startDate: string; endDate: string } {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()

  switch (period) {
    case "daily": {
      const startDate = new Date(year, month, day)
      const endDate = new Date(year, month, day)
      return {
        startDate: formatDateToYYYYMMDD(startDate),
        endDate: formatDateToYYYYMMDD(endDate),
      }
    }

    case "weekly": {
      const dayOfWeek = date.getDay()
      const monday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const startDate = new Date(year, month, day + monday)
      const endDate = new Date(year, month, day + monday + 6)
      return {
        startDate: formatDateToYYYYMMDD(startDate),
        endDate: formatDateToYYYYMMDD(endDate),
      }
    }

    case "monthly": {
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0)
      return {
        startDate: formatDateToYYYYMMDD(startDate),
        endDate: formatDateToYYYYMMDD(endDate),
      }
    }
  }
}

function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
