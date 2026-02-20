import { router } from "@inertiajs/react"
import { Search, UserPlus } from "lucide-react"
import { useCallback, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { contactsPath, newContactPath } from "@/routes"
import type { Contact } from "@/types"

import { ContactRow } from "./contact-row"

interface ContactListProps {
  contacts: Contact[]
  q?: string
  filter?: string
  sort?: string
  activeContactId?: number
}

const FILTERS = [
  { label: "All", value: undefined },
  { label: "Starred", value: "starred" },
  { label: "Archived", value: "archived" },
]

const SORTS = [
  { label: "Name", value: undefined },
  { label: "Newest", value: "added" },
  { label: "Company", value: "company" },
]

export function ContactList({ contacts, q, filter, sort, activeContactId }: ContactListProps) {
  const searchRef = useRef<HTMLInputElement>(null)

  const navigate = useCallback(
    (params: { q?: string; filter?: string; sort?: string }) => {
      const merged = {
        q: q ?? "",
        filter: filter ?? "",
        sort: sort ?? "",
        ...params,
      }
      // Remove empty params
      const clean = Object.fromEntries(
        Object.entries(merged).filter(([, v]) => v !== "" && v !== undefined),
      )
      router.get(contactsPath(clean), {}, { preserveState: true, replace: true })
    },
    [q, filter, sort],
  )

  const handleSearch = useCallback(
    (value: string) => {
      navigate({ q: value || undefined })
    },
    [navigate],
  )

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <h2 className="text-sm font-semibold">Contacts</h2>
        <Button size="sm" variant="outline" title="New contact" asChild>
          <a href={newContactPath({ q, filter, sort })}>
            <UserPlus className="size-4" />
            New
          </a>
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            className="h-8 pl-8 text-sm"
            placeholder="Search contacts…"
            defaultValue={q ?? ""}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-3 pb-2">
        {FILTERS.map((f) => {
          const isActive = (filter ?? undefined) === f.value
          return (
            <button
              key={f.label}
              onClick={() => navigate({ filter: f.value })}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Sort row */}
      <div className="flex items-center gap-1 px-3 pb-2">
        <span className="text-xs text-muted-foreground">Sort:</span>
        {SORTS.map((s) => {
          const isActive = (sort ?? undefined) === s.value
          return (
            <button
              key={s.label}
              onClick={() => navigate({ sort: s.value })}
              className={`rounded-md px-2 py-0.5 text-xs transition-colors ${
                isActive
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto px-2">
        {contacts.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">No contacts found.</p>
        ) : (
          contacts.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              isActive={contact.id === activeContactId}
              q={q}
              filter={filter}
              sort={sort}
            />
          ))
        )}
      </div>
    </div>
  )
}
