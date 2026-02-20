import { router } from "@inertiajs/react"
import { Edit, ExternalLink, Mail, MapPin, Phone, Star, Trash2 } from "lucide-react"
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
import { companiesPath, companyPath, editCompanyPath, starCompanyPath } from "@/routes"
import type { Company, Contact } from "@/types"

import { CompanyAvatar } from "./company-avatar"
import { CompanyTagBadge } from "./tag-badge"
import { ContactRow } from "./contact-row"

interface CompanyDetailProps {
  company: Company
  contacts: Contact[]
  q?: string
  filter?: string
  sort?: string
  sort_dir?: string
}

export function CompanyDetail({
  company,
  contacts,
  q,
  filter,
  sort,
  sort_dir,
}: CompanyDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const listParams = Object.fromEntries(
    Object.entries({ q, filter, sort, sort_dir }).filter(([, v]) => v !== undefined && v !== ""),
  )

  function handleStar() {
    router.patch(starCompanyPath(company.id), {}, { preserveScroll: true })
  }

  function confirmDelete() {
    router.delete(companyPath(company.id), {
      onSuccess: () => router.visit(companiesPath(listParams)),
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <CompanyAvatar company={company} size="md" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h1 className="truncate text-base font-semibold leading-snug">{company.name}</h1>
            {company.starred && <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />}
          </div>

          {/* Tags + Actions */}
          <div className="mt-2 flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {company.tags.map((tag) => (
                <CompanyTagBadge key={tag} tag={tag} />
              ))}
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                size="icon-xs"
                variant="outline"
                onClick={handleStar}
                title={company.starred ? "Unstar" : "Star"}
              >
                <Star
                  className={`size-3 ${company.starred ? "fill-amber-400 text-amber-400" : ""}`}
                />
              </Button>
              <Button size="icon-xs" variant="outline" asChild>
                <a href={editCompanyPath(company.id, listParams)} title="Edit">
                  <Edit className="size-3" />
                </a>
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                className="hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
                onClick={() => setDeleteDialogOpen(true)}
                title="Delete"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Info grid */}
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {company.website && (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Website</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-sm">
              <ExternalLink className="size-3.5 text-muted-foreground" />
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {company.website.replace(/^https?:\/\//, "")}
              </a>
            </dd>
          </div>
        )}
        {company.phone && (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Phone</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-sm">
              <Phone className="size-3.5 text-muted-foreground" />
              <a href={`tel:${company.phone}`} className="hover:underline">
                {company.phone}
              </a>
            </dd>
          </div>
        )}
        {company.email && (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Email</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-sm">
              <Mail className="size-3.5 text-muted-foreground" />
              <a href={`mailto:${company.email}`} className="hover:underline">
                {company.email}
              </a>
            </dd>
          </div>
        )}
        {company.address && (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Address</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-sm">
              <MapPin className="size-3.5 text-muted-foreground" />
              {company.address}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Added</dt>
          <dd className="mt-0.5 text-sm">
            {new Date(company.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </dd>
        </div>
      </dl>

      {/* Notes */}
      {company.notes && (
        <>
          <Separator />
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">Notes</h3>
            <p className="whitespace-pre-wrap text-sm">{company.notes}</p>
          </div>
        </>
      )}

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
