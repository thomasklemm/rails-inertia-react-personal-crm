import { Badge } from "@/components/ui/badge"
import type { Tag } from "@/types"

const TAG_STYLES: Record<Tag, string> = {
  customer: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  friend: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  investor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  lead: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  partner: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  prospect: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  vip: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  vendor: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
}

interface TagBadgeProps {
  tag: Tag
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`border-0 px-2 py-0.5 text-xs font-medium capitalize ${TAG_STYLES[tag]}`}
    >
      {tag}
    </Badge>
  )
}
