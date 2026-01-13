import { NextRequest, NextResponse } from "next/server"
import { getSummaryByPeriod } from "@/lib/queries/summaries"
import type { Period } from "@/lib/types/transaction"

/**
 * 기간별 요약 데이터 조회 API
 * GET /api/summary?period=daily|weekly|monthly|yearly&date=YYYY-MM-DD
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get("period") as Period
    const dateStr = searchParams.get("date")

    if (
      !period ||
      !["daily", "weekly", "monthly", "yearly"].includes(period)
    ) {
      return NextResponse.json(
        { error: "Invalid period parameter" },
        { status: 400 }
      )
    }

    const date = dateStr ? new Date(dateStr) : new Date()
    const summary = await getSummaryByPeriod(period, date)

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error fetching summary:", error)
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    )
  }
}
