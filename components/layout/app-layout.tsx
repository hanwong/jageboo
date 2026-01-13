import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: React.ReactNode
  className?: string
}

/**
 * 모바일 퍼스트 앱 레이아웃
 * - 모바일: 전체 너비 사용
 * - 데스크탑: max-w-md로 중앙 고정하여 모바일 뷰 유지
 * - 하단 네비게이션을 위한 padding-bottom 설정
 */
export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* 중앙 고정 컨테이너 */}
      <div className="mx-auto max-w-md">
        {/* 메인 컨텐츠 영역 - 하단 네비게이션 높이만큼 padding */}
        <main className={cn("min-h-screen pb-20", className)}>{children}</main>
      </div>
    </div>
  )
}
