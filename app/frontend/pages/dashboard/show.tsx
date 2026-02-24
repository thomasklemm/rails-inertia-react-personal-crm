import { Head, Link, usePage } from "@inertiajs/react"
import { ArrowRight, CalendarClock } from "lucide-react"
import type { ReactNode } from "react"

import { ContactAvatar } from "@/components/crm/contact-avatar"
import { DashboardActivityFeed } from "@/components/crm/dashboard-activity-feed"
import { DashboardStarredContacts } from "@/components/crm/dashboard-starred-contacts"
import { DashboardStatsRow } from "@/components/crm/dashboard-stats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
        <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
          <DashboardStatsRow stats={stats} />

          {due_follow_ups.length > 0 && (
            <Card className="gap-0 overflow-hidden py-0">
              <CardHeader className="flex flex-row items-center gap-2 space-y-0 px-4 py-3">
                <CalendarClock className="text-muted-foreground size-4" />
                <CardTitle className="text-base font-semibold">
                  Due Follow-Ups
                </CardTitle>
                <span className="bg-destructive/10 text-destructive ml-auto rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums">
                  {due_follow_ups.length}
                </span>
              </CardHeader>
              <div className="border-b" />
              <CardContent className="p-0">
                <div className="divide-y">
                  {due_follow_ups.map((followUp) => {
                    const { label, classes } = followUpMeta(
                      followUp.follow_up_at,
                    )
                    return (
                      <Link
                        key={followUp.id}
                        href={contactPath(followUp.id)}
                        className="hover:bg-muted/40 flex items-center gap-3 px-4 py-3 transition-colors"
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
                        <div className="flex shrink-0 items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}
                          >
                            {label}
                          </span>
                          <ArrowRight className="text-muted-foreground/40 size-3.5" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
