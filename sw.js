/* Service worker — Suivi ETG
   - Pages et fichiers du site : réseau d'abord (toujours la dernière version), cache en secours hors-ligne.
   - Bibliothèques externes (graphiques, PDF) : mises en cache pour fonctionner aussi hors-ligne.
   - Supabase (autre origine) : jamais intercepté. */
const CACHE_NAME='etg-cache-v2';
const APP_SHELL='/index.html';
const PRECACHE=['/index.html','/manifest.json','/icon-192.png','/icon-512.png','/apple-touch-icon.png'];
const CDN_LIBS=[
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
];

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE_NAME);
    await c.add(APP_SHELL);                                   // indispensable
    await Promise.allSettled(PRECACHE.map(u=>c.add(u)));      // confort
    await Promise.allSettled(CDN_LIBS.map(async u=>{          // bibliothèques (réponse opaque acceptée)
      const r=await fetch(u,{mode:'no-cors'});
      await c.put(u,r);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);

  // Bibliothèques CDN : cache d'abord (elles sont versionnées, donc immuables)
  if(CDN_LIBS.includes(e.request.url)){
    e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
      const clone=res.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,clone));return res;
    })));
    return;
  }

  // Tout le reste d'une autre origine (Supabase, polices...) : on laisse le navigateur gérer
  if(url.origin!==self.location.origin)return;

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

// © 2025 Begue Haussmann — Tous droits réservés
