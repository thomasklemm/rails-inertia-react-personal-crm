import { Mail, MessageSquare, Phone, Plus } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import type { Activity, ActivityKind } from "@/types"

import { ActivityItem, ActivityNewItem } from "./activity-item"

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
  const [isLogging, setIsLogging] = useState(false)

  const canLog = subjectType != null && subjectId != null

  const filtered = kindFilter
    ? activities.filter((a) => a.kind === kindFilter)
    : activities
  const groups = groupByDate(filtered)

  const todayKey = useMemo(() => {
    const now = new Date()
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).toISOString()
  }, [])
  const hasTodayGroup = groups.length > 0 && groups[0].key === todayKey

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          {canLog && !isLogging && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 px-2 text-xs font-medium"
              onClick={() => setIsLogging(true)}
            >
              <Plus className="size-3" />
              Log Activity
            </Button>
          )}
          <div className="bg-muted ml-auto inline-flex rounded-lg border p-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.label}
                onClick={() => setKindFilter(f.value)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  kindFilter === f.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                }`}
              >
                {f.icon && <f.icon className="size-3.5" />}
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {description && (
          <p className="text-muted-foreground mt-1 text-xs">{description}</p>
        )}
      </div>

      {groups.length === 0 && !isLogging ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          No activities yet.
        </p>
      ) : (
        <div className="space-y-6">
          {/* Prepend standalone Today group when logging but no today activities exist */}
          {isLogging && !hasTodayGroup && subjectType && subjectId != null && (
            <div>
              <div className="mb-2">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Today
                </span>
              </div>
              <div>
                <ActivityNewItem
                  subjectType={subjectType}
                  subjectId={subjectId}
                  onCancel={() => setIsLogging(false)}
                  isLast={true}
                />
              </div>
            </div>
          )}

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
                {/* Inject new item at top of existing Today group */}
                {isLogging &&
                  group.key === todayKey &&
                  subjectType &&
                  subjectId != null && (
                    <ActivityNewItem
                      subjectType={subjectType}
                      subjectId={subjectId}
                      onCancel={() => setIsLogging(false)}
                      isLast={false}
                    />
                  )}
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
