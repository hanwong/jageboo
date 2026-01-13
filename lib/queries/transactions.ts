import { createClient } from "@/lib/supabase/server"
import type { Transaction } from "@/lib/types/database"

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
 * @param period 조회 기간 ('daily' | 'weekly' | 'monthly')
 * @param date 기준 날짜
 * @returns 거래 목록
 */
export async function getTransactionsByPeriod(
  period: "daily" | "weekly" | "monthly",
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
