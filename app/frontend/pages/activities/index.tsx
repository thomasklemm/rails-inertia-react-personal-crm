import { Head, router, usePage } from "@inertiajs/react"
import { Mail, MessageSquare, Phone, Search } from "lucide-react"
import type { ReactNode } from "react"

import { ActivityItem } from "@/components/crm/activity-item"
import { Input } from "@/components/ui/input"
import AppLayout from "@/layouts/app-layout"
import { activitiesPath } from "@/routes"
import type { Activity, ActivityKind, BreadcrumbItem } from "@/types"

interface Props {
  activities: Activity[]
  q?: string
  kind?: string
  [key: string]: unknown
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Activity Log", href: activitiesPath() },
]

const KIND_FILTERS: { label: string; value: ActivityKind | undefined; icon?: React.ElementType }[] =
  [
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

export default function ActivitiesIndex() {
  const { activities, q, kind } = usePage<Props>().props

  function navigate(params: { q?: string; kind?: string }) {
    const merged = { q: q ?? "", kind: kind ?? "", ...params }
    const clean = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== "" && v !== undefined),
    )
    router.get(activitiesPath(clean), {}, { preserveState: true, replace: true })
  }

  const groups = groupByDate(activities)

  return (
    <>
      <Head title="Activity Log" />
      <div className="flex flex-1 min-h-0 flex-col">
        {/* Sticky header + filters */}
        <div className="mx-auto w-full max-w-3xl shrink-0 px-6 pt-8 pb-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Activity Log</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">All activities across contacts and companies</p>
          </div>

          {/* Search + filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 pl-8"
                placeholder="Search activities…"
                defaultValue={q ?? ""}
                onChange={(e) => navigate({ q: e.target.value || undefined })}
              />
            </div>

            <div className="inline-flex rounded-lg border bg-muted p-0.5">
              {KIND_FILTERS.map((f) => {
                const isActive = (kind ?? undefined) === f.value
                return (
                  <button
                    key={f.label}
                    onClick={() => navigate({ kind: f.value })}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                    }`}
                  >
                    {f.icon && <f.icon className="size-3.5" />}
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Scrollable activity groups */}
        <div className="scrollbar-subtle mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-y-auto px-6 pb-8">
          {groups.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No activities found.</p>
          ) : (
            <div className="space-y-8">
              {groups.map((group) => (
                <div key={group.key}>
                  <div className="mb-4 flex items-baseline justify-between">
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
      </div>
    </>
  )
}

ActivitiesIndex.layout = (page: ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
)
