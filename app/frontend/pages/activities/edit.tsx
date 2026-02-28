import { Head, useForm } from "@inertiajs/react"
import { Modal } from "@inertiaui/modal-react"

import { ActivityDatePicker } from "@/components/crm/activity-date-picker"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toDateString, todayDateString } from "@/lib/dates"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { activityPath } from "@/routes"
import type { Activity, ActivityKind } from "@/types"

interface Props {
  activity: Activity
}

export default function ActivitiesEdit({ activity }: Props) {
  const form = useForm({
    kind: activity.kind,
    body: activity.body,
    subject_type: activity.subject.type,
    subject_id: activity.subject.id,
    occurred_at: activity.occurred_at
      ? toDateString(new Date(activity.occurred_at))
      : todayDateString(),
  })
  const { data, setData, patch, processing, errors } = form

  const subjectName = activity.subject.name

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    patch(activityPath(activity.id))
  }

  return (
    <Modal>
      <Head
        title={`Edit Activity${subjectName ? ` for ${subjectName}` : ""}`}
      />
      <div className="p-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Edit Activity</h2>
          {subjectName && (
            <p className="text-muted-foreground mt-0.5 text-sm">
              {subjectName}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="kind">Type</Label>
            <Select
              value={data.kind}
              onValueChange={(v) => setData("kind", v as ActivityKind)}
            >
              <SelectTrigger id="kind">
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
            <Label>Date</Label>
            <ActivityDatePicker
              value={data.occurred_at}
              onChange={(d) => setData("occurred_at", d)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body">Details</Label>
            <Textarea
              id="body"
              name="body"
              value={data.body}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setData("body", e.target.value)
              }
              rows={5}
              className="resize-none"
            />
            {errors.body && (
              <p className="text-destructive text-xs">{errors.body}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={processing}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

ActivitiesEdit.layout = (page: React.ReactNode) => <>{page}</>
