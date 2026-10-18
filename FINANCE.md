# Finance — fonctionnalités implémentées

Page `#/app/demandeur/payments`.

## Principes

- Un **ordre de recette n’est pas un paiement**.
- Montants **émis**, **payés** et **restant à payer** sont distingués.
- Tarifs fictifs centralisés dans `DEMO_TARIFFS` (`js/demo-store.js`) : Bronze 12 000, Argent 18 000, Or 24 000 FCFA. Mention explicite : aucun tarif officiel.

## Tableau de bord

Dépenses liées aux demandes, montants des ordres, montants payés, reste à payer, nombre d’ordres, quittances reçues, paiements en attente de vérification, coût moyen par dossier (lorsque calculable).

## Dépenses par demande

Pour chaque dossier : numéro, campagne, date, récipiendaires, répartition des médailles, ordre émis, payé, reste, statut financier. Clic sur le numéro → fiche dossier.

## Évolution annuelle

Barres des montants **payés** par année de campagne. Texte de variation calculé (pourcentage si les deux années le permettent). Causes affichées seulement si les données le justifient (dossiers, récipiendaires, métaux). Sinon, constat sans cause inventée.

## Filtres et export

Année, campagne, statut de paiement, dossier, comparaison de deux périodes. Export CSV des lignes affichées (mécanisme ajouté pour ce module).

Les graphiques sont cliquables (filtre année).

Périmètre : uniquement la structure connectée.
