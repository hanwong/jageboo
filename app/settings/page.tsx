import { Suspense } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SettingsClient } from "@/components/settings/settings-client"
import { getUser } from "@/app/actions/auth"

/**
 * 설정 화면
 * Task 007.5 - 반복 거래 관리 UI 구현
 * Phase 3 - 실제 데이터베이스 연동 완료
 * Phase 4 - 사용자 설정 구현
 */

async function SettingsContent() {
  // 사용자 정보 가져오기
  const user = await getUser()

  return <SettingsClient user={user} />
}

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="min-h-screen px-6 pb-24 pt-6">
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
        <Suspense
          fallback={
            <div className="space-y-4">
              {/* 사용자 설정 카드 */}
              <Card>
                <CardHeader>
                  <CardTitle>사용자 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            </div>
          }
        >
          <SettingsContent />
        </Suspense>
      </div>
      <BottomNav />
    </AppLayout>
  )
}
