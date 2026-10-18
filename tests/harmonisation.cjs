/* Harmonisation des profils internes A–H : menus, pouvoirs, coquille portail. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const files = [
  'js/icons.js', 'js/data.js', 'js/auth.js', 'js/demo-accounts.js', 'js/portal-demo.js', 'js/demo-store.js',
  'js/router.js', 'js/ui.js', 'js/views/home.js', 'js/registration.js', 'js/views/login.js',
  'js/views/workspace.js', 'js/views/portals.js', 'js/views/portal-extras.js', 'js/views/admin.js',
  'js/views/role-pages.js', 'js/views/shared.js', 'js/cf-store.js',
  'js/gab-orient/data.js', 'js/gab-orient/charts.js', 'js/gab-orient/map.js', 'js/gab-orient/core.js',
  'js/gab-orient/views-dossiers.js', 'js/gab-orient/views-demande.js', 'js/gab-orient/views-courriers.js',
  'js/gab-orient/views-ceremonies.js', 'js/gab-orient/views-service.js', 'js/gab-orient/views-decisions.js',
  'js/gab-orient/views-regie.js', 'js/gab-orient/views-admin.js', 'js/gab-orient/bridge.js',
  'js/views/go-ui.js', 'js/views/go-pages.js', 'js/views/internal-portal.js', 'js/cf-app.js',
];

function storage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
}

const ctx = vm.createContext({
  window: {
    DN_AUTH_ENDPOINT: null,
    location: { hash: '', pathname: '/', protocol: 'http:', hostname: 'localhost' },
    localStorage: storage(),
    sessionStorage: storage(),
  },
  document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
  console,
  setTimeout,
  clearTimeout,
  Intl,
});

for (const name of files) {
  vm.runInContext(fs.readFileSync(path.join(root, name), 'utf8'), ctx, { filename: name });
}
vm.runInContext(`globalThis.H={
  ipNav, ipMay, ipContent, cfReset, cfS, cfState, cfFlagAnomaly, cfAction,
  renderWorkspace, renderAdmin, renderPortal,
  goFormState: () => window.GO.views.nouveau.state()
};`, ctx);
const H = ctx.H;

function as(email, role) {
  ctx.window.__demoEmail = email;
  H.cfState.spaceRole = role;
}

const ACCOUNTS = {
  ministre: 'demo.ministre@example.test',
  dgt: 'demo.dgt@example.test',
  dr: 'demo.dr@example.test',
  service_agent: 'demo.service.agent@example.test',
  service_inspecteur: 'demo.service.inspecteur@example.test',
  service_chef: 'demo.service.chef@example.test',
  regisseur: 'demo.regisseur@example.test',
  admin: 'demo.admin@example.test',
  secretariat_dr: 'demo.secretariat.dr@example.test',
};

function pagesOf(nav) {
  const out = [];
  for (const it of nav) {
    if (it.children) it.children.forEach((c) => out.push(c.page));
    else out.push(it.page);
  }
  return out;
}

test('ipNav gouverne aussi le demandeur et le récipiendaire', () => {
  const dem = H.ipNav('demandeur');
  const rec = H.ipNav('recipient');
  assert.ok(Array.isArray(dem) && dem.some((it) => it.page === 'overview'));
  assert.ok(dem.some((it) => it.page === 'dossiers'));
  assert.ok(Array.isArray(rec) && rec.some((it) => it.page === 'distinctions'));
});

test('chaque profil interne A–H a des menus déroulants et un accueil', () => {
  const roles = ['ministre', 'dgt', 'dr', 'service_agent', 'service_inspecteur', 'service_chef', 'regisseur', 'admin'];
  for (const role of roles) {
    const nav = H.ipNav(role);
    assert.ok(Array.isArray(nav) && nav.length >= 3, role + ' : nav trop courte');
    if (role !== 'admin') assert.ok(nav.some((it) => it.children && it.children.length >= 2) || nav.length >= 4, role + ' : navigation proto insuffisante');
    as(ACCOUNTS[role], role);
    H.cfReset();
    const html = role === 'admin' ? H.renderAdmin(role, 'overview') : H.renderWorkspace(role, 'overview');
    assert.match(html, /data-ws-content/);
    assert.match(html, /site-header/);
    assert.match(html, /sticky/);
    assert.match(html, /main-nav|id="nav-list"/);
    assert.match(html, /page-head|ws-hero/);
    assert.match(html, /<h1\b/);
    assert.match(html, /data-back-to-top/);
    assert.match(html, /nav-link|nav-caret|main-nav/);
    assert.doesNotMatch(html, /wsSidebar|portalSidebar/);
    assert.doesNotMatch(html, /MODE DÉMONSTRATION|MODE PRÉSENTATION|Données fictives à usage|Compte de démonstration/);
  }
});

test('les pages du menu interne se rendent (liste, stats, historique)', () => {
  H.cfReset();
  for (const role of Object.keys(ACCOUNTS)) {
    as(ACCOUNTS[role], role);
    const nav = H.ipNav(role);
    for (const page of pagesOf(nav)) {
      const html = role === 'admin' ? H.renderAdmin(role, page) : H.renderWorkspace(role, page);
      assert.match(html, /data-ws-content/, role + '/' + page);
      assert.match(html, /<h1\b/, role + '/' + page);
      assert.doesNotMatch(html, /<main[^>]*>\s*<\/main>/, role + '/' + page + ' vide');
    }
    assert.match(H.renderWorkspace(role === 'admin' ? 'admin' : role, 'profile'), /Mon profil|Profil/);
  }
});

test('DR approuve, Ministre/DGT orientent, inspecteur ne valide pas', () => {
  assert.equal(H.ipMay('dr', 'approve'), true);
  assert.equal(H.ipMay('ministre', 'approve'), false);
  assert.equal(H.ipMay('dgt', 'cascade'), true);
  assert.equal(H.ipMay('dr', 'cascade'), false);
  assert.equal(H.ipMay('service_inspecteur', 'rec-ok'), false);
  assert.equal(H.ipMay('service_inspecteur', 'issue-order'), false);
  assert.equal(H.ipMay('service_inspecteur', 'notify-list'), false);
  assert.equal(H.ipMay('service_agent', 'issue-order'), false);
  assert.equal(H.ipMay('service_chef', 'issue-order'), true);
  assert.equal(H.ipMay('service_chef', 'notify-list'), true);
  assert.equal(H.ipMay('regisseur', 'do-remise'), true);
  assert.equal(H.ipMay('admin', 'approve'), false);
  assert.equal(H.ipMay('admin', 'issue-order'), false);
  assert.equal(H.ipMay('service_inspecteur', 'flag-anomaly'), true);
});

test('l’inspecteur signale, il ne voit pas Valider / ordre / cérémonie', () => {
  H.cfReset();
  as(ACCOUNTS.service_inspecteur, 'service_inspecteur');
  const instr = H.renderWorkspace('service_inspecteur', 'controle');
  assert.match(instr, /Contrôles et anomalies|Contrôle/);
  assert.doesNotMatch(instr, />Valider</);
  assert.doesNotMatch(instr, /Terminer l’instruction/);
  const ctl = H.renderWorkspace('service_inspecteur', 'controle');
  assert.match(ctl, /Contrôler|Signaler|Nouveau contrôle|anomal/i);
  const denied = H.renderWorkspace('service_inspecteur', 'orders');
  assert.match(denied, /Page indisponible|Chef du Service|n’est pas proposée/);
  const nav = pagesOf(H.ipNav('service_inspecteur'));
  assert.equal(nav.includes('orders'), false);
  assert.equal(nav.includes('notify'), false);
  assert.equal(nav.includes('cer-demandes'), false);
});

test('l’agent n’a ni ordre ni cérémonie dans son menu', () => {
  as(ACCOUNTS.service_agent, 'service_agent');
  H.cfReset();
  const nav = pagesOf(H.ipNav('service_agent'));
  assert.equal(nav.includes('cer-demandes'), false);
  assert.equal(nav.includes('applicants'), false);
  assert.ok(nav.includes('instruction'));
  assert.equal(H.ipMay('service_agent', 'issue-order'), false);
  assert.doesNotMatch(H.renderWorkspace('service_agent', 'orders'), /Confirmer l’émission|data-cf-action="issue-order"/);
});

test('le chef distingue ordre et paiement, le calendrier reste ws-calendar', () => {
  H.cfReset();
  as(ACCOUNTS.service_chef, 'service_chef');
  const home = H.renderWorkspace('service_chef', 'overview');
  assert.match(home, /Distinct du paiement|ordre de recette n’est pas un paiement/);
  const pay = H.renderWorkspace('service_chef', 'orders');
  assert.match(pay, /Ordres de recette|reçus|page-head/i);
  const cal = H.renderWorkspace('service_chef', 'ceremonies');
  assert.match(cal, /Cérémonies|cal-layout|cal-head|page-head/);
});

test('le régisseur : stock, guichet, pas de double compétence d’ordre de recette', () => {
  const nav = pagesOf(H.ipNav('regisseur'));
  assert.ok(nav.includes('stock'));
  assert.ok(nav.includes('remises'));
  H.cfReset();
  as(ACCOUNTS.regisseur, 'regisseur');
  const html = H.renderWorkspace('regisseur', 'orders');
  assert.doesNotMatch(html, /Confirmer l’émission/);
});

test('les secrétariats peuvent créer un dossier, les autres profils restent protégés', () => {
  for (const role of ['secretariat_ministre', 'secretariat_dgt', 'secretariat_dr']) {
    H.cfReset();
    as(ACCOUNTS[role], role);
    const nav = pagesOf(H.ipNav(role));
    assert.ok(nav.includes('new-dossier'), role + ' : accès de création absent du menu');
    const html = H.renderWorkspace(role, 'new-dossier');
    assert.match(html, /Nouveau dossier de distinction/, role + ' : formulaire de création absent');
    H.goFormState().step = 1;
    const recipients = H.renderWorkspace(role, 'new-dossier');
    assert.match(recipients, /data-country-flag/, role + ' : champ pays absent du formulaire');
    assert.match(recipients, /aria-controls="r0-country-options"/, role + ' : liste de suggestions inaccessible');
  }
  H.cfReset();
  as(ACCOUNTS.service_inspecteur, 'service_inspecteur');
  assert.equal(pagesOf(H.ipNav('service_inspecteur')).includes('new-dossier'), false);
  assert.match(H.renderWorkspace('service_inspecteur', 'new-dossier'), /Page indisponible|Création non autorisée/);
});

test('l’admin n’a pas de file métier ni d’emplacement physique', () => {
  H.cfReset();
  as(ACCOUNTS.admin, 'admin');
  const html = H.renderAdmin('admin', 'overview');
  assert.doesNotMatch(html, /Localisation physique|wsTransmissions/);
  assert.match(html, /comptes|cachets|journaux/i);
  const denied = H.renderAdmin('admin', 'instruction');
  assert.match(denied, /pas de file métier/);
  const loc = H.renderAdmin('admin', 'localisation');
  assert.doesNotMatch(loc, /Localisation physique/);
  const nav = pagesOf(H.ipNav('admin'));
  assert.equal(nav.includes('localisation'), false);
  assert.equal(nav.includes('dossiers'), false);
});

test('un signalement inspecteur s’enregistre sans décider la médaille', () => {
  H.cfReset();
  as(ACCOUNTS.service_inspecteur, 'service_inspecteur');
  const d = H.cfS().dossiers.find((x) => (x.recipients || []).length);
  assert.ok(d);
  const recId = d.recipients[0].id;
  const before = (d.anomalies || []).length;
  const r = H.cfFlagAnomaly(d.id, recId, 'Pièce illisible');
  assert.equal(r.ok, true);
  const after = H.cfS().dossiers.find((x) => x.id === d.id);
  assert.equal((after.anomalies || []).length, before + 1);
  assert.equal((after.recipients[0].medals || [])[0].status === 'VALIDE', false);
  const page = H.renderWorkspace('service_inspecteur', 'anomalies');
  assert.match(page, /Pièce illisible|Contrôles et anomalies|Anomalie/);
  assert.match(page, /décision d’attribution n’est prise|ne valide pas une médaille|Anomalies/i);
});

test('DR : consultation structurée + emplacement visa, pas de cachet inventé', () => {
  H.cfReset();
  as(ACCOUNTS.dr, 'dr');
  const html = H.renderWorkspace('dr', 'decisions');
  assert.match(html, /Dossiers transmis et décisions|Décider|page-head/);
  assert.match(html, /Avis|Consulter|Échelons|page-head/);
  assert.doesNotMatch(html, /cachet officiel apposé|sceau de la République/);
  assert.equal(H.ipMay('dr', 'visa-doc'), true);
  assert.equal(H.ipMay('secretariat_dr', 'visa-doc'), false);
  assert.equal(H.ipMay('service_inspecteur', 'sign-doc'), false);
});

test('agent : suivi relances/recours/délégations sans statuer', () => {
  const nav = pagesOf(H.ipNav('service_agent'));
  assert.ok(nav.includes('complements'));
  H.cfReset();
  as(ACCOUNTS.service_agent, 'service_agent');
  const rel = H.renderWorkspace('service_agent', 'complements');
  assert.match(rel, /<h1\b/);
  assert.doesNotMatch(rel, /data-cf-action="relance-ok"/);
  const rec = H.renderWorkspace('service_agent', 'agent-recours');
  assert.doesNotMatch(rec, /data-cf-action="recours-ok"/);
  assert.equal(H.ipMay('service_agent', 'val-date'), false);
  assert.equal(H.ipMay('service_inspecteur', 'save-del-draft'), false);
});

test('calendrier cérémonies : aujourd’hui, statuts, schéma de lieu', () => {
  H.cfReset();
  as(ACCOUNTS.service_chef, 'service_chef');
  const cal = H.renderWorkspace('service_chef', 'ceremonies');
  assert.match(cal, /Cérémonies|cal-layout|cal-head/);
  assert.match(cal, /Calendrier|Aujourd’hui|Proposée|Confirmée/);
  assert.doesNotMatch(cal, /<img[^>]+(map|carte)/i);
});

test('secrétariat : courrier sans décision ni visa', () => {
  H.cfReset();
  as(ACCOUNTS.secretariat_dr, 'secretariat_dr');
  const html = H.renderWorkspace('secretariat_dr', 'inbox');
  assert.match(html, /Enregistrer un courrier|Registre|Transmettre/);
  assert.doesNotMatch(html, /data-cf-action="approve"/);
  assert.doesNotMatch(html, /data-cf-action="visa-doc"/);
});

test('notifications inspecteur : liste structurée et données cohérentes', () => {
  H.cfReset();
  as(ACCOUNTS.service_inspecteur, 'service_inspecteur');
  const html = H.renderWorkspace('service_inspecteur', 'notifications');
  assert.match(html, /<h1\b/);
  assert.match(html, /Notifications/);
  assert.match(html, /page-head|Non lues/);
  assert.doesNotMatch(html, /MODE DÉMONSTRATION|Données fictives/);
  const n = H.cfS().notifications.filter((x) => (x.roles || []).includes('service_inspecteur') || x.to === ACCOUNTS.service_inspecteur);
  assert.ok(n.length >= 5);
});

test('tables internes : le wrapper défile sans remplacer la mise en page native', () => {
  const css = fs.readFileSync(path.join(root, 'css/meditra.css'), 'utf8');
  const tableRule = css.match(/\.go-workspace table\.data-table,[\s\S]*?\.go-workspace \.mini-table > table\s*\{([^}]*)\}/);
  assert.ok(tableRule);
  assert.match(tableRule[1], /width:\s*100%/);
  assert.doesNotMatch(tableRule[1], /display\s*:/);
  assert.match(css, /\.go-workspace \[id\$="-table"\]:not\(table\)/);
  assert.match(css, /\.go-workspace \.table-wrap,\s*\.go-workspace \.mini-table\s*\{[^}]*overflow-x:\s*auto;[^}]*overflow-y:\s*hidden;/);
});

test('formulaire de création : la grille passe à une colonne quand l’aide est masquée', () => {
  const css = fs.readFileSync(path.join(root, 'css/meditra.css'), 'utf8');
  assert.match(css, /@media\s*\(max-width:\s*1060px\)\s*\{\s*\.go-workspace \.form-layout\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\);/);
});
