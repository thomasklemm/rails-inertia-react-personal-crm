// ── Date string helpers ───────────────────────────────────────────────────────

/** Returns "YYYY-MM-DD" for the given Date using local time. */
export function toDateString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Returns today's date as "YYYY-MM-DD" in local time. */
export function todayDateString(): string {
  return toDateString(new Date())
}

/** Returns yesterday's date as "YYYY-MM-DD" in local time. */
export function yesterdayDateString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toDateString(d)
}

// ── Date checks ───────────────────────────────────────────────────────────────
// Compare the YYYY-MM-DD prefix of any ISO/date string directly — avoids
// timezone bugs from Date parsing of date-only strings.

export function isToday(dateString: string): boolean {
  return dateString.slice(0, 10) === todayDateString()
}

export function isYesterday(dateString: string): boolean {
  return dateString.slice(0, 10) === yesterdayDateString()
}

// ── Display helpers ───────────────────────────────────────────────────────────

/** Short date label from a "YYYY-MM-DD" key: "Feb 27" or "Feb 27, 2024". */
export function shortDate(key: string): string {
  const [yr, mo, dy] = key.split("-").map(Number)
  const d = new Date(yr, mo - 1, dy)
  const isThisYear = yr === new Date().getFullYear()
  return d.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    ...(isThisYear ? {} : { year: "numeric" }),
  })
}

/** Date-based occurrence label for activity items whose occurred_at is a date,
 *  not a precise timestamp. Never shows hours — smallest unit is calendar days. */
export function occurrenceLabel(dateString: string): string {
  const dateKey = dateString.slice(0, 10)
  if (dateKey === todayDateString()) return "Today"
  if (dateKey === yesterdayDateString()) return "Yesterday"

  const [yr, mo, dy] = dateKey.split("-").map(Number)
  const dayStart = new Date(yr, mo - 1, dy)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.round(
    (todayStart.getTime() - dayStart.getTime()) / 86_400_000,
  )

  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  if (weeks === 1) return "1 week ago"
  if (weeks < 5) return `${weeks} weeks ago`

  return dayStart.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    ...(yr === now.getFullYear() ? {} : { year: "numeric" }),
  })
}

/** Relative time label for an ISO timestamp. Falls back to an absolute date
 *  for items older than ~5 weeks so "60 days ago" never appears. */
export function timeAgo(dateString: string): string {
  const ms = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(ms / 60_000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return "yesterday"
  if (days < 7) return `${days} days ago`
  if (weeks === 1) return "1 week ago"
  if (weeks < 5) return `${weeks} weeks ago`
  const d = new Date(dateString)
  const isThisYear = d.getFullYear() === new Date().getFullYear()
  return d.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    ...(isThisYear ? {} : { year: "numeric" }),
  })
}
