import { AppLayout } from "@/components/layout/app-layout"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

/**
 * 매입 입력 화면
 * Task 001 - 빈 껍데기 구현
 * Phase 2에서 실제 입력 폼 구현 예정
 */
export default function NewExpensePage() {
  return (
    <AppLayout>
      <div className="flex min-h-screen flex-col px-6 pb-20 pt-6">
        {/* 헤더 */}
        <div className="mb-6 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">매입 입력</h1>
        </div>

        {/* 입력 폼 영역 */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>빠른 매입 기록</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>금액 입력 필드</p>
              <p>날짜 선택기</p>
              <p>메모 입력 필드</p>
              <p className="mt-2">(Phase 2에서 구현 예정)</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </AppLayout>
  )
}
