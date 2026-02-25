import { Link } from "@inertiajs/react"
import { TrendingUp } from "lucide-react"

import { STAGE_LABELS } from "@/components/crm/deal-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dealPath } from "@/routes"
import type { Deal, DealStage } from "@/types"

const STAGE_BADGE: Record<DealStage, string> = {
  lead: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  qualified: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  proposal:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  closed_won:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  closed_lost: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

function formatPipelineValue(dollars: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: dollars >= 1_000_000 ? "compact" : "standard",
    minimumFractionDigits: 0,
    maximumFractionDigits: dollars >= 1_000_000 ? 1 : 0,
  }).format(dollars)
}

function formatDealValue(valueCents: number) {
  const dollars = valueCents / 100
  if (dollars === 0) return null
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: dollars >= 1_000_000 ? "compact" : "standard",
    minimumFractionDigits: 0,
    maximumFractionDigits: dollars >= 1_000_000 ? 1 : 0,
  }).format(dollars)
}

interface DashboardDealsWidgetProps {
  deals: Deal[]
  pipeline_value: number
}

export function DashboardDealsWidget({
  deals,
  pipeline_value,
}: DashboardDealsWidgetProps) {
  const visibleDeals = deals.slice(0, 8)

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 px-4 py-3">
        <TrendingUp className="text-muted-foreground size-4" />
        <CardTitle className="text-base font-semibold">Pipeline</CardTitle>
        <span className="text-muted-foreground ml-auto text-xs tabular-nums">
          {formatPipelineValue(pipeline_value)} total
        </span>
      </CardHeader>
      <div className="border-b" />
      <CardContent className="p-0">
        {visibleDeals.length === 0 ? (
          <p className="text-muted-foreground px-6 py-8 text-center text-sm">
            No open deals.
          </p>
        ) : (
          <div className="scrollbar-subtle max-h-72 divide-y overflow-y-auto overscroll-contain">
            {visibleDeals.map((deal) => {
              const valueStr = formatDealValue(deal.value_cents)
              const badgeClass = STAGE_BADGE[deal.stage]

              return (
                <Link
                  key={deal.id}
                  href={dealPath(deal.id)}
                  className="hover:bg-muted/40 flex items-center gap-3 px-4 py-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{deal.title}</p>
                    {(deal.contact ?? deal.company) && (
                      <p className="text-muted-foreground truncate text-xs">
                        {deal.contact
                          ? `${deal.contact.first_name} ${deal.contact.last_name}`
                          : deal.company?.name}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}
                    >
                      {STAGE_LABELS[deal.stage]}
                    </span>
                    {valueStr && (
                      <span className="text-muted-foreground text-xs font-semibold tabular-nums">
                        {valueStr}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
