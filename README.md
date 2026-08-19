# Suivi ETG — CFPC Georges Hoareau

Application pédagogique de suivi de formation au permis de conduire.
Version **3.9** — Copyright © 2025 Haussmann Begue & Georges Hoareau — Tous droits réservés.

---

## Réponse courte à la question SQL

**Non, il n'y a rien à modifier dans le SQL de Supabase.**

Tout ce qui a été livré depuis la dernière mise en ligne est côté navigateur :

- le déclenchement du diagnostic à **4 jours** est une fonction JavaScript (`diagMinJ`).
  Les trois colonnes qu'elle utilise — `diag_start`, `diag_trigger`, `diag_triggered_at` —
  **existent déjà** dans votre base (voir `supabase/schema.sql`, section 2 bis) ;
- l'écran de lancement animé, les icônes et les logos sont du HTML, du CSS et des images ;
- les jauges affichées au stagiaire sont calculées à partir de données déjà stockées,
  aucune colonne nouvelle n'est nécessaire.

Le seul fichier SQL à exécuter reste `supabase/migration_01_index.sql`, déjà fourni
la dernière fois. **Si vous l'avez déjà passé, ne faites rien du tout côté Supabase.**
Si vous ne l'avez pas encore passé, il ne crée que des index : il ne lit, ne modifie
et ne supprime aucune donnée, et il est rejouable sans risque.

---

## Contenu du dossier

### À déposer à la racine du dépôt GitHub

| Fichier | Rôle | Nouveau en 3.9 |
|---|---|---|
| `etg-cfpc-gh-v3.1.html` | **L'application entière** (HTML + CSS + JS + contenus) | mis à jour |
| `sw.js` | Service worker : cache hors ligne — `etg-cache-v3` | mis à jour |
| `manifest.json` | Manifeste PWA (installation sur l'écran d'accueil) | mis à jour |
| `vercel.json` | Réécritures d'URL + en-têtes de cache | mis à jour |
| `icon-192.png` | Icône PWA 192×192 | **refaite** |
| `icon-512.png` | Icône PWA 512×512 | **refaite** |
| `icon-512-maskable.png` | Icône adaptative Android (masques ronds) | **nouveau** |
| `apple-touch-icon.png` | Icône iOS 180×180 | **refaite** |
| `favicon.ico` | Onglet de navigateur (16/32/48) | **nouveau** |
| `favicon.svg` | Onglet, version vectorielle | **nouveau** |
| `README.md`, `COPYRIGHT.txt` | Documentation | mis à jour |

### À ne pas déposer sur Vercel

| Fichier | Rôle |
|---|---|
| `supabase/schema.sql` | Schéma de référence, **déjà déployé** — archive uniquement |
| `supabase/migration_01_index.sql` | Index — à exécuter **une seule fois** |
| `supabase/LISEZ-MOI.md` | Ce qu'il faut faire, et surtout ne pas faire, côté base |

Le dossier `supabase/` peut rester dans le dépôt : Vercel ne le sert pas
(la règle de réécriture renvoie toute URL inconnue vers l'application).

---

## Mise en ligne — GitHub et Vercel, pas à pas

1. Ouvrir le dépôt GitHub du projet.
2. Remplacer les fichiers de la racine par ceux de ce dossier
   (glisser-déposer dans l'interface GitHub, ou `git add . && git commit && git push`).
3. Vercel redéploie tout seul en une minute environ.
4. **Vérifier la purge du cache.** Ouvrir le site, puis F12 → onglet *Application*
   → *Service Workers* → cocher « Update on reload » → recharger.
   Le cache affiché doit être `etg-cache-v3`.

Message de commit suggéré :

```
v3.9 — écran de lancement animé, icônes et logos aux couleurs officielles
```

### La règle à ne jamais oublier

À **chaque** mise en ligne future, incrémenter `CACHE_NAME` dans `sw.js`
(`etg-cache-v3` → `etg-cache-v4`, etc.). C'est ce changement de nom, et lui seul,
qui purge l'ancien cache. Sans lui, les téléphones déjà équipés continueront
d'afficher l'ancienne version, parfois pendant des semaines.

### Pourquoi le fichier s'appelle toujours `v3.1`

C'est **volontaire**. Trois fichiers pointent vers ce nom exact :

- `manifest.json` → `"start_url": "/etg-cfpc-gh-v3.1.html"`
- `sw.js` → `const APP_SHELL = '/etg-cfpc-gh-v3.1.html'`
- `vercel.json` → `"destination": "/etg-cfpc-gh-v3.1.html"`

Le renommer casserait les applications **déjà installées** sur les téléphones des
stagiaires : leur raccourci pointe vers l'ancienne URL. La version réelle est
inscrite dans l'en-tête du fichier HTML.

---

## Mise en ligne — Supabase

Voir `supabase/LISEZ-MOI.md`. En une phrase : **rien à faire**, sauf si
`migration_01_index.sql` n'a jamais été exécuté.

---

## Ce qui change en 3.9

### Écran de lancement animé

Au démarrage, le logo du centre se construit à l'écran. Trois animations sont
embarquées dans le fichier ; celle qui joue est décidée par une seule classe
CSS, en tête du `<body>` :

```html
<div id="splash" class="sp-ov va sp-sombre" ...>
```

- `va` — **par défaut.** Les trois barres traversent l'écran et se calent net ;
  le nom se dévoile dans leur sillage. 1,60 s.
- `vb` — La roue traverse l'écran, dépose les barres au passage et dévoile le nom
  dans son sillage avant de sortir. 1,75 s.
- `vc` — Version sobre : le logo se pose, la ligne axiale défile puis s'immobilise. 1,45 s.

Retirer `sp-sombre` pour un fond blanc au lieu du fond marine.
**Aucun autre changement n'est nécessaire** : les trois variantes et les deux fonds
sont déjà dans le fichier.

Garanties : un appui coupe l'animation ; elle n'apparaît qu'une fois par session ;
elle se retire au plus tard au bout de 3,5 s même si le démarrage échoue ;
`prefers-reduced-motion` est respecté (fondu de 0,25 s, aucun déplacement) ;
tout est embarqué dans le fichier, donc l'écran fonctionne hors connexion.

### Icône de l'application

Le monogramme « GH » est remplacé par les trois barres inclinées du logo.
Deux raisons : les initiales n'appartiennent à personne (toutes les auto-écoles
en ont), et à 48 px sur un écran d'accueil chargé, le G et le H se referment et se
confondent. Les trois barres restent lisibles à 32 px et rattachent l'icône à
l'enseigne que les stagiaires voient déjà sur la façade et les véhicules.

Le fond marine de l'icône est désormais **le même** que `background_color` du
manifeste et que le fond de l'écran de lancement : l'écran système affiché par
Android et iOS pendant l'ouverture et l'écran animé se succèdent sans rupture.

### Logos affichés dans l'application

Le fichier embarquait deux fois une image de logo qui **n'était pas aux couleurs
de la charte** : cyan `#6CB4E8` au lieu de `#3BC4F2`, marine plus clair.
Les deux sont remplacées par le logo officiel.

Le bandeau supérieur posait en outre un problème de lisibilité : son fond est
marine, or l'image contenait une barre marine et une baseline noire — invisibles
toutes les deux. Il reçoit maintenant un **verrouillage réduit** (barres + nom,
sans baseline, troisième barre en blanc), qui est la pratique courante en identité
visuelle pour les petites tailles.

Effet secondaire : le fichier perd **46 Ko**, les images officielles étant
mieux optimisées que celles qu'elles remplacent.

---

## Rappel de ce qui avait changé en 3.7 et 3.8

**Sécurité.** Une faille d'injection HTML stockée corrigée : le nom et l'adresse
e-mail saisis à l'inscription étaient insérés sans échappement dans quatre écrans,
dont la liste des stagiaires côté formateur.

**Contenus.** Neuf écarts corrigés face aux documents du centre, dont trois valeurs
chiffrées fausses en catégorie C : alcoolémie marchandises (0,50 g/l et non 0,20),
périodicité du contrôle technique (12 mois et non 6), profondeur des rainures poids
lourd (1 mm et non 1,6).

**Accessibilité.** Palette recalculée (19 couples de contraste vérifiés), champs de
saisie portés de 19 à 44 px, focus clavier visible, annonce des changements d'écran
pour les lecteurs d'écran, points de rupture tablette et ordinateur.

**Phase de diagnostic.** Seuil unifié à **4 jours de formation pour toutes les
catégories** (auparavant 6 jours pour le groupe VL, 4 pour le groupe lourd).
Les dossiers dont le `diag_start` est déjà enregistré ne sont pas modifiés.

**Module Cours ETG.** Dix thématiques avec cartes mentales, schémas, tableaux de
synthèse, 60 flashcards et 33 questions d'auto-évaluation.
Menu ▸ ETG ▸ Cours.

**Module Panneaux.** 43 panneaux classés par famille, avec entraînement à la
reconnaissance. Menu ▸ ETG ▸ Panneaux.

---

## Points restant à traiter

Signalés dans l'audit et **non corrigés**, car le correctif touche le chemin
d'écriture en base et doit être testé sur un compte réel :

1. **Écrasement de progression** — une coupure réseau au chargement fabrique une
   progression vierge, l'affiche, puis l'écrit en base. Perte définitive possible.
2. **Archivage sur PDF vide** — un bilan généré sur incident réseau déverrouille
   quand même la suppression définitive d'un stagiaire.
3. **`window._S` non purgé à la déconnexion** — données du formateur précédent
   encore en mémoire sur tablette partagée.
4. **CDN sans attribut `integrity`** sur Chart.js et jsPDF.

---

## Avertissement

Cette version a été vérifiée au rendu (Chromium, capture image par image de
l'écran de lancement, contrôle des icônes de 512 à 32 px, absence d'erreur
JavaScript au chargement), mais **jamais contre le backend Supabase de
production** : ni connexion, ni synchronisation, ni génération de PDF n'ont été
exercées en conditions réelles. **Testez-la sur un compte de test avant de la
mettre entre les mains des stagiaires.**
