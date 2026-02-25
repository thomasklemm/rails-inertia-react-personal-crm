import type { InertiaFormProps } from "@inertiajs/react"

import { TAG_LABELS, TAG_STYLES } from "@/components/crm/tag-badge"
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
import { cn } from "@/lib/utils"
import type { Company, Tag } from "@/types"

const ALL_TAGS: Tag[] = [
  "customer",
  "friend",
  "investor",
  "lead",
  "partner",
  "prospect",
  "vip",
  "vendor",
]

export interface ContactFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  notes: string
  company_id: string
  follow_up_at: string
  tags: Tag[]
}

interface ContactFormProps {
  form: InertiaFormProps<ContactFormData>
  companies: Company[]
  cancelHref: string
  submitLabel: string
  autoFocus?: boolean
}

export function ContactForm({
  form,
  companies,
  cancelHref,
  submitLabel,
  autoFocus = true,
}: ContactFormProps) {
  const { data, setData, errors, processing } = form

  function toggleTag(tag: Tag) {
    const next = data.tags.includes(tag)
      ? data.tags.filter((t) => t !== tag)
      : [...data.tags, tag]
    setData("tags", next)
  }

  return (
    <div className="space-y-5">
      {/* Name */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">First name</Label>
          <Input
            id="first_name"
            name="first_name"
            value={data.first_name}
            onChange={(e) => setData("first_name", e.target.value)}
            autoFocus={autoFocus}
            autoComplete="given-name"
          />
          {errors.first_name && (
            <p className="text-destructive text-xs">{errors.first_name}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name">Last name</Label>
          <Input
            id="last_name"
            name="last_name"
            value={data.last_name}
            onChange={(e) => setData("last_name", e.target.value)}
            autoComplete="family-name"
          />
          {errors.last_name && (
            <p className="text-destructive text-xs">{errors.last_name}</p>
          )}
        </div>
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={data.email}
            onChange={(e) => setData("email", e.target.value)}
            autoComplete="email"
            spellCheck={false}
          />
          {errors.email && (
            <p className="text-destructive text-xs">{errors.email}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => setData("phone", e.target.value)}
            autoComplete="tel"
          />
          {errors.phone && (
            <p className="text-destructive text-xs">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Company */}
      <div className="space-y-1.5">
        <Label htmlFor="company_id">Company</Label>
        <Select
          value={data.company_id || "none"}
          onValueChange={(v) => setData("company_id", v === "none" ? "" : v)}
        >
          <SelectTrigger id="company_id">
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

      {/* Tags */}
      <fieldset className="space-y-1.5">
        <legend className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Tags
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TAGS.map((tag) => {
            const isSelected = data.tags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={data.tags.includes(tag)}
                className={cn(
                  "cursor-pointer rounded-full border px-2.5 py-0.5 text-sm font-medium capitalize transition-colors",
                  isSelected
                    ? TAG_STYLES[tag]
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                {TAG_LABELS[tag] ?? tag}
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={data.notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setData("notes", e.target.value)
          }
          rows={4}
          className="resize-none"
        />
      </div>

      {/* Follow-up Date */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="follow_up_at">Follow-up Date</Label>
          {data.follow_up_at && (
            <button
              type="button"
              onClick={() => setData("follow_up_at", "")}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Clear
            </button>
          )}
        </div>
        <Input
          id="follow_up_at"
          name="follow_up_at"
          type="date"
          value={data.follow_up_at}
          onChange={(e) => setData("follow_up_at", e.target.value)}
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
