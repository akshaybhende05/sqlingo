/* CareerLadder service worker — offline support for a fully client-side course platform.
   Strategy:
   - Navigations: network-first (so a new deploy always wins), fall back to cache, then to "/".
   - Static assets + engine scripts + CDN runtimes (sql.js, Pyodide, fonts): stale-while-revalidate,
     so a course you've opened once keeps working with no connection.
   Bump VERSION to invalidate old caches on the next deploy. */
const VERSION = "cl-v1";
const RUNTIME = VERSION + "-runtime";
const PRECACHE = VERSION + "-precache";

const PRECACHE_URLS = [
  "/", "/courses", "/progress",
  "/app.js", "/ba.js", "/qa.js", "/devfund.js", "/python.js",
  "/django.js", "/fastapi.js", "/devops.js", "/capstone.js",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(PRECACHE);
    await Promise.allSettled(PRECACHE_URLS.map((u) => cache.add(u)));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const net = await fetch(req);
        const cache = await caches.open(RUNTIME);
        cache.put(req, net.clone());
        return net;
      } catch (_) {
        return (await caches.match(req)) || (await caches.match("/")) || Response.error();
      }
    })());
    return;
  }

  const sameOrigin = url.origin === self.location.origin;
  const isCdn = /(^|\.)cdnjs\.cloudflare\.com$|(^|\.)cdn\.jsdelivr\.net$|(^|\.)fonts\.googleapis\.com$|(^|\.)fonts\.gstatic\.com$/.test(url.host);
  if (!sameOrigin && !isCdn) return;

  event.respondWith((async () => {
    const cached = await caches.match(req);
    const network = fetch(req).then((res) => {
      if (res && (res.ok || res.type === "opaque")) {
        caches.open(RUNTIME).then((c) => c.put(req, res.clone())).catch(() => {});
      }
      return res;
    }).catch(() => null);
    return cached || (await network) || Response.error();
  })());
});
