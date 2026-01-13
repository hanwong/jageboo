import type { RecurringTransaction } from "@/lib/types/database"

/**
 * 기간별로 반복 거래 필터링
 * 해당 기간에 실제로 발생하는 반복 거래만 표시
 *
 * @param transactions 반복 거래 목록
 * @param period 조회 기간 ('daily' | 'weekly' | 'monthly')
 * @param date 기준 날짜
 * @returns 필터링된 반복 거래 목록
 */
export function filterRecurringByPeriod(
  transactions: RecurringTransaction[],
  period: "daily" | "weekly" | "monthly",
  date: Date
): RecurringTransaction[] {
  const { startDate, endDate } = calculatePeriodDates(period, date)

  return transactions.filter(transaction => {
    const recurringStartDate = transaction.start_date
    const recurringEndDate = transaction.end_date

    // 반복 거래가 해당 기간에 발생하는지 확인
    // 1. 시작일이 기간 종료일 이전이어야 함
    // 2. 종료일이 없거나 기간 시작일 이후여야 함
    const isInPeriod =
      recurringStartDate <= endDate &&
      (!recurringEndDate || recurringEndDate >= startDate)

    if (!isInPeriod) return false

    // 해당 기간에 실제로 발생하는지 확인
    const occurrences = calculateOccurrences(
      period,
      startDate,
      endDate,
      recurringStartDate,
      recurringEndDate,
      transaction.frequency
    )

    return occurrences > 0
  })
}

/**
 * 기간별 시작일/종료일 계산
 */
function calculatePeriodDates(
  period: "daily" | "weekly" | "monthly",
  date: Date
): { startDate: Date; endDate: Date } {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()

  switch (period) {
    case "daily": {
      // 오늘 하루
      const startDate = new Date(year, month, day)
      const endDate = new Date(year, month, day)
      return { startDate, endDate }
    }

    case "weekly": {
      // 이번 주 (월요일 ~ 일요일)
      const dayOfWeek = date.getDay()
      const monday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const startDate = new Date(year, month, day + monday)
      const endDate = new Date(year, month, day + monday + 6) // 일요일
      return { startDate, endDate }
    }

    case "monthly": {
      // 이번 달 (1일 ~ 말일)
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0) // 다음 달 0일 = 이번 달 마지막 날
      return { startDate, endDate }
    }
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
