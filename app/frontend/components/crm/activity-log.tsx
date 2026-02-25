import { useForm } from "@inertiajs/react"
import { Check, Mail, MessageSquare, PenLine, Phone, X } from "lucide-react"
import { Fragment, useRef, useState } from "react"

import { todayDateString, yesterdayDateString } from "@/lib/dates"

import { ActivityDatePicker } from "@/components/crm/activity-date-picker"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { activitiesPath } from "@/routes"
import type { Activity, ActivityKind } from "@/types"


import { ActivityItem } from "./activity-item"

const KINDS: { value: ActivityKind; label: string; icon: React.ElementType }[] =
  [
    { value: "note", label: "Note", icon: MessageSquare },
    { value: "call", label: "Call", icon: Phone },
    { value: "email", label: "Email", icon: Mail },
  ]

const FILTERS: {
  label: string
  value: ActivityKind | undefined
  icon?: React.ElementType
}[] = [
  { label: "All", value: undefined },
  { label: "Notes", value: "note", icon: MessageSquare },
  { label: "Calls", value: "call", icon: Phone },
  { label: "Emails", value: "email", icon: Mail },
]

function groupByDate(activities: Activity[]) {
  const groups: { label: string; key: string; items: Activity[] }[] = []
  const todayKey = todayDateString()
  const yesterdayKey = yesterdayDateString()

  for (const activity of activities) {
    const key = activity.occurred_at.slice(0, 10) // "YYYY-MM-DD"

    let label: string
    if (key === todayKey) {
      label = "Today"
    } else if (key === yesterdayKey) {
      label = "Yesterday"
    } else {
      const [yr, mo, dy] = key.split("-").map(Number)
      const d = new Date(yr, mo - 1, dy) // local midnight — for formatting only
      label = d.toLocaleDateString("en", {
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

interface ActivityLogFormProps {
  subjectType: string
  subjectId: number
  onDone: () => void
}

function ActivityLogForm({
  subjectType,
  subjectId,
  onDone,
}: ActivityLogFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { data, setData, post, processing, errors } = useForm({
    subject_type: subjectType,
    subject_id: subjectId,
    kind: "note" as ActivityKind,
    body: "",
    occurred_at: todayDateString(),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.body.trim()) return
    post(activitiesPath(), {
      preserveScroll: true,
      onSuccess: () => onDone(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Kind picker */}
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs font-medium">What?</p>
        <div className="flex gap-1">
          {KINDS.map(({ value, label, icon: KIcon }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setData("kind", value)
                textareaRef.current?.focus()
              }}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                data.kind === value
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <KIcon className="size-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Date picker */}
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs font-medium">When?</p>
        <ActivityDatePicker
          value={data.occurred_at}
          onChange={(d) => setData("occurred_at", d)}
        />
      </div>

      {/* Textarea */}
      <Textarea
        ref={textareaRef}
        value={data.body}
        onChange={(e) => setData("body", e.target.value)}
        autoFocus
        placeholder={
          data.kind === "note"
            ? "Add a note…"
            : data.kind === "call"
              ? "What was discussed?"
              : "Email summary…"
        }
        rows={3}
        className="resize-none text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            if (data.body.trim()) handleSubmit(e as unknown as React.FormEvent)
          }
          if (e.key === "Escape") onDone()
        }}
      />
      {errors.body && (
        <p className="text-destructive mt-1 text-xs">{errors.body}</p>
      )}

      {/* Actions */}
      <div className="flex gap-1.5">
        <Button
          type="submit"
          size="sm"
          className="h-7 gap-1 px-2.5 text-xs"
          disabled={processing || !data.body.trim()}
        >
          <Check className="size-3" />
          Log {KINDS.find((k) => k.value === data.kind)?.label}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 gap-1 px-2.5 text-xs"
          onClick={onDone}
          disabled={processing}
        >
          <X className="size-3" />
          Cancel
        </Button>
      </div>
    </form>
  )
}

interface ActivityLogProps {
  activities: Activity[]
  title?: string
  description?: string
  showSubject?: boolean
  subjectType?: string
  subjectId?: number
}

export function ActivityLog({
  activities,
  title = "Activity Log",
  description,
  showSubject = false,
  subjectType,
  subjectId,
}: ActivityLogProps) {
  const [kindFilter, setKindFilter] = useState<ActivityKind | undefined>(
    undefined,
  )
  const [popoverOpen, setPopoverOpen] = useState(false)

  const canLog = subjectType != null && subjectId != null

  const filtered = kindFilter
    ? activities.filter((a) => a.kind === kindFilter)
    : activities
  const groups = groupByDate(filtered)

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            {canLog && (
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 px-2 text-xs font-medium"
                  >
                    <PenLine className="size-3" />
                    Log
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0" align="start">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <span className="text-sm font-semibold">Log Activity</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-6"
                      onClick={() => setPopoverOpen(false)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <ActivityLogForm
                      subjectType={subjectType}
                      subjectId={subjectId}
                      onDone={() => setPopoverOpen(false)}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <div className="bg-muted inline-flex shrink-0 rounded-lg border p-0.5">
            {FILTERS.map((f) => {
              const isActive = kindFilter === f.value
              const btn = (
                <button
                  aria-label={f.label}
                  onClick={() => setKindFilter(f.value)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                  }`}
                >
                  {f.icon && <f.icon className="size-3.5" />}
                  {(!f.icon || isActive) && f.label}
                </button>
              )
              return f.icon && !isActive ? (
                <Tooltip key={f.label}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent>{f.label}</TooltipContent>
                </Tooltip>
              ) : (
                <Fragment key={f.label}>{btn}</Fragment>
              )
            })}
          </div>
        </div>
        {description && (
          <p className="text-muted-foreground mt-1 text-xs">{description}</p>
        )}
      </div>

      {groups.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          No activities yet.
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.key}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  {group.label}
                </span>
                <span className="text-muted-foreground text-xs">
                  {group.items.length}{" "}
                  {group.items.length === 1 ? "activity" : "activities"}
                </span>
              </div>
              <div>
                {group.items.map((activity, i) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    showSubject={showSubject}
                    isLast={i === group.items.length - 1}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
