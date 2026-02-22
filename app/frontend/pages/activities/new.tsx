import { Head, useForm } from "@inertiajs/react"
import { useRef } from "react"
import { Modal } from "@inertiaui/modal-react"
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

interface Props {
  subject_type?: string | null
  subject_id?: number | null
}

export default function ActivitiesNew({ subject_type, subject_id }: Props) {
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const { data, setData, post, processing, errors } = useForm({
    kind: "note" as ActivityKind,
    body: "",
    ...(subject_type ? { subject_type } : {}),
    ...(subject_id ? { subject_id } : {}),
  })

  return (
    <Modal>
      {({ close }) => {
        function handleSubmit(e: React.FormEvent) {
          e.preventDefault()
          post(activitiesPath(), { onSuccess: () => close() })
        }

        return (
        <>
          <Head title="Log Activity" />
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Log Activity</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Kind selector */}
              <div className="flex gap-1">
                {KINDS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setData("kind", value)
                      if (!data.body.trim()) {
                        const el = bodyRef.current
                        if (el) {
                          el.focus()
                          el.setSelectionRange(el.value.length, el.value.length)
                        }
                      }
                    }}
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
                  ref={bodyRef}
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
                  rows={4}
                  className="resize-none"
                />
                {errors.body && <p className="mt-1 text-xs text-destructive">{errors.body}</p>}
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={processing || !data.body.trim()}>
                  Log {KINDS.find((k) => k.value === data.kind)?.label ?? data.kind}
                </Button>
                <Button type="button" variant="outline" onClick={close}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </>
        )
      }}
    </Modal>
  )
}

ActivitiesNew.layout = (page: React.ReactNode) => <>{page}</>
