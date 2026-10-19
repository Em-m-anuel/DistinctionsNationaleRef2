/* Vues GAB-ORIENT réelles : tiroir, graphiques, permissions FrontII. */
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
const ctx = vm.createContext({
  window: {
    DN_AUTH_ENDPOINT: null,
    location: { hash: '', pathname: '/', protocol: 'http:', hostname: 'localhost' },
    localStorage: storage(),
    sessionStorage: storage(),
    ResizeObserver: RO,
  },
  document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
  console,
  setTimeout,
  clearTimeout,
  Intl,
  ResizeObserver: RO,
});

for (const name of files) {
  vm.runInContext(fs.readFileSync(path.join(root, name), 'utf8'), ctx, { filename: name });
}
vm.runInContext(`globalThis.H = { ipMay, cfReset, cfS, cfState, renderWorkspace, goHydrate, GO: window.GO, GOCharts: window.GOCharts };`, ctx);
const H = ctx.H;

test('les vues proto sont enregistrées (instruction, dossiers, courriers, stats)', () => {
  const views = H.GO.views;
  assert.equal(typeof views.instruction.render, 'function');
  assert.equal(typeof views.dossiers.render, 'function');
  assert.equal(typeof views.dossiers.update, 'function');
  assert.equal(typeof views.courriers.render, 'function');
  assert.equal(typeof views.statistiques.render, 'function');
  assert.equal(typeof views.ceremonies.render, 'function');
  assert.equal(typeof H.GO.openDrawer, 'function');
  assert.equal(typeof H.GOCharts.mount, 'function');
});

test('GO.can suit ipMay : agent sans recette, inspecteur sans instruct, DR décide', () => {
  H.cfState.spaceRole = 'service_agent';
  H.goHydrate('service_agent');
  assert.equal(H.GO.can('recette'), false);
  assert.equal(H.GO.can('instruct'), true);
  H.cfState.spaceRole = 'service_inspecteur';
  H.goHydrate('service_inspecteur');
  assert.equal(H.GO.can('instruct'), false);
  assert.equal(H.GO.can('control'), true);
  assert.equal(H.GO.can('decide'), false);
  H.cfState.spaceRole = 'dr';
  H.goHydrate('dr');
  assert.equal(H.GO.can('decide'), true);
  assert.equal(H.GO.can('create'), false);
});

test('hydratation depuis cf-store, pas depuis GO_DATA.seed', () => {
  H.cfReset();
  H.cfState.spaceRole = 'service_agent';
  H.goHydrate('service_agent');
  const refs = H.GO.S.dossiers.map((d) => d.ref);
  assert.ok(refs.includes('DNG-2026-016') || refs.includes('DNG-2026-005'));
  assert.equal((H.GO.D.seed.dossiers || []).length, 0);
});

test('instruction et courriers exposent les coques proto (file, visionneuse)', () => {
  H.cfReset();
  H.cfState.spaceRole = 'service_agent';
  const instr = H.renderWorkspace('service_agent', 'instruction');
  assert.match(instr, /id="if-table"/);
  assert.match(instr, /data-go-view="instruction"/);
  const mail = H.renderWorkspace('service_agent', 'documents');
  assert.match(mail, /doc-layout|viewer|Courriers et documents/);
});

test('GOCharts dessine un graphique SVG', () => {
  const el = {
    clientWidth: 400,
    innerHTML: '',
    classList: { toggle() {}, add() {}, remove() {} },
    querySelector() { return null; },
    querySelectorAll() { return []; },
  };
  H.GOCharts.mount(el, 'bar', { labels: ['Janv', 'Févr'], values: [2, 5], unit: 'dossiers' });
  assert.match(el.innerHTML, /<svg|ch-bar|ch-grid/);
});
