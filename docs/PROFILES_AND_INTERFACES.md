# Profils et interfaces

Quatorze comptes de démonstration (`DEMO_ACCOUNTS`), treize rôles métier + l’admin. Connexion locale, magasin `cf-store`, aucune session serveur.

## Portails déjà harmonisés (hors `ipNav`)

- **Demandeur (entreprise / ministère)** — `renderPortal('demandeur')`. Menus Dossiers (liste, création, statistiques), employés, finance, cérémonies. Wizard en six étapes. Courrier d’initiation obligatoire.
- **Récipiendaire / personne** — `renderPortal('recipient')`. Distinctions, documents, cérémonies, retraits. Pas de montants FCFA, pas d’emplacement physique.

Ces deux espaces gardent leur navigation portail. `renderWorkspace` les traverse encore pour les tests (`cfRender`) : même coquille `ipShell`, menus `cfNav` d’origine.

## Espaces internes (cette livraison)

Même DA que les portails : chrome sticky, menus déroulants, hero, stats cliquables, listes en tableau, empty states, confirmations en barre (`confirm-on`), toasts, bouton retour-en-haut animé.

| Profil | Intention de l’écran d’accueil |
| --- | --- |
| Ministre / DGT | Files à orienter |
| DR | Files à décider |
| Secrétariats | Courrier à enregistrer / transmettre |
| Agent | Instruction et pièces |
| Inspecteur | Contrôles et anomalies |
| Chef | Pilotage : listes, ordres, cérémonies |
| Régisseur | Stock et guichet |
| Admin | Comptes et journaux |

Les dispositions ne sont **pas** copiées à l’identique d’un rôle à l’autre : chaque accueil n’affiche que les compteurs du métier. Pas de cartes décoratives.

## Parcours type (magasin partagé)

Dépôt demandeur → secrétariat → autorité (DR approuve **ou** Ministre/DGT transmet) → agent instruit → chef notifie / émet l’ordre → demandeur verse au Trésor et dépose la quittance → régisseur vérifie puis remet **une** fois → cérémonie (chef) ou retrait sans cérémonie.

L’inspecteur intervient en contrôle parallèle, sans prendre la décision d’un autre rôle.

## Données visibles

Chaque rôle ne voit que sa file (`cfAuthQueue`, `cfVisibleDossiers`, filtres d’instruction). Les dossiers des autres autorités ne sont pas mélangés. L’admin n’a pas de file.
