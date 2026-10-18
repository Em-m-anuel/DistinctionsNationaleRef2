/* Authentication presentation: login + frontend-only registration / OTP.
   Backend sign-in stays in js/auth.js; registration boundary in js/registration.js.
   Passwords only live in memory while the multi-step form is open, never storage. */
const authState = {
  view: 'login', profile: null, step: 0,
  forms: { entreprise: {}, personne: {} }, errors: {},
  email: '', remember: false, busy: false, preview: false,
  requestId: null, otpLength: 6, code: '', otpError: '', showPassword: {}, demoPanel:false,
  // Mot de passe oublié / réinitialisation
  reset: { email: '', step: 0, requestId: null, code: '', otpLength: 6, otpError: '', errors: {} },
};

const AUTH_STEPS = {
  entreprise: [
    { title: 'Présentons votre organisation', description: 'Commencez par renseigner les informations essentielles de votre entreprise.', fields: [
      ['raison', 'Nom / raison sociale', true, 'building'], ['sigle', 'Sigle', false, 'document'],
      ['secteur', 'Secteur d’activité', true, 'building'], ['forme', 'Forme juridique', true, 'document'],
      ['structure', 'Type de structure', true, 'building'] ] },
    { title: 'Informations administratives', description: 'Renseignez les références administratives et la localisation de votre organisation.', fields: [
      ['nif', 'NIF', true, 'document'], ['rccm', 'RCCM', false, 'document'], ['cnss', 'Numéro CNSS', false, 'document'],
      ['province', 'Province', true, 'mapPin'], ['departement', 'Département', true, 'mapPin'],
      ['ville', 'Ville d’implantation', true, 'mapPin'] ] },
    { title: 'Finalisons votre inscription', description: 'Ajoutez vos coordonnées et sécurisez l’accès à votre espace entreprise.', fields: [
      ['adresse', 'Adresse', true, 'mapPin'], ['telephone', 'Téléphone', true, 'phone'],
      ['email', 'Adresse e-mail', true, 'mail'], ['password', 'Mot de passe', true, 'lock'],
      ['confirm', 'Confirmation du mot de passe', true, 'lock'] ] },
  ],
  personne: [
    { title: 'Votre identité', description: 'Ces informations permettront de rattacher votre espace personnel à vos distinctions.', fields: [
      ['nom', 'Nom', true, 'user'], ['prenom', 'Prénom', true, 'user'], ['cni', 'Numéro CNI', true, 'card'],
      ['nationalite', 'Nationalité', true, 'user'], ['sexe', 'Sexe', true, 'user'] ] },
    { title: 'Sécurisez votre espace', description: 'Définissez vos identifiants pour accéder à vos distinctions et à vos cérémonies.', fields: [
      ['email', 'Adresse e-mail', true, 'mail'], ['password', 'Mot de passe', true, 'lock'],
      ['confirm', 'Confirmation du mot de passe', true, 'lock'] ] },
  ],
};
const AUTH_EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function authUserIcon(size = 'size-[18px]') {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="auth-user-icon ${size}"><circle class="auth-user-head" cx="12" cy="8.2" r="3.7"/><path class="auth-user-body" d="M4.8 20c.7-3.7 3.6-6 7.2-6s6.5 2.3 7.2 6"/></svg>`;
}
function authButton(label, action, extra = '', attrs = '') {
  return `<button type="button" data-auth-action="${action}" ${attrs} class="auth-link ${extra}">${label}</button>`;
}
function authAside() {
  return `<aside class="auth-aside" aria-label="Identité du portail">
    <div class="auth-aside-art" aria-hidden="true">${homeArt('cartography', 'auth-map')}${homeArt('senate', 'auth-facade')}${homeArt('fern', 'auth-fern')}</div>
    <button type="button" data-action="nav" data-path="/" class="auth-brand">
      ${meditraBrand({ size: 48, sub: "République Gabonaise" })}
    </button>
    <div class="auth-aside-copy"><div class="auth-kicker">MEDITRA <span class="auth-triple"></span></div>
      <h2>Un parcours de <em>reconnaissance.</em></h2>
      <p>Un espace pour accompagner chaque étape, de la constitution du dossier à la remise des médailles du travail.</p>
      <span class="auth-aside-rule" aria-hidden="true"></span>
      <span class="auth-aside-caption">RÉPUBLIQUE GABONAISE · MEDITRA</span>
    </div>
    <div class="auth-aside-bottom"><span>Une démarche claire, un engagement reconnu.</span><span>GABON <span class="auth-triple"></span></span></div>
  </aside>`;
}
function authProgress() {
  const steps = AUTH_STEPS[authState.profile];
  const completed = authState.step + 1;
  // Fill each third in sequence. The yellow and blue do not appear at step one.
  const pct = completed / steps.length * 100;
  return `<div class="auth-progress" role="group" aria-label="Progression du formulaire">
    <div class="auth-progress-text"><span>INSCRIPTION ${authState.profile === 'entreprise' ? 'ENTREPRISE' : 'PERSONNELLE'}</span><span>Étape ${completed} sur ${steps.length}</span></div>
    <div class="auth-progress-track" role="progressbar" aria-label="Progression de l’inscription" aria-valuenow="${completed}" aria-valuemin="0" aria-valuemax="${steps.length}" style="--progress-from:${authState.step / steps.length * 100}%;--progress-to:${pct}%">
      <span class="auth-progress-painted"></span>
    </div><div class="auth-progress-labels">${steps.map((step,i)=>`<span class="${i === authState.step ? 'current' : ''}">${esc(step.title)}</span>`).join('')}</div>
  </div>`;
}
function authField(spec) {
  const [key, label, required, iconName] = spec;
  const id = `reg-${key}`;
  const value = authState.forms[authState.profile][key] || '';
  const err = authState.errors[key] || '';
  const isPassword = key === 'password' || key === 'confirm';
  const type = isPassword ? (authState.showPassword[key] ? 'text' : 'password') : key === 'email' ? 'email' : key === 'telephone' ? 'tel' : 'text';
  const hints = {
    forme: 'Indiquez la forme de votre organisation : les valeurs officielles restent à confirmer.',
    structure: 'Indiquez votre type de structure ; aucune nomenclature officielle n’est préchargée.',
    rccm: 'À renseigner si applicable ; obligation à confirmer par le service compétent.',
    cnss: 'À renseigner si applicable ; obligation à confirmer par le service compétent.',
    cni: 'Saisissez le numéro figurant sur votre pièce ; aucune vérification officielle n’est effectuée ici.',
    email: 'Utilisée pour la connexion et la vérification de votre adresse.',
    password: 'Au moins 6 caractères, selon la validation de connexion existante.',
  };
  const toggle = isPassword ? `<button type="button" class="auth-toggle-password" data-auth-action="toggle-password" data-field-key="${key}" aria-label="${authState.showPassword[key] ? 'Masquer' : 'Afficher'} ${label.toLowerCase()}" aria-pressed="${Boolean(authState.showPassword[key])}">${icon(authState.showPassword[key] ? 'eyeOff' : 'eye', 'size-4')}</button>` : '';
  return `<div class="auth-field" data-auth-field="${key}">${textField({
    id, label: label + (required ? ' *' : ' (facultatif)'), icon: iconName, hint: hints[key] || '', error: err,
    trailing: toggle,
    attrs: { name:key, type, value, required: required || undefined, autocomplete: key === 'email' ? 'email' : key === 'password' ? 'new-password' : 'off', inputmode: key === 'telephone' ? 'tel' : undefined, disabled: authState.busy || undefined }
  })}</div>`;
}
function authPasswordHints() {
  const values = authState.forms[authState.profile];
  const long = (values.password || '').length >= 6;
  const match = Boolean(values.confirm && values.confirm === values.password);
  return `<div class="auth-password-hints" role="status"><span class="${long ? 'met' : ''}">${icon(long ? 'checkCircle' : 'info', 'size-3.5')} Six caractères minimum</span><span class="${match ? 'met' : ''}">${icon(match ? 'checkCircle' : 'info', 'size-3.5')} Mots de passe identiques</span></div>`;
}
function authLoginPanel() {
  const email = authState.email;
  return `<div class="auth-view" data-view="login">
    <div class="auth-kicker">ACCÈS À VOTRE ESPACE <span class="auth-triple"></span></div>
    <h1>Bienvenue sur votre portail</h1><p class="auth-lead">Connectez-vous pour accéder à votre espace personnel ou à celui de votre organisation.</p>
    ${!AUTH_ENDPOINT ? '<p class="auth-service-note" role="status">Connexion en attente du service d’authentification. Aucun compte de démonstration n’est activé depuis ce formulaire.</p>' : ''}
    <form id="login-form" class="auth-form" novalidate>
      <div data-auth-field="email">${textField({id:'email',label:'Adresse e-mail',icon:'mail',attrs:{type:'email',name:'email',autocomplete:'username',required:true,value:email,placeholder:'votre@email.com'}})}</div>
      <div data-auth-field="password">${textField({id:'password',label:'Mot de passe',icon:'lock',trailing:`<button type="button" data-auth-action="toggle-password" data-field-key="login" class="auth-toggle-password" aria-label="Afficher le mot de passe" aria-pressed="false">${icon('eye','size-4')}</button>`,attrs:{type:'password',name:'password',autocomplete:'current-password',required:true,placeholder:'Votre mot de passe'}})}</div>
      <div class="auth-row-between">
        <label class="auth-remember"><input type="checkbox" id="remember" ${authState.remember ? 'checked' : ''}/> Se souvenir de moi</label>
        <button type="button" data-auth-action="forgot" class="auth-link auth-forgot">Mot de passe oublié ?</button>
      </div>
      ${button({attrs:{type:'submit',id:'login-submit'},size:'lg',fullWidth:true,html:authUserIcon()+' Se connecter',className:'auth-primary'})}
    </form>
    <div class="auth-switch">Vous n’avez pas encore de compte ? ${authButton('Créer un compte','register')}</div>
    ${PRESENTATION_MODE ? authDemoPanel() : ''}
  </div>`;
}

/** Sélecteur des 14 profils de démonstration (uniquement en mode présentation). */
function authDemoPanel() {
  const groups = groupDemoAccounts();
  const expanded = authState.demoPanel;
  return `<div class="auth-demo-entry"><div><span class="auth-kicker">ENVIRONNEMENT DE PRÉSENTATION</span><p>${expanded ? 'Sélectionnez un profil pour explorer son espace. Les actions ne sont jamais transmises à un serveur.' : '14 profils fictifs sont disponibles. Aucun n’accepte de connexion réelle.'}</p></div>${authButton((expanded ? 'Masquer la sélection' : 'Explorer la démonstration') + ' ' + icon(expanded ? 'x' : 'arrowRight', 'size-4'),'demo-panel')}${expanded ? `<div class="auth-demo-grid">${groups.map((group) => `<div class="auth-demo-group"><div class="auth-demo-group-label">${esc(group.label)}</div><div class="auth-demo-options">${group.accounts.map((account) => authButton(esc(account.label) + ' ' + icon('arrowRight', 'size-4'), 'demo-enter', 'auth-demo-card', `data-demo-role="${esc(account.role)}" data-demo-email="${esc(account.email)}"`)).join('')}</div></div>`).join('')}<div class="auth-demo-meta"><span>${icon('info', 'size-4')} Mot de passe partagé : <code>Demo123!</code> — non accepté par le service d’authentification réel.</span>${authButton('Tester la vérification OTP','demo-otp')}</div></div>` : ''}</div>`;
}
function authChoosePanel() {
  return `<div class="auth-view" data-view="choose">
    <div class="auth-kicker">REJOINDRE LE PORTAIL <span class="auth-triple"></span></div>
    <h1>Un espace à votre mesure.</h1><p class="auth-lead">Pour commencer, choisissez le parcours qui vous correspond.</p>
    <div class="auth-profile-grid" role="group" aria-label="Choisir le type de compte">
      ${[['entreprise','building','Inscrire une entreprise','Enregistrez votre organisation pour constituer des dossiers de distinctions, suivre leur progression et gérer vos demandes.'],['personne','user','Créer mon espace personnel','Créez votre compte personnel pour retrouver vos distinctions, consulter vos cérémonies et participer à la constitution de votre dossier.']].map(([key,ico,title,description])=>`<button type="button" class="auth-profile ${authState.profile === key ? 'is-selected' : ''}" data-auth-action="profile" data-profile="${key}" aria-pressed="${authState.profile === key}"><span class="auth-profile-icon">${key === 'personne' ? authUserIcon('size-6') : icon(ico,'size-6')}</span><strong>${title}</strong><span>${description}</span><span class="auth-profile-check" aria-hidden="true">${icon('check','size-4')}</span></button>`).join('')}
    </div><div class="auth-actions">${button({size:'lg',fullWidth:true,html:'Continuer '+icon('arrowRight','size-4 auth-arrow'),attrs:{'data-auth-action':'start-profile'},className:'auth-primary'})}</div>
    <div class="auth-switch">Déjà un compte ? ${authButton('Se connecter','login')}</div>
  </div>`;
}
function authFormPanel() {
  const steps = AUTH_STEPS[authState.profile];
  const step = steps[authState.step];
  return `<div class="auth-view" data-view="form">
    ${authProgress()}<div class="auth-form-heading"><h1>${step.title}</h1><p class="auth-lead">${step.description}</p></div>
    <form id="registration-form" class="auth-form" novalidate><div class="auth-field-grid">${step.fields.map(authField).join('')}</div>
      ${step.fields.some(([key])=>key==='password') ? authPasswordHints() : ''}
      <div class="auth-actions auth-step-actions">${button({variant:'outline',html:icon('arrowLeft','size-4')+' Précédent',attrs:{'data-auth-action':'previous'},className:'auth-secondary'})}${button({attrs:{type:'submit'},html:authState.step === steps.length-1 ? 'Demander la vérification '+icon('arrowRight','size-4 auth-arrow') : 'Continuer '+icon('arrowRight','size-4 auth-arrow'),className:'auth-primary'})}</div>
    </form><div class="auth-switch">Déjà un compte ? ${authButton('Se connecter','login')}</div>
  </div>`;
}
function authMaskEmail(email) {
  const [local,domain] = email.split('@');
  return `${local.slice(0,Math.min(2,local.length))}${'•'.repeat(Math.max(2,local.length-2))}@${domain || ''}`;
}
function authOtpPanel() {
  const mail = authState.forms[authState.profile].email || '';
  return `<div class="auth-view auth-otp-view" data-view="otp"><div class="auth-otp-symbol" aria-hidden="true">${icon('mail','size-7')}</div>
    <div class="auth-kicker">VÉRIFICATION DE L’ADRESSE <span class="auth-triple"></span></div><h1>Vérifiez votre adresse e-mail</h1>
    <p class="auth-lead">${authState.preview === 'demo' ? 'Simulation locale de vérification : aucun code n’a été envoyé par e-mail et aucun compte n’est activé sur un serveur. Utilisez le code de présentation ci-dessous.' : authState.preview ? 'Aucun code n’a été envoyé : le service de vérification n’est pas encore connecté. Voici un aperçu interactif de cette étape.' : 'Un code de vérification a été envoyé à l’adresse que vous avez renseignée. Saisissez-le ci-dessous pour poursuivre votre inscription.'}</p>
    ${authState.preview === 'demo' ? `<p class="auth-demo-otp-code" role="status">CODE DE PRÉSENTATION · ${DEMO_OTP_CODE}</p>` : ''}
    <p class="auth-masked-mail">${icon('mail','size-4')} ${esc(authMaskEmail(mail))}</p>
    <form id="otp-form" novalidate><div class="auth-otp-cases ${authState.otpError ? 'is-error' : ''}" role="group" aria-label="Code de vérification numérique à ${authState.otpLength} chiffres">${Array.from({length:authState.otpLength},(_,i)=>`<input type="text" class="auth-otp-case ${authState.code[i] ? 'is-filled' : ''}" data-otp-index="${i}" inputmode="numeric" pattern="[0-9]*" autocomplete="${i === 0 ? 'one-time-code' : 'off'}" aria-label="Chiffre ${i+1} sur ${authState.otpLength}" maxlength="1" value="${esc(authState.code[i] || '')}" ${authState.otpError ? 'aria-invalid="true" aria-describedby="otp-error"' : ''}/>`).join('')}</div>
      <p class="auth-otp-error" id="otp-error" role="alert">${esc(authState.otpError)}</p>
      ${button({attrs:{type:'submit'},size:'lg',fullWidth:true,html:'Vérifier le code '+icon('arrowRight','size-4 auth-arrow'),className:'auth-primary'})}
    </form><div class="auth-otp-resend">${authState.preview === 'demo' ? 'Testez également les états de renvoi : ' : 'Vous n’avez rien reçu ? '}${authButton('Renvoyer le code','resend')}${authState.preview === 'demo' ? ` · ${authButton('Simuler un échec de renvoi','demo-resend-error')}` : ''}</div>
    <div class="auth-switch">${authButton('Modifier mes informations','back-to-form')} · ${authButton('Se connecter','login')}</div>
  </div>`;
}
function authConfirmPanel() {
  const demo=authState.preview === 'demo';
  return `<div class="auth-view auth-confirm auth-success-scene" data-view="confirmed">
    <div class="auth-success-symbol" aria-hidden="true"><svg viewBox="0 0 150 150" fill="none"><circle class="auth-success-ring" cx="75" cy="75" r="53" stroke="#009B62" stroke-width="2"/><path class="auth-success-check" d="m49 76 17 17 36-39" stroke="#009B62" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg><i class="auth-spark auth-spark-1"></i><i class="auth-spark auth-spark-2"></i><i class="auth-spark auth-spark-3"></i></div>
    <div class="auth-kicker">${demo?'VÉRIFICATION SIMULÉE · PRÉSENTATION':'VÉRIFICATION CONFIRMÉE PAR LE SERVICE'}</div>
    <h1>Adresse e-mail vérifiée</h1><p class="auth-lead">Votre inscription a franchi l’étape de vérification. Vous pouvez poursuivre vers votre espace.</p>
    ${demo?'<p class="auth-service-note">Cette vérification est locale et fictive. Aucun compte n’a été créé ou activé sur le serveur.</p>':'<p class="auth-service-note">La vérification du code a été confirmée. L’activation du compte et la suite de l’inscription dépendent des règles du service.</p>'}
    <div class="auth-actions">${demo?button({html:'Explorer l’espace de démonstration '+icon('arrowRight','size-4 auth-arrow'),attrs:{'data-auth-action':'demo-open'},className:'auth-primary'}):authButton('Retour à la connexion','login')}</div>
  </div>`;
}

/* ==================================================================
   Mot de passe oublié & réinitialisation — frontend-only.
   Les écrans reflètent exactement le parcours attendu en production :
     1) demande d’un e-mail de récupération (sans révéler si le compte existe)
     2) envoi d’un code OTP à 6 chiffres
     3) saisie du code (paste, navigation, accessibilité)
     4) nouveau mot de passe + confirmation + indicateur de robustesse
     5) confirmation de la réinitialisation
   En l’absence d’adaptateur, le parcours est neutre : pas de simulation
   silencieuse, pas de faux succès, pas d’illusion d’e-mail envoyé.
================================================================== */
const AUTH_RESET_STEPS = [
  { key: 'email', title: 'Identifiez votre compte', description: 'Indiquez l’adresse e-mail liée à votre espace. Si un compte existe, un code de vérification y sera envoyé.' },
  { key: 'otp', title: 'Saisissez le code reçu', description: 'Un code à six chiffres a été envoyé à l’adresse que vous avez renseignée.' },
  { key: 'password', title: 'Définissez un nouveau mot de passe', description: 'Choisissez un mot de passe d’au moins 6 caractères. Il ne sera jamais affiché en clair après enregistrement.' },
  { key: 'done', title: 'Mot de passe réinitialisé', description: 'Votre nouveau mot de passe est actif. Vous pouvez vous connecter avec vos identifiants.' },
];

function authForgotEmailPanel() {
  const email = authState.reset.email || '';
  return `<div class="auth-view" data-view="forgot-email">
    <div class="auth-kicker">RÉCUPÉRATION DE L’ACCÈS <span class="auth-triple"></span></div>
    <h1>${esc(AUTH_RESET_STEPS[0].title)}</h1>
    <p class="auth-lead">${esc(AUTH_RESET_STEPS[0].description)}</p>
    ${!registrationAvailable ? '<p class="auth-service-note" role="status">Le service d’authentification n’est pas encore connecté. La procédure est documentée ci-dessous ; aucun e-mail n’est envoyé dans cette configuration.</p>' : ''}
    <form id="forgot-email-form" class="auth-form" novalidate>
      <div data-auth-field="reset-email">${textField({id:'reset-email',label:'Adresse e-mail',icon:'mail',error:authState.reset.errors.email||'',attrs:{type:'email',name:'reset-email',autocomplete:'username',required:true,value:email,placeholder:'votre@email.com',disabled:authState.busy||undefined}})}</div>
      ${button({attrs:{type:'submit'},size:'lg',fullWidth:true,html:authState.busy?SPINNER_SVG+' Envoi en cours…':'Envoyer le code de vérification '+icon('arrowRight','size-4 auth-arrow'),className:'auth-primary'})}
    </form>
    <div class="auth-switch">Vous avez retrouvé votre mot de passe ? ${authButton('Se connecter','login')}</div>
  </div>`;
}

function authForgotOtpPanel() {
  const mail = authState.reset.email || '';
  return `<div class="auth-view auth-otp-view" data-view="forgot-otp">
    <div class="auth-otp-symbol" aria-hidden="true">${icon('mail','size-6')}</div>
    <div class="auth-kicker">CODE DE RÉCUPÉRATION <span class="auth-triple"></span></div>
    <h1>${esc(AUTH_RESET_STEPS[1].title)}</h1>
    <p class="auth-lead">${authState.reset.preview === 'demo' ? 'Simulation locale : aucun e-mail réel n’est envoyé, aucun compte n’est activé. Saisissez les six chiffres ci-dessous pour valider la procédure.' : authState.reset.preview ? 'Aucun code n’a été envoyé : le service de récupération n’est pas encore connecté. Saisissez un code à six chiffres pour poursuivre la prévisualisation.' : 'Saisissez ci-dessous le code à six chiffres qui vient d’être envoyé à votre adresse pour confirmer la réinitialisation.'}</p>
    ${authState.reset.preview === 'demo' ? `<p class="auth-demo-otp-code\" role="status\">CODE DE PRÉSENTATION · ${DEMO_OTP_CODE}</p>` : ''}
    <p class="auth-masked-mail">${icon('mail','size-4')} ${esc(authMaskEmail(mail))}</p>
    <form id="forgot-otp-form" novalidate>
      <div class="auth-otp-cases ${authState.reset.otpError ? 'is-error' : ''}" role="group" aria-label="Code de récupération à ${authState.reset.otpLength} chiffres">${Array.from({length:authState.reset.otpLength},(_,i)=>`<input type="text" class="auth-otp-case ${authState.reset.code[i] ? 'is-filled' : ''}" data-otp-index="${i}" inputmode="numeric" pattern="[0-9]*" autocomplete="${i === 0 ? 'one-time-code' : 'off'}" aria-label="Chiffre ${i+1} sur ${authState.reset.otpLength}" maxlength="1" value="${esc(authState.reset.code[i] || '')}" ${authState.reset.otpError ? 'aria-invalid="true" aria-describedby="reset-otp-error"' : ''}/>`).join('')}</div>
      <p class="auth-otp-error" id="reset-otp-error" role="alert">${esc(authState.reset.otpError)}</p>
      ${button({attrs:{type:'submit'},size:'lg',fullWidth:true,html:'Vérifier le code '+icon('arrowRight','size-4 auth-arrow'),className:'auth-primary'})}
    </form>
    <div class="auth-otp-resend">${authState.reset.preview === 'demo' ? 'Testez les états de renvoi :' : 'Vous n’avez rien reçu ?'} ${authButton('Renvoyer le code','reset-resend')}${authState.reset.preview === 'demo' ? ' · ' + authButton('Simuler un échec de renvoi','reset-resend-error') : ''}</div>
    <div class="auth-switch">${authButton('Modifier l’adresse e-mail','reset-change-email')} · ${authButton('Se connecter','login')}</div>
  </div>`;
}

function authResetPasswordHints() {
  const values = authState.reset;
  const long = (values.password || '').length >= 6;
  const match = Boolean(values.confirm && values.confirm === values.password);
  return `<div class="auth-password-hints" role="status"><span class="${long ? 'met' : ''}">${icon(long ? 'checkCircle' : 'info', 'size-3.5')} Six caractères minimum</span><span class="${match ? 'met' : ''}">${icon(match ? 'checkCircle' : 'info', 'size-3.5')} Mots de passe identiques</span></div>`;
}

function authForgotPasswordPanel() {
  return `<div class="auth-view" data-view="forgot-password">
    <div class="auth-kicker">NOUVEAU MOT DE PASSE <span class="auth-triple"></span></div>
    <h1>${esc(AUTH_RESET_STEPS[2].title)}</h1>
    <p class="auth-lead">${esc(AUTH_RESET_STEPS[2].description)}</p>
    <form id="reset-password-form" class="auth-form" novalidate>
      <div data-auth-field="reset-password">${textField({id:'reset-password',label:'Nouveau mot de passe',icon:'lock',error:authState.reset.errors.password||'',trailing:`<button type="button" data-auth-action="toggle-password" data-field-key="reset-password" class="auth-toggle-password" aria-label="Afficher le mot de passe" aria-pressed="false">${icon('eye','size-4')}</button>`,attrs:{type:'password',name:'reset-password',autocomplete:'new-password',required:true,placeholder:'Au moins 6 caractères',disabled:authState.busy||undefined}})}</div>
      <div data-auth-field="reset-confirm">${textField({id:'reset-confirm',label:'Confirmation du mot de passe',icon:'lock',error:authState.reset.errors.confirm||'',trailing:`<button type="button" data-auth-action="toggle-password" data-field-key="reset-confirm" class="auth-toggle-password" aria-label="Afficher la confirmation" aria-pressed="false">${icon('eye','size-4')}</button>`,attrs:{type:'password',name:'reset-confirm',autocomplete:'new-password',required:true,placeholder:'Saisissez à nouveau le mot de passe',disabled:authState.busy||undefined}})}</div>
      ${authResetPasswordHints()}
      ${button({attrs:{type:'submit'},size:'lg',fullWidth:true,html:authState.busy?SPINNER_SVG+' Validation…':'Valider le nouveau mot de passe '+icon('arrowRight','size-4 auth-arrow'),className:'auth-primary'})}
    </form>
    <div class="auth-switch">${authButton('Revenir au code de récupération','reset-back-otp')}</div>
  </div>`;
}

function authForgotSuccessPanel() {
  return `<div class="auth-view auth-confirm auth-success-scene" data-view="forgot-success">
    <div class="auth-success-symbol" aria-hidden="true"><svg viewBox="0 0 150 150" fill="none"><circle class="auth-success-ring" cx="75" cy="75" r="53" stroke="#009B62" stroke-width="2"/><path class="auth-success-check" d="m49 76 17 17 36-39" stroke="#009B62" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg><i class="auth-spark auth-spark-1"></i><i class="auth-spark auth-spark-2"></i><i class="auth-spark auth-spark-3"></i></div>
    <div class="auth-kicker">PROCÉDURE TERMINÉE</div>
    <h1>${esc(AUTH_RESET_STEPS[3].title)}</h1>
    <p class="auth-lead">Utilisez votre nouveau mot de passe pour accéder à votre espace. Pour des raisons de sécurité, l’ancien mot de passe n’est plus valide.</p>
    <p class="auth-service-note">Cette opération s’est déroulée localement. En production, un service d’authentification confirmera l’écriture sécurisée du nouveau mot de passe.</p>
    <div class="auth-actions">${button({size:'lg',fullWidth:true,html:'Se connecter '+icon('arrowRight','size-4 auth-arrow'),attrs:{'data-auth-action':'reset-to-login'},className:'auth-primary'})}</div>
  </div>`;
}
function loginSuccessPanel(session) {
  const sessionRole = session.role === 'agent_administration' ? 'service'
    : ['recipient','recipiendaire'].includes(session.role) ? 'recipient' : 'demandeur';
  return `<div class="auth-view auth-confirm"><div class="auth-confirm-mark">${icon('checkCircle','size-8')}</div><div class="auth-kicker">ACCÈS CONFIRMÉ</div><h1>Connexion réussie</h1><p class="auth-lead">Bienvenue, ${esc(session.company)}.</p><p class="auth-masked-mail">${esc(session.email)}</p><div class="auth-actions">${button({variant:'outline',html:'Retour à l’accueil',attrs:{'data-action':'nav','data-path':'/'}})}${button({html:'Ouvrir mon espace',attrs:{'data-action':'nav','data-path':`/app/${sessionRole}/overview`}})}</div>${button({variant:'ghost',html:'Se déconnecter',attrs:{'data-action':'signout'}})}</div>`;
}
function loginPanelHtml(session) {
  if (session) return loginSuccessPanel(session);
  if (authState.view === 'choose') return authChoosePanel();
  if (authState.view === 'form') return authFormPanel();
  if (authState.view === 'otp') return authOtpPanel();
  if (authState.view === 'confirmed') return authConfirmPanel();
  if (authState.view === 'forgot-email') return authForgotEmailPanel();
  if (authState.view === 'forgot-otp') return authForgotOtpPanel();
  if (authState.view === 'forgot-password') return authForgotPasswordPanel();
  if (authState.view === 'forgot-success') return authForgotSuccessPanel();
  return authLoginPanel();
}
function paintLoginPanel() {
  const panel = document.getElementById('login-panel');
  if (!panel) return;
  panel.innerHTML = loginPanelHtml(getSession());
  bindLoginForm();
  if (authState.view === 'otp' || authState.view === 'forgot-otp') panel.querySelector('.auth-otp-case')?.focus({preventScroll:true});
  else {
    const title = panel.querySelector('h1');
    title?.setAttribute('tabindex','-1');
    title?.focus({preventScroll:true});
  }
  if (window.matchMedia('(max-width: 880px)').matches) panel.scrollIntoView({block:'start',behavior:'instant'});
}
function renderLogin(session, route = '/login') {
  if (route === '/register' && authState.view === 'login') authState.view = 'choose';
  if (route === '/login' && authState.view === 'choose') authState.view = 'login';
  return `<div class="auth-page"><div class="auth-topline" aria-hidden="true"></div>${authAside()}<main id="contenu" class="auth-main"><div class="auth-toolbar"><button type="button" data-action="nav" data-path="/" class="auth-back">${icon('arrowLeft','size-4')} Retour à l’accueil</button><span>${icon('lock','size-4')} MEDITRA</span></div><div class="auth-main-content"><div class="auth-mobile-brand">${meditraBrand({ size: 42, sub: "République Gabonaise" })}</div><div class="auth-card" id="login-panel">${loginPanelHtml(session)}</div></div><footer class="auth-footer">© ${new Date().getFullYear()} République Gabonaise — MEDITRA</footer></main><div class="auth-toasts" id="auth-toasts" aria-label="Notifications"></div></div>`;
}
function mountLogin() { bindLoginForm(); }
function bindLoginForm() {
  document.getElementById('login-form')?.addEventListener('submit', onLoginSubmit);
  document.getElementById('registration-form')?.addEventListener('submit', onRegistrationSubmit);
  document.getElementById('otp-form')?.addEventListener('submit', onOtpSubmit);
  document.getElementById('forgot-email-form')?.addEventListener('submit', onForgotEmailSubmit);
  document.getElementById('forgot-otp-form')?.addEventListener('submit', onForgotOtpSubmit);
  document.getElementById('reset-password-form')?.addEventListener('submit', onResetPasswordSubmit);
}
function authToast(type, message) {
  const region = document.getElementById('auth-toasts');
  if (!region) return;
  const el = document.createElement('div');
  el.className = `auth-toast auth-toast-${type}`;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.innerHTML = `<span class="auth-toast-icon">${icon(type === 'error' ? 'alert' : type === 'success' ? 'checkCircle' : 'info','size-[18px]')}</span><span>${esc(message)}</span><button type="button" data-auth-action="close-toast" aria-label="Fermer la notification">${icon('close','size-4')}</button>`;
  region.appendChild(el);
  window.setTimeout(() => el.remove(), type === 'error' ? 8500 : 5500);
}
function authFieldError(key, message) {
  const container = document.querySelector(`[data-auth-field="${key}"]`);
  if (!container) return;
  const input = container.querySelector('input');
  if (!input) return;
  input.setAttribute('aria-invalid','true');
  input.setAttribute('aria-describedby', `${input.id}-error`);
  container.querySelector('.auth-inline-error')?.remove();
  const note = document.createElement('p');
  note.className = 'auth-inline-error'; note.id = `${input.id}-error`;
  note.textContent = message; container.appendChild(note);
}
function authClearFieldError(key) {
  delete authState.errors[key];
  const container = document.querySelector(`[data-auth-field="${key}"]`);
  container?.querySelector('.auth-inline-error')?.remove();
  const input = container?.querySelector('input');
  if (input) { input.removeAttribute('aria-invalid'); input.setAttribute('aria-describedby', `${input.id}-hint`); }
}
function authBusy(active, text) {
  authState.busy = active;
  const submit = document.querySelector('#login-form button[type="submit"],#registration-form button[type="submit"],#otp-form button[type="submit"]');
  if (submit) { submit.disabled = active; submit.setAttribute('aria-busy',String(active));
    if (active) { submit.dataset.original = submit.innerHTML; submit.innerHTML = `${SPINNER_SVG} ${esc(text)}`; }
    else if (submit.dataset.original) { submit.innerHTML = submit.dataset.original; delete submit.dataset.original; }
  }
}
function validateStep() {
  const fields = AUTH_STEPS[authState.profile][authState.step].fields;
  const values = authState.forms[authState.profile];
  const errors = {};
  for (const [key,,required] of fields) {
    const value = String(values[key] || '').trim();
    if (required && !value) errors[key] = 'Ce champ est obligatoire.';
    else if (key === 'email' && value && !AUTH_EMAIL.test(value)) errors[key] = 'Saisissez une adresse e-mail valide.';
    else if (key === 'password' && value && value.length < 6) errors[key] = 'Au moins 6 caractères sont nécessaires.';
    else if (key === 'confirm' && value && value !== values.password) errors[key] = 'Les mots de passe ne correspondent pas.';
  }
  authState.errors = errors;
  for (const [key,message] of Object.entries(errors)) authFieldError(key,message);
  if (Object.keys(errors).length) { document.querySelector(`[data-auth-field="${Object.keys(errors)[0]}"] input`)?.focus(); authToast('error',errors.confirm ? errors.confirm : 'Veuillez vérifier les champs indiqués.'); return false; }
  return true;
}
async function onLoginSubmit(event) {
  event.preventDefault(); if (authState.busy) return;
  const email = document.getElementById('email')?.value.trim() || '';
  const password = document.getElementById('password')?.value || '';
  authState.email = email;
  authState.remember = Boolean(document.getElementById('remember')?.checked);
  if (!email || !AUTH_EMAIL.test(email)) { authFieldError('email',!email ? 'Veuillez saisir votre adresse e-mail.' : 'Saisissez une adresse e-mail valide.'); authToast('error','Vérifiez votre adresse e-mail.'); return; }
  if (!password) { authFieldError('password','Veuillez saisir votre mot de passe.'); authToast('error','Veuillez saisir votre mot de passe.'); return; }
  if (!AUTH_ENDPOINT) { authToast('error','Connexion indisponible : aucun service d’authentification n’est configuré.'); return; }
  authBusy(true,'Connexion en cours…');
  const result = await signIn({email,password,remember:authState.remember});
  authBusy(false);
  if (!result.ok) { if (result.error.field === 'email' || result.error.field === 'password') authFieldError(result.error.field,result.error.message); authToast('error',result.error.message); }
}
async function onRegistrationSubmit(event) {
  event.preventDefault(); if (authState.busy || !validateStep()) return;
  const steps = AUTH_STEPS[authState.profile];
  if (authState.step < steps.length - 1) { authState.step++; paintLoginPanel(); authToast('success','Les informations de cette étape sont valides.'); return; }
  if (!registrationAvailable && PRESENTATION_MODE) {
    authState.preview='demo';authState.otpLength=6;authState.code='';authState.otpError='';
    authState.forms[authState.profile].password='';authState.forms[authState.profile].confirm='';
    authState.view='otp';paintLoginPanel();authToast('info','Vérification simulée : aucun message n’a été envoyé. Code de présentation affiché.');return;
  }
  if (!registrationAvailable) { authToast('info','Service non connecté : aucune demande ni code n’ont été envoyés. Vous pouvez prévisualiser l’étape OTP.');
    if (!document.getElementById('auth-preview')) {
      const el = document.createElement('button');el.id='auth-preview';el.type='button';el.dataset.authAction='preview-otp';el.className='auth-preview';el.textContent='Prévisualiser la vérification OTP (sans envoi)';document.getElementById('registration-form')?.appendChild(el);
    }
    return;
  }
  authBusy(true,'Envoi de la demande…');
  const result = await registrationOperation('start',{profile:authState.profile,fields:{...authState.forms[authState.profile]}});
  authBusy(false);
  if (!result.ok) {authToast('error',result.message);return;}
  authState.requestId = result.requestId;
  authState.otpLength = Number.isInteger(result.otpLength) && result.otpLength >= 4 && result.otpLength <= 8 ? result.otpLength : 6;
  authState.preview = false; authState.code = '';
  authState.forms[authState.profile].password = ''; authState.forms[authState.profile].confirm = '';
  authState.view = 'otp';paintLoginPanel();authToast('success','Votre demande de vérification a été envoyée.');
}
function authOtpValues() { return [...document.querySelectorAll('.auth-otp-case')].map(input=>input.value).join(''); }
async function onOtpSubmit(event) {
  event.preventDefault();if(authState.busy)return;
  const code=authOtpValues();authState.code=code;
  if(code.length!==authState.otpLength || !/^\d+$/.test(code)){authOtpError('Le code saisi semble incomplet.');return;}
  if(authState.preview === 'demo') {
    if(code !== DEMO_OTP_CODE){authOtpError('Code simulé incorrect. Vérifiez les six chiffres affichés.');return;}
    authOtpAccepted(true);return;
  }
  if(authState.preview || !authState.requestId){authOtpError('Aucun code réel n’a été envoyé : la vérification est indisponible dans cet aperçu.');return;}
  authBusy(true,'Vérification en cours…');
  const result=await registrationOperation('verify',{profile:authState.profile,requestId:authState.requestId,code});
  authBusy(false);
  if(!result.ok){authOtpError(result.message);return;}
  authOtpAccepted(false);
}
function authOtpAccepted(demo) {
  document.querySelector('.auth-otp-cases')?.classList.add('is-accepted');
  document.querySelectorAll('.auth-otp-case').forEach(box => box.disabled = true);
  authState.busy = true;
  window.setTimeout(() => {
    authState.busy = false;
    if (authState.view !== 'otp') return;
    authState.view='confirmed';authState.forms={entreprise:{},personne:{}};authState.code='';
    paintLoginPanel();
    document.getElementById('auth-toasts')?.replaceChildren();
    authToast('success',demo?'Code de présentation validé localement.':'Votre adresse e-mail a été vérifiée.');
  }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 560);
}
function authOtpError(message) {
  authState.otpError=message;const cases=document.querySelector('.auth-otp-cases');cases?.classList.add('is-error');
  document.querySelectorAll('.auth-otp-case').forEach(input=>{input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby','otp-error')});
  const el=document.getElementById('otp-error');if(el)el.textContent=message;
  authToast('error',message);
}
async function authResend() {
  if(authState.busy)return;
  if(authState.preview === 'demo'){authToast('info','Renvoi simulé : le code de présentation reste affiché. Aucun e-mail n’a été envoyé.');return;}
  if(authState.preview || !authState.requestId){authToast('info','Aucun code à renvoyer : l’envoi nécessite le service de vérification.');return;}
  const resend=document.querySelector('[data-auth-action="resend"]');
  const label=resend?.innerHTML;
  authState.busy=true;
  const verify=document.querySelector('#otp-form button[type="submit"]');
  if(verify) verify.disabled=true;
  if(resend){resend.disabled=true;resend.innerHTML=`${SPINNER_SVG} Renvoi en cours…`;}
  const result=await registrationOperation('resend',{profile:authState.profile,requestId:authState.requestId});
  authState.busy=false;
  if(verify) verify.disabled=false;
  if(resend){resend.disabled=false;resend.innerHTML=label;}
  authToast(result.ok ? 'success' : 'error',result.ok ? 'Un nouveau code a été demandé.' : result.message);
}
function handleAuthInput(target) {
  if(target.id==='email'){authState.email=target.value;authClearFieldError('email');}
  if(target.id==='password')authClearFieldError('password');
  if(target.id==='reset-email'){authState.reset.email=target.value;authClearResetError('email');}
  if(target.id==='reset-password' || target.id==='reset-confirm'){
    const key = target.id === 'reset-password' ? 'password' : 'confirm';
    authState.reset[key] = target.value;
    authClearResetError(key === 'password' ? 'password' : 'confirm');
    const hints = document.querySelector('.auth-password-hints');
    if (hints) hints.outerHTML = authResetPasswordHints();
    return;
  }
  if(target.matches('#registration-form input')){
    const key=target.name;
    authState.forms[authState.profile][key]=target.value;
    authClearFieldError(key);
    if(key==='password' || key==='confirm') {
      const hints=document.querySelector('.auth-password-hints');if(hints)hints.outerHTML=authPasswordHints();
    }
  }
  if(target.matches('.auth-otp-case')){
    const boxes=[...document.querySelectorAll('.auth-otp-case')];const i=+target.dataset.otpIndex;
    const digits=target.value.replace(/\D/g,'');
    if(digits.length>1){digits.slice(0,boxes.length-i).split('').forEach((n,j)=>{boxes[i+j].value=n}); boxes[Math.min(boxes.length-1,i+digits.length)]?.focus();}
    else {target.value=digits; if(digits&&i<boxes.length-1)boxes[i+1].focus();}
    const values = boxes.map(box => box.value).join('');
    if (authState.view === 'forgot-otp') {
      authState.reset.code = values;
      authState.reset.otpError = '';
    } else {
      authState.code = values;
      authState.otpError = '';
    }
    boxes.forEach(box=>box.classList.toggle('is-filled',Boolean(box.value)));
    document.querySelector('.auth-otp-cases')?.classList.remove('is-error');
    document.querySelectorAll('.auth-otp-case').forEach(box=>box.removeAttribute('aria-invalid'));
    const errId = authState.view === 'forgot-otp' ? 'reset-otp-error' : 'otp-error';
    const err=document.getElementById(errId);if(err)err.textContent='';
  }
}
function handleAuthKeydown(event) {
  if(!event.target.matches('.auth-otp-case'))return;
  const boxes=[...document.querySelectorAll('.auth-otp-case')];const i=+event.target.dataset.otpIndex;
  if(event.key==='Backspace' && !event.target.value && i>0){event.preventDefault();boxes[i-1].value='';boxes[i-1].focus();const values = boxes.map(box => box.value).join('');if(authState.view==='forgot-otp'){authState.reset.code=values;}else{authState.code=values;}boxes.forEach(box=>box.classList.toggle('is-filled',Boolean(box.value)));}
  if(event.key==='ArrowLeft' && i>0){event.preventDefault();boxes[i-1].focus();}
  if(event.key==='ArrowRight' && i<boxes.length-1){event.preventDefault();boxes[i+1].focus();}
}
function handleAuthPaste(event) {
  if(!event.target.matches('.auth-otp-case'))return;
  const digits=event.clipboardData?.getData('text').replace(/\D/g,'') || '';
  if(!digits)return;event.preventDefault();const boxes=[...document.querySelectorAll('.auth-otp-case')];
  const start=digits.length>=boxes.length ? 0 : +event.target.dataset.otpIndex;
  digits.slice(0,boxes.length-start).split('').forEach((digit,i)=>{boxes[start+i].value=digit});
  boxes[Math.min(boxes.length-1,start+digits.length-1)]?.focus();
  const values = boxes.map(box => box.value).join('');
  if(authState.view==='forgot-otp'){authState.reset.code=values;authState.reset.otpError='';}else{authState.code=values;authState.otpError='';}
  boxes.forEach(box=>box.classList.toggle('is-filled',Boolean(box.value)));
  document.querySelector('.auth-otp-cases')?.classList.remove('is-error');
  document.querySelectorAll('.auth-otp-case').forEach(box=>box.removeAttribute('aria-invalid'));
  const errId = authState.view === 'forgot-otp' ? 'reset-otp-error' : 'otp-error';
  const err=document.getElementById(errId);if(err)err.textContent='';
}
function handleAuthAction(action,buttonEl) {
  if(action==='close-toast'){buttonEl.closest('.auth-toast')?.remove();return;}
  if(action==='demo-panel' && PRESENTATION_MODE){authState.demoPanel=!authState.demoPanel;paintLoginPanel();return;}
  if(action==='demo-enter' && PRESENTATION_MODE){const role=buttonEl.dataset.demoRole;if(enterPresentation(role, buttonEl.dataset.demoEmail)){navigateTo(workspacePath(role,'overview'));}return;}
  if(action==='demo-otp' && PRESENTATION_MODE){
    resetAuthFlow();authState.profile='personne';authState.forms.personne.email='alain.moussavou@example.invalid';
    authState.preview='demo';authState.otpLength=6;authState.view='otp';
    navigateTo('/register');paintLoginPanel();return;
  }
  if(action==='demo-open' && PRESENTATION_MODE && authState.preview==='demo'){
    const role=authState.profile==='entreprise'?'demandeur':'recipient';
    if(enterPresentation(role))navigateTo(workspacePath(role,'overview'));
    return;
  }
  if(action==='demo-resend-error' && authState.preview==='demo'){authToast('error','Échec de renvoi simulé. Aucun e-mail n’a été envoyé.');return;}
  if(action==='login'){resetAuthFlow();navigateTo('/login');paintLoginPanel();return;}
  if(action==='register'){resetAuthFlow();authState.view='choose';navigateTo('/register');paintLoginPanel();return;}
  if(action==='forgot'){
    resetAuthFlow();
    authState.view = 'forgot-email';
    navigateTo('/login');
    paintLoginPanel();
    return;
  }
  if(action==='reset-resend'){authResetResend();return;}
  if(action==='reset-resend-error' && authState.reset.preview==='demo'){authToast('error','Échec de renvoi simulé. Aucun e-mail n’a été envoyé.');return;}
  if(action==='reset-change-email'){
    authState.view = 'forgot-email';
    authState.reset.code = '';
    authState.reset.otpError = '';
    paintLoginPanel();
    return;
  }
  if(action==='reset-back-otp'){
    authState.view = 'forgot-otp';
    authState.reset.password = '';
    authState.reset.confirm = '';
    authClearResetError('password');
    authClearResetError('confirm');
    paintLoginPanel();
    return;
  }
  if(action==='reset-to-login'){resetAuthFlow();navigateTo('/login');paintLoginPanel();return;}
  if(action==='profile'){
    authState.profile=buttonEl.dataset.profile;
    document.querySelectorAll('.auth-profile').forEach(card=>{
      const selected=card.dataset.profile===authState.profile;
      card.classList.toggle('is-selected',selected);
      card.setAttribute('aria-pressed',String(selected));
    });return;
  }
  if(action==='start-profile'){if(!authState.profile){authToast('error','Choisissez un type de compte pour continuer.');return;}authState.step=0;authState.view='form';paintLoginPanel();return;}
  if(action==='previous'){if(authState.busy)return;if(authState.step>0)authState.step--;else authState.view='choose';authState.errors={};paintLoginPanel();return;}
  if(action==='toggle-password'){
    const key=buttonEl.dataset.fieldKey;const input=document.getElementById(key==='login'?'password':(key==='reset-password'?'reset-password':(key==='reset-confirm'?'reset-confirm':`reg-${key}`)));
    if(!input)return;const show=input.type==='password';input.type=show?'text':'password';
    authState.showPassword[key]=show;buttonEl.setAttribute('aria-pressed',String(show));
    const labelTarget=key==='login'?'le mot de passe':key==='confirm'?'la confirmation du mot de passe':key==='reset-password'?'le nouveau mot de passe':key==='reset-confirm'?'la confirmation du mot de passe':'le mot de passe';
    buttonEl.setAttribute('aria-label',`${show?'Masquer':'Afficher'} ${labelTarget}`);
    buttonEl.innerHTML=icon(show?'eyeOff':'eye','size-4');input.focus();return;
  }
  if(action==='preview-otp'){
    authState.preview=true;authState.requestId=null;authState.code='';authState.otpError='';authState.view='otp';
    authState.forms[authState.profile].password='';authState.forms[authState.profile].confirm='';paintLoginPanel();return;
  }
  if(action==='back-to-form'){authState.view='form';authState.step=AUTH_STEPS[authState.profile].length-1;authState.code='';authState.otpError='';paintLoginPanel();return;}
  if(action==='resend')authResend();
}
function resetAuthFlow() {
  authState.view='login';authState.profile=null;authState.step=0;authState.forms={entreprise:{},personne:{}};
  authState.errors={};authState.code='';authState.requestId=null;authState.preview=false;authState.otpError='';authState.showPassword={};authState.demoPanel=false;
  authState.reset = { email: '', step: 0, requestId: null, code: '', otpLength: 6, otpError: '', errors: {}, password: '', confirm: '', preview: false };
}

/* ==================================================================
   Soumission des écrans de récupération / réinitialisation
================================================================== */
function authClearResetError(key) {
  delete authState.reset.errors[key];
  const container = document.querySelector(`[data-auth-field="reset-${key}"]`);
  container?.querySelector('.auth-inline-error')?.remove();
  const input = container?.querySelector('input');
  if (input) { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
}

async function onForgotEmailSubmit(event) {
  event.preventDefault();
  if (authState.busy) return;
  const email = document.getElementById('reset-email')?.value.trim() || '';
  authClearResetError('email');
  if (!email) {
    authFieldError('reset-email', 'Veuillez saisir votre adresse e-mail.');
    authToast('error', 'Veuillez saisir votre adresse e-mail.');
    return;
  }
  if (!AUTH_EMAIL.test(email)) {
    authFieldError('reset-email', 'Saisissez une adresse e-mail valide.');
    authToast('error', 'Adresse e-mail non valide.');
    return;
  }
  authState.reset.email = email;
  authBusy(true, 'Envoi en cours…');
  let result;
  if (registrationAvailable) {
    result = await registrationOperation('start', { profile: 'reset', fields: { email } });
  } else if (PRESENTATION_MODE) {
    // Mode présentation : on conserve l’UX mais on ne simule aucun envoi.
    authState.reset.preview = 'demo';
    authState.reset.requestId = null;
    authState.reset.code = '';
    authState.reset.otpError = '';
    result = { ok: true, preview: 'demo' };
  } else {
    // Aperçu neutre : pas d’adaptateur, pas de service, mais UX testable.
    authState.reset.preview = 'preview';
    authState.reset.requestId = null;
    authState.reset.code = '';
    result = { ok: true, preview: 'preview' };
  }
  authBusy(false);
  if (!result || !result.ok) {
    authToast('error', (result && result.message) || 'Impossible d’envoyer le code pour le moment.');
    return;
  }
  if (result.requestId) authState.reset.requestId = result.requestId;
  if (Number.isInteger(result.otpLength) && result.otpLength >= 4 && result.otpLength <= 8) {
    authState.reset.otpLength = result.otpLength;
  }
  authState.view = 'forgot-otp';
  paintLoginPanel();
  const note = authState.reset.preview === 'demo'
    ? 'Aucun e-mail n’a été envoyé. Code de présentation affiché pour valider la procédure.'
    : 'Si un compte correspond à cette adresse, un code vient d’être envoyé.';
  authToast(authState.reset.preview === 'demo' ? 'info' : 'success', note);
}

function authResetOtpValues() {
  return [...document.querySelectorAll('.auth-otp-case')].map((input) => input.value).join('');
}

async function onForgotOtpSubmit(event) {
  event.preventDefault();
  if (authState.busy) return;
  const code = authResetOtpValues();
  authState.reset.code = code;
  if (code.length !== authState.reset.otpLength || !/^\d+$/.test(code)) {
    authState.reset.otpError = 'Le code saisi semble incomplet.';
    authToast('error', authState.reset.otpError);
    document.querySelector('.auth-otp-cases')?.classList.add('is-error');
    return;
  }
  if (authState.reset.preview === 'demo') {
    if (code !== DEMO_OTP_CODE) {
      authState.reset.otpError = 'Code simulé incorrect. Vérifiez les six chiffres affichés.';
      authToast('error', authState.reset.otpError);
      document.querySelector('.auth-otp-cases')?.classList.add('is-error');
      return;
    }
    authState.view = 'forgot-password';
    paintLoginPanel();
    authToast('success', 'Code de présentation validé localement.');
    return;
  }
  if (authState.reset.preview || !authState.reset.requestId) {
    authState.reset.otpError = 'Aucun code réel n’a été envoyé : la vérification est indisponible dans cet aperçu.';
    authToast('error', authState.reset.otpError);
    return;
  }
  authBusy(true, 'Vérification en cours…');
  const result = await registrationOperation('verify', { profile: 'reset', requestId: authState.reset.requestId, code });
  authBusy(false);
  if (!result.ok) {
    authState.reset.otpError = result.message || 'Code invalide.';
    authToast('error', authState.reset.otpError);
    return;
  }
  authState.view = 'forgot-password';
  paintLoginPanel();
  authToast('success', 'Code vérifié. Choisissez votre nouveau mot de passe.');
}

async function authResetResend() {
  if (authState.busy) return;
  if (authState.reset.preview === 'demo') {
    authToast('info', 'Renvoi simulé : le code de présentation reste affiché. Aucun e-mail n’a été envoyé.');
    return;
  }
  if (authState.reset.preview || !authState.reset.requestId) {
    authToast('info', 'Aucun code à renvoyer : l’envoi nécessite le service de récupération.');
    return;
  }
  authBusy(true, 'Renvoi en cours…');
  const result = await registrationOperation('resend', { profile: 'reset', requestId: authState.reset.requestId });
  authBusy(false);
  authToast(result.ok ? 'success' : 'error', result.ok ? 'Un nouveau code a été demandé.' : (result.message || 'Renvoi impossible.'));
}

async function onResetPasswordSubmit(event) {
  event.preventDefault();
  if (authState.busy) return;
  const password = document.getElementById('reset-password')?.value || '';
  const confirm = document.getElementById('reset-confirm')?.value || '';
  authState.reset.password = password;
  authState.reset.confirm = confirm;
  authState.reset.errors = {};
  authClearResetError('password');
  authClearResetError('confirm');
  let invalid = false;
  if (!password) { authFieldError('reset-password', 'Veuillez saisir un nouveau mot de passe.'); invalid = true; }
  else if (password.length < 6) { authFieldError('reset-password', 'Au moins 6 caractères sont nécessaires.'); invalid = true; }
  if (password && password !== confirm) { authFieldError('reset-confirm', 'Les mots de passe ne correspondent pas.'); invalid = true; }
  if (invalid) { authToast('error', 'Vérifiez les champs indiqués.'); return; }
  if (authState.reset.preview) {
    // Aperçu local : on confirme visuellement, sans écrire sur un serveur.
    authState.view = 'forgot-success';
    authState.reset.password = '';
    authState.reset.confirm = '';
    paintLoginPanel();
    authToast('success', 'Mot de passe réinitialisé localement (aucun service n’est connecté).');
    return;
  }
  if (!registrationAvailable) {
    authToast('info', 'Aucun service connecté : réinitialisation non transmise.');
    return;
  }
  authBusy(true, 'Validation…');
  // L’adaptateur doit fournir une opération dédiée si le backend le supporte.
  // En son absence, la simulation de succès est INTERDITE.
  authBusy(false);
  authToast('info', 'L’opération de réinitialisation n’est pas exposée par l’adaptateur actuel.');
}
