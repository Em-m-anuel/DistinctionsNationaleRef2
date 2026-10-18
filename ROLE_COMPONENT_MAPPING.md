# Matrice métier par rôle — FrontII × masterclass GAB-ORIENT

Date : 2026-10-15.

Ce document précède toute réécriture d’écran. Il relie **besoins métier**, **pages FrontII**, **composants de `design-reference/`**, **actions**, **permissions** et **états**.

Sources : `ROLE_PERMISSIONS.md`, `PAGES_MAP.md`, `PROFILES_AND_INTERFACES.md`, `js/views/internal-portal.js` (`ipNav`, `ipMay`), `js/cf-store.js`, `js/demo-store.js`, `js/views/portals.js`, `js/views/portal-extras.js`, `COMPONENT_MAPPING.md`.

## 0. Règles de lecture

1. **Deux magasins, deux coquilles.** Ne pas les fusionner.
   - Demandeur / récipiendaire : `renderPortal` + `DemoStore` (`dn.demo.store.v4`). Statuts **communiqués** (`En instruction`, `Complément demandé`, `Ordre de recette émis`, `Cérémonie terminée`, `Soumis`…).
   - Rôles internes : `ipShell` + `cf-store` (`dn.cf.store.v1`). Cycle **métier** `SOUMIS → … → CLOTURE`.
2. **`ipNav` ne s’applique pas** à `demandeur` ni `recipient` (testé). Le `NAV` à 3 profils du proto n’est pas importé.
3. **`ipMay`** gouverne les mutations internes. Une action absente de la table est de la navigation. Une action présente n’est exécutée que si le rôle y figure.
4. Les composants masterclass sont **réutilisés visuellement** (filtres, chips, stepper, sections, calendrier, carte en repli, graphiques SVG, timeline). Le seed `GO_DATA` n’entre pas dans l’app.
5. Une date **proposée** n’est jamais verte. Un visa n’est pas une signature. Le demandeur ne confirme pas une cérémonie administrative.

---

## 1. Demandeur (`demandeur`) — priorité

**Responsabilités.** Déposer et suivre les demandes de sa structure (entreprise ou ministère). Gérer les affiliations d’employés. Consulter distinctions et finance (ordres ≠ paiements). Demander une cérémonie. Répondre aux compléments. Relancer ou former un recours **lorsque l’état du dossier le permet**. Ne voit jamais la localisation physique. Ne statue pas.

**Données.** `portalData('demandeur')` via `DemoStore` (clé org `enterprise` / `ministere` selon e-mail). Pas `GO_DATA`. Pas la file interne `cfS().dossiers` sur cet écran.

**Navigation actuelle (`portalNavItems`).** Vue d’ensemble · Dossiers (liste, créer, stats) · Employés · Distinctions · Finance · Cérémonies (demande, calendrier, suivi) · Notifications · Profil.

**Pages à ajouter (sans remplacer les existantes).** `complements`, `relances`, `recours`, `documents` — sous le menu Dossiers.

### Tableau de correspondance — Demandeur

| Besoin métier | Page | Composant de référence | Action attendue | Règle métier |
| --- | --- | --- | --- | --- |
| Vue d’ensemble utile | `overview` | `.kpi` / `.page-head` / activité récente | Clic → liste filtrée | Indicateurs calculés sur `DemoStore` de **cette** structure |
| Consulter ses dossiers | `dossiers` | liste, chips statut, recherche, tri, pagination | Ouvrir un dossier | Accès limité à la structure connectée |
| Détail d’un dossier | `dossiers` + panneau | sections / onglets, badges, timeline | Voir infos, pièces, historique | Pas de localisation physique |
| Créer une demande | `new-dossier` | wizard (chrome proto, **6 étapes FrontII**) | Remplir, valider, déposer | Courrier obligatoire ; DTS non bloquante ; décès > 2 ans informatif |
| Stats des dossiers | `dossier-stats` | `GOCharts` bar/donut (copie SVG, pas le seed) | Clic barre → liste filtrée | Chiffres de la structure |
| Répondre à un complément | `complements` + détail | liste + formulaire | Joindre / commenter ; statut « répondu » | Pas traité du seul fait d’ouvrir la page |
| Relancer un dossier | `relances` | formulaire + historique | Envoyer une relance | Uniquement si l’état le permet (instruction longue, cérémonie close, ordre émis) |
| Former un recours | `recours` | formulaire distinct de la relance | Déposer un recours | Uniquement si décision / refus communiqué le permet |
| Consulter courriers et pièces | `documents` + détail | visionneuse `.viewer` (aperçu, métadonnées) | Consulter | Aucun visa / cachet / transmission |
| Demander une cérémonie | `ceremony-request` | wizard 3 étapes + carte schéma | Proposer date/lieu | Dossier éligible ; proposition ≠ confirmation |
| Calendrier | `ceremony-calendar` | `.cal-grid` | Consulter | Date proposée jamais verte |
| Suivi des cérémonies | `ceremonies` | fiches + statuts | Consulter | Demandeur ne valide pas la date administrative |
| Notifications métier | `notifications` | onglets lu/non lu, groupes de dates | Clic → page + dossier | Pas de notif décorative |
| Employés / organismes | `employees`, `employee-new`, `employee-stats`, `profile` | formulaires existants | Gérer affiliations | Invitation `EN_ATTENTE` jusqu’à confirmation personne |
| Distinctions / finance | `distinctions`, `payments` | graphiques existants | Consulter | Ordre ≠ paiement ; pas de tendances inventées |

**Conserver.** `portalNavItems`, `portalCreateDossier` (6 étapes), `personFormHtml`, `DemoStore`, `home-back-top`, overlay portail (abandon / ordre), mentions démo **hors** ces pages.

**Interactions à câbler.** Filtres cliquables depuis l’accueil ; pagination dossiers ; onglets de fiche ; réponse complément persistée ; relance / recours avec contrôle d’état ; notification → `page` + `ref` + section.

**États à afficher.** Statuts communiqués existants + compléments `ouvert` / `répondu` + relances / recours `Envoyée` / `Traité`.

**Manques avant cette livraison.** Accueil peu actionnable ; fiche dossier en un bloc ; pas de vue Compléments / Relances / Recours / Courriers ; pas de pagination ; notifications sans section cible.

**Permissions.** Pas dans `ipMay` (hors interne). Interdit : décider, viser, localiser, émettre un ordre, confirmer une cérémonie.

---

## 2. Récipiendaire (`recipient`)

**Responsabilités.** Consulter son parcours, distinctions, affiliations, cérémonies, photos d’illustration (jamais de photo personnelle). Confirmer une invitation d’affiliation. Demander un retrait sans cérémonie (quittance + autorisation). Aucun montant FCFA.

**Pages.** `overview`, `parcours` (distinctions, employeurs, cérémonies, photos), `withdrawals` / `withdrawal-request`, `actions`, `notifications`, `profile`.

| Besoin | Page | Référence | Action | Règle |
| --- | --- | --- | --- | --- |
| Parcours | `parcours` | timeline | Consulter | Affiliations `EN_ATTENTE` non actives |
| Distinctions | `recipients` | badges métal | Consulter | Tous employeurs |
| Retrait sans cérémonie | `withdrawal-request` | wizard | Déposer | Quittance + autorisation ; inspecteur vérifie, régisseur remet |
| Actions | `actions` | liste | Ouvrir le dossier / pièce | Uniquement ce qui le concerne |
| Cérémonie | `ceremonies` | calendrier / fiche | Confirmer **sa** présence si invitée | Pas de validation de date administrative |

**Conserver.** `portalPerson*` , magasin personne, interdiction FCFA.

**Livré.** Accueil cliquable (distinctions, invitations, actions, retraits) ; file « Ce qui vous concerne » ; notifications groupées par date, sans bouton de simulation. Toujours aucun FCFA.

---

## 3. Secrétariats (`secretariat_ministre` / `_dgt` / `_dr`)

**Responsabilités.** Enregistrer et transmettre le courrier du **seul** niveau. Mettre à jour la localisation physique. Ne statue pas.

**Permissions `ipMay`.** `transmit` uniquement.

**Pages `ipNav`.** `overview`, `inbox`, `mail-register`, `mail-transmit`, `localisation`, `history`, `notifications`, `profile`.

| Besoin | Page | Référence | Action | Règle |
| --- | --- | --- | --- | --- |
| Volumes | `overview` | KPI cliquables | Ouvrir la file | Périmètre du secrétariat |
| Boîte | `inbox` | liste + visionneuse | Consulter | Date, expéditeur, référence |
| Enregistrer | `mail-register` | formulaire | Attribuer une référence | Pas de décision |
| Transmettre | `mail-transmit` | confirm-bar | Transmettre à l’autorité | `transmit` |
| Localisation | `localisation` | tableau | Consulter / noter | Jamais exposé au demandeur |

**Livré.** Accueil avec files « à enregistrer / à transmettre » ; recherche sur la boîte. **Conserver.** `cfSecInbox`, `cf-confirm-bar`. **Ne pas** donner `approve` / `visa-doc`.

---

## 4. Autorités — Ministre, DGT, DR

**Responsabilités.**
- **DR** : décision de **première instance** (`approve`, `reject`).
- **Ministre / DGT** : **orientation** (`cascade`) + rejet possible ; pas d’instruction à la place du Service.
- Les trois : recours, relances, cérémonies **de leur niveau** ; visa / cachet / signature documentaire (`visa-doc`, `stamp-doc`, `sign-doc`).

**Pages.** `overview`, `dossiers`, `dossiers-transmis`, `dossiers-stats`, `recours`, `recours-historique`, `relances`, `ceremonies`, `calendar`, `notifications`, `profile`.

| Besoin | Page | Référence | Action | Règle |
| --- | --- | --- | --- | --- |
| File du niveau | `dossiers` | chips + tableau | Ouvrir, décider / orienter | `cfAuthQueue(role)` |
| Décider (DR) | détail + confirm-bar | badge + circuit | Approuver / rejeter | `approve` / `reject` — DR seulement pour 1re instance |
| Orienter (Ministre/DGT) | détail | indications | `cascade` | Pas d’étude des récipiendaires |
| Recours / relances / cérémonies | pages dédiées | listes proto | Statuer au niveau | `recours-ok`, `relance-ok`, `cer-ok` |
| Visa document | visionneuse | `.visa-zone` | Viser / cacheter / signer | Libellé : ce n’est pas une signature électronique juridique |
| Stats | `dossiers-stats` | `GOCharts` | Consulter la **file du niveau** | Pas les stats nationales du Chef |

**Ne pas** unifier les trois tableaux de bord.

**Livré.** Accueil par niveau : KPI + file des plus anciens. Recherche sur le bureau.

---

## 5. Agent du Service (`service_agent`)

**Responsabilités.** Instruire, demander des compléments, valider/refuser **individuellement** un récipiendaire, suivre relances/recours **sans statuer**, préparer un **brouillon** de délégation. Ne dépose pas un dossier neuf. N’émet pas l’ordre. Ne valide pas une date. Ne reconnaît pas un demandeur.

**`ipMay`.** `start-study`, `rec-ok`, `rec-no`, `finish-instr`, `flag-anomaly`, `save-del-draft`.

**Pages.** `overview`, `instruction`, `recipients`, `completeness`, `complements`, `waiting-pieces`, `agent-relances`, `agent-recours`, `delegations-draft`, `notifications`, `profile`.

| Besoin | Page | Référence | Action | Règle |
| --- | --- | --- | --- | --- |
| Instruire | `instruction` | fiche sections | Décision individuelle | Pas d’ordre, pas de cérémonie |
| Compléments | `complements` / `waiting-pieces` | liste + motif | Demander | Le demandeur répond dans **son** espace |
| Délégation | `delegations-draft` | formulaire | Brouillon | Modèle officiel non figé |

**Livré.** Accueil avec file d’instruction et compléments ouverts. Pas d’ordre ni de cérémonie.

---

## 6. Inspecteur (`service_inspecteur`)

**Responsabilités.** Contrôler pièces, signaler des anomalies, vérifier quittance/autorisation d’un retrait sans cérémonie. **Aucune** validation de médaille, ordre, liste, cérémonie.

**`ipMay`.** `flag-anomaly`, `wd-ok` (vérification, pas remise).

**Pages.** `overview`, `instruction`, `justificatifs`, `controles-recip`, `anomalies`, `retraits`, `verify-history`, `notifications`, `profile`.

**Interdit.** Graphiques financiers, boutons Approuver/Notifier/Ordre/Valider date. Notices `N-INS-*` déjà prévues : ne pas les marquer « test ».

**Livré.** Accueil avec contrôles, retraits et signalements — sans décision.

---

## 7. Chef du Service (`service_chef`)

**Responsabilités.** Supervision de l’instruction, notification de liste, **ordre de recette** (≠ paiement), calendrier et négociation de cérémonies, délégations/diplômes, demandeurs reconnus, archives, statistiques.

**`ipMay`.** `start-study` / `rec-ok` / `finish-instr`, `notify-list`, `issue-order` / `go-order`, `val-date`, `gen-del` / `gen-dip`, `nego-svc`, `visa-doc` / `stamp-doc` / `sign-doc`, `save-del-draft`.

**Pages.** `overview`, `instruction`, `ready`, `notify`, `orders`, `payments-follow`, `calendar`, `cer-demandes`, `delegations`, `stats`, `applicants`, `archives`, `notifications`, `profile`.

| Besoin | Page | Référence | Action | Règle |
| --- | --- | --- | --- | --- |
| Ordre | `orders` | wizard + confirm-bar | Émettre | Distinct du paiement Trésor |
| Calendrier | `calendar` | `.cal-grid` + `GOMap` repli | Proposer / valider date | Proposée ≠ verte ; `val-date` = Chef |
| Stats | `stats` | `GOCharts` | Consulter | Données `cfS()`, pas le seed proto |

**Livré.** Accueil : listes à notifier + ordres (libellé ordre ≠ paiement).

---

## 8. Régisseur (`regisseur`)

**Responsabilités.** Stock, mouvements, commandes d’approvisionnement (≠ ordres de recette), livraisons, budget, **une** remise après quittance conforme, retraits sans cérémonie au guichet.

**`ipMay`.** `do-remise`, `qui-ok`, `wd-ok`.

**Pages.** `overview`, `stock`, `diplomas`, `movements`, `orders`, `deliveries`, `suppliers`, `budget`, `remises`, `retraits`, `tarifs`, `reg-stats`, `notifications`, `profile`.

**Conserver.** `cfRemise` refuse une seconde sortie. Page `orders` = bons, jamais ordres Chef.

**Livré.** Accueil : stock, guichet (quittances / retraits) et derniers mouvements.

---

## 9. Administrateur (`admin`)

**Responsabilités.** Comptes, cachets, signatures techniques, campagnes (dates, pas une décision de médaille), journaux. **Pas** décideur métier.

**`ipMay`.** `toggle-user`.

**Pages.** `overview`, `users`, `internal-accounts`, `campaigns`, `stamps`, `signatures`, `journal`, `journal-sig`, `alerts`, `notifications`, `profile`.

**Interdit.** File de dossiers, ordres, remises, localisation.

**Livré.** Accueil : comptes à revoir + journal récent. Pas de file métier.

---

## 10. Composants communs (après la matrice)

| Composant masterclass | Où l’appliquer | Contrainte FrontII |
| --- | --- | --- |
| Barre de défilement tricolore | Coquille portail + interne | Garder `#fcfcfa` ; pas d’aplat beige |
| `.page-head` compact | Pages hors accueil | Intern : garder `class="ws-hero ws-appear"` |
| Chips + tableau responsive | Listes dossiers | Statuts du magasin du rôle |
| Wizard chrome | `new-dossier` (6 étapes), cérémonie, retrait | Pas les 4 étapes proto |
| Timeline | Historique dossier | — |
| Calendrier | Cérémonies | `ws-calendar` côté Chef (tests) |
| Carte | Lieux | Schéma si pas de tuiles |
| `GOCharts` | Stats Chef / DR / demandeur stats | Données locales |
| Notifications groupées | Pages notifications | Lien métier |
| Confirm | Interne : `cf-confirm-bar` ; portail : overlay existant | Pas d’`alert()` |

---

## 11. Ordre d’intégration

1. **Ce fichier** (fait).
2. Composants communs : barre de scroll, chips, sections, chrome wizard — **sans** changer `ipNav` / `ipMay`.
3. **Profil Demandeur complet** (accueil → dossiers → détail → compléments → relances → recours → courriers → wizard → cérémonies → notifications).
4. Tests Demandeur, puis `npm test`.
5. Autres profils **un par un**, en suivant les tableaux ci-dessus.

Les écrans d’un rôle ne sont pas des copies les uns des autres : même DA, responsabilités distinctes.
