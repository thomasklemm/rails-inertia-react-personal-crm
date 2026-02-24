import { Link } from "@inertiajs/react"
import { ArrowRight, Star } from "lucide-react"

import { ContactAvatar } from "@/components/crm/contact-avatar"
import { contactPath, contactsPath } from "@/routes"
import type { Contact } from "@/types"

interface DashboardStarredContactsProps {
  contacts: Contact[]
}

export function DashboardStarredContacts({
  contacts,
}: DashboardStarredContactsProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Starred Contacts</h2>
        <Link
          href={contactsPath({ starred: true })}
          className="text-primary flex items-center gap-1 text-sm font-medium hover:underline"
        >
          View All Starred
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {contacts.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-8 text-center text-sm">
          <Star className="text-muted-foreground/50 size-8" />
          <p>No Starred Contacts</p>
          <Link
            href={contactsPath()}
            className="text-primary text-sm hover:underline"
          >
            View All Contacts
          </Link>
        </div>
      ) : (
        <div className="space-y-1">
          {contacts.map((contact) => (
            <Link
              key={contact.id}
              href={contactPath(contact.id)}
              className="hover:bg-muted flex items-center gap-3 rounded-lg px-2 py-2 transition-colors"
            >
              <ContactAvatar contact={contact} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {contact.first_name} {contact.last_name}
                </p>
                {contact.company && (
                  <p className="text-muted-foreground truncate text-xs">
                    {contact.company.name}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
