# Authentification — Frontend DistinctionsNationale_Front

> Périmètre : JavaScript côté client (`js/auth.js`, `js/registration.js`, `js/views/login.js`, `js/app.js`).
> Pas de backend modifié. Pas d'appel réel à un service d'authentification.

## 1. Inventaire des parcours

| Vue | Panel (`authState.view`) | Formulaire | Validations | OTP | Action après succès |
|---|---|---|---|---|---|
| Connexion | `login` | `login-form` | email + mot de passe | — | `signIn` → espace connecté |
| Inscription : choix du profil | `choose` | boutons `auth-profile` | `entreprise` ou `personne` | — | étape suivante |
| Inscription : étapes 1..N | `form` | `registration-form` | par champ, par profil | — | si adaptateur : OTP, sinon OTP "aperçu" |
| Inscription : code | `otp` | `otp-form` | 6 chiffres | ✅ | `signIn` automatique |
| Inscription : confirmation | `confirmed` | — | — | — | navigation vers la fiche profil |
| **Mot de passe oublié : email** | `forgot-email` | `forgot-email-form` | email | — | envoi du code si adaptateur |
| **Mot de passe oublié : code** | `forgot-otp` | `forgot-otp-form` | 6 chiffres | ✅ | nouveau mot de passe |
| **Mot de passe oublié : mot de passe** | `forgot-password` | `reset-password-form` | ≥ 6 caractères + confirmation | — | réinitialisation si adaptateur |
| **Mot de passe oublié : succès** | `forgot-success` | — | — | — | retour à la connexion |

## 2. Architecture

```
js/
  auth.js         → signIn, getSession, signOut, EMAIL_RE, PRESENTATION_MODE
  registration.js → registrationOperation (adaptateur), registrationAvailable
  views/login.js  → 9 panels + 1 dispatcher (loginPanelHtml)
  app.js          → router, delegations d'événements, gestion du SPINNER_SVG
```

L'unique source d'état UI est `authState`. La transition entre panels passe par
`authState.view` + `paintLoginPanel()`. Le DOM est régénéré puis les listeners
sont rattachés par `bindLoginForm()`.

## 3. Adaptateur de service

L'application **ne contacte aucun service d'authentification réel** dans cet
aperçu. Le frontend respecte deux contrats :

1. `registrationAvailable` (booléen global) — vrai si un adaptateur de
   démarrage/OTP/réinitialisation est branché.
2. `registrationOperation(operation, payload)` — appelé pour `start`, `verify`,
   `resend`, et (à terme) `reset`. Si l'adaptateur n'existe pas, la fonction
   retourne `{ ok: false, unavailable: true }`. **Elle ne simule jamais de
   succès.**

Cette règle interdit tout **faux OTP** ou **faux mot de passe** dans l'aperçu
neutre. Les copies des panneaux sont rédigées de manière à le rendre visible :
"Le service d'authentification n'est pas encore connecté. La procédure est
documentée ci-dessous ; aucun e-mail n'est envoyé dans cette configuration."

## 4. Mot de passe oublié

### 4.1 Vue "Identifiez votre compte"

- Demande uniquement l'adresse e-mail (lien sous le formulaire de connexion).
- `authFieldError('reset-email', …)` produit un message d'erreur accessible
  (`aria-invalid`, `aria-describedby`).
- Soumission :
  - si `registrationAvailable` → `registrationOperation('start', { profile: 'reset', fields: { email } })`
  - sinon → on conserve le `email` saisi, on passe en vue OTP sans simulation
    de service ; un toast neutre informe l'utilisateur.

### 4.2 Vue "Saisissez le code reçu"

- Réutilise la classe `.auth-otp-case` existante (6 chiffres par défaut, ajustable
  entre 4 et 8 si le backend le demande).
- `data-view="forgot-otp"` + `id="forgot-otp-form"` + `id="reset-otp-error"`.
- La saisie accepte la navigation clavier, la sélection, le collage, le
  backspace : tout est partagé avec le panel d'inscription.
- Lien "Modifier l'adresse" → `data-auth-action="reset-change-email"`.
- Bouton "Renvoyer" → `data-auth-action="reset-resend"`. L'aperçu neutre ne
  renvoie rien ; le toast explique pourquoi.

### 4.3 Vue "Définissez un nouveau mot de passe"

- Deux champs (`reset-password`, `reset-confirm`) avec bouton d'affichage
  utilisant `authState.showPassword['reset-password']`.
- Indicateur d'exigences en temps réel (6 caractères minimum + confirmation).
- Validation locale uniquement :
  - longueur ≥ 6 ;
  - `reset-password === reset-confirm`.
- En absence d'adaptateur : un message neutre informe l'utilisateur et la
  procédure s'arrête explicitement. **Aucune transition vers le panel
  "succès" n'est simulée** : c'est la seule manière d'éviter l'invention de
  fonctionnalité métier.

### 4.4 Vue "Mot de passe réinitialisé"

- SVG de validation animé (coche + cercle) et bandeau final.
- Bouton unique `Se connecter` (`data-auth-action="reset-to-login"`) qui
  réinitialise l'état et ramène à la vue `login`.
- Aucun message marketing. Aucun téléchargement de PDF. Aucun lien externe.

## 5. Sécurité & règles respectées

- Aucune persistance d'un mot de passe en clair dans `localStorage`.
- `signIn` ne renvoie `ok: true` que si la signature
  `signIn({ email, password, remember })` est satisfaite. Le frontend ne
  forge aucun token.
- Les copies évitent toute promesse d'envoi réel tant que l'adaptateur n'est
  pas branché.
- Les OTP sont gardés en mémoire d'onglet seulement ; ils ne sont pas
  persistés.
- Les liens (mailto, contact) du panel de succès pointent vers les ancres
  réelles du site.

## 6. Accessibilité

- Chaque champ d'erreur a un `aria-invalid` + `aria-describedby` et un
  `role="alert"` sur le message.
- Les boutons d'affichage du mot de passe exposent un `aria-label` calculé :
  "Afficher le nouveau mot de passe" / "Masquer la confirmation du mot de
  passe".
- Le focus est déplacé vers le titre H1 de chaque étape (`tabindex="-1"` +
  `focus({preventScroll:true})`).
- La navigation OTP supporte flèches gauche/droite, backspace, collage.
- Aucun piège à tabulation.

## 7. Tests

12/12 tests OK (`npm test`).

- Test ajouté : `le parcours mot de passe oublié propose 4 étapes sans
  simulation de service`. Il vérifie :
  - présence du lien "Mot de passe oublié ?" sur la page de connexion ;
  - 4 entrées de `AUTH_RESET_STEPS` avec clés `email`, `otp`, `password`,
    `done` ;
  - présence de chaque `id` de formulaire / d'OTP / de mot de passe ;
  - absence de promesse de service (regex `doesNotMatch` sur
    "adresse vérifiée", "code généré", "envoyé avec succès") ;
  - absence de code de présentation en clair dans l'aperçu neutre ;
  - bouton de retour "Se connecter" sur le panel de succès.

## 8. Limites connues

- Le backend réel n'est pas dans ce dépôt. Tant que
  `registrationAvailable === false`, **la réinitialisation réelle n'est pas
  possible**. Le frontend documente la procédure mais s'arrête net.
- Le mail de récupération n'est pas envoyé (donc le code n'arrive jamais) ;
  c'est l'adaptateur qui doit l'implémenter.
- Aucun export PDF de confirmation : un mail de service le fournira côté
  backend.
