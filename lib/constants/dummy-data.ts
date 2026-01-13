/**
 * 더미 데이터 및 유틸리티 함수
 * Phase 2 UI 개발용 샘플 데이터
 */

import type { Transaction, RecurringTransaction } from "@/lib/types"

/**
 * 더미 거래 데이터
 */
export const dummyTransactions: Transaction[] = [
  {
    id: "1",
    user_id: "dummy-user",
    type: "income",
    amount: 350000,
    date: new Date(2026, 0, 13), // 오늘
    memo: "단체 주문 - 회사 식사",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "2",
    user_id: "dummy-user",
    type: "income",
    amount: 120000,
    date: new Date(2026, 0, 13), // 오늘
    memo: "점심 매출",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "3",
    user_id: "dummy-user",
    type: "expense",
    amount: 180000,
    date: new Date(2026, 0, 13), // 오늘
    memo: "식재료 구입",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "4",
    user_id: "dummy-user",
    type: "income",
    amount: 450000,
    date: new Date(2026, 0, 12), // 어제
    memo: null,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "5",
    user_id: "dummy-user",
    type: "expense",
    amount: 250000,
    date: new Date(2026, 0, 12), // 어제
    memo: "인건비",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "6",
    user_id: "dummy-user",
    type: "income",
    amount: 380000,
    date: new Date(2026, 0, 11),
    memo: null,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "7",
    user_id: "dummy-user",
    type: "expense",
    amount: 95000,
    date: new Date(2026, 0, 11),
    memo: "주방용품",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "8",
    user_id: "dummy-user",
    type: "income",
    amount: 520000,
    date: new Date(2026, 0, 10),
    memo: null,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "9",
    user_id: "dummy-user",
    type: "expense",
    amount: 320000,
    date: new Date(2026, 0, 10),
    memo: "식재료 구입",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "10",
    user_id: "dummy-user",
    type: "income",
    amount: 290000,
    date: new Date(2026, 0, 9),
    memo: "저녁 매출",
    created_at: new Date(),
    updated_at: new Date(),
  },
]

/**
 * 기간 타입
 */
export type Period = "today" | "week" | "month"

/**
 * 요약 데이터 타입
 */
export interface SummaryData {
  totalIncome: number
  totalExpense: number
  netProfit: number
}

/**
 * 특정 날짜가 오늘인지 확인
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * 특정 날짜가 이번 주인지 확인 (월요일 시작)
 */
export function isThisWeek(date: Date): boolean {
  const today = new Date()
  const todayDay = today.getDay()
  const mondayOffset = todayDay === 0 ? -6 : 1 - todayDay // 일요일이면 -6, 그 외는 1-요일
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  return date >= monday && date <= sunday
}

/**
 * 특정 날짜가 이번 달인지 확인
 */
export function isThisMonth(date: Date): boolean {
  const today = new Date()
  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * 기간에 따라 거래 필터링
 */
export function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: Period
): Transaction[] {
  return transactions.filter(transaction => {
    switch (period) {
      case "today":
        return isToday(transaction.date)
      case "week":
        return isThisWeek(transaction.date)
      case "month":
        return isThisMonth(transaction.date)
      default:
        return false
    }
  })
}

/**
 * 거래 목록에서 요약 데이터 계산
 */
export function calculateSummary(transactions: Transaction[]): SummaryData {
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const netProfit = totalIncome - totalExpense

  return {
    totalIncome,
    totalExpense,
    netProfit,
  }
}

/**
 * 기간별 요약 데이터 계산
 */
export function getSummaryByPeriod(
  transactions: Transaction[],
  period: Period
): SummaryData {
  const filtered = filterTransactionsByPeriod(transactions, period)
  return calculateSummary(filtered)
}

/**
 * 금액 포맷팅 (천단위 콤마)
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString("ko-KR")
}

/**
 * 날짜 포맷팅 (M월 D일)
 */
export function formatDate(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

/**
 * 날짜 포맷팅 (YYYY.MM.DD)
 */
export function formatDateFull(date: Date): string {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
}

/**
 * ID로 거래 조회
 */
export function getTransactionById(id: string): Transaction | undefined {
  return dummyTransactions.find(t => t.id === id)
}

/**
 * 더미 반복 거래 데이터
 */
export const dummyRecurringTransactions: RecurringTransaction[] = [
  {
    id: "r1",
    user_id: "dummy-user",
    type: "expense",
    amount: 300000,
    memo: "월세",
    frequency: "monthly",
    start_date: new Date(2026, 0, 1), // 1월 1일
    end_date: null,
    last_generated_at: new Date(2026, 0, 1),
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "r2",
    user_id: "dummy-user",
    type: "expense",
    amount: 150000,
    memo: "인터넷/전화",
    frequency: "monthly",
    start_date: new Date(2026, 0, 1),
    end_date: null,
    last_generated_at: new Date(2026, 0, 1),
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "r3",
    user_id: "dummy-user",
    type: "income",
    amount: 50000,
    memo: "정기 배달",
    frequency: "weekly",
    start_date: new Date(2026, 0, 1),
    end_date: null,
    last_generated_at: new Date(2026, 0, 10),
    created_at: new Date(),
    updated_at: new Date(),
  },
]
