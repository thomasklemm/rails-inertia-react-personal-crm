import { Mail, MessageSquare, Phone } from "lucide-react"
import { useState } from "react"

import type { Activity, ActivityKind } from "@/types"

import { ActivityItem } from "./activity-item"

const FILTERS: { label: string; value: ActivityKind | undefined; icon?: React.ElementType }[] = [
  { label: "All", value: undefined },
  { label: "Notes", value: "note", icon: MessageSquare },
  { label: "Calls", value: "call", icon: Phone },
  { label: "Emails", value: "email", icon: Mail },
]

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

interface ActivityLogProps {
  activities: Activity[]
  title?: string
  showContact?: boolean
}

export function ActivityLog({ activities, title = "Activity Log", showContact = false }: ActivityLogProps) {
  const [kindFilter, setKindFilter] = useState<ActivityKind | undefined>(undefined)

  const filtered = kindFilter ? activities.filter((a) => a.kind === kindFilter) : activities
  const groups = groupByDate(filtered)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="inline-flex rounded-lg border bg-muted p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setKindFilter(f.value)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                kindFilter === f.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.icon && <f.icon className="size-3.5" />}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No activities yet.</p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.key}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {group.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {group.items.length} {group.items.length === 1 ? "activity" : "activities"}
                </span>
              </div>
              <div>
                {group.items.map((activity, i) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    showContact={showContact}
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
