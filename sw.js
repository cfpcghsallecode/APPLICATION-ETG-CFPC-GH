/* Service worker — Suivi ETG, CFPC Georges Hoareau
   Copyright (c) 2025 Haussmann Begue & Georges Hoareau. Tous droits reserves.

   Strategie : reseau d'abord, cache en secours. L'application est toujours a
   jour quand la connexion est la, et reste utilisable quand elle ne l'est pas.

   IMPORTANT — a chaque mise en ligne, incrementer CACHE_NAME. C'est ce
   changement de nom qui declenche la purge de l'ancien cache a l'activation ;
   sans lui, les telephones deja equipes conservent l'ancienne version. */
const CACHE_NAME='etg-cache-v4';
const APP_SHELL='/etg-cfpc-gh-v3.1.html';

/* Mises en cache des l'installation : la coquille et les icones, pour que
   l'installation sur l'ecran d'accueil aboutisse meme en reseau instable. */
const PRECACHE=[APP_SHELL,'/manifest.json','/icon-192.png','/icon-512.png',
  '/icon-512-maskable.png','/apple-touch-icon.png'];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c=>Promise.all(PRECACHE.map(u=>c.add(u).catch(()=>{}))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  /* Ne jamais intercepter les appels vers Supabase (autre origine) :
     on laisse le navigateur les gerer nativement. */
  if(url.origin!==self.location.origin)return;
  if(e.request.method!=='GET')return;

  e.respondWith(
    fetch(e.request).then(res=>{
      if(res&&res.ok){
        const clone=res.clone();
        caches.open(CACHE_NAME).then(c=>c.put(e.request,clone));
      }
      return res;
    }).catch(()=>caches.match(e.request).then(cached=>cached||caches.match(APP_SHELL)))
  );
});
