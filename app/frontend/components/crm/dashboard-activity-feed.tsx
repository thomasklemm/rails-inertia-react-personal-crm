import { Link } from "@inertiajs/react"
import { ArrowRight } from "lucide-react"

import { ActivityItem } from "@/components/crm/activity-item"
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
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <Link
          href={activitiesPath()}
          className="text-primary flex items-center gap-1 text-sm font-medium hover:underline"
        >
          View All
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {groups.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          No activities yet.
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.key}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  {group.label}
                </span>
                <span className="text-muted-foreground text-xs">
                  {group.items.length}{" "}
                  {group.items.length === 1 ? "activity" : "activities"}
                </span>
              </div>
              <div>
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
    </div>
  )
}
