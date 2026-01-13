# Task 013: 사용자 경험 향상

## 개요

사용자가 앱을 더 쉽고 편하게 사용할 수 있도록 UX를 개선합니다. 토스트 알림, 빈 상태 UI, 로딩 상태 개선 등을 포함합니다.

## 관련 기능

- **F001-F002**: 매출/매입 입력 완료 시 피드백
- **F006**: 거래 내역 빈 상태 처리
- **F010-F011**: 거래 수정/삭제 피드백
- **F013**: 반복 거래 관리 피드백

## 구현 단계

### 1단계: 토스트 알림 시스템 구축

- [x] shadcn/ui Toast 컴포넌트 설치 (sonner 사용)
- [x] Toast Provider 설정 (root layout)
- [x] useToast 훅 사용 가능하도록 설정

#### 토스트 알림 추가 위치

**거래 관련:**

- [x] 거래 생성 성공 시: "거래가 저장되었습니다"
- [x] 거래 수정 성공 시: "거래가 수정되었습니다"
- [x] 거래 삭제 성공 시: "거래가 삭제되었습니다"
- [x] 반복 거래 생성 성공 시: "반복 거래가 등록되었습니다"

**반복 거래 관련:**

- [x] 반복 거래 활성화: "반복 거래가 활성화되었습니다"
- [x] 반복 거래 비활성화: "반복 거래가 비활성화되었습니다"
- [ ] 반복 거래 삭제: "반복 거래가 삭제되었습니다" (미구현 - 삭제 기능 없음)

**에러:**

- [x] 네트워크 에러: Server Actions에서 toast.error() 사용
- [x] 권한 에러: Server Actions에서 toast.error() 사용

### 2단계: 빈 상태 UI 구현

- [x] `components/common/empty-state.tsx` 생성
  - 아이콘 (lucide-react)
  - 제목 및 설명 텍스트
  - 액션 버튼 (선택사항)
  - 재사용 가능한 컴포넌트

#### 빈 상태 적용 위치

**거래 목록 (TransactionList):**

- [x] EmptyState 컴포넌트 적용
- [x] [매출 입력] [매입 입력] 버튼

**반복 거래 목록 (RecurringTransactionList):**

- [x] EmptyState 컴포넌트 적용
- [x] [거래 입력하러 가기] 버튼

### 3단계: 로딩 상태 개선

- [x] 스켈레톤 UI 컴포넌트 생성
  - `components/dashboard/summary-card-skeleton.tsx`
  - `components/dashboard/profit-display-skeleton.tsx`
  - `components/transaction/transaction-card-skeleton.tsx`
  - `components/recurring/recurring-transaction-card-skeleton.tsx`
- [x] Suspense fallback을 스켈레톤으로 교체
  - 대시보드 로딩
  - 설정 페이지 로딩

#### 스켈레톤 적용 위치

- [x] 대시보드: ProfitDisplay, SummaryCard, TransactionList 스켈레톤
- [x] 설정 페이지: RecurringTransactionList 스켈레톤
- [ ] 거래 수정 페이지: TransactionForm 스켈레톤 (선택사항 - 로딩 속도 빠름)

### 4단계: 입력 속도 최적화

- [x] AmountInput 자동 포커스 유지
- [x] 키보드 Enter로 폼 제출 가능하도록 (기본 HTML form 동작)
- [x] 날짜 기본값: 오늘 날짜로 자동 설정
- [x] 메모 필드 선택사항 명확화

**목표: 5초 안에 거래 입력 완료**

1. 금액 입력 (자동 포커스)
2. Enter 키 또는 저장 버튼
3. 완료

### 5단계: 확인 다이얼로그 개선

- [ ] 삭제 다이얼로그에 거래 정보 표시
  - "₩50,000 거래를 삭제하시겠습니까?"
  - 금액과 메모 표시
- [ ] 취소 버튼 기본 포커스
- [ ] ESC 키로 다이얼로그 닫기

### 6단계: 오프라인 상태 표시 (선택사항)

- [ ] 네트워크 상태 감지
- [ ] 오프라인 시 상단 배너 표시
  - "인터넷에 연결되어 있지 않습니다"
  - 자동으로 사라지는 알림
- [ ] 오프라인 상태에서 저장 시도 시 안내

## 수락 기준

- [x] 모든 성공 작업에 토스트 알림 표시
- [x] 빈 상태 UI가 모든 목록에 적용
- [x] 로딩 상태가 스켈레톤으로 표시
- [x] 거래 입력이 5초 이내 가능 (자동 포커스 + Enter 키 지원)
- [ ] 삭제 다이얼로그에 거래 정보 표시 (선택사항 - 향후 개선)
- [x] `pnpm check-all` 통과
- [x] `pnpm build` 성공

## 참고 자료

- shadcn/ui Toast: https://ui.shadcn.com/docs/components/toast
- shadcn/ui Skeleton: https://ui.shadcn.com/docs/components/skeleton
- 빈 상태 디자인 패턴: https://www.nngroup.com/articles/empty-state-design/
