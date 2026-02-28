import { router } from "@inertiajs/react"
import {
  Building2,
  Check,
  ChevronsUpDown,
  Linkedin,
  Mail,
  MessageSquare,
  Phone,
  Search,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { ActivityDatePicker } from "@/components/crm/activity-date-picker"
import { todayDateString } from "@/lib/dates"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { activitiesPath } from "@/routes"
import type { ActivityKind, ActivitySubject } from "@/types"

const KINDS: { value: ActivityKind; label: string; icon: React.ElementType }[] =
  [
    { value: "note", label: "Note", icon: MessageSquare },
    { value: "call", label: "Call", icon: Phone },
    { value: "email", label: "Email", icon: Mail },
    { value: "meeting", label: "Meeting", icon: Users },
    { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  ]

function SubjectIcon({ type }: { type: string }) {
  if (type === "Contact") return <User className="text-muted-foreground size-3.5" />
  if (type === "Company") return <Building2 className="text-muted-foreground size-3.5" />
  return <TrendingUp className="text-muted-foreground size-3.5" />
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const parts = text.split(new RegExp(`(${escaped})`, "gi"))
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="bg-amber-100 text-amber-800 dark:bg-amber-800/40 dark:text-amber-200 rounded-[2px] font-medium not-italic"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

interface SubjectPickerProps {
  subjects: ActivitySubject[]
  selected: ActivitySubject | null
  onSelect: (subject: ActivitySubject | null) => void
}

function SubjectPicker({ subjects, selected, onSelect }: SubjectPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  const contacts = subjects.filter((s) => s.type === "Contact")
  const companies = subjects.filter((s) => s.type === "Company")
  const deals = subjects.filter((s) => s.type === "Deal")

  // Manual filtering — query state is fully owned here, persists across open/close
  const q = query.toLowerCase()
  const matches = (s: ActivitySubject) =>
    !q || s.name.toLowerCase().includes(q) || (s.subtitle ?? "").toLowerCase().includes(q)
  const filteredContacts = contacts.filter(matches)
  const filteredCompanies = companies.filter(matches)
  const filteredDeals = deals.filter(matches)
  const hasNoResults =
    !filteredContacts.length && !filteredCompanies.length && !filteredDeals.length

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleMouseDown)
    return () => document.removeEventListener("mousedown", handleMouseDown)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger — div so we can nest a clear <button> without button-in-button */}
      <div
        role="combobox"
        aria-expanded={open}
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen(true)
        }}
        className="border-input flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border px-3 text-sm"
      >
        {selected ? (
          <>
            <SubjectIcon type={selected.type} />
            <span className="min-w-0 flex-1 truncate">{selected.name}</span>
            {selected.subtitle && (
              <span className="text-muted-foreground shrink-0 text-xs">
                {selected.subtitle}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSelect(null)
              }}
              className="text-muted-foreground hover:text-foreground ml-1 shrink-0"
              aria-label="Clear selection"
            >
              <X className="size-3.5" />
            </button>
          </>
        ) : (
          <>
            <span className="text-muted-foreground flex-1">
              Select contact, company, or deal…
            </span>
            <ChevronsUpDown className="text-muted-foreground size-3.5 shrink-0" />
          </>
        )}
      </div>

      {/* Inline dropdown — no portal, so Dialog scroll-trap never interferes */}
      {open && (
        <div className="border-border bg-popover absolute z-10 mt-1 w-full overflow-hidden rounded-md border shadow-md">
          {/* Search input — plain <input> for full value control */}
          <div className="flex items-center gap-2 border-b px-2 py-0.5">
            <Search className="text-muted-foreground size-4 shrink-0 opacity-50" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search contacts, companies, deals…"
              className="placeholder:text-muted-foreground flex-1 bg-transparent py-2 text-sm outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-muted-foreground hover:text-foreground shrink-0"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Results */}
          <Command shouldFilter={false}>
            <CommandList className="max-h-[220px] overflow-y-auto">
              {hasNoResults ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : (
                <>
                  {filteredContacts.length > 0 && (
                    <CommandGroup heading="Contacts">
                      {filteredContacts.map((s) => (
                        <CommandItem
                          key={`Contact-${s.id}`}
                          value={`contact-${s.id}`}
                          onSelect={() => { onSelect(s); setOpen(false) }}
                        >
                          <User className="size-3.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate">
                              <Highlight text={s.name} query={query} />
                            </div>
                            {s.subtitle && (
                              <div className="text-muted-foreground truncate text-xs">
                                <Highlight text={s.subtitle} query={query} />
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {filteredContacts.length > 0 && filteredCompanies.length > 0 && (
                    <CommandSeparator />
                  )}
                  {filteredCompanies.length > 0 && (
                    <CommandGroup heading="Companies">
                      {filteredCompanies.map((s) => (
                        <CommandItem
                          key={`Company-${s.id}`}
                          value={`company-${s.id}`}
                          onSelect={() => { onSelect(s); setOpen(false) }}
                        >
                          <Building2 className="size-3.5 shrink-0" />
                          <div className="truncate">
                            <Highlight text={s.name} query={query} />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {filteredCompanies.length > 0 && filteredDeals.length > 0 && (
                    <CommandSeparator />
                  )}
                  {filteredDeals.length > 0 && (
                    <CommandGroup heading="Deals">
                      {filteredDeals.map((s) => (
                        <CommandItem
                          key={`Deal-${s.id}`}
                          value={`deal-${s.id}`}
                          onSelect={() => { onSelect(s); setOpen(false) }}
                        >
                          <TrendingUp className="size-3.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate">
                              <Highlight text={s.name} query={query} />
                            </div>
                            {s.subtitle && (
                              <div className="text-muted-foreground truncate text-xs">
                                <Highlight text={s.subtitle} query={query} />
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}

interface ActivityLogFormProps {
  subjects?: ActivitySubject[]
  subjectType?: string
  subjectId?: number
  onDone: () => void
}

function ActivityLogForm({
  subjects,
  subjectType,
  subjectId,
  onDone,
}: ActivityLogFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const showSubjectPicker = subjects != null && !subjectType

  const [selectedSubject, setSelectedSubject] = useState<ActivitySubject | null>(
    null,
  )
  const [kind, setKind] = useState<ActivityKind>("note")
  const [body, setBody] = useState("")
  const [occurredAt, setOccurredAt] = useState(todayDateString())
  const [processing, setProcessing] = useState(false)

  const resolvedSubjectType = showSubjectPicker
    ? selectedSubject?.type
    : subjectType
  const resolvedSubjectId = showSubjectPicker
    ? selectedSubject?.id
    : subjectId

  const canSubmit =
    body.trim().length > 0 &&
    (!showSubjectPicker || selectedSubject != null) &&
    !processing

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setProcessing(true)
    router.post(
      activitiesPath(),
      {
        subject_type: resolvedSubjectType,
        subject_id: resolvedSubjectId,
        kind,
        body,
        occurred_at: occurredAt,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          onDone()
          setProcessing(false)
        },
        onError: () => setProcessing(false),
      },
    )
  }

  const placeholder =
    kind === "note"
      ? "Add a note…"
      : kind === "call"
        ? "What was discussed?"
        : kind === "meeting"
          ? "What was covered?"
          : kind === "linkedin"
            ? "Message or connection note…"
            : "Email summary…"

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Subject picker — only when no pre-selected subject */}
      {showSubjectPicker && subjects && (
        <div className="space-y-1.5">
          <p className="text-muted-foreground text-xs font-medium">Who?</p>
          <SubjectPicker
            subjects={subjects}
            selected={selectedSubject}
            onSelect={setSelectedSubject}
          />
        </div>
      )}

      {/* Kind picker */}
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs font-medium">What?</p>
        <div className="bg-muted inline-flex rounded-lg border p-0.5">
          {KINDS.map(({ value, label, icon: KIcon }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setKind(value)
                textareaRef.current?.focus()
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                kind === value
                  ? "bg-background text-amber-700 shadow-sm dark:text-amber-400"
                  : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
              }`}
            >
              <KIcon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Date picker */}
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs font-medium">When?</p>
        <ActivityDatePicker value={occurredAt} onChange={setOccurredAt} />
      </div>

      {/* Textarea */}
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs font-medium">Details</p>
        <Textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              if (canSubmit) handleSubmit(e as unknown as React.FormEvent)
            }
            if (e.key === "Escape") onDone()
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          type="submit"
          className="gap-1.5"
          disabled={!canSubmit}
        >
          <Check className="size-4" />
          Log {KINDS.find((k) => k.value === kind)?.label}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="gap-1.5"
          onClick={onDone}
          disabled={processing}
        >
          <X className="size-4" />
          Cancel
        </Button>
      </div>
    </form>
  )
}

interface ActivityLogDialogProps {
  trigger: React.ReactNode
  subjects?: ActivitySubject[]
  subjectType?: string
  subjectId?: number
}

export function ActivityLogDialog({
  trigger,
  subjects,
  subjectType,
  subjectId,
}: ActivityLogDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
        </DialogHeader>
        <ActivityLogForm
          subjects={subjects}
          subjectType={subjectType}
          subjectId={subjectId}
          onDone={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
