import type { InertiaFormProps } from "@inertiajs/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { DealStage } from "@/types"

export const STAGE_LABELS: Record<DealStage, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
}

export interface DealFormData {
  title: string
  stage: DealStage
  value: string        // dollars as string for the input
  closed_at: string
  notes: string
  contact_id: string
  company_id: string
}

interface Contact {
  id: number
  first_name: string
  last_name: string
}

interface Company {
  id: number
  name: string
}

interface DealFormProps {
  form: InertiaFormProps<DealFormData>
  stages: string[]
  contacts: Contact[]
  companies: Company[]
  cancelHref: string
  submitLabel: string
}

export function DealForm({ form, stages, contacts, companies, cancelHref, submitLabel }: DealFormProps) {
  const { data, setData, errors, processing } = form

  const showClosedAt = data.stage === "closed_won" || data.stage === "closed_lost"

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Deal Title</Label>
        <Input
          id="title"
          name="title"
          value={data.title}
          onChange={(e) => setData("title", e.target.value)}
          placeholder="e.g. Acme Corp — Enterprise Plan"
          autoFocus
        />
        {errors.title && (
          <p className="text-destructive text-xs">{errors.title}</p>
        )}
      </div>

      {/* Stage + Value */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="stage">Stage</Label>
          <Select
            value={data.stage}
            onValueChange={(v) => setData("stage", v as DealStage)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stages.map((s) => (
                <SelectItem key={s} value={s}>
                  {STAGE_LABELS[s as DealStage] ?? s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="value">Value ($)</Label>
          <Input
            id="value"
            name="value"
            type="number"
            min="0"
            step="0.01"
            value={data.value}
            onChange={(e) => setData("value", e.target.value)}
            placeholder="0.00"
          />
          {errors.value && (
            <p className="text-destructive text-xs">{errors.value}</p>
          )}
        </div>
      </div>

      {/* Contact + Company */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="contact_id">Contact</Label>
          <Select
            value={data.contact_id || "none"}
            onValueChange={(v) => setData("contact_id", v === "none" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="No contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No contact</SelectItem>
              {contacts.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.first_name} {c.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company_id">Company</Label>
          <Select
            value={data.company_id || "none"}
            onValueChange={(v) => setData("company_id", v === "none" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="No company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No company</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Closed Date — only show when stage is closed */}
      {showClosedAt && (
        <div className="space-y-1.5">
          <Label htmlFor="closed_at">Closed Date</Label>
          <Input
            id="closed_at"
            name="closed_at"
            type="date"
            value={data.closed_at}
            onChange={(e) => setData("closed_at", e.target.value)}
          />
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={data.notes}
          onChange={(e) => setData("notes", e.target.value)}
          rows={3}
          className="resize-none"
          placeholder="Deal notes, context, next steps…"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={processing}>
          {submitLabel}
        </Button>
        <Button variant="outline" asChild>
          <a href={cancelHref}>Cancel</a>
        </Button>
      </div>
    </div>
  )
}
