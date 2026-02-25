import { Link } from "@inertiajs/react"
import { Activity, Building2, TrendingUp, Users } from "lucide-react"

import {
  activitiesPath,
  companiesPath,
  contactsPath,
  dealsPath,
} from "@/routes"
import type { DashboardStats } from "@/types"

interface DashboardStatsRowProps {
  stats: DashboardStats
}

const STAT_CARDS = [
  {
    label: "Contacts",
    key: "contacts_count" as const,
    icon: Users,
    href: contactsPath(),
  },
  {
    label: "Companies",
    key: "companies_count" as const,
    icon: Building2,
    href: companiesPath(),
  },
  {
    label: "Open Deals",
    key: "deals_count" as const,
    icon: TrendingUp,
    href: dealsPath(),
  },
  {
    label: "Activities This Week",
    key: "activities_this_week" as const,
    icon: Activity,
    href: activitiesPath(),
  },
]

export function DashboardStatsRow({ stats }: DashboardStatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {STAT_CARDS.map((card) => {
        const Icon = card.icon
        return (
          <Link
            key={card.key}
            href={card.href}
            className="group bg-card relative overflow-hidden rounded-xl border px-5 py-4 transition-shadow hover:shadow-md"
          >
            <div className="bg-primary/70 group-hover:bg-primary absolute inset-y-0 left-0 w-1 rounded-l-xl transition-all" />
            <div className="flex items-start justify-between">
              <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                {card.label}
              </p>
              <Icon className="text-muted-foreground/40 group-hover:text-muted-foreground/70 size-4 transition-colors" />
            </div>
            <p className="mt-2 font-mono text-4xl leading-none font-black tracking-tight tabular-nums">
              {stats[card.key]}
            </p>
          </Link>
        )
      })}
    </div>
  )
}
