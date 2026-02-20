import { Head, useForm } from "@inertiajs/react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AppLayout from "@/layouts/app-layout"
import { companiesPath } from "@/routes"
import type { BreadcrumbItem } from "@/types"

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Companies", href: companiesPath() },
  { title: "New company", href: "#" },
]

export default function CompaniesNew() {
  const form = useForm({ name: "", website: "" })
  const { data, setData, post, processing, errors } = form

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post(companiesPath())
  }

  return (
    <>
      <Head title="New Company" />
      <div className="p-6">
        <h2 className="mb-6 text-lg font-semibold">New company</h2>
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
              Create company
            </Button>
            <Button variant="outline" asChild>
              <a href={companiesPath()}>Cancel</a>
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

CompaniesNew.layout = (page: ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
)
