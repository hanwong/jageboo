import { createClient } from "@/lib/supabase/server"
import type { RecurringTransaction } from "@/lib/types/database"

/**
 * 모든 반복 거래 조회 (활성/비활성 포함)
 * @returns 반복 거래 목록
 */
export async function getAllRecurringTransactions(): Promise<
  RecurringTransaction[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("recurring_transactions")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching recurring transactions:", error)
    return []
  }

  // 날짜 문자열을 Date 객체로 변환
  return data.map(transaction => ({
    ...transaction,
    start_date: new Date(transaction.start_date),
    end_date: transaction.end_date ? new Date(transaction.end_date) : null,
    last_generated_at: transaction.last_generated_at
      ? new Date(transaction.last_generated_at)
      : null,
    created_at: new Date(transaction.created_at),
    updated_at: new Date(transaction.updated_at),
  }))
}

/**
 * 단일 반복 거래 조회
 * @param id 반복 거래 ID
 * @returns 반복 거래 데이터 또는 null
 */
export async function getRecurringTransactionById(
  id: string
): Promise<RecurringTransaction | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching recurring transaction:", error)
    return null
  }

  // 날짜 문자열을 Date 객체로 변환
  return {
    ...data,
    start_date: new Date(data.start_date),
    end_date: data.end_date ? new Date(data.end_date) : null,
    last_generated_at: data.last_generated_at
      ? new Date(data.last_generated_at)
      : null,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
  }
}
