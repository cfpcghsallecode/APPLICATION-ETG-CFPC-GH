# À déposer à la racine de votre dépôt GitHub — version 4.1

Copyright (c) 2025 Haussmann Begue & Georges Hoareau.

**Supabase : rien à faire.** Aucune colonne, aucune table, aucune règle n'a changé
depuis la 4.0 que vous avez déjà passée.

## Les 11 fichiers

Déposez-les à la **racine** du dépôt (pas dans un sous-dossier) : GitHub remplace
ceux qui existent déjà. Vercel redéploie tout seul.

## Puis, impérativement

Ouvrir le site → F12 → onglet **Application** → **Service Workers** → cocher
« Update on reload » → recharger. Le cache doit afficher **`etg-cache-v5`**.

Sans cette étape, les téléphones déjà équipés garderont l'ancienne version.

## Ce qui change en 4.1

**La coquille responsive.** Une seule règle bridait toute l'application :
`.as{max-width:520px}`. Sur un écran de 1440 px le contenu occupait 520 px,
soit 36 % de la surface, et la navigation restait un tiroir hamburger.

Trois architectures distinctes remplacent cette taille unique :

| Écran | Navigation | Part de l'écran utilisée |
|---|---|---|
| moins de 700 px | barre d'onglets en bas + tiroir | 100 % |
| 700 à 899 px | rail permanent, icône + libellé | 89 % |
| 900 à 1199 px | menu latéral déplié | 75 % |
| 1200 px et plus | menu latéral déplié | **82 %**, jusqu'à 1240 px de contenu |

Le menu latéral est construit selon le rôle et la catégorie. Un stagiaire de
catégorie C voit : Accueil, Saisir une série, Historique, Mes résultats d'examen,
puis « Apprendre » (Cours ETG, Panneaux), « Hors circulation » (Fiches 200
questions, Circulation), « Réglages » (Lecture audio).

Sous 700 px, quatre onglets au pouce — Accueil, Série, Résultats, Cours — plus
l'accès au menu complet.

**Les voix.** Jusqu'à 2 voix féminines et 2 masculines, étiquetées Féminine /
Masculine / Naturelle, avec un bouton d'écoute par voix : on essaie avant
d'adopter, et le réglage ne change que si on coche.

**Le logo de lancement.** Empreinte de pneu retirée, défilement ralenti de
1,45 à 1,90 s, temps de pause de 0,6 s avant l'écran de connexion.

**Le mot de passe.** L'icône œil était un emoji — un singe en couleur à l'état
révélé. C'est maintenant un dessin vectoriel, identique sur tous les systèmes.

## Ce qui reste à faire

La coquille est en place, le **contenu** des écrans est encore dessiné pour
520 px. Sur grand écran, l'accueil du stagiaire étale ses quatre chiffres au lieu
de les regrouper, et le tableau de bord formateur « Prêts à présenter ? » de la
maquette n'existe pas encore. C'est l'étape suivante.

## Ce qui a été vérifié

À 1440, 1024, 768 et 390 px, dans les deux rôles :
12 écrans sur 12 rendus, aucune erreur JavaScript, aucun débordement
horizontal, aucun identifiant HTML dupliqué.
