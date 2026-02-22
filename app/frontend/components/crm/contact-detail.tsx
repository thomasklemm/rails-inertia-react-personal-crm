import { router } from "@inertiajs/react"
import { ModalLink } from "@inertiaui/modal-react"
import {
  Archive,
  ArchiveRestore,
  Building2,
  Edit,
  Mail,
  Phone,
  Star,
  Trash2,
} from "lucide-react"
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
  sort_dir?: string
}

export function ContactDetail({
  contact,
  q,
  filter,
  sort,
  sort_dir,
}: ContactDetailProps) {
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const listParams = Object.fromEntries(
    Object.entries({ q, filter, sort, sort_dir }).filter(
      ([, v]) => v !== undefined && v !== "",
    ),
  )

  function handleStar() {
    router.patch(starContactPath(contact.id), {}, { preserveScroll: true })
  }

  function confirmArchive() {
    router.patch(archiveContactPath(contact.id), {}, { preserveScroll: true })
  }

  function confirmDelete() {
    router.delete(contactPath(contact.id), {
      onSuccess: () => router.visit(contactsPath(listParams)),
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <ContactAvatar contact={contact} size="lg" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg leading-snug font-semibold">
              {contact.first_name} {contact.last_name}
            </h1>
            <button
              onClick={handleStar}
              title={contact.starred ? "Unstar" : "Star"}
              className="inline-flex shrink-0 items-center rounded p-0.5 transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20"
            >
              <Star
                className={`size-4 transition-colors ${contact.starred ? "fill-amber-400 text-amber-400 hover:fill-amber-500 hover:text-amber-500" : "text-muted-foreground/40 hover:text-amber-400"}`}
              />
            </button>
            {contact.archived && (
              <span className="bg-muted text-muted-foreground shrink-0 rounded px-1.5 py-0.5 text-xs">
                Archived
              </span>
            )}
          </div>
          {contact.company && (
            <a
              href={companyPath(contact.company.id)}
              className="text-muted-foreground flex items-center gap-1 text-xs hover:underline"
            >
              <Building2 className="size-3" />
              {contact.company.name}
            </a>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            {contact.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} className="px-2 py-0.5 text-xs" />
            ))}
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <Button size="sm" variant="outline" asChild>
            <ModalLink
              navigate
              href={editContactPath(contact.id, listParams)}
              title="Edit"
            >
              <Edit className="size-4" />
              Edit
            </ModalLink>
          </Button>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => setArchiveDialogOpen(true)}
            title={contact.archived ? "Restore" : "Archive"}
          >
            {contact.archived ? (
              <ArchiveRestore className="size-4" />
            ) : (
              <Archive className="size-4" />
            )}
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

      {/* Contact info */}
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {contact.email && (
          <div>
            <dt className="text-muted-foreground text-xs font-medium">Email</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-sm">
              <Mail className="text-muted-foreground size-3.5" />
              <a href={`mailto:${contact.email}`} className="hover:underline">
                {contact.email}
              </a>
            </dd>
          </div>
        )}
        {contact.phone && (
          <div>
            <dt className="text-muted-foreground text-xs font-medium">Phone</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-sm">
              <Phone className="text-muted-foreground size-3.5" />
              <a href={`tel:${contact.phone}`} className="hover:underline">
                {contact.phone}
              </a>
            </dd>
          </div>
        )}
        <div>
          <dt className="text-muted-foreground text-xs font-medium">Added</dt>
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
            <h3 className="text-muted-foreground mb-1.5 text-xs font-medium">
              Notes
            </h3>
            <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
          </div>
        </>
      )}

      {/* Archive / Restore confirmation */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {contact.archived ? "Restore" : "Archive"} {contact.first_name}{" "}
              {contact.last_name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {contact.archived
                ? "This contact will be restored and visible in your contacts list."
                : "This contact will be moved to your archive. You can restore them at any time."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive}>
              {contact.archived ? "Restore" : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {contact.first_name} {contact.last_name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All activities and data for this
              contact will be permanently deleted.
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
