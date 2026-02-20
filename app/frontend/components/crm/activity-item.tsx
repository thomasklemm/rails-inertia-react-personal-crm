import { router, usePage } from "@inertiajs/react"
import { Mail, MessageSquare, Pencil, Phone, Trash2 } from "lucide-react"
import { useState } from "react"

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
import { activityPath, companyPath, contactPath, editActivityPath } from "@/routes"
import type { Activity } from "@/types"

const KIND_ICONS = {
  note: MessageSquare,
  call: Phone,
  email: Mail,
}

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
  showContact?: boolean
  isLast?: boolean
}

export function ActivityItem({ activity, showContact = false, isLast = true }: ActivityItemProps) {
  const Icon = KIND_ICONS[activity.kind]
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { url } = usePage()

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
          {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
        </div>

        {/* Content */}
        <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-3"}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-medium capitalize">{activity.kind}</span>
              <span className="text-xs text-muted-foreground">{timeAgo(activity.created_at)}</span>
              {showContact && activity.contact && (
                <a
                  href={contactPath(activity.contact.id)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {activity.contact.first_name} {activity.contact.last_name}
                </a>
              )}
              {showContact && activity.company && !activity.contact && (
                <a
                  href={companyPath(activity.company.id)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {activity.company.name}
                </a>
              )}
            </div>
            <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button size="icon" variant="ghost" className="size-6" asChild>
                <a href={editActivityPath(activity.id, { return_to: url })}>
                  <Pencil className="size-3" />
                </a>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-6 hover:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
          <p className="mt-0.5 text-sm text-foreground/80">{activity.body}</p>
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
