# Cérémonies — fonctionnalités implémentées

Menu déroulant **Cérémonies** (Demandeur) :

1. Demande de cérémonie — `#/app/demandeur/ceremony-request`
2. Calendrier des cérémonies — `#/app/demandeur/ceremony-calendar`
3. Mes cérémonies — `#/app/demandeur/ceremonies`

Même source `DemoStore.ceremonies` et même composant `renderMonthCalendar`.

## Demande de cérémonie

Parcours en 3 étapes :

1. **Dossier** — uniquement les dossiers de la structure éligibles (ordre de recette émis, pas de cérémonie déjà ouverte ou terminée). Si aucun : explication et lien vers les dossiers. Impossible sans dossier.
2. **Date et lieu** — proposition (non confirmée). Lieu synchronisé avec une carte de démonstration.
3. **Récapitulatif** — envoi → numéro de suivi, historique, notification, statut « Demande en attente ». Date et lieu non confirmés.

### Carte

Aucun service de géocodage réel. Bandeau **Mode démonstration — lieux prédéfinis**. Recherche dans `DEMO_PLACES` (Libreville, Port-Gentil, Franceville, Oyem, Lambaréné, Mouila). Sélection liste → marqueur. Clic carte → lieu prédéfini le plus proche. Saisie manuelle sans correspondance → le marqueur est retiré.

## Calendrier

Vues mois et liste. Navigation des mois, aujourd’hui, filtres période/statut/campagne/type. Dates proposées, négociées et confirmées distinguées. Jours à plusieurs cérémonies indiqués. Passé consultable.

Image du lieu : illustration neutre, jamais présentée comme une photographie du site.

Participants : à venir = invités/confirmés (présence non enregistrée). Passé = Présent seulement si enregistré.

## Mes cérémonies

Listes : à venir, préparation, demandes en attente, confirmées, passées, refusées/annulées.

Fiche : dossier, dates proposée/confirmée, lieu, statut, participants selon droits, documents, historique, actions selon statut.

Statistiques cliquables : total, à venir, réalisées, en attente, confirmées, refusées, participants des cérémonies passées (présences réelles), taux de réalisation des confirmées.

## Limites

Pas de géocodage réel, pas de photo de lieu, pas de drag-and-drop, confirmation métier simulée.
