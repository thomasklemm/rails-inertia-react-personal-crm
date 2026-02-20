import { Head, useForm } from "@inertiajs/react"
import { Modal } from "@inertiaui/modal-react"

import { CompanyForm, type CompanyFormData } from "@/components/crm/company-form"
import { companiesPath } from "@/routes"

export default function CompaniesNew() {
  const form = useForm<CompanyFormData>({
    name: "",
    website: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    tags: [],
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    form.post(companiesPath())
  }

  return (
    <Modal>
      <Head title="New Company" />
      <div className="p-8">
        <h2 className="mb-4 text-xl font-semibold">New Company</h2>
        <form onSubmit={handleSubmit}>
          <CompanyForm form={form} cancelHref={companiesPath()} submitLabel="Create Company" />
        </form>
      </div>
    </Modal>
  )
}

CompaniesNew.layout = (page: React.ReactNode) => <>{page}</>
