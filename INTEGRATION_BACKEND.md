# Intégration backend — ce qui reste à raccorder

Ce document décrit précisément **ce qui fonctionne sans backend**, **ce qui
appelle encore le prototype** et **ce qu'il faut construire côté Laravel** pour
que le portail devienne une application réelle.

> Rappel : un frontend Blade n'est ni un backend ni une authentification
> sécurisée. Tant que les points ci-dessous ne sont pas réalisés, les
> autorisations ne protègent que l'affichage.

---

## 1. État actuel, en une page

| Couche | Aujourd'hui | Où |
| --- | --- | --- |
| Rendu de la page (titre, nav, fil d'Ariane, en-tête) | **Blade**, côté serveur | `resources/views/layouts`, `components`, `profiles` |
| Rôle de la session | Compte `Auth::user()->role`, sinon session de démonstration | `WorkspaceController::resolveRole()` |
| Garde d'accès | `Meditra::can()` → `abort(403)` | `app/Support/Meditra.php` |
| Données métier (dossiers, courriers…) | **Jeu de démonstration en mémoire / localStorage** | `public/js/cf-store.js`, `public/js/cf-app.js` |
| Actions (créer, décider, payer, remiser…) | Modifient le magasin local, puis re-rendent | `cfAction()` dans `public/js/cf-app.js` |
| Authentification réelle | Absente : `Auth::attempt()` sur une table `users` à créer | `Auth\LoginController` |
| Inscription | Validation seulement, aucun compte créé (message explicite) | `Auth\RegisterController` |
| Pièces jointes, exports, signatures | Simulés côté navigateur | `cf-app.js` |

---

## 2. Authentification

### 2.1 Table `users`

Le code attend **une colonne `role`** dont les valeurs sont exactement celles de
`config('meditra.roles')` :

```text
demandeur, recipient,
secretariat_ministre, secretariat_dgt, secretariat_dr,
ministre, dgt, dr,
service_agent, service_inspecteur, service_chef,
regisseur, admin
```

Migration minimale :

```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('nom');
    $table->string('prenom');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->string('role')->default('demandeur');
    $table->boolean('actif')->default(true);
    $table->rememberToken();
    $table->timestamps();
});
```

`LoginController` utilise `Auth::attempt(['email' => …, 'password' => …])`,
régénère la session et redirige vers `workspace.{famille}.overview` du rôle.
La déconnexion est un **POST** (`route('logout')`) protégé par CSRF : le
formulaire `#meditra-logout-form` est déjà présent dans
`components/profile-menu.blade.php`, et `meditraLogout()` le soumet.

### 2.2 Ce qui manque

- **OTP / mot de passe oublié** : l'interface existe dans
  `public/js/views/login.js` (étapes `otp`, `forgot`), mais aucun appel réseau.
  À raccorder à des routes Laravel (`password.email`, OTP) et à `Auth`.
- **Limitation de tentatives** : ajoutez `->middleware('throttle:5,1')` sur
  `POST /connexion`.
- **Vérification e-mail**, politique de mot de passe, MFA : absents.

---

## 3. Autorisation

### 3.1 Ce qui est déjà en place (côté serveur)

`WorkspaceController` :

```php
abort_unless(Meditra::can($role, $family, $page), 403);
```

`Meditra::can()` vérifie que le rôle appartient à la famille **et** que la page
existe dans cette famille. Un `demandeur` qui ouvre `/profil/direction/dossiers`
reçoit donc une **403 rendue par Laravel**, quel que soit le JavaScript.

### 3.2 Ce qui doit être ajouté

1. **Middleware de famille** (défense en profondeur, réutilisable) :

```php
// app/Http/Middleware/EnsureFamilyAccess.php
public function handle(Request $request, Closure $next, string $family)
{
    $role = $request->user()?->role;
    abort_unless($role && \App\Support\Meditra::familyOfRole($role) === $family, 403);
    return $next($request);
}
```

```php
Route::get('/profil/direction/dossiers', [WorkspaceController::class, 'show'])
    ->defaults('family', 'direction')->defaults('page', 'dossiers')
    ->middleware(['auth', 'family:direction'])
    ->name('workspace.direction.dossiers');
```

2. **Politiques par ressource** : un dossier n'appartient qu'à son demandeur,
   une DR ne voit que sa région, un chef de service voit son équipe. Ces règles
   vivent dans des `Policy`, jamais dans les vues.
3. **Masquage dans l'interface** : `sitePageAllowed()` et l'attribut
   `data-nav-roles` filtrent le menu. C'est du confort visuel, **pas** une
   sécurité : ils ne remplacent pas les points 1 et 2.

---

## 4. Données métier

### 4.1 Le magasin à remplacer

`public/js/cf-store.js` contient `cfSeed()` (jeu de démonstration) et
`cfLoad()` (lecture `localStorage`). Toutes les vues métier lisent cet objet.

Entités présentes (noms exacts) :

```text
users, applicants, campaigns, dossiers, mails, documents, ceremonies,
stock, movements, suppliers, purchaseOrders, deliveries, budget,
withdrawals, stamps, signatures, notifications, journal, signatureJournal, stats
```

Un dossier porte : `pieces`, `history`, `indications`, `complements`,
`recours`, `relances`, `negotiation`, `ceremony`, `ceremonyRequest`, `order`,
`quittance`, `remise`, `transmitted`, `notified`, `listAccepted`, `horsDelai`,
`location`, `delegues`.

Correspondance suggérée (à adapter à votre schéma) :

| Objet JS | Table Laravel | Remarque |
| --- | --- | --- |
| `dossiers` | `dossiers` | `reference` = `DNG-…`, `statut` = cycle de vie |
| `applicants` | `applicants` / `entreprises` | demandeur entreprise ou ministère |
| `users` | `users` | + `role` |
| `mails`, `documents` | `courriers`, `documents` | pièces, visas, cachets, scellés |
| `ceremonies` | `ceremonies` | date, lieu, autorité, délégations |
| `orders`, `quittance`, `budget` | `ordres_recette`, `quittances`, `budget` | montants en `decimal` |
| `stock`, `movements`, `suppliers`, `purchaseOrders`, `deliveries` | `stocks`, `mouvements`, `fournisseurs`, `commandes`, `livraisons` | régie |
| `withdrawals` | `retraits` | retraits sans cérémonie |
| `notifications`, `journal` | `notifications`, `journal` | à alimenter par événements |
| `stamps`, `signatures`, `signatureJournal` | `visas`, `signatures` | preuve d'intégrité |

### 4.2 Où et comment brancher

Deux étapes, sans réécrire les vues :

1. **Remplacer la source de données** dans `cf-store.js` :

```js
async function cfLoad() {
  if (cfLive) return cfLive;
  const response = await fetch("/api/etat", { headers: { Accept: "application/json" } });
  cfLive = await response.json();          // même forme que cfSeed()
  return cfLive;
}
```

2. **Remplacer les écritures** : chaque action de `cfAction()` (voir §5) écrit
   aujourd'hui en mémoire. Remplacez `cfSave()` par un `fetch()` vers l'API, ou
   basculez progressivement les écrans concernés.

Tant que ce basculement n'est pas fait, **les données restent fictives** : les
vues Blade le disent explicitement dans le bloc `<noscript>`
(`components/workspace-loading.blade.php`) et dans les commentaires de chaque
vue de profil.

### 4.3 Variante « rendu serveur »

Les vues sont déjà prêtes à recevoir des données. Dans un contrôleur :

```php
return view("profiles.$family.$page", [
    'family' => $family, 'page' => $page, 'role' => $role,
    'familyLabel' => $conf['label'], 'pageLabel' => $meta['label'],
    'navigation' => $conf['navigation'], 'scriptSet' => 'workspace',
    // données métier (à ajouter) :
    'dossiers' => $dossiers,           // Paginator
    'stats' => $stats,
]);
```

Dans la vue, remplacez `@include('components.workspace-loading')` par le rendu
Blade des données, et indiquez au JavaScript de ne pas réécrire la zone :

```blade
<main id="view" data-go-view="" data-go-page="{{ $page }}" data-server-rendered="true">
    @include('profiles.direction.partials.dossiers-table', ['dossiers' => $dossiers])
</main>
```

Il n'existe **aucun** modèle Eloquent ni migration dans ce dépôt : les noms de
tables ci-dessus sont des propositions, pas un schéma imposé.

---

## 5. Actions du prototype à transformer en API

Chaque action ci-dessous modifie aujourd'hui le magasin local
(`cfAction()`, `public/js/cf-app.js`). Elle doit devenir un appel HTTP **et**
une règle métier côté serveur (validation, transaction, journal, notification).

| Domaine | Actions JS | Endpoint à créer |
| --- | --- | --- |
| Dossiers | `wiz-submit`, `accept-list`, `notify-list`, `finish-instr`, `set-loc` | `POST /api/dossiers`, `POST /api/dossiers/{id}/transmettre`, `…/valider`, `…/localiser` |
| Récipiendaires | `rec-ok`, `rec-no`, `wiz-add-rec`, `wiz-del-rec` | `POST /api/dossiers/{id}/recipiendaires`, `PATCH/DELETE …/{rid}` |
| Compléments / relances | `panel-ask-cpl`, `panel-cpl`, `send-cpl`, `ask-rel` | `POST /api/dossiers/{id}/complements`, `…/relances` |
| Recours | `go-recours`, `nego-*` | `POST /api/dossiers/{id}/recours` |
| Décisions / signatures | `sign-doc`, `visa-doc`, `stamp-doc`, `seal-doc`, `add-num` | `POST /api/documents/{id}/visa`, `…/signature`, `…/cachet`, `…/scelle` |
| Ordres de recette | `go-order`, `order-step`, `order-revue`, `issue-order` | `POST /api/dossiers/{id}/ordre-recette` |
| Quittances | `panel-qui`, `send-qui`, `qui-ok`, `qui-no` | `POST /api/dossiers/{id}/quittance`, `POST …/verification` |
| Cérémonies | `ask-cer`, `val-date`, `nego-ok`, `nego-other`, `catchup`, `gen-del`, `gen-dip` | `POST /api/ceremonies`, `…/{id}/date`, `…/delegations`, `…/diplomes` |
| Remises | `do-remise`, `remise-revue` | `POST /api/dossiers/{id}/remise` |
| Retraits | `wd-send`, `wd-ok`, `wd-no`, `wd-suivi` | `POST /api/retraits`, `…/{id}/decision` |
| Stock / achats | `do-stock`, `panel-stock`, `new-cmd`, `save-bl`, `save-fou` | `POST /api/stocks/mouvements`, `…/commandes`, `…/livraisons` |
| Comptes | `panel-user`, `save-user`, `toggle-user` | `POST /api/users`, `PATCH /api/users/{id}` |
| Tarifs / campagnes | `save-tarif`, `close-camp`, `proroge` | `POST /api/tarifs`, `…/campagnes/{id}` |
| Documents | `dl-doc`, `view-doc`, `doc-version`, `fake-file` | `GET /api/documents/{id}/fichier`, `POST …/versions`, upload multipart |
| Notifications | `read-all`, `notice`, `notify-list` | `POST /api/notifications/lues`, `GET /api/notifications` |

**Règles métier à conserver telles quelles** (ne pas les déplacer en JS) :

- cycle : `SOUMIS → EN_ETUDE → APPROUVE → VALIDE → ORDRE_EMIS → PAYE →
  MEDAILLES_REMISES → CEREMONIE_PLANIFIEE → CLOTURE` ;
- tarifs : Or 20 000, Argent 15 000, Bronze 13 000, diplôme 3 000 FCFA
  (`CF_TARIFFS`) ;
- seuils d'éligibilité : 10 / 20 / 30 ans, **doublés en cas de mutilation**
  (barème des distinctions) ;
- montants, quotas de médailles et mouvements de stock : calculs à protéger par
  transaction.

---

## 6. Fichiers, signatures, documents

- **Téléversements** : `dropzone` et `panel-qui` simulent l'envoi. À remplacer
  par un `POST` multipart, stockage `Storage::disk('local')`, contrôle MIME,
  taille, antivirus, et une table `documents`.
- **Visa / cachet / scellé / signature** : aujourd'hui des drapeaux booléens.
  En production : horodatage, auteur, empreinte du fichier (SHA-256), journal
  immuable (`signatureJournal`).
- **Téléchargement** : `dl-doc` journalise côté navigateur ; en production, la
  route doit vérifier les droits puis servir le fichier (jamais un chemin
  direct dans `public/`).

---

## 7. Notifications et journal

- `notifications` et `journal` sont générés localement.
- Cible : événements Laravel (`DossierTransmis`, `DecisionSignee`, …) +
  `notifications` (base ou mail), et une table `journal` en append-only.
- L'en-tête Blade affiche déjà le compteur (`[data-site-unread]`) : il suffit que
  `cfUnread()` lise le nombre fourni par le serveur.

---

## 8. Mode démonstration

| Variable | Effet |
| --- | --- |
| `MEDITRA_DEMO=true` | profils fictifs, `POST /demo/profil`, repli sur le rôle de la famille |
| `MEDITRA_DEMO=false` | `/demo/profil` → 404, aucun rôle de repli, `DN_PRESENTATION_MODE=false` |

En production : `MEDITRA_DEMO=false`, et **supprimez** `public/js/portal-demo.js`,
`public/js/demo-accounts.js`, `public/js/demo-store.js` de
`config/meditra.php` (avec `node tools/build-laravel.mjs` sur une configuration
sans démonstration), ainsi que le bloc `PRESENTATION_*` de
`public/js/cf-store.js` si vous basculez entièrement sur l'API.

Le point important : la démonstration n'est jamais accessible par une simple
URL quand `MEDITRA_DEMO=false` ; elle dépend d'une décision serveur.

---

## 9. Checklist avant mise en production

- [ ] `MEDITRA_DEMO=false`
- [ ] Table `users` avec `role`, mots de passe hachés, comptes actifs
- [ ] `throttle` sur la connexion, journalisation des accès
- [ ] Middleware `auth` + `family` sur les 72 routes (ou dans un groupe)
- [ ] Politiques par ressource (dossier, document, cérémonie, stock)
- [ ] Toutes les actions du §5 branchées en API, validées côté serveur
- [ ] Téléversements contrôlés (MIME, taille, stockage hors `public/`)
- [ ] Journal et notifications alimentés par événements
- [ ] HTTPS, cookies `Secure`/`HttpOnly`, `SameSite=Lax`, CSRF actif
- [ ] Sauvegardes et purge des données de démonstration
- [ ] Retrait des scripts de démonstration (§8)
