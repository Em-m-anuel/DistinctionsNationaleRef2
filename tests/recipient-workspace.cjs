/* Espace récipiendaire : vues GAB-ORIENT, sans FCFA. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('path');
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
    setTimeout,
    clearTimeout,
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
vm.runInContext(`globalThis.E = {
  renderWorkspace, cfState, cfReset, portalData, enterPresentation, leavePresentation,
  personEligibleWithdrawals, demoResetStore, ipNav, ipMay
};`, ctx);
const E = ctx.E;

function asPerson() {
  E.leavePresentation();
  E.demoResetStore();
  assert.equal(E.enterPresentation('recipient'), true);
  ctx.window.__demoEmail = 'demo.personne@example.test';
  E.cfState.spaceRole = 'recipient';
  E.cfReset();
}

test('ipNav gouverne le récipiendaire sans lui donner des pouvoirs métier', () => {
  const nav = E.ipNav('recipient');
  assert.ok(Array.isArray(nav) && nav.some((it) => it.page === 'distinctions'));
  assert.equal(E.ipMay('recipient', 'approve'), false);
  assert.equal(E.ipMay('recipient', 'issue-order'), false);
});

test('accueil récipiendaire : aperçu proto, sans finance', () => {
  asPerson();
  const html = E.renderWorkspace('recipient', 'overview');
  assert.match(html, /data-go-view="apercu"/);
  assert.match(html, /Mes distinctions|Vue d’ensemble/);
  assert.doesNotMatch(html, /FCFA|RCCM|CNSS|Localisation physique/);
  assert.doesNotMatch(html, /Tester une notification/);
  assert.doesNotMatch(html, /ws-assistant-fab|data-assistant|cf-assistant/);
  assert.doesNotMatch(html, /Mon espace personnel/);
  const data = E.portalData('recipient');
  assert.ok((data.affiliations || []).some((a) => a.status === 'EN_ATTENTE'));
  assert.ok(E.personEligibleWithdrawals(data).length >= 1);
});

test('notifications récipiendaire : vue proto, sans bouton de simulation', () => {
  asPerson();
  const html = E.renderWorkspace('recipient', 'notifications');
  assert.match(html, /data-go-view="notifications"/);
  assert.match(html, /Notifications/);
  assert.doesNotMatch(html, /Tester une notification/);
  assert.doesNotMatch(html, /FCFA|Ordre de recette/);
});

test('parcours et retraits restent sans montant', () => {
  asPerson();
  for (const page of ['distinctions', 'dossiers', 'ceremonies', 'withdrawals', 'profile']) {
    const html = E.renderWorkspace('recipient', page);
    assert.doesNotMatch(html, /FCFA/, page);
    assert.match(html, /<h1\b/, page);
  }
});
