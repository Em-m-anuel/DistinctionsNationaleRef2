# État du projet — frontend de démonstration

Date de référence : **14 octobre 2026**.

## Ce qui est livré

Application **HTML / CSS / JavaScript pur** (pas de React à l’exécution). Routage par hash `#/app/<role>/<page>`.

- Accueil public, connexion / inscription / OTP / mot de passe oublié (parcours frontend).
- 14 comptes de démonstration (`DEMO_ACCOUNTS.md`), mot de passe `Demo123!`.
- 13 rôles applicatifs (entreprise et ministère partagent `demandeur`).
- Espaces internes (secrétariats, autorités, services, régisseur, admin) via `js/views/workspace.js` / `admin.js`.
- Portails Demandeur et Personne via `js/views/portals.js` + modules `js/views/portal-extras.js`.
- Magasin unique `js/demo-store.js` (`DemoStore`) pour les données Demandeur.

## Modules Demandeur (complément)

| Module | Routes | Doc |
|---|---|---|
| Employés | `employees`, `employee-new`, `employee-stats` | `EMPLOYEES.md` |
| Distinctions | `distinctions` | `DISTINCTIONS.md` |
| Finance | `payments` | `FINANCE.md` |
| Cérémonies | `ceremony-request`, `ceremony-calendar`, `ceremonies` | `CEREMONIES.md` |

Menus déroulants (Dossiers / Employés / Cérémonies) : clavier (Entrée, Espace, Échap) et mobile.

## Design

- Valeurs extraites de `css/theme.css` — pas d’identité inventée.
- Planche : `docs/design-reference.html`.
- Synthèse : `DESIGN_SYSTEM.md`.
- Dossier d’accueil des gravures : `assets/illustrations/`.

## Vérifications

```bash
npm test
npm run css
git diff --exit-code -- css/app.css
```

CI : `.github/workflows/verify.yml`.

## Limites assumées

- Aucun backend. Actions métier = simulation locale.
- Pas de Leaflet / géocodage.
- Pas de photo réelle de lieu.
- Pas de drag-and-drop calendrier.
- Persistance limitée à `localStorage` (`dn.demo.store.v2`) pour le Demandeur.
- Les profils internes ne partagent pas automatiquement les écritures du Demandeur.
