import { Head, router, usePage } from "@inertiajs/react"
import {
  Building2,
  Mail,
  MessageSquare,
  Phone,
  Search,
  TrendingUp,
  User,
} from "lucide-react"
import type { ReactNode } from "react"

import { ActivityItem } from "@/components/crm/activity-item"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import AppLayout from "@/layouts/app-layout"
import { activitiesPath } from "@/routes"
import type { Activity, ActivityKind, BreadcrumbItem } from "@/types"

interface Props {
  activities: Activity[]
  q?: string
  kind?: string
  subject?: string
  [key: string]: unknown
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Activity Log", href: activitiesPath() },
]

const KIND_FILTERS: {
  label: string
  value: ActivityKind | undefined
  icon?: React.ElementType
  title?: string
}[] = [
  { label: "All", value: undefined, title: "All Types" },
  { label: "Notes", value: "note", icon: MessageSquare },
  { label: "Calls", value: "call", icon: Phone },
  { label: "Emails", value: "email", icon: Mail },
]

const SUBJECT_FILTERS: {
  label: string
  value: string | undefined
  icon?: React.ElementType
  title?: string
}[] = [
  { label: "All", value: undefined, title: "All Subjects" },
  { label: "Contacts", value: "contact", icon: User },
  { label: "Companies", value: "company", icon: Building2 },
  { label: "Deals", value: "deal", icon: TrendingUp },
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
  const { activities, q, kind, subject } = usePage<Props>().props

  function navigate(params: { q?: string; kind?: string; subject?: string }) {
    const merged = {
      q: q ?? "",
      kind: kind ?? "",
      subject: subject ?? "",
      ...params,
    }
    const clean = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== "" && v !== undefined),
    )
    router.get(
      activitiesPath(clean),
      {},
      { preserveState: true, replace: true },
    )
  }

  const groups = groupByDate(activities)

  return (
    <>
      <Head title="Activity Log" />
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Sticky header + filters */}
        <div className="mx-auto w-full max-w-3xl shrink-0 px-4 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Activity Log</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              All activities across contacts, companies, and deals
            </p>
          </div>

          {/* Search + filters */}
          <div className="space-y-2">
            {/* Search */}
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
              <Input
                className="h-9 pl-8"
                placeholder="Search activities, contacts, companies, or deals…"
                defaultValue={q ?? ""}
                onChange={(e) => navigate({ q: e.target.value || undefined })}
              />
            </div>

            {/* Filter pills — kind + subject on one row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-muted inline-flex rounded-lg border p-0.5">
                {KIND_FILTERS.map((f) => {
                  const isActive = (kind ?? undefined) === f.value
                  const btn = (
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
                  return f.title ? (
                    <Tooltip key={f.label}>
                      <TooltipTrigger asChild>{btn}</TooltipTrigger>
                      <TooltipContent>{f.title}</TooltipContent>
                    </Tooltip>
                  ) : (
                    btn
                  )
                })}
              </div>

              <div className="bg-border hidden h-4 w-px shrink-0 sm:block" />

              <div className="bg-muted inline-flex rounded-lg border p-0.5">
                {SUBJECT_FILTERS.map((f) => {
                  const isActive = (subject ?? undefined) === f.value
                  const btn = (
                    <button
                      key={f.label}
                      onClick={() => navigate({ subject: f.value })}
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
                  return f.title ? (
                    <Tooltip key={f.label}>
                      <TooltipTrigger asChild>{btn}</TooltipTrigger>
                      <TooltipContent>{f.title}</TooltipContent>
                    </Tooltip>
                  ) : (
                    btn
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable activity groups */}
        <div className="scrollbar-subtle mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-8 sm:px-6">
          {groups.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              No activities found.
            </p>
          ) : (
            <div className="space-y-8">
              {groups.map((group) => (
                <div key={group.key}>
                  <div className="mb-4 flex items-baseline justify-between">
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
      </div>
    </>
  )
}

ActivitiesIndex.layout = (page: ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
)
