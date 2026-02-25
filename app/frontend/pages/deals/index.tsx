import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Head, router, usePage } from "@inertiajs/react"
import { ModalLink } from "@inertiaui/modal-react"
import { Plus } from "lucide-react"
import type { ReactNode } from "react"
import { useCallback, useState } from "react"

import { STAGE_LABELS } from "@/components/crm/deal-form"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import AppLayout from "@/layouts/app-layout"
import { dealPath, dealsPath, moveDealPath, newDealPath } from "@/routes"
import type { BreadcrumbItem, Deal, DealStage } from "@/types"

const breadcrumbs: BreadcrumbItem[] = [{ title: "Deals", href: dealsPath() }]

const STAGE_COLORS: Record<DealStage, { header: string; badge: string }> = {
  lead: {
    header: "border-t-slate-400",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  qualified: {
    header: "border-t-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  proposal: {
    header: "border-t-amber-400",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  closed_won: {
    header: "border-t-green-400",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  closed_lost: {
    header: "border-t-red-400",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
}

function formatValue(cents: number) {
  const dollars = cents / 100
  if (dollars === 0) return null
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: dollars >= 1_000_000 ? "compact" : "standard",
    minimumFractionDigits: 0,
    maximumFractionDigits: dollars >= 1_000_000 ? 1 : 0,
  }).format(dollars)
}

// Pure visual card — no drag logic here
function DealCard({
  deal,
  isDragging = false,
}: {
  deal: Deal
  isDragging?: boolean
}) {
  const valueStr = formatValue(deal.value_cents)

  return (
    <a
      href={dealPath(deal.id)}
      onClick={(e) => {
        if (isDragging) e.preventDefault()
      }}
      className={`group block rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md ${
        isDragging ? "rotate-1 opacity-80 shadow-lg" : ""
      }`}
    >
      <p className="text-sm font-medium leading-snug group-hover:underline">
        {deal.title}
      </p>
      {(deal.contact ?? deal.company) && (
        <p className="text-muted-foreground mt-1 truncate text-xs">
          {deal.contact
            ? `${deal.contact.first_name} ${deal.contact.last_name}`
            : deal.company?.name}
        </p>
      )}
      {valueStr && (
        <p className="mt-2 text-sm font-semibold tabular-nums">{valueStr}</p>
      )}
    </a>
  )
}

// Draggable wrapper — registers the card with dnd-kit
function DraggableDealCard({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: String(deal.id),
      data: { deal },
    })

  return (
    <div
      ref={setNodeRef}
      data-testid={`deal-card-${deal.id}`}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.3 : 1,
      }}
      className="touch-none"
      {...listeners}
      {...attributes}
    >
      <DealCard deal={deal} isDragging={isDragging} />
    </div>
  )
}

// Visual column content — no droppable registration here
function ColumnContent({
  stage,
  deals,
  isDragOver,
}: {
  stage: DealStage
  deals: Deal[]
  isDragOver: boolean
}) {
  const colors = STAGE_COLORS[stage]
  const totalCents = deals.reduce((sum, d) => sum + d.value_cents, 0)
  const totalStr = formatValue(totalCents)

  return (
    <div
      className={`flex min-h-[200px] flex-col overflow-hidden rounded-xl border-t-4 bg-muted/30 transition-colors ${colors.header} ${
        isDragOver ? "bg-primary/5 ring-2 ring-primary/20" : ""
      }`}
    >
      <div className="border-b bg-muted/20 px-3 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{STAGE_LABELS[stage]}</span>
          <span className="text-muted-foreground text-xs font-medium">
            {deals.length}
          </span>
        </div>
        {totalStr && (
          <p className="text-muted-foreground mt-0.5 text-xs font-medium tabular-nums">
            {totalStr}
          </p>
        )}
      </div>
      <div className="flex-1 space-y-2 p-2">
        {deals.length === 0 ? (
          <div
            className={`rounded-md border-2 border-dashed p-4 text-center transition-colors ${
              isDragOver
                ? "border-primary/40 bg-primary/5"
                : "border-border/50"
            }`}
          >
            <p className="text-muted-foreground text-xs">
              {isDragOver ? "Drop here" : "No deals"}
            </p>
          </div>
        ) : (
          deals.map((deal) => <DraggableDealCard key={deal.id} deal={deal} />)
        )}
      </div>
    </div>
  )
}

// Droppable wrapper — registers the column with dnd-kit
function DroppableColumn({
  stage,
  deals,
  isDragOver,
}: {
  stage: DealStage
  deals: Deal[]
  isDragOver: boolean
}) {
  const { setNodeRef } = useDroppable({
    id: `column-${stage}`,
    data: { stage },
  })

  return (
    <div
      ref={setNodeRef}
      data-testid={`column-${stage}`}
      className="min-w-[220px] flex-1"
    >
      <ColumnContent stage={stage} deals={deals} isDragOver={isDragOver} />
    </div>
  )
}

interface Props {
  deals_by_stage: Record<DealStage, Deal[]>
  pipeline_value: number
  stages: string[]
  [key: string]: unknown
}

export default function DealsIndex() {
  const { deals_by_stage, pipeline_value, stages } = usePage<Props>().props

  const [localDeals, setLocalDeals] =
    useState<Record<DealStage, Deal[]>>(deals_by_stage)
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null)
  // Mobile: selected stage for the single-column view
  const [mobileStage, setMobileStage] = useState<DealStage>("lead")

  const stagesTyped = stages as DealStage[]

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const deal = event.active.data.current?.deal as Deal | undefined
    if (deal) setActiveDeal(deal)
    setDragOverStage(null)
  }, [])

  const handleDragOver = useCallback(
    (event: { over: { data?: { current?: { stage?: string } } } | null }) => {
      const stage = event.over?.data?.current?.stage
      if (stage) setDragOverStage(stage as DealStage)
      else setDragOverStage(null)
    },
    [],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveDeal(null)
      setDragOverStage(null)

      if (!over) return

      const deal = active.data.current?.deal as Deal | undefined
      if (!deal) return

      const targetStage = over.data?.current?.stage as DealStage | undefined
      if (!targetStage || targetStage === deal.stage) return

      // Optimistic update
      setLocalDeals((prev) => {
        const next = { ...prev }
        next[deal.stage] = prev[deal.stage].filter((d) => d.id !== deal.id)
        next[targetStage] = [
          ...(prev[targetStage] ?? []),
          { ...deal, stage: targetStage },
        ]
        return next
      })

      // Server update — rollback on error
      router.patch(moveDealPath(deal.id), { stage: targetStage }, {
        preserveScroll: true,
        onError: () => setLocalDeals(deals_by_stage),
      })
    },
    [deals_by_stage],
  )

  const totalDeals = stagesTyped.reduce(
    (sum, s) => sum + (localDeals[s]?.length ?? 0),
    0,
  )

  return (
    <>
      <Head title="Deals" />
      <div className="scrollbar-subtle h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-screen-2xl px-6 py-8">
          {/* Page header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Deals</h1>
              <p className="text-muted-foreground mt-0.5 text-sm">
                {totalDeals} {totalDeals === 1 ? "deal" : "deals"} ·{" "}
                <span className="font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 0,
                  }).format(pipeline_value)}
                </span>{" "}
                pipeline
              </p>
            </div>
            <Button asChild>
              <ModalLink navigate href={newDealPath()}>
                <Plus className="size-4" />
                Add Deal
              </ModalLink>
            </Button>
          </div>

          {/* Desktop kanban — hidden on small screens */}
          <div className="scrollbar-subtle hidden overflow-x-scroll md:block">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="flex items-start gap-4 pb-4">
                {stagesTyped.map((stage) => (
                  <DroppableColumn
                    key={stage}
                    stage={stage}
                    deals={localDeals[stage] ?? []}
                    isDragOver={dragOverStage === stage}
                  />
                ))}
              </div>

              <DragOverlay dropAnimation={null}>
                {activeDeal ? <DealCard deal={activeDeal} isDragging /> : null}
              </DragOverlay>
            </DndContext>
          </div>

          {/* Mobile view — stage selector + card list */}
          <div className="space-y-3 md:hidden">
            <Select
              value={mobileStage}
              onValueChange={(v) => setMobileStage(v as DealStage)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stagesTyped.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STAGE_LABELS[s]} ({localDeals[s]?.length ?? 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-2">
              {(localDeals[mobileStage] ?? []).length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No deals in this stage.
                </p>
              ) : (
                (localDeals[mobileStage] ?? []).map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

DealsIndex.layout = (page: ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
)
