// The service worker, served from a route so it is never cached by the browser or Cloudflare
// (a stale worker would keep old code alive). Bump VERSION to drop all old caches.
const VERSION = 'v1';

const SW = String.raw`
const VERSION = '${VERSION}';
const STATIC = 'ak-static-' + VERSION;
const PAGES = 'ak-pages-' + VERSION;
const OFFLINE_URL = '/offline.html';
const PRECACHE = [OFFLINE_URL, '/icons/icon-192.png', '/icons/icon-512.png', '/favicon.ico'];
const MAX_PAGES = 80;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ak-') && k !== STATIC && k !== PAGES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

// Pages and data: always ask the server first so prices and availability are fresh;
// use the last copy only when there is no connection.
async function networkFirst(request) {
  const cache = await caches.open(PAGES);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
      trim(PAGES, MAX_PAGES);
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') return (await caches.match(OFFLINE_URL)) || Response.error();
    throw error;
  }
}

// Built files have unique names, so a cached copy is always correct.
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(STATIC)).put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith('/api/') || url.pathname === '/sw.js') return;
    if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/')) {
      event.respondWith(cacheFirst(request));
      return;
    }
    if (request.mode === 'navigate' || url.searchParams.has('_data')) {
      event.respondWith(networkFirst(request));
    }
    return;
  }

  // Google Fonts: keep a copy so the Kurdish fonts work offline.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request));
  }
});
`;

export function loader() {
  return new Response(SW, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Service-Worker-Allowed': '/',
    },
  });
}
