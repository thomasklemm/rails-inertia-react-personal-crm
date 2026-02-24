import { Link } from "@inertiajs/react"
import { ArrowRight } from "lucide-react"

import { ActivityItem } from "@/components/crm/activity-item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { activitiesPath } from "@/routes"
import type { Activity } from "@/types"

function groupByDate(activities: Activity[]) {
  const groups: { label: string; key: string; items: Activity[] }[] = []
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  for (const activity of activities) {
    const d = new Date(activity.created_at)
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const key = day.toISOString()

    let label: string
    if (day.getTime() === today.getTime()) {
      label = "Today"
    } else if (day.getTime() === yesterday.getTime()) {
      label = "Yesterday"
    } else {
      label = day.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    }

    const existing = groups.find((g) => g.key === key)
    if (existing) {
      existing.items.push(activity)
    } else {
      groups.push({ label, key, items: [activity] })
    }
  }

  return groups
}

interface DashboardActivityFeedProps {
  activities: Activity[]
}

export function DashboardActivityFeed({
  activities,
}: DashboardActivityFeedProps) {
  const groups = groupByDate(activities)

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3">
        <CardTitle className="text-base font-semibold">
          Recent Activity
        </CardTitle>
        <Link
          href={activitiesPath()}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
        >
          View All
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>

      <div className="border-b" />
      <CardContent className="p-0">
        {groups.length === 0 ? (
          <p className="text-muted-foreground px-6 py-8 text-center text-sm">
            No activities yet.
          </p>
        ) : (
          <div className="scrollbar-subtle max-h-[480px] divide-y overflow-y-auto overscroll-contain">
            {groups.map((group) => (
              <div key={group.key}>
                <div className="bg-muted/40 flex items-baseline justify-between px-4 py-2">
                  <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    {group.label}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {group.items.length}{" "}
                    {group.items.length === 1 ? "activity" : "activities"}
                  </span>
                </div>
                <div className="px-4 pt-3 pb-3">
                  {group.items.map((activity, i) => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      showSubject={true}
                      isLast={i === group.items.length - 1}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
