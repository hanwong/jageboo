import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Cache Components는 user-specific 데이터가 많은 앱에서는 복잡도가 높음
  // Phase 3 완료 후 필요시 재활성화
  cacheComponents: false,

  // 참고: 상위 디렉토리에 또 다른 pnpm-lock.yaml이 있을 경우 workspace root 경고가 발생할 수 있음
  // 이는 단일 프로젝트에서는 무시해도 됨
}

// Bundle Analyzer (ANALYZE=true pnpm build)
let config = nextConfig

if (process.env.ANALYZE === "true") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: true,
  })
  config = withBundleAnalyzer(nextConfig)
}

export default config
