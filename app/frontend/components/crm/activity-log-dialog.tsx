import { router } from "@inertiajs/react"
import {
  Building2,
  Check,
  ChevronsUpDown,
  Linkedin,
  Mail,
  MessageSquare,
  Phone,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react"
import { useRef, useState } from "react"

import { ActivityDatePicker } from "@/components/crm/activity-date-picker"
import { todayDateString } from "@/lib/dates"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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

interface SubjectPickerProps {
  subjects: ActivitySubject[]
  selected: ActivitySubject | null
  onSelect: (subject: ActivitySubject) => void
}

function SubjectPicker({ subjects, selected, onSelect }: SubjectPickerProps) {
  const [open, setOpen] = useState(false)

  const contacts = subjects.filter((s) => s.type === "Contact")
  const companies = subjects.filter((s) => s.type === "Company")
  const deals = subjects.filter((s) => s.type === "Deal")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-8 w-full justify-between px-3 text-xs font-normal"
        >
          {selected ? (
            <span className="flex items-center gap-1.5">
              <SubjectIcon type={selected.type} />
              {selected.name}
            </span>
          ) : (
            <span className="text-muted-foreground">
              Select contact, company, or deal…
            </span>
          )}
          <ChevronsUpDown className="text-muted-foreground size-3.5 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {contacts.length > 0 && (
              <CommandGroup heading="Contacts">
                {contacts.map((s) => (
                  <CommandItem
                    key={`Contact-${s.id}`}
                    value={`contact-${s.name}`}
                    onSelect={() => {
                      onSelect(s)
                      setOpen(false)
                    }}
                  >
                    <User className="size-3.5" />
                    {s.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {contacts.length > 0 && companies.length > 0 && (
              <CommandSeparator />
            )}
            {companies.length > 0 && (
              <CommandGroup heading="Companies">
                {companies.map((s) => (
                  <CommandItem
                    key={`Company-${s.id}`}
                    value={`company-${s.name}`}
                    onSelect={() => {
                      onSelect(s)
                      setOpen(false)
                    }}
                  >
                    <Building2 className="size-3.5" />
                    {s.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {companies.length > 0 && deals.length > 0 && <CommandSeparator />}
            {deals.length > 0 && (
              <CommandGroup heading="Deals">
                {deals.map((s) => (
                  <CommandItem
                    key={`Deal-${s.id}`}
                    value={`deal-${s.name}`}
                    onSelect={() => {
                      onSelect(s)
                      setOpen(false)
                    }}
                  >
                    <TrendingUp className="size-3.5" />
                    {s.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
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
          autoFocus
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
      <div className="flex gap-1.5">
        <Button
          type="submit"
          size="sm"
          className="h-7 gap-1 px-2.5 text-xs"
          disabled={!canSubmit}
        >
          <Check className="size-3" />
          Log {KINDS.find((k) => k.value === kind)?.label}
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
      <DialogContent className="sm:max-w-md">
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
