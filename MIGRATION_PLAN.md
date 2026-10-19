# Plan et rapport de migration — site multipage

> Ce document remplace l'ancienne navigation par hash. Il décrit l'audit
> réalisé avant modification, la décision d'architecture, la correspondance
> des URL, les ressources mutualisées et les vérifications exécutées.

## 1. Audit préalable (avant toute modification)

| Constat | Preuve |
| --- | --- |
| Aucun backend dans le dépôt : pas de `composer.json`, pas de Laravel, pas de routes serveur, pas d'API. | inventaire racine, `package.json` (Tailwind + serveur statique seulement) |
| Application HTML/CSS/JS natif, un seul document `index.html`. | `index.html` historique, 35 scripts classiques |
| Navigation uniquement par hash (`#/`, `#/login`, `#/app/<rôle>/<page>`), rendu dans `#app`. | `js/router.js`, `js/app.js` (ancienne version) |
| 13 rôles métier, 14 comptes de démonstration. | `js/data.js` (`ROLE_ORDER`), `js/demo-accounts.js` |
| Pages métier rendues par GAB-ORIENT (`ipNav`, `goViewFor`, vues `views-*.js`). | `js/views/internal-portal.js`, `js/views/go-pages.js` |
| Permissions déjà centralisées (`ipMay`, `GO.can`, périmètres `scope`). | `js/views/internal-portal.js`, `js/gab-orient/bridge.js` |
| Métier à ne pas modifier : cycle `SOUMIS → … → CLOTURE`, tarifs, éligibilité 10/20/30 ans, niveaux `ministre → dgt → dr`. | `js/cf-store.js`, `js/gab-orient/data.js` |
| Aucun navigateur headless dans l'environnement. | vérification des binaires disponibles |
| Les tests existants s'appuient sur le hash et sur `app.js` monolithique. | `tests/dossier-drawer.cjs`, `tests/go-live-path.cjs`, `tests/smoke.cjs` |

Conclusion : pas de Laravel, donc **HTML statique** (pas de Blade). Le métier,
les vues et les permissions restent dans les modules existants ; seule la
couche de navigation et de montage change.

## 2. Décision d'architecture

- Une **URL réelle par page métier**, regroupée par famille fonctionnelle.
- **Aucun routeur client** : `navigateTo()` déclenche un chargement de
  document (`location.assign`), `currentPath()` lit `location.pathname`.
- La navigation est faite de **vrais liens `<a href>`** ; les contrôleurs
  d'action restent des boutons quand ils modifient l'état de la page.
- Le **rôle n'est jamais dans l'URL** : il vient de la session
  (`js/auth.js`) ou du profil de présentation (`js/portal-demo.js`). Une
  famille d'URL est donc partagée par plusieurs utilisateurs, avec leurs
  propres données et permissions.
- Les documents HTML sont **générés** par `tools/build-pages.mjs` à partir
  des mêmes modules que le runtime (aucun contenu métier dupliqué) ; ils ne
  contiennent que la coquille : en-tête, navigation, `#view`, panneaux.

## 3. Arborescence et correspondance des URL

```text
/
├── index.html                       accueil public
├── connexion/index.html             connexion
├── inscription/index.html           inscription
├── profil/
│   ├── demandeur/<page>/            espace demandeur (entreprise + ministère)
│   ├── recipiendaire/<page>/        espace récipiendaire
│   ├── secretariat/<page>/          3 secrétariats (ministre, DGT, DR)
│   ├── direction/<page>/            ministre, DGT, DR
│   ├── service/<page>/              3 rôles du Service des Distinctions
│   └── regie/<page>/                régie des médailles
└── administration/<page>/           administration
```

| Ancienne URL | Nouvelle URL |
| --- | --- |
| `#/` | `/` |
| `#/login`, `#/connexion` | `/connexion/` |
| `#/register`, `#/inscription` | `/inscription/` |
| `#/app/demandeur/<page>` | `/profil/demandeur/<page>/` |
| `#/app/recipient/<page>` | `/profil/recipiendaire/<page>/` |
| `#/app/secretariat_ministre\|dgt\|dr/<page>` | `/profil/secretariat/<page>/` |
| `#/app/ministre\|dgt\|dr/<page>` | `/profil/direction/<page>/` |
| `#/app/service_agent\|inspecteur\|chef/<page>` | `/profil/service/<page>/` |
| `#/app/regisseur/<page>` | `/profil/regie/<page>/` |
| `#/app/admin/<page>` | `/administration/<page>/` |
| `#/dossiers/<ref>` | `<espace>/dossiers/?ref=<ref>` |

Un favori `#/app/...` est traduit une seule fois au chargement
(`redirectLegacyHash()` dans `js/app.js`), puis le navigateur ouvre la page
réelle. La page d'accueil vide `#/` est servie par `/`.

### Pages par famille

| Famille | Base | Pages |
| --- | --- | --- |
| Demandeur | `/profil/demandeur/` | overview · dossiers · new-dossier · recipients · complements · recours · documents · ceremonies · payments · pieces · journal · notifications · profile |
| Récipiendaire | `/profil/recipiendaire/` | overview · dossiers · documents · ceremonies · distinctions · retraits · notifications · profile |
| Secrétariat | `/profil/secretariat/` | overview · dossiers · new-dossier · documents · inbox · ceremonies · journal · notifications · profile |
| Direction | `/profil/direction/` | overview · dossiers · decisions · recours · documents · ceremonies · stats · journal · notifications · profile |
| Service | `/profil/service/` | overview · dossiers · instruction · supervision · recipients · complements · recours · documents · ceremonies · remises · orders · stats · journal · controle · notifications · profile |
| Régie | `/profil/regie/` | overview · dossiers · documents · ceremonies · remises · orders · stock · retraits · journal · notifications · profile |
| Administration | `/administration/` | overview · journal · users · notifications · profile |

Les alias historiques (`relances`, `withdrawals`, `mail-register`,
`waiting-pieces`, `employees`…) sont résolus par `siteCanonicalPage()` vers la
page métier qui les rend réellement ; ils ne créent pas de nouvelles URL.

## 4. Ressources mutualisées

- **Layout** : `tools/build-pages.mjs` (une seule coquille pour les 72 pages).
- **En-tête, navigation, menus, recherche, notifications, profil** :
  `js/site/chrome.js` + HTML statique généré.
- **Montage de page** : `js/site/workspace-page.js`
  (`siteRepaintWorkspace`, `siteMountWorkspace`, refus d'accès, `?ref=`).
- **Session et gardes** : `js/site/routes.js`, `js/site-config.js`.
- **Contenu métier** : modules existants inchangés (`cfBanner`, `cfContent`,
  `js/gab-orient/views-*.js`, `js/views/go-ui.js`).
- **CSS** : `css/app.css` (principal), puis `cf.css`, `gab-orient.css`,
  `meditra.css` et `css/site.css` (compléments du multipage).
- **JS partagé** : les 35 modules existants + 4 modules de site ; aucune
  dépendance ajoutée à l'exécution.
- **Génération** : `npm run build:pages` (Node seul, sans dépendance).

## 5. Contrôle d'accès

- `sitePageAllowed(role, page)` vérifie la famille, la présence de la page
  dans la famille et la vue réellement rendue (`goHasView`/`goViewFor`).
  `new-dossier` exige en plus `GO.can('create')`, comme le formulaire.
- `siteMountWorkspace()` redirige un visiteur anonyme vers
  `/connexion/?next=<url>` et affiche « Espace non autorisé » ou « Page
  indisponible » si la famille ou la page ne correspond pas au rôle.
- La navigation statique est filtrée au chargement par
  `siteChromeFilterNav()` : un rôle ne voit que les pages qu'il peut ouvrir.
- Modifier l'URL ne donne accès ni à une autre famille, ni à une page d'un
  autre rôle : le rôle est relu dans la session, pas dans le chemin.

> **Limite explicite** : ce dépôt ne contient aucun serveur. Ces contrôles
> sont donc exécutés côté navigateur. En production, les mêmes règles
> doivent être appliquées par l'API et le rendu serveur ; le frontend ne
> peut pas, à lui seul, garantir la confidentialité des données.

## 6. Vérifications exécutées

| Vérification | Résultat |
| --- | --- |
| `node --check` sur tous les modules modifiés | OK |
| `npm test` (139 tests) | 139 réussis, 0 échec |
| `tests/multipage.cjs` (nouveau) | 72 routes ↔ 72 fichiers, titres uniques, aucun lien mort, gardes de famille OK |
| Rendu réel des 72 pages (jsdom, scripts exécutés) | contenu et `<h1>` présents, aucune erreur JS |
| Chargement d'une page par lien de navigation (jsdom) | navigation de document déclenchée |
| Lien profond `?ref=` | dossier rouvert sur la bonne page |
| Accès croisé (`demandeur` → `/administration/users/`) | « Espace non autorisé » |
| Démonstration : 14 profils, sélection d'un profil | session de présentation posée + navigation |
| Menus compte / notifications / mobile | ouverture et fermeture OK |
| Parcours HTTP réel (76 pages, 111 ressources) | 200 pour toutes, types MIME corrects, 0 lien mort |
| Adresse inexistante | page 404 stylée (et non un écran blanc) |

Les tests jsdom ne remplacent pas une validation visuelle : aucun navigateur
graphique n'est disponible dans l'environnement. Les pages ont été vérifiées
structurellement et par exécution réelle des scripts.

## 7. Points restants

1. **Backend absent** : authentification réelle, autorisations serveur,
   persistance et API restent à raccorder (`DN_AUTH_ENDPOINT`,
   `DN_REGISTRATION_ADAPTER`). Tant qu'ils sont absents, seuls les comptes de
   démonstration permettent d'explorer les espaces.
2. Les documents de conception antérieurs (`PROJECT_STATUS.md`,
   `docs/PAGES_MAP.md`, etc.) peuvent encore mentionner le hash ; ce plan et
   `PAGES_MAP.md` font foi.
3. Le site doit être servi par un serveur HTTP (les URL absolues ne
   fonctionnent pas en `file://`) : `npm run serve`.
4. Les documents rattachés à un dossier hors périmètre affichent désormais
   une fiche « Dossier non accessible » au lieu d'une erreur d'exécution ;
   la cause racine (périmètre des pièces du jeu de démonstration) reste à
   revoir avec le futur backend.
5. **Le site doit rester servi** (`npm run serve`). Les URL sont absolues :
   un hébergement en sous-dossier (par exemple un site de projet GitHub
   Pages) exigerait une base configurable. Un garde-fou visible remplace
   l'écran blanc si les fichiers ne se chargent pas.
