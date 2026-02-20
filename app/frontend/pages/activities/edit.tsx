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
import { activitiesPath, activityPath, companyPath, contactPath } from "@/routes"
import type { Activity, ActivityKind, BreadcrumbItem } from "@/types"

interface Props {
  activity: Activity
  return_to?: string
  [key: string]: unknown
}

export default function ActivitiesEdit() {
  const { activity, return_to } = usePage<Props>().props

  const form = useForm({
    kind: activity.kind,
    body: activity.body,
    contact_id: activity.contact ? String(activity.contact.id) : "",
    company_id: activity.company ? String(activity.company.id) : "",
    return_to: return_to ?? "",
  })
  const { data, setData, patch, processing, errors } = form

  const subjectName = activity.contact
    ? `${activity.contact.first_name} ${activity.contact.last_name}`
    : (activity.company?.name ?? "")

  const cancelHref =
    return_to ??
    (activity.contact
      ? contactPath(activity.contact.id)
      : companyPath(activity.company!.id))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    patch(activityPath(activity.id))
  }

  return (
    <>
      <Head title={`Edit Activity${subjectName ? ` for ${subjectName}` : ""}`} />
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Edit Activity</h2>
          {subjectName && <p className="mt-0.5 text-sm text-muted-foreground">{subjectName}</p>}
        </div>

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
              Save Changes
            </Button>
            <Button variant="outline" asChild>
              <a href={cancelHref}>Cancel</a>
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
