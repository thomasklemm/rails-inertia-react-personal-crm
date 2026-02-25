import { router } from "@inertiajs/react"
import { ModalLink } from "@inertiaui/modal-react"
import {
  Archive,
  ArchiveRestore,
  Building2,
  CalendarClock,
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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  archiveContactPath,
  companyPath,
  contactPath,
  contactsPath,
  editContactPath,
  newCompanyPath,
  starContactPath,
} from "@/routes"
import type { Company, Contact } from "@/types"

import { CompanyAvatar } from "./company-avatar"
import { ContactAvatar } from "./contact-avatar"
import { TagBadge } from "./tag-badge"

interface ContactDetailProps {
  contact: Contact
  companies: Company[]
  newCompanyId?: string
  q?: string
  filter?: string
  sort?: string
  sort_dir?: string
}

function dateToIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function ContactDetail({
  contact,
  companies,
  newCompanyId,
  q,
  filter,
  sort,
  sort_dir,
}: ContactDetailProps) {
  const [associating, setAssociating] = useState(!!newCompanyId)
  const [selectedCompanyId, setSelectedCompanyId] = useState(newCompanyId ?? "")
  const [disassociateDialogOpen, setDisassociateDialogOpen] = useState(false)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [followUpOpen, setFollowUpOpen] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState(contact.notes ?? "")
  const [savingNotes, setSavingNotes] = useState(false)
  const notesRef = useRef<HTMLTextAreaElement>(null)

  const today = new Date().toISOString().split("T")[0]
  const isFollowUpOverdue =
    contact.follow_up_at != null && contact.follow_up_at <= today
  const formattedFollowUpDate = contact.follow_up_at
    ? new Date(contact.follow_up_at + "T00:00:00").toLocaleDateString(
        undefined,
        { month: "short", day: "numeric", year: "numeric" },
      )
    : null
  const selectedDate = contact.follow_up_at
    ? new Date(contact.follow_up_at + "T00:00:00")
    : undefined

  const listParams = Object.fromEntries(
    Object.entries({ q, filter, sort, sort_dir }).filter(
      ([, v]) => v !== undefined && v !== "",
    ),
  )

  function handleStar() {
    router.patch(starContactPath(contact.id), {}, { preserveScroll: true })
  }

  function confirmDisassociate() {
    router.patch(
      contactPath(contact.id),
      { company_id: null },
      { preserveScroll: true },
    )
  }

  function handleAssociate() {
    if (!selectedCompanyId) return
    router.patch(
      contactPath(contact.id),
      { company_id: selectedCompanyId },
      {
        preserveScroll: true,
        onSuccess: () => {
          setAssociating(false)
          setSelectedCompanyId("")
        },
      },
    )
  }

  function cancelAssociating() {
    setAssociating(false)
    setSelectedCompanyId("")
  }

  function confirmArchive() {
    router.patch(archiveContactPath(contact.id), {}, { preserveScroll: true })
  }

  function confirmDelete() {
    router.delete(contactPath(contact.id), {
      onSuccess: () => router.visit(contactsPath(listParams)),
    })
  }

  function startEditNotes() {
    setNotesValue(contact.notes ?? "")
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
    setNotesValue(contact.notes ?? "")
  }

  function saveNotes() {
    setSavingNotes(true)
    router.patch(
      contactPath(contact.id),
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

  function handleFollowUpSelect(date: Date | undefined) {
    setFollowUpOpen(false)
    router.patch(
      contactPath(contact.id),
      { follow_up_at: date ? dateToIso(date) : "" },
      { preserveScroll: true },
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <ContactAvatar contact={contact} size="lg" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg leading-snug font-semibold">
              {contact.first_name} {contact.last_name}
            </h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleStar}
                  title={contact.starred ? "Unstar" : "Star"}
                  className="inline-flex shrink-0 items-center rounded p-0.5 transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20"
                >
                  <Star
                    className={`size-4 transition-colors ${contact.starred ? "fill-amber-400 text-amber-400 hover:fill-amber-500 hover:text-amber-500" : "text-muted-foreground/40 hover:text-amber-400"}`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {contact.starred ? "Unstar" : "Star"}
              </TooltipContent>
            </Tooltip>
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
              <span className="hidden sm:inline">Edit</span>
            </ModalLink>
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="outline"
                title={contact.archived ? "Restore" : "Archive"}
                onClick={() => setArchiveDialogOpen(true)}
              >
                {contact.archived ? (
                  <ArchiveRestore className="size-4" />
                ) : (
                  <Archive className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {contact.archived ? "Restore" : "Archive"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                title="Delete"
                className="hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
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

        {/* Follow-up date — always shown, click to set/change */}
        <div>
          <dt className="text-muted-foreground text-xs font-medium">
            Follow-up
          </dt>
          <dd className="mt-0.5">
            <Popover open={followUpOpen} onOpenChange={setFollowUpOpen}>
              <PopoverTrigger asChild>
                <button className="group flex items-center gap-1.5 text-sm">
                  <CalendarClock
                    className={`size-3.5 shrink-0 ${isFollowUpOverdue ? "text-amber-500" : "text-muted-foreground"}`}
                  />
                  {contact.follow_up_at ? (
                    <>
                      <span
                        className={`group-hover:underline ${isFollowUpOverdue ? "text-amber-600 dark:text-amber-400" : ""}`}
                      >
                        {formattedFollowUpDate}
                      </span>
                      {isFollowUpOverdue && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          Overdue
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground group-hover:underline">
                      Set date
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  defaultMonth={selectedDate}
                  onSelect={handleFollowUpSelect}
                  initialFocus
                />
                {contact.follow_up_at && (
                  <div className="border-t px-3 py-2">
                    <button
                      onClick={() => handleFollowUpSelect(undefined)}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      Clear follow-up date
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </dd>
        </div>
      </dl>

      <Separator />

      {/* Company */}
      <div>
        <dt className="text-muted-foreground text-xs font-medium">Company</dt>
        <dd className="mt-1.5">
          {contact.company ? (
            <div className="group/company space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <a
                  href={companyPath(contact.company.id)}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <CompanyAvatar company={contact.company} size="sm" />
                  <span className="hover:underline">
                    {contact.company.name}
                  </span>
                </a>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDisassociateDialogOpen(true)}
                  title="Remove company association"
                  className="opacity-0 transition-opacity group-hover/company:opacity-100"
                >
                  <X className="text-muted-foreground size-3.5" />
                </Button>
              </div>
              {(contact.company.website ??
                contact.company.phone ??
                contact.company.address) && (
                <div className="text-muted-foreground space-y-1 text-xs">
                  {contact.company.website && (
                    <a
                      href={contact.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:underline"
                    >
                      <ExternalLink className="size-3 shrink-0" />
                      {contact.company.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                  {contact.company.phone && (
                    <a
                      href={`tel:${contact.company.phone}`}
                      className="flex items-center gap-1.5 hover:underline"
                    >
                      <Phone className="size-3 shrink-0" />
                      {contact.company.phone}
                    </a>
                  )}
                  {contact.company.address && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3 shrink-0" />
                      {contact.company.address}
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : associating ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Select
                  value={selectedCompanyId}
                  onValueChange={setSelectedCompanyId}
                >
                  <SelectTrigger className="h-8 flex-1 text-sm">
                    <SelectValue placeholder="Pick a company…" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0"
                  asChild
                >
                  <ModalLink
                    navigate
                    href={newCompanyPath({
                      return_to: contactPath(contact.id),
                    })}
                  >
                    New Company
                  </ModalLink>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-8"
                  onClick={handleAssociate}
                  disabled={!selectedCompanyId}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={cancelAssociating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-sm"
              onClick={() => setAssociating(true)}
            >
              <Building2 className="size-3.5" />
              Associate Company
            </Button>
          )}
        </dd>
      </div>

      <Separator />

      {/* Notes */}
      <div className="group/notes">
        <div className="mb-1.5 flex items-center gap-1.5">
          <h3 className="text-muted-foreground text-xs font-medium">Notes</h3>
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
        ) : contact.notes ? (
          <p
            className="cursor-text text-sm whitespace-pre-wrap"
            onDoubleClick={startEditNotes}
            title="Double-click to edit"
          >
            {contact.notes}
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

      {/* Disassociate company confirmation */}
      <AlertDialog
        open={disassociateDialogOpen}
        onOpenChange={setDisassociateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Company Association?</AlertDialogTitle>
            <AlertDialogDescription>
              {contact.company?.name} will be unlinked from {contact.first_name}{" "}
              {contact.last_name}. The company will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDisassociate}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
