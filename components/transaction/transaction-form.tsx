"use client"

import { useEffect, useRef, useState } from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AmountInput } from "./amount-input"
import { DatePicker } from "@/components/common/date-picker"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import {
  transactionFormSchema,
  type TransactionFormData,
} from "@/lib/schemas/transaction"
import type { TransactionType } from "@/lib/types"
import {
  createTransactionAction,
  updateTransactionAction,
  deleteTransactionAction,
} from "@/app/actions/transactions"
import {
  createRecurringTransactionAction,
  updateRecurringTransactionAction,
  deleteRecurringTransactionAction,
} from "@/app/actions/recurring-transactions"

interface TransactionFormProps {
  mode?: "create" | "edit" | "recurring-edit"
  type: TransactionType
  transactionId?: string
  initialData?: TransactionFormData
  // 반복 거래 수정 모드용 props
  recurringId?: string
  recurringInitialData?: {
    frequency: "weekly" | "monthly"
    start_date: Date
    end_date?: Date | null
  }
}

/**
 * 거래 입력/수정 폼 컴포넌트
 * - React Hook Form + Zod 검증
 * - 매출/매입 공통 사용
 * - Create/Edit 모드 지원
 * - 반복 거래 옵션 지원
 * - 금액 자동 포커스
 * - Server Actions 연동 (Phase 3)
 */
export function TransactionForm({
  mode = "create",
  type,
  transactionId,
  initialData,
  recurringId,
  recurringInitialData,
}: TransactionFormProps) {
  const router = useRouter()
  const amountInputRef = useRef<HTMLInputElement>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // 반복 거래 상태
  const [isRecurring, setIsRecurring] = useState(mode === "recurring-edit")
  const [frequency, setFrequency] = useState<"weekly" | "monthly">(
    recurringInitialData?.frequency || "monthly"
  )
  const [startDate, setStartDate] = useState<Date>(
    recurringInitialData?.start_date || new Date()
  )
  const [hasEndDate, setHasEndDate] = useState(!!recurringInitialData?.end_date)
  const [endDate, setEndDate] = useState<Date | undefined>(
    recurringInitialData?.end_date || undefined
  )

  // Server Action 상태 관리
  const [actionState, formAction, isPending] = useActionState(
    mode === "create"
      ? createTransactionAction
      : mode === "recurring-edit"
        ? updateRecurringTransactionAction.bind(null, recurringId || "")
        : updateTransactionAction.bind(null, transactionId || ""),
    { success: false }
  )

  // 반복 거래 생성 Server Action
  const [recurringActionState, recurringFormAction, isRecurringPending] =
    useActionState(createRecurringTransactionAction, { success: false })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: initialData || {
      type,
      amount: undefined,
      date: new Date(), // 오늘 날짜 기본값
      memo: "",
    },
  })

  const dateValue = watch("date")

  // 금액 입력 필드 자동 포커스 및 초기값 설정
  useEffect(() => {
    // 수정 모드일 때 초기 금액 설정
    if (initialData?.amount && amountInputRef.current) {
      amountInputRef.current.value = initialData.amount.toLocaleString("ko-KR")
    }
    amountInputRef.current?.focus()
  }, [initialData])

  // 서버 에러를 폼 필드에 반영 (일반 거래)
  useEffect(() => {
    if (actionState.errors) {
      Object.entries(actionState.errors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          setError(field as keyof TransactionFormData, {
            message: messages[0],
          })
        }
      })
    }
  }, [actionState.errors, setError])

  // 서버 에러를 폼 필드에 반영 (반복 거래)
  useEffect(() => {
    if (recurringActionState.errors) {
      Object.entries(recurringActionState.errors).forEach(
        ([field, messages]) => {
          if (messages && messages.length > 0) {
            setError(field as keyof TransactionFormData, {
              message: messages[0],
            })
          }
        }
      )
    }
  }, [recurringActionState.errors, setError])

  // 일반 거래 성공 시 토스트 알림
  useEffect(() => {
    if (actionState.success) {
      const message =
        mode === "create"
          ? "거래가 저장되었습니다"
          : mode === "recurring-edit"
            ? "반복 거래가 수정되었습니다"
            : "거래가 수정되었습니다"
      toast.success(message)
      // redirect는 Server Action에서 처리됨
    } else if (actionState.error) {
      toast.error(actionState.error)
    }
  }, [actionState.success, actionState.error, mode])

  // 반복 거래 성공 시 토스트 알림
  useEffect(() => {
    if (recurringActionState.success) {
      toast.success("반복 거래가 등록되었습니다")
      // redirect는 Server Action에서 처리됨
    } else if (recurringActionState.error) {
      toast.error(recurringActionState.error)
    }
  }, [recurringActionState.success, recurringActionState.error])

  // 폼 제출 핸들러
  const onSubmit = async (data: TransactionFormData) => {
    const formData = new FormData()
    formData.append("type", data.type)
    formData.append("amount", String(data.amount))
    formData.append("memo", data.memo || "")

    // 반복 거래인 경우
    if (isRecurring && mode === "create") {
      formData.append("frequency", frequency)
      formData.append("start_date", startDate.toISOString())
      if (hasEndDate && endDate) {
        formData.append("end_date", endDate.toISOString())
      }
      recurringFormAction(formData)
    } else if (mode === "recurring-edit") {
      // 반복 거래 수정인 경우
      formData.append("frequency", frequency)
      formData.append("start_date", startDate.toISOString())
      if (hasEndDate && endDate) {
        formData.append("end_date", endDate.toISOString())
      }
      formAction(formData)
    } else {
      // 일반 거래인 경우
      formData.append("date", data.date.toISOString())
      formAction(formData)
    }
  }

  // 취소 핸들러
  const handleCancel = () => {
    if (mode === "recurring-edit") {
      router.push("/")
    } else {
      router.push("/")
    }
  }

  // 삭제 핸들러
  const handleDelete = async () => {
    if (mode === "recurring-edit") {
      if (!recurringId) return

      try {
        const result = await deleteRecurringTransactionAction(recurringId)
        if (result.success) {
          toast.success("반복 거래가 삭제되었습니다")
          router.push("/")
        } else if (result.error) {
          toast.error(result.error)
        }
      } catch (error) {
        console.error("반복 거래 삭제 실패:", error)
        toast.error("반복 거래 삭제 중 오류가 발생했습니다")
      }
    } else {
      if (!transactionId) return

      try {
        const result = await deleteTransactionAction(transactionId)
        if (result.success) {
          toast.success("거래가 삭제되었습니다")
          // redirect가 Server Action에서 처리됨
        } else if (result.error) {
          toast.error(result.error)
        }
      } catch (error) {
        console.error("거래 삭제 실패:", error)
        toast.error("거래 삭제 중 오류가 발생했습니다")
      }
    }
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

      {/* 날짜 선택 (일반 거래인 경우에만) */}
      {!isRecurring && (
        <div>
          <DatePicker
            date={dateValue}
            onDateChange={date => setValue("date", date as Date)}
            label="날짜"
            error={errors.date?.message}
          />
        </div>
      )}

      {/* 반복 거래 옵션 */}
      {(mode === "create" || mode === "recurring-edit") && (
        <div className="space-y-4 rounded-lg border p-4">
          {/* 반복 거래 활성화 체크박스 (create 모드에만) */}
          {mode === "create" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring-enabled"
                checked={isRecurring}
                onCheckedChange={checked => setIsRecurring(checked === true)}
              />
              <Label
                htmlFor="recurring-enabled"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                반복 거래로 등록
              </Label>
            </div>
          )}

          {/* 반복 거래 활성화 시 추가 필드 */}
          {isRecurring && (
            <>
              {/* 반복 주기 */}
              <div className="space-y-2">
                <Label htmlFor="frequency">반복 주기</Label>
                <Select
                  value={frequency}
                  onValueChange={value =>
                    setFrequency(value as "weekly" | "monthly")
                  }
                >
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">매주</SelectItem>
                    <SelectItem value="monthly">매월</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 시작일 */}
              <div className="space-y-2">
                <DatePicker
                  date={startDate}
                  onDateChange={date => setStartDate(date as Date)}
                  label="시작일"
                />
              </div>

              {/* 종료일 (선택사항) */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-end-date"
                    checked={hasEndDate}
                    onCheckedChange={checked => {
                      setHasEndDate(checked === true)
                      if (!checked) {
                        setEndDate(undefined)
                      }
                    }}
                  />
                  <Label
                    htmlFor="has-end-date"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    종료일 설정
                  </Label>
                </div>

                {hasEndDate && (
                  <DatePicker
                    date={endDate || new Date()}
                    onDateChange={date => setEndDate(date as Date)}
                    label="종료일"
                  />
                )}
              </div>
            </>
          )}
        </div>
      )}

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
      <div className="space-y-3">
        {/* 저장/취소 버튼 */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
            disabled={isPending || isRecurringPending}
          >
            취소
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isPending || isRecurringPending}
          >
            {isPending || isRecurringPending ? "저장 중..." : "저장"}
          </Button>
        </div>

        {/* 삭제 버튼 (edit/recurring-edit 모드에만 표시) */}
        {(mode === "edit" || mode === "recurring-edit") && (
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </Button>
        )}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="거래 삭제"
        description="이 거래를 삭제하시겠습니까? 삭제된 거래는 복구할 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </form>
  )
}
