# Version 4.4 — à déposer à la racine du dépôt GitHub

Copyright (c) 2025 Haussmann Begue & Georges Hoareau.

## ⚠️ Cette version demande un passage sur Supabase

Contrairement aux précédentes. Faites-le **avant** ou **juste après** la mise en
ligne, dans les deux cas l'application continue de fonctionner :

1. Supabase → **SQL Editor** → **New query**
2. Collez le contenu de `supabase/migration_03_consignes.sql`
3. **Run**
4. Vous devez voir **5 lignes, toutes « OK »**

Sans ce script, tout marche sauf les consignes du formateur : l'application le
dit clairement au lieu de tomber en panne.

## Puis, comme d'habitude

Ouvrir le site → F12 → **Application** → **Service Workers** → « Update on
reload » → recharger. Le cache doit afficher **`etg-cache-v8`**.

## Et surtout : la bonne adresse

**`application-etg-cfpc-gh.vercel.app`**

C'est celle-ci qu'il faut mettre en favori et donner aux stagiaires. Les
adresses du type `...-c0suth0rv-salle-code.vercel.app` sont figées sur un
déploiement précis et ne se mettront jamais à jour.

---

## 1. Le menu affichait deux fois « Tableau de bord »

Défaut introduit le 20/08/2026 : l'entrée était posée à deux endroits, dans le
fichier de navigation et dans le correctif de l'espace formateur. Mon contrôle
de doublons ne regardait que les identifiants HTML, or les entrées de menu n'en
portent pas. **Le contrôle manquant a été ajouté** : le script refuse désormais
de produire un fichier où deux entrées de menu porteraient le même identifiant.
Il en compte 22, aucune en double.

## 2. L'espace stagiaire, conforme à la maquette

### Écran « Aujourd'hui » — le nouvel écran d'arrivée

- **La consigne du formateur en tête.** Elle y reste tant que le stagiaire ne
  l'a pas marquée comme lue.
- **Une seule action**, choisie selon une priorité fixe : une série commencée
  et non terminée → la reprendre ; aucune série aujourd'hui → en faire une ;
  la série du jour est faite → réviser ses erreurs. Proposer trois choses à
  faire, c'est demander à quelqu'un qui doute de choisir.
- **« Ensuite »** : la révision ciblée sur son type d'erreur dominant, ses
  fiches hors circulation, ses résultats d'examen.

La révision ciblée n'est pas décorative : elle nomme le type d'erreur qui pèse
le plus lourd dans son calcul de préparation — connaissance, compréhension ou
concentration — avec le pourcentage réel et le bon remède pour chacun.

### Trois onglets, comme prévu

**Aujourd'hui · Réviser · Où j'en suis**, plus l'accès au menu complet.
« Où j'en suis » est l'ancien écran d'accueil, inchangé : les chiffres n'ont pas
disparu, ils ont simplement cessé d'être la première chose qu'on voit.

### Les consignes, côté formateur

Dans la fiche d'un stagiaire, un bloc **Consignes** : le champ pour écrire, une
étiquette facultative (« Distances », « Méthode »…), et l'historique de ce qui a
été envoyé — avec la mention **lue / pas encore lue**.

**Un mot sur la sécurité de cette table.** Le stagiaire lit ses consignes, il
n'a aucun droit d'écriture dessus. Lui donner le droit de mettre à jour ses
propres lignes — même dans la seule intention de le laisser marquer une
consigne comme lue — lui aurait aussi permis d'en réécrire le texte. Le
marquage passe donc par une fonction dédiée côté base, qui ne touche qu'à la
date de lecture. **Vérifié sur un vrai PostgreSQL** : un stagiaire qui tente de
réécrire sa consigne obtient 0 ligne modifiée, et qui tente de marquer celle
d'un camarade obtient un résultat vide.

## 3. Les séries en double — la cause, et la fin

37,7 % de votre table. J'ai remonté trois causes et je les traite toutes :

| Cause | Correctif |
|---|---|
| Le bouton « Enregistrer » restait actif pendant l'envoi | Il se verrouille et affiche « Enregistrement… » |
| La série n'avait aucun identifiant propre | Chaque série reçoit le sien dès sa création et le garde |
| Le renvoi hors ligne relançait un enregistrement **déjà réussi** | Un refus pour identifiant déjà présent vaut désormais réussite |

Le troisième était le plus pervers : si le serveur enregistre mais que la
réponse se perd en route — exactement ce qui arrive quand le réseau revient et
reste instable — l'application croyait à un échec et renvoyait la série.

**Votre base était déjà prête.** La colonne `client_uid` et son index unique
existent depuis le script d'origine ; c'est l'application qui ne les utilisait
pas. Le script de cette version ne fait donc que vérifier leur présence : poser
un second index identique aurait doublé le travail d'écriture à chaque série.

### Un défaut trouvé grâce au vrai PostgreSQL

`client_uid` est de type **uuid**. Ma première version générait, sur les
navigateurs sans `crypto.randomUUID` — Safari avant 15.4, Android anciens — une
chaîne aléatoire quelconque, que PostgreSQL aurait refusée : *invalid input
syntax for type uuid*. **Sur ces appareils, plus aucune série n'aurait pu être
enregistrée.** Corrigé : la composition de secours produit un UUID version 4 en
bonne et due forme. Vérifié sur 20 000 tirages sans aucun générateur
cryptographique : 20 000 UUID valides, 20 000 distincts.

---

## Ce qui a été vérifié

**Base de données, sur un vrai PostgreSQL 16**

- script rejoué **3 fois de suite** : 5 contrôles sur 5 en « OK » à chaque
  passage, aucune erreur ;
- **10 tests de sécurité**, tous conformes : le formateur écrit et lit tout ; le
  stagiaire ne voit que ses propres consignes ; il ne peut ni en créer, ni en
  réécrire, ni en supprimer ; il peut marquer la sienne comme lue et pas celle
  d'un autre ; l'index unique refuse bien un second envoi du même identifiant ;
  les lignes anciennes sans identifiant continuent de coexister.

**Application, sur le banc**

- 9 largeurs × 2 rôles : aucun débordement, aucune erreur JavaScript, aucun
  identifiant HTML dupliqué ;
- **40 écrans enchaînés** à 1440 px et à 390 px : 40 sur 40 ;
- atteignabilité des contenus : **16/16** entrées pour la catégorie C, **11/11**
  pour la B, à 1920 / 1024 / 768 / 390 px.

## Ce qui reste ouvert

- Le nettoyage des 377 doublons déjà présents. Il n'est **pas** dans ce script :
  supprimer des données doit être une décision, pas un effet de bord. Vos
  statistiques sont justes malgré eux, l'application les ignore à la lecture.
  Dites-moi si vous voulez ce script de nettoyage.
- Signalés lors de l'audit et non traités : la reprise silencieuse d'une erreur
  de chargement dans `loadFCState`, l'archivage possible sur un PDF vide,
  `window._S` non purgé à la déconnexion, les scripts externes chargés sans
  empreinte d'intégrité.
