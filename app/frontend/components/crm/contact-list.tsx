import { router } from "@inertiajs/react"
import {
  Archive,
  ArrowDown,
  ArrowDownAZ,
  ArrowUp,
  ArrowUpAZ,
  Building2,
  Search,
  Star,
  UserPlus,
  Users,
} from "lucide-react"
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
  sort_dir?: string
  activeContactId?: number
}

const FILTERS = [
  { label: "All", value: undefined, icon: Users },
  { label: "Starred", value: "starred", icon: Star },
  { label: "Archived", value: "archived", icon: Archive },
]

const SORTS = [
  { label: "Name", value: undefined, defaultDir: "asc", iconAsc: ArrowUpAZ, iconDesc: ArrowDownAZ },
  { label: "Newest", value: "added", defaultDir: "desc", iconAsc: ArrowUp, iconDesc: ArrowDown },
  { label: "Company", value: "company", defaultDir: "asc", iconAsc: Building2, iconDesc: Building2 },
] as const

export function ContactList({ contacts, q, filter, sort, sort_dir, activeContactId }: ContactListProps) {
  const searchRef = useRef<HTMLInputElement>(null)

  const navigate = useCallback(
    (params: { q?: string; filter?: string; sort?: string; sort_dir?: string }) => {
      const merged = {
        q: q ?? "",
        filter: filter ?? "",
        sort: sort ?? "",
        sort_dir: sort_dir ?? "",
        ...params,
      }
      const clean = Object.fromEntries(
        Object.entries(merged).filter(([, v]) => v !== "" && v !== undefined),
      )
      router.get(contactsPath(clean), {}, { preserveState: true, replace: true })
    },
    [q, filter, sort, sort_dir],
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
          <a href={newContactPath({ q, filter, sort, sort_dir })}>
            <UserPlus className="size-4" />
            Add
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
      <div className="flex gap-0.5 px-3 pb-2">
        {FILTERS.map((f) => {
          const isActive = (filter ?? undefined) === f.value
          return (
            <button
              key={f.label}
              onClick={() => navigate({ filter: f.value })}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <f.icon className="size-3" />
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Sort row */}
      <div className="border-t border-b px-3 pb-2 pt-2">
        <div className="flex items-center gap-0.5">
          <span className="mr-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">Sort</span>
          {SORTS.map((s) => {
            const isActive = (sort ?? undefined) === s.value
            const effectiveDir = isActive ? (sort_dir ?? s.defaultDir) : s.defaultDir
            const Icon = effectiveDir === "asc" ? s.iconAsc : s.iconDesc

            return (
              <button
                key={s.label}
                onClick={() => {
                  if (isActive) {
                    navigate({ sort: s.value, sort_dir: sort_dir === "asc" ? "desc" : "asc" })
                  } else {
                    navigate({ sort: s.value, sort_dir: s.defaultDir })
                  }
                }}
                className={`flex cursor-pointer items-center gap-1 rounded-md px-2 py-0.5 text-xs transition-colors ${
                  isActive
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-3" />
                {s.label}
              </button>
            )
          })}
        </div>
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
              sort_dir={sort_dir}
            />
          ))
        )}
      </div>
    </div>
  )
}
