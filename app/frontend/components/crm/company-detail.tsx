import { router } from "@inertiajs/react"
import { Edit, ExternalLink, Trash2 } from "lucide-react"
import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { companiesPath, companyPath, editCompanyPath } from "@/routes"
import type { Company, Contact } from "@/types"

import { ContactRow } from "./contact-row"

interface CompanyDetailProps {
  company: Company
  contacts: Contact[]
  q?: string
  sort?: string
  sort_dir?: string
}

export function CompanyDetail({ company, contacts, q, sort, sort_dir }: CompanyDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const listParams = Object.fromEntries(
    Object.entries({ q, sort, sort_dir }).filter(([, v]) => v !== undefined && v !== ""),
  )

  function confirmDelete() {
    router.delete(companyPath(company.id), {
      onSuccess: () => router.visit(companiesPath(listParams)),
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted text-xl font-semibold text-muted-foreground">
          {company.name[0].toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold">{company.name}</h1>
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

        {/* Actions */}
        <div className="flex shrink-0 gap-1.5">
          <Button size="icon-sm" variant="outline" asChild>
            <a href={editCompanyPath(company.id, listParams)} title="Edit">
              <Edit className="size-4" />
            </a>
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
            onClick={() => setDeleteDialogOpen(true)}
            title="Delete"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Contacts */}
      <div>
        <h2 className="mb-3 text-xs font-medium text-muted-foreground">
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

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {company.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Contacts at this company will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
