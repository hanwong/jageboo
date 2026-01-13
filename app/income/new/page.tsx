import { AppLayout } from "@/components/layout/app-layout"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionForm } from "@/components/transaction/transaction-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Suspense } from "react"

/**
 * 매출 입력 화면
 * Task 005 - 매출 입력 폼 구현 (더미 데이터)
 * Phase 3에서 실제 데이터베이스 연동 예정
 */
export default function NewIncomePage() {
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
          <h1 className="text-2xl font-bold">매출 입력</h1>
        </div>

        {/* 입력 폼 영역 */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>빠른 매출 기록</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <TransactionForm type="income" />
            </Suspense>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </AppLayout>
  )
}
