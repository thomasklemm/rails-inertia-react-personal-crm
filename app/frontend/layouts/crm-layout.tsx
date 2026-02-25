import { usePage } from "@inertiajs/react"
import type { ReactNode } from "react"

import { ContactList } from "@/components/crm/contact-list"
import type { Contact } from "@/types"

interface CrmPageProps {
  contacts: Contact[]
  q?: string
  filter?: string
  sort?: string
  sort_dir?: string
  contact?: { id: number }
  [key: string]: unknown
}

export function CrmLayout({ children }: { children: ReactNode }) {
  const { contacts, q, filter, sort, sort_dir, contact } =
    usePage<CrmPageProps>().props

  const hasContact = contact?.id != null

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left panel — contact list.
          Mobile: full-width when no contact selected, hidden when contact shown.
          Desktop (md+): always visible as fixed-width sidebar. */}
      <div
        className={`flex shrink-0 flex-col overflow-hidden border-r ${
          hasContact ? "hidden md:flex" : "w-full md:w-auto"
        }`}
      >
        <ContactList
          contacts={contacts ?? []}
          q={q}
          filter={filter}
          sort={sort}
          sort_dir={sort_dir}
          activeContactId={contact?.id}
        />
      </div>

      {/* Right panel — page content.
          Mobile: hidden when no contact selected, full-width when contact shown.
          Desktop (md+): always visible, fills remaining space. */}
      <div
        className={`flex min-w-0 flex-1 flex-col overflow-hidden ${
          hasContact ? "" : "hidden md:flex"
        }`}
      >
        {children}
      </div>
    </div>
  )
}
