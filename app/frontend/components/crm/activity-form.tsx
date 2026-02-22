import { useForm } from "@inertiajs/react"
import { Mail, MessageSquare, Phone } from "lucide-react"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { activitiesPath } from "@/routes"
import type { ActivityKind } from "@/types"

const KINDS: { value: ActivityKind; label: string; icon: React.ElementType }[] = [
  { value: "note", label: "Note", icon: MessageSquare },
  { value: "call", label: "Call", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
]

interface ActivityFormProps {
  subjectType: string
  subjectId: number
  onCancel: () => void
}

export function ActivityForm({ subjectType, subjectId, onCancel }: ActivityFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { data, setData, post, processing, reset, errors } = useForm({
    subject_type: subjectType,
    subject_id: subjectId,
    kind: "note" as ActivityKind,
    body: "",
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    post(activitiesPath(), {
      preserveScroll: true,
      onSuccess: () => {
        reset("body")
        onCancel()
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-lg border bg-muted/30 px-3 py-3">
      {/* Kind picker */}
      <div className="flex gap-1">
        {KINDS.map(({ value, label, icon: Icon }) => (
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
            <Icon className="size-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div>
        <Textarea
          ref={textareaRef}
          name="body"
          value={data.body}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData("body", e.target.value)}
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
            if (e.key === "Escape") onCancel()
          }}
        />
        {errors.body && <p className="mt-1 text-xs text-destructive">{errors.body}</p>}
      </div>

      <div className="flex gap-1.5">
        <Button type="submit" size="sm" className="h-7 px-2.5 text-xs" disabled={processing || !data.body.trim()}>
          Log {KINDS.find((k) => k.value === data.kind)?.label ?? data.kind}
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-7 px-2.5 text-xs" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
