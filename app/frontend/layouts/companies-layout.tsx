import { usePage } from "@inertiajs/react"
import type { ReactNode } from "react"

import { CompanyList } from "@/components/crm/company-list"
import type { Company } from "@/types"

interface CompaniesPageProps {
  companies: Company[]
  q?: string
  filter?: string
  sort?: string
  sort_dir?: string
  company?: { id: number }
  [key: string]: unknown
}

export function CompaniesLayout({ children }: { children: ReactNode }) {
  const { companies, q, filter, sort, sort_dir, company } =
    usePage<CompaniesPageProps>().props

  const hasCompany = company?.id != null

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left panel — company list.
          Mobile: full-width when no company selected, hidden when company shown.
          Desktop (md+): always visible as fixed-width sidebar. */}
      <div
        className={`flex shrink-0 flex-col overflow-hidden border-r ${
          hasCompany ? "hidden md:flex" : "w-full md:w-auto"
        }`}
      >
        <CompanyList
          companies={companies ?? []}
          q={q}
          filter={filter}
          sort={sort}
          sort_dir={sort_dir}
          activeCompanyId={company?.id}
        />
      </div>

      {/* Right panel — page content.
          Mobile: hidden when no company selected, full-width when company shown.
          Desktop (md+): always visible, fills remaining space. */}
      <div
        className={`flex min-w-0 flex-1 flex-col overflow-hidden ${
          hasCompany ? "" : "hidden md:flex"
        }`}
      >
        {children}
      </div>
    </div>
  )
}
