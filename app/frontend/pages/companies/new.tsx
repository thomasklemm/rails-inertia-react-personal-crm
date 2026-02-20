import { Head, useForm } from "@inertiajs/react"
import type { ReactNode } from "react"

import { CompanyForm, type CompanyFormData } from "@/components/crm/company-form"
import AppLayout from "@/layouts/app-layout"
import { CompaniesLayout } from "@/layouts/companies-layout"
import { companiesPath } from "@/routes"
import type { BreadcrumbItem } from "@/types"

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Companies", href: companiesPath() },
  { title: "New Company", href: "#" },
]

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
    <>
      <Head title="New Company" />
      <div className="h-full overflow-y-auto p-6">
        <h2 className="mb-6 text-xl font-semibold">New Company</h2>
        <form onSubmit={handleSubmit} className="max-w-sm">
          <CompanyForm form={form} cancelHref={companiesPath()} submitLabel="Create Company" />
        </form>
      </div>
    </>
  )
}

CompaniesNew.layout = (page: ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>
    <CompaniesLayout>{page}</CompaniesLayout>
  </AppLayout>
)
