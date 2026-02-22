import { Head } from "@inertiajs/react"
import { ModalLink } from "@inertiaui/modal-react"
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
        <div className="bg-muted flex size-16 items-center justify-center rounded-full">
          <User className="text-muted-foreground size-8" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Contacts</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Choose a contact from the list, or add a new one.
          </p>
        </div>
        <Button asChild>
          <ModalLink navigate href={newContactPath()}>
            + Add Contact
          </ModalLink>
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
