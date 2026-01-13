"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AmountInput } from "./amount-input"
import { DatePicker } from "@/components/common/date-picker"
import {
  transactionFormSchema,
  type TransactionFormData,
} from "@/lib/schemas/transaction"
import type { TransactionType } from "@/lib/types"

interface TransactionFormProps {
  type: TransactionType
}

/**
 * 거래 입력 폼 컴포넌트
 * - React Hook Form + Zod 검증
 * - 매출/매입 공통 사용
 * - 금액 자동 포커스
 * - Phase 2: 더미 데이터만 처리 (Phase 3에서 실제 Server Action 연동)
 */
export function TransactionForm({ type }: TransactionFormProps) {
  const router = useRouter()
  const amountInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type,
      amount: undefined,
      date: new Date(), // 오늘 날짜 기본값
      memo: "",
    },
  })

  const dateValue = watch("date")

  // 금액 입력 필드 자동 포커스
  useEffect(() => {
    amountInputRef.current?.focus()
  }, [])

  // 폼 제출 핸들러 (Phase 2: 더미 처리)
  const onSubmit = async (data: TransactionFormData) => {
    try {
      // Phase 3에서 Server Action으로 실제 저장
      console.log("거래 데이터:", data)

      // 임시: 홈으로 리디렉션
      router.push("/")
    } catch (error) {
      console.error("거래 저장 실패:", error)
    }
  }

  // 취소 핸들러
  const handleCancel = () => {
    router.push("/")
  }

  // 금액 입력 핸들러 (콤마 제거 후 숫자로 변환)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "")
    const numValue = value ? Number(value) : undefined
    setValue("amount", numValue as number, { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 금액 입력 */}
      <div>
        <AmountInput
          {...register("amount", {
            onChange: handleAmountChange,
          })}
          ref={amountInputRef}
          label="금액"
          id="amount"
          placeholder="0"
          error={errors.amount?.message}
          autoComplete="off"
        />
      </div>

      {/* 날짜 선택 */}
      <div>
        <DatePicker
          date={dateValue}
          onDateChange={date => setValue("date", date as Date)}
          label="날짜"
          error={errors.date?.message}
        />
      </div>

      {/* 메모 입력 (선택사항) */}
      <div className="space-y-2">
        <Label htmlFor="memo">메모 (선택사항)</Label>
        <Textarea
          {...register("memo")}
          id="memo"
          placeholder="예: 점심 매출, 식재료 구입 등"
          maxLength={50}
          rows={3}
          className={errors.memo?.message ? "border-destructive" : ""}
        />
        {errors.memo?.message && (
          <p className="text-sm text-destructive">{errors.memo.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {watch("memo")?.length || 0}/50자
        </p>
      </div>

      {/* 버튼 그룹 */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  )
}
