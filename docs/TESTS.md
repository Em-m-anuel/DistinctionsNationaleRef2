# Tests

Exécution : `npm test` (`node --test tests/*.cjs`). Pas de navigateur, pas de dépendance npm runtime.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `tests/smoke.cjs` | Couverture `ROLE_CONFIGS.nav`, header sticky, hero, calendrier chef, isolation admin, portails |
| `tests/cf.cjs` | Magasin et parcours, écrans sans modale, localisation, Ctrl+K |
| `tests/complement.cjs` | Acceptances (menus demandeur/personne, wizard, secrétariat) |
| `tests/portal.cjs` | Contrats de présentation locale |
| `tests/harmonisation.cjs` | Menus et pouvoirs A–H, visa, suivi agent, calendrier, secrétariat |

Les scripts chargent `js/views/internal-portal.js` **avant** `js/cf-app.js`, comme `index.html`.

## Contrats visuels à préserver

- `ws-header`, `sticky`, `ws-tabs`, `class="ws-hero ws-appear"`
- `data-ws-content`, `<h1>`, `/Profil et paramètres/`
- Admin : pas de `Localisation physique` ni `wsTransmissions` sur l’accueil
- Chef `ceremonies` → `ws-calendar` / `ws-calendar-grid` + `is-today`
- Intern : pas de `MODE DÉMONSTRATION` / `Données fictives à usage`
- Login conserve « Explorer la démonstration »

## Contrôle manuel

1. Connexion, un compte par rôle.
2. DR : dossier = identité + circuit + pièces + zone visa.
3. Agent : relances / recours sans Accepter ; brouillon de délégation.
4. Chef : calendrier, proposition de lieu (schéma, pas photo).
5. Secrétariat : enregistrer / transmettre uniquement.
6. Réduire la fenêtre : header, onglets, bouton haut.
7. `prefers-reduced-motion`.

## Hors périmètre

Ne pas reposer `8dd2237`. Ne pas exécuter `npm run css` sans besoin.
