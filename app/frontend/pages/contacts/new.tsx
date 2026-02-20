import { Head, useForm } from "@inertiajs/react"
import { Modal } from "@inertiaui/modal-react"

import { ContactForm, type ContactFormData } from "@/components/crm/contact-form"
import { contactsPath } from "@/routes"
import type { Company } from "@/types"

interface Props {
  companies: Company[]
}

export default function ContactsNew({ companies }: Props) {
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
    <Modal>
      <Head title="New Contact" />
      <div className="p-6">
        <h2 className="mb-6 text-xl font-semibold">New Contact</h2>
        <form onSubmit={handleSubmit}>
          <ContactForm
            form={form}
            companies={companies}
            cancelHref={contactsPath()}
            submitLabel="Create Contact"
          />
        </form>
      </div>
    </Modal>
  )
}

ContactsNew.layout = (page: React.ReactNode) => <>{page}</>
