"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/common/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RecurringFormSectionProps {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  frequency: "weekly" | "monthly"
  onFrequencyChange: (frequency: "weekly" | "monthly") => void
  startDate: Date
  onStartDateChange: (date: Date) => void
  endDate?: Date
  onEndDateChange: (date?: Date) => void
}

/**
 * 반복 거래 설정 섹션
 * - 매출/매입 입력 화면에서 사용
 * - Phase 2: UI만 구현 (Phase 3에서 실제 저장 연동)
 */
export function RecurringFormSection({
  enabled,
  onEnabledChange,
  frequency,
  onFrequencyChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: RecurringFormSectionProps) {
  const [hasEndDate, setHasEndDate] = useState(!!endDate)

  const handleEndDateToggle = (checked: boolean) => {
    setHasEndDate(checked)
    if (!checked) {
      onEndDateChange(undefined)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      {/* 반복 거래 활성화 */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="recurring-enabled"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <Label
          htmlFor="recurring-enabled"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          반복 거래로 등록
        </Label>
      </div>

      {enabled && (
        <>
          {/* 반복 주기 */}
          <div className="space-y-2">
            <Label htmlFor="frequency">반복 주기</Label>
            <Select value={frequency} onValueChange={onFrequencyChange}>
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
              onDateChange={date => onStartDateChange(date as Date)}
              label="시작일"
            />
          </div>

          {/* 종료일 (선택사항) */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-end-date"
                checked={hasEndDate}
                onCheckedChange={handleEndDateToggle}
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
                onDateChange={date => onEndDateChange(date as Date)}
                label="종료일"
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
