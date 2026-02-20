import type { InertiaFormProps } from "@inertiajs/react"

import { COMPANY_TAG_LABELS, COMPANY_TAG_STYLES } from "@/components/crm/tag-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { CompanyTag } from "@/types"

const ALL_COMPANY_TAGS: CompanyTag[] = [
  "saas",
  "fintech",
  "healthcare",
  "agency",
  "consulting",
  "ecommerce",
  "media",
  "manufacturing",
  "logistics",
  "education",
  "nonprofit",
]

export interface CompanyFormData {
  name: string
  website: string
  phone: string
  email: string
  address: string
  notes: string
  tags: CompanyTag[]
}

interface CompanyFormProps {
  form: InertiaFormProps<CompanyFormData>
  cancelHref: string
  submitLabel: string
  autoFocus?: boolean
}

export function CompanyForm({ form, cancelHref, submitLabel, autoFocus = true }: CompanyFormProps) {
  const { data, setData, errors, processing } = form

  function toggleTag(tag: CompanyTag) {
    const next = data.tags.includes(tag)
      ? data.tags.filter((t) => t !== tag)
      : [...data.tags, tag]
    setData("tags", next)
  }

  return (
    <div className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Company name</Label>
        <Input
          id="name"
          name="name"
          value={data.name}
          onChange={(e) => setData("name", e.target.value)}
          autoFocus={autoFocus}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Website */}
      <div className="space-y-1.5">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          type="url"
          value={data.website}
          onChange={(e) => setData("website", e.target.value)}
          placeholder="https://example.com"
        />
        {errors.website && <p className="text-xs text-destructive">{errors.website}</p>}
      </div>

      {/* Phone + Email */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => setData("phone", e.target.value)}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={data.email}
            onChange={(e) => setData("email", e.target.value)}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={data.address}
          onChange={(e) => setData("address", e.target.value)}
        />
        {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
      </div>

      {/* Industry tags */}
      <div className="space-y-2">
        <Label>Industry</Label>
        <div className="flex flex-wrap gap-1.5">
          {ALL_COMPANY_TAGS.map((tag) => {
            const isSelected = data.tags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  "cursor-pointer rounded-full border px-2.5 py-0.5 text-sm font-medium capitalize transition-colors",
                  isSelected
                    ? COMPANY_TAG_STYLES[tag]
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                {COMPANY_TAG_LABELS[tag] ?? tag}
              </button>
            )
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={data.notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData("notes", e.target.value)}
          rows={6}
          className="resize-none"
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
