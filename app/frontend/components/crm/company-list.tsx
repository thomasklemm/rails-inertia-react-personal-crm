import { router } from "@inertiajs/react"
import {
  ArrowDown,
  ArrowDownAZ,
  ArrowUp,
  ArrowUpAZ,
  Building2,
  Search,
  Star,
  Users,
} from "lucide-react"
import { useCallback, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { companiesPath, newCompanyPath } from "@/routes"
import type { Company } from "@/types"

import { CompanyRow } from "./company-row"

interface CompanyListProps {
  companies: Company[]
  q?: string
  filter?: string
  sort?: string
  sort_dir?: string
  activeCompanyId?: number
}

const FILTERS = [
  { label: "All", value: undefined, icon: Building2 },
  { label: "Starred", value: "starred", icon: Star },
]

const SORTS = [
  {
    label: "Name",
    value: undefined,
    defaultDir: "asc",
    iconAsc: ArrowUpAZ,
    iconDesc: ArrowDownAZ,
  },
  {
    label: "Added",
    value: "added",
    defaultDir: "desc",
    iconAsc: ArrowUp,
    iconDesc: ArrowDown,
  },
  {
    label: "Contacts",
    value: "contacts",
    defaultDir: "desc",
    iconAsc: Users,
    iconDesc: Users,
  },
] as const

export function CompanyList({
  companies,
  q,
  filter,
  sort,
  sort_dir,
  activeCompanyId,
}: CompanyListProps) {
  const searchRef = useRef<HTMLInputElement>(null)

  const navigate = useCallback(
    (params: {
      q?: string
      filter?: string
      sort?: string
      sort_dir?: string
    }) => {
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
      router.get(
        companiesPath(clean),
        {},
        { preserveState: true, replace: true },
      )
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
        <h2 className="text-sm font-semibold">Companies</h2>
        <Button size="sm" variant="outline" title="New company" asChild>
          <a href={newCompanyPath({ q, filter, sort, sort_dir })}>
            <Building2 className="size-4" />
            Add
          </a>
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            ref={searchRef}
            className="h-8 pl-8 text-sm"
            placeholder="Search companies…"
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
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
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
      <div className="border-t border-b px-3 pt-2 pb-2">
        <div className="flex items-center gap-0.5">
          <span className="text-muted-foreground/50 mr-1 text-[10px] font-medium tracking-wider uppercase">
            Sort
          </span>
          {SORTS.map((s) => {
            const isActive = (sort ?? undefined) === s.value
            const effectiveDir = isActive
              ? (sort_dir ?? s.defaultDir)
              : s.defaultDir
            const Icon = effectiveDir === "asc" ? s.iconAsc : s.iconDesc

            return (
              <button
                key={s.label}
                onClick={() => {
                  if (isActive) {
                    navigate({
                      sort: s.value,
                      sort_dir: sort_dir === "asc" ? "desc" : "asc",
                    })
                  } else {
                    navigate({ sort: s.value, sort_dir: s.defaultDir })
                  }
                }}
                className={`flex cursor-pointer items-center gap-1 rounded-md px-2 py-0.5 text-xs transition-colors ${
                  isActive
                    ? "text-foreground font-semibold"
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

      {/* Company list */}
      <div className="scrollbar-subtle flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pt-2">
        {companies.length === 0 ? (
          <p className="text-muted-foreground px-3 py-6 text-center text-sm">
            No companies found.
          </p>
        ) : (
          companies.map((company) => (
            <CompanyRow
              key={company.id}
              company={company}
              isActive={company.id === activeCompanyId}
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
