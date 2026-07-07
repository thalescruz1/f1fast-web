// ============================================================
// SERVICE WORKER: F1Fast PWA
// ============================================================
// Objetivos:
//   1. Tornar o app instalável (Add to Home Screen) no Android/iOS
//   2. Dar suporte offline básico (app shell)
//
// Estratégias:
//   - Navegações (HTML)  → network-first, fallback ao index cacheado
//   - Assets same-origin → stale-while-revalidate (bundles têm hash)
//   - API (cross-origin) → NÃO intercepta (sempre rede, nunca cacheia
//     dados de palpite/ranking)
//
// Para forçar atualização em todos os clientes: incremente CACHE.
// ============================================================

const CACHE = 'f1fast-v1';

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

// Instala e pré-cacheia o app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Ativa e remove caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Só GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Requisições cross-origin (API do Azure, Google Fonts, etc.) passam direto
  if (url.origin !== self.location.origin) return;

  // Navegações: network-first para sempre ter o index mais novo online,
  // com fallback ao index cacheado quando offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/', copy));
          return res;
        })
        .catch(() => caches.match('/').then((r) => r || caches.match('/index.html')))
    );
    return;
  }

  // Demais assets same-origin: stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
