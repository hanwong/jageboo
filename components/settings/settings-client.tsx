"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "@/app/actions/auth"
import type { User } from "@supabase/supabase-js"
import { LogOut } from "lucide-react"
import { ThemeSwitcher } from "@/components/theme-switcher"

interface SettingsClientProps {
  user: User | null
}

/**
 * 설정 클라이언트 컴포넌트
 * - 사용자 프로필 정보 표시
 * - 로그아웃 기능
 * - 테마 전환
 */
export function SettingsClient({ user }: SettingsClientProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut()
      toast.success("로그아웃되었습니다")
    } catch (error) {
      // NEXT_REDIRECT 에러는 정상적인 리다이렉트이므로 무시
      if (
        error &&
        typeof error === "object" &&
        "digest" in error &&
        typeof error.digest === "string" &&
        error.digest.includes("NEXT_REDIRECT")
      ) {
        return
      }
      console.error("Logout error:", error)
      toast.error("로그아웃에 실패했습니다")
      setIsLoggingOut(false)
    }
  }

  // 사용자 이름 추출 (이메일에서)
  const getUserDisplayName = () => {
    if (!user) return "사용자"
    if (user.user_metadata?.full_name) return user.user_metadata.full_name
    if (user.email) return user.email.split("@")[0]
    return "사용자"
  }

  // 아바타 이니셜 생성
  const getInitials = () => {
    const name = getUserDisplayName()
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>사용자 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 프로필 정보 */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-lg">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">{getUserDisplayName()}</p>
              {user?.email && (
                <p className="text-sm text-muted-foreground">{user.email}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* 테마 설정 */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">테마</p>
              <p className="text-sm text-muted-foreground">
                앱 테마를 변경합니다
              </p>
            </div>
            <ThemeSwitcher />
          </div>

          <Separator />

          {/* 로그아웃 버튼 */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
