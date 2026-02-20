import { Link } from "@inertiajs/react"
import { Archive, Star } from "lucide-react"

import { contactPath } from "@/routes"
import type { Contact } from "@/types"

import { ContactAvatar } from "./contact-avatar"
import { TagBadge } from "./tag-badge"

interface ContactRowProps {
  contact: Contact
  isActive: boolean
  q?: string
  filter?: string
  sort?: string
  sort_dir?: string
}

export function ContactRow({ contact, isActive, q, filter, sort, sort_dir }: ContactRowProps) {
  const params: Record<string, string> = {}
  if (q) params.q = q
  if (filter) params.filter = filter
  if (sort) params.sort = sort
  if (sort_dir) params.sort_dir = sort_dir

  return (
    <Link
      href={contactPath(contact.id, params)}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
      }`}
      prefetch
    >
      <ContactAvatar contact={contact} size="sm" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">
            {contact.first_name} {contact.last_name}
          </span>
          {contact.starred && (
            <Star className="size-3 shrink-0 fill-amber-400 text-amber-400" />
          )}
          {contact.archived && (
            <Archive className="size-3 shrink-0 text-muted-foreground" />
          )}
        </div>
        {contact.company && (
          <p className="truncate text-xs text-muted-foreground">{contact.company.name}</p>
        )}
        {contact.tags.length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {contact.tags.slice(0, 2).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
            {contact.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">+{contact.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
