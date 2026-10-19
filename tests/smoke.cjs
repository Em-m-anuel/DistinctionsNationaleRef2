/* Vérifications sans dépendance npm ni navigateur.
   Exécution : npm test (ou node tests/smoke.cjs). */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const scripts = [
  'js/site-config.js', 'js/icons.js', 'js/data.js', 'js/auth.js', 'js/demo-accounts.js', 'js/portal-demo.js', 'js/demo-store.js', 'js/router.js', 'js/ui.js',
  'js/views/home.js', 'js/registration.js', 'js/views/login.js', 'js/views/workspace.js', 'js/views/portals.js', 'js/views/portal-extras.js', 'js/views/admin.js', 'js/views/role-pages.js', 'js/views/shared.js', 'js/cf-store.js',
  'js/gab-orient/data.js', 'js/gab-orient/charts.js', 'js/gab-orient/map.js', 'js/gab-orient/core.js',
  'js/gab-orient/views-dossiers.js', 'js/gab-orient/views-demande.js', 'js/gab-orient/views-courriers.js',
  'js/gab-orient/views-ceremonies.js', 'js/gab-orient/views-service.js', 'js/gab-orient/views-decisions.js',
  'js/gab-orient/views-regie.js', 'js/gab-orient/views-admin.js', 'js/gab-orient/bridge.js',
  'js/views/go-ui.js', 'js/views/go-pages.js', 'js/views/internal-portal.js', 'js/cf-app.js', 'js/app.js',
];

const storage = () => ({ getItem: () => null, setItem: () => {}, removeItem: () => {} });
const context = vm.createContext({
  window: { DN_AUTH_ENDPOINT: null, localStorage: storage(), sessionStorage: storage(), location: { hash: '', pathname: '/' } },
  document: {},
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
});

// Les fichiers navigateur partagent la même portée globale, comme lorsqu'ils
// sont chargés dans l'ordre des <script> de index.html. `app.js` exige un DOM
// réel : sa syntaxe est testée ci-dessous ; sa vue est testée séparément.
for (const file of scripts.slice(0, -1)) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  vm.runInContext(source, context, { filename: file });
}
vm.runInContext('globalThis.expose = { renderHome, renderLogin, renderWorkspace, renderAdmin, ROLE_CONFIGS, ROLE_ORDER, SECRETARIAT_ROLES, SERVICE_ROLES, INTERNAL_ROLES, parseWorkspacePath, workspacePath, icon, SITE_FAMILIES, siteAllRoutes, siteCanonicalPage, medal, AUTH_STEPS, authState, authFormPanel, authOtpPanel, authForgotEmailPanel, authForgotOtpPanel, authForgotPasswordPanel, authForgotSuccessPanel, AUTH_RESET_STEPS, authResetPasswordHints, authMaskEmail, registrationOperation, signIn, DEMO_ACCOUNTS, findDemoAccount, groupDemoAccounts, INTERNAL_DEMO, internalDemoData };', context);
const { renderHome, renderLogin, renderWorkspace, renderAdmin, ROLE_CONFIGS, ROLE_ORDER, SECRETARIAT_ROLES, SERVICE_ROLES, INTERNAL_ROLES, parseWorkspacePath, workspacePath, icon, SITE_FAMILIES, siteAllRoutes, siteCanonicalPage, medal, AUTH_STEPS, authState, authFormPanel, authOtpPanel, authForgotEmailPanel, authForgotOtpPanel, authForgotPasswordPanel, authForgotSuccessPanel, AUTH_RESET_STEPS, authResetPasswordHints, authMaskEmail, registrationOperation, signIn, DEMO_ACCOUNTS, findDemoAccount, groupDemoAccounts, INTERNAL_DEMO, internalDemoData } = context.expose;

test('les fichiers JavaScript sont syntaxiquement valides', () => {
  for (const file of scripts) {
    execFileSync(process.execPath, ['--check', path.join(root, file)]);
  }
});

test('la version statique est autonome au démarrage', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'css/app.css'), 'utf8');
  assert.match(html, /<link rel="stylesheet" href="\/css\/app\.css"/);
  // La page d'accueil ne charge que ses scripts ; le shell des pages métier
  // porte la liste complète. Chaque script doit être référencé quelque part.
  const workspacePage = fs.readFileSync(path.join(root, 'profil/service/instruction/index.html'), 'utf8');
  for (const file of scripts) {
    const pattern = new RegExp(`<script src="\/?${file.replaceAll('.', '\\.')}"`);
    assert.ok(pattern.test(html) || pattern.test(workspacePage), `${file} n'est chargé par aucune page`);
  }
  for (const file of scripts) {
    if (/views\/(workspace|portals|portal-extras|admin|role-pages)/.test(file)) continue;
    assert.match(workspacePage, new RegExp(`<script src="\/?${file.replaceAll('.', '\\.')}"`));
  }
  assert.ok(css.length > 30_000, 'le CSS précompilé doit être livré');
  assert.match(css, /\.bg-republic-green-500/);
  assert.doesNotMatch(html, /react-dom|\/src\/main\.tsx|@vite/);
});

test('l’accueil et la connexion conservent leurs éléments essentiels', () => {
  const home = renderHome(null);
  const login = renderLogin(null);
  assert.match(home, /Reconnaître l&amp;apos;excellence|Reconnaître l&apos;excellence/);
  assert.match(home, /id="medailles"/);
  assert.match(home, /data-rotator/);
  assert.match(home, /data-stat-card/);
  assert.match(login, /id="login-form"/);
  assert.match(login, /Créer un compte/);
  assert.match(login, /Adresse e-mail/);
  assert.doesNotMatch(login, /demo@distinctions\.ga|data-action="login-space"|role="tablist"/);
  assert.match(icon('medal'), /<svg/);
  assert.match(medal({ type: 'or' }), /HONNEUR ET MÉRITE/);
});

test('les décors et contrôles de lecture restent limités à l’accueil', () => {
  const home = renderHome(null);
  const login = renderLogin(null);
  for (const color of ['green', 'yellow', 'blue']) {
    assert.match(home, new RegExp(`data-home-segment="${color}"`));
  }
  assert.match(home, /data-back-to-top/);
  assert.match(home, /home-footer/);
  assert.match(home, /home-art--hero-map/);
  assert.doesNotMatch(home, /data-rotator-prev|data-rotator-next|data-rotator-dots|data-action="rotator-goto"/);
  assert.doesNotMatch(login, /data-home-progress|data-back-to-top|home-art--hero-map/);
  assert.ok(fs.statSync(path.join(root, 'assets/paper-grain.svg')).size < 3_000);
});

test('la FAQ présente douze réponses et renvoie au contact réel', () => {
  const home = renderHome(null);
  assert.deepEqual(
    [...home.matchAll(/<section id="([^"]+)"/g)].map((match) => match[1]),
    ['accueil', 'processus', 'medailles', 'valeurs', 'situations', 'chiffres', 'faq', 'contact'],
  );
  const faq = home.split('<section id="faq"')[1].split('<section id="contact"')[0];
  assert.match(faq, /Questions fréquentes/);
  assert.equal((faq.match(/<details\b/g) || []).length, 12);
  assert.equal((faq.match(/<summary\b/g) || []).length, 12);
  for (const topic of ['DTS', '10 à 19 ans', '20 à 29 ans', '30 ans et plus', 'recours',
    'Trésor', 'Régisseur', 'cérémonie', 'compte personnel', 'relance']) {
    assert.ok(faq.includes(topic), `FAQ : mention manquante « ${topic} »`);
  }
  assert.match(faq, /data-action="scroll" data-target="contact"/);
  assert.doesNotMatch(faq, /Toutes les questions|mailto:|href="#[^"]*faq-all/);
});

test('le circuit animé reste illustratif, et l’icône de connexion est indépendante', () => {
  const home = renderHome(null);
  const process = home.split('<section id="processus"')[1].split('<section id="medailles"')[0];
  assert.match(process, /data-process-visual/);
  assert.match(process, /home-process-rail/);
  assert.match(process, /home-process-fill/);
  assert.equal((process.match(/Étape 0[1-5]/g) || []).length, 5);
  assert.match(process, /ne représente pas l’état d’un dossier particulier/);
  assert.match(home, /class="home-user-head"/);
  assert.match(home, /class="home-user-body"/);
  const source = fs.readFileSync(path.join(root, 'js/views/home.js'), 'utf8');
  assert.match(source, /function mountProcessVisual\(/);
  assert.match(source, /IntersectionObserver\(\(\[entry\]\)/);
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /if \(!visible\) return;/);
});

test('les parcours inscription et OTP conservent les champs prévus sans faux succès', async () => {
  assert.deepEqual(Array.from(AUTH_STEPS.entreprise, step => step.fields.length), [5, 6, 5]);
  assert.deepEqual(Array.from(AUTH_STEPS.personne, step => step.fields.length), [5, 3]);
  assert.ok(AUTH_STEPS.entreprise[0].fields.some(([key]) => key === 'forme'));
  assert.ok(AUTH_STEPS.entreprise[0].fields.some(([key]) => key === 'structure'));
  authState.view = 'choose';
  assert.equal((renderLogin(null, '/register').match(/class="auth-profile /g) || []).length, 2);
  authState.profile = 'entreprise'; authState.step = 2; authState.view = 'form';
  const form = authFormPanel();
  for (const key of ['adresse','telephone','email','password','confirm']) assert.match(form, new RegExp(`name="${key}"`));
  authState.view = 'otp'; authState.forms.entreprise.email = 'prenom@example.com';
  const otp = authOtpPanel();
  assert.equal((otp.match(/class="auth-otp-case(?: |")/g) || []).length, 6);
  assert.match(otp, /Aucun code n’a été envoyé|Un code de vérification a été envoyé/);
  const unavailable = await registrationOperation('start', { profile: 'entreprise', fields: {} });
  assert.equal(unavailable.ok, false);
  assert.equal(unavailable.unavailable, true);
  assert.equal((await signIn({ email: 'demo@distinctions.ga', password: 'Gabon2026', remember: false })).ok, false);
  authState.view = 'login';
});

test('le parcours mot de passe oublié propose 4 étapes sans simulation de service', () => {
  // Étape 1 : la page de connexion expose le lien « Mot de passe oublié ? »
  const login = renderLogin(null);
  assert.match(login, /data-auth-action="forgot"/);
  assert.match(login, /Mot de passe oublié/);
  // Étape 2 : AUTH_RESET_STEPS contient 4 phases
  assert.equal(AUTH_RESET_STEPS.length, 4);
  const keys = AUTH_RESET_STEPS.map(step => step.key);
  assert.equal(JSON.stringify(keys), JSON.stringify(['email', 'otp', 'password', 'done']));
  // Étape 3 : chaque panel s'affiche et ne fait aucune promesse de service
  const emailPanel = authForgotEmailPanel();
  assert.match(emailPanel, /data-view="forgot-email"/);
  assert.match(emailPanel, /id="forgot-email-form"/);
  assert.match(emailPanel, /id="reset-email"/);
  // L'adaptateur absent ne doit jamais transformer un envoi en succès
  assert.doesNotMatch(emailPanel, /adresse vérifiée|code généré|envoyé avec succès/);
  const otpPanel = authForgotOtpPanel();
  assert.match(otpPanel, /data-view="forgot-otp"/);
  assert.match(otpPanel, /id="forgot-otp-form"/);
  assert.match(otpPanel, /CODE DE RÉCUPÉRATION|adresse correspond/);
  // Le code de présentation n'apparaît JAMAIS en clair dans l'aperçu neutre
  assert.doesNotMatch(otpPanel, /123456|000000|111111/);
  const passwordPanel = authForgotPasswordPanel();
  assert.match(passwordPanel, /data-view="forgot-password"/);
  assert.match(passwordPanel, /id="reset-password-form"/);
  assert.match(passwordPanel, /id="reset-password"/);
  assert.match(passwordPanel, /id="reset-confirm"/);
  assert.match(authResetPasswordHints(), /Six caractères minimum/);
  // Étape 4 : le panneau de succès redirige explicitement vers la connexion
  const successPanel = authForgotSuccessPanel();
  assert.match(successPanel, /data-view="forgot-success"/);
  assert.match(successPanel, /data-auth-action="reset-to-login"/);
  assert.match(successPanel, /Se connecter/);
  // L'e-mail masqué est réutilisé, jamais écrit en clair
  const masked = authMaskEmail('alain.moussavou@example.invalid');
  assert.match(masked, /^al•+@example\.invalid$/);
  // L'OTP du panneau doit rester neutre si l'aperçu n'est pas en mode démo
  assert.doesNotMatch(otpPanel, /code de présentation/);
});

test('les huit rôles et les pages de leur navigation sont rendus', () => {
  assert.equal(ROLE_ORDER.length, 13);
  let count = 0;
  for (const role of ROLE_ORDER) {
    if (role === 'admin') continue; // Admin a son propre test plus bas.
    const nav = typeof ipNav === 'function' ? ipNav(role) : ROLE_CONFIGS[role].nav;
    const pages = [];
    for (const it of nav) {
      if (it.children) it.children.forEach((c) => pages.push(c.page));
      else pages.push(it.page);
    }
    for (const page of [...new Set(pages)]) {
      const path = workspacePath(role, page);
      const parsed = parseWorkspacePath(path);
      assert.ok(parsed, `${role}/${page} : URL non reconnue (${path})`);
      assert.ok(parsed.family, `${role}/${page} : famille manquante`);
      assert.equal(parsed.page, siteCanonicalPage(parsed.family, page) || 'overview', `${role}/${page} → ${path}`);
      const markup = renderWorkspace(role, page);
      assert.match(markup, /data-ws-content/, role + '/' + page);
      assert.match(markup, /<h1\b/, role + '/' + page);
      count++;
    }
    // L’avatar de la barre supérieure mène aussi au profil.
    assert.match(renderWorkspace(role, 'profile'), /Mon profil|Profil/);
  }
  assert.ok(count >= 70, `${count} pages couvertes`);
});

test('les 14 profils métier sont définis, groupés et compatibles avec les routes', () => {
  // Comptes de démo : 14 entrées, une par profil.
  assert.equal(DEMO_ACCOUNTS.length, 14);
  const roles = DEMO_ACCOUNTS.map((a) => a.role);
  const expected = ['demandeur','recipient','secretariat_ministre','secretariat_dgt','secretariat_dr','ministre','dgt','dr','service_agent','service_inspecteur','service_chef','regisseur','admin'];
  for (const role of expected) assert.ok(roles.includes(role), `rôle manquant dans DEMO_ACCOUNTS : ${role}`);
  // findDemoAccount : insensible à la casse.
  const found = findDemoAccount('DEMO.ADMIN@example.test');
  assert.ok(found);
  assert.equal(found.role, 'admin');
  // Aucun mot de passe réel ou adresse e-mail valide.
  for (const account of DEMO_ACCOUNTS) {
    assert.match(account.email, /@example\.test$/);
    assert.notEqual(account.email, 'demo@distinctions.ga');
  }
  // Groupes de démo : 7 catégories attendues.
  const groups = groupDemoAccounts();
  assert.equal(groups.length, 7);
  // Regroupements internes : 3 secrétariats, 3 services.
  assert.equal(SECRETARIAT_ROLES.length, 3);
  assert.equal(SERVICE_ROLES.length, 3);
  // Aucun rôle métier ne se confond avec ADMIN (séparation explicite).
  assert.equal(INTERNAL_ROLES.includes('demandeur'), false);
  assert.equal(INTERNAL_ROLES.includes('recipient'), false);
  assert.ok(INTERNAL_ROLES.includes('admin'));
});

test('chaque profil possède une navigation et l’admin a son propre rendu', () => {
  for (const role of ROLE_ORDER) {
    const config = ROLE_CONFIGS[role];
    assert.ok(config && config.nav && config.nav.length >= 3, `${role} : navigation insuffisante`);
    assert.ok(config.label && config.shortLabel, `${role} : libellés manquants`);
  }
  // Le profil admin ne doit PAS hériter des écrans de service ou régisseur.
  const adminNav = ROLE_CONFIGS.admin.nav.map((n) => n.page);
  assert.equal(adminNav.includes('instruction'), false);
  assert.equal(adminNav.includes('stock'), false);
  // Rétrocompatibilité : les anciens liens "secretariat" et "service"
  // restent valides et pointent vers un rôle connu.
  const oldSecretariat = parseWorkspacePath('/app/secretariat/overview');
  assert.equal(oldSecretariat.role, 'secretariat_ministre');
  const oldService = parseWorkspacePath('/app/service/overview');
  assert.equal(oldService.role, 'service_chef');
});

test('l’espace administrateur est isolé des espaces métier', () => {
  const adminMarkup = renderAdmin('admin', 'overview');
  // L'admin utilise désormais le même header sticky que les autres rôles.
  assert.match(adminMarkup, /site-header/);
  // L'admin ne doit pas exposer de sidebar latérale.
  assert.doesNotMatch(adminMarkup, /wsSidebar|portalSidebar/);
  // Le contenu de l'admin ne mentionne pas la localisation physique
  // (qui est une information strictement interne aux secrétariats).
  assert.doesNotMatch(adminMarkup, /Localisation physique|wsTransmissions/);
  // Pas d'appel à un service métier : les écrans admin restent neutres.
  assert.match(adminMarkup, /<h1\b/);
});

test('les espaces profils utilisent un header sticky sans sidebar', () => {
  for (const role of ROLE_ORDER) {
    if (role === 'admin') continue; // Test dédié ci-dessus.
    if (role === 'demandeur' || role === 'recipient') continue; // Portails séparés.
    const markup = renderWorkspace(role, 'overview');
    assert.match(markup, /site-header/, `${role} : header manquant`);
    // Le CSS compilé injecte la classe `sticky` ; on vérifie simplement la présence.
    assert.match(markup, /sticky/, `${role} : header non sticky`);
    assert.match(markup, /main-nav|id="nav-list"/, `${role} : navigation manquante`);
    assert.doesNotMatch(markup, /wsSidebar|portalSidebar/, `${role} : sidebar latérale détectée`);
    assert.match(markup, /page-head|ws-hero/, `${role} : en-tête de page manquant`);
  }
});

test('le calendrier mensuel des cérémonies est généré', () => {
  const html = renderWorkspace('service_chef', 'ceremonies');
  assert.match(html, /Cérémonies|cal-layout|cal-head/);
  assert.match(html, /Calendrier|Lun|Mar|Aujourd’hui/);
});

test('les pages décisions/recours/relances sont rendues pour les autorités', () => {
  for (const role of ['ministre', 'dgt', 'dr']) {
    const decisions = renderWorkspace(role, 'decisions');
    assert.match(decisions, /Dossiers transmis et décisions|Décider|page-head/);
    const recours = renderWorkspace(role, 'recours');
    assert.match(recours, /Recours/);
    const journal = renderWorkspace(role, 'journal');
    assert.match(journal, /Journal|page-head/);
  }
});

test('les illustrations d\'arrière-plan ont été retravaillées', () => {
  const src = fs.readFileSync(path.join(root, 'js/views/home.js'), 'utf8');
  // Cartography : silhouette du Gabon en un seul path continu
  assert.match(src, /GABON_OUTLINE = "M50 102 L448 100/, 'nouvelle silhouette du Gabon continue');
  // Cathedral : façade néoclassique à 8 colonnes + fronton + drapeau
  assert.match(src, /Façade néoclassique/, 'façade néoclassique');
  assert.match(src, /colXs = \[50, 100, 150, 200, 280, 330, 380, 430\]/, '8 colonnes symétriques');
  assert.match(src, /drapeau au sommet/, 'drapeau sur le fronton');
  // National-flow : faisceau de lignes tricolores
  assert.match(src, /Faisceau de lignes ondulées/, 'faisceau tricolore');
  // Senate : arc institutionnel à fronton
  assert.match(src, /Arc institutionnel/, 'arc à fronton');
  // Colonne toscane
  assert.match(src, /Colonne toscane/, 'colonne toscane');
  // Palette unifiée bleu-gris
  assert.match(src, /#5b7791/, 'palette bleu-gris unifiée');
  // Pas de retour aux anciennes illustrations (rosace)
  assert.doesNotMatch(src, /Rosace institutionnelle/, 'rosace supprimée');
  assert.doesNotMatch(src, /Coupole supérieure/, 'ancien motif de cathédrale supprimé');
  // Cartography : tracé continu (pas de M...M... fragments)
  const outlineMatch = src.match(/const GABON_OUTLINE = "([^"]+)"/);
  if (outlineMatch) {
    const path = outlineMatch[1];
    // Un seul M initial (pas de M répétés)
    const mCount = (path.match(/M/g) || []).length;
    assert.equal(mCount, 1, 'un seul point de départ (path continu)');
    // Pas de points parasites (pas plus de 60 segments)
    const segments = path.split(/\s+/).filter(Boolean).length;
    assert.ok(segments < 60, 'tracé compact : ' + segments + ' segments');
  }
});

test('les illustrations animées ont le bon nombre de sous-groupes', () => {
  // Charger home.js dans un mini-DOM et compter les <g> top-level
  // de chaque SVG animé. Le CSS cible nth-of-type(1..N) sur les
  // enfants directs du <svg>, il faut donc un nombre exact.
  const fs2 = require('fs');
  const vm = require('vm');
  const code = fs2.readFileSync(path.join(root, 'js/views/home.js'), 'utf8');
  function createElement(tag) {
    return { tagName: tag.toUpperCase(), children: [], attrs: {}, style: {},
      classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
      addEventListener() {}, setAttribute(k, v) { this.attrs[k] = v; },
      appendChild(c) { this.children.push(c); return c; },
      querySelector() { return null; }, querySelectorAll() { return []; } };
  }
  const ctx = vm.createContext({
    window: { matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
      localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      location: { hash: '', pathname: '/', protocol: 'http:', hostname: 'localhost' }, addEventListener() {} },
    document: { createElement: (t) => createElement(t), getElementById: () => null,
      querySelector: () => null, querySelectorAll: () => [],
      addEventListener() {}, body: createElement('body') },
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    IntersectionObserver: class { constructor() {} observe() {} unobserve() {} disconnect() {} },
    ResizeObserver: class { constructor() {} observe() {} unobserve() {} disconnect() {} },
  });
  vm.runInContext(code, ctx);
  vm.runInContext('globalThis._h = homeArt;', ctx);
  const homeArt = ctx._h;

  // Compter les <g> frères (même parent) dans le SVG.
  // nth-of-type compte parmi les frères de même balise, donc on
  // cherche le max de <g> à n'importe quel niveau de profondeur.
  function maxSiblingG(svg) {
    let depth = 0, pos = 0;
    const counts = new Map();
    while (pos < svg.length) {
      const o = svg.indexOf('<g', pos);
      const c = svg.indexOf('</g>', pos);
      if (o === -1 && c === -1) break;
      if (o !== -1 && (c === -1 || o < c)) {
        counts.set(depth, (counts.get(depth) || 0) + 1);
        depth++;
        pos = o + 2;
      } else {
        depth--;
        pos = c + 4;
      }
    }
    let max = 0;
    for (const v of counts.values()) if (v > max) max = v;
    return max;
  }

  // Vérifier que les SVG animés ont assez de <g> top-level pour
  // la cascade CSS (nth-of-type(1..N)).
  const cartography = homeArt('cartography', 'home-art--hero-map');
  const cathedral = homeArt('cathedral', 'home-art--hero-monument');
  const senate = homeArt('senate', 'home-art--process-facade');
  const flow = homeArt('national-flow', 'home-art--hero-flow');

  assert.ok(maxSiblingG(cartography) >= 5,
    'cartography : ≥ 5 <g> frères pour nth-of-type(1..5) (trouvé : ' + maxSiblingG(cartography) + ')');
  assert.ok(maxSiblingG(cathedral) >= 8,
    'cathedral : ≥ 8 <g> frères pour nth-of-type(1..8) (trouvé : ' + maxSiblingG(cathedral) + ')');
  assert.ok(maxSiblingG(senate) >= 8,
    'senate : ≥ 8 <g> frères pour nth-of-type(1..8) (trouvé : ' + maxSiblingG(senate) + ')');
  // national-flow : 1 seul <g> frère (le wrapper) — pas de cascade ink-draw,
  // mais animé par home-line-drift (translation).
  assert.ok(maxSiblingG(flow) >= 1,
    'national-flow : ≥ 1 <g> frère (animation : home-line-drift, pas home-ink-draw)');
});

test('les quatre animations du hero sont câblées individuellement', () => {
  // Consigne 5 : ne pas supposer qu'une illustration est animée
  // simplement parce qu'elle est dans le DOM. Vérifier chaque classe.
  const css = fs.readFileSync(path.join(root, 'css/theme.css'), 'utf8');

  // 1. hero-map : home-ink-draw
  assert.match(css,
    /\.home-art--hero-map[^{}]*?\{[^}]*home-ink-draw[^}]*\}/,
    'home-art--hero-map → home-ink-draw');
  // 2. hero-monument : home-ink-draw
  assert.match(css,
    /\.home-art--hero-monument[^{}]*?\{[^}]*home-ink-draw[^}]*\}/,
    'home-art--hero-monument → home-ink-draw');
  // 3. process-facade : home-ink-draw
  assert.match(css,
    /\.home-art--process-facade[^{}]*?\{[^}]*home-ink-draw[^}]*\}/,
    'home-art--process-facade → home-ink-draw');
  // 4. hero-flow : home-line-drift (translation continue, pas ink-draw)
  assert.match(css,
    /\.home-art--hero-flow[^{}]*?\{[^}]*home-line-drift[^}]*\}/,
    'home-art--hero-flow → home-line-drift');

  // 5. Les keyframes existent
  assert.match(css, /@keyframes home-ink-draw\s*\{[^}]*stroke-dasharray[^}]*\}/,
    '@keyframes home-ink-draw utilise stroke-dasharray');
  assert.match(css, /@keyframes home-line-drift/,
    '@keyframes home-line-drift existe');

  // 6. prefers-reduced-motion annule les 3 home-ink-draw
  // Cherchons spécifiquement le bloc qui contient les 3 classes
  const prmBlocks = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}/g) || [];
  // Approximation : on cherche un bloc qui mentionne les 3 classes
  let prm = null;
  for (const block of prmBlocks) {
    if (block.includes('home-art--hero-map') &&
        block.includes('home-art--hero-monument') &&
        block.includes('home-art--process-facade') &&
        block.includes('animation: none')) {
      prm = block;
      break;
    }
  }
  assert.ok(prm, 'un bloc prefers-reduced-motion désactive les 3 home-ink-draw');
  assert.match(prm, /\.home-art--hero-map g,\s*\.home-art--hero-monument g,\s*\.home-art--process-facade g\s*\{\s*animation:\s*none\s*!important/,
    'prefers-reduced-motion : animation:none!important sur les 3 classes');
});

test('le hero de l\'espace connecté anime en entrée avec une courbe adoucie', () => {
  const markup = renderWorkspace('ministre', 'overview');
  // La classe `ws-appear` est requise sur le hero pour qu'une animation
  // d'arrivée soit déclenchée sans dépendre du JavaScript.
  assert.match(markup, /page-head reveal|ws-hero ws-appear/);
});

test('les transitions décoratives respectent prefers-reduced-motion au niveau global', () => {
  const css = fs.readFileSync(path.join(root, 'css/theme.css'), 'utf8');
  // La règle globale doit exister et préserver les micro-transitions
  // (≤ 200 ms) en ne ciblant que les longues animations et les boucles.
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]{0,300}\*[\s\S]{0,400}animation-duration:\s*0\.001ms[\s\S]{0,200}animation-iteration-count:\s*1/,
    'la règle globale prefers-reduced-motion doit couper les animations sans toucher aux transitions courtes'
  );
  // La règle ne doit pas tuer les transitions.
  assert.doesNotMatch(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]{0,200}\*[\s\S]{0,200}\*::before[\s\S]{0,400}transition-duration:\s*0\.001ms/,
    'la règle globale ne doit pas détruire les transitions de feedback'
  );
});

test('le switcher de profils de démonstration expose les 14 comptes, sans bulle d’assistant', () => {
  const fs2 = require('fs');
  const vm2 = require('vm');
  const code = fs2.readFileSync(path.join(root, 'js/views/shared.js'), 'utf8');
  const ctx = vm2.createContext({
    PRESENTATION_MODE: true,
    window: { icon: () => '<svg></svg>', PRESENTATION_MODE: true, sessionStorage: { getItem: () => null, setItem: () => {} } },
    localStorage: { getItem: () => null, setItem: () => {} },
    document: { querySelector: () => null },
  });
  vm2.runInContext(code, ctx);
  assert.equal(typeof ctx.renderProfileSwitcher, 'function', 'renderProfileSwitcher exposé');
  assert.equal(typeof ctx.doSwitchProfile, 'function', 'doSwitchProfile exposé');
  assert.equal(typeof ctx.renderAssistant, 'function', 'renderAssistant exposé');
  assert.equal(ctx.renderAssistant('demandeur'), '', 'aucune bulle d’assistant');
  const switcher = ctx.renderProfileSwitcher('demandeur');
  assert.ok(switcher.includes('demo.entreprise@example.test'), 'contient compte entreprise');
  assert.ok(switcher.includes('demo.service.agent@example.test'), 'contient compte agent');
  assert.ok(switcher.includes('demo.admin@example.test'), 'contient compte admin');
  const itemCount = (switcher.match(/ws-switcher-item/g) || []).length;
  assert.ok(itemCount >= 14, '14 entrées de switcher minimum (trouvé : ' + itemCount + ')');
});

test('les espaces profils n’affichent pas la bulle d’assistant et gardent le switcher en mode démo', () => {
  const fs2 = require('fs');
  const vm2 = require('vm');
  const code = fs2.readFileSync(path.join(root, 'js/views/workspace.js'), 'utf8');
  const codeShared = fs2.readFileSync(path.join(root, 'js/views/shared.js'), 'utf8');
  const codeData = fs2.readFileSync(path.join(root, 'js/data.js'), 'utf8');
  const codePortalDemo = fs2.readFileSync(path.join(root, 'js/portal-demo.js'), 'utf8');
  const codeIcons = fs2.readFileSync(path.join(root, 'js/icons.js'), 'utf8');
  const codeUi = fs2.readFileSync(path.join(root, 'js/ui.js'), 'utf8');
  const codeDemoAcc = fs2.readFileSync(path.join(root, 'js/demo-accounts.js'), 'utf8');
  const codeHome = fs2.readFileSync(path.join(root, 'js/views/home.js'), 'utf8');
  const codeRolePages = fs2.readFileSync(path.join(root, 'js/views/role-pages.js'), 'utf8');
  function createElement(tag) {
    return { tagName: tag.toUpperCase(), children: [], attrs: {}, style: {},
      classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
      addEventListener() {}, setAttribute(k, v) { this.attrs[k] = v; },
      appendChild(c) { this.children.push(c); return c; },
      querySelector() { return null; }, querySelectorAll() { return []; } };
  }
  const ctx = vm2.createContext({
    AUTH_ENDPOINT: '',
    PRESENTATION_MODE: true,
    path: { join: (...a) => a.join('/') },
    window: { matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
      localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      location: { hash: '', pathname: '/app/service_agent/overview', protocol: 'http:', hostname: 'localhost' },
      addEventListener() {}, sessionStorage: { getItem: () => null, setItem: () => {} } },
    document: { createElement: (t) => createElement(t), getElementById: () => null,
      querySelector: () => null, querySelectorAll() { return []; },
      addEventListener() {}, body: createElement('body') },
    console, setTimeout, setInterval,
    IntersectionObserver: class { constructor() {} observe() {} unobserve() {} disconnect() {} },
    ResizeObserver: class { constructor() {} observe() {} unobserve() {} disconnect() {} },
  });
  vm2.runInContext(codeData, ctx);
  vm2.runInContext(codeDemoAcc, ctx);
  vm2.runInContext(codePortalDemo, ctx);
  vm2.runInContext(codeIcons, ctx);
  vm2.runInContext(codeUi, ctx);
  vm2.runInContext(codeHome, ctx);
  vm2.runInContext(codeRolePages, ctx);
  vm2.runInContext(codeShared, ctx);
  vm2.runInContext(code, ctx);
  vm2.runInContext('globalThis._t = { renderWorkspace };', ctx);
  const html = ctx._t.renderWorkspace('service_agent', 'overview');
  assert.equal(html.includes('data-assistant'), false, 'pas de bulle d’assistant');
  assert.equal(html.includes('ws-assistant-fab'), false, 'pas de FAB assistant');
  assert.ok(html.includes('ws-switcher-btn') || html.includes('Changer de profil (démo)'),
    'le HTML du workspace contient le bouton de switcher');
});

test('la planche graphique et les docs modules existent', () => {
  const board = fs.readFileSync(path.join(root, 'docs/design-reference.html'), 'utf8');
  assert.match(board, /#009B62|#009b62/);
  assert.match(board, /#102A50|#102a50/);
  assert.match(board, /Brief pour l’agent illustration|Brief pour l'agent illustration/);
  for (const name of ['EMPLOYEES.md', 'DISTINCTIONS.md', 'FINANCE.md', 'CEREMONIES.md', 'DESIGN_SYSTEM.md', 'PROJECT_STATUS.md']) {
    assert.ok(fs.existsSync(path.join(root, name)), name);
  }
});
