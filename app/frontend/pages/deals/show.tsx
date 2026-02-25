import { Head, router, usePage } from "@inertiajs/react"
import { ModalLink } from "@inertiaui/modal-react"
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Edit,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  User,
  X,
  XCircle,
} from "lucide-react"
import type { ReactNode } from "react"
import { useRef, useState } from "react"

import { ActivityLog } from "@/components/crm/activity-log"
import { STAGE_LABELS } from "@/components/crm/deal-form"
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
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import AppLayout from "@/layouts/app-layout"
import {
  advanceDealPath,
  companyPath,
  contactPath,
  dealPath,
  dealsPath,
  editDealPath,
  moveDealPath,
} from "@/routes"
import type { Activity, BreadcrumbItem, Deal } from "@/types"

const STAGE_COLORS: Record<string, string> = {
  lead: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  qualified: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  proposal:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  closed_won:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  closed_lost: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

const OPEN_STAGES = ["lead", "qualified", "proposal"]
const DEAL_STAGES = [
  "lead",
  "qualified",
  "proposal",
  "closed_won",
  "closed_lost",
]

function formatValue(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

interface Props {
  deal: Deal
  activities: Activity[]
  [key: string]: unknown
}

export default function DealsShow() {
  const { deal, activities } = usePage<Props>().props
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState(deal.notes ?? "")
  const [savingNotes, setSavingNotes] = useState(false)
  const notesRef = useRef<HTMLTextAreaElement>(null)

  const [editingValue, setEditingValue] = useState(false)
  const [valueInput, setValueInput] = useState("")
  const [savingValue, setSavingValue] = useState(false)
  const valueInputRef = useRef<HTMLInputElement>(null)

  const currentStageIdx = DEAL_STAGES.indexOf(deal.stage)
  const nextStage = DEAL_STAGES[currentStageIdx + 1] ?? null
  const isOpen = OPEN_STAGES.includes(deal.stage)

  function confirmDelete() {
    router.delete(dealPath(deal.id))
  }

  function handleAdvance() {
    router.patch(advanceDealPath(deal.id), {})
  }

  function handleMove(stage: string) {
    router.patch(moveDealPath(deal.id), { stage })
  }

  function startEditNotes() {
    setNotesValue(deal.notes ?? "")
    setEditingNotes(true)
    setTimeout(() => {
      const el = notesRef.current
      if (!el) return
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    }, 0)
  }

  function cancelEditNotes() {
    setEditingNotes(false)
    setNotesValue(deal.notes ?? "")
  }

  function startEditValue() {
    setValueInput(deal.value > 0 ? String(deal.value) : "")
    setEditingValue(true)
    setTimeout(() => valueInputRef.current?.focus(), 0)
  }

  function cancelEditValue() {
    setEditingValue(false)
  }

  function saveValue() {
    setSavingValue(true)
    router.patch(
      dealPath(deal.id),
      { value: parseFloat(valueInput) || 0 },
      {
        preserveScroll: true,
        onSuccess: () => {
          setEditingValue(false)
          setSavingValue(false)
        },
        onError: () => setSavingValue(false),
      },
    )
  }

  function saveNotes() {
    setSavingNotes(true)
    router.patch(
      dealPath(deal.id),
      { notes: notesValue },
      {
        preserveScroll: true,
        onSuccess: () => {
          setEditingNotes(false)
          setSavingNotes(false)
        },
        onError: () => setSavingNotes(false),
      },
    )
  }

  return (
    <>
      <Head title={deal.title} />
      <div className="scrollbar-subtle h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 flex size-12 shrink-0 items-center justify-center rounded-xl">
              <TrendingUp className="text-primary size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-bold">{deal.title}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_COLORS[deal.stage] ?? ""}`}
                >
                  {STAGE_LABELS[deal.stage] ?? deal.stage}
                </span>
                {editingValue ? (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs">$</span>
                    <Input
                      ref={valueInputRef}
                      type="number"
                      min="0"
                      step="0.01"
                      value={valueInput}
                      onChange={(e) => setValueInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") cancelEditValue()
                        if (e.key === "Enter") saveValue()
                      }}
                      className="h-6 w-28 px-1.5 text-sm"
                      disabled={savingValue}
                    />
                    <button
                      onClick={saveValue}
                      disabled={savingValue}
                      aria-label="Save value"
                      className="hover:bg-muted rounded p-0.5"
                    >
                      <Check className="text-muted-foreground size-3" />
                    </button>
                    <button
                      onClick={cancelEditValue}
                      disabled={savingValue}
                      aria-label="Cancel"
                      className="hover:bg-muted rounded p-0.5"
                    >
                      <X className="text-muted-foreground size-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startEditValue}
                    className="group/value flex items-center gap-1 transition-colors"
                  >
                    {deal.value > 0 ? (
                      <>
                        <span className="text-muted-foreground text-sm font-medium">
                          {formatValue(deal.value)}
                        </span>
                        <Pencil className="text-muted-foreground size-3 opacity-0 transition-opacity group-hover/value:opacity-100" />
                      </>
                    ) : (
                      <span className="text-muted-foreground hover:text-foreground flex items-center gap-0.5 text-xs">
                        <Plus className="size-3" />
                        Add value
                      </span>
                    )}
                  </button>
                )}
                {deal.closed_at && (
                  <span className="text-muted-foreground text-xs">
                    Closed{" "}
                    {new Date(deal.closed_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button size="sm" variant="outline" asChild>
                <ModalLink navigate href={editDealPath(deal.id)} title="Edit">
                  <Edit className="size-4" />
                  <span className="hidden sm:inline">Edit</span>
                </ModalLink>
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Delete deal"
                className="hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          {/* Stage progression — redesigned */}
          <div className="rounded-xl border p-4">
            {/* Pipeline stepper */}
            <div className="relative flex items-start justify-between">
              {/* Base connector line */}
              <div className="bg-border absolute top-4 right-4 left-4 h-0.5" />
              {/* Progress fill */}
              <div
                className="bg-primary/40 absolute top-4 left-4 h-0.5 transition-all duration-300"
                style={{
                  width: `calc((100% - 2rem) * ${
                    (isOpen
                      ? OPEN_STAGES.indexOf(deal.stage)
                      : OPEN_STAGES.length - 1) /
                    (OPEN_STAGES.length - 1)
                  })`,
                }}
              />
              {OPEN_STAGES.map((stage, i) => {
                const stageOpenIdx = i
                const currentOpenIdx = isOpen
                  ? OPEN_STAGES.indexOf(deal.stage)
                  : OPEN_STAGES.length - 1
                const isPast = currentOpenIdx > stageOpenIdx
                const isCurrent = deal.stage === stage
                return (
                  <button
                    key={stage}
                    onClick={() => deal.stage !== stage && handleMove(stage)}
                    className="group/stage relative z-10 flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={`bg-background flex size-8 items-center justify-center rounded-full border-2 transition-all ${
                        isCurrent
                          ? "border-primary bg-primary text-primary-foreground ring-primary/15 shadow-sm ring-4"
                          : isPast
                            ? "border-primary/40 text-primary"
                            : "border-border text-muted-foreground group-hover/stage:border-primary/40 group-hover/stage:text-foreground"
                      }`}
                    >
                      {isPast ? (
                        <Check className="size-3.5" />
                      ) : (
                        <span className="text-xs font-bold">{i + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isCurrent
                          ? "text-foreground"
                          : "text-muted-foreground group-hover/stage:text-foreground"
                      }`}
                    >
                      {STAGE_LABELS[stage as keyof typeof STAGE_LABELS]}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Action row */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
              {isOpen ? (
                <>
                  {/* Advance button — only when next stage is another open stage */}
                  {nextStage && OPEN_STAGES.includes(nextStage) && (
                    <Button
                      size="sm"
                      onClick={handleAdvance}
                      className="gap-1.5"
                    >
                      <ArrowRight className="size-3.5" />
                      Advance to{" "}
                      {STAGE_LABELS[nextStage as keyof typeof STAGE_LABELS]}
                    </Button>
                  )}
                  {/* Outcome buttons */}
                  <div
                    className={`flex gap-2 ${
                      nextStage && OPEN_STAGES.includes(nextStage)
                        ? "ml-auto"
                        : ""
                    }`}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMove("closed_won")}
                      className="gap-1.5 border-green-200 text-green-700 hover:border-green-300 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/40"
                    >
                      <CheckCircle2 className="size-3.5" />
                      Won
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMove("closed_lost")}
                      className="gap-1.5 border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      <XCircle className="size-3.5" />
                      Lost
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Closed outcome badge */}
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                      deal.stage === "closed_won"
                        ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                        : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                    }`}
                  >
                    {deal.stage === "closed_won" ? (
                      <>
                        <CheckCircle2 className="size-4" />
                        Won
                      </>
                    ) : (
                      <>
                        <XCircle className="size-4" />
                        Lost
                      </>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground ml-auto gap-1.5"
                    onClick={() => handleMove("lead")}
                  >
                    <ArrowRight className="size-3.5 rotate-180" />
                    Reopen as Lead
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Deal info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div
              className={`rounded-lg border p-3 ${!deal.contact ? "border-dashed" : ""}`}
            >
              <dt className="text-muted-foreground mb-1.5 flex items-center gap-1 text-xs font-medium">
                <User className="size-3" /> Contact
              </dt>
              <dd>
                {deal.contact ? (
                  <a
                    href={contactPath(deal.contact.id)}
                    className="text-sm font-medium hover:underline"
                  >
                    {deal.contact.first_name} {deal.contact.last_name}
                  </a>
                ) : (
                  <ModalLink
                    navigate
                    href={editDealPath(deal.id)}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
                  >
                    <Plus className="size-3" />
                    Assign Contact
                  </ModalLink>
                )}
              </dd>
            </div>
            <div
              className={`rounded-lg border p-3 ${!deal.company ? "border-dashed" : ""}`}
            >
              <dt className="text-muted-foreground mb-1.5 flex items-center gap-1 text-xs font-medium">
                <Building2 className="size-3" /> Company
              </dt>
              <dd>
                {deal.company ? (
                  <a
                    href={companyPath(deal.company.id)}
                    className="text-sm font-medium hover:underline"
                  >
                    {deal.company.name}
                  </a>
                ) : (
                  <ModalLink
                    navigate
                    href={editDealPath(deal.id)}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
                  >
                    <Plus className="size-3" />
                    Assign Company
                  </ModalLink>
                )}
              </dd>
            </div>
          </div>

          <Separator />

          {/* Notes — inline editable */}
          <div className="group/notes">
            <div className="mb-1.5 flex items-center gap-1.5">
              <h3 className="text-muted-foreground text-xs font-medium">
                Notes
              </h3>
              {!editingNotes && (
                <button
                  onClick={startEditNotes}
                  className="hover:bg-muted rounded p-0.5 opacity-0 transition-opacity group-hover/notes:opacity-100"
                  aria-label="Edit notes"
                >
                  <Pencil className="text-muted-foreground size-3" />
                </button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <Textarea
                  ref={notesRef}
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Add notes…"
                  rows={5}
                  className="resize-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") cancelEditNotes()
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                      saveNotes()
                  }}
                />
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    className="h-7 gap-1 px-2.5 text-xs"
                    onClick={saveNotes}
                    disabled={savingNotes}
                  >
                    <Check className="size-3" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 px-2.5 text-xs"
                    onClick={cancelEditNotes}
                    disabled={savingNotes}
                  >
                    <X className="size-3" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : deal.notes ? (
              <button
                type="button"
                className="w-full cursor-text text-left text-sm whitespace-pre-wrap"
                onClick={startEditNotes}
              >
                {deal.notes}
              </button>
            ) : (
              <button
                type="button"
                className="text-muted-foreground w-full cursor-text text-left text-sm"
                onClick={startEditNotes}
              >
                Add notes…
              </button>
            )}
          </div>

          <Separator />

          {/* Activity log */}
          <ActivityLog
            activities={activities}
            subjectType="Deal"
            subjectId={deal.id}
          />
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deal.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All activities for this deal will be
              permanently deleted.
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

DealsShow.layout = (page: ReactNode) => {
  const { deal } = (page as React.ReactElement).props as Props
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Deals", href: dealsPath() },
    { title: deal?.title ?? "Deal", href: "#" },
  ]
  return <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
}
