const CACHE_VERSION = 'v1';
const STATIC_CACHE = `personal-crm-static-${CACHE_VERSION}`;
const KNOWN_CACHES = [STATIC_CACHE];

self.addEventListener('install', () => { self.skipWaiting(); });

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => !KNOWN_CACHES.includes(n)).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;
  if (request.method !== 'GET') return;

  const isStaticAsset =
    url.pathname.startsWith('/vite/assets/') ||
    /\.(png|ico|svg|webp|woff2?|ttf)$/.test(url.pathname);

  event.respondWith(isStaticAsset ? cacheFirst(request) : networkFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      return new Response(
        offlineHTML(),
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }
    throw new Error('Network and cache both failed');
  }
}

function offlineHTML() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Offline – Personal CRM</title>
    <style>
      body{font-family:system-ui,sans-serif;display:flex;align-items:center;
           justify-content:center;min-height:100vh;margin:0;background:#fafafa;color:#333}
      .box{text-align:center;padding:2rem}
      h1{font-size:1.5rem;margin:0 0 .5rem}
      p{color:#666;margin:0}
    </style>
  </head>
  <body>
    <div class="box">
      <h1>You're offline</h1>
      <p>Check your connection and try again.</p>
    </div>
  </body>
</html>`;
}
