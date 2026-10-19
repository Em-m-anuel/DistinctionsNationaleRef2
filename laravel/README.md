# MEDITRA — couche Laravel 12

Dossier **généré** par `tools/build-laravel.mjs` depuis le site multipage
(`js/site-config.js`, `js/views/internal-portal.js`, `css/`, `js/`, `assets/`).
Ne pas modifier les vues à la main : relancer la génération.

```bash
node tools/build-laravel.mjs   # régénère vues, config, routes, assets
npm test                       # 163 tests, dont 24 pour cette couche
```

## Contenu

| Dossier | Contenu |
| --- | --- |
| `resources/views/layouts/` | 4 layouts : `base`, `app` (espaces), `auth`, `public` |
| `resources/views/components/` | 22 composants : en-tête, navigation, notifications, menu de compte, fil d'Ariane, en-tête de page, toasts, overlays, sprite, assets… |
| `resources/views/pages/` | accueil, connexion, inscription, erreurs 403/404 |
| `resources/views/profiles/` | 72 vues, une par page métier |
| `config/meditra.php` | familles, pages, titres, menus, rôles, ordre des scripts |
| `routes/web.php` | 76 routes GET + 4 POST |
| `app/` | contrôleurs, `Support/Meditra`, fournisseur de vues |
| `public/` | CSS, JS (ordre d'origine), assets |
| `CORRESPONDANCE_URLS.md` | tableau URL ↔ route ↔ vue |

## À lire avant d'installer

1. **`../INSTALLATION_LARAVEL.md`** — copie des fichiers, provider, `.env`,
   routes, première exécution, dépannage.
2. **`../INTEGRATION_BACKEND.md`** — authentification, autorisation, données
   métier, actions à transformer en API.
3. **`../FONCTIONNALITES_LARAVEL.md`** — ce qui est préservé, adapté, bloqué.

## Ce que Blade rend déjà

Chaque URL renvoie un document complet : `<head>`, en-tête, navigation
(`route()`), fil d'Ariane, `h1`, sous-titre, repère de chargement, pied de page,
scripts. Les données métier (listes, tableaux, formulaires) sont encore
hydratées par le prototype JavaScript — voir `INTEGRATION_BACKEND.md`.

Aucune dépendance front n'est requise : pas de Vite, pas de framework SPA.
