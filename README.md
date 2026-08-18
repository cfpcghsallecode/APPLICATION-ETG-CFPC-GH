# Suivi ETG — CFPC Georges Hoareau

Application pédagogique de suivi de formation au permis de conduire.
Copyright © 2025 Haussmann Begue & Georges Hoareau — Tous droits réservés.

---

## Contenu de ce dossier

| Fichier | Rôle | À déposer sur |
|---|---|---|
| `etg-cfpc-gh-v3.1.html` | **L'application entière** (HTML + CSS + JS + contenus) | GitHub → Vercel |
| `sw.js` | Service worker : mise en cache hors ligne | GitHub → Vercel |
| `manifest.json` | Manifeste PWA (installation sur l'écran d'accueil) | GitHub → Vercel |
| `vercel.json` | Règle de réécriture : toute URL sert l'application | GitHub → Vercel |
| `icon-192.png` | Icône PWA 192×192 | GitHub → Vercel |
| `icon-512.png` | Icône PWA 512×512 | GitHub → Vercel |
| `apple-touch-icon.png` | Icône iOS 180×180 | GitHub → Vercel |
| `supabase/schema.sql` | Schéma de référence (**déjà déployé**, ne pas rejouer) | Supabase — archive |
| `supabase/migration_01_index.sql` | Index manquants — **à exécuter une fois** | Supabase → SQL Editor |

**Les 7 premiers fichiers vont à la racine du dépôt**, pas dans un sous-dossier.
Le dossier `supabase/` n'est pas servi par Vercel : il ne sert qu'à conserver le SQL avec le code.

---

## Pourquoi le nom de fichier n'a pas changé

L'application est en version 3.7, mais le fichier s'appelle toujours `etg-cfpc-gh-v3.1.html`.
C'est **volontaire** : trois fichiers pointent vers ce nom exact.

- `manifest.json` → `"start_url": "/etg-cfpc-gh-v3.1.html"`
- `sw.js` → `const APP_SHELL = '/etg-cfpc-gh-v3.1.html'`
- `vercel.json` → `"destination": "/etg-cfpc-gh-v3.1.html"`

Renommer le fichier obligerait à modifier les trois, et surtout **casserait les
applications déjà installées** sur les téléphones des stagiaires : leur raccourci
pointe vers l'ancienne URL. Le numéro de version réel est inscrit en commentaire
dans l'en-tête du fichier HTML.

---

## Mise en ligne — GitHub et Vercel

1. Déposer les 7 fichiers à la racine du dépôt, en remplaçant les anciens.
2. `git add . && git commit -m "v3.7 — sécurité, accessibilité, module Cours" && git push`
3. Vercel redéploie automatiquement.

**Important — vider le cache après déploiement.** Le `sw.js` fourni porte
`CACHE_NAME = 'etg-cache-v2'` (l'ancien était `v1`). Ce changement déclenche la
purge de l'ancien cache à l'activation. **À chaque déploiement futur, incrémente
ce numéro**, sinon les appareils déjà installés conserveront des fichiers périmés.

Pour vérifier après mise en ligne : ouvrir le site, puis dans les outils de
développement, onglet Application → Service Workers → « Update on reload », et
recharger. Le cache doit afficher `etg-cache-v2`.

---

## Mise en ligne — Supabase

**Ne rejoue pas `schema.sql`** : il est déjà déployé et contient des `create table`
et `create policy` qui échoueraient ou dupliqueraient des règles. Il est fourni
uniquement pour garder le schéma versionné avec le code.

**Exécute `migration_01_index.sql`** une seule fois :

1. Supabase → SQL Editor → New query
2. Coller le contenu du fichier
3. Run

Ce script ne crée que des index. Il ne lit, ne modifie et ne supprime aucune donnée,
et il est rejouable sans risque (`if not exists`).

---

## Ce qui a changé depuis la version en ligne

**Sécurité.** Une faille d'injection HTML stockée a été corrigée : le nom et
l'adresse e-mail saisis à l'inscription étaient insérés sans échappement dans
quatre écrans, dont la liste des stagiaires côté formateur. Un compte créé sous un
nom contenant du code pouvait exécuter ce code dans la session du formateur.

**Contenus.** Neuf écarts corrigés entre l'application et les documents du centre,
dont trois valeurs chiffrées fausses en catégorie C : alcoolémie marchandises
(0,50 g/l et non 0,20), périodicité du contrôle technique (12 mois et non 6),
profondeur des rainures poids lourd (1 mm et non 1,6).

**Accessibilité.** Palette recalculée (19 couples de contraste vérifiés), champs de
saisie portés de 19 à 44 px, focus clavier visible, annonce des changements d'écran
pour les lecteurs d'écran, points de rupture tablette et ordinateur.

**Nouveau — module Cours ETG.** Dix thématiques avec cartes mentales, schémas,
tableaux de synthèse, 60 flashcards et 33 questions d'auto-évaluation.
Accessible par Menu ▸ ETG ▸ Cours.

**Nouveau — module Panneaux.** 43 panneaux classés par famille, avec entraînement
à la reconnaissance. Accessible par Menu ▸ ETG ▸ Panneaux.

---

## Points restant à traiter

Signalés dans l'audit et **non corrigés** :

1. **Écrasement de progression** — une coupure réseau au chargement fabrique une
   progression vierge, l'affiche, puis l'écrit en base. Perte définitive possible.
   *Le correctif touche le chemin d'écriture : à appliquer et tester par un
   développeur ayant accès à la base.*
2. **Archivage sur PDF vide** — un bilan généré sur incident réseau déverrouille
   quand même la suppression définitive d'un stagiaire.
3. **`window._S` non purgé à la déconnexion** — données du formateur précédent
   encore en mémoire sur tablette partagée.
4. **CDN sans attribut `integrity`** sur Chart.js et jsPDF.

---

## Avertissement

Cette version n'a été testée que dans un banc d'essai isolé, sans accès au backend
Supabase de production : ni connexion, ni synchronisation, ni génération de PDF
n'ont été exercées en conditions réelles. **Valide-la sur un compte de test avant
de la mettre entre les mains des stagiaires.**
