import { Link } from "@inertiajs/react"
import { ArrowRight, Plus } from "lucide-react"

import { ActivityItem } from "@/components/crm/activity-item"
import { ActivityLogDialog } from "@/components/crm/activity-log-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { shortDate, todayDateString, yesterdayDateString } from "@/lib/dates"
import { activitiesPath } from "@/routes"
import type { Activity, ActivitySubject } from "@/types"

function groupByDate(activities: Activity[]) {
  const groups: { label: string; key: string; items: Activity[] }[] = []
  const todayKey = todayDateString()
  const yesterdayKey = yesterdayDateString()

  for (const activity of activities) {
    const key = activity.occurred_at.slice(0, 10) // "YYYY-MM-DD"

    let label: string
    if (key === todayKey) {
      label = "Today"
    } else if (key === yesterdayKey) {
      label = "Yesterday"
    } else {
      const [yr, mo, dy] = key.split("-").map(Number)
      const d = new Date(yr, mo - 1, dy) // local midnight — for formatting only
      label = d.toLocaleDateString("en", { weekday: "long" })
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
  subjects?: ActivitySubject[]
}

export function DashboardActivityFeed({
  activities,
  subjects,
}: DashboardActivityFeedProps) {
  const groups = groupByDate(activities)

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3">
        <CardTitle className="text-base font-semibold">
          Recent Activity
        </CardTitle>
        <div className="flex items-center gap-2">
          {subjects && (
            <ActivityLogDialog
              subjects={subjects}
              trigger={
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 px-2 text-xs font-medium"
                >
                  <Plus className="size-3" />
                  Log Activity
                </Button>
              }
            />
          )}
          <Link
            href={activitiesPath()}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
          >
            View All
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardHeader>

      <div className="border-b" />
      <CardContent className="p-0">
        {groups.length === 0 ? (
          <p className="text-muted-foreground px-6 py-8 text-center text-sm">
            No activities yet.
          </p>
        ) : (
          <div className="scrollbar-subtle max-h-[480px] divide-y overflow-y-scroll overscroll-contain">
            {groups.map((group) => (
              <div key={group.key}>
                <div className="bg-muted/40 flex items-baseline justify-between px-4 py-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      {group.label}
                    </span>
                    <span className="text-muted-foreground/60 text-xs">
                      {shortDate(group.key)}
                    </span>
                  </div>
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
