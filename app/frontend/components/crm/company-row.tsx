import { Link } from "@inertiajs/react"
import { Users } from "lucide-react"
import { useEffect, useRef } from "react"

import { companyPath } from "@/routes"
import type { Company } from "@/types"

interface CompanyRowProps {
  company: Company
  isActive: boolean
  q?: string
  sort?: string
  sort_dir?: string
}

export function CompanyRow({ company, isActive, q, sort, sort_dir }: CompanyRowProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const params: Record<string, string> = {}
  if (q) params.q = q
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
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
        {company.name[0].toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{company.name}</p>
        {company.website && (
          <p className="truncate text-xs text-muted-foreground">
            {company.website.replace(/^https?:\/\//, "")}
          </p>
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
