/* Service worker — Suivi ETG, CFPC Georges Hoareau
   Copyright (c) 2025 Haussmann Begue & Georges Hoareau. Tous droits reserves.

   Strategie : reseau d'abord, cache en secours. L'application est toujours a
   jour quand la connexion est la, et reste utilisable quand elle ne l'est pas.

   IMPORTANT — a chaque mise en ligne, incrementer CACHE_NAME. C'est ce
   changement de nom qui declenche la purge de l'ancien cache a l'activation ;
   sans lui, les telephones deja equipes conservent l'ancienne version. */
const CACHE_NAME='etg-cache-v7';
const APP_SHELL='/etg-cfpc-gh-v3.1.html';

/* Mises en cache des l'installation. La coquille est OBLIGATOIRE : si elle
   echoue, l'installation echoue et l'ancien service worker continue de servir
   l'application. Auparavant chaque mise en cache etait enveloppee dans un
   .catch(()=>{}) : une installation pouvait "reussir" avec un cache vide,
   puis vider les anciens caches a l'activation. Le premier rechargement en
   reseau instable ne trouvait alors plus rien — c'est le mecanisme de la page
   blanche signalee le 20/08/2026 sur tablette. */
const PRECACHE_OBLIGATOIRE=[APP_SHELL];
const PRECACHE_OPTIONNEL=['/manifest.json','/icon-192.png','/icon-512.png',
  '/icon-512-maskable.png','/apple-touch-icon.png'];

/* Reponse de dernier recours. e.respondWith(undefined) provoque une erreur
   reseau, donc un ecran vide : il ne doit JAMAIS etre possible d'y arriver. */
function secours(){
  return new Response(
    '<!doctype html><html lang="fr"><head><meta charset="utf-8">'
    +'<meta name="viewport" content="width=device-width,initial-scale=1">'
    +'<title>Suivi ETG — hors ligne</title><style>body{font-family:system-ui,'
    +'-apple-system,Segoe UI,Roboto,sans-serif;background:#F4F6F9;color:#1a1a1a;'
    +'margin:0;display:flex;align-items:center;justify-content:center;'
    +'min-height:100vh;padding:24px}div{max-width:420px;text-align:center;'
    +'background:#fff;border:1px solid #DCE3EC;border-radius:14px;padding:28px}'
    +'h1{font-size:19px;color:#184794;margin:0 0 10px}p{font-size:14px;'
    +'line-height:1.55;color:#3A4552}button{margin-top:18px;padding:12px 22px;'
    +'font-size:15px;border:0;border-radius:10px;background:#184794;color:#fff;'
    +'cursor:pointer}</style></head><body><div>'
    +'<h1>Connexion indisponible</h1>'
    +'<p>L\'application n\'a pas pu se charger et aucune version enregistree '
    +'n\'est disponible sur cet appareil. Verifiez votre connexion, puis '
    +'reessayez.</p>'
    +'<button onclick="location.reload()">Reessayer</button>'
    +'</div></body></html>',
    {status:200,headers:{'Content-Type':'text/html; charset=utf-8'}});
}

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE_NAME).then(c=>
      c.addAll(PRECACHE_OBLIGATOIRE)
       .then(()=>Promise.all(PRECACHE_OPTIONNEL.map(u=>c.add(u).catch(()=>{}))))
    ).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  const req=e.request;
  /* Ne jamais intercepter les appels vers Supabase (autre origine) :
     on laisse le navigateur les gerer nativement. */
  if(new URL(req.url).origin!==self.location.origin)return;
  if(req.method!=='GET')return;

  /* Les reecritures Vercel renvoient l'application pour TOUTE adresse. Sans la
     distinction ci-dessous, chaque adresse visitee stockait sa propre copie de
     1,2 Mo : le quota du navigateur etait atteint en quelques visites, et les
     mises en cache echouaient ensuite en silence. Une navigation est donc
     toujours lue et ecrite sous la meme cle, celle de la coquille. */
  const navigation=(req.mode==='navigate');
  const cle=navigation?APP_SHELL:req;

  e.respondWith(
    fetch(req).then(res=>{
      if(res&&res.ok&&res.type==='basic'){
        const copie=res.clone();
        caches.open(CACHE_NAME)
          .then(c=>c.put(cle,copie))
          .catch(()=>{});   /* quota plein : on sert quand meme la reponse */
      }
      return res;
    }).catch(()=>
      caches.match(cle)
        .then(trouve=>trouve||caches.match(APP_SHELL))
        .then(trouve=>trouve||secours())
        .catch(()=>secours())
    )
  );
});
