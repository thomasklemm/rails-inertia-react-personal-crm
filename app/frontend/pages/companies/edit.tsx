import { Head, useForm, usePage } from "@inertiajs/react"
import type { ReactNode } from "react"

import { CompanyForm, type CompanyFormData } from "@/components/crm/company-form"
import AppLayout from "@/layouts/app-layout"
import { CompaniesLayout } from "@/layouts/companies-layout"
import { companiesPath, companyPath } from "@/routes"
import type { BreadcrumbItem, Company } from "@/types"

interface Props {
  company: Company
  q?: string
  filter?: string
  sort?: string
  sort_dir?: string
  [key: string]: unknown
}

export default function CompaniesEdit() {
  const { company, q, filter, sort, sort_dir } = usePage<Props>().props
  const form = useForm<CompanyFormData>({
    name: company.name,
    website: company.website ?? "",
    phone: company.phone ?? "",
    email: company.email ?? "",
    address: company.address ?? "",
    notes: company.notes ?? "",
    tags: company.tags ?? [],
  })

  const listParams = Object.fromEntries(
    Object.entries({ q, filter, sort, sort_dir }).filter(([, v]) => v !== undefined),
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    form.patch(companyPath(company.id))
  }

  return (
    <>
      <Head title={`Edit ${company.name}`} />
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Edit Company</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{company.name}</p>
        </div>
        <form onSubmit={handleSubmit} className="max-w-sm">
          <CompanyForm
            form={form}
            cancelHref={companyPath(company.id, listParams)}
            submitLabel="Save Changes"
          />
        </form>
      </div>
    </>
  )
}

CompaniesEdit.layout = (page: ReactNode) => {
  const { company } = (page as React.ReactElement).props as Props
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Companies", href: companiesPath() },
    { title: company?.name ?? "", href: company ? companyPath(company.id) : "#" },
    { title: "Edit", href: "#" },
  ]
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <CompaniesLayout>{page}</CompaniesLayout>
    </AppLayout>
  )
}
