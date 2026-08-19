# À déposer à la racine de votre dépôt GitHub — version 4.2

Copyright (c) 2025 Haussmann Begue & Georges Hoareau.

**Supabase : rien à faire.** Aucune colonne, aucune table, aucune règle n'a changé
depuis la 4.0 que vous avez déjà passée.

## Les 11 fichiers

Déposez-les à la **racine** du dépôt (pas dans un sous-dossier) : GitHub remplace
ceux qui existent déjà. Vercel redéploie tout seul.

## Puis, impérativement

Ouvrir le site → F12 → onglet **Application** → **Service Workers** → cocher
« Update on reload » → recharger. Le cache doit afficher **`etg-cache-v6`**.

Sans cette étape, les téléphones déjà équipés garderont l'ancienne version.

---

## 1. Le défaut que vous avez photographié

Votre capture montrait l'espace formateur occupant 760 px au milieu d'un écran
de 1900 px. La cause est une deuxième bride que la version 4.1 avait manquée.

La feuille de style d'origine en contient **deux** :

```css
.as    { max-width: 520px }   /* toute l'application */
.as.wd { max-width: 760px }   /* + la classe "wd", posée par enterApp()
                                 uniquement pour le rôle formateur */
```

La 4.1 ne levait que la première. `.as.wd` compte deux classes contre une : sa
spécificité est supérieure, elle l'emportait donc même à l'intérieur d'une
requête d'écran. Résultat : l'espace **stagiaire** s'étalait correctement,
l'espace **formateur** restait bloqué à 760 px. Mesuré sur votre capture :
menu 246 px + contenu 512 px = 758 px.

Les deux brides sont maintenant levées, ainsi que celle du bandeau hors-ligne
(`.offbar.wd`), qui s'affichait en timbre-poste au milieu de l'écran.

Le script de construction refuse désormais de produire un fichier où l'une des
deux ne serait pas neutralisée — cette régression ne peut plus repasser
inaperçue.

### Largeur réellement occupée par le contenu, espace formateur

| Fenêtre | Avant (4.1) | Après (4.2) |
|---|---|---|
| 1920 px | 760 px | **1920 px** — contenu 1400 px |
| 1600 px | 760 px | **1600 px** — contenu 1348 px |
| 1440 px | 760 px | **1440 px** — contenu 1188 px |
| 1280 px | 760 px | **1280 px** — contenu 1028 px |
| 1024 px | 760 px | **1024 px** — contenu 772 px |
| 390 px | 390 px | 390 px (inchangé) |

---

## 2. Le tableau de bord formateur

C'est l'écran « Prêts à présenter ? » de la maquette. Il devient l'écran
d'accueil du formateur : la première question du matin est « qui est prêt ? »,
pas « qui est inscrit ? ».

Il contient :

- **quatre chiffres clés** : stagiaires suivis, prêts à présenter, profils à
  risque, et *prêts sans date d'examen déclarée* ;
- **la répartition du groupe** en une bande de proportions ;
- **les alertes à traiter en priorité** ;
- **trois colonnes** — Prêts / En progression / Profil à risque — chaque
  stagiaire portant son composite, sa catégorie, son nombre de jours, son
  dernier score, sa tendance et sa courbe de progression. Un clic ouvre la fiche.

### Les alertes sont calculées, pas écrites d'avance

Dans la maquette, « Karim Benali — 11 erreurs de connaissance » était un exemple
tapé à la main pour montrer la forme. Ici, chaque alerte sort de vos données :

| Alerte | Déclencheur |
|---|---|
| Erreurs de connaissance dominantes | qualité des erreurs < 40/100 sur les 5 dernières séances |
| Se surestime | fiabilité < 50/100 |
| Ajourné, sans reprise | résultat en échec + plus de 10 jours sans séance |
| Sans séance depuis… | plus de 21 jours d'inactivité |
| Prêt et sans date | niveau vert + aucun résultat d'examen déclaré |

Chaque alerte nomme le stagiaire, affiche le chiffre qui la déclenche, dit quoi
en faire, et s'ouvre sur sa fiche d'un clic. Deux alertes au maximum par
famille : cinq fois le même motif n'apprend rien de plus que deux fois et
masquerait les autres.

### Aucun calcul pédagogique n'a été réécrit

Le classement s'appuie sur le composite que l'application produisait déjà
(performance 25 % · fiabilité 25 % · qualité des erreurs 50 %, fenêtre des
5 dernières séances, pire séance écartée). La seule modification apportée à
`readiness()` est qu'elle **renvoie en plus** sa valeur chiffrée et ses trois
composantes. Le niveau et le libellé ne changent pas d'un iota, et aucun des
écrans qui l'utilisaient déjà n'est affecté.

---

## 3. La liste des stagiaires

Elle était une pile de cartes conçue pour le pouce : 48 stagiaires, 48 cartes à
faire défiler, aucune comparaison possible. Elle devient :

- **un tableau dense et triable à partir de 1000 px** — nom, jours, séances,
  dernier score, tendance, courbe, composite, statut, résultat d'examen. Toutes
  les colonnes chiffrées se trient d'un clic sur leur en-tête ;
- **des cartes en dessous de 1000 px**, comme aujourd'hui.

Quand la largeur manque, les colonnes s'effacent **par ordre inverse d'utilité**
(courbe, puis jours, puis tendance, puis séances) plutôt que de déborder ou
d'imposer un défilement horizontal. Ne disparaissent jamais : le nom, le dernier
score, le composite, le statut et le résultat d'examen.

**Les filtres tiennent maintenant sur une bande** au lieu de quatre cartes
empilées. Sur votre capture, il fallait faire défiler 400 px de formulaire avant
d'apercevoir le premier stagiaire.

---

## Ce qui a été vérifié

**Mesures de rendu** — Chromium, 9 largeurs (1920, 1600, 1440, 1280, 1152, 1024,
900, 768, 390 px), les deux rôles, sur une base simulée de 48 stagiaires,
1 100 séries et leurs 40 questions :

- largeur occupée conforme au tableau ci-dessus, à chaque largeur ;
- **aucun débordement horizontal**, aucun défilement latéral ;
- **aucune erreur JavaScript**, aucun identifiant HTML dupliqué ;
- le tableau ne dépasse jamais son cadre : débordement mesuré à 0 px partout
  (le premier essai débordait de 194 px à 1024 px — corrigé avant livraison).

**Parcours écran par écran** — 34 écrans enchaînés à 1440 px et à 390 px dans
les deux rôles : tableau de bord, liste, les trois tris, fiche stagiaire,
statistiques, accueil, saisie de série, historique, mes résultats, cours ETG,
panneaux, lecture audio. **34 sur 34 rendus, aucun en défaut.**

---

## Ce qui reste à faire

Le **contenu** de certains écrans stagiaire est encore dessiné pour 520 px :
sur grand écran, l'accueil du stagiaire étale ses quatre chiffres au lieu de les
regrouper. L'espace formateur, lui, est fait.

Restent aussi ouverts, signalés lors de l'audit et non traités à ce jour :
la reprise silencieuse d'une erreur de chargement dans `loadFCState`,
l'archivage possible sur un PDF vide, `window._S` non purgé à la déconnexion,
et les scripts externes chargés sans empreinte d'intégrité.
