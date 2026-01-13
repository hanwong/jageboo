/**
 * 반복 거래(RecurringTransaction) 관련 Zod 스키마
 */

import { z } from "zod"
import { transactionTypeSchema } from "./transaction"

/**
 * 반복 주기 타입 스키마
 */
export const frequencyTypeSchema = z.enum(["weekly", "monthly"], {
  message: "반복 주기는 '주간' 또는 '월간'이어야 합니다",
})

/**
 * 반복 거래 등록 폼 스키마
 * F007: 반복 거래 등록
 */
export const recurringTransactionFormSchema = z
  .object({
    type: transactionTypeSchema,
    amount: z
      .number({
        required_error: "금액을 입력해주세요",
        invalid_type_error: "유효한 금액을 입력해주세요",
      })
      .positive({ message: "금액은 0보다 커야 합니다" })
      .max(99999999.99, { message: "금액이 너무 큽니다 (최대 9,999만원)" }),
    memo: z
      .string()
      .max(100, { message: "메모는 최대 100자까지 입력 가능합니다" })
      .optional()
      .nullable(),
    frequency: frequencyTypeSchema,
    start_date: z.date({
      required_error: "시작일을 선택해주세요",
      invalid_type_error: "유효한 날짜를 선택해주세요",
    }),
    end_date: z
      .date({
        invalid_type_error: "유효한 날짜를 선택해주세요",
      })
      .optional()
      .nullable(),
  })
  .refine(
    data => {
      // 종료일이 있는 경우, 시작일보다 미래여야 함
      if (data.end_date) {
        return data.end_date > data.start_date
      }
      return true
    },
    {
      message: "종료일은 시작일보다 이후여야 합니다",
      path: ["end_date"],
    }
  )

/**
 * 반복 거래 수정 폼 스키마
 * F013: 반복 거래 관리
 */
export const recurringTransactionUpdateSchema = z
  .object({
    amount: z
      .number({
        invalid_type_error: "유효한 금액을 입력해주세요",
      })
      .positive({ message: "금액은 0보다 커야 합니다" })
      .max(99999999.99, { message: "금액이 너무 큽니다 (최대 9,999만원)" })
      .optional(),
    memo: z
      .string()
      .max(100, { message: "메모는 최대 100자까지 입력 가능합니다" })
      .optional()
      .nullable(),
    frequency: frequencyTypeSchema.optional(),
    start_date: z
      .date({
        invalid_type_error: "유효한 날짜를 선택해주세요",
      })
      .optional(),
    end_date: z
      .date({
        invalid_type_error: "유효한 날짜를 선택해주세요",
      })
      .optional()
      .nullable(),
  })
  .refine(
    data => {
      // 시작일과 종료일이 모두 있는 경우, 종료일이 시작일보다 미래여야 함
      if (data.start_date && data.end_date) {
        return data.end_date > data.start_date
      }
      return true
    },
    {
      message: "종료일은 시작일보다 이후여야 합니다",
      path: ["end_date"],
    }
  )

/**
 * 반복 거래 ID 스키마 (URL 파라미터 검증용)
 */
export const recurringTransactionIdSchema = z
  .string()
  .uuid("유효하지 않은 반복 거래 ID입니다")

/**
 * 타입 추론
 */
export type RecurringTransactionFormData = z.infer<
  typeof recurringTransactionFormSchema
>
export type RecurringTransactionUpdateData = z.infer<
  typeof recurringTransactionUpdateSchema
>
