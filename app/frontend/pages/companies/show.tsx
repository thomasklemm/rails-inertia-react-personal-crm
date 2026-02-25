import { Head, usePage } from "@inertiajs/react"
import type { ReactNode } from "react"

import { ActivityLog } from "@/components/crm/activity-log"
import { CompanyDetail } from "@/components/crm/company-detail"
import { DealsList } from "@/components/crm/deals-list"
import AppLayout from "@/layouts/app-layout"
import { CompaniesLayout } from "@/layouts/companies-layout"
import { companiesPath } from "@/routes"
import type { Activity, BreadcrumbItem, Company, Contact, Deal } from "@/types"

interface Props {
  company: Company
  contacts: Contact[]
  activities: Activity[]
  deals?: Deal[]
  q?: string
  filter?: string
  sort?: string
  sort_dir?: string
  [key: string]: unknown
}

export default function CompaniesShow() {
  const { company, contacts, activities, deals, q, filter, sort, sort_dir } =
    usePage<Props>().props

  return (
    <>
      <Head title={company.name} />
      <div className="scrollbar-subtle h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl">
          <CompanyDetail
            company={company}
            contacts={contacts}
            q={q}
            filter={filter}
            sort={sort}
            sort_dir={sort_dir}
          />
          <div className="border-t px-6 py-5">
            <DealsList deals={deals ?? []} companyId={company.id} />
          </div>
          <div className="border-t px-6 py-5">
            <ActivityLog
              activities={activities}
              description="Includes activities logged for this company and all of its contacts."
              showSubject={true}
              subjectType="Company"
              subjectId={company.id}
            />
          </div>
        </div>
      </div>
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
