"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateSelectorProps {
  value: Date
  onChange: (date: Date) => void
  className?: string
}

/**
 * 날짜 선택 컴포넌트
 * - 팝업 캘린더 (버튼 클릭시 표시)
 * - 선택된 날짜를 한국어로 표시 (예: "2024년 1월 15일 (월)")
 * - 과거/현재/미래 날짜 모두 선택 가능
 * - 날짜 선택 시 자동으로 닫힘
 */
export function DateSelector({
  value,
  onChange,
  className,
}: DateSelectorProps) {
  const [open, setOpen] = useState(false)

  // UTC 날짜를 로컬 날짜로 변환하여 표시
  const displayDate = new Date(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate()
  )
  const formattedDate = format(displayDate, "yyyy년 M월 d일 (EEE)", {
    locale: ko,
  })

  return (
    <div className={cn("flex items-center gap-2 py-3", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              "h-11 px-4"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formattedDate}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={displayDate}
            onSelect={date => {
              if (date) {
                onChange(date)
                setOpen(false) // 날짜 선택 시 Popover 닫기
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
