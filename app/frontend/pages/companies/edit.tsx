import { Head, useForm } from "@inertiajs/react"
import { Modal } from "@inertiaui/modal-react"

import { CompanyForm, type CompanyFormData } from "@/components/crm/company-form"
import { companyPath } from "@/routes"
import type { Company } from "@/types"

interface Props {
  company: Company
}

export default function CompaniesEdit({ company }: Props) {
  const form = useForm<CompanyFormData>({
    name: company.name,
    website: company.website ?? "",
    phone: company.phone ?? "",
    email: company.email ?? "",
    address: company.address ?? "",
    notes: company.notes ?? "",
    tags: company.tags ?? [],
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    form.patch(companyPath(company.id))
  }

  return (
    <Modal>
      <Head title={`Edit ${company.name}`} />
      <div className="p-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Edit Company</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{company.name}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <CompanyForm
            form={form}
            cancelHref={companyPath(company.id)}
            submitLabel="Save Changes"
            autoFocus={false}
          />
        </form>
      </div>
    </Modal>
  )
}

CompaniesEdit.layout = (page: React.ReactNode) => <>{page}</>
