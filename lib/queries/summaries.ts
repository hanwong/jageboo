import { createClient } from "@/lib/supabase/server"
import type { Period } from "@/lib/types/transaction"
import type { RecurringTransaction } from "@/lib/types/database"
import { calculateActualOccurrenceDates } from "@/lib/utils/recurring-occurrence"

/**
 * 기간별 요약 데이터 타입
 */
export interface PeriodSummary {
  total_income: number
  total_expense: number
  net_profit: number
  transaction_count: number
}

/**
 * 기간별 요약 데이터 조회
 * @param period 조회 기간 ('daily' | 'weekly' | 'monthly' | 'yearly')
 * @param date 기준 날짜
 * @returns 요약 데이터
 */
export async function getSummaryByPeriod(
  period: Period,
  date: Date
): Promise<PeriodSummary> {
  const supabase = await createClient()

  // 기간별 시작일/종료일 계산
  const { startDate, endDate } = calculatePeriodDates(period, date)

  // 일반 거래 - 매출 합계 조회
  const { data: incomeData, error: incomeError } = await supabase
    .from("transactions")
    .select("amount")
    .eq("type", "income")
    .gte("date", startDate)
    .lte("date", endDate)

  if (incomeError) {
    console.error("Error fetching income data:", incomeError)
  }

  // 일반 거래 - 매입 합계 조회
  const { data: expenseData, error: expenseError } = await supabase
    .from("transactions")
    .select("amount")
    .eq("type", "expense")
    .gte("date", startDate)
    .lte("date", endDate)

  if (expenseError) {
    console.error("Error fetching expense data:", expenseError)
  }

  // 전체 거래 수 조회
  const { count, error: countError } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .gte("date", startDate)
    .lte("date", endDate)

  if (countError) {
    console.error("Error counting transactions:", countError)
  }

  // 반복 거래 조회
  const { data: recurringData, error: recurringError } = await supabase
    .from("recurring_transactions")
    .select("*")

  if (recurringError) {
    console.error("Error fetching recurring transactions:", recurringError)
  }

  // 반복 거래 중 해당 기간에 포함되는 것 필터링 및 합산
  let recurring_income = 0
  let recurring_expense = 0
  let recurring_count = 0

  if (recurringData) {
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)

    for (const recurring of recurringData) {
      // RecurringTransaction 타입으로 변환 (Date 객체로)
      const recurringTransaction: RecurringTransaction = {
        ...recurring,
        start_date: new Date(recurring.start_date),
        end_date: recurring.end_date ? new Date(recurring.end_date) : null,
        last_generated_at: recurring.last_generated_at
          ? new Date(recurring.last_generated_at)
          : null,
        created_at: new Date(recurring.created_at),
        updated_at: new Date(recurring.updated_at),
      }

      // 실제 발생일 계산
      const occurrences = calculateActualOccurrenceDates(
        recurringTransaction,
        startDateObj,
        endDateObj
      )

      // 발생 횟수가 0보다 크면 합산
      if (occurrences.length > 0) {
        const amount = Number(recurring.amount) * occurrences.length
        if (recurring.type === "income") {
          recurring_income += amount
        } else {
          recurring_expense += amount
        }
        recurring_count += occurrences.length
      }
    }
  }

  // 합계 계산
  const total_income =
    (incomeData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) +
    recurring_income
  const total_expense =
    (expenseData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) +
    recurring_expense
  const net_profit = total_income - total_expense
  const transaction_count = (count || 0) + recurring_count

  return {
    total_income,
    total_expense,
    net_profit,
    transaction_count,
  }
}

/**
 * 기간별 시작일/종료일 계산 헬퍼 함수
 * UTC를 사용하여 타임존 문제 방지
 */
function calculatePeriodDates(
  period: Period,
  date: Date
): { startDate: string; endDate: string } {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()

  switch (period) {
    case "daily": {
      // 오늘 하루
      const startDate = new Date(Date.UTC(year, month, day))
      const endDate = new Date(Date.UTC(year, month, day))
      return {
        startDate: formatDateToYYYYMMDD(startDate),
        endDate: formatDateToYYYYMMDD(endDate),
      }
    }

    case "weekly": {
      // 이번 주 (월요일 ~ 일요일)
      const dayOfWeek = date.getUTCDay() // 0(일) ~ 6(토)
      const monday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // 월요일까지의 날짜 차이
      const startDate = new Date(Date.UTC(year, month, day + monday))
      const endDate = new Date(Date.UTC(year, month, day + monday + 6)) // 일요일
      return {
        startDate: formatDateToYYYYMMDD(startDate),
        endDate: formatDateToYYYYMMDD(endDate),
      }
    }

    case "monthly": {
      // 이번 달 (1일 ~ 말일)
      const startDate = new Date(Date.UTC(year, month, 1))
      const endDate = new Date(Date.UTC(year, month + 1, 0)) // 다음 달 0일 = 이번 달 마지막 날
      return {
        startDate: formatDateToYYYYMMDD(startDate),
        endDate: formatDateToYYYYMMDD(endDate),
      }
    }

    case "yearly": {
      // 올해 (1월 1일 ~ 12월 31일)
      const startDate = new Date(Date.UTC(year, 0, 1)) // January 1
      const endDate = new Date(Date.UTC(year, 11, 31)) // December 31
      return {
        startDate: formatDateToYYYYMMDD(startDate),
        endDate: formatDateToYYYYMMDD(endDate),
      }
    }
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
