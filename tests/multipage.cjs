/* Site multipage : une URL réelle par page métier, liens normaux,
   navigation et rechargement possibles, accès contrôlé par famille. */
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
  'js/site/routes.js',
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
    location: { hash: '#/', pathname: '/', protocol: 'http:', hostname: 'localhost', search: '', assign() {}, replace() {} },
    localStorage: storage(),
    sessionStorage: storage(),
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    ResizeObserver: RO,
    addEventListener() {},
    removeEventListener() {},
  },
  document: {
    body: { dataset: {}, classList: { add() {}, remove() {} }, appendChild(n) { return n; } },
    documentElement: { classList: { add() {}, remove() {} } },
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ className: '', innerHTML: '', style: {}, addEventListener() {}, appendChild() {}, querySelector() { return null; } }),
    addEventListener() {},
  },
  console,
  setTimeout,
  clearTimeout,
  Intl,
  URLSearchParams,
  ResizeObserver: RO,
});

for (const name of files) {
  vm.runInContext(fs.readFileSync(path.join(root, name), 'utf8'), ctx, { filename: name });
}
vm.runInContext(`globalThis.SITE = {
  SITE_FAMILIES, siteAllRoutes, sitePagePath, siteCanonicalPage, parseWorkspacePath,
  workspacePath, sitePageAllowed, siteAfterLoginUrl, siteLoginUrl, goHydrate, cfReset
};`, ctx);
const S = ctx.SITE;

const fileFor = (url) => {
  const clean = url.split('?')[0];
  return path.join(root, clean.endsWith('/') ? clean + 'index.html' : clean);
};

test('chaque route déclarée correspond à un fichier HTML réel', () => {
  const routes = S.siteAllRoutes();
  assert.ok(routes.length >= 70, `${routes.length} routes`);
  for (const route of routes) {
    assert.ok(fs.existsSync(fileFor(route.path)), `${route.path} : fichier manquant`);
  }
});

test('chaque page est un document autonome avec sa famille et sa page', () => {
  const routes = S.siteAllRoutes();
  const titles = new Set();
  for (const route of routes) {
    const html = fs.readFileSync(fileFor(route.path), 'utf8');
    assert.match(html, /data-site-kind="workspace"/);
    assert.match(html, new RegExp(`data-site-family="${route.family}"`));
    assert.match(html, new RegExp(`data-site-page="${route.page}"`));
    assert.match(html, /id="view"/);
    assert.match(html, /id="nav-list"/);
    assert.match(html, /<footer/);
    assert.match(html, /mp-skip/);
    assert.doesNotMatch(html, /href="#"/);
    assert.doesNotMatch(html, /href="#\/(app|login|register|dossiers)/);
    const title = /<title>([^<]+)<\/title>/.exec(html);
    assert.ok(title, `${route.path} : titre manquant`);
    assert.ok(!titles.has(title[1]), `${route.path} : titre dupliqué « ${title[1]} »`);
    titles.add(title[1]);
    for (const href of [...html.matchAll(/href="(\/profil\/[^"]+|\/administration\/[^"]+)"/g)].map((m) => m[1])) {
      assert.ok(fs.existsSync(fileFor(href)), `${route.path} → lien mort ${href}`);
    }
  }
});

test('chaque URL se relit en famille et en page', () => {
  for (const route of S.siteAllRoutes()) {
    const parsed = S.parseWorkspacePath(route.path);
    assert.ok(parsed, `${route.path} n'est pas reconnue`);
    assert.equal(parsed.family, route.family);
    assert.equal(parsed.page, route.page);
    assert.equal(S.sitePagePath(route.family, route.page), route.path);
  }
});

test('l’accès reste borné à la famille et aux permissions de la page', () => {
  S.goHydrate('demandeur');
  S.cfReset();
  assert.equal(S.sitePageAllowed('demandeur', 'overview'), true);
  assert.equal(S.sitePageAllowed('demandeur', 'new-dossier'), true);
  assert.equal(S.sitePageAllowed('demandeur', 'stock'), false);
  assert.equal(S.sitePageAllowed('recipient', 'distinctions'), true);
  assert.equal(S.sitePageAllowed('recipient', 'decisions'), false);
  assert.equal(S.sitePageAllowed('service_agent', 'instruction'), true);
  assert.equal(S.sitePageAllowed('service_agent', 'supervision'), false);
  assert.equal(S.sitePageAllowed('service_agent', 'new-dossier'), false);
  assert.equal(S.sitePageAllowed('service_chef', 'supervision'), true);
  assert.equal(S.sitePageAllowed('dr', 'decisions'), true);
  assert.equal(S.sitePageAllowed('regisseur', 'stock'), true);
  assert.equal(S.sitePageAllowed('admin', 'users'), true);
  assert.equal(S.sitePageAllowed('admin', 'dossiers'), false);
});

test('la redirection après connexion ne sort jamais de la famille du rôle', () => {
  assert.equal(S.siteAfterLoginUrl('dr', '/profil/direction/dossiers/'), '/profil/direction/dossiers/');
  assert.equal(S.siteAfterLoginUrl('dr', '/profil/service/dossiers/'), '/profil/direction/');
  assert.equal(S.siteAfterLoginUrl('demandeur', '/profil/demandeur/payments/'), '/profil/demandeur/payments/');
  assert.equal(S.siteAfterLoginUrl('demandeur', 'https://exemple.test/'), '/profil/demandeur/');
  assert.match(S.siteLoginUrl('/profil/direction/dossiers/'), /^\/connexion\/\?next=%2Fprofil%2Fdirection%2Fdossiers%2F$/);
});
