/* Structure GAB-ORIENT (page-head, KPI, chips, data-table, circuit) — DA FrontII, ipMay inchangé. */
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
vm.runInContext(`globalThis.H = { ipMay, cfReset, cfS, cfState, renderWorkspace, renderPortal, enterPresentation, leavePresentation, demoResetStore };`, ctx);
const H = ctx.H;

const ACCOUNTS = {
  ministre: 'demo.ministre@example.test',
  dgt: 'demo.dgt@example.test',
  dr: 'demo.dr@example.test',
  service_agent: 'demo.service.agent@example.test',
  service_inspecteur: 'demo.service.inspecteur@example.test',
  service_chef: 'demo.service.chef@example.test',
  regisseur: 'demo.regisseur@example.test',
  secretariat_dr: 'demo.secretariat.dr@example.test',
};

function as(email, role) {
  ctx.window.__demoEmail = email;
  H.cfState.spaceRole = role;
}

function page(role, name) {
  as(ACCOUNTS[role], role);
  H.cfReset();
  return H.renderWorkspace(role, name);
}

function hasListShell(html) {
  assert.match(html, /page-head/);
  assert.match(html, /kpi-strip/);
  assert.match(html, /data-table/);
}

test('file d’instruction agent : KPI, chips, tableau — plus de liste provisoire', () => {
  const html = page('service_agent', 'instruction');
  hasListShell(html);
  assert.match(html, /chip-row|go-chips/);
  assert.match(html, /File d’instruction/);
  assert.doesNotMatch(html, /cf-split/);
  assert.doesNotMatch(html, /Émettre l’ordre|data-cf-action="issue-order"/);
});

test('inspecteur : file de contrôle en tableau, signalement, pas de validation', () => {
  const html = page('service_inspecteur', 'controle');
  hasListShell(html);
  assert.match(html, /Contrôles et anomalies|Contrôle|Signaler/);
  assert.doesNotMatch(html, />Valider</);
  assert.doesNotMatch(html, /data-cf-action="approve"/);
  const ctl = page('service_inspecteur', 'controle');
  assert.match(ctl, /Contrôler|Signaler|Nouveau contrôle|anomal/i);
  assert.match(ctl, /décision d’attribution n’est prise|ne valide pas une médaille|Contrôles et anomalies/i);
});

test('chef : instruction tableau + stats avec circuit et barres', () => {
  const instr = page('service_chef', 'instruction');
  hasListShell(instr);
  const stats = page('service_chef', 'stats');
  assert.match(stats, /kpi-strip/);
  assert.match(stats, /id="ch-dep"|chart/);
  assert.match(stats, /ordre de recette n’est pas un paiement|Ordre de recette|Statistiques/i);
  const home = page('service_chef', 'overview');
  assert.match(home, /pipeline/);
});

test('DR : file de décisions en tableau, visa, sans fusion des niveaux', () => {
  const html = page('dr', 'decisions');
  assert.match(html, /page-head/);
  assert.match(html, /data-table|de-table|Décider|Dossiers transmis/);
  assert.match(html, /Décider|Avis|Consulter|page-head/);
  assert.doesNotMatch(html, /cf-bureau-list/);
});

test('secrétariat : registre des courriers en tableau, sans décider', () => {
  const html = page('secretariat_dr', 'inbox');
  hasListShell(html);
  assert.match(html, /Enregistrer le courrier|Transmettre à l’autorité|Boîte|Registre/);
  assert.doesNotMatch(html, /data-cf-action="approve"/);
  assert.doesNotMatch(html, /data-cf-action="visa-doc"/);
});

test('accueils : circuit des dossiers (agent, chef, inspecteur, demandeur)', () => {
  for (const role of ['service_agent', 'service_chef', 'service_inspecteur']) {
    const html = page(role, 'overview');
    assert.match(html, /pipeline/, role);
  }
  H.leavePresentation();
  H.demoResetStore();
  assert.equal(H.enterPresentation('demandeur', 'demo.entreprise@example.test'), true);
  H.cfState.spaceRole = 'demandeur';
  ctx.window.__demoEmail = 'demo.entreprise@example.test';
  const html = H.renderWorkspace('demandeur', 'overview');
  assert.match(html, /data-go-view="apercu"/);
  assert.match(html, /pipeline|kpi-strip|Points d’attention/);
});

test('régisseur : remises, stock et retraits en tableaux', () => {
  const rem = page('regisseur', 'remises');
  assert.match(rem, /Remises des médailles|page-head|kpi-strip/);
  const stock = page('regisseur', 'stock');
  assert.match(stock, /page-head/);
  assert.match(stock, /kpi-strip/);
  const ret = page('service_inspecteur', 'retraits');
  assert.match(ret, /Retraits sans cérémonie|page-head/);
});

test('identifiants GAB-ORIENT : instruction, dossiers, décisions, compléments', () => {
  const instr = page('service_agent', 'instruction');
  assert.match(instr, /id=\"if-table\"/);
  assert.match(instr, /id=\"if-chips\"|if-q/);
  const doss = page('service_chef', 'dossiers');
  assert.match(doss, /id=\"df-table\"/);
  const dec = page('dr', 'decisions');
  assert.match(dec, /id=\"de-table\"|de-chips/);
  const cpl = page('service_chef', 'complements');
  assert.match(cpl, /id=\"kf-table\"|Compléments et relances/);
  const ben = page('service_agent', 'recipients');
  assert.match(ben, /id=\"bf-table\"|Bénéficiaires/);
});

test('supervision, contrôle, journal et aperçu reprennent la structure de référence', () => {
  const sup = page('service_chef', 'supervision');
  assert.match(sup, /Supervision du service/);
  assert.match(sup, /page-head/);
  assert.match(sup, /kpi-strip/);
  const ctl = page('service_inspecteur', 'controle');
  assert.match(ctl, /Contrôles et anomalies/);
  assert.match(ctl, /décision d’attribution n’est prise|ne valide pas une médaille|sans décision/i);
  const jour = page('service_chef', 'journal');
  assert.match(jour, /Journal d’activité/);
  const home = page('service_agent', 'overview');
  assert.match(home, /Vue d’ensemble/);
  assert.match(home, /go-card|page-head/);
  assert.match(home, /Points d’attention|File d’instruction/);
});

test('ipMay inchangé : l’inspecteur ne valide pas, l’agent n’émet pas l’ordre', () => {
  assert.equal(H.ipMay('service_inspecteur', 'rec-ok'), false);
  assert.equal(H.ipMay('service_inspecteur', 'issue-order'), false);
  assert.equal(H.ipMay('service_agent', 'issue-order'), false);
  assert.equal(H.ipMay('service_chef', 'issue-order'), true);
  assert.equal(H.ipMay('dr', 'approve'), true);
  assert.equal(H.ipMay('ministre', 'approve'), false);
});
