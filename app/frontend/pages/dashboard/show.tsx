import { Head, Link, usePage } from "@inertiajs/react"
import type { ReactNode } from "react"

import { ContactAvatar } from "@/components/crm/contact-avatar"
import { DashboardActivityFeed } from "@/components/crm/dashboard-activity-feed"
import { DashboardStarredContacts } from "@/components/crm/dashboard-starred-contacts"
import { DashboardStatsRow } from "@/components/crm/dashboard-stats"
import AppLayout from "@/layouts/app-layout"
import { contactPath, dashboardPath } from "@/routes"
import type { Activity, BreadcrumbItem, Contact, DashboardStats } from "@/types"

interface DueFollowUp {
  id: number
  first_name: string
  last_name: string
  follow_up_at: string
  company: { id: number; name: string } | null
}

interface Props {
  stats: DashboardStats
  recent_activities: Activity[]
  starred_contacts: Contact[]
  due_follow_ups: DueFollowUp[]
  [key: string]: unknown
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: dashboardPath() },
]

function followUpMeta(dateString: string): { label: string; classes: string } {
  const date = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffDays < -1)
    return {
      label: `${Math.abs(diffDays)}d overdue`,
      classes: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    }
  if (diffDays === -1)
    return {
      label: "Yesterday",
      classes:
        "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
    }
  if (diffDays === 0)
    return {
      label: "Today",
      classes:
        "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    }
  if (diffDays === 1)
    return {
      label: "Tomorrow",
      classes: "bg-muted text-muted-foreground",
    }
  return {
    label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    classes: "bg-muted text-muted-foreground",
  }
}

export default function DashboardShow() {
  const { stats, recent_activities, starred_contacts, due_follow_ups } =
    usePage<Props>().props

  return (
    <>
      <Head title="Dashboard" />
      <div className="scrollbar-subtle h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Your CRM at a glance
          </p>
        </div>

        <div className="mb-8">
          <DashboardStatsRow stats={stats} />
        </div>

        {due_follow_ups.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-semibold">Due Follow-Ups</h2>
            <div className="divide-y rounded-lg border">
              {due_follow_ups.map((followUp) => {
                const { label, classes } = followUpMeta(followUp.follow_up_at)
                return (
                  <Link
                    key={followUp.id}
                    href={contactPath(followUp.id)}
                    className="hover:bg-muted/40 flex items-center gap-3 px-4 py-3 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <ContactAvatar contact={followUp} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {followUp.first_name} {followUp.last_name}
                      </p>
                      {followUp.company && (
                        <p className="text-muted-foreground truncate text-xs">
                          {followUp.company.name}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}
                    >
                      {label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DashboardActivityFeed activities={recent_activities} />
          </div>
          <div>
            <DashboardStarredContacts contacts={starred_contacts} />
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

DashboardShow.layout = (page: ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
)
