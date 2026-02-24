# Plan 3: Contact → Company Relationship Enhancements

Make the contact ↔ company link feel first-class: show rich company details on the contact page, and let users associate/disassociate a company inline without navigating to the edit form.

---

## Goal

- **When a contact has a company**: show the company's website, phone, and address directly on the contact detail page, with a link to the company's own page.
- **When a contact has no company**: show an inline "Associate with Company" control that lets the user pick from existing companies (or create one) with a single save — no need to open the edit modal.
- **Disassociate**: a small "×" next to the company name clears the link instantly.

---

## Backend

### No new routes needed

Both "associate" and "disassociate" are `PATCH /contacts/:id` with `company_id` (a valid id, or `null`/blank to clear). The existing `update` action and `contact_params` already handle this:

```ruby
# contact_params already permits :company_id — no change needed
params.permit(:first_name, :last_name, :email, :phone, :notes, :company_id, :follow_up_at, tags: [])
```

Sending `company_id: ""` or `company_id: null` will set it to `nil` because the column is nullable (and `optional: true` is already on the `belongs_to`).

### `contacts#show` already passes `companies`

```ruby
companies: Current.user.companies.order(:name).as_json
```

No controller changes required.

---

## Frontend

### Types (`app/frontend/types/index.ts`)

The `Company` type should include the fields we want to surface. Verify it has:

```ts
export interface Company {
  id: number
  name: string
  website: string | null
  phone: string | null
  email: string | null
  address: string | null
  starred: boolean
  tags: string[]
  created_at: string
  updated_at: string
}
```

The `Contact` type's `company` field is already `Company | null` (included via `as_json(include: :company)`).

---

### `contact-detail.tsx` — Company section

Replace the current simple company name display with a richer block.

#### When a company is linked

```tsx
<div className="rounded-lg border p-4 space-y-3">
  <div className="flex items-center justify-between">
    <Link href={companyPath(contact.company.id)} className="font-medium hover:underline flex items-center gap-2">
      <CompanyAvatar company={contact.company} size="sm" />
      {contact.company.name}
    </Link>
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDisassociate}        // PATCH with company_id: null
      title="Remove company association"
    >
      <X className="size-4 text-muted-foreground" />
    </Button>
  </div>

  {/* Rich company details */}
  <div className="grid grid-cols-1 gap-1 text-sm text-muted-foreground">
    {contact.company.website && (
      <a href={contact.company.website} target="_blank" rel="noopener" className="hover:underline truncate">
        {contact.company.website}
      </a>
    )}
    {contact.company.phone && <span>{contact.company.phone}</span>}
    {contact.company.address && <span>{contact.company.address}</span>}
  </div>
</div>
```

The "disassociate" button submits via Inertia `router.patch(contactPath(contact.id), { company_id: null })`. On success Inertia reloads the page props.

#### When no company is linked

Show an inline associate control. Use a `<select>` from shadcn `<Select>` populated from the `companies` prop (already passed to `contacts/show`):

```tsx
const [associating, setAssociating] = useState(false)

{!contact.company && (
  associating ? (
    <div className="flex items-center gap-2">
      <Select onValueChange={handleAssociate}>
        <SelectTrigger className="h-8 text-sm">
          <SelectValue placeholder="Pick a company…" />
        </SelectTrigger>
        <SelectContent>
          {companies.map(c => (
            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="sm" onClick={() => setAssociating(false)}>Cancel</Button>
    </div>
  ) : (
    <Button variant="outline" size="sm" onClick={() => setAssociating(true)}>
      <Building2 className="size-4 mr-1.5" />
      Associate Company
    </Button>
  )
)}
```

`handleAssociate(companyId)` calls:

```ts
router.patch(contactPath(contact.id), { company_id: companyId }, {
  onSuccess: () => setAssociating(false)
})
```

---

### `contacts/show.tsx`

Pass `companies` down to `ContactDetail`:

```tsx
const { contact, activities, companies, q, filter, sort, sort_dir } = usePage<Props>().props

<ContactDetail contact={contact} companies={companies} ... />
```

---

### `contact-detail.tsx` props update

```ts
interface ContactDetailProps {
  contact: Contact
  companies: Company[]   // add this
  q?: string
  // ...
}
```

---

## Interaction details

| Action | Method | Payload | Result |
|--------|--------|---------|--------|
| Associate company | `router.patch` | `{ company_id: id }` | Page reloads with company data |
| Disassociate | `router.patch` | `{ company_id: null }` | Page reloads showing picker |
| Create new company | Opens `new_company_path` in a modal via `ModalLink` | — | After create, redirects back; user can then associate |

The "create + associate in one step" is deferred — for now the user creates the company first, then associates. A simpler flow for v1.

---

## Spec coverage

- `contacts#update` with `company_id: nil` clears the association
- `contacts#update` with a valid `company_id` sets the association
- `contacts#show` includes `companies` in props
- `contacts#show` contact prop includes nested company data (`include: :company`)

---

## Out of scope (future)

- Inline company creation from the associate picker
- Showing "other contacts at this company" on the contact detail
- Bulk re-associate (move all contacts from company A to company B)
