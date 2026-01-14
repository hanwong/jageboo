import type { RecurringTransaction } from "@/lib/types/database"
import type { Period } from "@/lib/types/transaction"
import { calculateActualOccurrenceDates } from "./recurring-occurrence"

/**
 * 기간별로 반복 거래 필터링
 * 실제 발생일 기준으로 해당 기간에 1회 이상 발생하는 반복 거래만 표시
 *
 * @param transactions 반복 거래 목록
 * @param period 조회 기간 ('daily' | 'weekly' | 'monthly' | 'yearly')
 * @param date 기준 날짜
 * @returns 필터링된 반복 거래 목록
 */
export function filterRecurringByPeriod(
  transactions: RecurringTransaction[],
  period: Period,
  date: Date
): RecurringTransaction[] {
  const { startDate, endDate } = calculatePeriodDates(period, date)

  return transactions.filter(transaction => {
    // 실제 발생일 계산
    const occurrences = calculateActualOccurrenceDates(
      transaction,
      startDate,
      endDate
    )
    // 발생일이 1개 이상 있으면 표시
    return occurrences.length > 0
  })
}

/**
 * 기간별 시작일/종료일 계산
 */
function calculatePeriodDates(
  period: Period,
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

    case "yearly": {
      // 올해 (1월 1일 ~ 12월 31일)
      const startDate = new Date(year, 0, 1) // January 1
      const endDate = new Date(year, 11, 31) // December 31
      return { startDate, endDate }
    }
  }
}

/**
 * 반복 거래의 발생 횟수 계산
 *
 * @deprecated 레거시 시그니처 지원용, 새 코드는 calculateActualOccurrenceDates 직접 사용 권장
 *
 * @param period 조회 기간 ('daily' | 'weekly' | 'monthly' | 'yearly')
 * @param periodStartDate 선택 기간 시작일
 * @param periodEndDate 선택 기간 종료일
 * @param today 오늘 날짜 (더 이상 사용하지 않음)
 * @param recurringStartDate 반복 거래 시작일
 * @param recurringEndDate 반복 거래 종료일 (null이면 무제한)
 * @param frequency 반복 빈도 ('weekly' | 'monthly')
 * @returns 발생 횟수
 */
export function calculateOccurrences(
  period: Period,
  periodStartDate: Date,
  periodEndDate: Date,
  today: Date,
  recurringStartDate: Date,
  recurringEndDate: Date | null,
  frequency: "weekly" | "monthly"
): number {
  // 레거시 호출 지원: RecurringTransaction 객체 구성
  const recurring = {
    start_date: recurringStartDate,
    end_date: recurringEndDate,
    frequency: frequency,
  } as RecurringTransaction

  const occurrences = calculateActualOccurrenceDates(
    recurring,
    periodStartDate,
    periodEndDate
  )

  return occurrences.length
}
