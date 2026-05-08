/* Wilhelm offline service worker.
 *
 * Strategy:
 *   - Static assets (`/_next/static/*`, icons, manifest, fonts): cache-first.
 *   - Navigations (HTML + RSC payloads): network-first, fall back to cache,
 *     and finally to a cached "/" shell so the PWA always renders something.
 *   - Same-origin GET API calls: network-first, fall back to cache.
 *   - Auth and non-GET requests: passthrough (never cached).
 *
 * Bump CACHE_VERSION whenever this file or the precache list changes — the
 * `activate` step deletes any cache that doesn't match.
 */

const CACHE_VERSION = "v1";
const STATIC_CACHE = `wilhelm-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `wilhelm-runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.svg",
  "/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      // `Promise.allSettled` so one missing precache target doesn't block install.
      Promise.allSettled(PRECACHE_URLS.map((u) => cache.add(u))),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icon-") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/favicon.ico"
  );
}

function isFontRequest(url) {
  return (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  );
}

function isApiGet(url, request) {
  return (
    url.origin === self.location.origin &&
    url.pathname.startsWith("/api/") &&
    !url.pathname.startsWith("/api/auth/") &&
    request.method === "GET"
  );
}

function isNavigationRequest(request) {
  if (request.mode === "navigate") return true;
  // Next.js client transitions request RSC payloads — treat them as navigations
  // so they fall back to cache when offline.
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/x-component") || accept.includes("text/html");
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const fresh = await fetch(request);
    if (fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function handleNavigation(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Last-resort fallback: the cached homepage shell.
    const shell = await caches.match("/");
    if (shell) return shell;
    return new Response(
      "<h1>Offline</h1><p>Denne siden er ikke tilgjengelig offline ennå.</p>",
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip cross-origin requests except fonts.
  if (url.origin !== self.location.origin && !isFontRequest(url)) return;

  if (isStaticAsset(url) || isFontRequest(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (isApiGet(url, request)) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  if (isNavigationRequest(request)) {
    event.respondWith(handleNavigation(request));
    return;
  }
});
