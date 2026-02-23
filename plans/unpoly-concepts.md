# Unpoly — Concepts Worth Stealing

Notes on the ideas in Unpoly that are genuinely novel and worth understanding deeply,
independent of whether Unpoly itself is used.

Reference: https://unpoly.com/up.layer

---

## 1. Navigation as a Context, Not a URL

The deepest idea in Unpoly is that a browser navigation is not just "go to URL X." It
is "go to URL X *in context Y*." The URL and the context are orthogonal.

In every other framework (Inertia, Remix, Next.js, Turbo), the URL fully determines
what renders. Unpoly separates these: multiple layers can have different URLs active
simultaneously, and each layer's URL can update independently.

This unlocks the sub-interaction pattern: a parent page with URL `/deals/42` can open
a child layer at `/contacts/pick`, and when the child closes the parent's URL is
restored — with no full-page reload, no lost state, and no contrived client-side
state management to thread the picked contact back to the parent form.

---

## 2. `up.layer.ask()` — Sub-interaction Return Values

```js
const contact = await up.layer.ask('/contacts/pick')
// user navigates within the layer, picks a contact, layer closes
// contact is whatever the layer called up.layer.current.accept(contact) with
```

This is a coroutine model for navigation. The opener suspends, the overlay runs an
arbitrary multi-step workflow (multiple page navigations within the layer), and the
opener resumes with a typed result.

No other web framework has this. React has Promises and async/await for data fetching
but nothing analogous for navigation. The closest things are:
- Native mobile `present(_:animated:completion:)` + delegate callbacks (iOS)
- `showModalDialog()` — the long-deprecated browser API that was removed precisely
  because it was so useful it blocked threads

The reason this is so powerful: it lets you build reusable "picker" workflows (pick a
contact, pick a product, pick a date range) that can be dropped into any context
without the parent needing to know anything about the picker's internal structure.
The picker is a black box that returns a value.

**The inertia-layers plan implements this as `openLayer(url) → Promise<unknown>`.**

---

## 3. `X-Up-Context` — Per-Layer Context Store

```
# Request header sent by Unpoly with every request from a layer
X-Up-Context: {"source":"deal-form","step":1,"compact":true}
```

Each layer carries a mutable key/value store. It travels as a request header so the
server can read it without any client-side state management. The server can also update
it by sending `X-Up-Context` back in the response — the client merges the patch.

Use cases:
- **Compact rendering**: the server renders a minimal layout in modal context,
  full layout in root context — driven by `context.compact`, not by URL parameters
- **Multi-step wizard tracking**: `context.step` increments as the user progresses
  through a multi-page form within a single layer
- **Source tagging**: `context.source = "deal-form"` so the server knows why this
  layer was opened and can customize the response (e.g., pre-fill a related field)

What makes this elegant vs. the obvious alternative (URL query params): query params
are visible in the URL, pollute browser history, and are reset on every navigation.
Context is invisible, persists across layer navigations, and is semantically "metadata
about this interaction" rather than "part of the resource identifier."

**The inertia-layers plan implements this as `X-Inertia-Layer-Context`.**

---

## 4. Fragment Isolation Per Layer

In a standard web app, a CSS selector like `#main-content` matches the first element
with that ID in the document. If you have a modal open over a page, and the modal also
has `#main-content`, you have a problem.

Unpoly's layers each have their own fragment matching scope. A link inside layer 2
with `up-target="#main-content"` updates layer 2's `#main-content`, not layer 1's.
You explicitly opt out with `up-layer="parent"` or `up-layer="root"`.

This is structural isolation without `<iframe>`. The DOM is shared, CSS is shared,
JavaScript is shared — but fragment updates are scoped.

For Inertia the equivalent is that each layer's `swapComponent` callback only affects
that layer's React subtree. The plan achieves this naturally because each layer is a
separate React root (or at minimum a separate `PageContext.Provider`).

---

## 5. Declarative Layer Targeting via `[up-layer]`

Any link or form can specify which layer it targets:

```html
<a href="/contacts" up-layer="new modal">Open in a new modal</a>
<a href="/contacts" up-layer="current">Navigate current layer</a>
<a href="/contacts" up-layer="parent">Navigate parent layer</a>
<a href="/contacts" up-layer="root">Navigate root page</a>
<a href="/contacts" up-layer="any">Navigate top-most matching layer</a>
```

This is entirely declarative — no JavaScript, no event handlers, no onClick. It is
the HTML attribute equivalent of our `<LayerLink>` component.

The `[up-layer]` values form a targeting vocabulary that covers every real-world case.
The most interesting is `"root"` — a link inside a deep modal stack that navigates the
root page, which is necessary for things like "go to this item's detail page" from
within a picker overlay.

**Worth adding to the inertia-layers API**: a `target` prop on `<LayerLink>` with
values `"new"`, `"current"`, `"parent"`, `"root"` rather than always opening a new
layer.

---

## 6. Layer Modes Are First-Class

Unpoly ships five modes out of the box:
- `modal` — centered dialog with backdrop
- `drawer` — slides in from the side
- `popup` — small floating box anchored to an element
- `cover` — overlays the full viewport (like a fullscreen takeover)
- `root` — the base page (not really a "mode" but a named concept)

Each mode has sensible defaults for size, position, animation, backdrop, and dismiss
behavior. You override individual properties without rewriting the whole container.

The interesting one is `popup` — it anchors to the element that opened it (like a
dropdown but powered by a full server-rendered route). This is something `<dialog>`
and most modal libraries don't handle: the overlay is positioned *relative to the
trigger*, not centered on screen.

---

## 7. URL Restoration When a Layer Closes

When a non-root layer closes, Unpoly restores the parent layer's URL in the browser
address bar (and the page title). This happens automatically.

The sequence:
1. Root layer at `/deals/42`, URL bar shows `/deals/42`
2. Open layer at `/contacts/pick`, URL bar shows `/contacts/pick`
3. User navigates within the layer to `/contacts/pick?search=alice`, URL bar updates
4. Layer accepts with a value — URL bar snaps back to `/deals/42`
5. Root page title is restored

This means browser history behaves correctly: the back button steps through layer
navigations before eventually closing the layer and returning to the root page's
position in history.

This is the hardest part to implement in Inertia (listed as "Out of Scope" in the
MVP plan) because it requires per-layer history stacks serialized into
`history.state`. SvelteKit's shallow routing hints at the mechanism: push a real
`history.pushState` entry when opening/navigating within a layer, then intercept
`popstate` events to route them to the correct layer rather than the root router.

---

## 8. Server Transparency

Unpoly servers don't need to know they are serving an Unpoly app. A plain HTML
`<a>` link and a plain server rendering HTML in response is all that's required for
basic usage. Unpoly intercepts the navigation client-side, fetches the response,
extracts the fragment it needs, and inserts it.

The advanced features (layer context, accept/dismiss, targeted responses) require
server cooperation via headers — but the basic layers feature works with zero server
changes.

This is the opposite of Inertia's model, where every response must be an Inertia
JSON response (or a redirect). Inertia requires server cooperation for everything;
Unpoly requires it for nothing (basic) or headers (advanced).

**Implication for inertia-layers**: the Rails helpers (`inertia_layer_accept`, etc.)
are optional enhancements. A layer that just renders a page and dismisses via Escape
requires zero Rails changes. Only result-passing and server-initiated close require
the helpers. This is a good ergonomic property — make the simple case require no
boilerplate.

---

## 9. The Key Absence: Component Model

Unpoly operates on HTML fragments and HTTP. It does not have a component model —
there are no components, no props, no reactive state. The "state" is the server's
database, and the "components" are rendered HTML fragments.

This is why Unpoly can be server-transparent. When you have a React component tree
with typed props, you necessarily need to know what props the component expects —
and that means the server must produce them in the right shape.

Unpoly's model is simpler but less capable for complex interactive UIs. Inertia's
model is more powerful for component-rich pages but requires server cooperation.
The inertia-layers design sits closer to Inertia's end: full React components per
layer, typed props, Inertia protocol — but borrows Unpoly's *conceptual vocabulary*
of layers, contexts, accept/dismiss, and targeting.
