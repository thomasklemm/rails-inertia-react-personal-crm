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
