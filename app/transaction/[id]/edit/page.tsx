import { Suspense } from "react"
import { notFound } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { TransactionForm } from "@/components/transaction/transaction-form"
import { getTransactionById } from "@/lib/queries/transactions"
import type { TransactionFormData } from "@/lib/schemas/transaction"

interface EditTransactionPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * 거래 수정 화면
 * Task 006 - 거래 수정 UI 구현
 * Phase 3 - 실제 데이터베이스 연동 완료
 */

async function EditTransactionContent({ id }: { id: string }) {
  // 데이터베이스에서 거래 조회
  const transaction = await getTransactionById(id)

  // 거래가 없으면 404
  if (!transaction) {
    notFound()
  }

  // TransactionForm에 전달할 초기 데이터
  const initialData: TransactionFormData = {
    type: transaction.type,
    amount: transaction.amount,
    date: transaction.date,
    memo: transaction.memo || "",
  }

  return (
    <TransactionForm
      mode="edit"
      type={transaction.type}
      transactionId={transaction.id}
      initialData={initialData}
    />
  )
}

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params

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
          <h1 className="text-2xl font-bold">거래 수정</h1>
        </div>

        {/* 수정 폼 */}
        <Suspense fallback={<div>Loading...</div>}>
          <EditTransactionContent id={id} />
        </Suspense>
      </div>
      <BottomNav />
    </AppLayout>
  )
}
