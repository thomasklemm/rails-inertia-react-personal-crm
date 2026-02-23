# Performance

Benchmarked 2026-02-23 using `hey` from a macOS client in Stockholm against both production deployments.

## JS Bundle

Vite splits the bundle into independently cacheable chunks. Vendor chunks carry 1-year immutable cache headers.

| Chunk | Raw | Gzip |
|-------|-----|------|
| `vendor-react` (React, ReactDOM, Inertia) | 468 KB | 151 KB |
| `vendor-ui` (Radix UI, Lucide) | 119 KB | 29 KB |
| `vendor-misc` (other libs) | 92 KB | 33 KB |
| Entry point (`inertia-*.js`) | 7 KB | 3 KB |
| Per-page chunks (20 pages) | 1–14 KB each | < 5 KB each |

**First visit:** ~220 KB total gzip (was 269 KB monolith — 18% smaller, plus parallel loading)
**Returning visitor after deploy:** ~3 KB (entry chunk only — vendor chunks served from cache)

Page components are lazy-loaded via dynamic `import()` in the Inertia resolver, so each navigation only fetches the relevant page chunk.

## Fly.io vs Railway — Authenticated Load Test

All tests use an authenticated session (demo@example.com). Endpoints return full Inertia JSON responses.

### GET /contacts

| Concurrency | Fly.io req/s | Railway req/s | Fly.io p50 | Railway p50 | Fly.io p99 | Railway p99 |
|-------------|-------------|--------------|-----------|------------|-----------|------------|
| 10c × 100r  | 58.7        | 47.2         | 129ms     | 186ms      | 554ms     | 362ms      |
| 25c × 250r  | 123.1       | 55.9         | 154ms     | 422ms      | 493ms     | 647ms      |
| 50c × 500r  | **200.5**   | 61.6         | **234ms** | 779ms      | **441ms** | 1137ms     |

### GET /companies

| Concurrency | Fly.io req/s | Railway req/s | Fly.io p50 | Railway p50 | Fly.io p99 | Railway p99 |
|-------------|-------------|--------------|-----------|------------|-----------|------------|
| 10c × 100r  | 130.3       | 87.3         | 58ms      | 100ms      | 228ms     | 194ms      |
| 25c × 250r  | 215.4       | 70.3         | 106ms     | 326ms      | 194ms     | 556ms      |
| 50c × 500r  | **263.0**   | **3.3 ❌**   | **166ms** | **15,038ms** | **304ms** | **15,109ms** |

> Railway `/companies` at 50c × 500r: 100% failure rate. Every request hit Railway's 15s gateway timeout — the single Puma worker exhausted its thread pool and all queued requests timed out.

### GET / (dashboard)

| Concurrency | Fly.io req/s | Railway req/s | Fly.io p50 | Railway p50 | Fly.io p99 | Railway p99 |
|-------------|-------------|--------------|-----------|------------|-----------|------------|
| 10c × 100r  | 124.2       | 50.4         | 64ms      | 169ms      | 149ms     | 346ms      |
| 25c × 250r  | 180.9       | 67.9         | 117ms     | 336ms      | 263ms     | 581ms      |
| 50c × 500r  | 201.3       | 60.8         | 224ms     | 815ms      | 423ms     | 1033ms     |

## Analysis

**Fly.io wins by 3–4x under load.** At low concurrency (10c) the gap is ~30–50%. At 50c it's 3x on throughput and Railway's latency tail blows out completely.

**Root cause is infrastructure, not app code.** Rails processing time at idle is nearly identical: Fly.io 11.5ms x-runtime vs Railway 16.6ms. The difference is:
- Fly.io: 2 Puma workers, 512MB RAM, direct routing to Frankfurt machine
- Railway: 1 Puma worker (hobby tier), requests routed through Fastly CDN in Copenhagen → Netherlands GCP

**Railway latency scales linearly with concurrency** (186ms → 422ms → 779ms p50 on /contacts), indicating pure request queuing behind the single Puma worker. Fly.io scales sub-linearly because the second worker absorbs concurrent load.

**Cold-start note.** Fly.io machines may return 502/503 on the very first request after being suspended. This resolves within 1–2 seconds. Setting `min_machines_running = 1` in `fly.toml` would eliminate this entirely at the cost of always keeping one machine warm.
