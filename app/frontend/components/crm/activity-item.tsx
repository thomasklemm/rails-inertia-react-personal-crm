import { router } from "@inertiajs/react"
import {
  Building2,
  Check,
  Linkedin,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react"
import { useState } from "react"

import { ActivityDatePicker } from "@/components/crm/activity-date-picker"
import { occurrenceLabel, toDateString, todayDateString } from "@/lib/dates"

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { activityPath, companyPath, contactPath, dealPath } from "@/routes"
import type { Activity, ActivityKind } from "@/types"

const KIND_ICONS: Record<ActivityKind, React.ElementType> = {
  note: MessageSquare,
  call: Phone,
  email: Mail,
  meeting: Users,
  linkedin: Linkedin,
}

const KIND_LABELS: Record<ActivityKind, string> = {
  note: "Note",
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  linkedin: "LinkedIn",
}

const KINDS: { value: ActivityKind; label: string; icon: React.ElementType }[] =
  [
    { value: "note", label: "Note", icon: MessageSquare },
    { value: "call", label: "Call", icon: Phone },
    { value: "email", label: "Email", icon: Mail },
    { value: "meeting", label: "Meeting", icon: Users },
    { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  ]

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
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editKind, setEditKind] = useState<ActivityKind>(activity.kind)
  const [editBody, setEditBody] = useState(activity.body)
  const [editOccurredAt, setEditOccurredAt] = useState(
    activity.occurred_at
      ? toDateString(new Date(activity.occurred_at))
      : todayDateString(),
  )
  const [saving, setSaving] = useState(false)

  function openEditDialog() {
    setEditKind(activity.kind)
    setEditBody(activity.body)
    setEditOccurredAt(
      activity.occurred_at
        ? toDateString(new Date(activity.occurred_at))
        : todayDateString(),
    )
    setEditDialogOpen(true)
  }

  function saveEdit() {
    if (!editBody.trim()) return
    setSaving(true)
    router.patch(
      activityPath(activity.id),
      { kind: editKind, body: editBody, occurred_at: editOccurredAt },
      {
        preserveScroll: true,
        onSuccess: () => {
          setEditDialogOpen(false)
          setSaving(false)
        },
        onError: () => setSaving(false),
      },
    )
  }

  function confirmDelete() {
    router.delete(activityPath(activity.id), { preserveScroll: true })
  }

  return (
    <>
      <div className="group relative flex gap-3">
        {/* Icon + vertical connector line */}
        <div className="flex flex-col items-center">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Icon className="size-3" />
          </div>
          {!isLast && <div className="bg-border mt-1 w-px flex-1" />}
        </div>

        {/* Content */}
        <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-3"}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-medium">
                {KIND_LABELS[activity.kind]}
              </span>
              <span className="text-muted-foreground text-xs">
                {occurrenceLabel(activity.occurred_at)}
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
                aria-label="Edit activity"
                onClick={openEditDialog}
              >
                <Pencil className="size-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="hover:text-destructive size-6"
                title="Delete"
                aria-label="Delete activity"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
          <p className="text-foreground/80 mt-0.5 text-sm">{activity.body}</p>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Subject (read-only) */}
            <div className="space-y-1.5">
              <p className="text-muted-foreground text-xs font-medium">Who?</p>
              <div className="border-input bg-muted/40 text-muted-foreground flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
                {activity.subject.type === "Contact" ? (
                  <User className="size-4 shrink-0" />
                ) : activity.subject.type === "Deal" ? (
                  <TrendingUp className="size-4 shrink-0" />
                ) : (
                  <Building2 className="size-4 shrink-0" />
                )}
                <span className="truncate">{activity.subject.name}</span>
              </div>
            </div>

            {/* Kind picker */}
            <div className="space-y-1.5">
              <p className="text-muted-foreground text-xs font-medium">
                What?
              </p>
              <div className="bg-muted inline-flex rounded-lg border p-0.5">
                {KINDS.map(({ value, label, icon: KIcon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setEditKind(value)}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                      editKind === value
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
              <p className="text-muted-foreground text-xs font-medium">
                When?
              </p>
              <ActivityDatePicker
                value={editOccurredAt}
                onChange={setEditOccurredAt}
              />
            </div>

            {/* Body textarea */}
            <div className="space-y-1.5">
              <p className="text-muted-foreground text-xs font-medium">Details</p>
              <Textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={4}
                className="resize-none text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                className="gap-1.5"
                onClick={saveEdit}
                disabled={saving || !editBody.trim()}
              >
                <Check className="size-4" />
                Save Changes
              </Button>
              <Button
                variant="ghost"
                className="gap-1.5"
                onClick={() => setEditDialogOpen(false)}
                disabled={saving}
              >
                <X className="size-4" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
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
