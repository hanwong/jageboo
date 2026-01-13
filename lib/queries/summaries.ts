import { createClient } from "@/lib/supabase/server"

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
 * @param period 조회 기간 ('daily' | 'weekly' | 'monthly')
 * @param date 기준 날짜
 * @returns 요약 데이터
 */
export async function getSummaryByPeriod(
  period: "daily" | "weekly" | "monthly",
  date: Date
): Promise<PeriodSummary> {
  const supabase = await createClient()

  // 기간별 시작일/종료일 계산
  const { startDate, endDate } = calculatePeriodDates(period, date)

  // 매출 합계 조회
  const { data: incomeData, error: incomeError } = await supabase
    .from("transactions")
    .select("amount")
    .eq("type", "income")
    .gte("date", startDate)
    .lte("date", endDate)

  if (incomeError) {
    console.error("Error fetching income data:", incomeError)
  }

  // 매입 합계 조회
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

  // 합계 계산
  const total_income =
    incomeData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const total_expense =
    expenseData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const net_profit = total_income - total_expense
  const transaction_count = count || 0

  return {
    total_income,
    total_expense,
    net_profit,
    transaction_count,
  }
}

/**
 * 기간별 시작일/종료일 계산 헬퍼 함수
 */
function calculatePeriodDates(
  period: "daily" | "weekly" | "monthly",
  date: Date
): { startDate: string; endDate: string } {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()

  switch (period) {
    case "daily": {
      // 오늘 하루
      const startDate = new Date(year, month, day)
      const endDate = new Date(year, month, day)
      return {
        startDate: formatDateToYYYYMMDD(startDate),
        endDate: formatDateToYYYYMMDD(endDate),
      }
    }

    case "weekly": {
      // 이번 주 (월요일 ~ 일요일)
      const dayOfWeek = date.getDay() // 0(일) ~ 6(토)
      const monday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // 월요일까지의 날짜 차이
      const startDate = new Date(year, month, day + monday)
      const endDate = new Date(year, month, day + monday + 6) // 일요일
      return {
        startDate: formatDateToYYYYMMDD(startDate),
        endDate: formatDateToYYYYMMDD(endDate),
      }
    }

    case "monthly": {
      // 이번 달 (1일 ~ 말일)
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0) // 다음 달 0일 = 이번 달 마지막 날
      return {
        startDate: formatDateToYYYYMMDD(startDate),
        endDate: formatDateToYYYYMMDD(endDate),
      }
    }
  }
}

/**
 * Date 객체를 YYYY-MM-DD 형식 문자열로 변환
 */
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
