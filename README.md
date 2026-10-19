# Distinctions Nationales — version HTML / CSS / JavaScript

Conversion du dépôt [`Distinctions_Front`](https://github.com/Em-m-anuel/Distinctions_Front) (branche `main`, commit `225b38c`). Son archive `src.zip` a été extraite avant la conversion. La **version statique est maintenant à la racine du dépôt** : elle est prête à servir telle quelle. Le projet React d’origine, y compris son `src.zip` et les sources extraites, est conservé dans `react-original/`.

## Démarrage

**Le site doit être servi par un serveur HTTP** : c'est désormais un site
multipage avec des URL réelles (`/profil/...`, `/administration/...`), qui ne
fonctionnent pas en `file://`.

```sh
npm run serve          # node tools/serve.mjs --port 8000 --host 0.0.0.0
# puis http://localhost:8000
```

`tools/serve.mjs` (sans dépendance) sert les URL avec ou sans barre finale,
applique les bons types MIME et envoie `Cache-Control: no-store` sur le HTML,
le CSS et le JS : une page régénérée n'est jamais servie avec d'anciens
fichiers en cache. `npm run serve:python` reste disponible en secours.

> Le site utilise des URL absolues (`/css/…`, `/profil/…`) : il doit être
> servi **à la racine d'un domaine** (ou d'un sous-domaine), pas depuis un
> sous-dossier. Une page qui ne peut pas charger ses fichiers affiche
> désormais un message explicite au lieu d'un écran blanc.

Aucune compilation n'est nécessaire : **`css/app.css`** est déjà générée et
les 72 pages HTML sont livrées. Pour les régénérer après une modification de
`js/site-config.js` ou de la navigation :

```sh
npm run build:pages    # node tools/build-pages.mjs
```

Démarrage rapide : `/` (accueil) → `/connexion/` → « Explorer la
démonstration » → choisir un des 14 profils fictifs.

> **Test sur votre propre PC** (archive téléchargée, Windows/macOS/Linux,
> téléphone sur le même Wi-Fi, dépannage) : voir **`TESTER_EN_LOCAL.md`**.

> Les polices Google facultatives demandent une connexion Internet. Hors ligne, les polices de secours du système prennent le relais. Les illustrations SVG, le CSS et les scripts sont locaux.

## Arborescence

```text
Distinctions_Front/
├── index.html             # Squelette HTML et chargement des fichiers locaux
├── css/
│   ├── app.css            # Feuille CSS compilée, directement utilisable
│   └── theme.css          # Source modifiable (thème Tailwind v4 d’origine)
├── js/
│   ├── app.js              # Amorçage d'une page (accueil, auth, espace)
│   ├── site-config.js      # Familles, pages et URL (source unique)
│   ├── site/               # routes, chrome partagé, montage des pages
│   │   ├── routes.js
│   │   ├── chrome.js
│   │   └── workspace-page.js
│   ├── auth.js             # Connexion, sessions et validation
│   ├── data.js             # Données fictives historiques (six autres rôles)
│   ├── portal-demo.js      # Données fictives cloisonnées et mode présentation
│   ├── demo-store.js       # Magasin unique Demandeur (employés, distinctions, finance, cérémonies)
│   ├── icons.js            # Tracés SVG des icônes
│   ├── registration.js     # Frontière d’intégration inscription / OTP (sans API fictive)
│   ├── router.js           # Navigation réelle (location.assign)
│   ├── ui.js               # Composants visuels en JS natif (HTML/SVG)
│   └── views/
│       ├── home.js         # Accueil public, carrousel, en-tête, pied
│       ├── login.js        # Connexion commune, inscription guidée et OTP
│       ├── portals.js      # Espaces entreprise / personnel, sans sidebar
│       └── workspace.js    # Six autres profils et dépôt préexistant
├── profil/               # 6 familles d'espaces métier (URL réelles)
├── administration/       # Espace administrateur
├── connexion/, inscription/
├── tools/build-pages.mjs # Générateur des pages HTML
├── tools/serve.mjs       # Serveur statique local (sans dépendance)
├── 404.html              # Page introuvable
├── css/site.css          # Compléments du site multipage
├── assets/                # Les 6 JPG de l’archive d’origine, conservés
├── react-original/        # Ancien projet React/Vite + src.zip + src extrait
├── package.json           # Outil de recompilation CSS seulement (facultatif)
└── package-lock.json
```

La version distribuée **n’utilise ni React, ni Vite, ni TypeScript, ni CDN JavaScript, ni routeur externe**. Les templates des trois pages, les composants et les interactions sont écrits en JavaScript natif. `css/app.css` est une feuille CSS ordinaire compilée à partir du thème et des classes Tailwind d’origine ; **Tailwind n’est pas chargé dans le navigateur**.

Les six images JPG étaient présentes dans `react-original/src/assets` mais **n’étaient référencées par aucun composant du projet initial**. Elles sont conservées dans `assets/` par fidélité, et ne sont pas chargées sur les pages. Les emblèmes et médailles présentés dans l’interface sont des SVG conceptuels issus du projet initial, non des ressources officielles.

### Décors vectoriels de l’accueil

Les dessins de fond de l’accueil sont des SVG intégrés à `js/views/home.js` (styles et masques dans `css/theme.css`). Ils sont purement décoratifs, non interactifs et atténués ou masqués sur petit écran. Le **contour géographique du Gabon** est dérivé des [données Natural Earth 1:50m — pays](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson), simplifiées pour le web ; Natural Earth met ces données à disposition dans le **domaine public**. La façade est une interprétation graphique inspirée du palais du Sénat de Libreville. Le filigrane vertical reprend les volumes de la [cathédrale Sainte-Marie de Libreville, photographiée par RFI](https://www.rfi.fr/fr/afrique/20260814-gabon-apr%C3%A8s-plus-d-un-an-de-travaux-la-cath%C3%A9drale-de-libreville-ouvre-%C3%A0-nouveau-ses-portes) ; il ne s’agit pas d’un relevé architectural exact. Les photos de référence ne sont pas embarquées. Aucun blason officiel n’a été recréé.

L’accueil garde ses sept sections d’origine et ajoute une huitième, **Questions fréquentes**, entre Chiffres et Contact. La navigation leur correspond directement. Les sections et le pied de page utilisent des surfaces essentiellement blanches et blanc cassé (`#FFFFFF`, `#FCFCFA`, `#F9F8F4`, `#F7F8FA`, `#F4F7FA`), avec un grain SVG local discret (`assets/paper-grain.svg`). Les gravures, colonnes, feuillages et ornements restent en arrière-plan, sans interaction.

La FAQ comporte douze questions et des panneaux natifs `<details>` / `<summary>` accessibles au clavier ; l’ouverture d’une réponse ferme les autres. Le lien d’aide rejoint la véritable section Contact. Les cinq étapes du processus restent visibles en permanence ; leur mise en lumière illustrative progresse automatiquement d’une étape à l’autre lorsque la section est à l’écran, avec une piste horizontale sur ordinateur et verticale sur mobile. Cette animation ne représente **pas** l’état d’un dossier. Elle s’interrompt hors de l’écran et disparaît en mode `prefers-reduced-motion`.

La barre de lecture tricolore suit la hauteur réellement défilable de la page : **premier tiers vert, deuxième tiers jaune, dernier tiers bleu**, chaque segment apparaissant seulement quand il est atteint. Le bouton de retour en haut apparaît après 460 px. La médaille principale change automatiquement de bronze à argent puis or ; les contrôles manuels placés sous elle ont été supprimés. Les révélations progressives et les mouvements de gravure sont discrets et respectent `prefers-reduced-motion` ; les contenus restent visibles sans JavaScript. Aucune bibliothèque d’animation n’est chargée.

## Navigation et fonctionnalités reprises

| Vue | URL statique | Fonctionnement |
| --- | --- | --- |
| Accueil | `#/` | Sections et ancres, menu mobile, médaille rotative, chiffres animés |
| Connexion | `#/login` | Formulaire commun à tous les profils, sans choix de rôle ni compte fictif ; visibilité du mot de passe, case « Se souvenir de moi » |
| Inscription | `#/register` | Sélection Entreprise / Personne, parcours 3 / 2 étapes, validations locales, aperçu OTP si API absente |
| Espaces entreprise et personne | `#/app/demandeur/<page>`, `#/app/recipient/<page>` | Navigation horizontale (menus Dossiers / Employés / Cérémonies), finance, distinctions, carte de démo |
| Espaces internes (11 profils) | `#/app/<role>/<page>` pour `secretariat_*`, `ministre`, `dgt`, `dr`, `service_*`, `regisseur` | Navigation et comportements historiques conservés, contenus fictifs étiquetés |
| Espace administrateur | `#/app/admin/<page>` | Gestion de la plateforme, comptes internes, campagnes, journal d'audit, alertes |

Chaque page est un document HTML autonome et la navigation utilise de vrais liens ; les anciens favoris `#/app/...` sont redirigés une fois vers la nouvelle URL. La connexion réelle n'est possible que si `window.DN_AUTH_ENDPOINT` est renseigné. Les deux nouveaux espaces n'utilisent **jamais** les données fictives comme solution de repli d'une API en échec : un compte réel voit un état « Données indisponibles » tant que les services métier ne sont pas raccordés. Un composant de chargement accessible est prévu pour le raccordement futur ; aucun faux délai de chargement n'est affiché en l'absence de requête. L'accès direct aux deux routes sans session ni profil de présentation affiche une invitation à se connecter. Les six autres espaces historiques restent inchangés et explicitement étiquetés « mode démonstration » ; leurs URL n'étaient pas sécurisées par le frontend d'origine et doivent être protégées par un vrai backend avant toute mise en production.

### Parcours de présentation isolé

Sur `file://`, `localhost`, `127.0.0.1` ou l'aperçu `*.e2b.app`, **et uniquement sans endpoint de connexion configuré**, la page `#/login` affiche « Explorer la démonstration ». Le panneau propose l'espace entreprise ou l'espace personnel. `window.DN_PRESENTATION_MODE=false`, déclaré avant `js/portal-demo.js`, désactive entièrement cette expérience ; la forcer à `true` exige une configuration explicite de présentation. Un choix de profil n'est conservé que dans `sessionStorage` sous une clé de présentation indépendante de la session d'authentification. Cela ne délivre ni rôle serveur, ni jeton, ni droit d'accès à une API.

`js/portal-demo.js` contient des dossiers, employés, affiliations, distinctions et ordres **synthétiques** et reliés entre eux. Les deux nouveaux espaces affichent en permanence une bannière « Données fictives ». La recherche, les filtres, les détails, les notifications marquées lues et les éditions de profil sont uniquement locaux, réinitialisables avec confirmation. Le profil personnel n'affiche ni montant ni ordre de recette. Le nouveau suivi n'expose aucune note d'agent interne. Les visuels de galerie sont des médailles conceptuelles et un emplacement « Image indisponible » testable : aucune photographie personnelle `PHOTO_DECORATION` n'a été inventée. La page Notifications permet de créer un message fictif local, de le marquer lu et de tout réinitialiser. Le parcours de dépôt existant reste une simulation séparée, non transmise au ministère.

Le mode présentation permet aussi de tester un **OTP simulé** de six chiffres, indiqué sur l'écran (code `246810`), avec erreurs de code incomplet/incorrect, renvoi simulé, état d'échec de renvoi, validation séquencée des cases et confirmation animée. Aucun courriel n'est envoyé et aucun compte n'est créé : ce code n'est jamais accepté en dehors du mode présentation. Le parcours OTP relié à un véritable adaptateur ne valide que sur réponse positive de celui-ci.

### Intégrations à fournir

Pour la connexion, définir `window.DN_AUTH_ENDPOINT` avant `js/auth.js`. Le service de connexion existant envoie un `POST` JSON `{ email, password, remember }` (et ne transmet `space` que si l'appel historique le précise explicitement) avec cookies de session ; il attend `{ user: { id, email, company, role } }`. Le backend doit décider du rôle, sans sélecteur de profil sur la page de connexion. Cette adaptation ne crée aucun endpoint.

Pour l'inscription et l'OTP, **aucune API ni règle métier n'était présente** dans le dépôt. `js/registration.js` expose une frontière injectée avant son chargement, `window.DN_REGISTRATION_ADAPTER`, avec trois fonctions asynchrones `start({profile,fields})`, `verify({profile,requestId,code})` et `resend({profile,requestId})`. Un `start` réussi doit renvoyer `{ok:true,requestId:string,otpLength?:number}` ; `verify` et `resend` doivent renvoyer `{ok:true}` uniquement après confirmation effective du serveur. Une erreur renvoie `{ok:false,message:string}`. Aucun endpoint, délai OTP ou nomenclature administrative n’est inventé. Hors du mode présentation, sans adaptateur, la soumission indique qu’aucun code n’a été envoyé et ne propose qu’un **aperçu interactif** de l’écran OTP, sans validation ni confirmation fictive. Le code fixe de test décrit ci-dessus appartient exclusivement au mode présentation.

La liste détaillée de l’entreprise totalise **16 champs distincts** (5 + 6 + 5), bien qu’un total de 17 soit annoncé dans la demande : tous les champs explicitement énumérés sont présents, sans en inventer un dix-septième. Les champs « Forme juridique » et « Type de structure » restent distincts et à saisie libre, faute de nomenclature vérifiée dans le projet ; aucune liste officielle n'est inventée. Provinces, départements et villes restent à saisie libre pour la même raison. RCCM et CNSS sont facultatifs tant que les règles backend de validation ne sont pas connues. La validation frontend contrôle uniquement les champs requis, l'e-mail, la longueur minimale de 6 caractères déjà utilisée par la connexion et la concordance des mots de passe ; elle ne remplace pas les validations serveur. Les mots de passe de l'inscription restent temporairement en mémoire pendant les étapes, jamais en stockage local ou de session, et sont effacés après l'envoi confirmé ou la sortie du parcours. L'adresse e-mail personnelle devra être prise en charge et confirmée par le futur contrat backend.

## Modifier le style

On peut modifier directement `css/app.css`, mais il sera écrasé lors de la recompilation. Pour conserver le thème institutionnel d’origine, modifier `css/theme.css`, ou les classes dans les templates JS, puis régénérer :

```sh
npm install        # utile uniquement pour l’édition du CSS
npm run css        # produit css/app.css
```

`npm run css:watch` surveille les modifications. **`npm install` n’est pas nécessaire pour visualiser ou publier le portail** : tous les fichiers nécessaires sont déjà présents.

## Vérifications

```sh
npm test
```

Les 15 tests Node.js couvrent la syntaxe, le CSS précompilé, l’accueil, la connexion, les parcours d’inscription, la séparation de l’OTP réel et simulé, le cloisonnement des deux espaces, la navigation des 13 profils (incluant l’admin), l’intégrité des 14 comptes de démo, la séparation admin / métier, et la rétrocompatibilité des anciens liens. Des vérifications navigateur ont également parcouru les deux espaces, leurs filtres, les détails, les affiliations, l’édition et la réinitialisation, le mode OTP de présentation, l’espace administrateur et les largeurs 390, 768, 1280 et 1440 px.

## Équivalences avec les sources React

| Original | Version statique |
| --- | --- |
| `src/main.tsx`, `src/App.tsx` | `index.html`, `js/app.js` |
| `src/index.css` | `css/theme.css` → `css/app.css` |
| `src/pages/HomePage.tsx`, `Header.tsx`, `Footer.tsx` | `js/views/home.js` |
| `src/pages/LoginPage.tsx`, `RoleTabs.tsx` | `js/views/login.js` |
| `src/pages/WorkspacePage.tsx`, `components/workspace/*` | `js/views/workspace.js` |
| `src/components/*`, `components/ui/*`, `components/landing/*` | `js/ui.js`, `js/icons.js` |
| `src/demo/*`, `src/config/brand.ts` | `js/data.js` |
| `src/lib/auth.ts`, `router.ts`, `useSession.ts` | `js/auth.js`, `js/router.js`, `js/app.js` |

Le composant `MedalGlyph`, bien que non utilisé par les pages du dépôt original, est conservé dans `js/ui.js` pour un éventuel usage futur. Le liseré tricolore, les motifs, dégradés, médailles et tracés des icônes sont recréés en SVG inline ; pas de police d’icônes externe.

## Accéder à l’ancien projet React

L’ancienne version n’est plus le point d’entrée du dépôt, mais elle a été déplacée sans changer ses chemins internes :

```sh
cd react-original
npm ci
npm run dev
```

Les sources React ont été extraites dans `react-original/src/`. Leur archive initiale se trouve toujours dans `react-original/src.zip`. Les fichiers React restent consultables via l’historique Git antérieur à la conversion.
