import { Head } from "@inertiajs/react"
import { User } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import AppLayout from "@/layouts/app-layout"
import { CrmLayout } from "@/layouts/crm-layout"
import { contactsPath, newContactPath } from "@/routes"
import type { BreadcrumbItem } from "@/types"

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Contacts", href: contactsPath() },
]

export default function ContactsIndex() {
  return (
    <>
      <Head title="Contacts" />
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <User className="size-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Contacts</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a contact from the list, or add a new one.
          </p>
        </div>
        <Button asChild>
          <a href={newContactPath()}>Add contact</a>
        </Button>
      </div>
    </>
  )
}

ContactsIndex.layout = (page: ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>
    <CrmLayout>{page}</CrmLayout>
  </AppLayout>
)
