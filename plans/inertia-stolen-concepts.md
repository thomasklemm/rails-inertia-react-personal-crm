# Concepts Worth Stealing from Unpoly for Inertia

Research into Unpoly's full feature set surfaced concepts well beyond layers that are
missing from the Inertia ecosystem. Organized by effort-to-value ratio.

---

## Tier 1 — Genuinely Novel, High Impact

### Stale-While-Revalidate Caching

**What Unpoly does**: Every GET response is cached. On link click to a cached URL,
the cached content renders instantly (zero latency). A background revalidation request
fires simultaneously. If the fresh response differs, the page rerenders. If Rails
returns 304 (ETag unchanged), the second rerender is skipped entirely. Users never
see stale data and never wait for a network round-trip.

**What Inertia has**: Nothing. Every navigation waits for the server.

**How to adapt**:
1. Client-side page props cache keyed by URL
2. On `<Link>` click to a cached URL: render from cache immediately, then fire a
   background `router.visit()` with `If-None-Match` / `If-Modified-Since` headers
3. Rails side: `fresh_when` / `stale?` already supports conditional responses —
   return 304 to skip serialization and rerender entirely
4. If fresh props differ from cached: rerender. If same: skip silently.

**Architectural home**: Inertia router wrapper or fork. Could be a standalone
`usePageCache()` hook that wraps `router.visit()`.

**Dependency**: The `meta.revalidating` flag (see Tier 3) is needed to prevent double
analytics/initialization side effects during the second render pass.

**Effort**: 2–3 weeks. Transforms perceived navigation performance more than any
other single change.

---

### Previews — Optimistic UI with Guaranteed Revert

**What Unpoly does**: A preview function registers DOM mutations that are
*automatically reverted* when the request ends — regardless of outcome (success,
error, abort, timeout). The revert is guaranteed by the framework; the developer
cannot forget it.

```js
// Unpoly
up.preview('optimistic-add', function(preview) {
  preview.insert('#list', '<li>New item (saving...)</li>')
  // framework auto-removes this when request ends
})
```

**What React/Inertia has**: Optimistic UI via local state, but revert on error must
be implemented manually. Forgetting to revert on an edge case (abort, timeout) is a
common bug.

**The key insight**: It is not the optimistic update that is novel — React can do
that. It is the *contract*: register once, guaranteed cleanup regardless of path.

**How to adapt** — a React hook:

```tsx
function usePreview<T>(
  trigger: 'submit' | 'change',
  mutate: (params: T) => () => void  // must return cleanup
) { ... }
```

`mutate` receives the form params (like `preview.params` in Unpoly), applies
optimistic state changes, and returns a cleanup function. The hook ensures cleanup
is called on any router event that ends the request.

**Additional concept — template cloning**: Unpoly lets the server embed an HTML
template in the page (`<script type="text/html" id="item-tpl">`) that client-side
previews clone to insert new items optimistically. This keeps HTML authorship on the
server without duplicating markup in JavaScript strings. In a React app this is
less relevant since JSX is the template, but worth noting for hybrid approaches.

**Effort**: 1 week for the hook + revert contract. Genuinely novel in the React
ecosystem.

---

### Hungry Components — Passive Subscriptions to Shared Props

**What Unpoly does**: Any element tagged `[up-hungry]` is automatically updated
whenever *any* server response happens to include a matching element — regardless of
which request triggered it. No explicit reload required. A notification badge marked
hungry updates as a side effect of submitting a form, navigating to a new page, or
anything else that hits the server.

**What Inertia has**: `inertia_share` sends certain data with every response (auth,
flash). Components read it via `usePage().props`. But there is no way to register a
component as a subscriber to a specific shared prop key — you just read whatever is
in props.

**How to adapt**: Extend the shared props convention so components can declare
interest in specific keys, and when those keys change between responses, those
components re-render even if the rest of the page didn't change.

```tsx
// Conceptual
const { unreadCount } = useHungryProp('notifications')
// re-renders whenever `notifications` changes in any Inertia response
```

Server side: always include hungry data in `inertia_share`:

```ruby
inertia_share do
  {
    notifications: { unread_count: current_user.notifications.unread.count }
  }
end
```

The client-side machinery: compare hungry prop values after every router `success`
event; force-rerender subscribers whose keys changed.

**Harder edge**: What if the hungry data is expensive to compute on every request?
Unpoly solves this by including the hungry element HTML only in responses where it
changed (the server opts in). In Inertia, `InertiaRails::AlwaysInclude` vs lazy
evaluation of shared props handles this — compute the value lazily so it only runs
when accessed.

**Effort**: 2 weeks. Architecturally novel — nothing like it exists in the SPA
ecosystem. Flash messages, notification counts, cart badges, unread indicators all
become zero-maintenance.

---

## Tier 2 — Missing From Ecosystem, Easy to Add

### `<NavLink>` with URL Pattern Matching

**What Unpoly does**: Any link inside `[up-nav]` automatically receives
`.up-current` when its `href` matches the current URL. `[up-alias]` adds additional
URL patterns that should also trigger active state (e.g., `/users` stays highlighted
on `/users/123`).

**What Inertia has**: Nothing built-in. Every app hand-codes
`usePage().url === href` checks. Pattern matching (`/users/*`) is always custom.

**How to adapt** — a `<NavLink>` component:

```tsx
<NavLink href={usersPath()} alias="/users/*">
  Users
</NavLink>
```

- Checks `usePage().url` against `href` (exact) and `alias` (glob/prefix pattern)
- Applies an `aria-current="page"` attribute and an `isActive` CSS class
- Optional `activeClassName` / `inactiveClassName` props for flexibility

This is a one-day addition, zero architecture changes, useful in every Inertia app
immediately. Surprising that it does not exist as an official component.

**Effort**: 1 day.

---

### `useServerValidation` — Server Round-Trip on Blur

**What Unpoly does**: `[up-validate]` triggers a server round-trip when a field
changes, sending current form data and receiving back validated HTML with inline
error messages. Essential for validations that require database lookups (uniqueness,
foreign key existence, real-time availability).

**What Inertia has**: Nothing. Each app implements debounced partial reloads
manually per form.

**How to adapt**:

```tsx
const { errors } = useServerValidation(form, {
  fields: ['email', 'username'],  // which fields trigger validation
  url: registrationPath(),
  debounce: 300,
})
```

On field blur (or debounced change), fires `router.post(url, form.data(), { only: ['errors'] })`.
Merges returned errors into the form's error state.

Rails side requires no changes — the existing controller renders validation errors in
the Inertia response. The hook consumes `only: ['errors']` partial reload, so no
other props are updated.

**Effort**: 2 days.

---

### `useScrollToFirstError` — Auto-Scroll on Failed Submission

**What Unpoly does**: `[up-fail-scroll=".errors"]` automatically scrolls to a
specified element when a failed response is rendered.

**What Inertia has**: Nothing. The pattern is implemented manually in every app with
a `useEffect` watching `errors`.

**How to adapt**:

```tsx
// Drop into any form component
useScrollToFirstError(form.errors)
```

Watches `errors` object; when it becomes non-empty (after a failed submit), scrolls
to the first element whose `name` attribute matches an error key. Falls back to a
`.form-errors` container if no specific field is found.

Standard implementation:

```tsx
function useScrollToFirstError(errors: Record<string, string>) {
  useEffect(() => {
    const firstKey = Object.keys(errors)[0]
    if (!firstKey) return
    const el = document.querySelector(`[name="${firstKey}"]`)
      ?? document.querySelector('[data-error-container]')
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [errors])
}
```

**Effort**: 1 hour. Convention-establishing — worth adding to the shared form
utilities so every form gets it for free.

---

### Per-Fragment Loading States

**What Unpoly does**: Adds `.up-loading` to the specific fragment being replaced
while its request is in-flight. Adds `.up-active` to the element that triggered the
navigation (link, button). Users see the exact section that is updating, not a
global spinner.

**What Inertia has**: A global NProgress bar. No per-section loading state.

**How to adapt** — a `usePartialLoading(key)` hook:

```tsx
const isLoading = usePartialLoading('activities')

<div className={isLoading ? 'opacity-50' : ''}>
  {activities.map(...)}
</div>
```

Tracks which `only: [...]` keys are currently in-flight by hooking into
`router.on('start', ...)` and `router.on('finish', ...)`, extracting the `only`
array from the visit options.

Also useful: a `useNavigating()` boolean for the triggering element:

```tsx
const [pending, startTransition] = useNavigating()

<button onClick={() => startTransition(() => router.visit(url))} disabled={pending}>
  {pending ? 'Loading...' : 'View Details'}
</button>
```

**Effort**: 2 days for both hooks.

---

## Tier 3 — Useful Refinements

### `[up-instant]` — Mousedown Navigation

**What Unpoly does**: `[up-instant]` fires the navigation request on `mousedown`
rather than `click`, saving the ~100–150ms between mousedown and mouseup. Free
perceived latency improvement for any link.

**How to adapt**: Add a `preloadOn="hover" | "mousedown"` prop to the Inertia
`<Link>` (or `<NavLink>`) component. On `mousedown`, call `router.visit(href, {
replace: false })` silently to warm the server. On `click`, if the response is
already in-flight, it completes faster.

**Effort**: Half a day as a Link prop.

---

### `up:fragment:loaded` — Pre-Render Hook

**What Unpoly does**: Fires after the server responds but *before* the DOM changes.
Allows inspecting response headers, aborting the render, or mutating render options.

**What Inertia has**: `router.on('success', ...)` fires *after* React rerenders.
There is no hook between response arrival and rerender.

**How to adapt**: A `router.on('before-render', (page, event) => ...)` hook that
fires after Inertia receives the Inertia JSON response but before calling
`swapComponent`. Requires a core fork or a monkey-patch of the router's response
handling.

Use cases:
- Skip rerender if a specific prop hasn't changed
- Redirect to a different component based on response headers
- Abort a navigation based on server-provided metadata

**Effort**: 1 day (fork), ½ day (monkey-patch). Medium priority.

---

### `meta.revalidating` — Double-Render Guard

**What Unpoly does**: During stale-while-revalidate, the page renders twice — once
from cache, once from fresh server data. A `meta.revalidating` flag on the second
render pass lets code skip side effects (analytics events, widget initialization)
that should only fire once per logical navigation.

**What Inertia has**: Nothing. Only relevant once stale-while-revalidate caching is
implemented.

**How to adapt**: Add `revalidating: boolean` to the Inertia page object during
background revalidation passes. Components check `usePage().meta?.revalidating`
before firing side effects:

```tsx
const { meta } = usePage()
useEffect(() => {
  if (meta?.revalidating) return
  analytics.track('page_view', { url: window.location.href })
}, [url])
```

**Effort**: ½ day, but only meaningful alongside the caching work.

---

### `X-Up-Target` Response Header — Server-Driven Partial Update

**What Unpoly does**: The server can respond with `X-Up-Target: .different-selector`
to override which fragment the client updates. Useful when the server detects at
runtime that something other than what was requested needs updating.

**How to adapt for Inertia**: An `X-Inertia-Only` response header that overrides the
client's `only` list:

```ruby
# Controller detects that the activities section also changed
response.set_header('X-Inertia-Only', ['contact', 'activities'].to_json)
```

The client reads this header and uses it instead of whatever `only` was sent in the
request. Additive with the existing partial reload mechanism — zero client changes if
the header is absent.

**Effort**: 1 day (Rails middleware + client response parser).

---

## Priority Order

| Concept | Effort | Value | Ship order |
|---|---|---|---|
| `<NavLink>` with pattern matching | 1 day | High | 1 |
| `useScrollToFirstError` | 1 hour | Medium | 1 |
| `useServerValidation` | 2 days | High | 2 |
| Per-fragment loading states | 2 days | Medium | 2 |
| `[up-instant]` mousedown nav | ½ day | Medium | 3 |
| Optimistic preview revert contract | 1 week | Very High | 4 |
| `up:fragment:loaded` pre-render hook | 1 day | Medium | 4 |
| `meta.revalidating` flag | ½ day | Low (blocked) | with caching |
| `X-Inertia-Only` server header | 1 day | Medium | 5 |
| Stale-while-revalidate caching | 2–3 weeks | Very High | 5 |
| Hungry components | 2 weeks | Very High | 6 |

Items 1–2 are standalone utilities with no dependencies. Ship immediately.
Items 3–4 add polish to the form and navigation story.
Items 5–6 are deeper architectural additions — layer them in after the basics are solid.
