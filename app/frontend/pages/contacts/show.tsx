import { Head, usePage } from "@inertiajs/react"
import { Plus } from "lucide-react"
import { useState } from "react"
import type { ReactNode } from "react"

import { ActivityForm } from "@/components/crm/activity-form"
import { ActivityLog } from "@/components/crm/activity-log"
import { ContactDetail } from "@/components/crm/contact-detail"
import { Button } from "@/components/ui/button"
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
  const [isLogging, setIsLogging] = useState(false)

  return (
    <>
      <Head title={`${contact.first_name} ${contact.last_name}`} />
      <div className="scrollbar-subtle h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl">
          <ContactDetail contact={contact} q={q} filter={filter} sort={sort} sort_dir={sort_dir} />
          <div className="space-y-4 border-t px-6 py-5">
            {isLogging ? (
              <ActivityForm
                subjectType="Contact"
                subjectId={contact.id}
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
