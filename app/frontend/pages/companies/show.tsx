import { router } from "@inertiajs/react"
import { Head, usePage } from "@inertiajs/react"
import { Edit, ExternalLink, Trash2 } from "lucide-react"
import type { ReactNode } from "react"

import { ContactRow } from "@/components/crm/contact-row"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import AppLayout from "@/layouts/app-layout"
import { companiesPath, companyPath, editCompanyPath } from "@/routes"
import type { BreadcrumbItem, Company, Contact } from "@/types"

interface Props {
  company: Company
  contacts: Contact[]
  [key: string]: unknown
}

export default function CompaniesShow() {
  const { company, contacts } = usePage<Props>().props

  function handleDelete() {
    if (confirm(`Delete ${company.name}? This cannot be undone.`)) {
      router.delete(companyPath(company.id))
    }
  }

  return (
    <>
      <Head title={company.name} />
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted text-xl font-semibold text-muted-foreground">
            {company.name[0].toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold">{company.name}</h1>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:underline"
              >
                <ExternalLink className="size-3.5" />
                {company.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>

          <div className="flex shrink-0 gap-1.5">
            <Button size="icon" variant="outline" className="size-8" asChild>
              <a href={editCompanyPath(company.id)}>
                <Edit className="size-4" />
              </a>
            </Button>
            <Button
              size="icon"
              variant="outline"
              data-testid="delete-company"
              className="size-8 hover:border-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        <Separator className="mb-6" />

        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          {contacts.length} {contacts.length === 1 ? "contact" : "contacts"}
        </h2>

        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contacts at this company.</p>
        ) : (
          <div className="divide-y rounded-lg border">
            {contacts.map((contact) => (
              <div key={contact.id} className="px-2">
                <ContactRow contact={contact} isActive={false} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

CompaniesShow.layout = (page: ReactNode) => {
  const { company } = (page as React.ReactElement).props as Props
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Companies", href: companiesPath() },
    { title: company?.name ?? "", href: "#" },
  ]
  return <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
}
