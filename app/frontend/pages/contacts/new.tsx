import { Head, useForm, usePage } from "@inertiajs/react"
import type { ReactNode } from "react"

import { ContactForm, type ContactFormData } from "@/components/crm/contact-form"
import AppLayout from "@/layouts/app-layout"
import { CrmLayout } from "@/layouts/crm-layout"
import { contactsPath } from "@/routes"
import type { BreadcrumbItem, Company } from "@/types"

interface Props {
  companies: Company[]
  q?: string
  filter?: string
  sort?: string
  [key: string]: unknown
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Contacts", href: contactsPath() },
  { title: "New contact", href: "#" },
]

export default function ContactsNew() {
  const { companies, q, filter, sort } = usePage<Props>().props

  const cancelParams = Object.fromEntries(
    Object.entries({ q, filter, sort }).filter(([, v]) => v !== undefined),
  )

  const form = useForm<ContactFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    notes: "",
    company_id: "",
    tags: [],
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    form.post(contactsPath())
  }

  return (
    <>
      <Head title="New Contact" />
      <div className="p-6">
        <h2 className="mb-6 text-lg font-semibold">New contact</h2>
        <form onSubmit={handleSubmit}>
          <ContactForm
            form={form}
            companies={companies}
            cancelHref={contactsPath(cancelParams)}
            submitLabel="Create contact"
          />
        </form>
      </div>
    </>
  )
}

ContactsNew.layout = (page: ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>
    <CrmLayout>{page}</CrmLayout>
  </AppLayout>
)
