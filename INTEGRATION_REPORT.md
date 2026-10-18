# Rapport d’intégration — vues GAB-ORIENT

Les 24 vues proto sont les fichiers `js/gab-orient/views-*.js`. Elles s’affichent dans `#go-view` après `cfPaint`. Données : dossiers visibles `cfVisibleDossiers` convertis vers la forme proto. Actes : `GO.dossierActions` conservés visuellement, persistés dans `cf-store` quand un équivalent existe (`instruct` → `cfStartStudy`, `decide` → `cfApprove`/`cfReject`, `recette` → `cfIssueOrder`, `control` → `cfFlagAnomaly`, `complement` → `cfAskComplement`).

Hash proto (`#/dossiers/REF`) intercepté pour rester sur `#/app/<rôle>/…` et ouvrir `GO.openDrawer` / `views.dossiers.update`.

Wizard 6, auth, `ipNav`/`ipMay`, magasin, `cf-confirm-bar` : inchangés.
