import { Link } from "@inertiajs/react"
import { Activity, Building2, Users } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { activitiesPath, companiesPath, contactsPath } from "@/routes"
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
    label: "Activities This Week",
    key: "activities_this_week" as const,
    icon: Activity,
    href: activitiesPath(),
  },
]

export function DashboardStatsRow({ stats }: DashboardStatsRowProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {STAT_CARDS.map((card) => {
        const Icon = card.icon
        return (
          <Link key={card.key} href={card.href} className="group">
            <Card className="transition-shadow group-hover:shadow-md">
              <CardContent className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats[card.key]}</p>
                  <p className="text-muted-foreground text-sm">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
