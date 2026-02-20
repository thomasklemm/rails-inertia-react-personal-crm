import { Head } from "@inertiajs/react"
import { Building2, Plus } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import AppLayout from "@/layouts/app-layout"
import { CompaniesLayout } from "@/layouts/companies-layout"
import { companiesPath, newCompanyPath } from "@/routes"
import type { BreadcrumbItem } from "@/types"

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Companies", href: companiesPath() },
]

export default function CompaniesIndex() {
  return (
    <>
      <Head title="Companies" />
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <Building2 className="size-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Companies</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a company from the list, or add a new one.
          </p>
        </div>
        <Button asChild>
          <a href={newCompanyPath()}>
            <Plus className="size-4" />
            Add Company
          </a>
        </Button>
      </div>
    </>
  )
}

CompaniesIndex.layout = (page: ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>
    <CompaniesLayout>{page}</CompaniesLayout>
  </AppLayout>
)
