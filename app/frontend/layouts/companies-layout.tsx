import { usePage } from "@inertiajs/react"
import type { ReactNode } from "react"

import { CompanyList } from "@/components/crm/company-list"
import type { Company } from "@/types"

interface CompaniesPageProps {
  companies: Company[]
  q?: string
  sort?: string
  sort_dir?: string
  company?: { id: number }
  [key: string]: unknown
}

export function CompaniesLayout({ children }: { children: ReactNode }) {
  const { companies, q, sort, sort_dir, company } = usePage<CompaniesPageProps>().props

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left panel — company list */}
      <div className="flex w-72 shrink-0 flex-col overflow-hidden border-r">
        <CompanyList
          companies={companies ?? []}
          q={q}
          sort={sort}
          sort_dir={sort_dir}
          activeCompanyId={company?.id}
        />
      </div>

      {/* Right panel — page content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">{children}</div>
    </div>
  )
}
