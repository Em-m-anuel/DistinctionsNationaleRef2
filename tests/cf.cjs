/* Cahier fonctionnel : magasin partagé, écrans et parcours A–I. */
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
vm.runInContext(`globalThis.cfExpose={
  cfReset, cfS, cfDeposit, cfTransmit, cfApprove, cfReject, cfStartStudy, cfDecideRecipient,
  cfAskComplement, cfAnswerComplement, cfNotifyList, cfAcceptList, cfIssueOrder, cfUploadQuittance,
  cfVerifyQuittance, cfRemise, cfAskCeremony, cfValidateCeremonyRequest, cfNegotiate, cfValidateDate,
  cfPresence, cfFileRelance, cfDecideRelance, cfSubmitWithdrawal, cfDecideWithdrawal, cfInbox, cfAuthQueue,
  cfVisibleDossiers, cfFindDossier, cfCanOpenDoc, renderWorkspace, renderAdmin, cfState, CF_FRISE, CF_CURRENCY
};`, ctx);
const E = ctx.cfExpose;

function as(email, role) {
  ctx.window.__demoEmail = email;
  E.cfState.spaceRole = role;
}

test('le magasin contient une campagne 2026, une 2025 et un dossier par statut', () => {
  E.cfReset();
  const s = E.cfS();
  assert.ok(s.campaigns.some((c) => c.year === '2026' && c.status === 'en cours'));
  assert.ok(s.campaigns.some((c) => c.year === '2025' && c.status === 'cloturee'));
  assert.ok(s.applicants.filter((a) => a.estReconnu && a.type === 'entreprise').length >= 2);
  assert.ok(s.applicants.some((a) => a.type === 'ministere'));
  assert.ok(s.applicants.some((a) => !a.estReconnu));
  const statuses = new Set(s.dossiers.map((d) => d.status));
  for (const st of E.CF_FRISE.concat(['REJETE'])) assert.ok(statuses.has(st), 'statut manquant ' + st);
  assert.ok(s.dossiers.length >= 15);
  assert.equal(s.currency, 'FCFA');
});

test('un dépôt apparaît à la boîte du secrétariat (étapes 1–3)', () => {
  E.cfReset();
  as('demo.entreprise@example.test', 'demandeur');
  const r = E.cfDeposit({
    destination: 'ministre',
    recipients: [{ cni: 'CNI-NEW-01', nom: 'Test', prenom: 'Léa', poste: 'Cadre', start: '01/02/2010', metals: ['Bronze'] }],
    pieces: ['Courrier d’initiation', 'DTS'],
  });
  assert.equal(r.ok, true);
  assert.match(r.dossier.ref, /^DNG-2026-/);
  assert.equal(r.dossier.status, 'SOUMIS');
  as('demo.secretariat.ministre@example.test', 'secretariat_ministre');
  const box = E.cfInbox('secretariat_ministre');
  assert.ok(box.some((m) => m.dossierId === r.dossier.id), 'le secrétariat ne voit pas le dépôt');
  const mail = box.find((m) => m.dossierId === r.dossier.id);
  const tx = E.cfTransmit(mail.id);
  assert.equal(tx.ok, true);
  as('demo.dr@example.test', 'dr');
  const q = E.cfAuthQueue('dr', 'dossier');
  assert.ok(q.some((x) => x.dossier.id === r.dossier.id), 'le Directeur régional ne voit pas le dossier transmis');
});

test('parcours A–I : décision, instruction, paiement, remise, cérémonie, retrait', () => {
  E.cfReset();
  as('demo.entreprise@example.test', 'demandeur');
  const dep = E.cfDeposit({
    destination: 'dr',
    recipients: [{ cni: 'CNI-NEW-02', nom: 'Okoumba', prenom: 'Marc', poste: 'Agent', start: '01/03/2000', metals: ['Or'] }],
  });
  as('demo.secretariat.dr@example.test', 'secretariat_dr');
  const mail = E.cfInbox('secretariat_dr').find((m) => m.dossierId === dep.dossier.id);
  E.cfTransmit(mail.id);
  as('demo.dr@example.test', 'dr');
  assert.equal(E.cfApprove(dep.dossier.id).ok, true);
  assert.equal(E.cfFindDossier(dep.dossier.id).status, 'APPROUVE');
  as('demo.service.agent@example.test', 'service_agent');
  assert.equal(E.cfStartStudy(dep.dossier.id).ok, true);
  const recId = E.cfFindDossier(dep.dossier.id).recipients[0].id;
  E.cfDecideRecipient(dep.dossier.id, recId, 'VALIDE');
  assert.equal(E.cfNotifyList(dep.dossier.id).ok, true);
  as('demo.entreprise@example.test', 'demandeur');
  assert.equal(E.cfAcceptList(dep.dossier.id).ok, true);
  assert.equal(E.cfFindDossier(dep.dossier.id).status, 'VALIDE');
  as('demo.service.chef@example.test', 'service_chef');
  assert.equal(E.cfIssueOrder(dep.dossier.id).ok, true);
  as('demo.entreprise@example.test', 'demandeur');
  const d0 = E.cfFindDossier(dep.dossier.id);
  E.cfUploadQuittance(dep.dossier.id, { numero: 'QUI-X', montant: d0.order.amount, date: '14/10/2026' });
  as('demo.regisseur@example.test', 'regisseur');
  assert.equal(E.cfVerifyQuittance(dep.dossier.id, true).ok, true);
  assert.equal(E.cfFindDossier(dep.dossier.id).status, 'PAYE');
  const rem = E.cfRemise(dep.dossier.id, { retirant: 'Léa Mba', qualite: 'Représentant du demandeur', piece: 'CNI-R', metals: ['Or'] });
  assert.equal(rem.ok, true);
  assert.equal(E.cfFindDossier(dep.dossier.id).status, 'MEDAILLES_REMISES');
  as('demo.entreprise@example.test', 'demandeur');
  assert.equal(E.cfAskCeremony(dep.dossier.id, { autorite: 'dr', date: '20/11/2026', lieu: 'Libreville' }).ok, true);
  as('demo.secretariat.dr@example.test', 'secretariat_dr');
  const cerMail = E.cfInbox('secretariat_dr').find((m) => m.dossierId === dep.dossier.id && m.type === 'ceremonie');
  E.cfTransmit(cerMail.id);
  as('demo.dr@example.test', 'dr');
  E.cfValidateCeremonyRequest(dep.dossier.id);
  as('demo.service.chef@example.test', 'service_chef');
  E.cfNegotiate(dep.dossier.id, '20/11/2026', 'Libreville', false);
  as('demo.entreprise@example.test', 'demandeur');
  E.cfNegotiate(dep.dossier.id, '', '', true);
  assert.equal(E.cfFindDossier(dep.dossier.id).status, 'CEREMONIE_PLANIFIEE');
  as('demo.service.agent@example.test', 'service_agent');
  E.cfPresence(dep.dossier.id, recId, true);
  assert.equal(E.cfFindDossier(dep.dossier.id).status, 'CLOTURE');
  const wd = E.cfSubmitWithdrawal({ cni: 'CNI-NEW-02', nom: 'Okoumba', prenom: 'Marc', structure: 'SGI', campaign: '2026', retirantNom: 'Okoumba', retirantPrenom: 'Marc' });
  as('demo.regisseur@example.test', 'regisseur');
  assert.equal(E.cfDecideWithdrawal(wd.withdrawal.id, true).ok, true);
});

test('les profils autorité respectent le périmètre final et l’ouverture directe de dossier est filtrée', () => {
  E.cfReset();
  const FINAL = ['VALIDE', 'REJETE', 'ORDRE_EMIS', 'PAYE', 'MEDAILLES_REMISES', 'CEREMONIE_PLANIFIEE', 'CLOTURE'];
  const finalD = E.cfS().dossiers.find((d) => FINAL.includes(d.status));
  const blockedD = E.cfS().dossiers.find((d) => !FINAL.includes(d.status));
  assert.ok(finalD, 'aucun dossier final trouvé pour le ministre / DGT');
  assert.ok(blockedD, 'aucun dossier intermédiaire trouvé pour le test');

  as('demo.ministre@example.test', 'ministre');
  assert.ok(E.cfVisibleDossiers('ministre').every((d) => FINAL.includes(d.status)));
  assert.equal(E.cfCanOpenDoc({ dossierId: finalD.id }, 'ministre'), true);
  assert.equal(E.cfCanOpenDoc({ dossierId: blockedD.id }, 'ministre'), false);

  as('demo.dgt@example.test', 'dgt');
  assert.ok(E.cfVisibleDossiers('dgt').every((d) => FINAL.includes(d.status)));
  assert.equal(E.cfCanOpenDoc({ dossierId: finalD.id }, 'dgt'), true);
  assert.equal(E.cfCanOpenDoc({ dossierId: blockedD.id }, 'dgt'), false);

  as('demo.secretariat.dr@example.test', 'secretariat_dr');
  const secVisible = new Set(E.cfVisibleDossiers('secretariat_dr').map((d) => d.id));
  const secLevelMailIds = new Set(E.cfS().mails.filter((m) => m.level === 'dr').map((m) => m.dossierId));
  assert.ok(secLevelMailIds.size > 0);
  assert.deepEqual([...secVisible].sort(), [...secLevelMailIds].sort());

  as('demo.dr@example.test', 'dr');
  const drVisible = E.cfVisibleDossiers('dr');
  assert.ok(drVisible.some((d) => d.status === 'APPROUVE'));
  assert.ok(drVisible.some((d) => d.status === 'VALIDE'));
  assert.ok(drVisible.some((d) => d.status === 'REJETE'));

  as('demo.service.chef@example.test', 'service_chef');
  const svcVisible = E.cfVisibleDossiers('service_chef');
  assert.ok(svcVisible.some((d) => d.status === 'EN_ETUDE'));
  assert.ok(svcVisible.some((d) => d.status === 'VALIDE'));
  assert.ok(svcVisible.some((d) => d.status === 'CLOTURE'));
});

test('les écrans du cahier se rendent sans fenêtre modale classique', () => {
  E.cfReset();
  const pages = {
    demandeur: ['overview', 'dossiers', 'new-dossier', 'calendar', 'profile', 'notifications'],
    secretariat_dr: ['overview', 'inbox', 'history'],
    dr: ['overview', 'dossiers', 'recours', 'ceremonies', 'decisions'],
    service_chef: ['overview', 'instruction', 'orders', 'ceremonies', 'stats'],
    regisseur: ['overview', 'remises', 'retraits', 'stock'],
    admin: ['users', 'journal'],
    recipient: ['overview', 'retraits'],
  };
  for (const [role, list] of Object.entries(pages)) {
    as(role === 'recipient' ? 'demo.personne@example.test' : undefined, role);
    if (role === 'demandeur') as('demo.entreprise@example.test', role);
    if (role === 'secretariat_dr') as('demo.secretariat.dr@example.test', role);
    if (role === 'dr') as('demo.dr@example.test', role);
    if (role === 'service_chef') as('demo.service.chef@example.test', role);
    if (role === 'regisseur') as('demo.regisseur@example.test', role);
    if (role === 'admin') as('demo.admin@example.test', role);
    for (const page of list) {
      const html = role === 'admin' ? E.renderAdmin(role, page) : E.renderWorkspace(role, page);
      assert.match(html, /data-ws-content/, role + '/' + page);
      assert.match(html, /<h1\b/, role + '/' + page + ' sans titre');
      assert.doesNotMatch(html, /wsSidebar|portalSidebar/);
      assert.doesNotMatch(html, /class="[^"]*portal-modal|class="[^"]*ws-modal/);
    }
  }
});

test('le demandeur ne voit pas la localisation physique, le service si', () => {
  E.cfReset();
  as('demo.entreprise@example.test', 'demandeur');
  E.cfState.selected = 'D-005';
  const dem = E.renderWorkspace('demandeur', 'dossiers');
  assert.doesNotMatch(dem, /Localisation physique/);
  as('demo.service.agent@example.test', 'service_agent');
  const svc = E.renderWorkspace('service_agent', 'instruction');
  assert.doesNotMatch(svc, /Localisation physique/);
  as('demo.secretariat.dr@example.test', 'secretariat_dr');
  const loc = E.renderWorkspace('secretariat_dr', 'localisation');
  assert.match(loc, /Localisation/);
});

test('le récipiendaire / employé public ne voit pas de montant FCFA', () => {
  E.cfReset();
  as('demo.personne@example.test', 'recipient');
  for (const page of ['overview', 'retraits', 'profile', 'notifications']) {
    const html = E.renderWorkspace('recipient', page);
    assert.doesNotMatch(html, /FCFA/);
  }
});

test('Ctrl+K et barre supérieure collante sont prévus', () => {
  E.cfReset();
  as('demo.dr@example.test', 'dr');
  const html = E.renderWorkspace('dr', 'overview');
  assert.match(html, /site-header/);
  assert.match(html, /sticky/);
  assert.match(html, /Ctrl\+K/);
  assert.match(html, /page-head|ws-hero/);
});
