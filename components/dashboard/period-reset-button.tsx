"use client"

import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface PeriodResetButtonProps {
  onClick: () => void
  className?: string
}

/**
 * 현재 기간으로 돌아가는 버튼
 * - "현재로" 텍스트 표시
 * - 사용자가 과거/미래 기간을 보고 있을 때만 표시됨
 * - 클릭시 현재 날짜/기간으로 리셋
 */
export function PeriodResetButton({
  onClick,
  className,
}: PeriodResetButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "absolute right-0 top-0 z-10",
        "flex items-center gap-1.5",
        "shadow-sm",
        className
      )}
    >
      <RotateCcw className="h-3.5 w-3.5" />
      <span className="text-sm">현재로</span>
    </Button>
  )
}
