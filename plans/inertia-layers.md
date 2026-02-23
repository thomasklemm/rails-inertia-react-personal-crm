# Inertia Layers — Implementation Plan

Adds an Unpoly-style layer stack to Inertia.js. Each layer is an isolated navigation
context — its own router instance, its own page state, its own request stream — rendered
as a modal, drawer, or fullscreen overlay on top of the root page. Navigation within a
layer stays within that layer. Forms in a layer use the Inertia router normally. Layers
can return values to their parent. The server can open, close, or accept layers via
response headers.

## Try the No-Fork Path First

Before committing to forking `@inertiajs/core`, attempt a standalone package approach.
The research shows `@inertiaui/modal-react` already spins up a second Inertia app
instance per modal — the infrastructure for per-layer rendering already exists. The
only gap is that `Link` and `useForm` inside those modals use the global router.

**What a no-fork standalone package can achieve:**

- `LayerLink` — wraps Inertia's `Link`, checks `LayerContext` and uses the layer router
- `useLayerForm` — wraps `useForm`, same pattern
- `openLayer(url, options)` — creates a layer router instance, renders page in an overlay
- Rails gem with `X-Inertia-Layer` / `X-Inertia-Layer-Action` headers

**What it cannot achieve without the fork:**

- Making the built-in `<Link>` automatically scope to the layer router (users must use
  `<LayerLink>` inside layers instead)
- Making `router.visit()` called imperatively scope to the layer (users must call
  `layer.router.visit()` or use the hook)

**Verdict:** Build the standalone package first. Ship it. If the `<Link>` / `router`
ergonomics are painful in practice, do the fork then — you will have real usage data
and a known API surface to target.

---

## Repositories to Fork (if fork path is chosen)

| Fork | Upstream | Purpose |
|---|---|---|
| `your-org/inertia` | `inertiajs/inertia` | Core + React adapter changes |
| `your-org/inertia-rails` | `inertiajs/inertia-rails` | Rails middleware + controller helpers |

Publish forked packages under scoped names during development:
- `@your-org/inertia-core` (from `packages/core`)
- `@your-org/inertia-react` (from `packages/react`)
- `@your-org/inertia-rails` (gem)

---

## Architecture Decisions (Settled Upfront)

### Decision 1 — Multiple Router instances, not a layer-aware singleton

Each layer gets its own `new Router()` instance. The alternative (one router that routes
operations by `layerId`) was rejected because it would require touching every internal
method and makes the call graph much harder to follow.

**Consequence**: The `Router` class must be exported from `@inertiajs/core` in addition
to the existing singleton `router` export. The singleton remains for the root layer.

### Decision 2 — No per-layer browser history in the MVP

Browser history (the `popstate` / `history.pushState` machinery) remains owned by the
root layer only. Inside a non-root layer:
- Navigation updates the layer's internal URL state but does NOT call `history.pushState`
- The browser back button closes the top layer (not navigates within it)

Full per-layer history (option 2 from the research) is explicitly out of scope for the
MVP. A `FUTURE.md` note should be left in the repo.

**Consequence**: The `history.ts` module in core is not forked; layer Router instances
pass `replace: true` and skip `pushState`.

### Decision 3 — LayerContext provides the scoped router in React

`Link`, `useForm`, and `router` re-export all check for a `LayerContext` first, falling
back to the global singleton. No breaking changes to existing code — pages outside a
layer work identically to today.

### Decision 4 — Return values via Promise

`openLayer(url, options)` returns a `Promise<unknown>`. `layer.accept(value)` resolves
it; `layer.dismiss()` resolves with `undefined`. This is pure userland — no changes to
core Inertia needed.

### Decision 5 — Rails: request headers + response headers

Inspired directly by Unpoly's `X-Up-Context` header. Two request headers, three
response headers:

```
# Request (sent by every layer visit)
X-Inertia-Layer: <layerId>         # UUID, absent for root layer
X-Inertia-Layer-Context: <json>    # per-layer key/value store (see Decision 6)

# Response (any combination, server sets to control layer lifecycle)
X-Inertia-Layer-Action: open       # open this response in a new layer
X-Inertia-Layer-Action: close      # close current layer (redirect after form)
X-Inertia-Layer-Accept: <json>     # close + resolve Promise with JSON value
```

No new Inertia protocol version bump — these are additive headers.

### Decision 6 — Per-layer context store (inspired by Unpoly X-Up-Context)

Each layer carries a mutable key/value context object that travels as a request header
(`X-Inertia-Layer-Context`). The server can read it to tailor responses — e.g., render
a compact layout in modal context, or know the "source" of the layer open. The server
can also update the context by sending `X-Inertia-Layer-Context` back in the response,
which is merged into the layer's context store client-side.

```tsx
// Client — set context when opening
openLayer('/contacts/pick', {
  mode: 'modal',
  context: { source: 'deal-form', compact: true }
})

// Server — reads context
inertia_layer_context[:compact]  # => true
inertia_layer_context[:source]   # => "deal-form"

// Server — updates context in response
inertia_update_layer_context(step: 2)
```

This is the single most powerful concept from Unpoly that has no equivalent anywhere
else. Include it in the MVP — it requires only adding a header send/receive, no
architectural changes.

### Decision 7 — Base route / direct visit fallback (inspired by momentum-modal)

Any route opened as a layer should declare a `base_route` — the URL to redirect to
when the layer URL is accessed directly (hard refresh, shared link, no background page).

```ruby
# Controller declares its base route when serving as a layer
before_action :set_layer_base_route

def pick
  render inertia: "contacts/pick", props: { contacts: @contacts }
end

private

def set_layer_base_route
  # When accessed directly, redirect to contacts index
  inertia_layer_base_route contacts_path if !inertia_layer?
end
```

Or as a Rails concern that reads a class-level declaration:

```ruby
class ContactsController < InertiaController
  layer_base_route :index  # non-layer visits to modal actions redirect here
end
```

---

## Codebase Map (Inertia monorepo, `packages/`)

```
packages/
  core/src/
    router.ts          ← PRIMARY CHANGE: export class + layer-aware request headers
    page.ts            ← singleton page state; layers each own their own instance
    history.ts         ← root layer only; layer routers skip pushState
    eventHandler.ts    ← popstate must close top layer, not navigate within it
    request.ts         ← inject X-Inertia-Layer header from Router context
    response.ts        ← parse X-Inertia-Layer-Action response header
    config.ts          ← no change
    prefetched.ts      ← no change (prefetch is root-layer only in MVP)
    index.ts           ← add Router class export alongside router singleton

  react/src/
    app.tsx            ← PRIMARY CHANGE: manage layer stack, render LayerStack
    link.tsx           ← consume LayerContext router if inside a layer
    useForm.ts         ← consume LayerContext router if inside a layer
    usePage.ts         ← consume LayerContext page if inside a layer
    index.tsx          ← export new layer API surface

  NEW files in react/src/
    layerContext.tsx        ← React context: { router, layerId, page }
    layerStack.tsx         ← renders all active layers (modal/drawer/fullscreen)
    layerContainer.tsx     ← single layer wrapper: backdrop, focus trap, animation
    useLayer.ts            ← access current layer: accept(), dismiss(), mode, layerId
    openLayer.ts           ← openLayer(url, options) → Promise<unknown>
```

---

## Phase 0 — Repository Setup (1 day)

**Owner: any agent**

1. Fork `inertiajs/inertia` and `inertiajs/inertia-rails` into `your-org`.
2. In the monorepo, add a `layers` package.json workspace entry for the new React files
   (they live inside `packages/react` — no new package needed, just new files).
3. Set up changesets or a local `npm link` workflow so the app can consume the forked
   packages while iterating.
4. Add a `LAYERS_PLAN.md` stub at the monorepo root pointing to this document.
5. Confirm the existing test suite passes on the fork before touching any code:
   ```bash
   pnpm install && pnpm test
   ```

---

## Phase 1 — Core: Export Router Class + Layer Headers (4–5 days)

**Owner: Agent A (core specialist)**
**Files**: `packages/core/src/`

### 1.1 Export the Router class

In `router.ts`, the class is currently defined and immediately instantiated as a
module-level singleton. Change the export so both are available:

```ts
// Before (bottom of router.ts)
export const router = new Router()

// After
export { Router }           // named class export (new)
export const router = new Router()  // singleton unchanged
```

Verify nothing in the existing codebase breaks — all existing consumers import `router`
(the instance), not `Router` (the class).

### 1.2 Add layerId to Router instances

Add an optional `layerId` constructor parameter to `Router`:

```ts
class Router {
  private layerId: string | null

  constructor(layerId: string | null = null) {
    this.layerId = layerId
  }
  // ...
}
```

### 1.3 Inject X-Inertia-Layer + X-Inertia-Layer-Context request headers

In `request.ts`, the `Request` class builds the Axios config. The `Router` instance
must be threaded through so the request knows its layer ID and context.

Current call path: `Router.visit()` → creates `new Request(...)` → `request.send()`.

Change: pass `layerId` and `layerContext` into `Request` constructor:

```ts
// In request.ts, inside send():
if (this.layerId) {
  headers['X-Inertia-Layer'] = this.layerId
  headers['X-Inertia-Layer-Context'] = JSON.stringify(this.layerContext ?? {})
}
```

Also parse `X-Inertia-Layer-Context` from responses and merge into the layer's context
store (the server can update context mid-lifecycle).

### 1.4 Parse X-Inertia-Layer-Action response header

In `response.ts`, after a successful response, check for the layer action header before
the normal `swapComponent` / redirect logic:

```ts
const layerAction = response.headers['x-inertia-layer-action']
const layerAccept = response.headers['x-inertia-layer-accept']

if (layerAction === 'close' || layerAction === 'accept') {
  // Emit an internal event that the React layer stack can listen to
  fireInternalEvent('inertia:layer-close', {
    layerId: this.layerId,
    acceptValue: layerAccept ? JSON.parse(layerAccept) : undefined,
  })
  return  // do not swap component
}

if (layerAction === 'open') {
  // Emit event to open the response component in a new layer
  fireInternalEvent('inertia:layer-open', {
    component: pageResponse.component,
    props: pageResponse.props,
    url: pageResponse.url,
  })
  return
}
// ... normal swap logic
```

Use Inertia's existing internal event bus (`fireInternalEvent` / `eventHandler`) — no
new global machinery needed.

### 1.5 Patch popstate handler for layer-aware back navigation

In `eventHandler.ts`, the `popstate` handler currently always navigates the root page.
Add a check: if there are active layers, fire `inertia:layer-pop` instead of
navigating:

```ts
window.addEventListener('popstate', (event) => {
  if (hasActiveLayers()) {   // read from a tiny exported atom (see 1.6)
    fireInternalEvent('inertia:layer-pop')
    return
  }
  // ... existing popstate logic
})
```

**SvelteKit insight**: SvelteKit's shallow routing pushes a real `history.pushState`
entry with a special state marker when opening a modal. The `popstate` handler checks
for this marker and dismisses the modal rather than navigating. Apply the same trick:
when a layer opens, push a sentinel history entry (`history.pushState({ __inertiaLayer:
layerId }, '')`). When `popstate` fires with this sentinel, dismiss that layer. This is
cleaner than relying on the `hasActiveLayers()` count and correctly handles multiple
layers in the stack (each open pushes one entry, each back dismisses one).

### 1.6 Active layer count atom

Add a minimal module `packages/core/src/layerCount.ts`:

```ts
let count = 0
export const incrementLayerCount = () => count++
export const decrementLayerCount = () => count--
export const hasActiveLayers = () => count > 0
```

The React layer stack calls these when layers open/close. The core `eventHandler` reads
it. This keeps the dependency direction correct (core does not import React).

### 1.7 Update `packages/core/src/index.ts`

Add exports:
```ts
export { Router }
export { incrementLayerCount, decrementLayerCount, hasActiveLayers } from './layerCount'
```

### Tests for Phase 1

- Unit test: `new Router('layer-123')` sends `X-Inertia-Layer: layer-123` header
- Unit test: `new Router()` (root) sends no `X-Inertia-Layer` header
- Unit test: response with `X-Inertia-Layer-Action: close` fires `inertia:layer-close`
  event and does NOT call `swapComponent`
- Unit test: `hasActiveLayers()` returns false initially; true after increment

---

## Phase 2 — React: LayerContext + Updated Link/useForm (4–5 days)

**Owner: Agent B (React specialist)**
**Depends on: Phase 1 complete (Router class export needed)**
**Files**: `packages/react/src/`

### 2.1 Create `layerContext.tsx`

```tsx
import { createContext, useContext } from 'react'
import type { Router, Page } from '@inertiajs/core'

export interface LayerContextValue {
  layerId: string
  router: Router
  page: Page
  mode: 'modal' | 'drawer' | 'fullscreen'
  context: Record<string, unknown>           // per-layer context store (Unpoly X-Up-Context)
  updateContext: (patch: Record<string, unknown>) => void
  accept: (value?: unknown) => void
  dismiss: () => void
}

export const LayerContext = createContext<LayerContextValue | null>(null)

export function useLayerContext(): LayerContextValue | null {
  return useContext(LayerContext)
}
```

### 2.2 Update `link.tsx`

```tsx
// Before
import { router } from '@inertiajs/core'

// After
import { router as globalRouter } from '@inertiajs/core'
import { useLayerContext } from './layerContext'

// Inside Link component:
const layer = useLayerContext()
const router = layer?.router ?? globalRouter
```

Apply the same pattern to the `router.visit()` call triggered by clicks.

### 2.3 Update `useForm.ts`

Same pattern — check `useLayerContext()` first:

```ts
const layer = useLayerContext()
const activeRouter = layer?.router ?? router
// use activeRouter.visit() instead of router.visit()
```

### 2.4 Update `usePage.ts`

```ts
export function usePage<T extends Record<string, unknown>>(): Page<T> {
  const layer = useLayerContext()
  if (layer) return layer.page as Page<T>
  return useContext(PageContext) as Page<T>
}
```

### 2.5 Update `app.tsx` — manage layer stack

The `App` component currently holds:
```ts
const [current, setCurrent] = useState<{ component, page }>()
```

Change to hold a root layer state plus a separate layer stack:

```tsx
// Root page state (unchanged from today's architecture)
const [rootCurrent, setRootCurrent] = useState<{ component, page }>()

// Layer stack (new)
const [layers, setLayers] = useState<LayerEntry[]>([])
```

`LayerEntry`:
```ts
interface LayerEntry {
  layerId: string
  router: Router
  component: Component
  page: Page
  mode: 'modal' | 'drawer' | 'fullscreen'
  context: Record<string, unknown>    // per-layer context store, sent with every request
  resolve: (value?: unknown) => void  // for accept/dismiss
}
```

The root `router.init()` `swapComponent` callback updates `rootCurrent` as before.

Add an `openLayer` function (exposed via context/export) that:
1. Creates `new Router(layerId)`
2. Calls `layerRouter.init({ page, swapComponent: ... })` where swapComponent updates
   the matching `LayerEntry` in `layers` state
3. Pushes the new `LayerEntry` onto `layers`
4. Returns a Promise that resolves when `resolve()` is called

Add event listeners (in a `useEffect`) for `inertia:layer-close` and
`inertia:layer-pop` internal events — these call `dismiss()` on the top layer.

Render:
```tsx
return (
  <>
    <PageContext.Provider value={rootCurrent.page}>
      <HeadContext.Provider value={headManager}>
        <rootCurrent.component {...rootCurrent.page.props} />
      </HeadContext.Provider>
    </PageContext.Provider>
    <LayerStack layers={layers} onClose={handleLayerClose} />
  </>
)
```

### 2.6 Create `layerStack.tsx`

Renders each layer in order (z-index increases with index). Each layer wrapped in
`LayerContext.Provider` with its own `{ layerId, router, page, mode, accept, dismiss }`.

```tsx
export function LayerStack({ layers, onClose }) {
  return (
    <>
      {layers.map((layer, i) => (
        <LayerContext.Provider key={layer.layerId} value={layerContextFor(layer, onClose)}>
          <LayerContainer mode={layer.mode} zIndex={1000 + i * 10}>
            <layer.component {...layer.page.props} />
          </LayerContainer>
        </LayerContext.Provider>
      ))}
    </>
  )
}
```

### 2.7 Create `layerContainer.tsx`

Visual wrapper — no business logic. Handles:
- Backdrop (only on bottom-most layer or all layers — configurable)
- Focus trap (use `focus-trap-react` or a small hook)
- Scroll lock on `<body>`
- Slide/fade animation (CSS transitions, no external library)
- `mode` determines layout: centered dialog (modal), edge-anchored panel (drawer),
  full viewport (fullscreen)
- Clicking backdrop calls `dismiss()`
- Escape key calls `dismiss()`

### 2.8 Create `useLayer.ts`

```ts
export function useLayer(): LayerContextValue {
  const ctx = useLayerContext()
  if (!ctx) throw new Error('useLayer() called outside of a layer')
  return ctx
}
```

### 2.9 Create `openLayer.ts`

Module-level function called from outside React (e.g., in event handlers):

```ts
// Internal ref set by App component on mount
let _openLayer: ((url: string, options: OpenLayerOptions) => Promise<unknown>) | null = null

export function setOpenLayerFn(fn: typeof _openLayer) { _openLayer = fn }

export function openLayer(url: string, options: OpenLayerOptions = {}): Promise<unknown> {
  if (!_openLayer) throw new Error('Inertia app not mounted')
  return _openLayer(url, options)
}
```

`App` calls `setOpenLayerFn(...)` on mount. This keeps the API ergonomic without
requiring hooks at the call site.

### 2.10 Update `packages/react/src/index.tsx`

Add exports:
```ts
export { openLayer } from './openLayer'
export { useLayer } from './useLayer'
export { LayerContext } from './layerContext'
export type { LayerContextValue, OpenLayerOptions } from './layerContext'
```

### Tests for Phase 2

- Render `<App>` with a layer in the stack; assert `LayerContext` is provided to child
- `useLayer()` outside a layer throws
- `Link` inside a layer uses the layer's router (spy on layer.router.visit)
- `useForm` submit inside a layer calls layer.router.visit
- `openLayer()` before app mount throws
- `openLayer()` resolves when `accept(value)` is called
- `openLayer()` resolves with undefined when `dismiss()` is called

---

## Phase 3 — Rails: Middleware + Controller Helpers (2–3 days)

**Owner: Agent C (Rails specialist)**
**Can run in parallel with Phase 2**
**Repo**: `your-org/inertia-rails`

### 3.1 Read X-Inertia-Layer in middleware

In `lib/inertia_rails/middleware.rb` (or a new `layer_middleware.rb`), read the header
and make it available on the request:

```ruby
LAYER_HEADER = 'HTTP_X_INERTIA_LAYER'

def inertia_layer_id
  request.env[LAYER_HEADER]
end
```

Expose via `InertiaRails::Controller` concern as `inertia_layer_id` and
`inertia_layer?` helpers.

### 3.2 Controller concern: layer response helpers

Add to `InertiaRails::Controller` (or a new `InertiaRails::Layers` concern):

```ruby
def inertia_layer_close
  response.set_header('X-Inertia-Layer-Action', 'close')
end

def inertia_layer_accept(value)
  response.set_header('X-Inertia-Layer-Action', 'accept')
  response.set_header('X-Inertia-Layer-Accept', value.to_json)
  head :ok
end

def inertia_layer_open
  response.set_header('X-Inertia-Layer-Action', 'open')
end

# Per-layer context — read what the client sent
def inertia_layer_context
  @inertia_layer_context ||= begin
    raw = request.headers['X-Inertia-Layer-Context']
    raw ? JSON.parse(raw).with_indifferent_access : {}.with_indifferent_access
  end
end

# Update the layer's context store from the server side
# Merged into the client's context on response (inspired by Unpoly X-Up-Context)
def inertia_update_layer_context(patch)
  existing = response.headers['X-Inertia-Layer-Context']
  merged = existing ? JSON.parse(existing).merge(patch.stringify_keys) : patch.stringify_keys
  response.set_header('X-Inertia-Layer-Context', merged.to_json)
end
```

### 3.3 Base route / direct visit fallback (Decision 7)

Add a `layer_base_route` class macro so modal-only actions redirect gracefully on
direct visit:

```ruby
module InertiaRails
  module Layers
    extend ActiveSupport::Concern

    included do
      class_attribute :_layer_base_route_action
    end

    class_methods do
      def layer_base_route(action)
        self._layer_base_route_action = action
        before_action :enforce_layer_base_route
      end
    end

    private

    def enforce_layer_base_route
      return if inertia_layer?
      redirect_to url_for(action: self.class._layer_base_route_action)
    end
  end
end
```

Usage:
```ruby
class ContactsController < InertiaController
  include InertiaRails::Layers
  layer_base_route :index   # direct visits to modal actions redirect to index
end
```

### 3.4 Typical usage pattern in a Rails controller

```ruby
# contacts_controller.rb
def create
  @contact = Contact.create!(contact_params)
  if inertia_layer?
    inertia_layer_accept(@contact.as_json(only: [:id, :name]))
  else
    redirect_to contact_path(@contact), notice: "Contact created."
  end
end

# Reading layer context set by the client
def pick
  source = inertia_layer_context[:source]  # e.g. "deal-form"
  compact = inertia_layer_context[:compact]
  render inertia: "contacts/pick", props: { contacts: @contacts, compact: compact }
end
```

### 3.4 RSpec matchers

Add to `inertia_rails/rspec` or a new `inertia_rails/rspec/layers`:

```ruby
RSpec::Matchers.define :close_inertia_layer do
  match do |response|
    response.headers['X-Inertia-Layer-Action'] == 'close'
  end
end

RSpec::Matchers.define :accept_inertia_layer do |expected_value|
  match do |response|
    response.headers['X-Inertia-Layer-Action'] == 'accept' &&
      JSON.parse(response.headers['X-Inertia-Layer-Accept']) == expected_value
  end
end
```

### 3.5 RSpec matchers

Add to `inertia_rails/rspec` or a new `inertia_rails/rspec/layers`:

```ruby
RSpec::Matchers.define :close_inertia_layer do
  match { |response| response.headers['X-Inertia-Layer-Action'] == 'close' }
end

RSpec::Matchers.define :accept_inertia_layer do |expected_value|
  match do |response|
    response.headers['X-Inertia-Layer-Action'] == 'accept' &&
      JSON.parse(response.headers['X-Inertia-Layer-Accept']) == expected_value
  end
end

RSpec::Matchers.define :update_inertia_layer_context do |expected_patch|
  match do |response|
    ctx = response.headers['X-Inertia-Layer-Context']
    ctx && JSON.parse(ctx).slice(*expected_patch.keys.map(&:to_s)) == expected_patch.stringify_keys
  end
end
```

### Tests for Phase 3

- `inertia_layer?` returns false when header absent; true when present
- `inertia_layer_context` returns indifferent hash from header JSON
- `inertia_layer_close` sets correct response header
- `inertia_layer_accept({ id: 1 })` sets both headers with correct JSON
- `inertia_update_layer_context` merges into existing response header
- `accept_inertia_layer` matcher passes/fails correctly
- `update_inertia_layer_context` matcher passes/fails correctly
- `layer_base_route :index` redirects non-layer direct visits
- Controller spec: POST to create, with layer header → accepts with contact JSON
- Controller spec: POST to create, without layer header → normal redirect
- Controller spec: context header present → `inertia_layer_context[:source]` returns value

---

## Phase 4 — Integration + End-to-End Tests (3 days)

**Owner: Agents A + B pair, or a QA agent**
**Depends on: Phases 1, 2, 3 complete**

### 4.1 Manual integration checklist

Wire the forked packages into a test Rails/React app (or this CRM app) and verify:

- [ ] Root page navigation unaffected (no regressions)
- [ ] `openLayer('/some/route')` renders the page in a modal overlay
- [ ] `Link` inside a modal navigates within the modal (URL in root unchanged)
- [ ] `useForm` submit inside a modal uses the layer router (no full-page nav)
- [ ] Successful form submit with `inertia_layer_accept` closes the modal and resolves
      the Promise
- [ ] `inertia_layer_close` after redirect closes the modal without a return value
- [ ] Escape key dismisses the top modal
- [ ] Click backdrop dismisses the top modal
- [ ] Nested layers: open a layer from within a layer — both stack correctly
- [ ] Closing the inner layer returns focus to outer layer
- [ ] Browser back button closes the top layer (not navigating within it)
- [ ] Opening two layers then pressing back twice closes both layers in order
- [ ] `mode: 'drawer'` renders as a side panel
- [ ] `mode: 'fullscreen'` renders full-viewport
- [ ] `context` set in `openLayer()` arrives as `inertia_layer_context` on the server
- [ ] Server `inertia_update_layer_context` response merges into client context store
- [ ] `layer_base_route` redirects when layer route is visited directly in browser
- [ ] Layer URL visited directly in browser → redirected to base route, no broken page

### 4.2 Regression test sweep

Run the full upstream Inertia test suite against the fork. All existing tests must pass.
Any failure is a blocker.

```bash
pnpm test --filter=@inertiajs/core
pnpm test --filter=@inertiajs/react
bundle exec rspec  # in inertia-rails fork
```

### 4.3 TypeScript type check

```bash
npm run check
```

Confirm no new TS errors introduced. The new layer API surface must be fully typed —
no `any` in the public API.

---

## Phase 5 — Documentation + Demo (1–2 days)

**Owner: any agent**
**Depends on: Phase 4 passing**

### 5.1 Update the monorepo README

Add a "Layers" section with:
- What layers are and when to use them
- `openLayer(url, options)` API reference
- `useLayer()` hook reference
- `<LayerContainer>` props reference
- Rails controller helpers reference
- Comparison table vs `@inertiaui/modal-react`

### 5.2 Write example pages for the CRM app

```
app/frontend/pages/contacts/
  pick.tsx       # "Pick a contact" modal page — calls useLayer().accept(contact)
  index.tsx      # updated with an "openLayer" button to demo the flow
```

```ruby
# contacts_controller.rb — add a `pick` action
def pick
  @contacts = Contact.all.as_json(only: [:id, :name])
  render inertia: "contacts/pick", props: { contacts: @contacts }
end
```

---

## Agent Team Assignment

| Agent | Phase | Key files |
|---|---|---|
| **Agent A** | Phase 1 (core) | `packages/core/src/*.ts` |
| **Agent B** | Phase 2 (React) | `packages/react/src/*.tsx`, new layer files |
| **Agent C** | Phase 3 (Rails) | `inertia-rails/lib/`, `inertia-rails/spec/` |
| **Agent A+B** | Phase 4 integration | Wire packages, run test suite |
| **Any** | Phase 5 docs/demo | README, CRM example pages |

Phases 2 and 3 can run **in parallel** after Phase 1 is complete.
Phase 4 is a synchronization point — all three agents contribute.

---

## Out of Scope (MVP)

These are explicitly deferred. Do not implement them in this pass:

- **Per-layer browser history** (back/forward navigates within a layer rather than
  closing it) — the `history.ts` changes are complex and can ship as v2
- **Prefetching inside layers** — `prefetched.ts` is root-layer only
- **SSE / WebSocket channel per layer** — not needed for the CRM use case
- **Vue and Svelte adapters** — React only; the core changes are adapter-agnostic so
  Vue/Svelte can be added later by applying the same `LayerContext` pattern
- **`X-Inertia-Layer-Action: open` server-initiated layer** — the response header is
  parsed (Phase 1.4) but the React handler to act on it is deferred; for the MVP,
  layers are only opened client-side via `openLayer()`

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `popstate` handler change breaks root back navigation | Medium | High | Use sentinel `history.pushState({ __inertiaLayer: id })` per layer; check for sentinel in popstate handler rather than a global count |
| Stale layer stays in DOM after forward navigation | Medium | High | Documented Next.js bug with their parallel routes. Fix: on `popstate` forward events, check if the sentinel state is absent and explicitly close all layers |
| Layer Router instance shares global `config` singleton | Medium | Medium | Audit `config.ts` usages in Router — most are read-only; if any are mutated per-instance, scope them to the Router constructor |
| Focus trap / scroll lock conflicts between stacked layers | Low | Medium | Only apply scroll lock to body from bottom-most layer; inner layers use `overflow: hidden` on their container |
| TypeScript errors from dual Router export (class + instance) | Low | Low | Use `export type { Router }` for the class where only the type is needed |
| `X-Inertia-Layer-Context` header size limit | Low | Low | JSON context should stay small (IDs, flags, not data). Document a 4KB soft limit; server ignores oversized headers |
| Upstream Inertia merges breaking changes before fork is done | Low | High | Pin to the exact commit SHA used to fork; rebase deliberately when stable |
