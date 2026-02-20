import { Head, usePage } from "@inertiajs/react"
import { ModalLink } from "@inertiaui/modal-react"
import type { ReactNode } from "react"

import { ActivityLog } from "@/components/crm/activity-log"
import { CompanyDetail } from "@/components/crm/company-detail"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import AppLayout from "@/layouts/app-layout"
import { CompaniesLayout } from "@/layouts/companies-layout"
import { companiesPath, newActivityPath } from "@/routes"
import type { Activity, BreadcrumbItem, Company, Contact } from "@/types"

interface Props {
  company: Company
  contacts: Contact[]
  activities: Activity[]
  contact_activities: Activity[]
  q?: string
  filter?: string
  sort?: string
  sort_dir?: string
  [key: string]: unknown
}

export default function CompaniesShow() {
  const { company, contacts, activities, contact_activities, q, filter, sort, sort_dir } =
    usePage<Props>().props

  return (
    <>
      <Head title={company.name} />
      <div className="scrollbar-subtle h-full overflow-y-auto">
        <CompanyDetail
          company={company}
          contacts={contacts}
          q={q}
          filter={filter}
          sort={sort}
          sort_dir={sort_dir}
        />
        <div className="space-y-5 border-t px-6 py-5">
          <ModalLink href={newActivityPath({ company_id: company.id })}>
            <Button size="sm">Log Activity</Button>
          </ModalLink>
          <ActivityLog activities={activities} />
          {contact_activities.length > 0 && (
            <>
              <Separator />
              <ActivityLog
                activities={contact_activities}
                title="Activity from Contacts"
                showContact={true}
              />
            </>
          )}
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
