import { useState } from "react"

import type { Activity, ActivityKind } from "@/types"

import { ActivityItem } from "./activity-item"

const FILTERS: { label: string; value: ActivityKind | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Notes", value: "note" },
  { label: "Calls", value: "call" },
  { label: "Emails", value: "email" },
]

interface ActivityLogProps {
  activities: Activity[]
}

export function ActivityLog({ activities }: ActivityLogProps) {
  const [kindFilter, setKindFilter] = useState<ActivityKind | undefined>(undefined)

  const filtered = kindFilter ? activities.filter((a) => a.kind === kindFilter) : activities

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Activity</h3>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setKindFilter(f.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                kindFilter === f.value
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 divide-y">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No activities yet.</p>
        ) : (
          filtered.map((activity) => <ActivityItem key={activity.id} activity={activity} />)
        )}
      </div>
    </div>
  )
}
