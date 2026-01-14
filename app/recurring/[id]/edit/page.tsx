import { Suspense } from "react"
import { notFound } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { TransactionForm } from "@/components/transaction/transaction-form"
import { getRecurringTransactionById } from "@/lib/queries/recurring-transactions"

interface RecurringEditPageProps {
  params: Promise<{
    id: string
  }>
}

async function EditFormContent({ id }: { id: string }) {
  const recurringTransaction = await getRecurringTransactionById(id)

  if (!recurringTransaction) {
    notFound()
  }

  return (
    <TransactionForm
      mode="recurring-edit"
      type={recurringTransaction.type}
      recurringId={id}
      initialData={{
        type: recurringTransaction.type,
        amount: recurringTransaction.amount,
        date: new Date(), // 사용하지 않지만 필수 필드
        memo: recurringTransaction.memo || "",
      }}
      recurringInitialData={{
        frequency: recurringTransaction.frequency,
        start_date: recurringTransaction.start_date,
        end_date: recurringTransaction.end_date,
      }}
    />
  )
}

export default async function RecurringEditPage({
  params,
}: RecurringEditPageProps) {
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
          <h1 className="text-2xl font-bold">반복 거래 수정</h1>
        </div>

        {/* 폼 */}
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          }
        >
          <EditFormContent id={id} />
        </Suspense>
      </div>
    </AppLayout>
  )
}
