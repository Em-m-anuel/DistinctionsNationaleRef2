# Audit d’intégration GAB-ORIENT → FrontII

Date : 2026-10-16. Source des écrans : `js/gab-orient/` (copie de `design-reference/` / DistinctionsNationaleReference `1b75122`).

## Ce qui est réellement monté

Les fichiers de rendu proto sont chargés tels quels (`views-*.js`, `core.js` tiroir / badges / `GO.ui`, `charts.js`, `map.js`, `gab-orient.css`, sprite SVG). `js/gab-orient/bridge.js` hydrate `GO.S` depuis `dn.cf.store.v1`, mappe `GO.can` vers `ipMay`, remplace `GO.confirmDialog` par une barre `cf-confirm-bar`, et `cfPaint` appelle `GO.views[x].render(#go-view)`.

`goPage()` n’est plus un renderer : c’est un relais vers `goRenderPage` (capture HTML + montage live).

## Écarts documentés (incompatibilités réelles)

| Sujet | Proto | FrontII | Choix |
| --- | --- | --- | --- |
| Wizard dépôt | 4 étapes (`views.nouveau`) | 6 étapes `cfWizard` | Conservé FrontII |
| Profil | `GO.views.profil` (changeur de rôles proto) | `cfProfile` | Conservé FrontII (le changeur proto casserait les comptes) |
| Confirmations | `GO.modal` | `cf-confirm-bar` | `GO.confirmDialog` → barre ; formulaires proto (`formModal`) restent des couches de saisie |
| Cycle des statuts | recu → … → transmis → décision | SOUMIS → … → APPROUVE puis instruction | Affichage mappé ; mutations via `cfStartStudy` / `cfApprove` / `cfIssueOrder` / `cfFlagAnomaly` |
| Seed proto | `GO_DATA.seed` | magasin `cf-store` | Seed vidé au boot ; jamais recopié dans `dn.cf.store.v1` |
| Permissions | `agent.can.recette` | `ipMay('issue-order')` chef seul | `GO.can` surcharge |
| Calendrier | `views.ceremonies` + `GOMap` | ancien `ws-calendar` | Vue proto (Leaflet ou schéma) |
| Localisation papier | absente | secrétariats | Page FrontII conservée |

## Non repris

- Coquille proto (`NAV` 3 familles, `#site-header`, `GO.boot` routeur `#/apercu`)
- `GO.roles.can` brut
- `react_original` / dépôt DistinctionsNationaleRef (copie FrontII)
