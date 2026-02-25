import { Head, usePage } from "@inertiajs/react"
import type { ReactNode } from "react"

import { ActivityLog } from "@/components/crm/activity-log"
import { ContactDetail } from "@/components/crm/contact-detail"
import { DealsList } from "@/components/crm/deals-list"
import AppLayout from "@/layouts/app-layout"
import { CrmLayout } from "@/layouts/crm-layout"
import { contactsPath } from "@/routes"
import type { Activity, BreadcrumbItem, Company, Contact, Deal } from "@/types"

interface Props {
  contact: Contact
  activities: Activity[]
  companies: Company[]
  deals?: Deal[]
  new_company_id?: string
  q?: string
  filter?: string
  sort?: string
  sort_dir?: string
  [key: string]: unknown
}

export default function ContactsShow() {
  const {
    contact,
    activities,
    companies,
    deals,
    new_company_id,
    q,
    filter,
    sort,
    sort_dir,
  } = usePage<Props>().props

  return (
    <>
      <Head title={`${contact.first_name} ${contact.last_name}`} />
      <div className="scrollbar-subtle h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl">
          <ContactDetail
            key={new_company_id ?? ""}
            contact={contact}
            companies={companies}
            newCompanyId={new_company_id}
            q={q}
            filter={filter}
            sort={sort}
            sort_dir={sort_dir}
          />
          <div className="border-t px-6 py-5">
            <DealsList deals={deals ?? []} contactId={contact.id} />
          </div>
          <div className="border-t px-6 py-5">
            <ActivityLog
              activities={activities}
              subjectType="Contact"
              subjectId={contact.id}
            />
          </div>
        </div>
      </div>
    </>
  )
}

ContactsShow.layout = (page: ReactNode) => {
  const { contact } = (page as React.ReactElement).props as Props
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Contacts", href: contactsPath() },
    {
      title: `${contact?.first_name ?? ""} ${contact?.last_name ?? ""}`,
      href: "#",
    },
  ]
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <CrmLayout>{page}</CrmLayout>
    </AppLayout>
  )
}
