/**
 * API 응답 및 Server Action 타입 정의
 */

import type {
  Transaction,
  DailySummary,
  RecurringTransaction,
} from "./database"

/**
 * 기간별 요약 타입
 */
export type PeriodType = "daily" | "weekly" | "monthly"

/**
 * 기간별 요약 데이터
 */
export interface PeriodSummary {
  period: PeriodType
  start_date: Date
  end_date: Date
  total_income: number
  total_expense: number
  net_profit: number
  transaction_count: number
}

/**
 * 거래 내역 조회 옵션
 */
export interface TransactionQueryOptions {
  user_id: string
  start_date?: Date
  end_date?: Date
  type?: "income" | "expense"
  limit?: number
  offset?: number
}

/**
 * 거래 내역 응답 (페이지네이션 포함)
 */
export interface TransactionListResponse {
  transactions: Transaction[]
  total_count: number
  has_more: boolean
}

/**
 * Server Action 응답 타입 (성공)
 */
export interface ActionSuccess<T = void> {
  success: true
  data?: T
  message?: string
}

/**
 * Server Action 응답 타입 (실패)
 */
export interface ActionError {
  success: false
  error: string
  errors?: Record<string, string[]> // Zod 검증 에러
}

/**
 * Server Action 응답 (통합)
 */
export type ActionResult<T = void> = ActionSuccess<T> | ActionError

/**
 * 거래 생성 Server Action 응답
 */
export type CreateTransactionResult = ActionResult<Transaction>

/**
 * 거래 수정 Server Action 응답
 */
export type UpdateTransactionResult = ActionResult<Transaction>

/**
 * 거래 삭제 Server Action 응답
 */
export type DeleteTransactionResult = ActionResult

/**
 * 반복 거래 생성 Server Action 응답
 */
export type CreateRecurringTransactionResult =
  ActionResult<RecurringTransaction>

/**
 * 반복 거래 수정 Server Action 응답
 */
export type UpdateRecurringTransactionResult =
  ActionResult<RecurringTransaction>

/**
 * 반복 거래 삭제 Server Action 응답
 */
export type DeleteRecurringTransactionResult = ActionResult

/**
 * 반복 거래 목록 조회 응답
 */
export interface RecurringTransactionListResponse {
  recurring_transactions: RecurringTransaction[]
  total_count: number
}

/**
 * 대시보드 요약 데이터
 */
export interface DashboardSummary {
  today: DailySummary
  week: PeriodSummary
  month: PeriodSummary
  recent_transactions: Transaction[]
}
