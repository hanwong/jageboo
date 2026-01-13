import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "자영업자 장부 - 매입매출 관리",
    short_name: "자영업자 장부",
    description: "5초 만에 매입매출을 기록하고 실시간 영업이익을 확인하세요",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#18181b",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["business", "finance", "productivity"],
    lang: "ko-KR",
  }
}
