/* Espace Demandeur : vues GAB-ORIENT, dossiers, compléments, relances, recours. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('path');
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
  renderWorkspace, cfState, cfReset, portalData, enterPresentation, leavePresentation, portalOrgKey,
  portalExtrasAction, workOverview, collectComplements, canAskRelance, canAskRecours,
  replyComplement, addDossierRelance, addDossierRecours, demoResetStore, ipNav, ipMay,
  hydrateDossierWork
};`, ctx);
const E = ctx.E;

function asDemandeur() {
  E.leavePresentation();
  E.demoResetStore();
  assert.equal(E.enterPresentation('demandeur', 'demo.entreprise@example.test'), true);
  ctx.window.__demoEmail = 'demo.entreprise@example.test';
  E.cfState.spaceRole = 'demandeur';
  E.cfReset();
}

test('ipNav gouverne le demandeur', () => {
  const nav = E.ipNav('demandeur');
  assert.ok(Array.isArray(nav));
  assert.ok(nav.some((it) => it.page === 'dossiers'));
  assert.ok(nav.some((it) => it.page === 'complements' || (it.children || []).some((c) => c.page === 'complements')));
  assert.ok(nav.some((it) => it.page === 'recours' || (it.children || []).some((c) => c.page === 'recours')));
});

test('accueil demandeur : aperçu proto, pas le portail provisoire', () => {
  asDemandeur();
  const html = E.renderWorkspace('demandeur', 'overview');
  assert.match(html, /data-go-view="apercu"/);
  assert.match(html, /Vue d’ensemble/);
  assert.match(html, /page-head/);
  assert.doesNotMatch(html, /Localisation physique/);
  assert.doesNotMatch(html, /data-portal-action="work-goto"/);
  const data = E.portalData('demandeur');
  const w = E.workOverview(data);
  assert.ok(w.complements.length >= 1);
  assert.ok(w.action.length >= 1);
});

test('liste dossiers : vue proto, pas de localisation papier', () => {
  asDemandeur();
  const html = E.renderWorkspace('demandeur', 'dossiers');
  assert.match(html, /data-go-view="dossiers"/);
  assert.match(html, /page-head/);
  assert.match(html, /data-table|id="df-table"/);
  assert.doesNotMatch(html, /Localisation physique/);
});

test('page compléments : ouvert ≠ traité, réponse persistée', () => {
  asDemandeur();
  const html = E.renderWorkspace('demandeur', 'complements');
  assert.match(html, /data-go-view="complements"/);
  const data = E.portalData('demandeur');
  const open = E.collectComplements(data).find((x) => x.complement.status === 'ouvert');
  assert.ok(open);
  const fail = E.replyComplement('enterprise', open.dossier.ref, open.complement.id, { texte: '' });
  assert.equal(fail, null);
  assert.equal(open.complement.status, 'ouvert');
  const ok = E.replyComplement('enterprise', open.dossier.ref, open.complement.id, { texte: 'Attestation jointe.' });
  assert.equal(ok.status, 'répondu');
});

test('relance et recours sont distincts et contrôlés par l’état', () => {
  asDemandeur();
  const data = E.portalData('demandeur');
  const instr = data.dossiers.find((d) => d.status === 'En instruction');
  const cpl = data.dossiers.find((d) => d.status === 'Complément demandé');
  assert.equal(E.canAskRelance(instr), true);
  assert.equal(E.canAskRecours(instr), false);
  assert.equal(E.canAskRecours(cpl), true);
  assert.equal(E.addDossierRecours('enterprise', instr.ref, 'Motif'), null);
  const rel = E.addDossierRelance('enterprise', instr.ref, 'Demande de point d’étape');
  assert.equal(rel.status, 'Envoyée');
  const rec = E.addDossierRecours('enterprise', cpl.ref, 'Contestation de la demande de pièce');
  assert.equal(rec.status, 'Envoyé');
  const relPage = E.renderWorkspace('demandeur', 'relances');
  assert.match(relPage, /data-go-view="complements"/);
  const recPage = E.renderWorkspace('demandeur', 'recours');
  assert.match(recPage, /data-go-view="recours"/);
});

test('courriers : consultation sans visa', () => {
  asDemandeur();
  const html = E.renderWorkspace('demandeur', 'documents');
  assert.match(html, /data-go-view="courriers"/);
  assert.doesNotMatch(html, /data-cf-action="visa-doc"/);
  assert.doesNotMatch(html, /Transmettre à l’autorité/);
});

test('menu Dossiers expose les vues métier de la référence', () => {
  asDemandeur();
  const nav = E.ipNav('demandeur').find((n) => n.page === 'dossiers');
  const labels = nav.children.map((c) => c.label);
  assert.ok(labels.includes('Tous les dossiers'));
  assert.ok(labels.includes('Nouveau dossier'));
  assert.ok(labels.some((l) => /Complément/.test(l)));
});

test('nouveau dossier : formulaire proto en quatre étapes', () => {
  asDemandeur();
  const html = E.renderWorkspace('demandeur', 'new-dossier');
  assert.match(html, /data-go-view="nouveau"/);
  assert.match(html, /wizard-steps/);
  assert.match(html, /Récapitulatif/);
  assert.match(html, /Demandeur/);
});
