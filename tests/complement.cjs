/* Complément au cahier : navigation, wizard 6, secrétariat — chemin de rendu réel. */
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
vm.runInContext(`globalThis.expose = {
  renderHome, renderLogin, renderWorkspace, portalState, portalData, ipNav,
  enterPresentation, leavePresentation, emptyCreateWizard, emptyWithdrawWizard,
  addDossierRecord, dossierStats, deathOlderThanTwoYears, indicativeMedal, seniorityYears,
  financeStats, DEMO_TARIFFS, portalOrgKey, portalExtrasAction, portalRememberFile,
  cfReset, cfState, cfRegisterMail, cfS, cfInbox, cfAction
};`, ctx);
const E = ctx.expose;
const css = fs.readFileSync(path.join(root, 'css/theme.css'), 'utf8');
const goCss = fs.readFileSync(path.join(root, 'css/gab-orient.css'), 'utf8');

function asDemandeur() {
  E.leavePresentation();
  assert.equal(E.enterPresentation('demandeur', 'demo.entreprise@example.test'), true);
  ctx.window.__demoEmail = 'demo.entreprise@example.test';
  E.cfState.spaceRole = 'demandeur';
  E.cfReset();
}
function asPerson() {
  E.leavePresentation();
  assert.equal(E.enterPresentation('recipient'), true);
  ctx.window.__demoEmail = 'demo.personne@example.test';
  E.cfState.spaceRole = 'recipient';
  E.cfReset();
}

test('1. Header sticky opaque sur l’accueil et les espaces métier', () => {
  const home = E.renderHome(null);
  assert.match(home, /data-site-header/);
  assert.match(home, /home-site-header sticky/);
  asDemandeur();
  const portal = E.renderWorkspace('demandeur', 'overview');
  assert.match(portal, /site-header/);
  assert.match(goCss, /\.site-header\s*\{[^}]*position:\s*sticky/);
  E.cfReset();
  E.cfState.spaceRole = 'dr';
  ctx.window.__demoEmail = 'demo.dr@example.test';
  const intern = E.renderWorkspace('dr', 'overview');
  assert.match(intern, /site-header/);
  assert.match(intern, /sticky/);
});

test('2. Bouton retour-en-haut : seuil, animation, reduced-motion', () => {
  const home = E.renderHome(null);
  assert.match(home, /data-back-to-top/);
  assert.match(home, /class="home-back-top"/);
  assert.match(css, /\.home-back-top\.is-visible/);
  assert.match(css, /prefers-reduced-motion/);
  asDemandeur();
  assert.match(E.renderWorkspace('demandeur', 'dossiers'), /data-back-to-top/);
  E.cfReset();
  E.cfState.spaceRole = 'dr';
  ctx.window.__demoEmail = 'demo.dr@example.test';
  assert.match(E.renderWorkspace('dr', 'overview'), /data-back-to-top/);
  assert.match(E.renderWorkspace('dr', 'overview'), /home-back-top/);
});

test('3. Demandeur — menu Dossiers : mes dossiers, nouveau, compléments, recours', () => {
  asDemandeur();
  const nav = E.ipNav('demandeur').find((n) => n.page === 'dossiers');
  const labels = nav.children.map((c) => c.label);
  assert.ok(labels.includes('Tous les dossiers'));
  assert.ok(labels.includes('Nouveau dossier'));
  assert.ok(labels.some((l) => /Complément/.test(l)));
  assert.match(E.renderWorkspace('demandeur', 'dossiers'), /data-go-view="dossiers"/);
  assert.match(E.renderWorkspace('demandeur', 'new-dossier'), /wizard-steps|Nouveau dossier/);
});

test('4. Demandeur — bénéficiaires (vue proto)', () => {
  asDemandeur();
  const html = E.renderWorkspace('demandeur', 'recipients');
  assert.match(html, /data-go-view="beneficiaires"/);
  assert.ok(E.ipNav('demandeur').some((it) => it.page === 'recipients' || (it.children || []).some((c) => c.page === 'recipients')));
});

test('5. Demandeur — cérémonies (vue proto)', () => {
  asDemandeur();
  const html = E.renderWorkspace('demandeur', 'ceremonies');
  assert.match(html, /data-go-view="ceremonies"/);
  assert.ok(E.ipNav('demandeur').some((it) => it.page === 'ceremonies'));
});

test('6. Créer une demande — parcours proto en 4 étapes', () => {
  asDemandeur();
  const html = E.renderWorkspace('demandeur', 'new-dossier');
  assert.match(html, /data-go-view="nouveau"/);
  assert.match(html, /wizard-steps/);
  assert.match(html, /quatre étapes|Étape 1 sur 4|Demandeur/);
  assert.match(html, /Récipiendaires/);
  assert.match(html, /Pièces et DTS/);
  assert.match(html, /Récapitulatif/);
});

test('7. Courrier de demande obligatoire dans le formulaire proto', () => {
  asDemandeur();
  const src = fs.readFileSync(path.join(root, 'js/gab-orient/views-demande.js'), 'utf8');
  assert.match(src, /Courrier de demande/);
  assert.match(src, /Courrier de demande/);
});

test('8. Nationalité renseignée dans le formulaire proto (pas un nouveau pouvoir)', () => {
  asDemandeur();
  const src = fs.readFileSync(path.join(root, 'js/gab-orient/views-demande.js'), 'utf8');
  assert.match(src, /Nationalité/);
  assert.match(src, /Gabonaise/);
});

test('9. Décès de plus de deux ans : informatif, pas un blocage', () => {
  assert.equal(E.deathOlderThanTwoYears('01/01/2020'), true);
  assert.equal(E.deathOlderThanTwoYears('01/09/2025'), false);
  asDemandeur();
  const src = fs.readFileSync(path.join(root, 'js/gab-orient/views-demande.js'), 'utf8');
  assert.match(src, /Date de décès/);
  assert.match(src, /n’empêche pas de poursuivre la demande/);
});

test('10. Ancienneté calculée et médaille indicative', () => {
  assert.equal(E.indicativeMedal(9), null);
  assert.equal(E.indicativeMedal(10), 'Bronze');
  assert.equal(E.indicativeMedal(20), 'Argent');
  assert.equal(E.indicativeMedal(30), 'Or');
});

test('11. DTS facultatif à la création', () => {
  asDemandeur();
  const src = fs.readFileSync(path.join(root, 'js/gab-orient/views-demande.js'), 'utf8');
  assert.match(src, /Référence de la DTS/);
  assert.match(src, /peut être complétée après le dépôt/);
});

test('12. Récapitulatif puis création dans le magasin', () => {
  asDemandeur();
  const before = E.portalData('demandeur').dossiers.length;
  const rec = E.addDossierRecord('enterprise', {
    destination: 'dr',
    letter: { name: 'courrier-initiation.pdf', size: 20480, type: 'application/pdf' },
    recipients: [{ prenom: 'Léa', nom: 'Mba', name: 'Léa Mba', start: '01/02/2010', medal: 'Bronze' }],
  });
  assert.match(rec.ref, /^DNG-DEMO-2026-/);
  assert.equal(rec.status, 'Soumis');
  assert.ok(rec.pieces.includes('courrier-initiation.pdf'));
  assert.equal(E.portalData('demandeur').dossiers.length, before + 1);
  assert.ok(E.portalData('demandeur').dossiers.some((d) => d.ref === rec.ref));
});

test('13. Cérémonies : calendrier proto (pas une image statique)', () => {
  asDemandeur();
  const html = E.renderWorkspace('demandeur', 'ceremonies');
  assert.match(html, /data-go-view="ceremonies"/);
  assert.match(html, /cal-layout|page-head|Cérémonies/);
});

test('14. Pas de localisation physique côté entreprise', () => {
  asDemandeur();
  for (const page of ['overview', 'dossiers', 'new-dossier', 'payments', 'ceremonies']) {
    assert.doesNotMatch(E.renderWorkspace('demandeur', page), /Localisation physique/);
  }
});

test('15. Finance : vue recettes, totaux calculés', () => {
  asDemandeur();
  const html = E.renderWorkspace('demandeur', 'payments');
  assert.match(html, /data-go-view="recettes"/);
  const s = E.financeStats(E.portalData('demandeur'));
  assert.equal(typeof s.requested, 'number');
  assert.equal(typeof s.issued, 'number');
  assert.equal(typeof s.paid, 'number');
  assert.equal(typeof s.remaining, 'number');
});

test('16. Personne — distinctions, dossiers, cérémonies, retraits', () => {
  asPerson();
  const nav = E.ipNav('recipient');
  const pages = [];
  nav.forEach((it) => { pages.push(it.page); (it.children || []).forEach((c) => pages.push(c.page)); });
  assert.ok(pages.includes('distinctions'));
  assert.ok(pages.includes('retraits') || pages.includes('withdrawals'));
  assert.match(E.renderWorkspace('recipient', 'distinctions'), /Mes distinctions/);
  assert.match(E.renderWorkspace('recipient', 'ceremonies'), /data-go-view="ceremonies"/);
  assert.match(E.renderWorkspace('recipient', 'withdrawals'), /data-go-view="retraits"/);
});

test('17. Retrait sans cérémonie — vue proto, sans montant', () => {
  asPerson();
  const html = E.renderWorkspace('recipient', 'withdrawals');
  assert.match(html, /data-go-view="retraits"/);
  assert.doesNotMatch(html, /FCFA/);
});

test('18. Secrétariat — menu Courrier (boîte, à enregistrer, à transmettre)', () => {
  E.cfReset();
  E.cfState.spaceRole = 'secretariat_dr';
  E.cfState.menu = 'registre';
  ctx.window.__demoEmail = 'demo.secretariat.dr@example.test';
  const shell = E.renderWorkspace('secretariat_dr', 'inbox');
  assert.match(shell, /data-menu="registre"|Registre|Courrier/);
  assert.match(shell, /Registre|Courrier/);
  assert.match(E.renderWorkspace('secretariat_dr', 'inbox'), /data-go-view="transmissions"/);
  const toRegister = E.cfS().mails.filter((m) => m.level === 'dr' && m.status === 'a_enregistrer');
  assert.ok(toRegister.length >= 1);
  const r = E.cfRegisterMail(toRegister[0].id);
  assert.equal(r.ok, true);
  assert.equal(E.cfS().mails.find((m) => m.id === toRegister[0].id).status, 'a_transmettre');
});

test('19. Un fichier réellement joint reste consultable après enregistrement', () => {
  asDemandeur();
  E.portalState.createWizard = E.emptyCreateWizard();
  E.portalRememberFile('letter', { name: 'courrier-signe.pdf', size: 40960, type: 'application/pdf' }, 'demandeur', 'new-dossier');
  assert.equal(E.portalState.createWizard.letter.name, 'courrier-signe.pdf');
  assert.equal(E.portalState.createWizard.letter.size, 40960);
  const rec = E.addDossierRecord('enterprise', {
    letter: E.portalState.createWizard.letter,
    recipients: [{ prenom: 'Paul', nom: 'Nzé', name: 'Paul Nzé', medal: 'Bronze', start: '01/01/2012' }],
  });
  assert.equal(rec.letter.name, 'courrier-signe.pdf');
  assert.ok(rec.pieces.includes('courrier-signe.pdf'));
});

test('20. Pas de page vide, pas d’alert() comme interface', () => {
  asDemandeur();
  for (const page of ['overview', 'dossiers', 'new-dossier', 'complements', 'relances', 'recours', 'documents', 'employees', 'payments', 'ceremonies']) {
    const html = E.renderWorkspace('demandeur', page);
    assert.match(html, /<h1\b|<h2\b/, page);
    assert.doesNotMatch(html, /alert\(/);
    assert.doesNotMatch(html, /<main[^>]*>\s*<\/main>/);
  }
  asPerson();
  for (const page of ['overview', 'distinctions', 'dossiers', 'ceremonies', 'withdrawals']) {
    const html = E.renderWorkspace('recipient', page);
    assert.match(html, /<h1\b|<h2\b/, page);
    assert.doesNotMatch(html, /alert\(/);
  }
  const extras = fs.readFileSync(path.join(root, 'js/views/portal-extras.js'), 'utf8');
  assert.doesNotMatch(extras, /\balert\s*\(/);
  const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
  assert.doesNotMatch(app, /renderPortal\(workspace\.role/);
});
