/* Chemin de rendu réel : app.js → renderWorkspace → vues GAB-ORIENT + goMountLive. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const files = [
  'js/site-config.js', 'js/icons.js', 'js/data.js', 'js/auth.js', 'js/demo-accounts.js', 'js/portal-demo.js', 'js/demo-store.js',
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

function RO() { this.observe = function () {}; this.unobserve = function () {}; this.disconnect = function () {}; }

const live = { html: '', listeners: 0 };
const goEl = {
  id: 'go-view',
  innerHTML: '',
  getAttribute(name) {
    if (name === 'data-go-view') return this._view || 'apercu';
    if (name === 'data-go-page') return this._page || 'overview';
    return null;
  },
  setAttribute(name, value) {
    if (name === 'data-go-view') this._view = value;
    if (name === 'data-go-page') this._page = value;
  },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  addEventListener() { live.listeners += 1; },
  classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
  appendChild() { return this; },
};

const ctx = vm.createContext({
  window: {
    DN_AUTH_ENDPOINT: null,
    location: { hash: '', pathname: '/', protocol: 'http:', hostname: 'localhost' },
    localStorage: storage(),
    sessionStorage: storage(),
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    ResizeObserver: RO,
    addEventListener() {},
  },
    document: {
    getElementById: (id) => (id === 'go-view' || id === 'view' ? goEl : null),
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => goEl,
    body: { appendChild() { return goEl; } },
  },
  console,
  setTimeout,
  clearTimeout,
  Intl,
  ResizeObserver: RO,
});

for (const name of files) {
  vm.runInContext(fs.readFileSync(path.join(root, name), 'utf8'), ctx, { filename: name });
}
vm.runInContext(`globalThis.H = {
  ipNav, ipMay, cfReset, cfS, cfState, cfVisibleDossiers,
  renderWorkspace, goHydrate, goMountLive, goHasView, goViewFor, GO: window.GO
};`, ctx);
const H = ctx.H;

function as(email, role) {
  ctx.window.__demoEmail = email;
  H.cfState.spaceRole = role;
  H.cfReset();
}

test('app.js monte les pages réelles et délègue le contenu à renderWorkspace', () => {
  const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
  assert.match(app, /siteMountWorkspace\(\)/);
  assert.match(app, /siteRepaintWorkspace\(\)/);
  assert.doesNotMatch(app, /isPortal/);
  assert.doesNotMatch(app, /renderPortal\(workspace\.role/);

  const shell = fs.readFileSync(path.join(root, 'js/site/workspace-page.js'), 'utf8');
  assert.match(shell, /cfBanner\(ctx\.role, ctx\.page/);
  assert.match(shell, /cfContent\(ctx\.role, ctx\.page/);
  assert.match(shell, /goMountLive\(/);
});

test('ipNav gouverne demandeur et récipiendaire', () => {
  const dem = H.ipNav('demandeur');
  const rec = H.ipNav('recipient');
  assert.ok(Array.isArray(dem) && dem.length >= 6);
  assert.ok(dem.some((it) => it.page === 'overview'));
  assert.ok(dem.some((it) => it.page === 'dossiers'));
  assert.ok(dem.some((it) => (it.children || []).some((c) => c.page === 'new-dossier')));
  assert.ok(Array.isArray(rec) && rec.some((it) => it.page === 'distinctions' || (it.children || []).some((c) => c.page === 'distinctions')));
  assert.ok(rec.some((it) => it.page === 'retraits' || it.page === 'withdrawals' || (it.children || []).some((c) => c.page === 'retraits' || c.page === 'withdrawals')));
});

test('accueil demandeur : vue apercu GAB-ORIENT, plus le portail provisoire', () => {
  as('demo.entreprise@example.test', 'demandeur');
  const html = H.renderWorkspace('demandeur', 'overview');
  assert.match(html, /data-go-view="apercu"/);
  assert.match(html, /id="view"/);
  assert.match(html, /page-head/);
  assert.match(html, /Vue d’ensemble/);
  assert.match(html, /kpi-strip|kpi-card/);
  assert.doesNotMatch(html, /Votre espace entreprise/);
  assert.doesNotMatch(html, /data-portal-role/);
  assert.doesNotMatch(html, /data-portal-action="work-goto"/);
  assert.doesNotMatch(html, /cf-circuit/);
  assert.doesNotMatch(html, /portal-chrome|portal-tabs|portal-hero/);
  assert.doesNotMatch(html, /cf-wizard|cf-bureau|cf-paper/);
});

test('accueil récipiendaire : vue apercu, sans finance ni portail provisoire', () => {
  as('demo.personne@example.test', 'recipient');
  const html = H.renderWorkspace('recipient', 'overview');
  assert.match(html, /data-go-view="apercu"/);
  assert.match(html, /Mes distinctions/);
  assert.doesNotMatch(html, /Mon espace personnel/);
  assert.doesNotMatch(html, /data-portal-role/);
  assert.doesNotMatch(html, /FCFA/);
  assert.doesNotMatch(html, /Tester une notification/);
});

test('pages métier demandeur / récipiendaire exposent les vues proto', () => {
  as('demo.entreprise@example.test', 'demandeur');
  const doss = H.renderWorkspace('demandeur', 'dossiers');
  assert.match(doss, /data-go-view="dossiers"/);
  assert.match(doss, /id="df-table"|data-table/);
  const cpl = H.renderWorkspace('demandeur', 'complements');
  assert.match(cpl, /data-go-view="complements"/);
  const rec = H.renderWorkspace('demandeur', 'recours');
  assert.match(rec, /data-go-view="recours"/);
  const mail = H.renderWorkspace('demandeur', 'documents');
  assert.match(mail, /data-go-view="courriers"/);
  const pay = H.renderWorkspace('demandeur', 'payments');
  assert.match(pay, /data-go-view="recettes"/);
  const wiz = H.renderWorkspace('demandeur', 'new-dossier');
  assert.match(wiz, /data-go-view="nouveau"/);
  assert.match(wiz, /wizard-steps|Récapitulatif/);
  as('demo.personne@example.test', 'recipient');
  const dist = H.renderWorkspace('recipient', 'distinctions');
  assert.match(dist, /data-go-view="distinctions"/);
  assert.match(dist, /Mes distinctions/);
  const wd = H.renderWorkspace('recipient', 'withdrawals');
  assert.match(wd, /data-go-view="retraits"/);
});

test('goMountLive repeint la vue proto dans #go-view (chemin navigateur)', () => {
  as('demo.entreprise@example.test', 'demandeur');
  H.goHydrate('demandeur');
  goEl._view = 'apercu';
  goEl._page = 'overview';
  goEl.innerHTML = '';
  live.listeners = 0;
  H.goMountLive('demandeur', 'overview');
  assert.match(goEl.innerHTML, /Vue d’ensemble/);
  assert.match(goEl.innerHTML, /page-head/);
  assert.match(goEl.innerHTML, /kpi-strip|Points d’attention/);
});

test('profils internes : overview et files restent les vues proto', () => {
  as('demo.service.agent@example.test', 'service_agent');
  const home = H.renderWorkspace('service_agent', 'overview');
  assert.match(home, /data-go-view="apercu"/);
  assert.match(home, /pipeline/);
  const instr = H.renderWorkspace('service_agent', 'instruction');
  assert.match(instr, /id="if-table"/);
  as('demo.dr@example.test', 'dr');
  const doss = H.renderWorkspace('dr', 'dossiers');
  assert.match(doss, /data-go-view="dossiers"/);
  const dec = H.renderWorkspace('dr', 'decisions');
  assert.match(dec, /data-go-view="decisions"/);
});

test('récipiendaire : visibilité limitée à ses dossiers', () => {
  as('demo.personne@example.test', 'recipient');
  const list = H.cfVisibleDossiers('recipient');
  assert.ok(list.length >= 1);
  assert.ok(list.every((d) => (d.recipients || []).some((r) => r.cni === 'CNI-ALAIN-001')));
  as('demo.entreprise@example.test', 'demandeur');
  const dem = H.cfVisibleDossiers('demandeur');
  assert.ok(dem.every((d) => d.applicantId === 'APP-SGI'));
});
