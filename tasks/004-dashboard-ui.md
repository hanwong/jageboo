# Task 004: 홈 화면 (대시보드) UI 구현

## 개요

홈 화면의 모든 UI 요소를 더미 데이터를 활용하여 완성합니다. 영업이익 대형 표시, 당일 요약 카드, 기간 탭, 거래 내역 리스트를 포함하며, 하단에는 빠른 입력을 위한 +매출/+매입 버튼을 배치합니다.

## 관련 기능

- **F003**: 실시간 영업이익 계산 (더미 데이터로 표시)
- **F004**: 당일 거래 요약 (더미 데이터로 표시)
- **F005**: 주간/월간 요약 (기간 탭 UI)
- **F006**: 거래 내역 목록 (더미 데이터로 표시)
- **F011**: 거래 삭제 (UI만, 실제 동작은 Phase 3)

## 구현 단계

### 1단계: 더미 데이터 타입 및 상수 정의

- [x] `lib/constants/dummy-data.ts` 생성
- [x] Transaction 타입에 맞는 더미 거래 데이터 배열 정의
- [x] 당일, 주간, 월간 요약 계산 함수 작성 (더미 데이터 기반)
- [x] 기간별 필터링 유틸리티 함수 작성

### 2단계: Dashboard 컴포넌트 구현

- [x] `components/dashboard/profit-display.tsx` 생성
  - 영업이익을 큰 글씨로 표시
  - 금액 포맷팅 (천단위 콤마)
  - 양수는 초록색, 음수는 빨간색 표시
- [x] `components/dashboard/summary-card.tsx` 수정
  - 매출/매입/영업이익 카드 컴포넌트
  - 아이콘 포함 (Lucide React 사용)
  - 금액 포맷팅
- [x] `components/dashboard/period-tabs.tsx` 수정
  - 오늘/이번주/이번달 탭 UI
  - 선택된 탭 하이라이트
  - 탭 전환 이벤트 핸들러

### 3단계: Transaction 컴포넌트 구현

- [x] `components/transaction/transaction-card.tsx` 수정
  - 단일 거래 카드 UI
  - 매출(income)/매입(expense) 구분 표시
  - 날짜, 금액, 메모 표시
  - 스와이프 또는 삭제 버튼 UI (실제 동작은 Phase 3)
- [x] `components/transaction/transaction-list.tsx` 생성
  - 거래 카드 리스트 컴포넌트
  - 최신순 정렬
  - 빈 상태(Empty State) UI

### 4단계: 홈 페이지 통합

- [x] `app/page.tsx` 업데이트
  - ProfitDisplay 컴포넌트 배치
  - SummaryCard 3개 배치 (매출, 매입, 영업이익)
  - PeriodTabs 컴포넌트 배치
  - TransactionList 컴포넌트 배치
  - 더미 데이터를 props로 전달
  - 기간 탭 선택에 따라 데이터 필터링
- [x] 하단 고정 +매출/+매입 버튼 (BottomNav에서 이미 구현됨)
- [x] 모바일 퍼스트 반응형 레이아웃 적용

### 5단계: 스타일링 및 모바일 최적화

- [x] TailwindCSS로 모바일 퍼스트 반응형 디자인 적용
- [x] 터치 친화적 버튼 크기 (최소 44x44px)
- [x] 금액 표시 가독성 향상 (큰 폰트, 명확한 색상)
- [x] 스크롤 영역 최적화

## 수락 기준

- [x] 모든 UI 컴포넌트가 더미 데이터로 정상 표시됨
- [x] 기간 탭 전환 시 데이터가 정확히 필터링됨
- [x] 모바일 화면에서 모든 요소가 정상 표시됨
- [x] 하단 고정 버튼이 스크롤과 무관하게 항상 표시됨
- [x] `pnpm check-all` 통과
- [x] `pnpm build` 성공

## 테스트 체크리스트

> 이 작업은 UI 구현이므로 시각적 테스트 위주

- [ ] 영업이익이 큰 글씨로 명확히 표시되는지 확인
- [ ] 매출/매입/영업이익 카드가 정확히 표시되는지 확인
- [ ] 기간 탭 전환 시 데이터가 변경되는지 확인
- [ ] 거래 내역이 최신순으로 정렬되어 표시되는지 확인
- [ ] 빈 거래 내역일 때 Empty State가 표시되는지 확인
- [ ] 모바일 화면에서 레이아웃이 깨지지 않는지 확인

## 변경 사항 요약

### 생성된 파일

- `lib/constants/dummy-data.ts` - 더미 거래 데이터 및 유틸리티 함수
- `components/dashboard/profit-display.tsx` - 영업이익 대형 표시 컴포넌트
- `components/dashboard/dashboard-client.tsx` - 대시보드 클라이언트 컴포넌트 (상태 관리)
- `components/transaction/transaction-list.tsx` - 거래 목록 컴포넌트

### 수정된 파일

- `components/dashboard/summary-card.tsx` - formatCurrency 사용하도록 수정
- `components/dashboard/period-tabs.tsx` - Period 타입 통합 (today/week/month)
- `components/transaction/transaction-card.tsx` - formatCurrency, formatDate 사용하도록 수정
- `app/page.tsx` - 서버 컴포넌트로 변경, DashboardClient 사용
- `app/auth/login/page.tsx` - Suspense로 LoginForm 감싸기 (빌드 에러 수정)
- `app/transaction/[id]/edit/page.tsx` - generateStaticParams 추가 (빌드 에러 수정)

### 주요 기능

- ✅ 영업이익 대형 표시 (양수=초록, 음수=빨강)
- ✅ 당일 매출/매입/영업이익 요약 카드
- ✅ 기간 탭 (오늘/이번주/이번달) 전환 기능
- ✅ 거래 내역 리스트 (최신순 정렬)
- ✅ 빈 상태 UI
- ✅ 더미 데이터 기반 모든 UI 동작
- ✅ 모바일 퍼스트 반응형 디자인
- ✅ `pnpm build` 성공

## 참고 자료

- PRD: `/docs/PRD.md` - 홈 화면 상세 기능
- 스타일링 가이드: `/docs/guides/styling-guide.md`
- 컴포넌트 패턴: `/docs/guides/component-patterns.md`
