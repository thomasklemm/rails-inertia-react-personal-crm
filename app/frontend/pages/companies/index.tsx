import { Head, usePage } from "@inertiajs/react"
import { Building2, Plus } from "lucide-react"
import type { ReactNode } from "react"

import { CompanyRow } from "@/components/crm/company-row"
import { Button } from "@/components/ui/button"
import AppLayout from "@/layouts/app-layout"
import { companiesPath, newCompanyPath } from "@/routes"
import type { BreadcrumbItem, Company } from "@/types"

interface Props {
  companies: Company[]
  [key: string]: unknown
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Companies", href: companiesPath() },
]

export default function CompaniesIndex() {
  const { companies } = usePage<Props>().props

  return (
    <>
      <Head title="Companies" />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Companies</h1>
          <Button asChild>
            <a href={newCompanyPath()}><Plus className="size-4" />Add company</a>
          </Button>
        </div>

        {companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <Building2 className="size-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No companies yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Add your first company to get started.</p>
            </div>
            <Button asChild>
              <a href={newCompanyPath()}><Plus className="size-4" />Add company</a>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <CompanyRow key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

CompaniesIndex.layout = (page: ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
)
