# Déploiement Vercel — TalentTrace

## Pourquoi on a eu des 404
- Vercel servait uniquement l’API (Express), pas le HTML statique.
- La racine `/` pointait vers un `index.html` ancien.
- Le fichier principal `cv-analyzer-standalone.html` n’était pas pris en charge comme fichier statique.

## Solution retenue
1. Forcer Vercel à **servir le HTML statique**.
2. Rediriger **`/` → `cv-analyzer-standalone.html`**.
3. Garder l’API Express pour l’analyse (routes `/api/*`).

## Fichiers clés
- `vercel.json` : routing et builds Vercel.
- `api/index.js` : entrypoint serverless.
- `server.js` : Express exporté (sans `listen` en Vercel).
- `cv-analyzer-standalone.html` : UI principale.
- `index.html` : redirection vers `cv-analyzer-standalone.html`.

## Déploiement (pas à pas)
1. Pousser le repo sur GitHub.
2. Créer un projet Vercel depuis ce repo.
3. Ajouter la variable d’environnement :
   - `ANTHROPIC_API_KEY` (clé API Anthropic)
4. Déployer.

## URL finales
- Page principale :
  - `https://<projet>.vercel.app/`
- Page explicite :
  - `https://<projet>.vercel.app/cv-analyzer-standalone.html`

## Checklist si 404
- Vérifier que **`vercel.json`** est bien au root du repo.
- Vérifier que `cv-analyzer-standalone.html` est bien au root.
- Vérifier que `index.html` redirige vers `cv-analyzer-standalone.html`.
- Redeploy sur Vercel.

