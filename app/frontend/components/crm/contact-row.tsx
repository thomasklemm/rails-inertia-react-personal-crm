import { Link } from "@inertiajs/react"
import { Archive, Calendar, CalendarClock, Star } from "lucide-react"
import { useEffect, useRef } from "react"

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

export function ContactRow({
  contact,
  isActive,
  q,
  filter,
  sort,
  sort_dir,
}: ContactRowProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const params: Record<string, string> = {}
  if (q) params.q = q
  if (filter) params.filter = filter
  if (sort) params.sort = sort
  if (sort_dir) params.sort_dir = sort_dir

  useEffect(() => {
    if (isActive) ref.current?.scrollIntoView({ block: "nearest" })
  }, [isActive])

  return (
    <Link
      ref={ref}
      href={contactPath(contact.id, params)}
      className={`hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
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
            <Star
              className="size-3 shrink-0 fill-amber-400 text-amber-400"
              aria-hidden="true"
            />
          )}
          {contact.archived && (
            <Archive
              className="text-muted-foreground size-3 shrink-0"
              aria-hidden="true"
            />
          )}
          {contact.follow_up_at &&
            (() => {
              const today = new Date().toISOString().split("T")[0]
              const isOverdue = contact.follow_up_at <= today
              return isOverdue ? (
                <CalendarClock
                  className="size-3 shrink-0 text-amber-500"
                  aria-hidden="true"
                />
              ) : (
                <span
                  title={contact.follow_up_at ?? undefined}
                  className="shrink-0"
                >
                  <Calendar
                    className="text-muted-foreground size-3"
                    aria-hidden="true"
                  />
                </span>
              )
            })()}
        </div>
        {(contact.company != null || contact.tags.length > 0) && (
          <div className="mt-0.5 flex items-center gap-2 overflow-hidden">
            {contact.company && (
              <p className="text-muted-foreground shrink-0 truncate text-xs">
                {contact.company.name}
              </p>
            )}
            {contact.company && contact.tags.length > 0 && (
              <span className="text-muted-foreground/50 text-xs">·</span>
            )}
            {contact.tags.length > 0 && (
              <span className="flex items-center gap-1">
                <TagBadge tag={contact.tags[0]} />
                {contact.tags.length > 1 && (
                  <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                    +{contact.tags.length - 1}
                  </span>
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
