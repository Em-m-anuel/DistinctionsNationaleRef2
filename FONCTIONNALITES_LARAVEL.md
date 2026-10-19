# Fonctionnalités : préservées, adaptées, bloquées

Inventaire honnête de la migration vers Blade. Trois statuts :

- **Préservé** — le comportement existe et fonctionne à l'identique.
- **Adapté** — le comportement existe, mais son mécanisme change (URL,
  session, rendu) : à vérifier sur votre installation.
- **Bloqué** — l'interface existe, mais il manque le backend.

---

## 1. Périmètre livré

| Élément | Nombre | Emplacement |
| --- | --- | --- |
| Pages métier | **72** | `resources/views/profiles/<famille>/<page>.blade.php` |
| Pages publiques | **3** | `pages/home`, `pages/auth/login`, `pages/auth/register` |
| Pages d'erreur | **2** | `errors/403`, `errors/404` |
| Layouts | **4** | `layouts/base`, `layouts/app`, `layouts/auth`, `layouts/public` |
| Composants partagés | **22** | `resources/views/components/` |
| Routes métier | **72** | `routes/web.php` (`workspace.<famille>.<page>`) |
| Routes techniques | **8** | accueil, connexion (GET/POST), déconnexion, inscription (GET/POST), démonstration, anciennes URL |
| Familles fonctionnelles | **7** | demandeur, récipiendaire, secrétariat, direction, service, régie, administration |
| Rôles | **13** | identiques au site multipage |
| Feuilles de style | **5** | `public/css/` |
| Scripts (page d'espace) | **41** | `public/js/`, ordre d'origine |

---

## 2. Préservé

### Structure et navigation

| Fonctionnalité | Détail |
| --- | --- |
| 72 pages et leurs contenus | Chaque page a sa vue, son titre et son sous-titre propres (72 titres uniques). |
| Une URL par page métier | Vraies routes Laravel, liens `<a href="{{ route(...) }}">`, aucun routeur client. |
| Rechargement et accès direct | Chaque URL renvoie un document complet : F5, favori, nouvel onglet. |
| Regroupement par famille | Une interface par famille fonctionnelle, pas une copie par utilisateur. |
| Rôle hors de l'URL | Le rôle vient de la session ; plusieurs personnes partagent la même URL. |
| Navigation, menus déroulants, menu mobile | Rendus par Blade depuis `config('meditra.navigation')`, filtrés par rôle. |
| Fil d'Ariane, en-tête de page, titres | **Rendus côté serveur par Blade** (nouveauté par rapport à la version JS). |
| En-tête, recherche, notifications, menu de compte | Composants Blade ; valeurs (nom, initiales, compteur) remplies par `js/site/chrome.js`. |
| Design institutionnel | Mêmes CSS (`app`, `cf`, `gab-orient`, `meditra`, `site`), mêmes polices, mêmes illustrations et animations. |
| Responsive et accessibilité | Mêmes classes, `aria-*`, lien d'évitement, `noscript`. |
| Liens profonds `?ref=…` | Conservés : `WorkspaceController` ignore la query, `workspace-page.js` ouvre le dossier. |
| Favoris de l'ancienne SPA | `/app/{role}/{page}` → redirection **301** vers la nouvelle URL. |
| Page 404 | Vue Blade dédiée, stylée, avec les liens vers les espaces. |
| Tarifs, seuils, statuts, workflows | Inchangés (`cf-store.js`, `cf-app.js`, `gab-orient/*` non réécrits). |
| Comptes de démonstration | Les 14 profils restent disponibles quand `MEDITRA_DEMO=true`. |
| Choix du profil de démonstration | Toujours possible depuis `/connexion`, et désormais **synchronisé avec la session Laravel**. |

### Autorisations

| Fonctionnalité | Détail |
| --- | --- |
| Refus d'une page hors famille | **403 côté Laravel** (`abort_unless(Meditra::can(...))`), pas seulement un masquage. |
| Masquage des entrées de menu non autorisées | `data-nav-roles` + `sitePageAllowed()` (confort visuel). |
| « Nouveau dossier » réservé aux rôles autorisés | Même règle `GO.can('create')` que le formulaire. |

---

## 3. Adapté

| Fonctionnalité | Avant | Après | À vérifier |
| --- | --- | --- | --- |
| Génération des URL | chemins statiques `/profil/...` | `route()` côté Blade, `window.MEDITRA.urls` côté JS | `php artisan route:list` |
| Session | `sessionStorage` / profil de présentation | `Auth::user()->role` ; démonstration en session Laravel | connexion réelle |
| Choix du profil de démonstration | `sessionStorage` uniquement | `POST /demo/profil` **et** `sessionStorage` | que Blade et JS affichent le même rôle |
| Connexion | formulaire JS uniquement | formulaire Blade POST + CSRF ; JS remplace le panneau | `Auth::attempt` et table `users` |
| Déconnexion | `navigateTo('/connexion/')` | formulaire POST `route('logout')` | CSRF, invalidation de session |
| Inscription | simulation JS | formulaire Blade + validation serveur, **aucun compte créé** | voir §4 |
| Assets | `/css/...` en dur | `asset()` ; `public/css`, `public/js`, `public/assets` | chemins si l'app est dans un sous-dossier |
| Rendu de la page | `app.js` construisait tout | Blade rend la coquille, le titre et les repères ; JS hydrate les données | le contenu métier reste JS |
| Rôle de démonstration en accès direct | redirection vers la connexion | rôle de repli fourni par le serveur (`demo_role`) | comportement voulu en démo seulement |
| `@vite` | non utilisé | non utilisé (aucun build) | voir `INSTALLATION_LARAVEL.md` §5 |

---

## 4. Bloqué (interface prête, backend manquant)

Chaque ligne indique **la raison précise**, pas une imprécision.

| Fonctionnalité | Ce qui fonctionne | Ce qui manque |
| --- | --- | --- |
| Connexion réelle | formulaire, validation, `Auth::attempt`, redirection | table `users` et comptes (aucune migration fournie) |
| Inscription | formulaire, validation `nom/prenom/email/password` | modèle utilisateur, attribution du rôle, e-mail de vérification. `RegisterController::store()` renvoie volontairement une erreur explicite : **aucun compte n'est créé silencieusement**. |
| OTP, mot de passe oublié | écrans JS complets | routes Laravel, envoi d'e-mail, stockage des codes |
| Persistance des dossiers | toutes les actions modifient le magasin local | tables + API (voir `INTEGRATION_BACKEND.md` §4 et §5) |
| Décisions, visas, cachets, scellés | boutons et transitions | horodatage, auteur, empreinte, journal immuable |
| Ordres de recette, quittances, budget | calculs et écrans | tables financières, transactions, rapprochement |
| Cérémonies, remises, retraits | planification et suivi complets à l'écran | persistance et notifications |
| Stock, achats, livraisons | mouvements et alertes | tables de stock, commandes, fournisseurs |
| Téléversement de pièces | zones de dépôt | stockage, contrôle MIME/taille, antivirus |
| Notifications | liste, compteur, marquage lu | génération serveur (événements) |
| Journal d'activité | affichage | journal append-only côté serveur |
| Recherche | palette `Ctrl+K`, filtrage local | index serveur (Scout ou SQL) |
| Exports / impressions | boutons et rendus | génération PDF côté serveur |
| Autorisation fine par ressource | garde par famille et par page | politiques par dossier/région/service |

Raison commune : **ce dépôt ne contient ni modèles Eloquent, ni migrations, ni
API**. Le mode démonstration est explicite (`MEDITRA_DEMO`), et chaque vue de
profil documente en commentaire l'origine des données.

---

## 5. Ce qui n'a pas été fait, volontairement

| Écart | Raison |
| --- | --- |
| Pas de réécriture des 72 écrans en PHP | Les écrans dépendent de données métier qui n'existent pas côté serveur. Les réécrire aurait dupliqué les règles et cassé les workflows. |
| Pas de modèles Eloquent ni de migrations | Interdit par la consigne : ne pas inventer le schéma. Les tables proposées sont indicatives. |
| Pas de `@vite` | Le projet n'utilise pas Vite ; l'ajouter aurait imposé un build et des dépendances inutiles. |
| Pas de tests Laravel exécutés | PHP et Laravel absents de l'environnement. Documenté dans `INSTALLATION_LARAVEL.md` §8 ; les contrôles statiques et le test unitaire de l'adaptateur font foi. |
| Pas de contrôleurs métier | Seuls les contrôleurs de rendu, d'authentification et de redirection sont fournis ; les contrôleurs de données dépendent du schéma. |
