import { Head, useForm, usePage } from "@inertiajs/react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import AppLayout from "@/layouts/app-layout"
import { activitiesPath, activityPath, contactPath } from "@/routes"
import type { Activity, ActivityKind, BreadcrumbItem } from "@/types"

interface Props {
  activity: Activity
  [key: string]: unknown
}

export default function ActivitiesEdit() {
  const { activity } = usePage<Props>().props

  const form = useForm({
    kind: activity.kind,
    body: activity.body,
    contact_id: String(activity.contact.id),
  })
  const { data, setData, patch, processing, errors } = form

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    patch(activityPath(activity.id))
  }

  return (
    <>
      <Head title="Edit Activity" />
      <div className="p-6">
        <h2 className="mb-6 text-lg font-semibold">
          Edit activity for {activity.contact.first_name} {activity.contact.last_name}
        </h2>

        <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="kind">Type</Label>
            <Select
              value={data.kind}
              onValueChange={(v) => setData("kind", v as ActivityKind)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body">Details</Label>
            <Textarea
              id="body"
              name="body"
              value={data.body}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData("body", e.target.value)}
              rows={5}
              className="resize-none"
            />
            {errors.body && <p className="text-xs text-destructive">{errors.body}</p>}
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={processing}>
              Save changes
            </Button>
            <Button variant="outline" asChild>
              <a href={contactPath(activity.contact.id)}>Cancel</a>
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Activity Log", href: activitiesPath() },
  { title: "Edit", href: "#" },
]

ActivitiesEdit.layout = (page: ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
)
