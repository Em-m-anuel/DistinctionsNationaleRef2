# Comptes de démonstration

> Ces comptes existent **uniquement** pour piloter le mode présentation locale (`PRESENTATION_MODE`).
> - Ils ne sont JAMAIS acceptés par un service d'authentification réel.
> - Aucun mot de passe n'est un secret de service.
> - Toutes les adresses e-mail utilisent le domaine réservé `example.test` (RFC 2606).

## Mot de passe partagé

```
Demo123!
```

Ce mot de passe est documenté publiquement. Il n'a aucune valeur en production.

## Liste des 14 profils

| # | Catégorie | Email | Rôle technique | Libellé |
|---|---|---|---|---|
| 1 | Demandeur | `demo.entreprise@example.test` | `demandeur` | DEMO · Entreprise |
| 2 | Demandeur | `demo.ministere@example.test` | `demandeur` | DEMO · Ministère |
| 3 | Personne | `demo.personne@example.test` | `recipient` | DEMO · Personne |
| 4 | Secrétariat | `demo.secretariat.ministre@example.test` | `secretariat_ministre` | DEMO · Secrétariat Ministre |
| 5 | Secrétariat | `demo.secretariat.dgt@example.test` | `secretariat_dgt` | DEMO · Secrétariat DGT |
| 6 | Secrétariat | `demo.secretariat.dr@example.test` | `secretariat_dr` | DEMO · Secrétariat DR |
| 7 | Autorité | `demo.ministre@example.test` | `ministre` | DEMO · Ministre |
| 8 | Autorité | `demo.dgt@example.test` | `dgt` | DEMO · DGT |
| 9 | Autorité | `demo.dr@example.test` | `dr` | DEMO · DR |
| 10 | Service | `demo.service.agent@example.test` | `service_agent` | DEMO · Service · Agent |
| 11 | Service | `demo.service.inspecteur@example.test` | `service_inspecteur` | DEMO · Service · Inspecteur |
| 12 | Service | `demo.service.chef@example.test` | `service_chef` | DEMO · Service · Chef |
| 13 | Régie | `demo.regisseur@example.test` | `regisseur` | DEMO · Régisseur |
| 14 | Admin | `demo.admin@example.test` | `admin` | DEMO · Administrateur |

## Données disponibles par profil

### Espace demandeur (entreprise ou ministère)
- 5 dossiers fictifs (`enterprise`) ou 2 dossiers (`ministere`)
- 5 employés (entreprise) ou 3 employés (ministère)
- 5 distinctions attribuées (entreprise) ou 2 (ministère)
- 3 ordres de recette (entreprise) ou 1 (ministère)
- 3 cérémonies (entreprise) ou 1 (ministère)
- 3 notifications

### Espace personne
- 2 affiliations (1 active, 1 ancienne)
- 2 distinctions
- 2 cérémonies
- 2 photos
- 1 action à effectuer
- 3 notifications

### Espaces internes (sélection de 11 rôles)
Pour chaque rôle interne, le mode présentation charge un sous-ensemble de `INTERNAL_DEMO` :
- **Boîte de transmission** (3 secrétariats)
- **Profil & décisions** (3 autorités)
- **Files d'instruction** (3 services)
- **Stock** (régisseur)
- **Utilisateurs & journal** (admin)

## Mécanisme de seed

- `js/demo-accounts.js` : déclare `DEMO_ACCOUNTS` (lecture seule) et les helpers `findDemoAccount` et `groupDemoAccounts`.
- `js/portal-demo.js` : expose `INTERNAL_DEMO` et `internalDemoData(role)`.
- `PRESENTATION_MODE` s'active automatiquement sur `file://`, `localhost`, `127.0.0.1` et `*.e2b.app`.

## Environnement nécessaire

- Navigateur moderne (ES2020+).
- Aucun backend requis pour utiliser le mode présentation.
- Le serveur de fichiers statique (Python `http.server`, `npx serve`, etc.) doit être lancé à la racine.

## Sécurité

- Ne JAMAIS utiliser ces comptes pour un déploiement public.
- Ne JAMAIS copier le mot de passe partagé dans un fichier de configuration.
- Ne JAMAIS activer `PRESENTATION_MODE` en environnement de production (il faudrait sinon ajouter un contrôle explicite).
