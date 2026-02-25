import { Head, useForm } from "@inertiajs/react"
import { Modal } from "@inertiaui/modal-react"

import { DealForm, type DealFormData } from "@/components/crm/deal-form"
import { dealPath } from "@/routes"
import type { Deal } from "@/types"

interface Props {
  deal: Deal
  stages: string[]
  contacts: { id: number; first_name: string; last_name: string }[]
  companies: { id: number; name: string }[]
}

export default function DealsEdit({
  deal,
  stages,
  contacts,
  companies,
}: Props) {
  const form = useForm<DealFormData>({
    title: deal.title,
    stage: deal.stage,
    value: deal.value > 0 ? String(deal.value) : "",
    closed_at: deal.closed_at ?? "",
    notes: deal.notes ?? "",
    contact_id: deal.contact ? String(deal.contact.id) : "",
    company_id: deal.company ? String(deal.company.id) : "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    form.patch(dealPath(deal.id))
  }

  return (
    <Modal>
      <Head title={`Edit ${deal.title}`} />
      <div className="p-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Edit Deal</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">{deal.title}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <DealForm
            form={form}
            stages={stages}
            contacts={contacts}
            companies={companies}
            cancelHref={dealPath(deal.id)}
            submitLabel="Save Changes"
          />
        </form>
      </div>
    </Modal>
  )
}

DealsEdit.layout = (page: React.ReactNode) => <>{page}</>
