import { Head, useForm } from "@inertiajs/react"
import { Modal } from "@inertiaui/modal-react"

import { DealForm, type DealFormData } from "@/components/crm/deal-form"
import { dealsPath } from "@/routes"

interface Props {
  stages: string[]
  contact_id?: number
  company_id?: number
  contacts: { id: number; first_name: string; last_name: string }[]
  companies: { id: number; name: string }[]
}

export default function DealsNew({ stages, contact_id, company_id, contacts, companies }: Props) {
  const form = useForm<DealFormData>({
    title: "",
    stage: "lead",
    value: "",
    closed_at: "",
    notes: "",
    contact_id: contact_id ? String(contact_id) : "",
    company_id: company_id ? String(company_id) : "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    form.post(dealsPath())
  }

  return (
    <Modal>
      <Head title="New Deal" />
      <div className="p-8">
        <h2 className="mb-4 text-xl font-semibold">New Deal</h2>
        <form onSubmit={handleSubmit}>
          <DealForm
            form={form}
            stages={stages}
            contacts={contacts}
            companies={companies}
            cancelHref={dealsPath()}
            submitLabel="Create Deal"
          />
        </form>
      </div>
    </Modal>
  )
}

DealsNew.layout = (page: React.ReactNode) => <>{page}</>
