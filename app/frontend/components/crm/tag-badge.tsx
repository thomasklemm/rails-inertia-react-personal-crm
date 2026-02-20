import { Badge } from "@/components/ui/badge"
import type { CompanyTag, Tag } from "@/types"

export const TAG_STYLES: Record<Tag, string> = {
  customer: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  friend: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  investor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  lead: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  partner: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  prospect: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  vip: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  vendor: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
}

export const TAG_LABELS: Partial<Record<Tag, string>> = {
  vip: "VIP",
}

export const COMPANY_TAG_LABELS: Partial<Record<CompanyTag, string>> = {
  saas: "SaaS",
}

export const COMPANY_TAG_STYLES: Record<CompanyTag, string> = {
  saas: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  fintech: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  healthcare: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  agency: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  consulting: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  ecommerce: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  media: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  manufacturing: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  logistics: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  education: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  nonprofit: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
}

interface TagBadgeProps {
  tag: Tag
}

interface CompanyTagBadgeProps {
  tag: CompanyTag
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`border-0 px-1.5 py-0 text-[10px] font-medium capitalize leading-5 ${TAG_STYLES[tag]}`}
    >
      {TAG_LABELS[tag] ?? tag}
    </Badge>
  )
}

export function CompanyTagBadge({ tag }: CompanyTagBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`border-0 px-1.5 py-0 text-[10px] font-medium capitalize leading-5 ${COMPANY_TAG_STYLES[tag]}`}
    >
      {COMPANY_TAG_LABELS[tag] ?? tag}
    </Badge>
  )
}
