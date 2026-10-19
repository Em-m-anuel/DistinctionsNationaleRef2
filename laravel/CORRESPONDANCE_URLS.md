# Correspondance des URL, routes et vues

Table GÉNÉRÉE par `tools/build-laravel.mjs`. Toute ligne correspond à une page
réellement produite : le nombre de vues de profil est de 72 et le nombre de routes métier de
72.

- Les URL sont **identiques** à celles du site multipage ; Laravel ignore la
  barre finale en correspondance, donc les deux formes fonctionnent.
- Le rôle n'apparaît jamais dans l'URL : il vient de la session Laravel
  (ou, en démonstration, de la session de présentation).
- Les URL `/app/{role}/{page}` (ancienne SPA) sont redirigées en 301 par
  `LegacyRedirectController`.

| Ancienne URL (SPA à hash) | URL du site multipage | Route Laravel | Nom de route | Vue Blade |
| --- | --- | --- | --- | --- |
| `#/` | `/` | `/` | `home` | `pages/home.blade.php` |
| `#/login` | `/connexion/` | `/connexion` | `login` | `pages/auth/login.blade.php` |
| `#/register` | `/inscription/` | `/inscription` | `register` | `pages/auth/register.blade.php` |
| `#/app/demandeur/overview` | `/profil/demandeur/` | `/profil/demandeur` | `workspace.demandeur.overview` | `profiles/demandeur/overview.blade.php` |
| `#/app/demandeur/dossiers` | `/profil/demandeur/dossiers/` | `/profil/demandeur/dossiers` | `workspace.demandeur.dossiers` | `profiles/demandeur/dossiers.blade.php` |
| `#/app/demandeur/new-dossier` | `/profil/demandeur/new-dossier/` | `/profil/demandeur/new-dossier` | `workspace.demandeur.new-dossier` | `profiles/demandeur/new-dossier.blade.php` |
| `#/app/demandeur/recipients` | `/profil/demandeur/recipients/` | `/profil/demandeur/recipients` | `workspace.demandeur.recipients` | `profiles/demandeur/recipients.blade.php` |
| `#/app/demandeur/complements` | `/profil/demandeur/complements/` | `/profil/demandeur/complements` | `workspace.demandeur.complements` | `profiles/demandeur/complements.blade.php` |
| `#/app/demandeur/recours` | `/profil/demandeur/recours/` | `/profil/demandeur/recours` | `workspace.demandeur.recours` | `profiles/demandeur/recours.blade.php` |
| `#/app/demandeur/documents` | `/profil/demandeur/documents/` | `/profil/demandeur/documents` | `workspace.demandeur.documents` | `profiles/demandeur/documents.blade.php` |
| `#/app/demandeur/ceremonies` | `/profil/demandeur/ceremonies/` | `/profil/demandeur/ceremonies` | `workspace.demandeur.ceremonies` | `profiles/demandeur/ceremonies.blade.php` |
| `#/app/demandeur/payments` | `/profil/demandeur/payments/` | `/profil/demandeur/payments` | `workspace.demandeur.payments` | `profiles/demandeur/payments.blade.php` |
| `#/app/demandeur/pieces` | `/profil/demandeur/pieces/` | `/profil/demandeur/pieces` | `workspace.demandeur.pieces` | `profiles/demandeur/pieces.blade.php` |
| `#/app/demandeur/journal` | `/profil/demandeur/journal/` | `/profil/demandeur/journal` | `workspace.demandeur.journal` | `profiles/demandeur/journal.blade.php` |
| `#/app/demandeur/notifications` | `/profil/demandeur/notifications/` | `/profil/demandeur/notifications` | `workspace.demandeur.notifications` | `profiles/demandeur/notifications.blade.php` |
| `#/app/demandeur/profile` | `/profil/demandeur/profile/` | `/profil/demandeur/profile` | `workspace.demandeur.profile` | `profiles/demandeur/profile.blade.php` |
| `#/app/recipient/overview` | `/profil/recipiendaire/` | `/profil/recipiendaire` | `workspace.recipient.overview` | `profiles/recipient/overview.blade.php` |
| `#/app/recipient/dossiers` | `/profil/recipiendaire/dossiers/` | `/profil/recipiendaire/dossiers` | `workspace.recipient.dossiers` | `profiles/recipient/dossiers.blade.php` |
| `#/app/recipient/documents` | `/profil/recipiendaire/documents/` | `/profil/recipiendaire/documents` | `workspace.recipient.documents` | `profiles/recipient/documents.blade.php` |
| `#/app/recipient/ceremonies` | `/profil/recipiendaire/ceremonies/` | `/profil/recipiendaire/ceremonies` | `workspace.recipient.ceremonies` | `profiles/recipient/ceremonies.blade.php` |
| `#/app/recipient/distinctions` | `/profil/recipiendaire/distinctions/` | `/profil/recipiendaire/distinctions` | `workspace.recipient.distinctions` | `profiles/recipient/distinctions.blade.php` |
| `#/app/recipient/retraits` | `/profil/recipiendaire/retraits/` | `/profil/recipiendaire/retraits` | `workspace.recipient.retraits` | `profiles/recipient/retraits.blade.php` |
| `#/app/recipient/notifications` | `/profil/recipiendaire/notifications/` | `/profil/recipiendaire/notifications` | `workspace.recipient.notifications` | `profiles/recipient/notifications.blade.php` |
| `#/app/recipient/profile` | `/profil/recipiendaire/profile/` | `/profil/recipiendaire/profile` | `workspace.recipient.profile` | `profiles/recipient/profile.blade.php` |
| `#/app/secretariat_ministre/overview` | `/profil/secretariat/` | `/profil/secretariat` | `workspace.secretariat.overview` | `profiles/secretariat/overview.blade.php` |
| `#/app/secretariat_ministre/dossiers` | `/profil/secretariat/dossiers/` | `/profil/secretariat/dossiers` | `workspace.secretariat.dossiers` | `profiles/secretariat/dossiers.blade.php` |
| `#/app/secretariat_ministre/new-dossier` | `/profil/secretariat/new-dossier/` | `/profil/secretariat/new-dossier` | `workspace.secretariat.new-dossier` | `profiles/secretariat/new-dossier.blade.php` |
| `#/app/secretariat_ministre/documents` | `/profil/secretariat/documents/` | `/profil/secretariat/documents` | `workspace.secretariat.documents` | `profiles/secretariat/documents.blade.php` |
| `#/app/secretariat_ministre/inbox` | `/profil/secretariat/inbox/` | `/profil/secretariat/inbox` | `workspace.secretariat.inbox` | `profiles/secretariat/inbox.blade.php` |
| `#/app/secretariat_ministre/ceremonies` | `/profil/secretariat/ceremonies/` | `/profil/secretariat/ceremonies` | `workspace.secretariat.ceremonies` | `profiles/secretariat/ceremonies.blade.php` |
| `#/app/secretariat_ministre/journal` | `/profil/secretariat/journal/` | `/profil/secretariat/journal` | `workspace.secretariat.journal` | `profiles/secretariat/journal.blade.php` |
| `#/app/secretariat_ministre/notifications` | `/profil/secretariat/notifications/` | `/profil/secretariat/notifications` | `workspace.secretariat.notifications` | `profiles/secretariat/notifications.blade.php` |
| `#/app/secretariat_ministre/profile` | `/profil/secretariat/profile/` | `/profil/secretariat/profile` | `workspace.secretariat.profile` | `profiles/secretariat/profile.blade.php` |
| `#/app/ministre/overview` | `/profil/direction/` | `/profil/direction` | `workspace.direction.overview` | `profiles/direction/overview.blade.php` |
| `#/app/ministre/dossiers` | `/profil/direction/dossiers/` | `/profil/direction/dossiers` | `workspace.direction.dossiers` | `profiles/direction/dossiers.blade.php` |
| `#/app/ministre/decisions` | `/profil/direction/decisions/` | `/profil/direction/decisions` | `workspace.direction.decisions` | `profiles/direction/decisions.blade.php` |
| `#/app/ministre/recours` | `/profil/direction/recours/` | `/profil/direction/recours` | `workspace.direction.recours` | `profiles/direction/recours.blade.php` |
| `#/app/ministre/documents` | `/profil/direction/documents/` | `/profil/direction/documents` | `workspace.direction.documents` | `profiles/direction/documents.blade.php` |
| `#/app/ministre/ceremonies` | `/profil/direction/ceremonies/` | `/profil/direction/ceremonies` | `workspace.direction.ceremonies` | `profiles/direction/ceremonies.blade.php` |
| `#/app/ministre/stats` | `/profil/direction/stats/` | `/profil/direction/stats` | `workspace.direction.stats` | `profiles/direction/stats.blade.php` |
| `#/app/ministre/journal` | `/profil/direction/journal/` | `/profil/direction/journal` | `workspace.direction.journal` | `profiles/direction/journal.blade.php` |
| `#/app/ministre/notifications` | `/profil/direction/notifications/` | `/profil/direction/notifications` | `workspace.direction.notifications` | `profiles/direction/notifications.blade.php` |
| `#/app/ministre/profile` | `/profil/direction/profile/` | `/profil/direction/profile` | `workspace.direction.profile` | `profiles/direction/profile.blade.php` |
| `#/app/service_agent/overview` | `/profil/service/` | `/profil/service` | `workspace.service.overview` | `profiles/service/overview.blade.php` |
| `#/app/service_agent/dossiers` | `/profil/service/dossiers/` | `/profil/service/dossiers` | `workspace.service.dossiers` | `profiles/service/dossiers.blade.php` |
| `#/app/service_agent/instruction` | `/profil/service/instruction/` | `/profil/service/instruction` | `workspace.service.instruction` | `profiles/service/instruction.blade.php` |
| `#/app/service_agent/supervision` | `/profil/service/supervision/` | `/profil/service/supervision` | `workspace.service.supervision` | `profiles/service/supervision.blade.php` |
| `#/app/service_agent/recipients` | `/profil/service/recipients/` | `/profil/service/recipients` | `workspace.service.recipients` | `profiles/service/recipients.blade.php` |
| `#/app/service_agent/complements` | `/profil/service/complements/` | `/profil/service/complements` | `workspace.service.complements` | `profiles/service/complements.blade.php` |
| `#/app/service_agent/recours` | `/profil/service/recours/` | `/profil/service/recours` | `workspace.service.recours` | `profiles/service/recours.blade.php` |
| `#/app/service_agent/documents` | `/profil/service/documents/` | `/profil/service/documents` | `workspace.service.documents` | `profiles/service/documents.blade.php` |
| `#/app/service_agent/ceremonies` | `/profil/service/ceremonies/` | `/profil/service/ceremonies` | `workspace.service.ceremonies` | `profiles/service/ceremonies.blade.php` |
| `#/app/service_agent/remises` | `/profil/service/remises/` | `/profil/service/remises` | `workspace.service.remises` | `profiles/service/remises.blade.php` |
| `#/app/service_agent/orders` | `/profil/service/orders/` | `/profil/service/orders` | `workspace.service.orders` | `profiles/service/orders.blade.php` |
| `#/app/service_agent/stats` | `/profil/service/stats/` | `/profil/service/stats` | `workspace.service.stats` | `profiles/service/stats.blade.php` |
| `#/app/service_agent/journal` | `/profil/service/journal/` | `/profil/service/journal` | `workspace.service.journal` | `profiles/service/journal.blade.php` |
| `#/app/service_agent/controle` | `/profil/service/controle/` | `/profil/service/controle` | `workspace.service.controle` | `profiles/service/controle.blade.php` |
| `#/app/service_agent/notifications` | `/profil/service/notifications/` | `/profil/service/notifications` | `workspace.service.notifications` | `profiles/service/notifications.blade.php` |
| `#/app/service_agent/profile` | `/profil/service/profile/` | `/profil/service/profile` | `workspace.service.profile` | `profiles/service/profile.blade.php` |
| `#/app/regisseur/overview` | `/profil/regie/` | `/profil/regie` | `workspace.regie.overview` | `profiles/regie/overview.blade.php` |
| `#/app/regisseur/dossiers` | `/profil/regie/dossiers/` | `/profil/regie/dossiers` | `workspace.regie.dossiers` | `profiles/regie/dossiers.blade.php` |
| `#/app/regisseur/documents` | `/profil/regie/documents/` | `/profil/regie/documents` | `workspace.regie.documents` | `profiles/regie/documents.blade.php` |
| `#/app/regisseur/ceremonies` | `/profil/regie/ceremonies/` | `/profil/regie/ceremonies` | `workspace.regie.ceremonies` | `profiles/regie/ceremonies.blade.php` |
| `#/app/regisseur/remises` | `/profil/regie/remises/` | `/profil/regie/remises` | `workspace.regie.remises` | `profiles/regie/remises.blade.php` |
| `#/app/regisseur/orders` | `/profil/regie/orders/` | `/profil/regie/orders` | `workspace.regie.orders` | `profiles/regie/orders.blade.php` |
| `#/app/regisseur/stock` | `/profil/regie/stock/` | `/profil/regie/stock` | `workspace.regie.stock` | `profiles/regie/stock.blade.php` |
| `#/app/regisseur/retraits` | `/profil/regie/retraits/` | `/profil/regie/retraits` | `workspace.regie.retraits` | `profiles/regie/retraits.blade.php` |
| `#/app/regisseur/journal` | `/profil/regie/journal/` | `/profil/regie/journal` | `workspace.regie.journal` | `profiles/regie/journal.blade.php` |
| `#/app/regisseur/notifications` | `/profil/regie/notifications/` | `/profil/regie/notifications` | `workspace.regie.notifications` | `profiles/regie/notifications.blade.php` |
| `#/app/regisseur/profile` | `/profil/regie/profile/` | `/profil/regie/profile` | `workspace.regie.profile` | `profiles/regie/profile.blade.php` |
| `#/app/admin/overview` | `/administration/` | `/administration` | `workspace.admin.overview` | `profiles/admin/overview.blade.php` |
| `#/app/admin/journal` | `/administration/journal/` | `/administration/journal` | `workspace.admin.journal` | `profiles/admin/journal.blade.php` |
| `#/app/admin/users` | `/administration/users/` | `/administration/users` | `workspace.admin.users` | `profiles/admin/users.blade.php` |
| `#/app/admin/notifications` | `/administration/notifications/` | `/administration/notifications` | `workspace.admin.notifications` | `profiles/admin/notifications.blade.php` |
| `#/app/admin/profile` | `/administration/profile/` | `/administration/profile` | `workspace.admin.profile` | `profiles/admin/profile.blade.php` |

## Routes non métier

| URL | Méthode | Nom | Contrôleur | Rôle |
| --- | --- | --- | --- | --- |
| `/` | GET | `home` | `HomeController@index` | accueil public |
| `/connexion` | GET | `login` | `LoginController@create` | formulaire de connexion |
| `/connexion` | POST | `login.store` | `LoginController@store` | authentification |
| `/deconnexion` | POST | `logout` | `LoginController@destroy` | fermeture de session (CSRF) |
| `/inscription` | GET | `register` | `RegisterController@create` | formulaire d'inscription |
| `/inscription` | POST | `register.store` | `RegisterController@store` | validation seule (voir INTEGRATION_BACKEND) |
| `/demo/profil` | POST | `demo.profile` | `DemoProfileController` | sélection du profil de démonstration |
| `/app/{role}/{page?}` | GET | `legacy` | `LegacyRedirectController` | redirection 301 des anciens favoris |

## Pages d'erreur

| Vue | Déclencheur |
| --- | --- |
| `resources/views/errors/403.blade.php` | `abort(403)` — rôle hors de la famille de la page |
| `resources/views/errors/404.blade.php` | route inexistante ou page inconnue |
