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
  proposal: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  closed_won: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  closed_lost: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

const OPEN_STAGES = ["lead", "qualified", "proposal"]
const DEAL_STAGES = ["lead", "qualified", "proposal", "closed_won", "closed_lost"]

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
        <div className="mx-auto w-full max-w-4xl space-y-6 px-6 py-8">
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
                      className="hover:bg-muted rounded p-0.5"
                    >
                      <Check className="text-muted-foreground size-3" />
                    </button>
                    <button
                      onClick={cancelEditValue}
                      disabled={savingValue}
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
                      <span className="text-muted-foreground flex items-center gap-0.5 text-xs hover:text-foreground">
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
                  Edit
                </ModalLink>
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                title="Delete"
                className="hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          {/* Stage progression */}
          <div className="rounded-xl border p-4">
            <div className="flex flex-wrap items-center gap-1">
              {/* Open stages with arrows */}
              {OPEN_STAGES.map((stage, i) => (
                <div key={stage} className="flex items-center gap-1">
                  <button
                    onClick={() => deal.stage !== stage && handleMove(stage)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      deal.stage === stage
                        ? STAGE_COLORS[stage]
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {STAGE_LABELS[stage as keyof typeof STAGE_LABELS]}
                  </button>
                  {i < OPEN_STAGES.length - 1 && (
                    <ArrowRight className="text-muted-foreground/40 size-3 shrink-0" />
                  )}
                </div>
              ))}

              {/* Separator */}
              <span className="text-border mx-1 select-none text-sm font-light">|</span>

              {/* Won */}
              <button
                onClick={() => deal.stage !== "closed_won" && handleMove("closed_won")}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  deal.stage === "closed_won"
                    ? STAGE_COLORS.closed_won
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <CheckCircle2 className="size-3" />
                Won
              </button>

              {/* Lost */}
              <button
                onClick={() => deal.stage !== "closed_lost" && handleMove("closed_lost")}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  deal.stage === "closed_lost"
                    ? STAGE_COLORS.closed_lost
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <XCircle className="size-3" />
                Lost
              </button>
            </div>

            {/* Advance CTA — only for open deals with a next stage */}
            {isOpen && nextStage && (
              <div className="mt-3 border-t pt-3">
                <Button size="sm" variant="outline" onClick={handleAdvance} className="gap-1.5">
                  <ArrowRight className="size-3.5" />
                  Advance to {STAGE_LABELS[nextStage as keyof typeof STAGE_LABELS]}
                </Button>
              </div>
            )}
          </div>

          {/* Deal info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className={`rounded-lg border p-3 ${!deal.contact ? "border-dashed" : ""}`}>
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
            <div className={`rounded-lg border p-3 ${!deal.company ? "border-dashed" : ""}`}>
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
              <h3 className="text-muted-foreground text-xs font-medium">Notes</h3>
              {!editingNotes && (
                <button
                  onClick={startEditNotes}
                  className="hover:bg-muted rounded p-0.5 opacity-0 transition-opacity group-hover/notes:opacity-100"
                  title="Edit notes"
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
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveNotes()
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
              <p
                className="cursor-text text-sm whitespace-pre-wrap"
                onDoubleClick={startEditNotes}
                title="Double-click to edit"
              >
                {deal.notes}
              </p>
            ) : (
              <p
                className="text-muted-foreground cursor-text text-sm"
                onClick={startEditNotes}
              >
                Add notes…
              </p>
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
              This action cannot be undone. All activities for this deal will be permanently deleted.
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
