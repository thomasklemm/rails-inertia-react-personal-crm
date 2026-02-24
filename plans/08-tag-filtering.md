# Plan 8: Tag Filtering

Let users click a tag anywhere in the UI and immediately filter the list to matching records. One query param, one scope, minimal UI change.

---

## Goal

- Clicking a tag badge in the contacts list filters to `?tag=vip`
- Clicking a tag badge in the companies list filters to `?tag=saas`
- Active tag filter is shown as a dismissible chip in the filter bar
- Works independently of and alongside the existing `q` (search) and `filter` params

---

## Backend

### SQLite JSON array query

Tags are stored as a JSON column (`json` type, default `[]`). To filter by a single tag value in SQLite:

```sql
EXISTS (SELECT 1 FROM json_each(contacts.tags) WHERE value = ?)
```

### `Contact.search_by_tag` scope

```ruby
scope :tagged, ->(tag) {
  where("EXISTS (SELECT 1 FROM json_each(contacts.tags) WHERE value = ?)", tag)
}
```

Same pattern for `Company`:

```ruby
scope :tagged, ->(tag) {
  where("EXISTS (SELECT 1 FROM json_each(companies.tags) WHERE value = ?)", tag)
}
```

### `ContactsController#filtered_contacts`

Add after the existing search block:

```ruby
scope = scope.tagged(params[:tag]) if params[:tag].present?
```

Also pass `tag` through in the `index` and `show` props:

```ruby
tag: params[:tag]
```

And include it in `navigate` calls so it survives pagination/sort changes. Pass it into `filtered_contacts` calls in `show` (contacts sidebar must keep the tag filter active when viewing a contact).

### `CompaniesController#filtered_companies`

Same addition:

```ruby
scope = scope.tagged(params[:tag]) if params[:tag].present?
```

Pass `tag` in `index` and `show` props.

---

## Routes

No changes — `tag` is just a query param on existing `GET /contacts` and `GET /companies`.

---

## Frontend

### `TagBadge` component (`app/frontend/components/crm/tag-badge.tsx`)

Currently renders a static badge. Add an optional `onClick` prop. When provided, render as a button instead of a span:

```tsx
interface TagBadgeProps {
  tag: string
  onClick?: (tag: string) => void
  active?: boolean
}

export function TagBadge({ tag, onClick, active }: TagBadgeProps) {
  const cls = cn(
    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
    onClick && "cursor-pointer hover:bg-primary/20 transition-colors"
  )

  if (onClick) {
    return <button type="button" className={cls} onClick={() => onClick(tag)}>{tag}</button>
  }
  return <span className={cls}>{tag}</span>
}
```

### `ContactRow` / `ContactList` wiring

In `ContactRow`, pass the current `tag` param down and an `onTagClick` handler:

```tsx
// ContactRow receives: tag?: string, onTagClick?: (tag: string) => void

<TagBadge
  tag={contact.tags[0]}
  active={tag === contact.tags[0]}
  onClick={onTagClick}
/>
```

In `ContactList.navigate`, include `tag` in the merged params object (so it's cleared/set correctly alongside other params):

```ts
const navigate = useCallback(
  (params) => {
    const merged = { q: q ?? "", filter: filter ?? "", sort: sort ?? "", sort_dir: sort_dir ?? "", tag: tag ?? "", ...params }
    // ...
  },
  [q, filter, sort, sort_dir, tag]
)

const handleTagClick = useCallback(
  (clickedTag: string) => {
    // Toggle: clicking the active tag clears it
    navigate({ tag: clickedTag === tag ? undefined : clickedTag })
  },
  [navigate, tag]
)
```

### Active tag chip in the filter bar

When `tag` is set, show a dismissible chip below the filter tabs:

```tsx
{tag && (
  <div className="px-3 pb-2 flex items-center gap-1.5">
    <span className="text-xs text-muted-foreground">Tag:</span>
    <button
      className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
      onClick={() => navigate({ tag: undefined })}
    >
      {tag}
      <X className="size-3" />
    </button>
  </div>
)}
```

### Companies side

Same pattern in `CompanyList` and `CompanyRow`. `CompanyRow` already renders `TagBadge` for company tags — add the same `onClick`/`active` wiring.

### Types (`app/frontend/types/index.ts`)

Add `tag?: string` to the props interfaces in `contacts/index.tsx`, `contacts/show.tsx`, `companies/index.tsx`, `companies/show.tsx`, and pass it through to the list components.

---

## Interaction examples

| Action | URL | Result |
|--------|-----|--------|
| Click "vip" tag on a contact row | `GET /contacts?tag=vip` | List filters to VIP contacts |
| Click "vip" again (active) | `GET /contacts` | Tag filter cleared |
| Tag filter + search | `GET /contacts?tag=vip&q=smith` | Intersection — VIP contacts matching "smith" |
| Tag filter + starred filter | `GET /contacts?tag=vip&filter=starred` | VIP starred contacts |
| Navigate to a contact, back | Tag param preserved in sidebar | Sidebar stays filtered |

---

## Spec coverage

- `Contact.tagged("vip")` returns only contacts with `"vip"` in their tags JSON array
- `contacts#index` with `tag=vip` passes `tag: "vip"` in props
- `contacts#index` with `tag=vip` only returns contacts that include the tag
- Same for `Company.tagged` and `companies#index`
- Invalid/unknown tag returns empty result (not an error)

---

## Out of scope (future)

- Multi-tag filtering (`?tags[]=vip&tags[]=customer`)
- Tag counts in the filter chip ("vip (12)")
- Tag management page (rename, merge, delete a tag globally)
