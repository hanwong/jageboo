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
      const recurringStartDate = new Date(recurring.start_date)
      const recurringEndDate = recurring.end_date
        ? new Date(recurring.end_date)
        : null

      // 반복 거래가 해당 기간에 발생하는지 확인
      // 1. 시작일이 기간 종료일 이전이어야 함
      // 2. 종료일이 없거나 기간 시작일 이후여야 함
      const isInPeriod =
        recurringStartDate <= endDateObj &&
        (!recurringEndDate || recurringEndDate >= startDateObj)

      if (isInPeriod) {
        // 해당 기간에 발생 횟수 계산
        const occurrences = calculateOccurrences(
          period,
          startDateObj,
          endDateObj,
          recurringStartDate,
          recurringEndDate,
          recurring.frequency
        )

        if (occurrences > 0) {
          const amount = Number(recurring.amount) * occurrences
          if (recurring.type === "income") {
            recurring_income += amount
          } else {
            recurring_expense += amount
          }
          recurring_count += occurrences
        }
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
 * 반복 거래의 발생 횟수 계산
 */
function calculateOccurrences(
  period: "daily" | "weekly" | "monthly",
  startDate: Date,
  endDate: Date,
  recurringStartDate: Date,
  recurringEndDate: Date | null,
  frequency: "weekly" | "monthly"
): number {
  // 간단한 로직: 해당 기간에 1회 발생한 것으로 계산
  // 실제로는 frequency에 따라 정확한 발생 횟수를 계산해야 하지만
  // MVP에서는 간단하게 처리

  if (period === "daily") {
    // 일별 조회: 해당 날짜에 발생하는지 확인
    if (frequency === "weekly") {
      // 매주 반복: 같은 요일인지 확인
      const isSameDay = startDate.getDay() === recurringStartDate.getDay()
      return isSameDay ? 1 : 0
    } else {
      // 매월 반복: 같은 일(day)인지 확인
      const isSameDate = startDate.getDate() === recurringStartDate.getDate()
      return isSameDate ? 1 : 0
    }
  } else if (period === "weekly") {
    // 주별 조회: 해당 주에 발생하는지 확인
    if (frequency === "weekly") {
      // 매주 반복: 해당 주에 해당 요일이 포함되는지 확인
      const targetDayOfWeek = recurringStartDate.getDay()
      let currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        if (currentDate.getDay() === targetDayOfWeek) {
          return 1
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
      return 0
    } else {
      // 매월 반복: 해당 주에 해당 일(day)이 포함되는지 확인
      const targetDay = recurringStartDate.getDate()
      let currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        if (currentDate.getDate() === targetDay) {
          return 1
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
      return 0
    }
  } else {
    // 월별 조회: 해당 월에 발생하는지 확인
    if (frequency === "weekly") {
      // 매주 반복: 해당 월에 몇 번 발생하는지 계산
      const targetDayOfWeek = recurringStartDate.getDay()
      let count = 0
      let currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        if (currentDate.getDay() === targetDayOfWeek) {
          count++
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
      return count
    } else {
      // 매월 반복: 해당 월에 해당 일(day)이 있는지 확인
      const targetDay = recurringStartDate.getDate()
      const monthStart = startDate.getMonth()
      const monthEnd = endDate.getMonth()
      const yearStart = startDate.getFullYear()
      const yearEnd = endDate.getFullYear()

      // 같은 월인지 확인
      if (yearStart === yearEnd && monthStart === monthEnd) {
        // 해당 월의 마지막 날짜 확인
        const lastDay = new Date(yearStart, monthStart + 1, 0).getDate()
        if (targetDay <= lastDay) {
          return 1
        }
      }
      return 0
    }
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
