import { Head, router, usePage } from "@inertiajs/react"
import { ModalLink } from "@inertiaui/modal-react"
import { Mail, MessageSquare, Pencil, Phone, Search, Trash2 } from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AppLayout from "@/layouts/app-layout"
import { activitiesPath, activityPath, companyPath, contactPath, editActivityPath } from "@/routes"
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

const KIND_ICONS = {
  note: MessageSquare,
  call: Phone,
  email: Mail,
}

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

function timeAgo(dateString: string) {
  const ms = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(ms / 60_000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return "1 day ago"
  return `${days} days ago`
}

function ActivityActions({ activity }: { activity: Activity }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  function confirmDelete() {
    router.delete(activityPath(activity.id), { preserveScroll: true })
  }

  return (
    <>
      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button size="icon" variant="ghost" className="size-6" asChild>
          <ModalLink navigate href={editActivityPath(activity.id)}>
            <Pencil className="size-3" />
          </ModalLink>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-6 hover:text-destructive"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete activity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this activity and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
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
            <p className="mt-0.5 text-sm text-muted-foreground">All activities across contacts</p>
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
                        : "text-muted-foreground hover:text-foreground"
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
                {/* Date header */}
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    {group.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {group.items.length} {group.items.length === 1 ? "activity" : "activities"}
                  </span>
                </div>

                {/* Timeline items */}
                <div>
                  {group.items.map((activity, i) => {
                    const Icon = KIND_ICONS[activity.kind]
                    const isLast = i === group.items.length - 1

                    return (
                      <div key={activity.id} className="group relative flex gap-4">
                        {/* Icon + vertical line */}
                        <div className="flex flex-col items-center">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <Icon className="size-3.5" />
                          </div>
                          {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
                        </div>

                        {/* Content */}
                        <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-6"}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-medium capitalize">{activity.kind}</span>
                              <span className="text-xs text-muted-foreground">
                                {timeAgo(activity.created_at)}
                              </span>
                              <a
                                href={activity.subject.type === "Contact" ? contactPath(activity.subject.id) : companyPath(activity.subject.id)}
                                className="text-xs font-medium text-amber-700 hover:underline dark:text-amber-400"
                              >
                                {activity.subject.name}
                              </a>
                            </div>
                            <ActivityActions activity={activity} />
                          </div>
                          <p className="mt-1 text-sm text-foreground/80">{activity.body}</p>
                        </div>
                      </div>
                    )
                  })}
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
