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
import { activitiesPath, subjectsActivitiesPath } from "@/routes"
import type { ActivityKind, ActivitySubject } from "@/types"

// Module-level trigger so the command palette can open the dialog without props drilling.
export function openActivityLogDialog() {
  document.dispatchEvent(new CustomEvent("activity-log-dialog:open"))
}

const KINDS: { value: ActivityKind; label: string; icon: React.ElementType }[] =
  [
    { value: "note", label: "Note", icon: MessageSquare },
    { value: "call", label: "Call", icon: Phone },
    { value: "email", label: "Email", icon: Mail },
    { value: "meeting", label: "Meeting", icon: Users },
    { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  ]

function SubjectIcon({ type }: { type: string }) {
  if (type === "Contact")
    return <User className="text-muted-foreground size-3.5" />
  if (type === "Company")
    return <Building2 className="text-muted-foreground size-3.5" />
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
            className="rounded-[2px] bg-amber-100 font-medium text-amber-800 not-italic dark:bg-amber-800/40 dark:text-amber-200"
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
  const [commandValue, setCommandValue] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const contacts = subjects.filter((s) => s.type === "Contact")
  const companies = subjects.filter((s) => s.type === "Company")
  const deals = subjects.filter((s) => s.type === "Deal")

  // Manual filtering — query state is fully owned, persists across open/close
  const q = query.toLowerCase()
  const matches = (s: ActivitySubject) =>
    !q ||
    s.name.toLowerCase().includes(q) ||
    (s.subtitle ?? "").toLowerCase().includes(q)
  const filteredContacts = contacts.filter(matches)
  const filteredCompanies = companies.filter(matches)
  const filteredDeals = deals.filter(matches)
  const hasNoResults =
    !filteredContacts.length &&
    !filteredCompanies.length &&
    !filteredDeals.length

  // First item value in the current filtered list
  const firstValue = filteredContacts[0]
    ? `contact-${filteredContacts[0].id}`
    : filteredCompanies[0]
      ? `company-${filteredCompanies[0].id}`
      : filteredDeals[0]
        ? `deal-${filteredDeals[0].id}`
        : ""

  // Ordered flat list for manual keyboard navigation
  const allFilteredItems = [
    ...filteredContacts.map((s) => ({ value: `contact-${s.id}`, subject: s })),
    ...filteredCompanies.map((s) => ({ value: `company-${s.id}`, subject: s })),
    ...filteredDeals.map((s) => ({ value: `deal-${s.id}`, subject: s })),
  ]

  // Reset search + highlight first item every time the dropdown opens
  function openDropdown() {
    const first = contacts[0]
      ? `contact-${contacts[0].id}`
      : companies[0]
        ? `company-${companies[0].id}`
        : deals[0]
          ? `deal-${deals[0].id}`
          : ""
    setQuery("")
    setCommandValue(first)
    setOpen(true)
  }

  // Re-highlight first item whenever the query changes
  useEffect(() => {
    if (open) setCommandValue(firstValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // Scroll highlighted item into view when navigating with arrow keys
  useEffect(() => {
    if (!listRef.current) return
    const selected = listRef.current.querySelector('[aria-selected="true"]')
    selected?.scrollIntoView({ block: "nearest" })
  }, [commandValue])

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleMouseDown)
    return () => document.removeEventListener("mousedown", handleMouseDown)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger — div wrapper lets us nest a clear <button> without button-in-button */}
      <div
        role="combobox"
        aria-expanded={open}
        tabIndex={0}
        onClick={openDropdown}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openDropdown()
        }}
        className="border-input w-full cursor-pointer rounded-md border px-3 py-2 text-sm"
      >
        {selected ? (
          <div className="flex items-center gap-2">
            <SubjectIcon type={selected.type} />
            <div className="min-w-0 flex-1">
              <div className="truncate">{selected.name}</div>
              {selected.subtitle && (
                <div className="text-muted-foreground truncate text-xs">
                  {selected.subtitle}
                </div>
              )}
            </div>
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
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground flex-1">
              Select contact, company, or deal…
            </span>
            <ChevronsUpDown className="text-muted-foreground size-3.5 shrink-0" />
          </div>
        )}
      </div>

      {/* Inline dropdown — no portal, no Dialog scroll-trap interference */}
      {open && (
        <div className="border-border bg-popover absolute z-10 mt-1 w-full overflow-hidden rounded-md border shadow-md outline-none">
          {/* Command wraps both input + list so arrow/enter key events bubble to cmdk */}
          <Command
            shouldFilter={false}
            value={commandValue}
            onValueChange={setCommandValue}
            className="h-auto outline-none"
          >
            <div className="flex items-center gap-2 border-b px-2 py-0.5">
              <Search className="text-muted-foreground size-4 shrink-0 opacity-50" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search contacts, companies, deals…"
                className="placeholder:text-muted-foreground flex-1 bg-transparent py-2 text-sm outline-none focus:ring-0 focus:outline-none"
                style={{ outline: "none" }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault()
                    const idx = allFilteredItems.findIndex(
                      (item) => item.value === commandValue,
                    )
                    const next =
                      allFilteredItems[idx + 1] ?? allFilteredItems[0]
                    if (next) setCommandValue(next.value)
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault()
                    const idx = allFilteredItems.findIndex(
                      (item) => item.value === commandValue,
                    )
                    const prev =
                      allFilteredItems[idx - 1] ??
                      allFilteredItems[allFilteredItems.length - 1]
                    if (prev) setCommandValue(prev.value)
                  } else if (e.key === "Enter") {
                    e.preventDefault()
                    const item = allFilteredItems.find(
                      (item) => item.value === commandValue,
                    )
                    if (item) {
                      onSelect(item.subject)
                      setOpen(false)
                    }
                  } else if (e.key === "Escape") {
                    setOpen(false)
                  }
                }}
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
            <CommandList
              ref={listRef}
              className="max-h-[220px] overflow-y-auto"
            >
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
                          onSelect={() => {
                            onSelect(s)
                            setOpen(false)
                          }}
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
                  {filteredContacts.length > 0 &&
                    filteredCompanies.length > 0 && <CommandSeparator />}
                  {filteredCompanies.length > 0 && (
                    <CommandGroup heading="Companies">
                      {filteredCompanies.map((s) => (
                        <CommandItem
                          key={`Company-${s.id}`}
                          value={`company-${s.id}`}
                          onSelect={() => {
                            onSelect(s)
                            setOpen(false)
                          }}
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
                          onSelect={() => {
                            onSelect(s)
                            setOpen(false)
                          }}
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

  const [selectedSubject, setSelectedSubject] =
    useState<ActivitySubject | null>(null)
  const [kind, setKind] = useState<ActivityKind>("note")
  const [body, setBody] = useState("")
  const [occurredAt, setOccurredAt] = useState(todayDateString())
  const [processing, setProcessing] = useState(false)

  const resolvedSubjectType = showSubjectPicker
    ? selectedSubject?.type
    : subjectType
  const resolvedSubjectId = showSubjectPicker ? selectedSubject?.id : subjectId

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
        <Button type="submit" className="gap-1.5" disabled={!canSubmit}>
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

// Trigger-less dialog mounted globally in the app layout, opened via openActivityLogDialog().
export function GlobalActivityLogDialog() {
  const [open, setOpen] = useState(false)
  const [subjects, setSubjects] = useState<ActivitySubject[] | null>(null)

  useEffect(() => {
    async function handleOpen() {
      if (subjects === null) {
        try {
          const res = await fetch(subjectsActivitiesPath(), {
            headers: { Accept: "application/json" },
          })
          const data = (await res.json()) as ActivitySubject[]
          setSubjects(data)
        } catch {
          // Open the dialog even if the fetch fails — subject picker will be empty
          setSubjects([])
        }
      }
      setOpen(true)
    }
    document.addEventListener("activity-log-dialog:open", handleOpen)
    return () =>
      document.removeEventListener("activity-log-dialog:open", handleOpen)
  }, [subjects])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
        </DialogHeader>
        <ActivityLogForm subjects={subjects ?? []} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
