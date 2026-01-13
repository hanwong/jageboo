"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, TrendingUp, TrendingDown, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    label: "홈",
    href: "/",
    icon: Home,
  },
  {
    label: "매출",
    href: "/income/new",
    icon: TrendingUp,
  },
  {
    label: "매입",
    href: "/expense/new",
    icon: TrendingDown,
  },
  {
    label: "설정",
    href: "/settings",
    icon: Settings,
  },
]

/**
 * 하단 고정 네비게이션 바
 * - 모바일 퍼스트 디자인
 * - 터치 친화적 크기 (최소 44x44px)
 * - 현재 경로 하이라이트
 */
export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-md">
        <div className="flex h-16 items-center justify-around px-4">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
