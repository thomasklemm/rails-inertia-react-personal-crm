import { Head, usePage } from "@inertiajs/react"
import type { ReactNode } from "react"

import { ActivityForm } from "@/components/crm/activity-form"
import { ActivityLog } from "@/components/crm/activity-log"
import { CompanyDetail } from "@/components/crm/company-detail"
import { Separator } from "@/components/ui/separator"
import AppLayout from "@/layouts/app-layout"
import { CompaniesLayout } from "@/layouts/companies-layout"
import { companiesPath } from "@/routes"
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
      <div className="grid h-full grid-cols-[312px_1fr] divide-x overflow-hidden">
        {/* Left: company identity + info + contacts */}
        <div className="scrollbar-subtle overflow-y-auto">
          <CompanyDetail
            company={company}
            contacts={contacts}
            q={q}
            filter={filter}
            sort={sort}
            sort_dir={sort_dir}
          />
        </div>

        {/* Right: log activity (pinned top) + scrollable timeline */}
        <div className="flex flex-col overflow-hidden">
          <div className="shrink-0 border-b p-6">
            <ActivityForm companyId={company.id} />
          </div>
          <div className="scrollbar-subtle flex-1 overflow-y-auto p-6 space-y-6">
            <ActivityLog activities={activities} />
            {contact_activities.length > 0 && (
              <>
                <Separator />
                <ActivityLog
                  activities={contact_activities}
                  title="Activity from contacts"
                  showContact={true}
                />
              </>
            )}
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
