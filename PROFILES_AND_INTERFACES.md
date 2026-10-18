# Profils et interfaces

> Ce document décrit l'intégralité des profils, leurs responsabilités, leurs routes, leurs pages, leurs actions et leurs restrictions. Il sert de référence à l'équipe backend, à l'équipe de test et à tout intervenant du projet.

## Charte visuelle (header unifié)

Depuis la refonte 2026, **tous les espaces profils partagent le même header sticky** :
- `h-[64px]` desktop, `h-[60px]` mobile
- structure : `[Logo République Gabonaise]` · `[Libellé du rôle]` · `[Bouton menu]` · `[Notifications]` · `[Avatar + menu compte]`
- tabs horizontales scrollables
- mobile : menu 2 colonnes sous le header
- aucun sidebar latérale
- fond `paper-grain.svg` cohérent avec les portails entreprise/personne

Voir `CALENDAR.md` pour le composant calendrier des cérémonies.

## 1. Vue d'ensemble

Le portail compte **13 profils applicatifs** (répartis en 7 catégories). Chaque profil dispose de sa propre navigation, de ses propres pages et de ses propres restrictions, visibles côté frontend.

| # | Catégorie | Rôle technique | Libellé public |
|---|---|---|---|
| 1 | Demandeur | `demandeur` | Demandeur — Entreprise / Ministère |
| 2 | Personne | `recipient` | Récipiendaire / Personne |
| 3 | Secrétariat | `secretariat_ministre` | Secrétariat — Ministre |
| 4 | Secrétariat | `secretariat_dgt` | Secrétariat — DGT |
| 5 | Secrétariat | `secretariat_dr` | Secrétariat — DR |
| 6 | Autorité | `ministre` | Ministre |
| 7 | Autorité | `dgt` | DGT |
| 8 | Autorité | `dr` | Direction Régionale |
| 9 | Service | `service_agent` | Service des Distinctions — Agent |
| 10 | Service | `service_inspecteur` | Service des Distinctions — Inspecteur |
| 11 | Service | `service_chef` | Service des Distinctions — Chef |
| 12 | Régie | `regisseur` | Régisseur des Médailles |
| 13 | Admin | `admin` | Administrateur |

**Total** : 13 rôles (la mission demandait 14 entrées car Demandeur est partagé entre Entreprise et Ministère via un mode visuel).

## 2. Routes

Tous les rôles partagent le même schéma de route :

```
#/app/<role>/<page>
```

Exemples :
- `#/app/demandeur/overview`
- `#/app/recipient/ceremonies`
- `#/app/secretariat_ministre/transmissions`
- `#/app/service_chef/payments`
- `#/app/admin/users`

Rétrocompatibilité : les anciens liens `#/app/secretariat/...` et `#/app/service/...` pointent respectivement vers `secretariat_ministre` et `service_chef`.

## 3. Pages par profil

### 3.1 Demandeur (`demandeur`)
- overview
- dossiers, new-dossier (menu Dossiers)
- employees, employee-new, employee-stats (menu Employés)
- distinctions
- payments (Finance)
- ceremony-request, ceremony-calendar, ceremonies (menu Cérémonies)
- notifications, profile

Entreprise et ministère partagent le rôle `demandeur` ; le jeu de données (`enterprise` vs `ministere`) dépend de l’e-mail de démonstration. Voir `EMPLOYEES.md`, `DISTINCTIONS.md`, `FINANCE.md`, `CEREMONIES.md`.

### 3.2 Personne (`recipient`)
- overview, recipients, ceremonies, documents, relances, photos,
  notifications, profile

### 3.3 Secrétariats (`secretariat_*`)
- overview, transmissions, localisation, activity, notifications, profile

### 3.4 Autorités (`ministre`, `dgt`, `dr`)
- overview, dossiers, decisions, recours, relances, ceremonies,
  activity, notifications, profile

### 3.5 Service — Agent (`service_agent`)
- overview, instruction, recipients, complements, adjustments,
  eligibility, notifications, activity

### 3.6 Service — Inspecteur (`service_inspecteur`)
- overview, instruction, complements, withdrawals, adjustments,
  notifications, activity

### 3.7 Service — Chef (`service_chef`)
- overview, instruction, eligibility, payments, agenda, delegations,
  attendance, campaigns, notifications, activity

### 3.8 Régisseur (`regisseur`)
- overview, stock, movements, supplies, orders, deliveries, campaigns,
  remises, withdrawals, suppliers, activity, notifications

### 3.9 Administrateur (`admin`)
- overview, users, internal-accounts, enterprises, campaigns, settings,
  audit, alerts, notifications, profile

## 4. Restrictions d'accès

| Profil | Localisation physique | Décision métier | Gestion comptes internes |
|---|---|---|---|
| Demandeur / Personne | ❌ jamais | ❌ | ❌ |
| Secrétariats | ✅ | ❌ | ❌ |
| Ministre / DGT / DR | ❌ | ✅ (limité à son niveau) | ❌ |
| Service Agent | ❌ | Validation individuelle (limitée) | ❌ |
| Service Inspecteur | ❌ | Contrôle uniquement (pas de validation) | ❌ |
| Service Chef | ❌ | Validation finale + financement + cérémonies | ❌ |
| Régisseur | ❌ | Aucune (stock uniquement) | ❌ |
| Administrateur | ❌ | ❌ métier | ✅ uniquement plateforme |

## 5. Actions clés par profil

- **Demandeur** : dépôt de dossier, suivi financier (ordres ≠ paiements), cérémonies (demande / calendrier / suivi), enregistrement d’employés (affiliation en attente, sans création de dossier), consultation des distinctions de la structure. Seules les affiliations **ACTIF** seraient proposées dans un dépôt réel ; le wizard de démo réutilise le formulaire personne sans créer d’affiliation.
- **Personne** : confirmer une affiliation, consulter ses distinctions et cérémonies, fournir les pièces.
- **Secrétariat** : enregistrer un courrier, mettre à jour la localisation physique, transmettre au niveau supérieur.
- **Autorités (Ministre / DGT / DR)** : examiner les dossiers, rendre un avis, traiter un recours, demander une cérémonie, décider ou redescendre.
- **Service Agent** : instruire un dossier, demander un complément, valider ou refuser un récipiendaire.
- **Service Inspecteur** : contrôler les justificatifs, vérifier les retraits sans cérémonie, signaler les anomalies.
- **Service Chef** : valider, générer l'ordre de recette, planifier la cérémonie, déléguer.
- **Régisseur** : gérer le stock, enregistrer les mouvements, passer commande, réceptionner, sortir des médailles.
- **Administrateur** : gérer les comptes internes, ouvrir/fermer une campagne, consulter le journal d'audit, modifier les paramètres métier.

## 6. Couleurs et accents

- Demandeur / Service : `green`
- Personne / Régisseur : `gold`
- Secrétariat / Autorités / Admin : `blue`

Ces accents sont portés par `ROLE_CONFIGS[*].accent` et utilisés dans la barre supérieure (`wsSidebar`, `wsTopbar`, topbar admin).

## 7. Rétrocompatibilité

L'ancien code de l'application utilisait 8 rôles (`secretariat`, `service`, etc.). La rétrocompatibilité est garantie par `parseWorkspacePath()` :
- `secretariat` → `secretariat_ministre`
- `service` → `service_chef`
