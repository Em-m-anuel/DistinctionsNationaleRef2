/* Identité MEDITRA : logo branché, favicon, tokens d’accueil, reduced-motion. */
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

const ctx = vm.createContext({
  window: {
    DN_AUTH_ENDPOINT: null,
    location: { hash: '', pathname: '/', protocol: 'http:', hostname: 'localhost' },
    localStorage: storage(),
    sessionStorage: storage(),
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
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
vm.runInContext(`globalThis.E = { renderHome, renderLogin, renderWorkspace, cfReset, cfState, meditraBrand, meditraSymbolSvg };`, ctx);
const E = ctx.E;

test('les fichiers de marque MEDITRA existent (symbole, logo, favicon)', () => {
  for (const file of ['assets/brand/meditra-symbol.svg', 'assets/brand/meditra-logo.svg', 'assets/brand/meditra-favicon.svg']) {
    const svg = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(svg, /<svg/);
    assert.match(svg, /#009E60|#102A50/);
  }
});

test('index.html branche favicon, feuille meditra et titre MEDITRA', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /assets\/brand\/meditra-favicon\.svg/);
  assert.match(html, /css\/meditra\.css/);
  assert.match(html, /<title>MEDITRA/);
});

test('accueil, connexion et espace métier affichent MEDITRA', () => {
  const home = E.renderHome(null);
  assert.match(home, /MEDITRA/);
  assert.match(home, /md-brand/);
  assert.match(home, /md-symbol/);
  const login = E.renderLogin(null);
  assert.match(login, /MEDITRA/);
  assert.match(login, /md-brand/);
  assert.match(login, /Explorer la démonstration/);
  E.cfState.spaceRole = 'demandeur';
  ctx.window.__demoEmail = 'demo.entreprise@example.test';
  E.cfReset();
  const ws = E.renderWorkspace('demandeur', 'overview');
  assert.match(ws, /MEDITRA/);
  assert.match(ws, /site-header/);
  assert.doesNotMatch(ws, /portal-chrome/);
});

test('tokens d’accueil et reduced-motion sont formalisés', () => {
  const css = fs.readFileSync(path.join(root, 'css/meditra.css'), 'utf8');
  assert.match(css, /--md-ink:\s*#102a50/i);
  assert.match(css, /--md-green:\s*#009e60/i);
  assert.match(css, /--md-canvas:\s*#f8fafc/i);
  assert.match(css, /Inter/);
  assert.match(css, /Sora/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /md-view-in/);
});
