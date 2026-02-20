import { Head, useForm, usePage } from "@inertiajs/react"
import type { ReactNode } from "react"

import { ContactForm, type ContactFormData } from "@/components/crm/contact-form"
import AppLayout from "@/layouts/app-layout"
import { CrmLayout } from "@/layouts/crm-layout"
import { contactPath, contactsPath } from "@/routes"
import type { BreadcrumbItem, Company, Contact } from "@/types"

interface Props {
  contact: Contact
  companies: Company[]
  q?: string
  filter?: string
  sort?: string
  [key: string]: unknown
}

export default function ContactsEdit() {
  const { contact, companies, q, filter, sort } = usePage<Props>().props

  const form = useForm<ContactFormData>({
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    notes: contact.notes ?? "",
    company_id: contact.company_id ? String(contact.company_id) : "",
    tags: contact.tags,
  })

  const listParams = Object.fromEntries(
    Object.entries({ q, filter, sort }).filter(([, v]) => v !== undefined),
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    form.patch(contactPath(contact.id))
  }

  return (
    <>
      <Head title={`Edit ${contact.first_name} ${contact.last_name}`} />
      <div className="p-6">
        <h2 className="mb-6 text-lg font-semibold">
          Edit {contact.first_name} {contact.last_name}
        </h2>
        <form onSubmit={handleSubmit}>
          <ContactForm
            form={form}
            companies={companies}
            cancelHref={contactPath(contact.id, listParams)}
            submitLabel="Save changes"
          />
        </form>
      </div>
    </>
  )
}

ContactsEdit.layout = (page: ReactNode) => {
  const { contact } = (page as React.ReactElement).props as Props
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Contacts", href: contactsPath() },
    {
      title: `${contact?.first_name ?? ""} ${contact?.last_name ?? ""}`,
      href: contact ? contactPath(contact.id) : "#",
    },
    { title: "Edit", href: "#" },
  ]
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <CrmLayout>{page}</CrmLayout>
    </AppLayout>
  )
}
