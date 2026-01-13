import { AppLayout } from "@/components/layout/app-layout"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface EditTransactionPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * 거래 수정 화면
 * Task 001 - 빈 껍데기 구현
 * Phase 2에서 실제 수정 폼 구현 예정
 */

export function generateStaticParams() {
  // Phase 2에서 더미 데이터 기반으로 실제 ID 반환 예정
  return [{ id: "1" }]
}

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params

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
          <h1 className="text-2xl font-bold">거래 수정</h1>
        </div>

        {/* 수정 폼 영역 */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>거래 ID: {id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>금액 수정 필드</p>
              <p>날짜 수정 필드</p>
              <p>메모 수정 필드</p>
              <p>삭제 버튼</p>
              <p className="mt-2">(Phase 2에서 구현 예정)</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </AppLayout>
  )
}
