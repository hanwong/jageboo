import type { RecurringTransaction } from "@/lib/types/database"

/**
 * 날짜를 00:00:00으로 정규화 (시간 제거)
 * 날짜 비교 시 일관성을 보장하기 위해 사용
 */
function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/**
 * 특정 년월의 마지막 날짜 반환
 * 월말 처리를 위해 사용 (예: 2월은 28일 또는 29일)
 */
function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * 주간 반복 거래의 실제 발생일 배열 반환
 *
 * 로직:
 * 1. 시작일의 요일(day of week) 추출
 * 2. 조회 기간 내에서 해당 요일에 해당하는 모든 날짜 찾기
 * 3. 종료일이 있으면 그 이전까지만
 * 4. 오늘 이후 날짜는 제외 (미래 발생 방지)
 *
 * @param startDate 반복 거래 시작일
 * @param endDate 반복 거래 종료일 (null이면 무제한)
 * @param periodStart 조회 기간 시작일
 * @param periodEnd 조회 기간 종료일
 * @returns 실제 발생일 배열
 */
function getWeeklyOccurrences(
  startDate: Date,
  endDate: Date | null,
  periodStart: Date,
  periodEnd: Date
): Date[] {
  const today = normalizeDate(new Date())
  const occurrences: Date[] = []
  const targetDayOfWeek = startDate.getDay() // 0(일) ~ 6(토)

  // 실제 검색 범위 계산
  const actualStart = startDate > periodStart ? startDate : periodStart
  const actualEnd = endDate && endDate < periodEnd ? endDate : periodEnd

  // 범위가 유효하지 않으면 빈 배열 반환
  if (actualStart > actualEnd) return []

  // actualStart부터 다음 targetDayOfWeek 찾기
  const current = new Date(actualStart)
  const currentDayOfWeek = current.getDay()
  const daysUntilTarget = (targetDayOfWeek - currentDayOfWeek + 7) % 7
  current.setDate(current.getDate() + daysUntilTarget)

  // 첫 발생일이 범위 이전이면 다음 주로
  if (current < actualStart) {
    current.setDate(current.getDate() + 7)
  }

  // 매주 같은 요일에 발생 (오늘까지만)
  while (current <= actualEnd) {
    if (current <= today) {
      occurrences.push(new Date(current))
    }
    current.setDate(current.getDate() + 7)
  }

  return occurrences
}

/**
 * 월간 반복 거래의 실제 발생일 배열 반환
 *
 * 로직:
 * 1. 시작일의 일(day) 추출 (예: 5일, 31일)
 * 2. 조회 기간 내 모든 월에서 해당 일에 발생
 * 3. 월말 처리: 31일 없는 달은 해당 월 마지막 날로 조정
 *    예: 매월 31일 → 2월은 28일(또는 29일)에 발생
 * 4. 오늘 이후 날짜는 제외 (미래 발생 방지)
 *
 * @param startDate 반복 거래 시작일
 * @param endDate 반복 거래 종료일 (null이면 무제한)
 * @param periodStart 조회 기간 시작일
 * @param periodEnd 조회 기간 종료일
 * @returns 실제 발생일 배열
 */
function getMonthlyOccurrences(
  startDate: Date,
  endDate: Date | null,
  periodStart: Date,
  periodEnd: Date
): Date[] {
  const today = normalizeDate(new Date())
  const occurrences: Date[] = []
  const targetDay = startDate.getDate() // 매월 발생할 일(day)

  // 실제 검색 범위 계산
  const actualStart = startDate > periodStart ? startDate : periodStart
  const actualEnd = endDate && endDate < periodEnd ? endDate : periodEnd

  // 범위가 유효하지 않으면 빈 배열 반환
  if (actualStart > actualEnd) return []

  // 시작 월부터 종료 월까지 순회
  const current = new Date(actualStart)
  current.setDate(1) // 월초로 설정

  while (current <= actualEnd) {
    const year = current.getFullYear()
    const month = current.getMonth()
    const lastDay = getLastDayOfMonth(year, month)

    // 해당 월의 targetDay 또는 월말 중 작은 값
    // 예: 매월 31일인데 2월이면 28일(또는 29일)로 조정
    const occurrenceDay = Math.min(targetDay, lastDay)
    const occurrence = new Date(year, month, occurrenceDay)

    // 범위 내에 있고 오늘 이전이면 추가 (미래 발생 방지)
    if (
      occurrence >= actualStart &&
      occurrence <= actualEnd &&
      occurrence <= today
    ) {
      occurrences.push(occurrence)
    }

    // 다음 달로
    current.setMonth(current.getMonth() + 1)
  }

  return occurrences
}

/**
 * 반복 거래가 특정 기간 내에 실제로 발생하는 모든 날짜 반환
 *
 * 세무상 발생주의 원칙을 준수하여 실제 발생일을 계산합니다.
 * 이 함수는 반복 거래 노출 및 합산의 단일 진실의 원천(Single Source of Truth)입니다.
 *
 * @param recurring 반복 거래 정보
 * @param periodStart 조회 기간 시작일
 * @param periodEnd 조회 기간 종료일
 * @returns 실제 발생일 배열 (Date[])
 *
 * @example
 * // 매월 5일 월세, 2025-01-05 시작
 * const recurring = { start_date: new Date('2025-01-05'), frequency: 'monthly', ... }
 * const occurrences = calculateActualOccurrenceDates(
 *   recurring,
 *   new Date('2025-02-01'),
 *   new Date('2025-02-28')
 * )
 * // 결과: [2025-02-05]
 */
export function calculateActualOccurrenceDates(
  recurring: RecurringTransaction,
  periodStart: Date,
  periodEnd: Date
): Date[] {
  // 날짜 정규화 (시간 제거, 00:00:00으로 통일)
  const start = normalizeDate(new Date(recurring.start_date))
  const end = recurring.end_date
    ? normalizeDate(new Date(recurring.end_date))
    : null
  const pStart = normalizeDate(periodStart)
  const pEnd = normalizeDate(periodEnd)

  // 반복 거래가 조회 기간과 겹치지 않으면 빈 배열
  if (start > pEnd) return []
  if (end && end < pStart) return []

  // 빈도에 따라 계산
  if (recurring.frequency === "weekly") {
    return getWeeklyOccurrences(start, end, pStart, pEnd)
  } else {
    // monthly
    return getMonthlyOccurrences(start, end, pStart, pEnd)
  }
}
