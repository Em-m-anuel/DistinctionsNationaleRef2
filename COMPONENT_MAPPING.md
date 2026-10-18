# Cartographie des composants — référence GAB-ORIENT ↔ application FrontII

Date : 2026-10-15.

- **Prototype** : `design-reference/` (copie de [DistinctionsNationaleReference](https://github.com/Em-m-anuel/DistinctionsNationaleReference.git)).
- **Application** : SPA hash vanilla, racine `index.html`, espaces `#/app/<rôle>/<page>`.
- **Cette phase** : analyse et préparation. **Aucune réécriture globale n’a été lancée.**

Le prototype n’a **pas** été substitué à l’application. Aucun fichier métier existant n’a été écrasé pour cette intégration.

---

## 0. Dépôt et branche

| | |
| --- | --- |
| Dépôt | `Em-m-anuel/DistinctionsNationale_FrontII` |
| Branche de session | `arena/c9ea4d54-distinctionsnationale-frontii` |
| Référence ajoutée | `design-reference/` (nouveau dossier) |
| Architecture app | HTML / CSS / JS classiques, **pas** Laravel/Blade, **pas** React |
| Magasin métier | `js/cf-store.js` (`dn.cf.store.v1`) |
| Magasin prototype | `gab-orient.prototype.state` — **ne pas fusionner** |

Arborescence utile de l’application :

```
index.html
css/{theme.css, app.css, cf.css}
js/{cf-app.js, cf-store.js, ui.js, data.js, router.js, …}
js/views/{home, login, portals, portal-extras, internal-portal, workspace, admin, …}
assets/
tests/
docs/
design-reference/     ← prototype (nouveau)
```

Fichiers de référence analysés :

| Fichier | Rôle | Lignes (approx.) |
| --- | --- | --- |
| `design-reference/index.html` | Coquille, sprite SVG, conteneurs globaux | 157 |
| `design-reference/DESIGN_REFERENCE.md` | Règles DA et comportements | 186 |
| `design-reference/assets/css/gab-orient.css` | Tokens → composants → vues → responsive | 1174 |
| `design-reference/assets/js/data.js` | Dictionnaires + seed | 347 |
| `design-reference/assets/js/core.js` | État, routeur, shell, modales, drawers | 687 |
| `design-reference/assets/js/charts.js` | SVG bar / line / donut / hbar | 142 |
| `design-reference/assets/js/map.js` | Leaflet ou plan schématique | 108 |
| `design-reference/assets/js/views-dossiers.js` | Aperçu, liste, panneau, actions | 564 |
| `design-reference/assets/js/views-courriers.js` | Courriers, visionneuse, notifications | 368 |
| `design-reference/assets/js/views-ceremonies.js` | Calendrier, lieux, dates | 474 |
| `design-reference/assets/js/views-stats-form.js` | Stats, wizard 4 étapes, profil | 435 |

Dépendances externes du prototype (toutes facultatives) :

- Google Fonts : Public Sans, Source Serif 4
- Leaflet 1.9.4 (cdnjs) + tuiles OSM

Vérification locale : serveur `python3 -m http.server 8010` dans `design-reference/`. Sans Leaflet (réseau restreint), le plan schématique est le repli prévu.

---

## A. Structure commune

### A1. Identité institutionnelle

| | Prototype | Application | Adaptation |
| --- | --- | --- | --- |
| Nom | Emblème étoilé, anneau tricolore conique, « République gabonaise / Distinctions nationales / GAB-ORIENT » | `emblem()` + « République Gabonaise / Distinctions Nationales » (`ipHead`, accueil) | **Améliorer** : reprendre l’anneau conique et le mot-marque GAB-ORIENT **en plus** de l’emblème existant, sans supprimer `assets/` validés |
| Fichiers proto | `index.html` `.brand` `.emblem` ; CSS §3 | `js/ui.js`, `css/theme.css` | Réutiliser le HTML/CSS de `.emblem` dans `ipHead` / header public |
| Interactions | lien `#/apercu` | `data-action="nav" data-path="/"` | Conserver les routes existantes |
| Responsive | `.brand-app` masqué ≤ 760 px | déjà compact | garder |

### A2. Navigation supérieure (deux lignes)

| | Prototype | Application | Adaptation |
| --- | --- | --- | --- |
| Ligne 1 | logo, recherche Ctrl+K, cloche, compte | logo, Accueil public, recherche, cloche, compte | **Conserver** le principe 2 lignes ; **améliorer** recherche (libellé + `kbd`) |
| Ligne 2 | `NAV` filtrée par `role().views` + sous-menus | `ipNav` / `portal-tabs` / `portal-nav-drop` | **Conserver** les menus par rôle (ne pas importer le NAV unique du proto) |
| Page active | `aria-current="page"` + trait vert | `.active` + `::after` vert | Aligner `aria-current` |
| Fichiers proto | `core.js` `renderNav`, CSS `.site-header` `.main-nav` | `internal-portal.js` `ipHead` `ipTabs` | Adapter le CSS, pas le graphe de pages |
| Hauteur | 64 + 46 = 112 px (`--header-h`) | déjà sticky | Réduire le padding si trop haut ; ne pas recouvrir |

### A3. Menus déroulants

| | Prototype | Application | Adaptation |
| --- | --- | --- | --- |
| API | `[data-dd]`, Échap, flèches, clic extérieur, `is-leaving` | `data-cf-action="menu|account|notices"` | **Améliorer** fermeture Échap/flèches (partiellement absente) |
| Compte | changer de rôle **dans le proto uniquement** | switcher de présentation **uniquement à la connexion** | **Ne pas** exposer le switcher de rôles dans les profils internes (règle FrontII) |

### A4. Navigation mobile

| | Prototype | Application | Adaptation |
| --- | --- | --- | --- |
| | tiroir `.mobile-nav` ≤ 1060 px, backdrop, Échap | `.cf-mobile-nav` ≤ 760 px | **Améliorer** : tiroir overlay + focus trap du proto, seuils 1060 |

### A5. Progression de défilement (drapeau)

| | Prototype | Application | Adaptation |
| --- | --- | --- | --- |
| | `.progress-rail` / `.progress-fill` largeur = scroll % | `.auth-topline` **fixe** 3 px | **Créer** la barre liée au scroll (en plus ou à la place du liseré fixe). Les 3 couleurs uniquement ici + emblème + footer |

### A6. Pied de page

| | Prototype | Application | Adaptation |
| --- | --- | --- | --- |
| | `.site-footer` + `.flag-dots` + raccourcis clavier | `.portal-footer` | **Améliorer** points tricolores ; raccourcis optionnels |

### A7. Notifications globales (cloche)

| | Prototype | Application | Adaptation |
| --- | --- | --- | --- |
| | menu 380 px, non-lus, lien vers la page | `cfNoticesPop` | **Améliorer** densité (titre / date séparés) comme `.dd-notif-item` |
| Compteur | bump animé `.count.is-bump` | `.portal-notif-count` | Ajouter l’animation bump |

### A8. Compte utilisateur

| | Prototype | Application | Adaptation |
| --- | --- | --- | --- |
| | avatar navy, nom, rôle, menu | `.portal-account` | **Conserver** ; avatar navy du proto plutôt que pastille verte |

### A9. Retour en haut

| | Prototype | Application | Adaptation |
| --- | --- | --- | --- |
| | `#to-top` après 1 écran | `.home-back-top` (seuil + animation, tests) | **Conserver** le bouton existant (contrats de tests). Aligner le style visuel si besoin |

### A10. Recherche globale

| | Prototype | Application | Adaptation |
| --- | --- | --- | --- |
| | `GO.openSearch()`, Ctrl+K, `/`, palette | `cfSearchPalette`, Ctrl+K (testé) | **Améliorer** UI palette ; garder le câblage existant |

---

## B. Système visuel

| Élément | Prototype (classes / tokens) | Application | Stratégie |
| --- | --- | --- | --- |
| Palette | `--navy-900 #0c1f3a`, `--green-600 #009e60`, `--yellow-500 #fcd116`, `--blue-600 #3a75c4`, `--bg #f3f5f9` | `#102A50` / `#009b62` / `#d6a72c` / `#315c91` / `#fcfcfa` | **Rapprocher** les tokens dans `css/cf.css` / `theme.css` sans jeter Inter/Lora. **Interdit** : aplat beige |
| Typo | Public Sans 14–15, Source Serif 4 titres 28 | Inter, Sora, Lora | **Ne pas** changer les fonts du site public sans décision. En interne : titres de page plus « serif / display », corps 14–15 |
| Espacements | grille 4, gouttière 20, padding carte 18, conteneur 1320 | variables, parfois trop d’air | **Améliorer** densité (page-head compact) |
| Bordures / rayons | `--r-sm 6` `--r-md 8` `--r-lg 12`, `--line #e2e7ee` | 10–18 px, `#e5eaf0` | Aligner rayons 8–12 |
| Ombres | `--shadow-xs/sm/md/lg` navy | plus plates | Reprendre ombres courtes du proto |
| Boutons | `.btn` `-primary -secondary -navy -ghost -danger -sm -xs` | `.cf-btn` `.cf-accent` `.portal-primary-link` | **Mapper** les variantes ; primary = vert, navy = décision, ghost = secondaire |
| Champs | `.field .label .input .hint`, `GO.fieldError` | formulaires cf / portal | **Améliorer** erreurs inline (déjà en partie sur inscription) |
| Badges | `GO.statusBadge`, `.tone-*` | `cfBadge`, `.portal-badge-*` | **Créer** table de tons unique (slate/blue/yellow/navy/green/red) |
| Cartes | `.card .card-head .card-title .card-sub` | `.portal-paper` `.cf-paper` | **Améliorer** : toujours titre + sous-titre expliquant le contenu |
| Tableaux | `table.data-table.responsive` + `data-label` | `.portal-table` `.cf-table` | **Créer** le mode cartes ≤ 760 px |
| Onglets | `.tabs .tab-ink` glissant, clavier | `.cf-tabs` / pills | **Créer** l’encre glissante |
| Alertes | `.alert-info/warn/error/success` | `.cf-explain` `.portal-warn` | Mapper 4 tons |
| Modales | `GO.modal`, `GO.confirmDialog` (focus trap, checkbox bloquante) | `cf-confirm-bar` (tests : pas de `portal-modal`) | **Préserver** confirm-bar ; n’introduire une modale que si les tests sont mis à jour **et** le métier l’exige (visa, décision) |
| Panneaux | `GO.openDrawer` | `.cf-drawer` | **Améliorer** inert + Échap + largeur 480 |
| Chargement / vide | `GO.skeleton`, `GO.empty` | `.cf-empty` `.portal-skeleton` | Réutiliser empty du proto (icône, titre, texte, action) |
| Focus | `--focus` bleu 3 px | mixte | Unifier `:focus-visible` |

---

## C. Composants métier

### C1. Liste de dossiers

| | Prototype | Application | Adaptation |
| --- | --- | --- | --- |
| Vue | `GO.views.dossiers` `views-dossiers.js` | `cfDossierList`, `cfBureau`, `ipContent` par rôle | **Ne pas** une seule liste pour tous. Chef/agent : tableau type proto. Autorités : bureau 3 colonnes. Secrétariat : courriers |
| Données proto | `S.dossiers` statuts `recu…refuse` | `cfS().dossiers` `SOUMIS…CLOTURE` | **Ne pas** remplacer le cycle métier FrontII par celui du proto |
| Filtres | chips statut + compteur, période, tri | `cfFilters` | **Améliorer** chips + compteurs |
| Stepper | `GO.stepper` / `stepMini` | `cfFrise` / `cfCircuitHtml` | **Améliorer** le stepper visuel du proto |

### C2. Recherche, filtres, tri

Prototype : champs liste + Ctrl+K. App : `cfState.query/filter/sort`. **Améliorer** l’UI, conserver l’état.

### C3. Détail d’un dossier

| | Prototype | Application | Adaptation |
| --- | --- | --- | --- |
| | drawer sections `.d-section`, circuit, pièces, historique | `cfFiche`, `cfBureauRead`, `cfInstructionFiche` | **Améliorer** composition (sections) ; **préserver** boutons conditionnels `ipMay` |
| Décision proto | enregistre une décision **reçue** (référence courrier) | DR `approve`/`reject` | Documenter l’écart : FrontII simule l’acte de 1re instance du DR. Ne pas afficher un cachet officiel |

### C4. Récipiendaires

Proto : tableau dans le panneau, ancienneté calculée. App : `cfRecipientFields`, instruction par médaille. **Conserver** les règles (DTS non bloquante, décès > 2 ans informatif). Vermeil/Grand or du proto **≠** Or/Argent/Bronze FrontII — ne pas importer la nomenclature proto.

### C5. Courriers

Proto : `GO.views.courriers`, visionneuse `.viewer .paper`. App : `cfSecInbox`, `cfViewer`. **Améliorer** la visionneuse (papier à en-tête). Secrétariat : toujours enregistrer/transmettre seulement.

### C6. Aperçu documents / visa

Proto : `.visa-zone`, case d’attestation avant visa, « ne constitue pas une signature ». App : `cf-visa-slot` + boutons Viser/Cacheter/Signer (Chef + autorités). **Aligner** le libellé juridique du proto. **Ne pas** inventer un cachet.

### C7. Notifications

| | Prototype | Application | Adaptation |
| --- | --- | --- | --- |
| Vue | `GO.views.notifications` onglets Toutes/Non lues, catégorie, groupes de dates, marquer lu | `cfNotificationsPage` `.cf-notices` | **Déjà proche**. Reprendre toolbar + tab-ink + groupes de dates |
| Données | `aud: service` / `org:` | `to` + `roles` | **Préserver** le cloisonnement par rôle FrontII |
| Mentions démo | absentes des vues internes | interdites hors login | **Conserver** |

### C8. Graphiques

Proto : `GOCharts.mount` bar/line/donut/hbar, SVG, resize, `data-tip`. App : barres CSS `portal-bar-line` (demandeur). **Créer** en copiant `charts.js` **sans** le brancher au seed proto. Uniquement pages stats Chef / autorités. Inspecteur : pas de graphiques financiers.

### C9. Calendrier

Proto : `.cal-grid`, états `st-propose|negociation|confirme|termine|conflit`, clavier, Aujourd’hui. App : `cfCalendar` `ws-calendar` (tests). **Améliorer** CSS/états ; **garder** `ws-calendar` / `ws-calendar-grid`. Date proposée ≠ verte.

### C10. Sélection de lieu

Proto : `GOMap.create` Leaflet **ou** schéma + notice. App : `DEMO_PLACES` + SVG + `mapPickerHtml`. **Améliorer** en réutilisant `map.js` (repli schéma obligatoire si pas d’API). Pas d’image statique déguisée. Pas de photos de salles.

### C11. Formulaire multi-étapes

Proto : 4 étapes `.wizard-steps`, dropzone, attestation. App : `cfWizard` 6 étapes (courrier obligatoire, DTS non bloquante). **Conserver** le parcours 6 étapes métier. **Améliorer** le chrome visuel du wizard.

### C12. Confirmation d’action

Proto : modale + checkbox. App : `cf-confirm-bar` Annuler/Confirmer. **Préserver** tant que les tests l’exigent.

### C13. Historique

Proto : `ol.timeline .tl-dot.k-*`. App : `cf-hist`, `cfS().journal`. **Améliorer** le rendu timeline.

---

## D. Animations

| Interaction | Prototype | Application | Adaptation |
| --- | --- | --- | --- |
| Apparition sections | `.reveal` + IntersectionObserver, délai `--i` | `.ws-appear` `.portal-reveal` `.gab-rise` | **Conserver** + aligner durées 360–420 ms |
| Changement de vue | 240 ms | hash navigate + innerHTML | Pas de router proto |
| Panneaux | 360–420 ms slide | drawer existant | Aligner |
| Boutons | 140 ms hover | déjà | Aligner `--t-fast` |
| Statut | badge animé | badges statiques | **Créer** micro-transition |
| Wizard | 360 ms panneaux | cf-wizard | Aligner |
| Calendrier | 360 ms | cellules | Aligner today/event |
| Carte | Leaflet / schéma | SVG | Conserver notice de repli |
| Reduced motion | classe `reduce-motion` + MQ → 1 ms | `prefers-reduced-motion` dans theme/cf | **Ajouter** préférence profil optionnelle |

Règles proto : une seule direction, 6–18 px, pas de rebond, stagger 30–60 ms.

---

## E. Tableau de comparaison (décisions)

### Conserver (ne pas casser)

- Architecture SPA hash, `ipShell`, `ipNav` par rôle, `ipMay`
- Magasin `cf-store` et comptes de connexion
- Header sticky, `class="ws-hero ws-appear"`, `home-back-top`
- Confirm-bar (pas de succession d’`alert()`)
- Mentions de présentation **uniquement** à la connexion
- Cycle métier FrontII (SOUMIS → … → CLOTURE), tarifs, DTS, décès
- Isolation admin / inspecteur / secrétariat
- Tests `tests/*.cjs`

### Améliorer (première vague, après validation de cette cartographie)

1. Tokens de fond / cartes / page-head (densité)
2. Barre de scroll tricolore
3. Notifications (onglets encre, groupes de dates)
4. Liste dossiers (chips, tableau responsive)
5. Stepper / circuit visuel
6. Calendrier états (proposée non verte)
7. Visionneuse courrier + visa libellé

### Créer (en copiant depuis `design-reference/assets`, sans le seed)

- `GOCharts` (stats Chef)
- `GOMap` (cérémonies Chef, avec repli schéma)
- Tab ink, empty/skeleton unifiés, timeline

### Doublons à ne pas introduire

- Second routeur `GO.boot`
- Second magasin `gab-orient.prototype.state` dans l’app
- Second login / switcher de rôles interne
- NAV unique du proto à la place de `ipNav`

### Fonctions métier à préserver

Voir `ROLE_PERMISSIONS.md`. Le proto n’a que 3 profils (chef, agent, demandeur) : **insuffisant**. FrontII a 14 profils. Ne jamais donner `decide` à l’agent ou à l’inspecteur parce que le proto le montre au chef.

### Backend / intégrations

Aucun backend Laravel dans FrontII. Les manques restent ceux de `INTEGRATIONS_TO_COMPLETE.md` + tableau §10 du proto (API, GED, tuiles sous contrat, horodatage, SSO).

### Navigation — écarts

| Sujet | Risque |
| --- | --- |
| Remplacer `ipNav` par `NAV` du proto | menus faux pour DR, secrétariat, régisseur, admin |
| Hero proto `.page-head` vs `ws-hero` | tests exigent `class="ws-hero ws-appear"` : **garder la classe**, réduire le chrome |
| Modales proto vs confirm-bar | régression tests smoke/cf |
| Leaflet obligatoire | réseau ; toujours le schéma de repli |

### Risques de régression

- Changer les fonts de l’accueil public
- Fusionner les seeds
- Importer Vermeil / Grand or
- Afficher un visa comme signature
- Colorier une date proposée en vert
- Réécrire toutes les pages d’un coup

---

## F. Plan d’intégration progressif (non commencé)

1. **Documenté (cette livraison)** : copie `design-reference/`, `DESIGN_REFERENCE.md`, ce fichier.
2. **Coquille** : tokens, page-head compact, progress-rail, menus Échap.
3. **Notifications** : coller le comportement proto sur `cfNotificationsPage`.
4. **Dossiers / bureau** : chips + stepper, sections de détail.
5. **Cérémonies** : états calendrier + GOMap en repli.
6. **Stats Chef** : GOCharts sur données `cfS()`.
7. **Wizard demandeur** : chrome proto, règles FrontII.

Chaque palier : tests `npm test`, pas de mention démo interne, `ipMay` inchangé.

---

## G. Interactions réellement implémentées dans le prototype

Le proto n’est pas une maquette morte. `GO.boot()` câble :

- hash router + `views.*.render/update`
- persistance localStorage versionnée
- dossiers : filtres, recherche, drawer, instruction, complément, note, transmission, décision (si `can`)
- courriers : preview, visa avec case, zoom, illisible / renumérisation
- notifications : filtres, marquage, compteur
- calendrier clavier, proposition de lieu, conflits, jours fériés
- wizard 4 étapes + création `DNG-2026-019`
- 3 profils locaux

**Non opérationnel sans réseau** : tuiles Leaflet, webfonts. **Non juridique** : visa, décision, fichiers (nom/taille seulement).

Ne pas considérer un bouton FrontII comme « au niveau référence » tant que confirmation, historique, toast et statut ne sont pas liés comme ci-dessus.
