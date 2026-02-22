import { Head, useForm } from "@inertiajs/react"
import { Modal } from "@inertiaui/modal-react"

import {
  ContactForm,
  type ContactFormData,
} from "@/components/crm/contact-form"
import { contactPath } from "@/routes"
import type { Company, Contact } from "@/types"

interface Props {
  contact: Contact
  companies: Company[]
}

export default function ContactsEdit({ contact, companies }: Props) {
  const form = useForm<ContactFormData>({
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    notes: contact.notes ?? "",
    company_id: contact.company_id ? String(contact.company_id) : "",
    tags: contact.tags,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    form.patch(contactPath(contact.id))
  }

  return (
    <Modal>
      <Head title={`Edit ${contact.first_name} ${contact.last_name}`} />
      <div className="p-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Edit Contact</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {contact.first_name} {contact.last_name}
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <ContactForm
            form={form}
            companies={companies}
            cancelHref={contactPath(contact.id)}
            submitLabel="Save Changes"
            autoFocus={false}
          />
        </form>
      </div>
    </Modal>
  )
}

ContactsEdit.layout = (page: React.ReactNode) => <>{page}</>
