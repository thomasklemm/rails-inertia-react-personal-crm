import { Head, usePage } from "@inertiajs/react"
import type { ReactNode } from "react"

import { CompanyDetail } from "@/components/crm/company-detail"
import AppLayout from "@/layouts/app-layout"
import { CompaniesLayout } from "@/layouts/companies-layout"
import { companiesPath } from "@/routes"
import type { BreadcrumbItem, Company, Contact } from "@/types"

interface Props {
  company: Company
  contacts: Contact[]
  q?: string
  sort?: string
  sort_dir?: string
  [key: string]: unknown
}

export default function CompaniesShow() {
  const { company, contacts, q, sort, sort_dir } = usePage<Props>().props

  return (
    <>
      <Head title={company.name} />
      <CompanyDetail company={company} contacts={contacts} q={q} sort={sort} sort_dir={sort_dir} />
    </>
  )
}

CompaniesShow.layout = (page: ReactNode) => {
  const { company } = (page as React.ReactElement).props as Props
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Companies", href: companiesPath() },
    { title: company?.name ?? "", href: "#" },
  ]
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <CompaniesLayout>{page}</CompaniesLayout>
    </AppLayout>
  )
}
