# Task 009: Server Actions 및 API 개발

## 개요

더미 데이터를 실제 Supabase 데이터베이스와 연동하기 위한 Server Actions 및 API 함수를 구현합니다. Next.js 15의 Server Actions와 Server Components를 활용하여 데이터 CRUD 작업을 처리합니다.

## 관련 기능

- **F001**: 매출 입력
- **F002**: 매입 입력
- **F003**: 거래 조회
- **F004**: 기간별 조회
- **F007**: 반복 거래 등록
- **F010**: 거래 수정
- **F011**: 거래 삭제
- **F013**: 반복 거래 관리

## 구현 단계

### 1단계: Transaction Server Actions 생성

- [ ] `app/actions/transactions.ts` 파일 생성
  - `createTransactionAction`: 거래 생성 (매출/매입)
  - `updateTransactionAction`: 거래 수정
  - `deleteTransactionAction`: 거래 삭제
  - 모든 액션에 Zod validation 적용
  - 에러 핸들링 및 사용자 친화적 메시지
  - RLS 정책에 의한 자동 user_id 필터링

#### createTransactionAction 스펙

```typescript
interface ActionResult {
  success: boolean
  error?: string
  data?: { id: string }
}

export async function createTransactionAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>
```

**검증 규칙:**

- amount: 양수, 필수
- date: 유효한 날짜, 필수
- type: 'income' | 'expense', 필수
- memo: 최대 50자, 선택사항

**동작:**

1. FormData에서 데이터 추출
2. Zod schema로 서버사이드 검증
3. Supabase client 생성 및 user 확인
4. transactions 테이블에 INSERT
5. 성공 시 revalidatePath('/') 호출
6. redirect('/')로 홈 화면 이동

#### updateTransactionAction 스펙

```typescript
export async function updateTransactionAction(
  id: string,
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>
```

**검증 규칙:** createTransactionAction과 동일

**동작:**

1. 거래 ID와 FormData 검증
2. RLS에 의해 본인 거래만 UPDATE 가능
3. 성공 시 revalidatePath('/') 및 revalidatePath(`/transaction/${id}/edit`)
4. redirect('/')로 홈 화면 이동

#### deleteTransactionAction 스펙

```typescript
export async function deleteTransactionAction(id: string): Promise<ActionResult>
```

**동작:**

1. 거래 ID 검증
2. RLS에 의해 본인 거래만 DELETE 가능
3. 성공 시 revalidatePath('/')
4. redirect('/')로 홈 화면 이동

### 2단계: Transaction Query Functions 생성

- [ ] `lib/queries/transactions.ts` 파일 생성
  - `getTransactionsByPeriod`: 기간별 거래 조회
  - `getTransactionById`: 단일 거래 조회
  - `getRecentTransactions`: 최근 거래 N개 조회

#### getTransactionsByPeriod 스펙

```typescript
export async function getTransactionsByPeriod(
  period: "daily" | "weekly" | "monthly",
  date: Date
): Promise<Transaction[]>
```

**동작:**

- daily: 해당 날짜의 거래
- weekly: 해당 주(월~일) 거래
- monthly: 해당 월의 거래
- date 기준 내림차순 정렬
- RLS에 의해 자동으로 본인 거래만 조회

#### getTransactionById 스펙

```typescript
export async function getTransactionById(
  id: string
): Promise<Transaction | null>
```

**동작:**

- 단일 거래 조회
- 존재하지 않거나 권한 없으면 null 반환

### 3단계: Summary Calculation Functions 생성

- [ ] `lib/queries/summaries.ts` 파일 생성
  - `getSummaryByPeriod`: 기간별 요약 계산
  - `updateDailySummary`: 일일 요약 업데이트 (트리거용)

#### getSummaryByPeriod 스펙

```typescript
interface PeriodSummary {
  total_income: number
  total_expense: number
  net_profit: number
  transaction_count: number
}

export async function getSummaryByPeriod(
  period: "daily" | "weekly" | "monthly",
  date: Date
): Promise<PeriodSummary>
```

**동작:**

- transactions 테이블에서 집계 쿼리 실행
- SUM(amount) WHERE type = 'income'
- SUM(amount) WHERE type = 'expense'
- net_profit = total_income - total_expense
- COUNT(\*) for transaction_count

### 4단계: Recurring Transaction Server Actions 생성

- [ ] `app/actions/recurring-transactions.ts` 파일 생성
  - `createRecurringTransactionAction`: 반복 거래 생성
  - `updateRecurringTransactionAction`: 반복 거래 수정
  - `deleteRecurringTransactionAction`: 반복 거래 삭제
  - `toggleRecurringTransactionAction`: 활성화/비활성화 토글

#### createRecurringTransactionAction 스펙

```typescript
export async function createRecurringTransactionAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>
```

**검증 규칙:**

- amount: 양수, 필수
- type: 'income' | 'expense', 필수
- frequency: 'weekly' | 'monthly', 필수
- start_date: 유효한 날짜, 필수
- end_date: start_date 이후 날짜, 선택사항
- memo: 최대 100자, 선택사항

#### toggleRecurringTransactionAction 스펙

```typescript
export async function toggleRecurringTransactionAction(
  id: string,
  isActive: boolean
): Promise<ActionResult>
```

**동작:**

- is_active 필드만 업데이트
- revalidatePath('/settings')

### 5단계: Recurring Transaction Query Functions 생성

- [ ] `lib/queries/recurring-transactions.ts` 파일 생성
  - `getActiveRecurringTransactions`: 활성 반복 거래 조회
  - `getAllRecurringTransactions`: 전체 반복 거래 조회

### 6단계: 폼 컴포넌트와 Server Actions 연결

- [ ] `components/transaction/transaction-form.tsx` 수정
  - useActionState로 createTransactionAction/updateTransactionAction 연결
  - 서버 에러를 폼 필드에 표시
  - isPending 상태로 로딩 UI 처리

- [ ] `app/income/new/page.tsx` 수정
  - 더미 핸들러 제거
  - TransactionForm에 type="income" 전달

- [ ] `app/expense/new/page.tsx` 수정
  - 더미 핸들러 제거
  - TransactionForm에 type="expense" 전달

- [ ] `app/transaction/[id]/edit/page.tsx` 수정
  - getTransactionById로 실제 데이터 조회
  - 더미 데이터 제거

### 7단계: 대시보드 페이지 실제 데이터 연결

- [ ] `app/page.tsx` 수정
  - getTransactionsByPeriod로 거래 목록 조회
  - getSummaryByPeriod로 요약 데이터 조회
  - 더미 데이터 제거

- [ ] `components/dashboard/dashboard-client.tsx` 수정 (필요시)
  - 서버에서 받은 데이터를 props로 전달
  - 클라이언트 상태 관리 (period tab)

### 8단계: 설정 페이지 실제 데이터 연결

- [ ] `app/settings/page.tsx` 수정
  - getAllRecurringTransactions로 반복 거래 조회
  - toggleRecurringTransactionAction과 연결
  - 더미 데이터 제거

### 9단계: 통합 테스트

- [ ] Playwright MCP를 활용한 E2E 테스트
  - 매출 입력 → 저장 → 대시보드 반영 확인
  - 매입 입력 → 저장 → 대시보드 반영 확인
  - 거래 수정 → 저장 → 변경사항 반영 확인
  - 거래 삭제 → 대시보드에서 사라짐 확인
  - 기간 탭 전환 → 데이터 필터링 확인
  - 반복 거래 토글 → 활성화/비활성화 확인

## 수락 기준

- [ ] 모든 Server Actions가 Zod validation 포함
- [ ] RLS 정책에 의해 본인 데이터만 접근 가능
- [ ] 에러 발생 시 사용자 친화적 메시지 표시
- [ ] 성공 시 적절한 페이지로 redirect
- [ ] revalidatePath로 캐시 갱신 처리
- [ ] TypeScript 타입 안전성 보장
- [ ] `pnpm check-all` 통과
- [ ] `pnpm build` 성공
- [ ] Playwright 테스트 모두 통과

## 에러 핸들링 전략

### Server Action 에러 처리

```typescript
try {
  // DB operation
  const { data, error } = await supabase.from('transactions').insert(...)

  if (error) {
    console.error('Database error:', error)
    return {
      success: false,
      error: '거래 저장에 실패했습니다. 다시 시도해주세요.',
    }
  }

  return { success: true, data }
} catch (error) {
  console.error('Unexpected error:', error)
  return {
    success: false,
    error: '예상치 못한 오류가 발생했습니다.',
  }
}
```

### 인증 에러 처리

```typescript
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
```

## 참고 자료

- PRD: `/docs/PRD.md` - Server Actions 요구사항
- Next.js 15: `/docs/guides/nextjs-15.md` - Server Actions 패턴
- Forms: `/docs/guides/forms-react-hook-form.md` - 폼 처리 가이드
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
