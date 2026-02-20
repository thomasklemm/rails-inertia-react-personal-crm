import { router } from "@inertiajs/react"
import { Head, usePage } from "@inertiajs/react"
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

export default function ActivitiesIndex() {
  const { activities, q, kind } = usePage<Props>().props

  function navigate(params: { q?: string; kind?: string }) {
    const merged = { q: q ?? "", kind: kind ?? "", ...params }
    const clean = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== "" && v !== undefined),
    )
    router.get(activitiesPath(clean), {}, { preserveState: true, replace: true })
  }

  return (
    <>
      <Head title="Activity Log" />
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold">Activity Log</h1>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 pl-8 text-sm"
              placeholder="Search activities…"
              defaultValue={q ?? ""}
              onChange={(e) => navigate({ q: e.target.value || undefined })}
            />
          </div>

          <div className="flex gap-1">
            {KIND_FILTERS.map((f) => {
              const isActive = (kind ?? undefined) === f.value
              return (
                <button
                  key={f.label}
                  onClick={() => navigate({ kind: f.value })}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground"
                  }`}
                >
                  {f.icon && <f.icon className="size-3.5" />}
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Activity list */}
        {activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No activities found.</p>
        ) : (
          <div className="divide-y rounded-lg border px-4">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} showContact />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

ActivitiesIndex.layout = (page: ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
)
