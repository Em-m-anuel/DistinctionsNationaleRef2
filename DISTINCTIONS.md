# Distinctions — fonctionnalités implémentées

Page `#/app/demandeur/distinctions` (espace Demandeur).

## Vue d’ensemble

Indicateurs calculés sur `DemoStore` :

- total des distinctions (pas le nombre d’employés) ;
- validées / en attente / refusées ;
- remises / en attente de remise ;
- employés distincts concernés.

## Visualisations

- Répartition Bronze / Argent / Or (donut).
- Distinctions par campagne (barres cliquables → filtre).
- Évolution annuelle (barres cliquables).

Les graphiques n’remplacent pas la liste.

## Liste par employé

Colonnes : identité, métal, campagne, dossier, statut de validation, statut de remise, date de remise, cérémonie.

Filtres : employé, métal, campagne, année, validation, remise.

Clic sur un employé → fiche employé et historique des distinctions.

## Limites

Un même employé peut avoir plusieurs lignes. Les statuts de validation/remise sont ceux des données de démonstration, pas un moteur réglementaire.
