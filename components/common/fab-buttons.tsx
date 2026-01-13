"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FABButtonsProps {
  className?: string
}

/**
 * 하단 고정 플로팅 액션 버튼 (FAB)
 * - 매출/매입 빠른 입력 버튼
 * - 모바일 친화적 크기 및 위치
 * - 터치 최적화 (min 44x44px)
 */
export function FABButtons({ className }: FABButtonsProps) {
  return (
    <div
      className={cn(
        "fixed bottom-24 right-4 z-40 flex flex-col gap-3",
        className
      )}
    >
      {/* 매출 추가 버튼 */}
      <Link href="/income/new">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full bg-green-600 shadow-lg hover:bg-green-700 hover:shadow-xl"
          aria-label="매출 추가"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">매출 추가</span>
        </Button>
      </Link>

      {/* 매입 추가 버튼 */}
      <Link href="/expense/new">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full bg-red-600 shadow-lg hover:bg-red-700 hover:shadow-xl"
          aria-label="매입 추가"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">매입 추가</span>
        </Button>
      </Link>
    </div>
  )
}
