import { Head, useForm, usePage } from "@inertiajs/react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AppLayout from "@/layouts/app-layout"
import { CompaniesLayout } from "@/layouts/companies-layout"
import { companiesPath, companyPath } from "@/routes"
import type { BreadcrumbItem, Company } from "@/types"

interface Props {
  company: Company
  q?: string
  sort?: string
  sort_dir?: string
  [key: string]: unknown
}

export default function CompaniesEdit() {
  const { company, q, sort, sort_dir } = usePage<Props>().props
  const form = useForm({ name: company.name, website: company.website ?? "" })
  const { data, setData, patch, processing, errors } = form

  const listParams = Object.fromEntries(
    Object.entries({ q, sort, sort_dir }).filter(([, v]) => v !== undefined),
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    patch(companyPath(company.id))
  }

  return (
    <>
      <Head title={`Edit ${company.name}`} />
      <div className="p-6">
        <h2 className="mb-6 text-lg font-semibold">Edit {company.name}</h2>
        <form onSubmit={handleSubmit} className="max-w-sm space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Company name</Label>
            <Input
              id="name"
              name="name"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              autoFocus
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={data.website}
              onChange={(e) => setData("website", e.target.value)}
              placeholder="https://example.com"
            />
            {errors.website && <p className="text-xs text-destructive">{errors.website}</p>}
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={processing}>
              Save changes
            </Button>
            <Button variant="outline" asChild>
              <a href={companyPath(company.id, listParams)}>Cancel</a>
            </Button>
          </div>
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
