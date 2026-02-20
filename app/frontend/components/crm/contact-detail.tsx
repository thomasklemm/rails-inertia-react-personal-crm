import { router } from "@inertiajs/react"
import { Archive, Building2, Edit, Mail, Phone, Star, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  archiveContactPath,
  companyPath,
  contactPath,
  contactsPath,
  editContactPath,
  starContactPath,
} from "@/routes"
import type { Contact } from "@/types"

import { ContactAvatar } from "./contact-avatar"
import { TagBadge } from "./tag-badge"

interface ContactDetailProps {
  contact: Contact
  q?: string
  filter?: string
  sort?: string
}

export function ContactDetail({ contact, q, filter, sort }: ContactDetailProps) {
  const listParams = Object.fromEntries(
    Object.entries({ q, filter, sort }).filter(([, v]) => v !== undefined && v !== ""),
  )

  function handleStar() {
    router.patch(starContactPath(contact.id), {}, { preserveScroll: true })
  }

  function handleArchive() {
    router.patch(archiveContactPath(contact.id), {}, { preserveScroll: true })
  }

  function handleDelete() {
    if (confirm(`Delete ${contact.first_name} ${contact.last_name}? This cannot be undone.`)) {
      router.delete(contactPath(contact.id), {
        onSuccess: () => router.visit(contactsPath(listParams)),
      })
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <ContactAvatar contact={contact} size="lg" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-semibold">
              {contact.first_name} {contact.last_name}
            </h1>
            {contact.starred && <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" />}
            {contact.archived && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                Archived
              </span>
            )}
          </div>
          {contact.company && (
            <a
              href={companyPath(contact.company.id)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:underline"
            >
              <Building2 className="size-3.5" />
              {contact.company.name}
            </a>
          )}
          {contact.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {contact.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-1.5">
          <Button
            size="icon"
            variant="outline"
            className="size-8"
            onClick={handleStar}
            title={contact.starred ? "Unstar" : "Star"}
          >
            <Star
              className={`size-4 ${contact.starred ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
            />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="size-8"
            onClick={handleArchive}
            title={contact.archived ? "Restore" : "Archive"}
          >
            <Archive className="size-4 text-muted-foreground" />
          </Button>
          <Button size="icon" variant="outline" className="size-8" asChild>
            <a href={editContactPath(contact.id, listParams)} title="Edit">
              <Edit className="size-4" />
            </a>
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="size-8 hover:border-destructive hover:text-destructive"
            onClick={handleDelete}
            title="Delete"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Contact info */}
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {contact.email && (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Email</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-sm">
              <Mail className="size-3.5 text-muted-foreground" />
              <a href={`mailto:${contact.email}`} className="hover:underline">
                {contact.email}
              </a>
            </dd>
          </div>
        )}
        {contact.phone && (
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Phone</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-sm">
              <Phone className="size-3.5 text-muted-foreground" />
              <a href={`tel:${contact.phone}`} className="hover:underline">
                {contact.phone}
              </a>
            </dd>
          </div>
        )}
        <div>
          <dt className="text-xs font-medium text-muted-foreground">Added</dt>
          <dd className="mt-0.5 text-sm">
            {new Date(contact.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </dd>
        </div>
      </dl>

      {contact.notes && (
        <>
          <Separator />
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">Notes</h3>
            <p className="whitespace-pre-wrap text-sm">{contact.notes}</p>
          </div>
        </>
      )}
    </div>
  )
}
