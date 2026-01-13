"use client"

import { useState, useMemo } from "react"
import { ProfitDisplay } from "./profit-display"
import { SummaryCard } from "./summary-card"
import { PeriodTabs } from "./period-tabs"
import { TransactionList } from "@/components/transaction/transaction-list"
import {
  dummyTransactions,
  filterTransactionsByPeriod,
  getSummaryByPeriod,
  type Period,
} from "@/lib/constants/dummy-data"

/**
 * 대시보드 클라이언트 컴포넌트
 * - 기간 선택 상태 관리
 * - 데이터 필터링 및 계산
 */
export function DashboardClient() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("today")

  // 선택된 기간의 요약 데이터 계산
  const summary = useMemo(() => {
    return getSummaryByPeriod(dummyTransactions, selectedPeriod)
  }, [selectedPeriod])

  // 선택된 기간의 거래 내역 필터링
  const filteredTransactions = useMemo(() => {
    return filterTransactionsByPeriod(dummyTransactions, selectedPeriod)
  }, [selectedPeriod])

  return (
    <>
      {/* 영업이익 대형 표시 */}
      <div className="mb-8">
        <ProfitDisplay amount={summary.netProfit} />
      </div>

      {/* 요약 카드 3개 */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <SummaryCard type="income" amount={summary.totalIncome} label="매출" />
        <SummaryCard
          type="expense"
          amount={summary.totalExpense}
          label="매입"
        />
      </div>

      {/* 기간 탭 */}
      <div className="mb-6">
        <PeriodTabs value={selectedPeriod} onValueChange={setSelectedPeriod} />
      </div>

      {/* 거래 내역 리스트 */}
      <TransactionList transactions={filteredTransactions} />
    </>
  )
}
