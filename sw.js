// Suivi ETG — service worker (coquille applicative hors ligne)
// Copyright (c) 2025 Haussmann Begue & Georges Hoareau — Tous droits réservés

// Le nom du cache est versionné : le changer force la purge de l'ancien cache
// au moment de l'activation. À incrémenter à CHAQUE déploiement de l'application,
// sinon les appareils déjà installés conservent des entrées périmées.
const CACHE_NAME = 'etg-cache-v2';
const APP_SHELL  = '/etg-cfpc-gh-v3.1.html';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.add(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Ne jamais intercepter les appels vers Supabase (autre origine) : on laisse le navigateur gérer nativement.
  if (url.origin !== self.location.origin) return;
  if (e.request.method !== 'GET') return;

  // Stratégie « réseau d'abord » : l'utilisateur voit toujours la dernière version
  // publiée quand il est connecté, et bascule sur le cache quand il ne l'est pas.
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.ok) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request).then(cached => cached || caches.match(APP_SHELL)))
  );
});
