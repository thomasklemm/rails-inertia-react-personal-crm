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

interface ActivityLogProps {
  activities: Activity[]
  title?: string
  showContact?: boolean
}

export function ActivityLog({ activities, title = "Activity Log", showContact = false }: ActivityLogProps) {
  const [kindFilter, setKindFilter] = useState<ActivityKind | undefined>(undefined)

  const filtered = kindFilter ? activities.filter((a) => a.kind === kindFilter) : activities

  return (
    <div>
      <div className="flex items-center justify-between">
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

      <div className="mt-2 divide-y">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No activities yet.</p>
        ) : (
          filtered.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} showContact={showContact} />
          ))
        )}
      </div>
    </div>
  )
}
