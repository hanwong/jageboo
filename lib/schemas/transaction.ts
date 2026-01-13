/**
 * 거래(Transaction) 관련 Zod 스키마
 */

import { z } from "zod"

/**
 * 거래 타입 스키마
 */
export const transactionTypeSchema = z.enum(["income", "expense"], {
  message: "거래 유형은 '매출' 또는 '매입'이어야 합니다",
})

/**
 * 매출/매입 입력 폼 스키마
 * F001, F002: 빠른 매출/매입 입력
 */
export const transactionFormSchema = z.object({
  type: transactionTypeSchema,
  amount: z
    .number({
      error: issue =>
        issue.input === undefined
          ? "금액을 입력해주세요"
          : "유효한 금액을 입력해주세요",
    })
    .positive({ error: "금액은 0보다 커야 합니다" })
    .max(99999999.99, { error: "금액이 너무 큽니다 (최대 9,999만원)" }),
  date: z.date({
    error: issue =>
      issue.input === undefined
        ? "날짜를 선택해주세요"
        : "유효한 날짜를 선택해주세요",
  }),
  memo: z
    .string()
    .max(50, { error: "메모는 최대 50자까지 입력 가능합니다" })
    .optional()
    .nullable(),
})

/**
 * 거래 수정 폼 스키마
 * F010: 거래 수정
 */
export const transactionUpdateSchema = z.object({
  amount: z
    .number({
      error: "유효한 금액을 입력해주세요",
    })
    .positive({ error: "금액은 0보다 커야 합니다" })
    .max(99999999.99, { error: "금액이 너무 큽니다 (최대 9,999만원)" })
    .optional(),
  date: z
    .date({
      error: "유효한 날짜를 선택해주세요",
    })
    .optional(),
  memo: z
    .string()
    .max(50, { error: "메모는 최대 50자까지 입력 가능합니다" })
    .optional()
    .nullable(),
})

/**
 * 거래 ID 스키마 (URL 파라미터 검증용)
 */
export const transactionIdSchema = z
  .string()
  .uuid("유효하지 않은 거래 ID입니다")

/**
 * 타입 추론
 */
export type TransactionFormData = z.infer<typeof transactionFormSchema>
export type TransactionUpdateData = z.infer<typeof transactionUpdateSchema>
