# Task 008: Supabase 데이터베이스 구축 ✅ 완료

## 개요

Supabase PostgreSQL 데이터베이스에 필요한 테이블들을 생성하고, Row Level Security (RLS) 정책을 설정합니다.

**상태**: 데이터베이스가 이미 완전히 구축되어 있음을 확인했습니다.

## 관련 기능

- **전체 기능**: 모든 데이터 저장 및 조회

## 구현 단계

### 1단계: Transaction 테이블 생성

- [x] Transaction 테이블 마이그레이션 작성
  - id: UUID (PK)
  - user_id: UUID (FK → auth.users)
  - type: TEXT ('income' | 'expense')
  - amount: DECIMAL(10, 2)
  - date: DATE
  - memo: VARCHAR(50), nullable
  - created_at: TIMESTAMPTZ
  - updated_at: TIMESTAMPTZ
  - 인덱스: user_id, date, type

### 2단계: RecurringTransaction 테이블 생성

- [x] RecurringTransaction 테이블 마이그레이션 작성
  - id: UUID (PK)
  - user_id: UUID (FK → auth.users)
  - type: TEXT ('income' | 'expense')
  - amount: DECIMAL(10, 2)
  - memo: VARCHAR(100), nullable
  - frequency: TEXT ('weekly' | 'monthly')
  - start_date: DATE
  - end_date: DATE, nullable
  - last_generated_at: DATE, nullable
  - is_active: BOOLEAN (default: true)
  - created_at: TIMESTAMPTZ
  - updated_at: TIMESTAMPTZ
  - 인덱스: user_id, is_active

### 3단계: DailySummary 테이블 생성

- [x] DailySummary 테이블 마이그레이션 작성
  - id: UUID (PK)
  - user_id: UUID (FK → auth.users)
  - date: DATE (UNIQUE per user)
  - total_income: DECIMAL(10, 2)
  - total_expense: DECIMAL(10, 2)
  - net_profit: DECIMAL(10, 2)
  - updated_at: TIMESTAMPTZ
  - UNIQUE 제약조건: (user_id, date)
  - 인덱스: user_id, date

### 4단계: RLS (Row Level Security) 정책 설정

- [x] Transaction 테이블 RLS 정책
  - SELECT: 사용자는 본인 거래만 조회 가능
  - INSERT: 사용자는 본인 거래만 생성 가능
  - UPDATE: 사용자는 본인 거래만 수정 가능
  - DELETE: 사용자는 본인 거래만 삭제 가능

- [x] RecurringTransaction 테이블 RLS 정책
  - SELECT: 사용자는 본인 반복 거래만 조회 가능
  - INSERT: 사용자는 본인 반복 거래만 생성 가능
  - UPDATE: 사용자는 본인 반복 거래만 수정 가능
  - DELETE: 사용자는 본인 반복 거래만 삭제 가능

- [x] DailySummary 테이블 RLS 정책
  - SELECT: 사용자는 본인 요약 데이터만 조회 가능
  - INSERT/UPDATE/DELETE: 사용자가 본인 요약 데이터만 수정 가능

### 5단계: 인덱스 확인

- [x] transactions 테이블 인덱스 (user_id, date, type, composite)
- [x] daily_summaries 테이블 인덱스 (user_id, date, UNIQUE constraint)
- [x] recurring_transactions 테이블 인덱스 (user_id, is_active, frequency)

## 수락 기준

- [x] 모든 테이블이 정상 생성됨
- [x] RLS 정책이 올바르게 설정됨
- [x] 인덱스가 생성되어 쿼리 성능 보장됨
- [x] Supabase Studio에서 테이블 확인 가능
- [x] TypeScript 타입이 데이터베이스 스키마와 일치함

## 검증 결과

✅ **3개 테이블 모두 정상 생성됨**

- transactions (8개 컬럼)
- daily_summaries (7개 컬럼)
- recurring_transactions (12개 컬럼)

✅ **RLS 정책 완벽 설정**

- 모든 테이블에 SELECT, INSERT, UPDATE, DELETE 정책 설정
- auth.uid() = user_id 조건으로 본인 데이터만 접근 가능

✅ **인덱스 최적화 완료**

- 15개 인덱스 생성 (PK 포함)
- 복합 인덱스 및 DESC 정렬 인덱스 설정
- UNIQUE 제약조건 (daily_summaries.user_id, date)

## 참고 자료

- PRD: `/docs/PRD.md` - 데이터베이스 요구사항
- 타입 정의: `lib/types/database.ts`
- Supabase RLS 문서: https://supabase.com/docs/guides/auth/row-level-security
