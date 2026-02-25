import { Link } from "@inertiajs/react"
import { ArrowRight, Star } from "lucide-react"

import { ContactAvatar } from "@/components/crm/contact-avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { contactPath, contactsPath } from "@/routes"
import type { Contact } from "@/types"

interface DashboardStarredContactsProps {
  contacts: Contact[]
}

export function DashboardStarredContacts({
  contacts,
}: DashboardStarredContactsProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3">
        <CardTitle className="text-base font-semibold">
          Starred Contacts
        </CardTitle>
        <Link
          href={contactsPath({ filter: "starred" })}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
        >
          View All
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>

      <div className="border-b" />
      <CardContent className="p-0">
        {contacts.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center gap-2 px-6 py-8 text-center text-sm">
            <Star className="text-muted-foreground/40 size-7" />
            <p className="text-sm">No starred contacts yet.</p>
            <Link
              href={contactsPath()}
              className="text-primary text-xs hover:underline"
            >
              Browse Contacts
            </Link>
          </div>
        ) : (
          <div className="scrollbar-card max-h-72 divide-y overflow-y-scroll overscroll-contain">
            {contacts.map((contact) => (
              <Link
                key={contact.id}
                href={contactPath(contact.id)}
                className="hover:bg-muted/40 flex items-center gap-3 px-4 py-2 transition-colors"
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
                <ArrowRight className="text-muted-foreground/40 size-3.5 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
