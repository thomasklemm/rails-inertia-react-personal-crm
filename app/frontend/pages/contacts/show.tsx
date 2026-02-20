import { Head, usePage } from "@inertiajs/react"
import type { ReactNode } from "react"

import { ActivityForm } from "@/components/crm/activity-form"
import { ActivityLog } from "@/components/crm/activity-log"
import { ContactDetail } from "@/components/crm/contact-detail"
import AppLayout from "@/layouts/app-layout"
import { CrmLayout } from "@/layouts/crm-layout"
import { contactsPath } from "@/routes"
import type { Activity, BreadcrumbItem, Company, Contact } from "@/types"

interface Props {
  contact: Contact
  activities: Activity[]
  companies: Company[]
  q?: string
  filter?: string
  sort?: string
  sort_dir?: string
  [key: string]: unknown
}

export default function ContactsShow() {
  const { contact, activities, q, filter, sort, sort_dir } = usePage<Props>().props

  return (
    <>
      <Head title={`${contact.first_name} ${contact.last_name}`} />
      <div className="grid h-full grid-cols-[300px_1fr] divide-x overflow-hidden">
        {/* Left: contact identity + info + notes */}
        <div className="scrollbar-subtle overflow-y-auto">
          <ContactDetail contact={contact} q={q} filter={filter} sort={sort} sort_dir={sort_dir} />
        </div>

        {/* Right: log activity (pinned top) + scrollable timeline */}
        <div className="flex flex-col overflow-hidden">
          <div className="shrink-0 border-b p-6">
            <ActivityForm contactId={contact.id} />
          </div>
          <div className="scrollbar-subtle flex-1 overflow-y-auto p-6">
            <ActivityLog activities={activities} />
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
    { title: `${contact?.first_name ?? ""} ${contact?.last_name ?? ""}`, href: "#" },
  ]
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <CrmLayout>{page}</CrmLayout>
    </AppLayout>
  )
}
