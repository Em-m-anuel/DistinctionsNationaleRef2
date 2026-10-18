# Carte des pages (espaces internes)

SPA en hash `#/app/<rôle>/<page>`. Les portails **demandeur** et **récipiendaire** restent rendus par `renderPortal` (`js/views/portals.js`) : `ipNav` ne les remplace pas.

La coquille visuelle des rôles internes est `ipShell` (`js/views/internal-portal.js`) : header sticky `ws-header`, onglets `ws-tabs` (menus déroulants), hero `ws-hero ws-appear`, bouton haut `home-back-top`. Les mentions de présentation restent **à la connexion**.

Les pages listées ci-dessous sont celles du menu **effectif** (`ipNav`). `ROLE_CONFIGS.nav` reste la liste historique utilisée par les tests de couverture ; chaque entrée de cette liste continue d’être rendue.

## A — Ministre · B — DGT · C — DR

| Page | Rôle dans le parcours | Liste / création / détail / historique |
| --- | --- | --- |
| `overview` | Tableau de bord : files du **seul** niveau de l’autorité | Stats cliquables |
| `dossiers` | File à examiner (courriers transmis à ce niveau) | Liste |
| `dossiers-transmis` | Déjà transmis ou décidés à ce niveau | Historique |
| `dossiers-stats` | Volumes de la file | Statistiques métier |
| `recours` | Recours à statuer | Liste |
| `recours-historique` | Recours déjà traités à ce niveau | Historique |
| `relances` | Relances à traiter | Liste |
| `ceremonies` | Demandes de cérémonie du niveau | Liste |
| `calendar` | Vue mensuelle | Calendrier |
| `notifications` | Avis locaux | Liste |
| `profile` | Compte | Détail |

Le DR **approuve ou rejette** (première instance). Ministre et DGT **orientent** (indications + transmission), ils n’instruisent pas à la place du Service.

## Secrétariats (ministre, DGT, DR)

| Page | Fonction |
| --- | --- |
| `overview` | Volumes boîte / à enregistrer / à transmettre |
| `inbox` | Boîte de réception |
| `mail-register` | Attribution d’une référence interne |
| `mail-transmit` | Transmission à l’autorité, **sans décider** |
| `localisation` | Emplacement physique du dossier papier |
| `history` | Historique des transmissions |
| `notifications`, `profile` | Avis et compte |

## D — Agent du Service

| Page | Fonction |
| --- | --- |
| `overview` | Dossiers à instruire, compléments, récipiendaires |
| `instruction` | Liste + fiche (complétude, décisions individuelles) |
| `recipients` | Liste des récipiendaires |
| `completeness` | Contrôle de pièces |
| `complements` | Compléments à demander |
| `waiting-pieces` | Compléments encore ouverts |
| `agent-relances` | Relances suivies — **sans** statuer |
| `agent-recours` | Recours suivis — **sans** statuer |
| `delegations-draft` | Brouillon de délégation (modèle officiel non figé) |
| `notifications`, `profile` | Avis et compte |

Pas d’ordres de recette, pas d’organisation de cérémonie, pas de reconnaissance de demandeurs. Le dépôt d’un dossier neuf appartient au demandeur.

## E — Inspecteur

| Page | Fonction |
| --- | --- |
| `overview` | Contrôles, retraits, anomalies |
| `instruction` | Consultation des dossiers — **signalement**, pas de validation de médaille |
| `justificatifs` | Pièces déclarées / reçues |
| `controles-recip` | Contrôle par personne |
| `anomalies` | Signalements enregistrés + formulaire |
| `retraits` | Retraits sans cérémonie (quittance / autorisation) |
| `verify-history` | Journal filtré (vérifications) |
| `notifications`, `profile` | Avis et compte |

## F — Chef du Service

| Page | Fonction |
| --- | --- |
| `overview` | Instruction, listes, ordres, paiements, cérémonies, archives |
| `instruction` | Suivi de l’étude |
| `ready` | Instruction achevée |
| `notify` | Notification de la liste des validés |
| `orders` | Émission de l’**ordre de recette** (≠ paiement) |
| `payments-follow` | Quittances et restes à payer |
| `calendar` / `ceremonies` | Calendrier mensuel (`ws-calendar`) |
| `cer-demandes` | Négociation hors délai, délégations, diplômes |
| `delegations` | Documents de cérémonie |
| `stats` | Statistiques d’instruction / paiement / cérémonie |
| `applicants` | Demandeurs reconnus |
| `archives` | Dossiers clôturés ou rejetés |
| `notifications`, `profile` | Avis et compte |

## G — Régisseur

| Page | Fonction |
| --- | --- |
| `overview` | Stock |
| `stock` | Médailles disponibles |
| `diplomas` | Stock documentaire indicatif |
| `movements` | Entrées / sorties |
| `orders` | **Bons de commande** (pas les ordres de recette) |
| `deliveries`, `suppliers`, `budget` | Approvisionnement |
| `remises` | Guichet : quittance conforme **puis** une seule remise |
| `retraits` | Retraits sans cérémonie |
| `tarifs`, `reg-stats` | Barème et volumes de stock |
| `notifications`, `profile` | Avis et compte |

## H — Administrateur technique

| Page | Fonction |
| --- | --- |
| `overview` | Comptes, cachets, journaux, chaîne de signature |
| `users`, `internal-accounts` | Comptes et activation technique |
| `campaigns` | Périodes de dépôt (paramètre, pas une décision de médaille) |
| `stamps`, `signatures` | Images et activation technique |
| `journal`, `journal-sig`, `alerts` | Audit et état de la démonstration |
| `notifications`, `profile` | Avis et compte |

Pas de file de dossiers, pas d’ordres, pas de remises, pas d’emplacement physique.

## Pages hors menu (toujours rendues)

`ROLE_CONFIGS.nav` conserve des alias (`decisions`, `agenda`, `payments`, `transmissions`, `activity`…). `cfContent` les mappe vers l’écran correspondant afin que les tests de couverture et les anciens liens hash restent valides.
