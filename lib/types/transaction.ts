/**
 * Period types for dashboard views
 */
export type Period = "daily" | "weekly" | "monthly" | "yearly"

/**
 * Period selection state using discriminated union for type safety
 */
export type PeriodSelection =
  | { type: "daily"; date: Date }
  | { type: "weekly"; weekOffset: number }
  | { type: "monthly"; monthOffset: number }
  | { type: "yearly"; yearOffset: number }
