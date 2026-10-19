/* Ouvrir un dossier : tiroir, pas retour à l’accueil via un hash proto. */
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

const loc = {
  hash: '#/app/dr/dossiers', pathname: '/profil/direction/', protocol: 'http:', hostname: 'localhost',
  assigned: null,
  assign(url) { this.assigned = url; },
  replace(url) { this.assigned = url; },
};
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
  GO: window.GO, cfState, cfReset, goHydrate, currentPath, normalizePath, parseWorkspacePath, workspacePath
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

test('un lien proto #/app/<rôle>/… charge la page réelle et transmet la référence', () => {
  H.cfReset();
  H.cfState.spaceRole = 'dr';
  H.goHydrate('dr');
  ctx.window.__goLastAppHash = '#/app/dr/dossiers';
  loc.hash = '#/app/dr/dossiers';
  loc.assigned = null;

  loc.hash = '#/dossiers/DNG-2026-016';
  const capture = hashListeners.filter((l) => l.capture);
  assert.ok(capture.length, 'écouteur hashchange en capture');
  capture.forEach((l) => l.fn());

  // Plus de restitution de hash : une vraie URL est demandée au navigateur,
  // et la référence du dossier y est conservée pour être rouverte.
  assert.equal(loc.assigned, '/profil/direction/dossiers/?ref=DNG-2026-016');
  assert.equal(H.workspacePath('dr', 'dossiers'), '/profil/direction/dossiers/');
  assert.doesNotMatch(String(loc.assigned), /^#/);
});

test('GO.setHash #/dossiers demande la page réelle de la famille', () => {
  H.cfState.spaceRole = 'dr';
  H.goHydrate('dr');
  loc.hash = '#/app/dr/overview';
  loc.assigned = null;
  ctx.window.__goLastAppHash = '#/app/dr/overview';
  H.GO.setHash('#/dossiers');
  assert.equal(loc.assigned, '/profil/direction/dossiers/');
});

test('app.js monte la page multipage au lieu de repeindre toute la SPA', () => {
  const src = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
  assert.match(src, /siteMountWorkspace\(\)/);
  assert.match(src, /siteRepaintWorkspace\(\)/);
  assert.match(src, /siteKind/);
  assert.doesNotMatch(src, /root\.innerHTML\s*=\s*\(typeof skipLink/);
});

test('chaque page métier possède un fichier HTML réel et ses repères', () => {
  const families = ['demandeur', 'recipiendaire', 'secretariat', 'direction', 'service', 'regie'];
  let seen = 0;
  for (const family of families) {
    const dir = path.join(root, 'profil', family);
    assert.ok(fs.existsSync(dir), `${family} : dossier manquant`);
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = path.join(dir, entry.name, 'index.html');
      assert.ok(fs.existsSync(file), `${family}/${entry.name} : page manquante`);
      const html = fs.readFileSync(file, 'utf8');
      const familyKey = { demandeur: 'demandeur', recipiendaire: 'recipient', secretariat: 'secretariat', direction: 'direction', service: 'service', regie: 'regie' }[family];
      assert.ok(familyKey, `${family} : famille non reconnue`);
      assert.match(html, new RegExp(`data-site-family="${familyKey}"`));
      assert.match(html, new RegExp(`data-site-page="${entry.name}"`));
      assert.match(html, /id="view"/);
      seen += 1;
    }
  }
  assert.ok(seen >= 60, `${seen} pages métier générées`);
});
