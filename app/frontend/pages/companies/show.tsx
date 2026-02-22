import { Head, usePage } from "@inertiajs/react"
import { Plus } from "lucide-react"
import { useState } from "react"
import type { ReactNode } from "react"

import { ActivityForm } from "@/components/crm/activity-form"
import { ActivityLog } from "@/components/crm/activity-log"
import { CompanyDetail } from "@/components/crm/company-detail"
import { Button } from "@/components/ui/button"
import AppLayout from "@/layouts/app-layout"
import { CompaniesLayout } from "@/layouts/companies-layout"
import { companiesPath } from "@/routes"
import type { Activity, BreadcrumbItem, Company, Contact } from "@/types"

interface Props {
  company: Company
  contacts: Contact[]
  activities: Activity[]
  q?: string
  filter?: string
  sort?: string
  sort_dir?: string
  [key: string]: unknown
}

export default function CompaniesShow() {
  const { company, contacts, activities, q, filter, sort, sort_dir } = usePage<Props>().props
  const [isLogging, setIsLogging] = useState(false)

  return (
    <>
      <Head title={company.name} />
      <div className="scrollbar-subtle h-full overflow-y-auto">
        <div className="max-w-3xl">
          <CompanyDetail
            company={company}
            contacts={contacts}
            q={q}
            filter={filter}
            sort={sort}
            sort_dir={sort_dir}
          />
          <div className="space-y-4 border-t px-6 py-5">
            {isLogging ? (
              <ActivityForm
                subjectType="Company"
                subjectId={company.id}
                onCancel={() => setIsLogging(false)}
              />
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 font-medium"
                onClick={() => setIsLogging(true)}
              >
                <Plus className="size-3.5" />
                Log Activity
              </Button>
            )}
            <ActivityLog activities={activities} showSubject={true} />
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
