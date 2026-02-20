# Personal CRM — Build Plan

Inspired by [unpoly-contact-manager-demo.fly.dev](https://unpoly-contact-manager-demo.fly.dev/).
Stack: Rails + Inertia.js + React + shadcn/ui (this repo's existing stack).

---

## What We're Building

A personal CRM with:

- **Contacts** — full CRUD, search, filter (All / Starred / Archived), sort, multi-tag labels, star, archive
- **Companies** — group contacts; show company detail with its contacts
- **Activities** — log notes, calls, emails against a contact; global activity feed
- **Two-panel layout** — contact list always visible on the left, detail / form rendered on the right

---

## Data Model

### companies
```ruby
create_table :companies do |t|
  t.string :name, null: false
  t.string :website
  t.timestamps
end
```

### contacts
```ruby
create_table :contacts do |t|
  t.string  :first_name, null: false
  t.string  :last_name,  null: false
  t.string  :email
  t.string  :phone
  t.text    :notes
  t.boolean :starred,  null: false, default: false
  t.boolean :archived, null: false, default: false
  t.string  :tags, array: true, default: []   # PostgreSQL array
  t.references :company, foreign_key: true    # optional
  t.timestamps
end

add_index :contacts, :tags, using: :gin      # fast array queries
```

Valid tags: `customer`, `friend`, `investor`, `lead`, `partner`, `prospect`, `vip`, `vendor`

### activities
```ruby
create_table :activities do |t|
  t.string :kind, null: false     # enum: "note" | "call" | "email"
  t.text   :body, null: false
  t.references :contact, null: false, foreign_key: true
  t.timestamps
end
```

---

## Routes

```ruby
resources :contacts do
  member do
    patch :star
    patch :archive
  end
end

resources :companies

resources :activities
```

js-routes helpers: `contactsPath()`, `contactPath(id)`, `editContactPath(id)`, `starContactPath(id)`, `archiveContactPath(id)`, `companiesPath()`, `companyPath(id)`, `activitiesPath()`, `activityPath(id)`, `editActivityPath(id)`

---

## Controllers

All inherit from `InertiaController`.

Every Contacts action passes these sidebar props:
- `contacts:` — filtered/sorted list for the left panel
- `q:`, `filter:`, `sort:` — current URL params (preserved across navigation)

### ContactsController

| Action    | Props passed                                          | Redirect on success          |
|-----------|-------------------------------------------------------|------------------------------|
| `index`   | contacts, q, filter, sort                             | —                            |
| `show`    | contacts, contact, activities, companies, q, filter, sort | —                        |
| `new`     | contacts, companies, q, filter, sort                  | —                            |
| `create`  | —                                                     | `contacts#show`              |
| `edit`    | contacts, contact, companies, q, filter, sort         | —                            |
| `update`  | —                                                     | `contacts#show`              |
| `destroy` | —                                                     | `contacts#index`             |
| `star`    | —                                                     | `redirect_back_or_to contact_path` |
| `archive` | —                                                     | `redirect_back_or_to contacts_path` |

### CompaniesController

Standard CRUD. Full-width layout (no two-panel). Passes `companies:` to index, `company:, contacts:` to show.

### ActivitiesController

- `index` — global feed; passes `activities:, q:, kind_filter:`
- `create` — from contact show; redirects to `contacts#show`
- `edit` / `update` — edit an activity; redirects back
- `destroy` — delete; redirects back

---

## Filtering Logic (ContactsController)

```ruby
def filtered_contacts
  scope = Contact.includes(:company).order(:last_name, :first_name)

  scope = case params[:filter]
          when "starred"  then scope.where(starred: true)
          when "archived" then scope.where(archived: true)
          else                 scope.where(archived: false)
          end

  if params[:q].present?
    q = "%#{params[:q]}%"
    scope = scope.where("first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ?", q, q, q)
  end

  scope = case params[:sort]
          when "first"   then scope.reorder(:first_name, :last_name)
          when "added"   then scope.reorder(created_at: :desc)
          when "company" then scope.joins("LEFT JOIN companies ON companies.id = contacts.company_id")
                                   .reorder("companies.name NULLS LAST", :last_name)
          else scope   # default: last_name, first_name
          end

  scope
end
```

---

## Frontend Architecture

### Two-Panel CRM Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar nav: Contacts · Activity Log · Companies           │
├──────────────────────┬──────────────────────────────────────┤
│  🔍 Search contacts  │                                      │
│  [All][Starred][Arch]│                                      │
│  ─ Name  First Added │  Right panel:                        │
│                      │  Contact detail / form / empty state │
│  ZA  Zara Ahmed  ★   │                                      │
│  SA  Sofia A.        │                                      │
│  OB  Owen B.         │                                      │
│  ...                 │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

`CrmLayout` is an Inertia **persistent layout** — the left panel doesn't remount when navigating between contacts. It reads `contacts`, `q`, `filter`, `sort` from `usePage().props`.

```tsx
// Usage in page components
ContactsShow.layout = (page: ReactNode) => (
  <AppLayout breadcrumbs={breadcrumbs}>
    <CrmLayout>{page}</CrmLayout>
  </AppLayout>
)
```

The `AppLayout` (existing sidebar + shell) wraps `CrmLayout`, so the app shell persists at the outermost level. The inner `CrmLayout` handles the two-panel split.

### Pages

| URL | Component | Right Panel |
|-----|-----------|-------------|
| `/contacts` | `Contacts/Index` | Empty / welcome state |
| `/contacts/new` | `Contacts/New` | New contact form |
| `/contacts/:id` | `Contacts/Show` | Contact detail + activity log |
| `/contacts/:id/edit` | `Contacts/Edit` | Edit contact form |
| `/companies` | `Companies/Index` | Full-width companies grid |
| `/companies/new` | `Companies/New` | New company form |
| `/companies/:id` | `Companies/Show` | Company detail + contacts |
| `/companies/:id/edit` | `Companies/Edit` | Edit company form |
| `/activities` | `Activities/Index` | Full-width global log |
| `/activities/:id` | `Activities/Show` | Activity detail |
| `/activities/:id/edit` | `Activities/Edit` | Edit activity form |

### Components to Build

| Component | Description |
|-----------|-------------|
| `ContactAvatar` | Initials badge (`ZA`, `SC`) with color based on name hash |
| `TagBadge` | Small colored badge per tag (Customer, VIP, etc.) |
| `ContactRow` | Single row in the left panel list |
| `ContactList` | Left panel: search input + filter tabs + sort links + list |
| `ContactDetail` | Right panel: name, company, star/archive/edit/delete, contact info |
| `ActivityLog` | Tabbed list of activities on contact detail (All / Notes / Calls / Emails) |
| `ActivityItem` | Single activity entry (icon + body + edit/delete actions) |
| `ActivityForm` | Inline form to log note/call/email (on Contact/Show) |
| `ContactForm` | Reusable form for new/edit contact |
| `CompanyRow` | Company with website + contact count |

---

## TypeScript Types

Add to `app/frontend/types/index.ts`:

```typescript
export type Tag =
  | "customer" | "friend" | "investor" | "lead"
  | "partner"  | "prospect" | "vip"    | "vendor"

export type ActivityKind = "note" | "call" | "email"

export interface Company {
  id: number
  name: string
  website: string | null
  contacts_count?: number
}

export interface Contact {
  id: number
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  notes: string | null
  starred: boolean
  archived: boolean
  tags: Tag[]
  company: Company | null
  created_at: string
}

export interface Activity {
  id: number
  kind: ActivityKind
  body: string
  contact: Pick<Contact, "id" | "first_name" | "last_name">
  created_at: string
  updated_at: string
}
```

---

## Build Order

### Phase 1 — Data Foundation
- [ ] Migration: `create_companies`
- [ ] Migration: `create_contacts` (with `tags` array, `starred`, `archived`, `company_id`)
- [ ] Migration: `create_activities` (kind enum, body, contact_id)
- [ ] `Company` model — validations, `has_many :contacts`
- [ ] `Contact` model — validations, `TAGS` constant, tag validation, `belongs_to :company` (optional), `has_many :activities`, scopes (`.starred`, `.archived`, `.active`, `.search(q)`)
- [ ] `Activity` model — `enum :kind`, validations, `belongs_to :contact`
- [ ] `db/seeds.rb` — 8 companies, 26 contacts with tags/stars, ~100 activities

### Phase 2 — Routes & Controllers
- [ ] Add routes to `config/routes.rb` + regenerate js-routes
- [ ] `ContactsController` — `index`, `show` with `filtered_contacts` helper
- [ ] `ContactsController` — `new`, `create`, `edit`, `update`, `destroy`
- [ ] `ContactsController` — `star`, `archive` member actions
- [ ] `CompaniesController` — full CRUD
- [ ] `ActivitiesController` — `index`, `create`, `edit`, `update`, `destroy`

### Phase 3 — CRM Layout & Sidebar
- [ ] `ContactAvatar` component
- [ ] `TagBadge` component
- [ ] `ContactRow` component
- [ ] `ContactList` component (search input, filter tabs, sort links, rows)
- [ ] `CrmLayout` persistent layout (two-panel shell)
- [ ] Add Contacts / Activity Log / Companies to sidebar nav (`nav-main.tsx`)

### Phase 4 — Contacts Feature
- [ ] `Contacts/Index` — empty right panel
- [ ] `ContactDetail` component (header, contact info, star/archive/delete actions)
- [ ] `ActivityItem` component
- [ ] `ActivityLog` component (tabbed, filter All/Notes/Calls/Emails)
- [ ] `ActivityForm` inline component
- [ ] `Contacts/Show` — assembles ContactDetail + ActivityLog + ActivityForm
- [ ] `ContactForm` component (first/last name, email, phone, company select, tag checkboxes, notes)
- [ ] `Contacts/New` page
- [ ] `Contacts/Edit` page

### Phase 5 — Companies Feature
- [ ] `CompanyRow` component
- [ ] `Companies/Index` page — grid of companies with website + contact count
- [ ] `Companies/Show` page — company detail + contact list
- [ ] `Companies/New` / `Companies/Edit` pages

### Phase 6 — Activity Log Feature
- [ ] `Activities/Index` page — global feed with search + kind filter
- [ ] `Activities/Edit` page
- [ ] `Activities/Show` page (optional — can just expand inline)

### Phase 7 — Polish & Tests
- [ ] TypeScript types in `app/frontend/types/index.ts`
- [ ] `globals.d.ts` — no new shared props needed (auth already shared)
- [ ] RSpec model specs — Contact, Company, Activity
- [ ] RSpec controller specs — ContactsController (use `render_component`, `have_props`, `have_flash`)
- [ ] Final seed data tuning

---

## Key Implementation Notes

### Star / Archive toggles
```ruby
def star
  @contact.update!(starred: !@contact.starred)
  redirect_back_or_to contact_path(@contact), notice: @contact.starred? ? "Starred" : "Unstarred"
end

def archive
  @contact.update!(archived: !@contact.archived)
  redirect_back_or_to contacts_path, notice: @contact.archived? ? "Archived" : "Restored"
end
```

### Tag checkboxes in form
```html
<!-- Each tag is a checkbox whose name maps to contacts[tags][] -->
<input type="checkbox" name="tags[]" value="customer" />
```
On the React side use `useForm` with `data.tags` as `string[]`.
In the controller: `params.require(:contact).permit(:first_name, ..., tags: [])`.

### Activity inline logging (Contact/Show)
The `ActivityForm` on the contact detail page submits `POST /activities` with `activity[contact_id]`, `activity[kind]`, `activity[body]`. On success Rails redirects back to `contacts#show` and the activity appears at the top of the log.

### URL-driven search preserves list state
All contact list navigation includes current `q`, `filter`, `sort` params:
```tsx
<Link href={contactPath(contact.id, { q, filter, sort })}>...</Link>
```
This way clicking a contact in the search results keeps the search active while showing the detail.

### Inertia `only` for sidebar refresh
When logging an activity (right-panel action), use Inertia's `only` to avoid refetching the contact list:
```ruby
# ActivitiesController#create
redirect_to contact_path(@activity.contact), only: [:contact, :activities]
# contacts_controller#show then only reloads those two props
```
(This is an optimization; correctness works without it.)
