/* Contrats de la présentation locale : jamais de session serveur fictive. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const store = () => {
  const map = new Map();
  return {
    getItem: (key) => map.get(key) || null,
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
};
const ctx = vm.createContext({
  window: {
    DN_AUTH_ENDPOINT: null,
    location: { hash: '', pathname: '/', protocol: 'http:', hostname: 'localhost' },
    localStorage: store(),
    sessionStorage: store(),
  },
  document: {},
  console,
  setTimeout,
  clearTimeout,
  Intl,
});
const files = [
  'js/site-config.js', 'js/icons.js', 'js/data.js', 'js/auth.js', 'js/demo-accounts.js', 'js/portal-demo.js', 'js/demo-store.js',
  'js/router.js', 'js/ui.js', 'js/views/home.js', 'js/registration.js', 'js/views/login.js',
  'js/views/workspace.js', 'js/views/portals.js', 'js/views/portal-extras.js', 'js/views/admin.js',
];
for (const name of files) {
  vm.runInContext(fs.readFileSync(path.join(root, name), 'utf8'), ctx, { filename: name });
}
vm.runInContext(`globalThis.portalExpose={
  PRESENTATION_MODE, DEMO_OTP_CODE, PORTAL_DEMO, presentationProfile, enterPresentation, leavePresentation,
  renderPortal, portalData, portalState, portalProfile, renderLogin, DEMO_TARIFFS, DEMO_PLACES,
  ceremonyEligibleDossiers, distinctionStats, financeStats, employeeStats, ceremonyStats, DemoStore, portalOrgKey,
  personEligibleWithdrawals, addWithdrawalRequest
};`, ctx);
const {
  PRESENTATION_MODE, DEMO_OTP_CODE, PORTAL_DEMO, presentationProfile, enterPresentation, leavePresentation,
  renderPortal, portalData, portalState, renderLogin, DEMO_TARIFFS, DEMO_PLACES,
  ceremonyEligibleDossiers, distinctionStats, financeStats, employeeStats, ceremonyStats, DemoStore, portalOrgKey,
  personEligibleWithdrawals, addWithdrawalRequest,
} = ctx.portalExpose;

test('présentation explicite et porte fermée sans sélection de profil', () => {
  assert.equal(PRESENTATION_MODE, true);
  assert.equal(presentationProfile(), null);
  assert.match(renderPortal('demandeur', 'overview'), /Accès à votre espace/);
  assert.doesNotMatch(renderPortal('demandeur', 'overview'), /DNG-DEMO-2026/);
  assert.match(renderLogin(null), /Explorer la démonstration/);
  assert.equal(enterPresentation('agent_administration'), false);
});

test('données fictives cohérentes et cloisonnées par profil', () => {
  assert.equal(enterPresentation('demandeur'), true);
  const entreprise = renderPortal('demandeur', 'overview');
  assert.match(entreprise, /Votre espace entreprise/);
  assert.match(entreprise, /Entreprise reconnue/);
  assert.doesNotMatch(entreprise, /ws-sidebar|MINISTÈRE INTERNE/);
  const enterprise = PORTAL_DEMO.enterprise;
  assert.equal(enterprise.awards.length, 14);
  assert.equal(enterprise.dossiers.length, 6);
  assert.ok(enterprise.dossiers.some((d) => d.ref === 'DNG-DEMO-2026-030'));
  for (const a of enterprise.awards) {
    assert.ok(enterprise.dossiers.some((d) => d.ref === a.dossier && d.recipients.includes(a.name)), a.name + ' / ' + a.dossier);
  }
  for (const d of enterprise.dossiers) {
    if (d.order) assert.ok(enterprise.orders.some((o) => o.ref === d.order && o.dossier === d.ref));
  }
  assert.equal(portalData('recipient'), null, 'les données personnelles ne sont pas accessibles avec le rôle entreprise');
  leavePresentation();
  enterPresentation('recipient');
  const perso = renderPortal('recipient', 'overview');
  assert.match(perso, /Mon espace personnel/);
  assert.match(perso, /Alain Moussavou/);
  assert.doesNotMatch(perso, /FCFA|Ordre de recette|RCCM|CNSS/);
  assert.equal(portalData('demandeur'), null, 'les finances entreprise ne sont pas accessibles avec le rôle personnel');
  assert.equal(PORTAL_DEMO.person.affiliations.filter((x) => x.status === 'ACTIF').length, 1);
  assert.equal(PORTAL_DEMO.person.affiliations.filter((x) => x.status === 'TERMINE').length, 1);
  leavePresentation();
});

test('codes de présentation distincts du parcours OTP réel', () => {
  assert.match(DEMO_OTP_CODE, /^\d{6}$/);
  assert.equal(PORTAL_DEMO.person.profile.email.endsWith('.invalid'), true);
  const code = fs.readFileSync(path.join(root, 'js/views/login.js'), 'utf8');
  assert.match(code, /if\(authState\.preview === 'demo'\)/);
  assert.match(code, /if\(code !== DEMO_OTP_CODE\)/);
  assert.match(code, /registrationOperation\('verify'/);
  assert.match(code, /aucun compte n’a été créé ou activé sur le serveur/i);
});

test('modules employés, distinctions, finance et cérémonies — entreprise', () => {
  leavePresentation();
  assert.equal(enterPresentation('demandeur', 'demo.entreprise@example.test'), true);
  assert.equal(portalOrgKey(), 'enterprise');
  const data = portalData('demandeur');
  assert.equal(data.employees.length, 7);
  assert.ok(data.employees.some((e) => e.prenom === 'Pierre' && e.status === 'EN_ATTENTE'));
  assert.ok(data.employees.some((e) => e.prenom === 'Fatou' && e.nationalite === 'Sénégalaise'));
  const empPage = renderPortal('demandeur', 'employees');
  assert.match(empPage, /Liste des employés/);
  assert.match(empPage, /Pierre/);
  assert.match(empPage, /Invitation en attente/);
  assert.match(empPage, /data-menu="employees"/);
  const form = renderPortal('demandeur', 'employee-new');
  assert.match(form, /Enregistrer un employé/);
  assert.match(form, /id="employee-form"/);
  assert.match(form, /Situation physique déclarée/);
  const stats = renderPortal('demandeur', 'employee-stats');
  assert.match(stats, /Statistiques des employés/);
  const es = employeeStats(data);
  assert.equal(es.total, 7);
  assert.equal(es.attente, 1);
  const dist = renderPortal('demandeur', 'distinctions');
  assert.match(dist, /14 distinction/);
  const ds = distinctionStats(data);
  assert.equal(ds.total, 14);
  assert.equal(ds.refused, 1);
  const finance = renderPortal('demandeur', 'payments');
  assert.match(finance, /Un ordre de recette n’est pas un paiement|n’est pas un paiement/);
  assert.match(finance, /finances|Finance|financier/i);
  assert.match(finance, /12[\s\u00a0\u202f]?000/);
  const fsStats = financeStats(data);
  assert.ok(fsStats.issued > fsStats.paid || fsStats.remaining >= 0);
  const request = renderPortal('demandeur', 'ceremony-request');
  assert.match(request, /Mode démonstration — lieux prédéfinis|Choisir le dossier/);
  assert.match(request, /DNG-DEMO-2026-030/);
  const eligible = ceremonyEligibleDossiers(data);
  assert.ok(eligible.some((d) => d.ref === 'DNG-DEMO-2026-030'));
  assert.equal(eligible.some((d) => d.ref === 'DNG-DEMO-2026-008'), false);
  const cal = renderPortal('demandeur', 'ceremony-calendar');
  assert.match(cal, /Calendrier des cérémonies/);
  assert.match(cal, /ws-calendar-grid/);
  const mine = renderPortal('demandeur', 'ceremonies');
  assert.match(mine, /Mes cérémonies/);
  const cs = ceremonyStats(data);
  assert.equal(cs.pending, 0);
  assert.ok(cs.refused >= 1);
  leavePresentation();
});

test('profil employé — personne confirme une affiliation', () => {
  leavePresentation();
  assert.equal(enterPresentation('recipient'), true);
  const data = portalData('recipient');
  assert.ok((data.affiliations || []).some((a) => a.status === 'EN_ATTENTE'));
  const overview = renderPortal('recipient', 'overview');
  assert.match(overview, /invitation/i);
  assert.doesNotMatch(overview, /FCFA/);
  const employers = renderPortal('recipient', 'employers');
  assert.match(employers, /Mes employeurs/);
  assert.match(employers, /Invitation en attente/);
  assert.match(employers, /person-aff-confirm/);
  assert.match(employers, /Anciennes affiliations|Ateliers du Komo/);
  const profile = renderPortal('recipient', 'profile');
  assert.match(profile, /PROFIL EMPLOYÉ/);
  assert.match(profile, /Alain/);
  assert.doesNotMatch(profile, /FCFA/);
  const actions = renderPortal('recipient', 'actions');
  assert.match(actions, /Confirmer l’affiliation|Confirmer l'affiliation/);
  leavePresentation();
});

test('personne — Mon parcours, cérémonies et retrait sans cérémonie', () => {
  leavePresentation();
  assert.equal(enterPresentation('recipient'), true);
  const shell = renderPortal('recipient', 'overview');
  assert.match(shell, /data-menu="parcours"/);
  assert.match(shell, /Mon parcours/);
  assert.match(shell, /data-menu="withdrawals"/);
  assert.match(shell, /Retrait sans cérémonie/);
  assert.doesNotMatch(shell, /FCFA/);
  const awards = renderPortal('recipient', 'recipients');
  assert.match(awards, /Mes distinctions/);
  assert.match(awards, /Validée/);
  assert.match(awards, /En attente de remise/);
  assert.match(awards, /wd-pick/);
  assert.doesNotMatch(awards, /FCFA/);
  const ceremonies = renderPortal('recipient', 'ceremonies');
  assert.match(ceremonies, /Mes cérémonies/);
  assert.match(ceremonies, /ws-calendar-grid/);
  assert.match(ceremonies, /Validée|validée/);
  assert.match(ceremonies, /Invité|Confirmé|Présent/);
  const photos = renderPortal('recipient', 'photos');
  assert.match(photos, /Mes photos de remise/);
  assert.match(photos, /Illustration|illustration/);
  const request = renderPortal('recipient', 'withdrawal-request');
  assert.match(request, /Choisir la distinction/);
  assert.match(request, /DNG-DEMO-2026-008/);
  assert.match(request, /Médaille Or|médaille Or/i);
  const eligible = personEligibleWithdrawals(portalData('recipient'));
  assert.ok(eligible.some((a) => a.medal === 'Or' && a.campaign === '2026'));
  assert.equal(eligible.some((a) => a.remise === 'Remise'), false);
  portalState.withdrawWizard = { step: 4, awardId: 'PAW-2026-OR', motif: '', quittance: 'QUI-DEMO-2026-008.pdf', permission: 'autorisation-retrait-demo.pdf', dirty: false };
  const recap = renderPortal('recipient', 'withdrawal-request');
  assert.match(recap, /Moussavou/);
  assert.match(recap, /Alain/);
  assert.match(recap, /Gabonaise/);
  assert.match(recap, /Quittance/);
  assert.match(recap, /Autorisation/);
  assert.doesNotMatch(recap, /FCFA/);
  const rec = addWithdrawalRequest({
    awardId: 'PAW-2026-OR', medal: 'Or', campaign: '2026', dossier: 'DNG-DEMO-2026-008',
    employer: 'Société Gabonaise des Infrastructures', nom: 'Moussavou', prenom: 'Alain',
    sexe: 'Masculin', nationalite: 'Gabonaise', quittance: 'QUI-DEMO-2026-008.pdf',
    permission: 'autorisation-retrait-demo.pdf', motif: '',
  });
  assert.match(rec.id, /^RET-DEMO-/);
  const list = renderPortal('recipient', 'withdrawals');
  assert.match(list, /Mes demandes/);
  assert.ok(list.includes(rec.id));
  leavePresentation();
});

test('ministère cloisonné et tarifs centralisés', () => {
  leavePresentation();
  assert.equal(enterPresentation('demandeur', 'demo.ministere@example.test'), true);
  assert.equal(portalOrgKey(), 'ministere');
  const html = renderPortal('demandeur', 'overview');
  assert.match(html, /espace ministère|ESPACE MINISTÈRE/i);
  const data = portalData('demandeur');
  assert.ok(data.dossiers.every((d) => String(d.ref).includes('MIN') || d.ref.startsWith('DNG-DEMO-MIN')));
  assert.doesNotMatch(JSON.stringify(data.dossiers.map((d) => d.ref)), /DNG-DEMO-2026-041/);
  assert.equal(DEMO_TARIFFS.Bronze, 12000);
  assert.equal(DEMO_TARIFFS.Argent, 18000);
  assert.equal(DEMO_TARIFFS.Or, 24000);
  assert.equal(DEMO_PLACES.length, 10);
  assert.equal(DemoStore.tariffs.Bronze, 12000);
  leavePresentation();
});
