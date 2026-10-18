/* Ouvrir un dossier : tiroir, pas retour à l’accueil via un hash proto. */
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

function RO() { this.observe = function () {}; this.unobserve = function () {}; this.disconnect = function () {}; }

const loc = { hash: '#/app/dr/dossiers', pathname: '/', protocol: 'http:', hostname: 'localhost' };
const hashListeners = [];
function addEL(type, fn, opts) {
  if (type !== 'hashchange') return;
  hashListeners.push({ fn, capture: opts === true || !!(opts && opts.capture) });
}

const ctx = vm.createContext({
  window: {
    DN_AUTH_ENDPOINT: null,
    location: loc,
    history: {
      replaceState(_s, _t, url) {
        if (typeof url === 'string' && url.charAt(0) === '#') loc.hash = url;
      },
    },
    localStorage: storage(),
    sessionStorage: storage(),
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    ResizeObserver: RO,
    addEventListener: addEL,
    removeEventListener() {},
  },
  document: {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ className: '', innerHTML: '', addEventListener() {}, querySelector() { return null; } }),
    body: { appendChild(n) { return n; } },
    addEventListener() {},
  },
  console,
  setTimeout,
  clearTimeout,
  Intl,
  URLSearchParams,
  ResizeObserver: RO,
});
ctx.window.window = ctx.window;
ctx.window.document = ctx.document;
ctx.window.history = ctx.window.history;

for (const name of files) {
  vm.runInContext(fs.readFileSync(path.join(root, name), 'utf8'), ctx, { filename: name });
}
vm.runInContext(`globalThis.H = {
  GO: window.GO, cfState, cfReset, goHydrate, currentPath, normalizePath, parseWorkspacePath
};`, ctx);
const H = ctx.H;

test('la liste dossiers ouvre le tiroir sans hash proto', () => {
  const src = fs.readFileSync(path.join(root, 'js/gab-orient/views-dossiers.js'), 'utf8');
  assert.match(src, /openDossier\(ref\)/);
  assert.doesNotMatch(src, /location\.hash = '#\/dossiers\/' \+ \(btn/);
  assert.equal(typeof H.GO.openDossier, 'function');
  assert.equal(typeof H.GO.views.dossiers.open, 'function');
});

test('un hash proto #/dossiers/<ref> n’est pas une route FrontII', () => {
  assert.equal(H.normalizePath('/dossiers/DNG-2026-016'), '/');
});

test('hashchange proto restaure #/app/<rôle>/… et ouvre le dossier', () => {
  H.cfReset();
  H.cfState.spaceRole = 'dr';
  H.goHydrate('dr');
  ctx.window.__goLastAppHash = '#/app/dr/dossiers';
  loc.hash = '#/app/dr/dossiers';

  const opened = [];
  const prev = H.GO.views.dossiers.update;
  H.GO.views.dossiers.update = function (r) { opened.push(r && r.id); };
  try {
    loc.hash = '#/dossiers/DNG-2026-016';
    const capture = hashListeners.filter((l) => l.capture);
    assert.ok(capture.length, 'écouteur hashchange en capture');
    capture.forEach((l) => l.fn());
    assert.equal(loc.hash, '#/app/dr/dossiers');
    assert.equal(H.currentPath(), '/app/dr/dossiers');
    assert.deepEqual(opened, ['DNG-2026-016']);
  } finally {
    H.GO.views.dossiers.update = prev;
    loc.hash = '#/app/dr/dossiers';
  }
});

test('GO.setHash mappe #/dossiers vers la route FrontII', () => {
  H.cfState.spaceRole = 'dr';
  H.goHydrate('dr');
  loc.hash = '#/app/dr/overview';
  ctx.window.__goLastAppHash = '#/app/dr/overview';
  H.GO.setHash('#/dossiers');
  assert.equal(loc.hash, '#/app/dr/dossiers');
});

test('le workspace ne se remonte pas si rôle et page sont inchangés', () => {
  const src = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
  assert.match(src, /sameSpace/);
  assert.match(src, /data-cf-role/);
  assert.match(src, /data-cf-page/);
});
