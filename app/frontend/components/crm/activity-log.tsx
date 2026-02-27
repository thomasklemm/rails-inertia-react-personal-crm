import { Fragment, useState } from "react"
import { Mail, MessageSquare, PenLine, Phone } from "lucide-react"

import { shortDate, todayDateString, yesterdayDateString } from "@/lib/dates"

import { ActivityLogDialog } from "@/components/crm/activity-log-dialog"
import { ActivityItem } from "./activity-item"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Activity, ActivityKind } from "@/types"

const FILTERS: {
  label: string
  value: ActivityKind | undefined
  icon?: React.ElementType
}[] = [
  { label: "All", value: undefined },
  { label: "Notes", value: "note", icon: MessageSquare },
  { label: "Calls", value: "call", icon: Phone },
  { label: "Emails", value: "email", icon: Mail },
]

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

interface ActivityLogProps {
  activities: Activity[]
  title?: string
  description?: string
  showSubject?: boolean
  subjectType?: string
  subjectId?: number
}

export function ActivityLog({
  activities,
  title = "Activity Log",
  description,
  showSubject = false,
  subjectType,
  subjectId,
}: ActivityLogProps) {
  const [kindFilter, setKindFilter] = useState<ActivityKind | undefined>(
    undefined,
  )

  const canLog = subjectType != null && subjectId != null

  const filtered = kindFilter
    ? activities.filter((a) => a.kind === kindFilter)
    : activities
  const groups = groupByDate(filtered)

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            {canLog && (
              <ActivityLogDialog
                subjectType={subjectType}
                subjectId={subjectId}
                trigger={
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 px-2 text-xs font-medium"
                  >
                    <PenLine className="size-3" />
                    Log Activity
                  </Button>
                }
              />
            )}
          </div>
          <div className="bg-muted inline-flex shrink-0 rounded-lg border p-0.5">
            {FILTERS.map((f) => {
              const isActive = kindFilter === f.value
              const btn = (
                <button
                  aria-label={f.label}
                  onClick={() => setKindFilter(f.value)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                  }`}
                >
                  {f.icon && <f.icon className="size-3.5" />}
                  {(!f.icon || isActive) && f.label}
                </button>
              )
              return f.icon && !isActive ? (
                <Tooltip key={f.label}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent>{f.label}</TooltipContent>
                </Tooltip>
              ) : (
                <Fragment key={f.label}>{btn}</Fragment>
              )
            })}
          </div>
        </div>
        {description && (
          <p className="text-muted-foreground mt-1 text-xs">{description}</p>
        )}
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
              <div>
                {group.items.map((activity, i) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    showSubject={showSubject}
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
