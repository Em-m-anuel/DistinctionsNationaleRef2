# Frontend Démo — Architecture, données simulées, parcours métier

> Ce document décrit précisément l'état de la démo frontend : ce qui
> fonctionne réellement, ce qui est simulé, les limites, et la procédure
> pour tester les parcours métier de bout en bout.

---

## 1. Activation du mode présentation

`PRESENTATION_MODE` s'active automatiquement lorsque :
- `window.location.protocol === 'file:'`, ou
- `window.location.hostname` est `localhost` ou `127.0.0.1`, ou
- l'aperçu Arena (`*.e2b.app`), ou
- `window.DN_PRESENTATION_MODE === true`

Aucun backend n'est requis. Aucun secret de production n'est utilisé.

## 2. Comptes de démonstration

14 comptes fictifs, domaine `example.test` (RFC 2606 réservé), mot de
passe partagé documenté : `Demo123!` (cf. `DEMO_ACCOUNTS.md`).

| # | Catégorie | Email | Rôle technique |
|---|---|---|---|
| 1 | Demandeur | `demo.entreprise@example.test` | `demandeur` |
| 2 | Demandeur | `demo.ministere@example.test` | `demandeur` |
| 3 | Personne | `demo.personne@example.test` | `recipient` |
| 4 | Secrétariat | `demo.secretariat.ministre@example.test` | `secretariat_ministre` |
| 5 | Secrétariat | `demo.secretariat.dgt@example.test` | `secretariat_dgt` |
| 6 | Secrétariat | `demo.secretariat.dr@example.test` | `secretariat_dr` |
| 7 | Autorité | `demo.ministre@example.test` | `ministre` |
| 8 | Autorité | `demo.dgt@example.test` | `dgt` |
| 9 | Autorité | `demo.dr@example.test` | `dr` |
| 10 | Service | `demo.service.agent@example.test` | `service_agent` |
| 11 | Service | `demo.service.inspecteur@example.test` | `service_inspecteur` |
| 12 | Service | `demo.service.chef@example.test` | `service_chef` |
| 13 | Régie | `demo.regisseur@example.test` | `regisseur` |
| 14 | Admin | `demo.admin@example.test` | `admin` |

## 3. Couches de données simulées

Trois couches strictement séparées :

### 3.1 `PORTAL_DEMO` + `DemoStore` (demandeurs)

`js/portal-demo.js` fournit le socle. `js/demo-store.js` **enrichit** ce socle au chargement (`enrichPortalDemo`) puis expose un magasin unique mutable (`DemoStore`, clé `localStorage` `dn.demo.store.v4`). Un magasin plus ancien (v2/v3) est ignoré pour ne pas masquer le profil employé ni le parcours personne. Toutes les pages Employés / Distinctions / Finance / Dossiers / Cérémonies / Retrait lisent et écrivent ici.

- `enterprise` (après enrichissement) : **6 dossiers** (dont `DNG-DEMO-2026-030`, éligible à une demande de cérémonie), **7 employés** (dont Pierre Okoumba `EN_ATTENTE` et Fatou Diallo, sénégalaise), **14 distinctions**, **4 ordres** (émis / payé / reste distingués), **4 cérémonies** (dont `CER-DEMO-2026-023-R` refusée — **0 demande en attente** tant qu’on n’a pas soumis le wizard)
- `ministere` : 2 dossiers, 4 employés (dont une invitation en attente), 5 distinctions, 1 ordre, 1 cérémonie
- `person` : 3 affiliations (dont 1 invitation), 3 distinctions (or 2026 validée non remise, bronze 2025 remise, argent 2016 remise), 2 cérémonies, 2 photos, retraits vides au départ, actions d’affiliation — **jamais de montants FCFA**

Tarifs fictifs centralisés `DEMO_TARIFFS` : Bronze 12 000, Argent 18 000, Or 24 000 FCFA. Mention explicite : aucun tarif officiel.

Lieux de carte : `DEMO_PLACES` (10 lieux prédéfinis). Aucun géocodage réel.

### 3.2 `INTERNAL_DEMO` (espaces internes)
11 rôles internes (3 secrétariats, 3 autorités, 3 services, régisseur, admin).
Chaque rôle dispose de :
- `profile` : identité de l'agent
- `mail` ou `files` : courriers/dossiers à traiter
- Données spécifiques au rôle (stock, cérémonies, journal, etc.)

### 3.3 État partagé d'interaction (`wsState`)
- Modifié par les actions (wizard, calendrier, notifications, dossiers, etc.)
- Volontairement limité à la session courante d'un profil donné
- **Limite explicite** : un changement de profil ne propage PAS
  automatiquement les modifications au profil suivant (chaque profil
  repart de ses données seedées)

## 4. Pages réellement implémentées

112 pages sur 112 attendues (audit `_audit-pages.cjs`, novembre 2026) :
- 0 placeholder
- 0 page vide
- 0 erreur de rendu

Chaque page est générée par un `renderXxx(role, page)` qui :
1. détermine les données du rôle courant,
2. calcule les sections visibles selon les permissions (`ROLE_PERMISSIONS.md`),
3. retourne le HTML complet (header + tabs + contenu + overlay).

## 5. Actions interactives (35+)

Toutes routées via `wsAction(action, el, role, page)` :
- `ws-page`, `ws-role`, `ws-go` : navigation
- `ws-cal-prev/next/today` : calendrier
- `ws-read` / `ws-read-all` : notifications
- `ws-dossier` / `ws-ceremony` / `ws-decision` : modales détail
- `ws-wizard-next/prev/submit/reset` : assistant nouveau dossier
- `ws-add-recipient` / `ws-remove-recipient` : ajout/retrait de récipiendaires
- `ws-attendance` : présence cérémonie
- `ws-reset-filter` : filtres
- `ws-add-line` / `ws-remove-line` / `ws-confirm-order` : bons de commande
- `ws-withdrawal` : retraits sans cérémonie
- `ws-no-api` : affichage d'un message clair quand un service n'est pas branché
- `ws-account` / `ws-notif-dropdown` / `ws-toggle-menu` : menu compte/notifications
- `ws-home` : retour à l'accueil public
- `ws-profile-help` : aide simulée
- `ws-draft` : brouillon enregistré localement
- `ws-file` : sélection de fichier simulée
- `ws-new-element` : ouverture d'un modal d'information
- `ws-delivery` : bordereau de livraison fictif
- `ws-event` : ouverture détail cérémonie calendrier
- `ws-confirm-decision` : confirmation de décision (DR, Ministre, DGT)
- `ws-transmission` : ouverture détail courrier secrétariat
- `ws-preview-order` : prévisualisation d'un ordre de recette

## 6. Composants partagés

| Composant | Localisation | État |
|---|---|---|
| Header sticky (h-64 / h-60 mobile) | `wsHeader()` | ✅ |
| Tabs horizontales scrollables | `wsHeader()` | ✅ |
| Calendrier mensuel 7 colonnes | `wsCalendar()` | ✅ |
| Modale détail (dossier, cérémonie, ordre, transmission) | `wsModalHtml()` | ✅ |
| Toasts (succès, info, erreur simulée) | `wsToast()` | ✅ |
| Boutons primaires / secondaires | `js/ui.js` | ✅ |
| Cartes métriques (stat cards) | `wsMetric()` | ✅ |
| Tableaux filtrables (dossiers, cérémonies, stock) | `wsDossiersTable()`, etc. | ✅ |
| Filtres (recherche + statut) | `wsState.query` | ✅ |
| Wizard multi-étapes (5 étapes) | `wsWizard()` | ✅ |
| Prévisualisation document (PDF) | `wsPreviewPage()` | ✅ |
| Badge de statut | composants inline | ✅ |
| Avatar + menu compte | `wsHeader()` | ✅ |
| Cloche + dropdown notifications | `wsHeader()` | ✅ |
| Frise de progression | section par dossier (inline) | ⚠️ Partiel |
| Visionneuse de documents scellés | `wsPreviewPage()` | ⚠️ Partiel |
| Assistant flottant | — | ❌ Non implémenté |

## 7. Limites explicites

1. **Pas de persistance inter-profils** : un changement de profil
   recharge les données seedées. Pour tester un parcours de bout en
   bout, il faut soit :
   - Utiliser le sélecteur de profil de démo (visible uniquement en
     mode présentation, et explicitement labellé comme tel).
   - Manipuler manuellement plusieurs onglets.

2. **Pas de signature cryptographique réelle** : les documents
   prévisualisés sont des PDF simulés (libellés explicitement comme
   "démonstration").

3. **Pas d'envoi d'e-mail réel** : toute notification envoyant un
   e-mail est identifiée comme telle (libellé "simulation" dans
   l'interface).

4. **Pas de drag & drop calendrier**, pas de vue semaine / jour.

5. **Pas de modification de mot de passe persistante** : la procédure
   "mot de passe oublié" simule les 4 étapes sans brancher un
   service réel.

6. **Anciennes affiliations figées** : la personne ne peut pas
   modifier ses affiliations passées.

7. **Localisation physique invisible aux demandeurs** : respecté
   par construction (les pages `wsLocalisation` n'existent que
   pour les secrétariats).

## 8. Procédure de test

### 8.1 Démarrage
```bash
git clone https://github.com/Em-m-anuel/DistinctionsNationale_Front.git
cd DistinctionsNationale_Front
python3 -m http.server 8000
# Ouvrir http://localhost:8000
```

### 8.2 Connexion
- Cliquer sur "Explorer la démo" (visible uniquement en mode
  présentation)
- Choisir un compte dans la liste
- Saisir le mot de passe `Demo123!`

### 8.3 Changement de profil
- Cliquer sur l'avatar (en haut à droite)
- Choisir "Changer de profil" → ouvre la liste des 14 profils
- Les données seedées du nouveau profil sont chargées

### 8.4 Parcours métier nominal (à tester)
1. Connexion en tant qu'**Entreprise SGI** (`demo.entreprise@example.test`)
2. Voir les 5 dossiers (statuts variés)
3. Cliquer "Nouveau dossier" → wizard 5 étapes
4. Se déconnecter, se connecter en tant que **Secrétariat DR**
   (`demo.secretariat.dr@example.test`)
5. Voir le dossier dans la boîte de transmission
6. Se déconnecter, se connecter en tant que **DR**
   (`demo.dr@example.test`)
7. Approuver/rejeter le dossier
8. Se déconnecter, se connecter en tant que **Agent du Service**
   (`demo.service.agent@example.test`)
9. Instruire le dossier
10. Se déconnecter, **Chef du Service** → émet l'ordre de recette
11. **Entreprise** → voit l'ordre, présente la quittance
12. **Régisseur** → vérifie la quittance, sort les médailles
13. **Chef du Service** → planifie la cérémonie
14. **Entreprise** + **Personne** → voient la cérémonie dans leur calendrier

> **Note** : ce parcours exploite les actions locales de chaque rôle.
> Il n'y a **pas** de propagation automatique inter-profils en mode
> présentation simple (cf. §7.1). Pour un test plus réaliste, ouvrir
> plusieurs onglets en parallèle.

## 9. Audit automatique

`_audit-pages.cjs` vérifie que les 112 pages attendues rendent du
contenu non vide. À lancer après toute modification :

```bash
node _audit-pages.cjs
```

Résultat attendu : `112/112 pages réelles · 0 placeholders · 0 erreurs`.

## 10. Modules Demandeur ajoutés (2026-10)

Voir `EMPLOYEES.md`, `DISTINCTIONS.md`, `FINANCE.md`, `CEREMONIES.md`.

- Formulaire personne unique `personFormHtml` (employé **et** récipiendaire du wizard).
- Enregistrement d’un employé ≠ dépôt de dossier.
- Graphiques CSS/SVG cliquables (filtres), jamais en remplacement des listes.
- Export CSV finance : `finances-demonstration.csv`.
- Pièces jointes simulées : `*-demo.pdf`.
- Header sticky + bouton retour en haut (seuil 460 px) sur les espaces connectés.
- Planche graphique : `docs/design-reference.html`.

## 11. Évolutions futures (hors périmètre)

- Propagation automatique inter-profils (le magasin est déjà unique côté demandeur)
- Signature cryptographique réelle (backend Laravel)
- Envoi d'e-mails réel (service tiers)
- Géocodage réel / Leaflet
- Synchronisation calendrier externe (CalDAV)
- Vue semaine / jour du calendrier
- Drag & drop sur le calendrier
- Internationalisation (français → anglais)
