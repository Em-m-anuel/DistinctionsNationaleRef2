/* Accueils internes : file / activité cliquable, sans nouveaux pouvoirs. */
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
vm.runInContext(`globalThis.H = {
  ipNav, ipMay, ipContent, cfReset, cfS, cfState, renderWorkspace, renderAdmin
};`, ctx);
const H = ctx.H;

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

function as(email, role) {
  ctx.window.__demoEmail = email;
  H.cfState.spaceRole = role;
}

function home(role) {
  as(ACCOUNTS[role], role);
  H.cfReset();
  return role === 'admin' ? H.renderAdmin(role, 'overview') : H.renderWorkspace(role, 'overview');
}

test('aucun profil interne n’affiche la bulle d’assistant', () => {
  for (const role of Object.keys(ACCOUNTS)) {
    const html = home(role);
    assert.doesNotMatch(html, /ws-assistant-fab|data-assistant|cf-assistant/, role);
    assert.doesNotMatch(html, /aria-label="Assistant"/, role);
  }
});

test('autorités : accueil avec file des plus anciens, sans fusion des niveaux', () => {
  for (const role of ['ministre', 'dgt', 'dr']) {
    const html = home(role);
    assert.match(html, /Vue d’ensemble|pipeline|Points d’attention/, role);
    assert.match(html, /page-head|ws-hero/, role);
    assert.doesNotMatch(html, /MODE DÉMONSTRATION/, role);
  }
  const dr = home('dr');
  assert.match(dr, /À décider|Dossiers transmis|pipeline/);
  const min = home('ministre');
  assert.match(min, /Ministre|pipeline|Points d’attention/);
});

test('secrétariat : volumes et files à enregistrer / transmettre', () => {
  const html = home('secretariat_dr');
  assert.match(html, /À enregistrer|Registre|pipeline|Vue d’ensemble/);
  assert.doesNotMatch(html, />Approuver</);
  const inbox = H.renderWorkspace('secretariat_dr', 'inbox');
  assert.match(inbox, /Registre|Enregistrer un courrier|tr-table|page-head/);
});

test('agent : file d’instruction, sans ordre ni cérémonie', () => {
  const html = home('service_agent');
  assert.match(html, /Vue d’ensemble|pipeline|Points d’attention|Instruction des dossiers/);
  assert.doesNotMatch(html, />Émettre l’ordre</);
  assert.doesNotMatch(html, /data-cf-action="issue-order"/);
  assert.equal(H.ipMay('service_agent', 'issue-order'), false);
});

test('inspecteur : contrôles sans Valider / ordre / finance', () => {
  const html = home('service_inspecteur');
  assert.match(html, /Contrôle des dossiers|pipeline|Points d’attention|Vue d’ensemble/);
  assert.match(html, /ne valide pas une médaille/);
  assert.doesNotMatch(html, />Valider</);
  assert.doesNotMatch(html, />Notifier le demandeur</);
  assert.doesNotMatch(html, /Émettre l’ordre/);
  assert.equal(H.ipMay('service_inspecteur', 'rec-ok'), false);
});

test('chef : ordre distinct du paiement, files à notifier', () => {
  const html = home('service_chef');
  assert.match(html, /ordre de recette n’est pas un paiement|pipeline|Vue d’ensemble/i);
  assert.doesNotMatch(html, /data-cf-action="issue-order"/);
  assert.equal(H.ipMay('service_chef', 'issue-order'), true);
});

test('régisseur : stock, guichet et mouvements — pas d’ordre Chef', () => {
  const html = home('regisseur');
  assert.match(html, /Régie des médailles|pipeline|Vue d’ensemble|Stock/);
  assert.doesNotMatch(html, /Confirmer l’émission/);
  assert.equal(H.ipMay('regisseur', 'issue-order'), false);
  assert.equal(H.ipMay('regisseur', 'do-remise'), true);
});

test('admin : comptes et journaux, pas de file métier', () => {
  const html = home('admin');
  assert.match(html, /Administration|Comptes|journal|Vue d’ensemble/i);
  assert.doesNotMatch(html, />Approuver</);
  assert.doesNotMatch(html, />Émettre l’ordre</);
  const denied = H.renderAdmin('admin', 'instruction');
  assert.match(denied, /pas de file métier/i);
  assert.equal(H.ipMay('admin', 'approve'), false);
});
