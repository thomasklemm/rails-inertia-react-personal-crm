# Plan 6: Command Palette (Global Search)

A `⌘K` / `Ctrl+K` command palette that searches contacts, companies, and activities simultaneously from any page. Zero navigation required — type a name and press Enter.

---

## Problem

Search is siloed: the contacts sidebar searches only contacts, the companies list searches only companies, and the activity search lives on a separate page. There is no keyboard-driven way to jump to any record from anywhere in the app in one action.

---

## Goal

- `⌘K` (macOS) / `Ctrl+K` (Windows/Linux) opens a modal command palette from any authenticated page
- Results are grouped: Contacts · Companies · Activities
- Keyboard navigation (arrows, Enter, Escape) handled natively by the `cmdk` library
- Selecting a result navigates to the record's page via Inertia
- The palette is mounted once in `AppLayout` — zero per-page wiring needed

---

## Backend

### New controller (`app/controllers/search_controller.rb`)

JSON-only — not an Inertia controller. Inherits from `ApplicationController` so authentication is enforced automatically via the existing `before_action :authenticate`.

```ruby
class SearchController < ApplicationController
  def index
    q = params[:q].to_s.strip
    return render json: { results: [] } if q.length < 2

    render json: {
      results: [
        { group: "Contacts",   items: search_contacts(q)   },
        { group: "Companies",  items: search_companies(q)  },
        { group: "Activities", items: search_activities(q) },
      ].reject { |g| g[:items].empty? }
    }
  end

  private

  def search_contacts(q)
    Current.user.contacts.active.search(q).limit(5).includes(:company).map do |c|
      {
        id:       c.id,
        type:     "contact",
        title:    c.full_name,
        subtitle: c.company&.name,
        url:      contact_path(c)
      }
    end
  end

  def search_companies(q)
    Current.user.companies.search(q).limit(5).map do |co|
      contacts_count = co.respond_to?(:contacts_count) ? co.contacts_count : co.contacts.size
      {
        id:       co.id,
        type:     "company",
        title:    co.name,
        subtitle: "#{contacts_count} #{"contact".pluralize(contacts_count)}",
        url:      company_path(co)
      }
    end
  end

  def search_activities(q)
    Current.user.activities
      .where("body LIKE ?", "%#{q}%")
      .includes(:subject)
      .limit(5)
      .map do |a|
        subject_url = a.subject_type == "Contact" ?
          contact_path(a.subject_id) : company_path(a.subject_id)
        {
          id:       a.id,
          type:     "activity",
          kind:     a.kind,
          title:    a.body.truncate(80),
          subtitle: a.subject&.then { |s| s.respond_to?(:full_name) ? s.full_name : s.name },
          url:      subject_url
        }
      end
  end
end
```

**Notes:**
- Reuses the existing `Contact.search` and `Company.search` scopes — no new DB queries.
- Activity search is a simple `body LIKE` — sufficient for v1.
- `search_activities` links to the subject's page (contact or company), not the activity page, because that's where context lives.

### Route (`config/routes.rb`)

```ruby
get "search", to: "search#index", as: :search
```

Add before the `root` declaration. Regenerate js-routes:

```bash
bin/rails js:routes:typescript
```

This gives a typed `searchPath()` helper for the fetch URL.

---

## Shadcn `Command` component

The palette uses shadcn's `Command` component (built on `cmdk`). Install it:

```bash
npx shadcn@latest add command
```

This creates `app/frontend/components/ui/command.tsx`. The components used are:

```tsx
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
```

`CommandDialog` renders as a `<Dialog>` portal, so it floats above all content with no z-index issues.

---

## TypeScript types (`app/frontend/types/index.ts`)

```ts
export interface SearchResultItem {
  id: number
  type: "contact" | "company" | "activity"
  kind?: string          // only present for activities (note | call | email)
  title: string
  subtitle?: string | null
  url: string
}

export interface SearchResultGroup {
  group: string
  items: SearchResultItem[]
}

export interface SearchResponse {
  results: SearchResultGroup[]
}
```

---

## `CommandPalette` component (`app/frontend/components/command-palette.tsx`)

```tsx
import { router } from "@inertiajs/react"
import { Building2, Mail, MessageSquare, Phone, Search, User } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command"
import { searchPath } from "@/routes"
import type { SearchResponse, SearchResultItem } from "@/types"

const TYPE_ICONS = {
  contact:  User,
  company:  Building2,
  note:     MessageSquare,
  call:     Phone,
  email:    Mail,
}

function getIcon(item: SearchResultItem) {
  if (item.type === "activity" && item.kind) return TYPE_ICONS[item.kind as keyof typeof TYPE_ICONS] ?? MessageSquare
  return TYPE_ICONS[item.type]
}
```

### State

```tsx
const [open, setOpen]       = useState(false)
const [query, setQuery]     = useState("")
const [results, setResults] = useState<SearchResponse["results"]>([])
const [loading, setLoading] = useState(false)
const debounceRef           = useRef<ReturnType<typeof setTimeout> | null>(null)
```

### Keyboard shortcut

```tsx
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      setOpen(o => !o)
    }
  }
  document.addEventListener("keydown", handleKeyDown)
  return () => document.removeEventListener("keydown", handleKeyDown)
}, [])
```

### Close on Inertia navigation

```tsx
useEffect(() => {
  // @inertiajs/react fires a custom event on each finished navigation
  const handleFinish = () => setOpen(false)
  document.addEventListener("inertia:finish", handleFinish)
  return () => document.removeEventListener("inertia:finish", handleFinish)
}, [])
```

### Debounced fetch

```tsx
useEffect(() => {
  if (query.length < 2) {
    setResults([])
    return
  }
  if (debounceRef.current) clearTimeout(debounceRef.current)
  debounceRef.current = setTimeout(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${searchPath()}?q=${encodeURIComponent(query)}`, {
        headers: { Accept: "application/json" }
      })
      const data: SearchResponse = await res.json()
      setResults(data.results)
    } finally {
      setLoading(false)
    }
  }, 200)
}, [query])
```

### Navigation handler

```tsx
const handleSelect = useCallback((item: SearchResultItem) => {
  router.visit(item.url)
  setOpen(false)
  setQuery("")
}, [])
```

### Render

```tsx
return (
  <CommandDialog open={open} onOpenChange={setOpen}>
    <CommandInput
      placeholder="Search contacts, companies, activities…"
      value={query}
      onValueChange={setQuery}
    />
    <CommandList>
      {query.length < 2 ? (
        <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
      ) : loading ? (
        <CommandEmpty>Searching…</CommandEmpty>
      ) : results.length === 0 ? (
        <CommandEmpty>No results found.</CommandEmpty>
      ) : (
        results.map((group, i) => (
          <div key={group.group}>
            {i > 0 && <CommandSeparator />}
            <CommandGroup heading={group.group}>
              {group.items.map(item => {
                const Icon = getIcon(item)
                return (
                  <CommandItem
                    key={`${item.type}-${item.id}`}
                    value={`${item.type}-${item.id}-${item.title}`}
                    onSelect={() => handleSelect(item)}
                    className="flex items-center gap-3"
                  >
                    <div className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-md">
                      <Icon className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-muted-foreground truncate text-xs">{item.subtitle}</p>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </div>
        ))
      )}
    </CommandList>
  </CommandDialog>
)
```

---

## Mount in `app-layout.tsx`

`AppLayout` wraps every authenticated page. Add `CommandPalette` here — it renders a portal and has zero visual impact when closed:

```tsx
import { CommandPalette } from "@/components/command-palette"

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
      <CommandPalette />
      {children}
    </AppLayoutTemplate>
  )
}
```

No per-page changes needed.

---

## Sidebar trigger (`app/frontend/components/app-sidebar.tsx`)

Add a search trigger button in the sidebar header below the logo, so mouse users have a visible entry point:

```tsx
import { Search } from "lucide-react"

// Inside AppSidebar, after the logo SidebarMenuItem:
<SidebarMenuItem>
  <SidebarMenuButton
    onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))}
    className="text-muted-foreground"
  >
    <Search className="size-4" />
    <span>Search</span>
    <kbd className="ml-auto hidden text-xs opacity-60 group-data-[collapsible=icon]:hidden sm:inline-flex">
      ⌘K
    </kbd>
  </SidebarMenuButton>
</SidebarMenuItem>
```

Alternatively, export an `openCommandPalette` function from `command-palette.tsx` via a module-level ref or a React context. The `dispatchEvent` approach is simpler for v1 and avoids cross-component coupling.

---

## UX details

| Scenario | Behaviour |
|----------|-----------|
| `⌘K` from any page | Opens palette, `CommandInput` auto-focused |
| Type 1 character | "Type at least 2 characters" message |
| Type ≥ 2 characters | 200 ms debounce, then fetch; grouped results appear |
| No matches | "No results found." |
| Results loading | "Searching…" placeholder |
| Arrow keys | `cmdk` handles natively — full keyboard nav |
| Enter / click item | `router.visit(item.url)` then palette closes |
| Escape | Palette closes; Inertia focus management handles return focus |
| Navigate to a page | `inertia:finish` event closes palette automatically |
| Sidebar collapsed | `⌘K` shortcut still works; search button icon-only |
| Archived contacts | Excluded (`contacts.active` scope) |

---

## Spec coverage

- `search#index` with `q=` (< 2 chars) returns `{ results: [] }`
- `search#index` with `q=smith` returns grouped results
- `search#index` contacts section uses the `active` scope (excludes archived)
- `search#index` results are capped at 5 per group
- `search#index` requires authentication (redirects unauthenticated requests)
- Each result item includes `id`, `type`, `title`, `subtitle`, `url`
- Activity results link to the subject's page, not the activity's own page

---

## Out of scope (future)

- Keyboard shortcuts to jump to actions ("New Contact", "Log Activity")
- Recent/pinned items shown when palette opens with an empty query
- Fuzzy matching (currently `LIKE %q%` exact substring)
- Highlighting the matched substring in results
- Multi-word search across activities (current plan splits on spaces for the activity log page but not for the palette endpoint — consistent behaviour is a second pass)
