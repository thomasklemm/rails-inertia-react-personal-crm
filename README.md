# Rails Inertia React Personal CRM

A personal CRM built with Rails 8 and React via Inertia.js. Manage contacts, companies, and activities — all in a fast, modern interface without a separate API layer.

## Live Demos

Both deployments are reseeded with fresh demo data every hour. Log in with `demo@example.com` / `password123456`.

| Platform | URL |
|----------|-----|
| [Fly.io](https://fly.io) (Frankfurt) | https://rails-inertia-react-personal-crm.fly.dev |
| [Railway](https://railway.app) (Netherlands) | https://rails-inertia-react-personal-crm-production.up.railway.app |

## Features

- **Contacts** — track people with notes, tags, and starred favorites
- **Companies** — manage organizations with linked contacts and activity history
- **Activities** — log calls, emails, meetings, and notes against contacts and companies
- **Authentication** — email/password sign-up and sign-in (based on [Authentication Zero](https://github.com/lazaronixon/authentication-zero))
- **Dark mode** — system-aware with manual toggle

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | [Rails 8.1](https://rubyonrails.org) · SQLite · Puma |
| Frontend bridge | [Inertia.js](https://inertiajs.com) (no separate API) |
| Frontend build | [Vite Rails](https://vite-ruby.netlify.app) |
| UI | [React 19](https://react.dev) · TypeScript · [shadcn/ui](https://ui.shadcn.com) · Tailwind CSS v4 |
| Routing | [js-routes](https://github.com/railsware/js-routes) (typed path helpers) |
| Modals | [@inertiaui/modal-react](https://github.com/inertiaui/modal) |
| Deployment | [Kamal](https://kamal-deploy.org) · [Fly.io](https://fly.io) · [Railway](https://railway.app) |

## Setup

```bash
git clone https://github.com/thomasklemm/rails-inertia-react-personal-crm
cd rails-inertia-react-personal-crm
bin/setup
bin/dev
```

Open http://localhost:3000.

## Development Commands

```bash
bin/dev                                        # Start Rails + Vite dev servers
bundle exec rspec                              # Run all tests
bundle exec rspec spec/path/to_spec.rb:42      # Run a single test
npm run check                                  # TypeScript type check
npm run lint                                   # ESLint
npm run lint:fix                               # ESLint with auto-fix
npm run format:fix                             # Prettier auto-format
bin/rails js:routes:typescript                 # Regenerate js-routes after changing routes.rb
```

## Deployment

The app deploys to Fly.io and Railway via GitHub Actions on every push to `main`. See [docs/deployment.md](docs/deployment.md) for platform-specific setup and CI workflow details.

## License

[MIT](LICENSE)
