import { AppLayout } from "@/components/layout/app-layout"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

/**
 * 설정 화면
 * Task 001 - 빈 껍데기 구현
 * Phase 2에서 반복 거래 관리 UI 구현 예정
 */
export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="flex min-h-screen flex-col p-6">
        {/* 헤더 */}
        <div className="mb-6 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">설정</h1>
        </div>

        {/* 설정 섹션 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>사용자 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                <p>프로필 정보</p>
                <p>로그아웃</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>반복 거래 관리</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                <p>반복 거래 목록</p>
                <p>활성화/비활성화</p>
                <p className="mt-2">(Phase 2에서 구현 예정)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNav />
    </AppLayout>
  )
}
