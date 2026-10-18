# Récapitulatif de mission — complément Demandeur

**Projet :** Distinctions Nationales (frontend HTML / CSS / JS pur)  
**Périmètre :** espaces **Demandeur Entreprise** et **Demandeur Ministère**  
**Contrainte :** ne pas tout reprendre à zéro ; s’appuyer sur le frontend existant.

---

## 1. Ce qui était demandé

Compléter le frontend de démonstration pour que l’espace Demandeur (entreprise **et** ministère) couvre réellement :

1. **Employés** — menu déroulant (liste, enregistrement, statistiques)
2. **Distinctions** — vue d’ensemble, liste par employé, filtres, graphiques
3. **Finance** — tableau de bord, dépenses par dossier, évolution annuelle
4. **Cérémonies** — menu déroulant (demande, calendrier, mes cérémonies + stats)
5. **Données de démo cohérentes** entre toutes ces pages
6. **Planche graphique** `docs/design-reference.html` à partir du CSS réel
7. **Documentation** : mise à jour des docs existantes + nouveaux fichiers modules

---

## 2. Règles métier à respecter

| Sujet | Règle |
|---|---|
| Formulaire personne | Un seul formulaire pour **employé** et **récipiendaire** du wizard « Nouveau dossier » |
| Enregistrement employé | Crée une fiche + affiliation `EN_ATTENTE` — **ne crée pas** de demande de distinction |
| Wizard nouveau dossier | Ajouter un récipiendaire **n’enregistre pas** automatiquement un employé |
| Affiliation | Actif / invitation en attente / ancienne affiliation, clairement distingués |
| Anciennes affiliations | Consultables, **pas** de modification rétroactive |
| Pièces médicales | Uniquement dans la fiche individuelle, jamais dans les tableaux généraux |
| Finance | Un ordre de recette **n’est pas** un paiement ; distinguer émis / payé / reste |
| Tarifs | Fictifs, centralisés, mentionnés comme non officiels |
| Évolution annuelle | Pourcentage si calculable ; **aucune cause inventée** |
| Cérémonie | Toujours liée à un dossier éligible de **la** structure connectée |
| Carte | Pas de Leaflet / géocodage réel — bandeau « Mode démonstration — lieux prédéfinis » |
| Photo de lieu | Illustration neutre, jamais présentée comme une photo du site |
| Personne (`recipient`) | Ne voit **jamais** de montants FCFA |
| Entreprise / Ministère | Même rôle `demandeur`, données **cloisonnées** |

---

## 3. Ce qui a été fait (livrable)

### 3.1 Données uniques

- `js/demo-store.js` : enrichissement de `PORTAL_DEMO` + magasin `DemoStore` (`localStorage` `dn.demo.store.v2`)
- Entreprise SGI : **6 dossiers** (dont `DNG-DEMO-2026-030`), **7 employés**, **14 distinctions**, 4 ordres, 4 cérémonies
- Ministère : jeu distinct (pas les dossiers SGI)
- Tarifs : Bronze 12 000 / Argent 18 000 / Or 24 000 FCFA (`DEMO_TARIFFS`)
- 10 lieux prédéfinis (`DEMO_PLACES`)

### 3.2 Pages Demandeur

| Menu | Route | Contenu |
|---|---|---|
| Dossiers ▾ | `#/app/demandeur/dossiers` | Liste existante, conservée |
| | `#/app/demandeur/new-dossier` | Wizard ; étape 3 = même formulaire personne |
| Employés ▾ | `#/app/demandeur/employees` | Liste, filtres, tri, pagination, fiche |
| | `#/app/demandeur/employee-new` | Enregistrement + confirmation |
| | `#/app/demandeur/employee-stats` | Indicateurs cliquables + graphiques |
| Distinctions | `#/app/demandeur/distinctions` | Totaux, donut, barres, liste par employé |
| Finance | `#/app/demandeur/payments` | Dashboard, détail par dossier, évolution, CSV |
| Cérémonies ▾ | `#/app/demandeur/ceremony-request` | Wizard 3 étapes + carte démo |
| | `#/app/demandeur/ceremony-calendar` | Mois / liste, même source |
| | `#/app/demandeur/ceremonies` | Listes, fiches, statistiques |

Fichiers principaux : `js/views/portal-extras.js` (modules), `js/views/portals.js` (câblage), `js/app.js` (sticky, dirty-check, carte, clavier).

### 3.3 Interface commune

- Header sticky 64 px (`.portal-chrome`)
- Menus déroulants (clic, Entrée / Espace, Échap, flèche bas, mobile)
- Confirmation d’abandon si formulaire modifié
- Bouton « retour en haut » (seuil 460 px) sur les espaces connectés

### 3.4 Design

- Styles extraits de `css/theme.css` (pas d’identité inventée)
- CSS recompilé : `css/app.css`
- Planche autonome : **`docs/design-reference.html`**
- Dossier d’accueil des gravures : `assets/illustrations/`

### 3.5 Documentation produite ou mise à jour

**Nouveaux**

- `EMPLOYEES.md`
- `DISTINCTIONS.md`
- `FINANCE.md`
- `CEREMONIES.md`
- `DESIGN_SYSTEM.md`
- `PROJECT_STATUS.md`
- `docs/design-reference.html`
- `assets/illustrations/README.md`

**Mis à jour**

- `PAGES_MAP.md`
- `PROFILES_AND_INTERFACES.md`
- `ROLE_PERMISSIONS.md`
- `CALENDAR.md`
- `FRONTEND_DEMO.md`
- `README.md`

### 3.6 Tests

- `tests/portal.cjs` : 14 distinctions, 6 dossiers, `DNG-DEMO-2026-030`, modules, cloisonnement ministère, pas de FCFA côté personne
- `tests/smoke.cjs` : nouveaux scripts + planche graphique
- Résultat : **28 / 28** (`npm test`)

---

## 4. Ce qui n’était pas à faire (limites)

- Pas de backend, pas d’e-mail réel, pas de géocodage
- Pas de photographie réelle de lieu
- Pas de drag-and-drop calendrier, pas de vue semaine / jour
- Pas de propagation automatique des écritures Demandeur vers les profils internes
- Ne pas remplacer les gravures d’accueil existantes par des placeholders

---

## 5. Comment vérifier

```bash
# Tests
npm test

# CSS livré à jour (comme la CI)
npm run css
git diff --exit-code -- css/app.css
```

En présentation (`file://`, localhost, aperçu Arena) :

1. Connexion → « Explorer la démonstration »
2. Compte `demo.entreprise@example.test` / `Demo123!`
3. Parcourir Employés, Distinctions, Finance, Cérémonies
4. Changer de profil vers le ministère : données différentes
5. Compte personne : aucune mention FCFA
