/**
 * 데이터베이스 타입 정의
 * Supabase PostgreSQL 스키마 기반
 */

/**
 * 거래 타입 (매출/매입)
 */
export type TransactionType = "income" | "expense"

/**
 * 반복 주기 타입 (주간/월간)
 */
export type FrequencyType = "weekly" | "monthly"

/**
 * Transaction 테이블
 * 개별 매출/매입 거래 기록
 */
export interface Transaction {
  id: string // UUID
  user_id: string // FK → auth.users
  type: TransactionType
  amount: number // DECIMAL(10, 2)
  date: Date // DATE
  memo: string | null // VARCHAR(50), nullable
  created_at: Date // TIMESTAMP
  updated_at: Date // TIMESTAMP
}

/**
 * DailySummary 테이블
 * 일별 집계 캐시 (성능 최적화용)
 */
export interface DailySummary {
  id: string // UUID
  user_id: string // FK → auth.users
  date: Date // DATE (UNIQUE per user)
  total_income: number // DECIMAL(10, 2)
  total_expense: number // DECIMAL(10, 2)
  net_profit: number // DECIMAL(10, 2) - 영업이익
  updated_at: Date // TIMESTAMP
}

/**
 * RecurringTransaction 테이블
 * 반복 거래 설정 (월세, 인건비 등)
 */
export interface RecurringTransaction {
  id: string // UUID
  user_id: string // FK → auth.users
  type: TransactionType
  amount: number // DECIMAL(10, 2)
  memo: string | null // VARCHAR(100), nullable
  frequency: FrequencyType
  start_date: Date // DATE
  end_date: Date | null // DATE, nullable
  last_generated_at: Date | null // DATE, nullable
  is_active: boolean // BOOLEAN (default: true)
  created_at: Date // TIMESTAMP
  updated_at: Date // TIMESTAMP
}

/**
 * 데이터베이스 INSERT를 위한 타입 (ID와 타임스탬프 제외)
 */
export type TransactionInsert = Omit<
  Transaction,
  "id" | "created_at" | "updated_at"
>

export type DailySummaryInsert = Omit<DailySummary, "id" | "updated_at">

export type RecurringTransactionInsert = Omit<
  RecurringTransaction,
  "id" | "last_generated_at" | "created_at" | "updated_at"
>

/**
 * 데이터베이스 UPDATE를 위한 타입 (ID, user_id, 타임스탬프 제외)
 */
export type TransactionUpdate = Partial<
  Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">
>

export type DailySummaryUpdate = Partial<
  Omit<DailySummary, "id" | "user_id" | "date" | "updated_at">
>

export type RecurringTransactionUpdate = Partial<
  Omit<
    RecurringTransaction,
    "id" | "user_id" | "last_generated_at" | "created_at" | "updated_at"
  >
>
