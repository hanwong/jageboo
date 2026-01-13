# Task 005: 매출/매입 입력 화면 UI 구현

## 개요

매출과 매입을 빠르게 입력할 수 있는 화면을 구현합니다. 5초 이내 입력을 목표로 금액 입력에 자동 포커스되며, 날짜는 오늘로 기본 설정됩니다. 메모는 선택사항이며, 입력 완료 후 홈 화면으로 자동 리디렉션됩니다.

## 관련 기능

- **F001**: 빠른 매출 입력 (금액만 입력하면 자동 저장)
- **F002**: 빠른 매입 입력 (금액만 입력하면 자동 저장)
- **F012**: 메모 추가 (선택사항, 최대 50자)

## 구현 단계

### 1단계: 공통 컴포넌트 구현

- [x] `components/common/date-picker.tsx` 생성
  - shadcn/ui의 Calendar, Popover 사용
  - 오늘 날짜 기본값
  - 날짜 선택 시 포맷팅 (yyyy년 M월 d일 (EEE))
  - 모바일 친화적 UI
  - 날짜 선택 시 자동으로 팝오버 닫힘

### 2단계: TransactionForm 컴포넌트 구현

- [x] `components/transaction/transaction-form.tsx` 생성
  - React Hook Form + Zod 검증
  - type prop으로 매출/매입 구분
  - 금액 입력 필드 (숫자 키패드, 자동 포커스)
  - 날짜 선택 필드 (오늘 날짜 기본값)
  - 메모 입력 필드 (선택사항, 최대 50자, Textarea 사용)
  - 저장/취소 버튼
  - 더미 데이터 저장 (Phase 3에서 실제 Server Action 연동)
  - 저장 성공 시 홈으로 리디렉션

### 3단계: 매출 입력 페이지 구현

- [x] `app/income/new/page.tsx` 업데이트
  - TransactionForm 컴포넌트 사용 (type="income")
  - 페이지 헤더 (뒤로가기 버튼 포함)
  - 매출 입력 타이틀
  - 모바일 최적화 레이아웃
  - Suspense 경계 추가 (new Date() 처리)

### 4단계: 매입 입력 페이지 구현

- [x] `app/expense/new/page.tsx` 업데이트
  - TransactionForm 컴포넌트 사용 (type="expense")
  - 페이지 헤더 (뒤로가기 버튼 포함)
  - 매입 입력 타이틀
  - 모바일 최적화 레이아웃
  - Suspense 경계 추가 (new Date() 처리)

### 5단계: 사용성 개선

- [x] 금액 입력 필드 자동 포커스
- [x] 숫자 키패드 최적화 (inputMode="numeric")
- [x] 입력 중 에러 메시지 표시
- [x] 저장 중 로딩 상태 표시 (isSubmitting)
- [ ] 천단위 콤마 실시간 표시 (Phase 3에서 구현 예정)
- [ ] 저장 성공 후 토스트 메시지 (Phase 3에서 구현 예정)

## 수락 기준

- [x] 매출 입력 페이지가 정상 작동함
- [x] 매입 입력 페이지가 정상 작동함
- [x] 금액 입력 필드에 자동 포커스됨
- [x] 날짜 기본값이 오늘로 설정됨
- [x] 메모는 선택사항이며 최대 50자 제한됨
- [x] 저장 버튼 클릭 시 홈 화면으로 리디렉션됨
- [x] 취소 버튼 클릭 시 홈 화면으로 이동함
- [x] 모바일 화면에서 레이아웃이 정상 표시됨
- [x] `pnpm check-all` 통과
- [x] `pnpm build` 성공

## 테스트 체크리스트

> 이 작업은 UI 구현이므로 시각적 테스트 위주

- [ ] 페이지 진입 시 금액 입력 필드에 포커스되는지 확인
- [ ] 금액 입력 시 숫자 키패드가 표시되는지 확인
- [ ] 날짜 선택기가 정상 작동하는지 확인
- [ ] 메모 입력이 50자로 제한되는지 확인
- [ ] 필수 항목 누락 시 에러 메시지가 표시되는지 확인
- [ ] 저장 버튼 클릭 시 홈으로 이동하는지 확인
- [ ] 취소 버튼 클릭 시 홈으로 이동하는지 확인
- [ ] 모바일 화면에서 UI가 깨지지 않는지 확인

## 변경 사항 요약

### 생성된 파일

- `components/transaction/transaction-form.tsx` - React Hook Form 기반 거래 입력 폼

### 수정된 파일

- `components/common/date-picker.tsx` - 상태 관리 추가, 날짜 선택 시 자동 닫힘
- `app/income/new/page.tsx` - TransactionForm 사용, Suspense 추가
- `app/expense/new/page.tsx` - TransactionForm 사용, Suspense 추가
- `lib/schemas/transaction.ts` - Zod v3 문법 적용
- `lib/schemas/recurring-transaction.ts` - Zod v3 문법 적용

### 설치된 패키지

- `react-hook-form@^7.71.0` - 폼 상태 관리
- `@hookform/resolvers@^5.2.2` - Zod 통합
- `zod@^3.25.76` - 스키마 검증 (v4에서 v3으로 다운그레이드)

### 주요 이슈 해결

1. **Zod v4 호환성 문제**: @hookform/resolvers와 호환되지 않아 v3으로 다운그레이드
2. **Zod v3 문법 변경**: `error` 속성을 `message`, `required_error`, `invalid_type_error`로 변경
3. **Next.js 15 Suspense 필요**: `new Date()` 사용으로 인한 prerender 오류 - Suspense 경계 추가로 해결

### 구현된 기능

- 금액 입력 자동 포커스
- 숫자 키패드 최적화 (inputMode="numeric")
- 날짜 기본값 오늘로 설정
- 메모 입력 (선택사항, 최대 50자)
- 실시간 유효성 검증 (onChange 모드)
- 저장/취소 기능
- 저장 후 홈으로 리디렉션

## 참고 자료

- PRD: `/docs/PRD.md` - 매출/매입 입력 화면 상세 기능
- 폼 처리 가이드: `/docs/guides/forms-react-hook-form.md`
- 컴포넌트 패턴: `/docs/guides/component-patterns.md`
