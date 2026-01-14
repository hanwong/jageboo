"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  recurringTransactionFormSchema,
  recurringTransactionIdSchema,
} from "@/lib/schemas/recurring-transaction"

/**
 * Server Action 결과 타입
 */
export interface ActionResult {
  success: boolean
  error?: string
  errors?: Record<string, string[]>
  data?: { id: string }
}

/**
 * 반복 거래 생성 Server Action
 * F007: 반복 거래 등록
 */
export async function createRecurringTransactionAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    // 1. 인증 확인
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      }
    }

    // 2. FormData 파싱
    const rawData = {
      type: formData.get("type"),
      amount: formData.get("amount"),
      memo: formData.get("memo"),
      frequency: formData.get("frequency"),
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
    }

    // amount를 숫자로 변환
    const parsedAmount =
      typeof rawData.amount === "string"
        ? parseFloat(rawData.amount)
        : rawData.amount

    // date를 Date 객체로 변환
    const parsedStartDate =
      typeof rawData.start_date === "string"
        ? new Date(rawData.start_date)
        : rawData.start_date

    const parsedEndDate =
      rawData.end_date && typeof rawData.end_date === "string"
        ? new Date(rawData.end_date)
        : null

    // 3. Zod 검증
    const validated = recurringTransactionFormSchema.safeParse({
      type: rawData.type,
      amount: parsedAmount,
      memo: rawData.memo || null,
      frequency: rawData.frequency,
      start_date: parsedStartDate,
      end_date: parsedEndDate,
    })

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
      }
    }

    // 4. 데이터베이스 저장
    const { error: dbError } = await supabase
      .from("recurring_transactions")
      .insert({
        user_id: user.id,
        type: validated.data.type,
        amount: validated.data.amount,
        memo: validated.data.memo,
        frequency: validated.data.frequency,
        start_date: validated.data.start_date.toISOString().split("T")[0],
        end_date: validated.data.end_date
          ? validated.data.end_date.toISOString().split("T")[0]
          : null,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return {
        success: false,
        error: "반복 거래 저장에 실패했습니다. 다시 시도해주세요.",
      }
    }

    // 5. 캐시 갱신
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      success: false,
      error: "예상치 못한 오류가 발생했습니다.",
    }
  }
}

/**
 * 반복 거래 수정 Server Action
 * F013: 반복 거래 관리
 */
export async function updateRecurringTransactionAction(
  id: string,
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    // 1. ID 검증
    const idValidation = recurringTransactionIdSchema.safeParse(id)
    if (!idValidation.success) {
      return {
        success: false,
        error: "유효하지 않은 반복 거래 ID입니다.",
      }
    }

    // 2. 인증 확인
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      }
    }

    // 3. FormData 파싱
    const rawData = {
      type: formData.get("type"),
      amount: formData.get("amount"),
      memo: formData.get("memo"),
      frequency: formData.get("frequency"),
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
    }

    // amount를 숫자로 변환
    const parsedAmount =
      typeof rawData.amount === "string"
        ? parseFloat(rawData.amount)
        : rawData.amount

    // date를 Date 객체로 변환
    const parsedStartDate =
      typeof rawData.start_date === "string"
        ? new Date(rawData.start_date)
        : rawData.start_date

    const parsedEndDate =
      rawData.end_date && typeof rawData.end_date === "string"
        ? new Date(rawData.end_date)
        : null

    // 4. Zod 검증
    const validated = recurringTransactionFormSchema.safeParse({
      type: rawData.type,
      amount: parsedAmount,
      memo: rawData.memo || null,
      frequency: rawData.frequency,
      start_date: parsedStartDate,
      end_date: parsedEndDate,
    })

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
      }
    }

    // 5. 데이터베이스 업데이트 (RLS에 의해 본인 거래만 수정 가능)
    const { error: dbError } = await supabase
      .from("recurring_transactions")
      .update({
        type: validated.data.type,
        amount: validated.data.amount,
        memo: validated.data.memo,
        frequency: validated.data.frequency,
        start_date: validated.data.start_date.toISOString().split("T")[0],
        end_date: validated.data.end_date
          ? validated.data.end_date.toISOString().split("T")[0]
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (dbError) {
      console.error("Database error:", dbError)
      return {
        success: false,
        error: "반복 거래 수정에 실패했습니다. 다시 시도해주세요.",
      }
    }

    // 6. 캐시 갱신
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      success: false,
      error: "예상치 못한 오류가 발생했습니다.",
    }
  }
}

/**
 * 반복 거래 삭제 Server Action
 * F013: 반복 거래 관리
 */
export async function deleteRecurringTransactionAction(
  id: string
): Promise<ActionResult> {
  try {
    // 1. ID 검증
    const idValidation = recurringTransactionIdSchema.safeParse(id)
    if (!idValidation.success) {
      return {
        success: false,
        error: "유효하지 않은 반복 거래 ID입니다.",
      }
    }

    // 2. 인증 확인
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      }
    }

    // 3. 데이터베이스 삭제 (RLS에 의해 본인 거래만 삭제 가능)
    const { error: dbError } = await supabase
      .from("recurring_transactions")
      .delete()
      .eq("id", id)

    if (dbError) {
      console.error("Database error:", dbError)
      return {
        success: false,
        error: "반복 거래 삭제에 실패했습니다. 다시 시도해주세요.",
      }
    }

    // 4. 캐시 갱신
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      success: false,
      error: "예상치 못한 오류가 발생했습니다.",
    }
  }
}
