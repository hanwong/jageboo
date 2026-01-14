import { MetadataRoute } from "next"

// 1시간마다 재검증 (manifest는 자주 변경되지 않음)
export const revalidate = 3600

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "자장부 - 매입매출 관리",
    short_name: "자장부",
    description: "5초 만에 매입매출 기록하고 꿀잠",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#18181b",
    orientation: "portrait-primary",
    categories: ["business", "finance", "productivity"],
    lang: "ko-KR",
  }
}
