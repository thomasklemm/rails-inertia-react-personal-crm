import { router, useForm } from "@inertiajs/react"
import {
  Building2,
  Check,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  Trash2,
  TrendingUp,
  User,
  X,
} from "lucide-react"
import { useRef, useState } from "react"

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
import { Textarea } from "@/components/ui/textarea"
import {
  activitiesPath,
  activityPath,
  companyPath,
  contactPath,
  dealPath,
} from "@/routes"
import type { Activity, ActivityKind } from "@/types"

const KIND_ICONS = {
  note: MessageSquare,
  call: Phone,
  email: Mail,
}

const KINDS: { value: ActivityKind; label: string; icon: React.ElementType }[] =
  [
    { value: "note", label: "Note", icon: MessageSquare },
    { value: "call", label: "Call", icon: Phone },
    { value: "email", label: "Email", icon: Mail },
  ]

export function timeAgo(dateString: string) {
  const ms = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(ms / 60_000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return "1 day ago"
  return `${days} days ago`
}

interface ActivityItemProps {
  activity: Activity
  showSubject?: boolean
  isLast?: boolean
}

export function ActivityItem({
  activity,
  showSubject = false,
  isLast = true,
}: ActivityItemProps) {
  const Icon = KIND_ICONS[activity.kind]
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editKind, setEditKind] = useState<ActivityKind>(activity.kind)
  const [editBody, setEditBody] = useState(activity.body)
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function startEdit() {
    setEditKind(activity.kind)
    setEditBody(activity.body)
    setEditing(true)
    setTimeout(() => {
      textareaRef.current?.focus()
      textareaRef.current?.select()
    }, 0)
  }

  function cancelEdit() {
    setEditing(false)
    setEditKind(activity.kind)
    setEditBody(activity.body)
  }

  function saveEdit() {
    if (!editBody.trim()) return
    setSaving(true)
    router.patch(
      activityPath(activity.id),
      { kind: editKind, body: editBody },
      {
        preserveScroll: true,
        onSuccess: () => {
          setEditing(false)
          setSaving(false)
        },
        onError: () => setSaving(false),
      },
    )
  }

  function confirmDelete() {
    router.delete(activityPath(activity.id), { preserveScroll: true })
  }

  const EditIcon = KIND_ICONS[editKind]

  return (
    <>
      <div className="group relative flex gap-3">
        {/* Icon + vertical connector line */}
        <div className="flex flex-col items-center">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            {editing ? (
              <EditIcon className="size-3" />
            ) : (
              <Icon className="size-3" />
            )}
          </div>
          {!isLast && <div className="bg-border mt-1 w-px flex-1" />}
        </div>

        {/* Content */}
        <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-3"}`}>
          {editing ? (
            /* ── Inline edit form ── */
            <div className="space-y-2">
              {/* Kind picker */}
              <div className="flex gap-1">
                {KINDS.map(({ value, label, icon: KIcon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setEditKind(value)}
                    className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                      editKind === value
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <KIcon className="size-3" />
                    {label}
                  </button>
                ))}
              </div>
              {/* Body textarea */}
              <Textarea
                ref={textareaRef}
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={3}
                className="resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveEdit()
                  if (e.key === "Escape") cancelEdit()
                }}
              />
              {/* Actions */}
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  className="h-7 gap-1 px-2.5 text-xs"
                  onClick={saveEdit}
                  disabled={saving || !editBody.trim()}
                >
                  <Check className="size-3" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 px-2.5 text-xs"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  <X className="size-3" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* ── Static view ── */
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-sm font-medium capitalize">
                    {activity.kind}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {timeAgo(activity.created_at)}
                  </span>
                  {showSubject && (
                    <a
                      href={
                        activity.subject.type === "Contact"
                          ? contactPath(activity.subject.id)
                          : activity.subject.type === "Deal"
                            ? dealPath(activity.subject.id)
                            : companyPath(activity.subject.id)
                      }
                      className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
                    >
                      {activity.subject.type === "Contact" ? (
                        <User className="size-3 shrink-0" />
                      ) : activity.subject.type === "Deal" ? (
                        <TrendingUp className="size-3 shrink-0" />
                      ) : (
                        <Building2 className="size-3 shrink-0" />
                      )}
                      {activity.subject.name}
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-6"
                    title="Edit"
                    onClick={startEdit}
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:text-destructive size-6"
                    title="Delete"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
              <p
                className="text-foreground/80 mt-0.5 cursor-text text-sm"
                onDoubleClick={startEdit}
                title="Double-click to edit"
              >
                {activity.body}
              </p>
            </>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete activity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this activity and cannot be undone.
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

interface ActivityNewItemProps {
  subjectType: string
  subjectId: number
  onCancel: () => void
  isLast?: boolean
}

export function ActivityNewItem({
  subjectType,
  subjectId,
  onCancel,
  isLast = true,
}: ActivityNewItemProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { data, setData, post, processing, errors } = useForm({
    subject_type: subjectType,
    subject_id: subjectId,
    kind: "note" as ActivityKind,
    body: "",
  })

  const KindIcon = KIND_ICONS[data.kind]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.body.trim()) return
    post(activitiesPath(), {
      preserveScroll: true,
      onSuccess: () => onCancel(),
    })
  }

  return (
    <div className="relative flex gap-3">
      {/* Icon + connector */}
      <div className="flex flex-col items-center">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          <KindIcon className="size-3" />
        </div>
        {!isLast && <div className="bg-border mt-1 w-px flex-1" />}
      </div>

      {/* Content — matches ActivityItem editing mode exactly */}
      <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-3"}`}>
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Kind picker */}
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
                if (data.body.trim())
                  handleSubmit(e as unknown as React.FormEvent)
              }
              if (e.key === "Escape") onCancel()
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
              onClick={onCancel}
              disabled={processing}
            >
              <X className="size-3" />
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
