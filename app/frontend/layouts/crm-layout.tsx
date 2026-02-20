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
  const { contacts, q, filter, sort, sort_dir, contact } = usePage<CrmPageProps>().props

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left panel — contact list */}
      <div className="flex w-72 shrink-0 flex-col overflow-hidden border-r">
        <ContactList
          contacts={contacts ?? []}
          q={q}
          filter={filter}
          sort={sort}
          sort_dir={sort_dir}
          activeContactId={contact?.id}
        />
      </div>

      {/* Right panel — page content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">{children}</div>
    </div>
  )
}
