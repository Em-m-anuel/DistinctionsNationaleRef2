# Audit frontend — refonte qualitative GAB-ORIENT

Date : 2026-10-15. Architecture conservée : SPA hash vanilla (`#/app/<rôle>/<page>`), magasin `cf-store`, coquille `ipShell`. Pas de React, pas de chaîne de build.

## Ce qui a changé (composition, pas un polish)

- **Fonds** : alignés sur l’accueil — `#fcfcfa` + grain papier, cartes blanches, secondaires `#f9f8f4` / `#f4f7fa`. Pas d’aplat beige.
- **Hero interne** : compact hors accueil (pas de sceau) ; titre `<h1>` conservé.
- **Notifications** : liste structurée (non lu / lu, icône, titre, message, référence, date, consulter le dossier). Données inspecteur cohérentes avec les dossiers.
- **Consultation dossier** (autorités, instruction, fiche) : identité, circuit, pièces, récipiendaires, historique — plus une liste plate.
- **Bureau autorités** : colonne lecture + colonne acte. Ministre/DGT orientent ; DR décide en 1re instance.
- **Visa / cachet** : zone d’accueil explicite. Aucun cachet officiel inventé.
- **Secrétariat** : fiche courrier (date, expéditeur, pièces, référence interne). Pas de bouton de décision.
- **Agent** : suivi relances / recours + brouillon de délégation (sans statuer, sans valider une date).
- **Cérémonies** : calendrier mensuel **et annuel**, jour courant, statuts (proposée / confirmée / tenue), schéma des villes. Pas d’image statique déguisée en carte.
- **Visionneuse** : viser / cacheter / signer réservés aux autorités et au Chef.

## Ce qui n’a pas bougé

- Login : « Explorer la démonstration » (seul lieu des mentions de présentation).
- Seeders, comptes, persistance `localStorage` (`dn.cf.store.v1`).
- Header sticky + retour-haut animé.
- `ipMay` : masquer un bouton ≠ contrôle serveur.

## Parcours vérifiés

| Rôle | Parcours |
| --- | --- |
| Demandeur | Dépôt, compléments, quittance, cérémonie |
| Secrétariat | Enregistrer → transmettre |
| Ministre / DGT | Indications + cascade |
| DR | Approuver / rejeter |
| Agent | Instruction, compléments, suivi, brouillon délégation |
| Inspecteur | Contrôle / signalement, pas de validation |
| Chef | Ordre ≠ paiement, calendrier, négociation de lieu |
| Régisseur | Stock, remise après quittance |
| Admin | Comptes / journaux, pas de file métier |
