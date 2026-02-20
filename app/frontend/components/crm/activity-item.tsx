import { router } from "@inertiajs/react"
import { Mail, MessageSquare, Pencil, Phone, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { activityPath, editActivityPath } from "@/routes"
import type { Activity } from "@/types"

const KIND_ICONS = {
  note: MessageSquare,
  call: Phone,
  email: Mail,
}

const KIND_COLORS = {
  note: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  call: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  email: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
}

interface ActivityItemProps {
  activity: Activity
  showContact?: boolean
}

export function ActivityItem({ activity, showContact = false }: ActivityItemProps) {
  const Icon = KIND_ICONS[activity.kind]

  function handleDelete() {
    if (confirm("Delete this activity?")) {
      router.delete(activityPath(activity.id), { preserveScroll: true })
    }
  }

  return (
    <div className="flex gap-3 py-3">
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${KIND_COLORS[activity.kind]}`}
      >
        <Icon className="size-3.5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium capitalize text-muted-foreground">
                {activity.kind}
              </span>
              {showContact && (
                <span className="text-xs text-muted-foreground">
                  · {activity.contact.first_name} {activity.contact.last_name}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                ·{" "}
                {new Date(activity.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <p className="mt-0.5 text-sm">{activity.body}</p>
          </div>

          <div className="flex shrink-0 gap-1">
            <Button size="icon" variant="ghost" className="size-6" asChild>
              <a href={editActivityPath(activity.id)}>
                <Pencil className="size-3" />
              </a>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-6 hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
