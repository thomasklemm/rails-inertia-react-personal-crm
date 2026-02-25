import { ModalLink } from "@inertiaui/modal-react"
import { Plus, TrendingUp } from "lucide-react"

import { STAGE_LABELS } from "@/components/crm/deal-form"
import { Button } from "@/components/ui/button"
import { dealPath, newDealPath } from "@/routes"
import type { Deal, DealStage } from "@/types"

const STAGE_COLORS: Record<DealStage, string> = {
  lead: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  qualified: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  proposal:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  closed_won:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  closed_lost: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

function formatValue(value: number) {
  if (value <= 0) return null
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value)
}

interface DealsListProps {
  deals: Deal[]
  contactId?: number
  companyId?: number
}

export function DealsList({ deals, contactId, companyId }: DealsListProps) {
  const newDealHref = contactId
    ? newDealPath({ contact_id: contactId })
    : newDealPath({ company_id: companyId })

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-base font-semibold tracking-tight">Deals</h3>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 px-2 text-xs font-medium"
          asChild
        >
          <ModalLink navigate href={newDealHref}>
            <Plus className="size-3" />
            Add Deal
          </ModalLink>
        </Button>
      </div>
      {deals.length === 0 ? (
        <p className="text-muted-foreground text-sm">No deals yet.</p>
      ) : (
        <div className="space-y-2">
          {deals.map((deal) => (
            <a
              key={deal.id}
              href={dealPath(deal.id)}
              className="hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-colors"
            >
              <div className="bg-primary/10 flex size-8 shrink-0 items-center justify-center rounded-lg">
                <TrendingUp className="text-primary size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{deal.title}</p>
                {deal.company && (
                  <p className="text-muted-foreground truncate text-xs">
                    {deal.company.name}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {formatValue(deal.value) && (
                  <span className="text-sm font-medium tabular-nums">
                    {formatValue(deal.value)}
                  </span>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STAGE_COLORS[deal.stage] ?? ""}`}
                >
                  {STAGE_LABELS[deal.stage] ?? deal.stage}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
