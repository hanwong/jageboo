import { MetadataRoute } from "next"

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
    // 아이콘은 public 폴더에 파일이 준비되면 추가
    // icons: [],
    categories: ["business", "finance", "productivity"],
    lang: "ko-KR",
  }
}
