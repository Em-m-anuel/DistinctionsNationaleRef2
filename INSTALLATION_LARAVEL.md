# Installation dans un projet Laravel 12

Ce dossier `laravel/` contient la découpe **complète** du frontend MEDITRA en
vues Blade, routes, contrôleurs et ressources. Il est destiné à être copié
dans un projet Laravel 12 existant (application neuve ou projet déjà en place).

> **Ce qui a été vérifié, et ce qui ne l'a pas été**
> PHP, Composer et Laravel ne sont pas installés dans l'environnement de
> génération. **Aucune commande `php artisan`, aucun rendu Blade et aucun test
> Laravel n'ont été exécutés.** Ce qui *a* été vérifié automatiquement :
> existence et cohérence des 108 fichiers générés, correspondance
> routes ↔ vues ↔ assets, équilibre des directives Blade, ordre et unicité des
> scripts, comportement de l'adaptateur JavaScript (24 tests, voir §8).
> Le premier lancement dans votre projet reste donc à faire — la procédure
> ci-dessous est prévue pour cela.

---

## 1. Contenu du dossier `laravel/`

```text
laravel/
├── app/
│   ├── Http/Controllers/
│   │   ├── HomeController.php
│   │   ├── WorkspaceController.php         ← sert les 72 pages métier
│   │   ├── DemoProfileController.php
│   │   ├── LegacyRedirectController.php
│   │   └── Auth/{LoginController,RegisterController}.php
│   ├── Providers/MeditraServiceProvider.php
│   └── Support/Meditra.php
├── config/meditra.php                      ← familles, pages, menus (généré)
├── resources/views/
│   ├── layouts/{base,app,auth,public}.blade.php
│   ├── components/                         22 composants partagés
│   ├── pages/{home, auth/login, auth/register}.blade.php
│   ├── errors/{403,404}.blade.php
│   └── profiles/{demandeur,recipiendaire,secretariat,direction,service,regie,admin}/  (72 vues)
├── routes/web.php                          76 routes GET + 4 POST
├── public/
│   ├── css/   (5 feuilles servies + sources)
│   ├── js/    (modules métier + js/laravel/meditra-laravel.js)
│   └── assets/ (logos, illustrations, photos)
└── CORRESPONDANCE_URLS.md                  tableau URL ↔ route ↔ vue
```

Chiffres exacts : **72 vues de profil**, **3 pages publiques**, **2 pages
d'erreur**, **22 composants**, **4 layouts**, **72 routes métier**,
**41 scripts** sur une page d'espace (ordre d'origine préservé),
**5 feuilles de style**.

---

## 2. Copie des fichiers

Depuis la racine de votre projet Laravel :

```bash
# 1. Vues, assets, configuration, routes
cp -R chemin/vers/laravel/resources/views/*      resources/views/
cp -R chemin/vers/laravel/public/css             public/
cp -R chemin/vers/laravel/public/js              public/
cp -R chemin/vers/laravel/public/assets          public/
cp    chemin/vers/laravel/config/meditra.php     config/
cp    chemin/vers/laravel/routes/web.php         routes/

# 2. Classes PHP
mkdir -p app/Support
cp -R chemin/vers/laravel/app/Http/Controllers/* app/Http/Controllers/
cp    chemin/vers/laravel/app/Support/Meditra.php app/Support/
cp    chemin/vers/laravel/app/Providers/MeditraServiceProvider.php app/Providers/
```

> **Windows PowerShell** : remplacez `cp -R` par `Copy-Item -Recurse -Force`
> et `cp` par `Copy-Item -Force`.
>
> `routes/web.php` : si votre projet en a déjà un, conservez-le et copiez le
> bloc des 72 routes (§4). La classe `App\Http\Controllers\Controller` fournie
> par Laravel n'est pas incluse dans ce dossier : ne la remplacez pas.

### Points d'attention

- **`public/js` et `public/css`** : si vous avez déjà un dossier `public/js`,
  copiez le **contenu** (les chemins sont `public/js/site-config.js`,
  `public/js/gab-orient/…`, `public/js/laravel/…`). Les noms n'entrent pas en
  collision avec un projet Laravel standard.
- **Ne copiez pas `laravel/public/assets`** si vous avez déjà des assets :
  fusionnez, les chemins sont `assets/brand/…`, `assets/illustrations/…`.
- **`resources/views/errors/`** : si vos pages d'erreur existent déjà, elles
  seront remplacées. Sauvegardez-les avant.

---

## 3. Enregistrer le fournisseur de vues

`MeditraServiceProvider` injecte `$meditraConfig` (URL des routes, compte,
mode démonstration) dans toutes les vues. Sans lui, les pages s'affichent mais
`window.MEDITRA` est vide : la navigation retombe sur les URL statiques.

Dans `bootstrap/providers.php` (Laravel 11/12) :

```php
return [
    App\Providers\AppServiceProvider::class,
    App\Providers\MeditraServiceProvider::class,   // ← à ajouter
];
```

Sur une structure Laravel 10 ou antérieure, ajoutez la même ligne dans
`config/app.php`, clé `providers`.

---

## 4. Routes

`routes/web.php` remplace intégralement le fichier : il contient l'accueil,
les routes d'authentification, la démonstration et les **72 routes métier**.

Si votre `web.php` contient déjà des routes, gardez-les et copiez uniquement le
bloc compris entre `// Accueil public` et la fin du fichier généré.

Vérification :

```bash
php artisan route:list --name=workspace | wc -l      # 72 routes + en-tête
php artisan route:list --path=profil
php artisan route:list --path=administration
```

Les URL sont **identiques** à celles du site multipage :

| URL | Nom de route | Vue |
| --- | --- | --- |
| `/profil/demandeur` | `workspace.demandeur.overview` | `profiles/demandeur/overview.blade.php` |
| `/profil/demandeur/dossiers` | `workspace.demandeur.dossiers` | `profiles/demandeur/dossiers.blade.php` |
| `/administration/users` | `workspace.admin.users` | `profiles/admin/users.blade.php` |

Laravel ignore la barre finale en correspondance : `/profil/direction/` et
`/profil/direction` servent la même page, sans redirection.

Le tableau complet (75 lignes) est dans **`laravel/CORRESPONDANCE_URLS.md`**.

---

## 5. Configuration

Ajoutez dans `.env` :

```dotenv
APP_URL=http://localhost:8000        # doit correspondre à l'URL réellement servie

# true  : jeu de démonstration + sélection de profil (aucune base requise)
# false : production, la démonstration et /demo/profil sont désactivés
MEDITRA_DEMO=true
```

Puis :

```bash
php artisan config:clear
php artisan cache:clear
```

### Sans build front

Aucun `npm install` n'est nécessaire : les CSS et JS sont servis depuis
`public/`, et les vues utilisent `asset()`.

```php
<link rel="stylesheet" href="{{ asset('css/app.css') }}">
<script src="{{ asset('js/app.js') }}"></script>
```

**Vite n'est pas utilisé**, car le projet d'origine ne l'utilise pas. Si vous
souhaitez y passer plus tard :

1. déplacez `public/css` et `public/js` vers `resources/css` et `resources/js` ;
2. ajoutez les entrées correspondantes dans `vite.config.js` ;
3. remplacez, dans `layouts/base.blade.php`, l'include `components.styles` et
   l'include `components.scripts` par `@vite([...])` **en conservant l'ordre
   des 41 scripts** donné par `config('meditra.scripts.workspace')`.

Ne mélangez pas les deux : un même module chargé deux fois casse les
initialisations.

---

## 6. Première exécution

```bash
php artisan serve --port=8000
```

1. Ouvrez `http://localhost:8000/` → l'accueil s'affiche.
2. Allez sur `/connexion` : le formulaire Blade fonctionne sans JavaScript
   (POST + CSRF) ; avec JavaScript, l'interface complète le remplace.
3. En mode démonstration (`MEDITRA_DEMO=true`), ouvrez directement
   `http://localhost:8000/profil/demandeur` : la page est rendue par Blade avec
   le rôle représentatif de la famille, puis hydratée par les scripts.
4. Depuis `/connexion`, cliquez sur « Explorer la démonstration » et choisissez
   un profil : le choix est envoyé à `POST /demo/profil` et mémorisé en session
   pour que Blade et le navigateur utilisent **le même rôle**.

### Base de données

Aucune migration n'est fournie : le mode démonstration ne lit pas la base.
La connexion réelle suppose une table `users` avec une colonne `role`
(voir `INTEGRATION_BACKEND.md` §2).

---

## 7. Ce que Blade rend, et ce que JavaScript rend encore

| Élément | Rendu par |
| --- | --- |
| `<!doctype>`, `<head>`, métadonnées, CSS, scripts | Blade |
| En-tête, logo, recherche, notifications, menu de compte | Blade (valeurs remplies par JS) |
| Navigation, sous-menus, navigation mobile | Blade (`route()`, filtrés par rôle ensuite) |
| Fil d'Ariane, titre `h1`, sous-titre de la page | **Blade** |
| Repère de chargement et message sans JavaScript | **Blade** |
| Listes, tableaux, formulaires, cartes de dossiers | JS (`js/cf-app.js`) sur jeu de démonstration |
| Connexion multi-étapes (mot de passe, OTP, oubli) | JS ; le POST réel est la route Laravel |
| Accueil complet (sections, illustrations, animations) | JS ; repli Blade sans JavaScript |

Autrement dit : **chaque URL renvoie un document complet, avec son titre, sa
navigation et son en-tête de page**, sans dépendre d'un routeur client. Les
données métier restent, à ce stade, fournies par le prototype (voir
`INTEGRATION_BACKEND.md`).

---

## 8. Vérifications réellement exécutées

```bash
node tools/build-laravel.mjs     # régénère laravel/ (source unique)
npm test                         # 163 tests, dont 24 dédiés à Laravel
```

Les 16 contrôles `tests/laravel-blade.cjs` vérifient :

- 72 vues de profil + 3 pages publiques + 403/404 présentes ;
- 72 routes nommées, uniques, chacune reliée à sa vue (et inversement) ;
- chaque `@include`/`@extends` pointe vers un fichier existant ;
- directives Blade équilibrées (`@if/@endif`, `@foreach/@endforeach`,
  `@php/@endphp`, sections bloc) ;
- tous les `route('…')` utilisés existent dans `web.php` ;
- tous les `asset('…')` existent dans `public/` ;
- ordre des scripts : `site-config.js` premier, `app.js` dernier,
  adaptateur juste avant, aucun doublon, dépendances (`core` → vues,
  `bridge` → `cf-app`) respectées ;
- aucune vue n'utilise `@vite`, React, Vue ou Inertia ;
- le sprite contient toutes les icônes du menu ;
- le layout expose tous les points de montage (`#view`, `#mp-panel`,
  `#mp-viewer`, `#cf-toast`, `#toasts`, `#tip`, `#mobile-nav`, slots…).

Les 8 contrôles `tests/laravel-adapter.cjs` vérifient le comportement réel de
`public/js/laravel/meditra-laravel.js` : conversion des URL en routes Laravel,
rôle issu du serveur, adoption du rôle de démonstration, désactivation de la
démonstration, envoi du profil choisi, déconnexion POST, et **absence de tout
effet** quand `window.MEDITRA` est absent (le site statique reste intact).

**Non vérifié** : `php artisan`, rendu Blade réel, middleware, politique
d'accès, sessions. À valider sur votre installation (§6).

---

## 9. Régénérer après une évolution

Toute modification des familles, des pages ou des menus doit se faire dans
`js/site-config.js` et `js/views/internal-portal.js`, puis :

```bash
node tools/build-laravel.mjs    # met à jour vues, config, routes, assets
npm test
```

Ne modifiez pas `config/meditra.php` à la main : il est écrasé.

---

## 10. Dépannage

| Symptôme | Cause | Solution |
| --- | --- | --- |
| `Undefined variable $meditraConfig` | fournisseur non enregistré | §3 |
| CSS/JS en 404 | dossiers non copiés dans `public/` | §2 |
| Page blanche, « Le site n'a pas pu charger ses fichiers » | `public/js` absent ou cache | vérifier `public/js/app.js`, vider le cache |
| `Route [workspace.xxx] not defined` | `web.php` non remplacé | §4 |
| 403 sur toutes les pages | `MEDITRA_DEMO=false` et utilisateur sans `role` | §5, `INTEGRATION_BACKEND.md` §2 |
| Menu vide | `$navigation` absent | passer `navigation` depuis `WorkspaceController` |
| La déconnexion ne fait rien | formulaire `#meditra-logout-form` retiré | le remettre dans `components/profile-menu` |
| Liens vers `/profil/.../` en 404 sur serveur Nginx | `try_files` manquant | `try_files $uri $uri/ /index.php?$query_string;` |
