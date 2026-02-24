# Plan 1: Follow-up Reminders

Add a `follow_up_at` date to contacts so users can track who needs attention next.

---

## Goal

- Set a follow-up date on any contact
- See overdue/upcoming follow-ups as a filter in the contacts list
- Contacts with an overdue follow-up are visually flagged
- Logging a new activity offers to clear or reschedule the follow-up

---

## Database

**Migration** — add a single nullable column:

```ruby
add_column :contacts, :follow_up_at, :date
```

Using `date` (not `datetime`) — day-level precision is enough for follow-ups.

---

## Model (`app/models/contact.rb`)

Add two scopes:

```ruby
scope :due_follow_up,      -> { where("follow_up_at IS NOT NULL AND follow_up_at <= ?", Date.current) }
scope :upcoming_follow_up, -> { where("follow_up_at IS NOT NULL AND follow_up_at > ?", Date.current) }
```

---

## Controller (`app/controllers/contacts_controller.rb`)

**`contact_params`** — permit the new field:

```ruby
params.permit(:first_name, :last_name, :email, :phone, :notes, :company_id, :follow_up_at, tags: [])
```

**`filtered_contacts`** — add a `"follow_up"` filter case:

```ruby
scope = case params[:filter]
when "starred"    then scope.where(starred: true)
when "archived"   then scope.where(archived: true)
when "follow_up"  then scope.active.due_follow_up.reorder(follow_up_at: :asc)
else                   scope.where(archived: false)
end
```

**`index` and `show` props** — add a `follow_up_count` for the sidebar badge:

```ruby
follow_up_count: Current.user.contacts.active.due_follow_up.count
```

---

## Routes

No new routes needed — follow-up date is set/cleared through the existing `PATCH /contacts/:id`.

---

## Frontend

### Types (`app/frontend/types/index.ts`)

Add to the `Contact` interface:

```ts
follow_up_at: string | null   // ISO date string "2026-02-28"
```

### ContactList (`app/frontend/components/crm/contact-list.tsx`)

Add a fourth filter tab:

```ts
{ label: "Follow-ups", value: "follow_up", icon: CalendarClock }
```

Optionally show a count badge on the tab when there are overdue contacts.

### ContactRow (`app/frontend/components/crm/contact-row.tsx`)

When `contact.follow_up_at` is set, show a small indicator after the name:

- **Overdue** (`follow_up_at <= today`): amber `CalendarClock` icon
- **Upcoming** (`follow_up_at > today`): muted `Calendar` icon with the date as a tooltip

```tsx
{contact.follow_up_at && (
  <CalendarClock
    className={cn("size-3 shrink-0", isOverdue ? "text-amber-500" : "text-muted-foreground")}
  />
)}
```

### ContactForm (`app/frontend/components/crm/contact-form.tsx`)

Add a date input field in the form (new + edit):

```tsx
<Label htmlFor="follow_up_at">Follow-up Date</Label>
<Input
  id="follow_up_at"
  name="follow_up_at"
  type="date"
  value={data.follow_up_at ?? ""}
  onChange={...}
/>
```

Include a "Clear" button/link next to the input when a date is already set.

### ContactDetail (`app/frontend/components/crm/contact-detail.tsx`)

Show the follow-up date as a badge in the info section. If overdue, use the amber/warning variant:

```tsx
{contact.follow_up_at && (
  <Badge variant={isOverdue ? "warning" : "outline"}>
    <CalendarClock className="size-3 mr-1" />
    Follow up {formatDate(contact.follow_up_at)}
  </Badge>
)}
```

Clicking the badge navigates to the edit modal (`edit_contact_path`) focused on the field, or opens an inline quick-reschedule popover if we want inline editing.

---

## Sidebar badge (optional, second pass)

In `app-sidebar.tsx`, read `follow_up_count` from shared props (needs to be added to `inertia_share` in `InertiaController`) and show a count bubble next to the Contacts nav item.

---

## Spec coverage

- `Contact` model scopes: `due_follow_up`, `upcoming_follow_up`
- `contacts#index` with `filter=follow_up` returns only overdue contacts
- `contacts#update` persists `follow_up_at` and can clear it (null)
- `contact_params` permits `follow_up_at`

---

## Out of scope (future)

- Follow-ups on companies
- Email/push notifications for due follow-ups
- Recurring follow-up intervals
