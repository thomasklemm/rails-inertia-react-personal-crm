import { router } from "@inertiajs/react"
import { ModalLink } from "@inertiaui/modal-react"
import {
  Check,
  Edit,
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Star,
  Trash2,
  X,
} from "lucide-react"
import { useRef, useState } from "react"

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
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  companiesPath,
  companyPath,
  editCompanyPath,
  newContactPath,
  starCompanyPath,
} from "@/routes"
import type { Company, Contact } from "@/types"

import { CompanyAvatar } from "./company-avatar"
import { ContactRow } from "./contact-row"
import { CompanyTagBadge } from "./tag-badge"

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
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState(company.notes ?? "")
  const [savingNotes, setSavingNotes] = useState(false)
  const notesRef = useRef<HTMLTextAreaElement>(null)

  function startEditNotes() {
    setNotesValue(company.notes ?? "")
    setEditingNotes(true)
    setTimeout(() => {
      const el = notesRef.current
      if (!el) return
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    }, 0)
  }

  function cancelEditNotes() {
    setEditingNotes(false)
    setNotesValue(company.notes ?? "")
  }

  function saveNotes() {
    setSavingNotes(true)
    router.patch(
      companyPath(company.id),
      { notes: notesValue },
      {
        preserveScroll: true,
        onSuccess: () => {
          setEditingNotes(false)
          setSavingNotes(false)
        },
        onError: () => setSavingNotes(false),
      },
    )
  }

  const listParams = Object.fromEntries(
    Object.entries({ q, filter, sort, sort_dir }).filter(
      ([, v]) => v !== undefined && v !== "",
    ),
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
        <CompanyAvatar company={company} size="lg" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg leading-snug font-semibold">
              {company.name}
            </h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleStar}
                  className="inline-flex shrink-0 items-center rounded p-0.5 transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20"
                >
                  <Star
                    className={`size-4 transition-colors ${company.starred ? "fill-amber-400 text-amber-400 hover:fill-amber-500 hover:text-amber-500" : "text-muted-foreground/40 hover:text-amber-400"}`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {company.starred ? "Unstar" : "Star"}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {company.tags.map((tag) => (
              <CompanyTagBadge
                key={tag}
                tag={tag}
                className="px-2 py-0.5 text-xs"
              />
            ))}
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <Button size="sm" variant="outline" asChild>
            <ModalLink
              navigate
              href={editCompanyPath(company.id, listParams)}
              title="Edit"
            >
              <Edit className="size-4" />
              Edit
            </ModalLink>
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className="hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
                onClick={() => setDeleteDialogOpen(true)}
                title="Delete"
              >
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Separator />

      {/* Info grid */}
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {company.website && (
          <div>
            <dt className="text-muted-foreground text-xs font-medium">
              Website
            </dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-sm">
              <ExternalLink className="text-muted-foreground size-3.5" />
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
            <dt className="text-muted-foreground text-xs font-medium">Phone</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-sm">
              <Phone className="text-muted-foreground size-3.5" />
              <a href={`tel:${company.phone}`} className="hover:underline">
                {company.phone}
              </a>
            </dd>
          </div>
        )}
        {company.email && (
          <div>
            <dt className="text-muted-foreground text-xs font-medium">Email</dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-sm">
              <Mail className="text-muted-foreground size-3.5" />
              <a href={`mailto:${company.email}`} className="hover:underline">
                {company.email}
              </a>
            </dd>
          </div>
        )}
        {company.address && (
          <div>
            <dt className="text-muted-foreground text-xs font-medium">
              Address
            </dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-sm">
              <MapPin className="text-muted-foreground size-3.5" />
              {company.address}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-muted-foreground text-xs font-medium">Added</dt>
          <dd className="mt-0.5 text-sm">
            {new Date(company.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </dd>
        </div>
      </dl>

      <Separator />

      {/* Contacts + Notes side by side */}
      <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-0">
        {/* Contacts */}
        <div className="w-full lg:w-1/2 lg:pr-8">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight">
                Contacts
              </h2>
              <span className="text-muted-foreground text-xs">
                {contacts.length}{" "}
                {contacts.length === 1 ? "contact" : "contacts"}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 px-2 text-xs font-medium"
              asChild
            >
              <ModalLink
                navigate
                href={newContactPath({ company_id: String(company.id) })}
              >
                + Add Contact
              </ModalLink>
            </Button>
          </div>
          {contacts.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No contacts at this company.
            </p>
          ) : (
            <div className="divide-y overflow-hidden rounded-lg border">
              {contacts.map((contact) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  isActive={false}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-border hidden w-px self-stretch lg:block" />

        {/* Notes */}
        <div className="group/notes w-full lg:w-1/2 lg:pl-8">
          <div className="mb-1.5 flex items-center gap-1.5">
            <h3 className="text-base font-semibold tracking-tight">Notes</h3>
            {!editingNotes && (
              <button
                onClick={startEditNotes}
                className="hover:bg-muted rounded p-0.5 opacity-0 transition-opacity group-hover/notes:opacity-100"
                title="Edit notes"
              >
                <Pencil className="text-muted-foreground size-3" />
              </button>
            )}
          </div>
          {editingNotes ? (
            <div className="space-y-2">
              <Textarea
                ref={notesRef}
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                placeholder="Add notes…"
                rows={5}
                className="resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Escape") cancelEditNotes()
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveNotes()
                }}
              />
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  className="h-7 gap-1 px-2.5 text-xs"
                  onClick={saveNotes}
                  disabled={savingNotes}
                >
                  <Check className="size-3" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 px-2.5 text-xs"
                  onClick={cancelEditNotes}
                  disabled={savingNotes}
                >
                  <X className="size-3" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : company.notes ? (
            <p
              className="cursor-text text-sm whitespace-pre-wrap"
              onDoubleClick={startEditNotes}
              title="Double-click to edit"
            >
              {company.notes}
            </p>
          ) : (
            <p
              className="text-muted-foreground cursor-text text-sm"
              onClick={startEditNotes}
            >
              Add notes…
            </p>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {company.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Contacts at this company will not be
              deleted.
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
