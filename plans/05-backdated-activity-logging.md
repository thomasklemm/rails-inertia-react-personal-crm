# Plan 5: Backdated Activity Logging

Add an explicit `occurred_at` timestamp to activities so users can log "I called them last Tuesday" accurately. The common case (logging right now) stays unchanged — the date defaults to the current time and the UI hides the picker unless the user expands it.

---

## Problem

Every `timeAgo()` call, date grouping header, and ordering query reads `created_at` — the moment the record was saved, not when the interaction happened. A call logged today about a meeting three days ago shows up under "Today" and says "just now."

---

## Database

### Migration

```ruby
add_column :activities, :occurred_at, :datetime, null: false,
           comment: "When the interaction happened (user-controlled), defaults to created_at"
add_index  :activities, :occurred_at
```

No database-level default — the model sets it via `before_validation` so Rails's dirty tracking and the audit trail work correctly.

### Data migration (separate migration)

Backfill existing rows so `occurred_at = created_at`:

```ruby
class BackfillActivitiesOccurredAt < ActiveRecord::Migration[8.1]
  def up
    Activity.in_batches.update_all("occurred_at = created_at")
  end
end
```

Run as a separate migration to keep it reversible and fast on large tables.

---

## Model (`app/models/activity.rb`)

**Three changes:**

```ruby
before_validation :set_occurred_at

# Change default_scope from created_at to occurred_at:
default_scope { order(occurred_at: :desc) }

def as_activity_json
  as_json(except: %w[subject_type subject_id user_id])
    .merge("subject" => subject_json)
  # occurred_at is now included automatically via as_json
end

private

def set_occurred_at
  self.occurred_at ||= Time.current
end
```

`occurred_at` is present on every JSON response alongside `created_at`. `created_at` is kept as an audit timestamp ("record added at") but no longer drives display logic.

---

## Controller (`app/controllers/activities_controller.rb`)

**`activity_params`** — permit the new field:

```ruby
def activity_params
  params.permit(:kind, :body, :subject_type, :subject_id, :occurred_at)
end
```

**`activity_update_params`** — also permit:

```ruby
def activity_update_params
  params.permit(:kind, :body, :occurred_at)
end
```

The `index` search queries join on `contacts`/`companies` columns and are unaffected.

---

## TypeScript types (`app/frontend/types/index.ts`)

Add `occurred_at` to the `Activity` interface:

```ts
export interface Activity {
  id: number
  kind: ActivityKind
  body: string
  subject: ActivitySubject
  occurred_at: string   // ← when the interaction happened (user-set)
  created_at: string    // kept: audit trail ("record saved at")
  updated_at: string
}
```

---

## Frontend changes

### `activity-item.tsx` — four touch points

#### 1. `timeAgo()` call in static view

```tsx
// Before:
<span className="text-muted-foreground text-xs">
  {timeAgo(activity.created_at)}
</span>

// After:
<span className="text-muted-foreground text-xs">
  {timeAgo(activity.occurred_at)}
</span>
```

#### 2. Backdated indicator in static view

When `occurred_at` is not today, show a subtle calendar hint so the user can see at a glance that the activity was backdated:

```tsx
// Add a helper at the top of the file:
function isToday(dateString: string) {
  const d = new Date(dateString)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() &&
         d.getMonth() === now.getMonth() &&
         d.getDate() === now.getDate()
}

// In the static view header, after the timeAgo span:
{!isToday(activity.occurred_at) && (
  <span className="text-muted-foreground/70 flex items-center gap-0.5 text-xs">
    <CalendarDays className="size-3" />
    {new Date(activity.occurred_at).toLocaleDateString(undefined, {
      month: "short", day: "numeric"
    })}
  </span>
)}
```

Add `CalendarDays` to the lucide import.

#### 3. Inline edit form — add `occurred_at` state and input

Add state alongside the existing `editKind` / `editBody`:

```tsx
const [editOccurredAt, setEditOccurredAt] = useState(
  activity.occurred_at.slice(0, 16)   // "2026-02-24T18:35" (datetime-local format)
)
```

Reset it in `cancelEdit()` and `startEdit()`:

```tsx
function startEdit() {
  setEditKind(activity.kind)
  setEditBody(activity.body)
  setEditOccurredAt(activity.occurred_at.slice(0, 16))
  // ...
}

function cancelEdit() {
  setEditing(false)
  setEditKind(activity.kind)
  setEditBody(activity.body)
  setEditOccurredAt(activity.occurred_at.slice(0, 16))
}
```

Add the date input between the kind picker and the body textarea:

```tsx
<div className="flex items-center gap-2">
  <CalendarDays className="text-muted-foreground size-3 shrink-0" />
  <input
    type="datetime-local"
    value={editOccurredAt}
    onChange={e => setEditOccurredAt(e.target.value)}
    className="text-muted-foreground h-6 rounded border-none bg-transparent text-xs focus:ring-0"
  />
</div>
```

Pass it in `saveEdit()`:

```tsx
router.patch(
  activityPath(activity.id),
  { kind: editKind, body: editBody, occurred_at: editOccurredAt },
  { preserveScroll: true, onSuccess: () => { setEditing(false); setSaving(false) }, onError: () => setSaving(false) }
)
```

#### 4. `ActivityNewItem` — add `occurred_at` to `useForm`

```tsx
const { data, setData, post, processing, errors } = useForm({
  subject_type: subjectType,
  subject_id: subjectId,
  kind: "note" as ActivityKind,
  body: "",
  occurred_at: new Date().toISOString().slice(0, 16),   // ← default to now
})
```

Add the same date input above the body textarea (collapsed/subtle by default). Since the default is "now", the field can start as a small link "Today ▾" that expands inline when clicked:

```tsx
const [showDatePicker, setShowDatePicker] = useState(false)

// In the form, after the kind picker row:
<div className="flex items-center gap-1">
  <button
    type="button"
    className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
    onClick={() => setShowDatePicker(v => !v)}
  >
    <CalendarDays className="size-3" />
    {isToday(data.occurred_at) ? "Today" : formatOccurredAt(data.occurred_at)}
    <ChevronDown className={cn("size-3 transition-transform", showDatePicker && "rotate-180")} />
  </button>
  {showDatePicker && (
    <input
      type="datetime-local"
      value={data.occurred_at}
      onChange={e => setData("occurred_at", e.target.value)}
      className="h-6 rounded border-none bg-transparent text-xs"
    />
  )}
</div>
```

---

### `activity-log.tsx` — `groupByDate()` helper

Change the one line that reads `created_at`:

```ts
// Before:
const d = new Date(activity.created_at)

// After:
const d = new Date(activity.occurred_at)
```

No other changes — the rest of the grouping logic is date-agnostic.

---

### `activities/index.tsx` — `groupByDate()` helper

Same single-line change as above. The page has its own copy of `groupByDate()`:

```ts
// Before:
const d = new Date(activity.created_at)

// After:
const d = new Date(activity.occurred_at)
```

The server already returns activities ordered by `occurred_at: :desc` (via `default_scope`), so grouping and display order are both correct without any further changes.

---

### `activities/new.tsx` (modal form)

Add `occurred_at` to `useForm` and the same "Today ▾" expandable date control as `ActivityNewItem`:

```tsx
const { data, setData, post, processing, errors } = useForm({
  kind: "note" as ActivityKind,
  body: "",
  occurred_at: new Date().toISOString().slice(0, 16),
  ...(subject_type ? { subject_type } : {}),
  ...(subject_id ? { subject_id } : {}),
})
```

Place the date control between the kind picker row and the body textarea. Same collapse/expand pattern for consistency with `ActivityNewItem`.

---

## Shared `formatOccurredAt` helper

Add a small shared helper (either in `activity-item.tsx` or a new `lib/dates.ts`):

```ts
export function formatOccurredAt(dateString: string) {
  const d = new Date(dateString)
  const now = new Date()
  const isThisYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...(isThisYear ? {} : { year: "numeric" }),
  })
}
```

---

## Behaviour summary

| Scenario | Behaviour |
|----------|-----------|
| Log activity now (default) | `occurred_at` defaults to current time; date picker shows "Today" collapsed |
| Expand date picker, change to last Tuesday | Activity appears under "Tuesday" date group on all pages |
| Edit an existing activity | Edit form pre-fills `occurred_at`; saving updates the date |
| Backdated entry in feed | Shows `📅 Feb 20` hint next to the "5 days ago" timestamp |
| Global Activity Log page | Groups and orders by `occurred_at`, not `created_at` |
| Existing activities | `occurred_at` backfilled from `created_at`; no visible change |

---

## Spec coverage

- `Activity` model: `before_validation` sets `occurred_at` when blank
- `Activity` model: `occurred_at` can be set explicitly (overrides default)
- `Activity` default scope orders by `occurred_at: :desc`
- `activities#create` persists a custom `occurred_at`
- `activities#update` can change `occurred_at`
- `as_activity_json` includes `occurred_at`
- Backfill migration: all existing activities have `occurred_at == created_at` after running

---

## Out of scope (future)

- Future-dated activities (e.g., "scheduled call") — requires a separate concept
- Sorting the global activity page by `created_at` (a toggle could be added later)
- Timezone-aware grouping (currently uses browser-local time for grouping, server time for storage)
