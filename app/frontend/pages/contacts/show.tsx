import { Head, usePage } from "@inertiajs/react"
import { ModalLink } from "@inertiaui/modal-react"
import { Plus } from "lucide-react"
import type { ReactNode } from "react"

import { ActivityLog } from "@/components/crm/activity-log"
import { ContactDetail } from "@/components/crm/contact-detail"
import { Button } from "@/components/ui/button"
import AppLayout from "@/layouts/app-layout"
import { CrmLayout } from "@/layouts/crm-layout"
import { contactsPath, newActivityPath } from "@/routes"
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
      <div className="scrollbar-subtle h-full overflow-y-auto">
        <ContactDetail contact={contact} q={q} filter={filter} sort={sort} sort_dir={sort_dir} />
        <div className="space-y-4 border-t px-6 py-5">
          <ModalLink href={newActivityPath({ subject_type: "Contact", subject_id: contact.id })}>
            <Button size="sm" variant="outline" className="gap-1.5 font-medium">
              <Plus className="size-3.5" />
              Log Activity
            </Button>
          </ModalLink>
          <ActivityLog activities={activities} />
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
