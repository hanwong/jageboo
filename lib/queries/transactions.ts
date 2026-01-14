import { createClient } from "@/lib/supabase/server"
import type { Transaction } from "@/lib/types/database"
import type { Period } from "@/lib/types/transaction"

/**
 * 단일 거래 조회
 * @param id 거래 ID
 * @returns 거래 데이터 또는 null
 */
export async function getTransactionById(
  id: string
): Promise<Transaction | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching transaction:", error)
    return null
  }

  // 날짜 문자열을 Date 객체로 변환
  return {
    ...data,
    date: new Date(data.date),
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
  }
}

/**
 * 기간별 거래 조회
 * @param period 조회 기간 ('daily' | 'weekly' | 'monthly' | 'yearly')
 * @param date 기준 날짜
 * @returns 거래 목록
 */
export async function getTransactionsByPeriod(
  period: Period,
  date: Date
): Promise<Transaction[]> {
  const supabase = await createClient()

  // 기간별 시작일/종료일 계산
  const { startDate, endDate } = calculatePeriodDates(period, date)

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching transactions:", error)
    return []
  }

  // 날짜 문자열을 Date 객체로 변환
  return data.map(transaction => ({
    ...transaction,
    date: new Date(transaction.date),
    created_at: new Date(transaction.created_at),
    updated_at: new Date(transaction.updated_at),
  }))
}

/**
 * 최근 거래 N개 조회
 * @param limit 조회할 거래 개수 (기본값: 10)
 * @returns 최근 거래 목록
 */
export async function getRecentTransactions(
  limit: number = 10
): Promise<Transaction[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching recent transactions:", error)
    return []
  }

  // 날짜 문자열을 Date 객체로 변환
  return data.map(transaction => ({
    ...transaction,
    date: new Date(transaction.date),
    created_at: new Date(transaction.created_at),
    updated_at: new Date(transaction.updated_at),
  }))
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
