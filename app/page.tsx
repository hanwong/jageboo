import { AppLayout } from "@/components/layout/app-layout"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * 홈 화면 (대시보드)
 * Task 001 - 빈 껍데기 구현
 * Phase 2에서 실제 UI 구현 예정
 */
export default function Home() {
  return (
    <AppLayout>
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center">대시보드</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>영업이익 표시 영역</p>
              <p className="mt-2">(Phase 2에서 구현 예정)</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </AppLayout>
  )
}
