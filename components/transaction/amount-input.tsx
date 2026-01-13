"use client"

import { forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface AmountInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string
  error?: string
}

/**
 * 금액 입력 컴포넌트
 * - 숫자 키패드 자동 포커스
 * - 금액 포맷팅 (천단위 콤마)
 * - 모바일 최적화
 * - Enter 키 입력 시 폼 제출 (기본 HTML form 동작)
 */
export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  ({ label = "금액", error, className, ...props }, ref) => {
    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
      // 숫자와 콤마만 허용
      const value = e.currentTarget.value
      const numbers = value.replace(/[^\d]/g, "")

      // 금액 포맷팅 (천단위 콤마)
      if (numbers) {
        const formatted = Number(numbers).toLocaleString("ko-KR")
        e.currentTarget.value = formatted
      } else {
        e.currentTarget.value = ""
      }
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={props.id}>{label}</Label>
        <div className="relative">
          <Input
            ref={ref}
            type="text" // text로 설정하여 포맷팅 가능하게
            inputMode="numeric" // 모바일에서 숫자 키패드 표시
            pattern="[0-9,]*" // 숫자와 콤마만 허용
            placeholder="0"
            onInput={handleInput}
            className={cn(
              "pr-9 text-right font-semibold tabular-nums",
              error && "border-destructive",
              className
            )}
            {...props}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">
            원
          </span>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }
)

AmountInput.displayName = "AmountInput"
