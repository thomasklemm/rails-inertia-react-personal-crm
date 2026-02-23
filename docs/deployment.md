# Deployment

The app is deployed to Fly.io. It is reseeded with fresh demo data every hour via GitHub Actions (`reseed.yml`). CI deploys after every push to `main` (`deploy.yml`).

| Platform | URL | Region |
|----------|-----|--------|
| Fly.io | https://rails-inertia-react-personal-crm.fly.dev | Frankfurt (fra) |

## Fly.io

**Config:** `fly.toml`

- 512MB RAM, 2 shared CPUs, 2 Puma workers (`WEB_CONCURRENCY=2`)
- Thruster HTTP proxy on port 80 (runs as root)
- SQLite on a 1GB persistent volume at `/rails/storage`
- `auto_stop_machines = "suspend"` — freezes in memory when idle, resumes in ~1s
- `min_machines_running = 0` — can fully suspend between requests
- Health check: `GET /up` every 10s

**First-time setup:**
```bash
flyctl apps create rails-inertia-react-personal-crm --org personal
flyctl volumes create rails_storage --region fra --size 1
flyctl secrets set RAILS_MASTER_KEY=$(cat config/master.key)
flyctl deploy
```

**Required GitHub secret:** `FLY_API_TOKEN` — generate with:
```bash
flyctl tokens create deploy -x 999999h
```

**Deploy manually:**
```bash
flyctl deploy
```

**View logs:**
```bash
flyctl logs
```

**SSH into machine:**
```bash
flyctl ssh console
```

## GitHub Actions

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci.yml` | Push / PR | Runs tests, linting, security scan |
| `deploy.yml` | After CI passes on `main` | Deploys to Fly.io |
| `reseed.yml` | Hourly + manual | Reseeds DB with `db:seed:replant` |

The reseed workflow wakes the Fly.io machine first (it may be suspended), then runs `db:seed:replant` via SSH.

## Removed Platforms

**Railway** was removed in February 2026. The config (`railway.toml`), the `deploy-railway` job in `deploy.yml`, and the `reseed-railway` job in `reseed.yml` were all deleted. The Railway project was torn down manually via the Railway dashboard.
