import { Link } from "@inertiajs/react"
import { Star, Users } from "lucide-react"
import { useEffect, useRef } from "react"

import { companyPath } from "@/routes"
import type { Company } from "@/types"

import { CompanyAvatar } from "./company-avatar"
import { CompanyTagBadge } from "./tag-badge"

interface CompanyRowProps {
  company: Company
  isActive: boolean
  q?: string
  filter?: string
  sort?: string
  sort_dir?: string
}

export function CompanyRow({ company, isActive, q, filter, sort, sort_dir }: CompanyRowProps) {
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
      href={companyPath(company.id, params)}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
      }`}
      prefetch
    >
      <CompanyAvatar company={company} size="sm" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">{company.name}</span>
          {company.starred && (
            <Star className="size-3 shrink-0 fill-amber-400 text-amber-400" />
          )}
        </div>
        {company.tags.length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-1">
            <CompanyTagBadge tag={company.tags[0]} />
            {company.tags.length > 1 && (
              <span className="text-xs text-muted-foreground">+{company.tags.length - 1}</span>
            )}
          </div>
        )}
      </div>

      {(company.contacts_count ?? 0) > 0 && (
        <div className="flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground">
          <Users className="size-3" />
          <span>{company.contacts_count}</span>
        </div>
      )}
    </Link>
  )
}
