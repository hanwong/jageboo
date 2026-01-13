import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Cache Components는 user-specific 데이터가 많은 앱에서는 복잡도가 높음
  // Phase 3 완료 후 필요시 재활성화
  cacheComponents: false,
}

export default nextConfig
