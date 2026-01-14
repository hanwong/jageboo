"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  transactionFormSchema,
  transactionIdSchema,
} from "@/lib/schemas/transaction"

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
 * 거래 생성 Server Action
 * F001: 매출 입력, F002: 매입 입력
 */
export async function createTransactionAction(
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
      date: formData.get("date"),
      memo: formData.get("memo"),
    }

    // amount를 숫자로 변환
    const parsedAmount =
      typeof rawData.amount === "string"
        ? parseFloat(rawData.amount)
        : rawData.amount

    // date를 Date 객체로 변환
    const parsedDate =
      typeof rawData.date === "string" ? new Date(rawData.date) : rawData.date

    // 3. Zod 검증
    const validated = transactionFormSchema.safeParse({
      type: rawData.type,
      amount: parsedAmount,
      date: parsedDate,
      memo: rawData.memo || null,
    })

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
      }
    }

    // 4. 데이터베이스 저장
    const { error: dbError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type: validated.data.type,
        amount: validated.data.amount,
        date: validated.data.date.toISOString().split("T")[0], // YYYY-MM-DD 형식
        memo: validated.data.memo,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return {
        success: false,
        error: "거래 저장에 실패했습니다. 다시 시도해주세요.",
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
 * 거래 수정 Server Action
 * F010: 거래 수정
 */
export async function updateTransactionAction(
  id: string,
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    // 1. ID 검증
    const idValidation = transactionIdSchema.safeParse(id)
    if (!idValidation.success) {
      return {
        success: false,
        error: "유효하지 않은 거래 ID입니다.",
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
      date: formData.get("date"),
      memo: formData.get("memo"),
    }

    // amount를 숫자로 변환
    const parsedAmount =
      typeof rawData.amount === "string"
        ? parseFloat(rawData.amount)
        : rawData.amount

    // date를 Date 객체로 변환
    const parsedDate =
      typeof rawData.date === "string" ? new Date(rawData.date) : rawData.date

    // 4. Zod 검증
    const validated = transactionFormSchema.safeParse({
      type: rawData.type,
      amount: parsedAmount,
      date: parsedDate,
      memo: rawData.memo || null,
    })

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
      }
    }

    // 5. 데이터베이스 업데이트 (RLS에 의해 본인 거래만 수정 가능)
    const { error: dbError } = await supabase
      .from("transactions")
      .update({
        type: validated.data.type,
        amount: validated.data.amount,
        date: validated.data.date.toISOString().split("T")[0],
        memo: validated.data.memo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (dbError) {
      console.error("Database error:", dbError)
      return {
        success: false,
        error: "거래 수정에 실패했습니다. 다시 시도해주세요.",
      }
    }

    // 6. 캐시 갱신
    revalidatePath("/")
    revalidatePath(`/transaction/${id}/edit`)

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
 * 거래 삭제 Server Action
 * F011: 거래 삭제
 */
export async function deleteTransactionAction(
  id: string
): Promise<ActionResult> {
  try {
    // 1. ID 검증
    const idValidation = transactionIdSchema.safeParse(id)
    if (!idValidation.success) {
      return {
        success: false,
        error: "유효하지 않은 거래 ID입니다.",
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
      .from("transactions")
      .delete()
      .eq("id", id)

    if (dbError) {
      console.error("Database error:", dbError)
      return {
        success: false,
        error: "거래 삭제에 실패했습니다. 다시 시도해주세요.",
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
