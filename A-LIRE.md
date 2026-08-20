# À déposer à la racine de votre dépôt GitHub — version 4.3

Copyright (c) 2025 Haussmann Begue & Georges Hoareau.

**Supabase : rien à faire dans cette version.** (La table des consignes du
formateur arrivera avec la 4.4, avec son script SQL.)

Cette version remplace la 4.2 : ne déposez que celle-ci.

## Les 11 fichiers

Déposez-les à la **racine** du dépôt. GitHub remplace ceux qui existent déjà,
Vercel redéploie tout seul.

## Puis, impérativement

Ouvrir le site → F12 → onglet **Application** → **Service Workers** → cocher
« Update on reload » → recharger. Le cache doit afficher **`etg-cache-v7`**.

J'ai vérifié en direct sur votre navigateur le 20/08/2026 : vous étiez encore
en `etg-cache-v5`, c'est-à-dire en version 4.1. Sans cette étape, rien de ce qui
suit n'arrivera jusqu'à vos stagiaires.

---

## 1. Huit contenus étaient devenus inatteignables — le défaut le plus grave

En 4.1 j'ai masqué le bouton hamburger au-delà de 700 px
(`#drawerBtn{display:none}`) et je l'ai remplacé par le menu latéral. Sauf que
le tiroir contenait **15 entrées** et que mon menu latéral n'en reprenait
que 9. Sur ordinateur et sur tablette, ces huit-là n'étaient plus atteignables
par aucun chemin :

Fin de formation ETG · 200 questions · Socles · Thèmes · Fiches orales ·
Fin de formation Hors circulation · Astuces de conduite ·
Fin de formation circulation

Sur téléphone elles restaient joignables par l'onglet « Menu » — c'est pour
cela que le défaut est passé inaperçu chez moi et pas chez vous.

**Corrigé.** Le menu latéral est désormais le miroir exact du tiroir, groupes
compris (ETG · Hors circulation · Circulation · Réglages), verrous inclus. Le
routage passe par la même fonction qu'avant (`drawerGo`), donc aucune règle
d'accès par catégorie n'a été réécrite.

**Et surtout : le script de construction refuse maintenant de produire un
fichier où une entrée du tiroir n'aurait pas d'équivalent dans le menu.**
Cette régression ne peut plus être relivrée.

## 2. L'écran de garde ne rejouait jamais après une actualisation

J'avais posé un verrou « une seule fois par session ». L'intention était de ne
pas rejouer le logo à chaque changement d'écran — mais l'application ne
recharge jamais la page quand on change d'écran. Le seul cas où le verrou
intervenait était donc **l'actualisation**, précisément celui où vous vouliez
le voir.

Vérifié en direct sur votre navigateur : la clé `etg_splash` valait déjà `1`.
**Verrou retiré** : le logo joue à chaque chargement de page.

## 3. La page blanche au rechargement — le service worker

Je n'ai pas pu reproduire votre cas exact sans la tablette, mais l'analyse du
service worker a mis au jour trois défauts réels, dont un qui produit
littéralement une page blanche :

**a) Une page blanche par construction.** En cas d'échec réseau, le service
worker répondait `caches.match(APP_SHELL)`. Si l'application n'était pas dans
le cache, cela vaut `undefined` — et `respondWith(undefined)` provoque une
erreur réseau, donc **un écran vide**. Il y a désormais une réponse de dernier
recours : une page lisible « Connexion indisponible » avec un bouton
« Réessayer ». Il n'est plus possible d'aboutir à un écran vide.

**b) Une installation pouvait « réussir » avec un cache vide.** Chaque mise en
cache était enveloppée dans un `.catch(()=>{})`. L'installation se déclarait
donc réussie même si l'application n'avait pas été enregistrée, puis
l'activation **supprimait les anciens caches**. Fenêtre exacte du symptôme :
nouvelle version déployée + réseau instable + rechargement = plus rien.
Désormais l'enregistrement de l'application est **obligatoire** : s'il échoue,
l'installation échoue et l'ancien service worker continue de servir.

**c) Le cache se remplissait de copies de 1,2 Mo.** Vos réécritures Vercel
renvoient l'application pour *toute* adresse. Chaque adresse visitée stockait
donc sa propre copie complète. Le quota du navigateur — plus étroit sur
tablette — était atteint en quelques visites, et les mises en cache échouaient
ensuite en silence. Les navigations sont maintenant lues et écrites sous une
clé unique.

Si la page blanche persiste après ce déploiement, dites-le-moi : il me faudra
alors la tablette elle-même (modèle, navigateur) pour aller plus loin.

## 4. L'espace formateur (déjà dans la 4.2, rappelé ici)

- La bride `.as.wd{max-width:760px}`, propre au rôle formateur, est levée.
  **Mesuré en direct sur votre application le 20/08/2026 : 508 px de contenu
  dans une fenêtre de 1920 px.** C'est corrigé.
- Écran d'accueil **« Prêts à présenter ? »** avec alertes calculées sur vos
  données réelles.
- Liste en **tableau dense et triable** au-delà de 1000 px, cartes en dessous.
- Filtres regroupés sur une bande au lieu de quatre cartes empilées.

---

## Ce qui a été vérifié

**Sur votre application réelle** (Chrome 151, Windows, 1920 px, 48 stagiaires,
1 000 séries, 32 résultats d'examen) : aucune erreur JavaScript au chargement,
et confirmation directe du bridage à 760 px et du verrou d'écran de garde.

**Sur le banc, version 4.3** :

- 9 largeurs × 2 rôles : aucun débordement, aucune erreur, aucun identifiant
  dupliqué ;
- 34 écrans enchaînés à 1440 px et à 390 px : 34 sur 34 ;
- **atteignabilité des contenus** — catégories C et B, à 1920 / 1024 / 768 /
  390 px : **15/15 et 10/10 entrées joignables**, avec une voie d'accès valide
  à chaque largeur ;
- démarrage réel en HTTP avec service worker actif : écran de garde présent au
  premier chargement **et à chaque rechargement**.

## Ce qui vient ensuite (4.4)

L'espace stagiaire conforme à la maquette : écran **Aujourd'hui** (consigne du
formateur, action unique du jour, bloc « Ensuite »), **Réviser**, **Où j'en
suis**. Il s'accompagnera d'une nouvelle table Supabase `consignes` et de
l'interface formateur pour écrire ces consignes — avec son script SQL.
