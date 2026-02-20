import { useForm } from "@inertiajs/react"
import { Mail, MessageSquare, Phone } from "lucide-react"

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
  contactId: number
}

export function ActivityForm({ contactId }: ActivityFormProps) {
  const { data, setData, post, processing, reset, errors } = useForm({
    contact_id: contactId,
    kind: "note" as ActivityKind,
    body: "",
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    post(activitiesPath(), {
      preserveScroll: true,
      onSuccess: () => reset("body"),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="text-sm font-semibold">Log activity</h3>

      {/* Kind selector */}
      <div className="flex gap-1">
        {KINDS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setData("kind", value)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              data.kind === value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div>
        <Textarea
          name="body"
          value={data.body}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData("body", e.target.value)}
          placeholder={
            data.kind === "note"
              ? "Add a note…"
              : data.kind === "call"
                ? "What was discussed?"
                : "Email summary…"
          }
          rows={3}
          className="resize-none text-sm"
        />
        {errors.body && <p className="mt-1 text-xs text-destructive">{errors.body}</p>}
      </div>

      <input type="hidden" name="contact_id" value={contactId} />

      <Button type="submit" size="sm" disabled={processing || !data.body.trim()}>
        Log {data.kind}
      </Button>
    </form>
  )
}
