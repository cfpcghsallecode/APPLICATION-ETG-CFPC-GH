# À déposer à la racine de votre dépôt GitHub

Version 4.0 — Copyright (c) 2025 Haussmann Begue & Georges Hoareau.

Supabase est déjà à jour. Il ne reste que ces fichiers, tous à la **racine**
du dépôt (pas dans un sous-dossier).

| Fichier | État | À faire |
|---|---|---|
| `etg-cfpc-gh-v3.1.html` | MODIFIÉ | remplacer l'ancien |
| `sw.js` | MODIFIÉ | remplacer l'ancien |
| `manifest.json` | MODIFIÉ | remplacer l'ancien |
| `vercel.json` | MODIFIÉ | remplacer l'ancien |
| `icon-192.png` | MODIFIÉ | remplacer l'ancien |
| `icon-512.png` | MODIFIÉ | remplacer l'ancien |
| `icon-512-maskable.png` | NOUVEAU | ajouter |
| `apple-touch-icon.png` | MODIFIÉ | remplacer l'ancien |
| `favicon.ico` | NOUVEAU | ajouter |
| `favicon.svg` | NOUVEAU | ajouter |
| `COPYRIGHT.txt` | NOUVEAU | ajouter |

---

## La marche à suivre

1. Ouvrir votre dépôt sur **github.com**
2. **Add file** → **Upload files**
3. Glisser les 11 fichiers ci-dessus d'un seul coup
4. En bas : message de commit, par exemple
   `v4.0 — barèmes par catégorie, lecture audio, parcours interactif`
5. **Commit changes**

GitHub remplace automatiquement les fichiers de même nom. Vercel redéploie
tout seul dans la minute qui suit.

---

## L'étape à ne pas oublier

Après le déploiement, **vérifiez la purge du cache** :

1. Ouvrir le site
2. F12 → onglet **Application** → **Service Workers**
3. Cocher « **Update on reload** »
4. Recharger la page
5. Le cache affiché doit être **`etg-cache-v4`**

Sans cette vérification, les téléphones déjà équipés continueront d'afficher
l'ancienne version pendant des jours : c'est le changement de nom du cache,
et lui seul, qui déclenche la purge.

> Pour chaque mise en ligne future, pensez à incrémenter `CACHE_NAME` dans
> `sw.js` (`etg-cache-v4` → `etg-cache-v5`, etc.).

---

## Pourquoi le fichier s'appelle toujours `v3.1`

C'est volontaire. `manifest.json`, `sw.js` et `vercel.json` pointent tous les
trois vers ce nom exact. Le renommer casserait les applications **déjà
installées** sur les téléphones des stagiaires : leur raccourci pointe vers
l'ancienne URL. La version réelle est inscrite dans l'en-tête du HTML.
