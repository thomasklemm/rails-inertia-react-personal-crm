# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bin/dev                          # Start Rails + Vite dev servers (Procfile.dev)
bundle exec rspec                # Run all tests
bundle exec rspec spec/path/to_spec.rb:42  # Run a single test
npm run check                    # TypeScript type check
npm run lint                     # ESLint
npm run lint:fix                 # ESLint with auto-fix
npm run format                   # Prettier check
npm run format:fix               # Prettier auto-format
bin/rails js:routes:typescript   # Regenerate js-routes after changing routes.rb
```

## Architecture

Rails backend + React frontend connected via [Inertia.js](https://inertia-rails.dev). No separate API — Rails renders Inertia responses directly.

### Request flow

Every authenticated page controller inherits from `InertiaController` (not `ApplicationController` directly). `InertiaController` enables `default_render: true` (convention-based rendering) and shares `auth: { user, session }` with every page via `inertia_share`.

`ApplicationController` enforces authentication globally via `before_action :authenticate` — unauthenticated requests redirect to `sign_in_path`. Controllers handling unauthenticated routes (sign in, sign up, password reset) call `require_no_authentication`.

### Frontend structure

```
app/frontend/
  entrypoints/    # Vite entry (inertia.ts)
  pages/          # Inertia page components (matched to Rails controllers)
  layouts/        # app-layout.tsx (authenticated), auth-layout.tsx (guest)
  components/     # shadcn/ui + custom components
  hooks/          # use-flash, use-appearance, use-initials, etc.
  lib/            # Utilities
  routes/         # js-routes generated file (index.js + index.d.ts)
  types/          # index.ts (SharedProps, FlashData, User, Session, etc.)
                  # globals.d.ts (InertiaConfig module augmentation)
```

### TypeScript types

`app/frontend/types/index.ts` defines shared types. `globals.d.ts` augments `@inertiajs/core`'s `InertiaConfig` to type `sharedPageProps` (→ `SharedProps`), `flashDataType` (→ `FlashData`), and `errorValueType`.

### Routing

Use `js-routes` helpers from `@/routes` (e.g., `signInPath()`, `dashboardPath()`) — never hardcode URL strings. After changing `routes.rb`, run `bin/rails js:routes:typescript`.

## Inertia Rails Stack

- **Frontend**: React with @inertiajs/react ^2.1.2
- **Serialization**: `render inertia: { key: value }` with `as_json`. The `alba-inertia` skill does NOT apply — ignore it.
- **UI**: shadcn/ui adapted for Inertia. NEVER react-hook-form, zod, FormField, FormItem, or FormMessage — use Inertia `<Form>` with plain shadcn inputs.
- **Testing**: RSpec with inertia_rails/rspec matchers. Use `render_component`, `have_props`, `have_flash` — NOT direct property access.
- **Routing**: js-routes for typed path helpers. Run `rails js_routes:generate` after changing routes.rb.
- **Architecture**: Server owns routing, data, and auth. React renders only. See `inertia-rails-architecture` for the decision matrix.
- **Modals**: `@inertiaui/modal-react` — use the `inertia-modal` skill when opening any route in a modal or slideover, replacing `<Link>` with `<ModalLink>`, wrapping page content in `<Modal>`, or building inline local modals.

## Skills

- **`/agent-browser`**: Very useful for interacting with the running app — navigate pages, click buttons, fill forms, take screenshots, and verify UI behavior in a real browser session.

### Full-page screenshots with agent-browser

The app uses a fixed-height layout (`h-full`/`h-screen`) with an inner scrolling container (`.scrollbar-subtle.h-full.overflow-y-auto`). Playwright's `--full` flag only captures the document body height, so a plain `screenshot --full` captures only the viewport. To capture the entire page, expand all ancestor containers via JS first:

```bash
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
agent-browser eval --stdin <<'EOF'
const el = document.querySelector('.scrollbar-subtle.h-full.overflow-y-auto');
let node = el;
let count = 0;
while (node && node !== document.body && count < 10) {
  node.style.cssText += 'height: auto !important; overflow: visible !important; max-height: none !important; min-height: 0 !important;';
  node = node.parentElement;
  count++;
}
document.documentElement.style.cssText = 'height: auto !important;';
document.body.style.cssText = 'height: auto !important; overflow: visible !important;';
EOF
agent-browser screenshot --full
```

## UI Text Conventions

- **Title Case everywhere**: All button labels, form headings, page titles, and breadcrumbs use Title Case.
  - Submit buttons: "Create Contact", "Create Company", "Save Changes", "Log Note", "Log Call", "Log Email"
  - Page headings: "New Contact", "Edit Contact", "New Company", "Edit Company", "Log Activity"
  - Specs must match the exact Title Case text rendered in the UI.
