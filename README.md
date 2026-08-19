# Suivi ETG — CFPC Georges Hoareau

Application pédagogique de suivi de formation au permis de conduire.
Version **4.0** — Copyright © 2025 Haussmann Begue & Georges Hoareau — Tous droits réservés.

---

## Ce qu'il faut faire pour mettre en ligne

### 1. GitHub / Vercel — les 12 fichiers de la racine

Remplacez les fichiers à la racine du dépôt, poussez, Vercel redéploie seul.

```
git add . && git commit -m "v4.0 — barèmes par catégorie, lecture audio, parcours interactif" && git push
```

Puis **vérifiez la purge du cache** : ouvrir le site, F12 → *Application* → *Service Workers*
→ cocher « Update on reload » → recharger. Le cache doit afficher `etg-cache-v4`.

> À chaque mise en ligne future, incrémentez `CACHE_NAME` dans `sw.js`.
> C'est ce changement de nom, et lui seul, qui purge l'ancien cache sur les téléphones.

### 2. Supabase — un script à exécuter, cette fois

Contrairement à la v3.9, **il y a du SQL à passer** : la gestion des erreurs
éliminatoires demande de nouvelles colonnes.

1. Supabase → **SQL Editor** → *New query*
2. Coller `supabase/migration_02_examens.sql`
3. **Run** → attendu : `Success. No rows returned`

Ce script **ajoute** sept colonnes facultatives. Il ne modifie ni ne supprime
aucune donnée existante, et il est rejouable sans risque.

Si vous n'avez jamais exécuté `migration_01_index.sql`, passez-le aussi.
Détails dans `supabase/LISEZ-MOI.md`.

### 3. Facultatif — la fonction `admin-stagiaire`

Elle permet au formateur de **définir directement** le mot de passe d'un stagiaire.
Sans elle, tout le reste fonctionne, et le formateur envoie un lien de
réinitialisation par courriel (aucune installation requise).

```
supabase functions deploy admin-stagiaire --project-ref VOTRE_REF
```

Le code est dans `supabase/functions/admin-stagiaire/index.ts`. Même mécanisme que
la fonction `delete-stagiaire` déjà en service pour l'archivage.

---

## Contenu du dossier

### Racine du dépôt (servi par Vercel)

| Fichier | Rôle |
|---|---|
| `etg-cfpc-gh-v3.1.html` | **L'application entière** (nom de fichier volontairement inchangé) |
| `sw.js` | Service worker — `etg-cache-v4` |
| `manifest.json` | Manifeste PWA |
| `vercel.json` | Réécritures d'URL + en-têtes de cache |
| `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` | Icônes PWA |
| `apple-touch-icon.png`, `favicon.ico`, `favicon.svg` | Icônes iOS et navigateur |
| `README.md`, `COPYRIGHT.txt` | Documentation |

### Dossier `supabase/` (non servi par Vercel)

| Fichier | Rôle |
|---|---|
| `LISEZ-MOI.md` | Ce qu'il faut exécuter, et ce qu'il ne faut surtout pas |
| `schema.sql` | Schéma de référence — **déjà déployé, ne pas rejouer** |
| `migration_01_index.sql` | Index — une seule fois |
| `migration_02_examens.sql` | **Nouveau** — colonnes des résultats d'examen |
| `functions/admin-stagiaire/index.ts` | **Nouveau** — fonction Edge facultative |

---

## Pourquoi le fichier s'appelle toujours `v3.1`

C'est volontaire. Trois fichiers pointent vers ce nom exact — `manifest.json`
(`start_url`), `sw.js` (`APP_SHELL`), `vercel.json` (`destination`). Le renommer
casserait les applications **déjà installées** sur les téléphones des stagiaires :
leur raccourci pointe vers l'ancienne URL. La version réelle est inscrite dans
l'en-tête du fichier HTML.

---

## Ce qui change en 4.0

### Barèmes hors circulation — le correctif le plus important

L'application appliquait une règle unique à toutes les catégories :

```js
hors_circulation: { max: 27, seuil: 17 }
```

Les documents officiels du centre (`I17.04PG – V5 – 10/2025`) donnent des seuils
**différents selon la catégorie** :

| Catégorie | Bilan final | Ce que faisait l'application | Écart |
|---|---|---|---|
| C | > 16 pts → **17** | 17 | correct |
| D | > 16 pts → **17** | 17 | correct |
| CE | > 25 pts → **26** | 17 | **9 points trop bas** |
| BE | au moins **19** | 17 | **2 points trop bas** |

Un stagiaire CE à 18 points était déclaré admis par l'application alors qu'il
était ajourné. C'est désormais corrigé, et le barème est une table par catégorie,
pas une constante unique.

**Le nombre de points maximum n'est volontairement pas renseigné.** Les sources
publiques se contredisent (C : 14, 16 ou 20 selon les sites) et vos documents ne
donnent que le seuil. L'application affiche donc « 18 points — seuil 17 » plutôt
qu'un « /20 » invérifiable. Pour rétablir l'affichage en fraction, il suffit de
renseigner `max` dans la table `BAREME_HC` du fichier HTML.

### Erreurs éliminatoires

Vos documents énoncent la règle mot pour mot : *« il faut avoir obtenu un total
de points strictement supérieur à 16 **sous réserve de ne pas posséder de note
éliminatoire** et **avoir réussi l'exercice de maniabilité** »*.

Trois conditions cumulatives. L'application n'en testait qu'une.

Le formulaire de saisie demande maintenant séparément : les points obtenus, le
seuil requis (prérempli, modifiable), la présence d'une erreur éliminatoire, la
réussite de la maniabilité. Le résultat est calculé en direct **et** déclaré par
le stagiaire — l'application ne déclare jamais quelqu'un admis toute seule.

Cas de test livré : 18 points, seuil 17, erreur éliminatoire → **AJOURNÉ**.

### Épreuves par catégorie

- **B, TP CL** : ETG + Circulation
- **C, D, CE, BE et titres professionnels équivalents** : ETG + Hors circulation + Circulation

Un nouvel écran **« Mes résultats d'examen »** (menu latéral) montre au stagiaire
les épreuves de sa catégorie, toutes ses présentations passées, et lui permet
d'en déclarer une nouvelle après un ajournement. Chaque présentation est
numérotée et conservée — rien n'est jamais écrasé.

**Deux bogues corrigés côté formateur** : les résultats hors circulation des
stagiaires D, CE et BE n'apparaissaient nulle part (le bloc était conditionné à
la seule catégorie C), et les résultats de circulation d'un stagiaire B non plus,
alors qu'il pouvait les saisir.

### Lecture audio

La voix était choisie ainsi : *la première voix dont la langue commence par « fr »*.
Sur un iPhone où Amélie (fr-CA) précède Aurélie (fr-FR), c'est une voix
québécoise qui lisait le cours.

Les voix sont maintenant classées : fr-FR d'abord, les autres variantes
françaises loin derrière, jamais une voix non française. À langue égale, les voix
féminines connues passent devant les masculines, et les moteurs récents
(*natural*, *neural*, *premium*) devant les anciens.

Vérifié sur trois profils d'appareil : iPhone → Aurélie (au lieu d'Amélie),
Android → Google français, Windows → Hortense (au lieu de Paul).

S'y ajoutent : une vitesse réglable en cinq crans (0,88 par défaut), de vrais
contrôles lecture / pause / reprise / arrêt dans une barre flottante, un bouton
porté de 26 à 40 px avec cible tactile de 44 px, un état visuel « lecture en
cours », le découpage en phrases, et un écran de réglage (menu ▸ Lecture audio).

> **Ce qui reste impossible** : imposer la même voix sur tous les appareils. Le
> navigateur n'utilise que les voix installées sur le téléphone, et aucune page
> web ne peut en installer. Une voix identique partout supposerait un service de
> synthèse distant : coût récurrent, dépendance réseau, et fin du fonctionnement
> hors connexion.

### Cours ETG — parcours interactif

Le module affichait 2 100 caractères de prose continue par thème, quiz en fin de
parcours. C'était un manuel à l'écran.

Chaque thème est maintenant une suite d'étapes courtes :
**notion → illustration → question → correction → notion suivante**.

À chaque question, le stagiaire déclare sa certitude **avant** de voir la réponse.
C'est le mécanisme déjà au cœur de l'application pour les séries ETG — certitude
× exactitude — appliqué à l'apprentissage.

Les indicateurs conservés sont ceux qui mesurent l'apprentissage, pas des badges :

- **la série** — bonnes réponses d'affilée *en étant sûr* ;
- **les notions consolidées** — trois rappels réussis à des jours différents
  (Leitner à quatre boîtes, révisions à J+1, J+3, J+7, J+21) ;
- **la zone de risque** — ce que le stagiaire croyait savoir et qui était faux.
  C'est la liste de révision la plus rentable qui existe : sans elle, il ne
  reviendrait jamais sur ces notions.

L'ancien affichage reste accessible (« Relire les cours d'une traite ») : avant
l'examen, une relecture d'ensemble a son utilité.


### Dossier d'archivage du stagiaire

Jusqu'ici, archiver un stagiaire supposait de télécharger un à quatre PDF un par
un ; ils arrivaient en vrac sous des noms techniques, et le détail des séries
comme des tentatives d'examen disparaissait définitivement avec le compte.

Un seul bouton produit maintenant une archive complète, nommée d'après le
stagiaire :

```
Marc DUPONT - CE - du 15-01-2026 au 18-06-2026.zip
```

Elle contient : tous les bilans PDF numérotés, la fiche d'identité (catégorie,
épreuves, dates, résultat par épreuve), `Résultats des examens.csv` avec chaque
présentation et son motif d'ajournement, `Séries ETG.csv` avec l'historique
complet, l'avis du stagiaire, et un `LISEZ-MOI.txt` qui récapitule le contenu.

Les dates de début et de fin sont déduites des données réelles : première et
dernière trace d'activité, séries d'entraînement comme résultats d'examen.

Le téléchargement du dossier débloque le bouton de suppression définitive.

Deux points techniques : l'écriture du ZIP est faite dans l'application, sans
bibliothèque externe, pour ne pas ajouter de dépendance réseau à un outil qui
doit fonctionner hors connexion ; et les PDF ne sont pas régénérés — les
générateurs existants sont appelés tels quels, on intercepte seulement leur
téléchargement le temps de l'appel. Aucun document produit ne change.

**Bogue corrigé au passage** : les bilans exigés avant archivage étaient
conditionnés à la seule catégorie C. Un stagiaire D, CE ou BE pouvait donc être
supprimé sans que son bilan hors circulation ait jamais été téléchargé.

### Comptes

- Inscription : bouton œil pour afficher le mot de passe, **seconde saisie de
  contrôle**, vérification de concordance à chaque frappe. Une faute de frappe
  enfermait le stagiaire dehors sans recours.
- Connexion : bouton œil également.
- Fiche stagiaire côté formateur : **nom, catégorie et adresse modifiables**. Une
  catégorie choisie par erreur faussait auparavant tout le parcours (épreuves,
  barèmes, modules de révision) sans qu'on puisse la corriger.
- Mot de passe : définition directe si `admin-stagiaire` est déployée, sinon
  envoi d'un lien de réinitialisation.

### Écran de lancement et identité

La roue traverse le cadre de gauche à droite, dépose les trois barres du logo au
passage, dévoile le nom dans son sillage puis sort par la droite — en laissant
**une empreinte de pneu** sur la ligne de sol, qui s'efface quand elle quitte le
cadre. Fond marine. 1,75 s.

Le roulement est physiquement exact : la rotation est asservie à la distance
parcourue (un tour = π × diamètre), il n'y a aucun patinage à l'image.

Pour changer d'animation, une seule ligne à modifier dans le HTML :

```html
<div id="splash" class="sp-ov vb sp-sombre" ...>
```

`vb` = la roue (actuel) · `va` = les trois barres seules · `vc` = version sobre.
Retirer `sp-sombre` pour un fond blanc.

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

## Ce qui a été vérifié

Rendu Chromium, à 360, 768 et 1280 px de large :

- aucune erreur JavaScript au chargement ni sur les 12 écrans principaux ;
- aucun identifiant HTML dupliqué ;
- aucun débordement horizontal aux trois largeurs ;
- barèmes : 7 catégories × 3 épreuves contrôlées une à une ;
- calcul du résultat : 5 cas dont celui de votre exemple (18 pts, seuil 17,
  erreur éliminatoire → ajourné) ;
- lecture des lignes historiques (sans les nouvelles colonnes) : 8 cas ;
- classement des voix : 4 profils d'appareil ;
- double saisie du mot de passe : 4 états ;
- écran de lancement : capture image par image, retrait à 2,0 s, une seule fois
  par session.

**Ce qui n'a PAS été vérifié** : rien n'a tourné contre votre Supabase de
production. Ni connexion, ni synchronisation, ni génération de PDF n'ont été
exercées en conditions réelles. **Testez sur un compte de test avant les stagiaires.**
