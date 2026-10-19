/* ==================================================================
   js/views/admin.js
   Espace Administrateur — gestion de la plateforme.

   Le profil ADMIN est isolé des rôles métier (DR, Service, Régisseur) :
   il ne peut pas transformer une décision métier sans mécanisme explicite.
   Les actions de cet écran opèrent sur les comptes internes et les
   paramètres de la plateforme. Les écrans suivants sont fournis :
   - vue d'ensemble ;
   - utilisateurs ;
   - comptes internes ;
   - entreprises reconnues ;
   - campagnes ;
   - paramètres métier ;
   - journal d'audit ;
   - alertes système.

   Toutes les opérations sont des illustrations de maquette. Aucun
   service métier n'est branché.
================================================================== */

const adminState = {
  query: '',
  status: 'Tous',
  role: 'Tous',
  detail: null,
  overlay: null,
  toast: '',
  toastKind: 'info',
  toastSequence: 0,
  selectedUser: null,
};

const ADMIN_INTERNAL_ROLES = [
  { key: 'SECRÉTARIAT_MINISTRE', label: 'Secrétariat — Ministre' },
  { key: 'SECRÉTARIAT_DGT', label: 'Secrétariat — DGT' },
  { key: 'SECRÉTARIAT_DR', label: 'Secrétariat — DR' },
  { key: 'MINISTRE', label: 'Ministre' },
  { key: 'DGT', label: 'Direction Générale du Travail' },
  { key: 'DR', label: 'Direction Régionale' },
  { key: 'SERVICE_AGENT', label: 'Service · Agent' },
  { key: 'SERVICE_INSPECTEUR', label: 'Service · Inspecteur' },
  { key: 'SERVICE_CHEF', label: 'Service · Chef' },
  { key: 'REGISSEUR', label: 'Régisseur' },
  { key: 'ADMIN', label: 'Administrateur' },
];

const ADMIN_CAMPAIGN_FILTERS = ['Toutes', 'Ouverte', 'Fermée', 'Planifiée'];
const ADMIN_USER_FILTERS = ['Tous', 'Actif', 'Désactivé', 'En attente'];
const ADMIN_AUDIT_TYPES = ['Tous', 'Connexion', 'Création', 'Modification', 'Désactivation', 'Décision'];

const adminBadge = (label, tone) => `<span class="admin-badge admin-badge-${tone || 'neutral'}">${esc(label)}</span>`;
const adminStat = (label, value, detail, ico, accent = 'green') => {
  const tone = accent === 'blue' ? 'bg-republic-blue-50 text-republic-blue-600' : accent === 'gold' ? 'bg-gold-100 text-gold-800' : 'bg-republic-green-50 text-republic-green-600';
  return `<div class="admin-stat"><span class="admin-stat-icon ${tone}">${icon(ico, 'size-5')}</span><span class="admin-stat-body"><small>${esc(label)}</small><strong>${esc(String(value))}</strong><span>${esc(detail)}</span></span></div>`;
};
const adminSearch = (placeholder = 'Rechercher…') => `<label class="admin-search">${icon('search', 'size-4')}<span class="sr-only">${esc(placeholder)}</span><input type="search" data-admin-search placeholder="${esc(placeholder)}" value="${esc(adminState.query)}"/></label>`;
const adminFilter = (id, label, options, value) => `<label class="admin-filter"><span>${esc(label)}</span><select data-admin-filter="${id}"><option value="">Tous</option>${options.map((o) => `<option value="${esc(o)}" ${value === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;

function adminData() {
  if (!presentationProfile()) return null;
  return INTERNAL_DEMO.admin || null;
}

function adminOverview() {
  const data = adminData();
  if (!data) return adminUnavailable();
  const users = data.users || [];
  const audit = data.audit || [];
  const stats = [
    adminStat('Utilisateurs', users.length, 'Tous rôles confondus', 'users', 'blue'),
    adminStat('Comptes internes', ADMIN_INTERNAL_ROLES.length, 'Rôles distincts', 'shield', 'green'),
    adminStat('Entreprises reconnues', '12', 'Campagnes en cours', 'building', 'gold'),
    adminStat('Alertes système', '3', 'Activité à examiner', 'alert', 'blue'),
  ];
  const recent = audit.slice(0, 4).map((entry) => `<div class="admin-audit-row"><span class="admin-audit-icon">${icon('fileText', 'size-4')}</span><div><strong>${esc(entry.label)}</strong><small>${esc(entry.date)} · ${esc(entry.type)}</small></div>${adminBadge(entry.status, entry.status === 'Traité' ? 'success' : entry.status === 'Audité' ? 'info' : 'warning')}</div>`).join('');
  return `<div class="admin-stats">${stats.join('')}</div><div class="admin-grid"><section class="admin-paper"><div class="admin-section-heading"><div class="admin-eyebrow">JOURNAL RÉCENT</div><h2>Activité plateforme</h2></div><div class="admin-audit">${recent || adminEmpty('Aucun événement récent.')}</div></section><section class="admin-paper"><div class="admin-section-heading"><div class="admin-eyebrow">CAMPAGNES</div><h2>État courant</h2></div><ul class="admin-list">${[
    { label:'Campagne 2026 — Distinctions professionnelles', status:'Ouverte', tone:'success' },
    { label:'Campagne 2025 — Reconnaissance de l’ancienneté', status:'Fermée', tone:'neutral' },
    { label:'Campagne 2024 — Valorisation du mérite', status:'Fermée', tone:'neutral' },
  ].map((c) => `<li><span><strong>${esc(c.label)}</strong></span>${adminBadge(c.status, c.tone)}</li>`).join('')}</ul></section></div>`;
}

function adminUsers() {
  const data = adminData();
  if (!data) return adminUnavailable();
  const users = (data.users || []).filter((u) => (adminState.status === 'Tous' || u.status === adminState.status) && (adminState.role === 'Tous' || u.role === adminState.role));
  return `<section class="admin-paper"><div class="admin-section-heading"><div><div class="admin-eyebrow">GESTION DES COMPTES</div><h2>Utilisateurs</h2></div><span class="admin-count">${users.length} résultat${users.length > 1 ? 's' : ''}</span></div><div class="admin-controls">${adminSearch('Email ou libellé')}${adminFilter('status', 'Statut', ['Actif', 'Désactivé', 'En attente'], adminState.status)}${adminFilter('role', 'Rôle', ['demandeur', 'recipient', 'secretariat_ministre', 'ministre', 'service_agent', 'admin'], adminState.role)}</div><div data-admin-results>${adminUserRows(users)}</div></section>`;
}

function adminUserRows(rows) {
  if (!rows.length) return adminEmpty('Aucun utilisateur ne correspond à ces critères.');
  return `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Email</th><th>Rôle</th><th>Libellé</th><th>Statut</th><th><span class="sr-only">Action</span></th></tr></thead><tbody>${rows.map((u) => `<tr><td><strong>${esc(u.email)}</strong></td><td><code>${esc(u.role)}</code></td><td>${esc(u.label)}</td><td>${adminBadge(u.status, u.status === 'Actif' ? 'success' : 'warning')}</td><td>${button({ size: 'sm', variant: 'ghost', html: 'Voir', attrs: { 'data-admin-action': 'user', 'data-email': u.email } })}</td></tr>`).join('')}</tbody></table></div>`;
}

function adminInternalAccounts() {
  const data = adminData();
  if (!data) return adminUnavailable();
  return `<section class="admin-paper"><div class="admin-section-heading"><div><div class="admin-eyebrow">RÔLES INTERNES</div><h2>Comptes internes</h2></div>${button({ size: 'sm', variant: 'primary', html: icon('plus', 'size-4') + 'Créer un compte', attrs: { 'data-admin-action': 'no-api', 'data-message': 'La création de compte interne nécessite le service d’administration.' } })}</div><p class="admin-context-note">${icon('info', 'size-4')} L’administrateur ne peut pas s’attribuer arbitrairement des rôles métier. Toute modification passe par le service d’administration.</p><ul class="admin-list admin-internal-list">${ADMIN_INTERNAL_ROLES.map((r) => `<li><div><strong>${esc(r.label)}</strong><small><code>${esc(r.key)}</code></small></div><div class="admin-actions-cell">${button({ size: 'sm', variant: 'ghost', html: 'Voir', attrs: { 'data-admin-action': 'no-api', 'data-message': `Consultation des détenteurs du rôle ${r.key} : service non connecté.` } })}${button({ size: 'sm', variant: 'ghost', html: 'Désactiver', attrs: { 'data-admin-action': 'no-api', 'data-message': 'Désactivation : service non connecté.' } })}</div></li>`).join('')}</ul></section>`;
}

function adminEnterprises() {
  const enterprises = [
    { name:'Société Gabonaise des Infrastructures (SGI)', sector:'BTP', status:'Reconnaître', tone:'success' },
    { name:'Entreprise Forestière du Littoral (EFL)', sector:'Forêt', status:'Reconnaître', tone:'success' },
    { name:'Compagnie des Infrastructures du Gabon (CIG)', sector:'Infrastructures', status:'Reconnaître', tone:'success' },
    { name:'Ateliers du Komo', sector:'Artisanat', status:'En attente', tone:'warning' },
  ];
  return `<section class="admin-paper"><div class="admin-section-heading"><div><div class="admin-eyebrow">DEMANDEURS</div><h2>Entreprises reconnues</h2></div></div><ul class="admin-list">${enterprises.map((e) => `<li><div><strong>${esc(e.name)}</strong><small>${esc(e.sector)}</small></div>${adminBadge(e.status, e.tone)}</li>`).join('')}</ul></section>`;
}

function adminCampaigns() {
  const list = [
    { name:'Campagne 2026 — Distinctions professionnelles', period:'01/01/2026 → 30/06/2026', status:'Ouverte', tone:'success' },
    { name:'Campagne 2025 — Reconnaissance de l’ancienneté', period:'01/01/2025 → 30/06/2025', status:'Fermée', tone:'neutral' },
    { name:'Campagne 2024 — Valorisation du mérite professionnel', period:'01/01/2024 → 30/06/2024', status:'Fermée', tone:'neutral' },
  ];
  return `<section class="admin-paper"><div class="admin-section-heading"><div><div class="admin-eyebrow">CALENDRIER</div><h2>Campagnes</h2></div>${button({ size: 'sm', variant: 'primary', html: icon('plus', 'size-4') + 'Ouvrir une campagne', attrs: { 'data-admin-action': 'no-api', 'data-message': 'L’ouverture d’une campagne nécessite le service d’administration.' } })}</div><ul class="admin-list">${list.map((c) => `<li><div><strong>${esc(c.name)}</strong><small>${esc(c.period)}</small></div>${adminBadge(c.status, c.tone)}</li>`).join('')}</ul></section>`;
}

function adminSettings() {
  const params = [
    { label:'Tarif médaille Bronze', value:'18 000 FCFA', tone:'success' },
    { label:'Tarif médaille Argent', value:'28 000 FCFA', tone:'success' },
    { label:'Tarif médaille Or', value:'46 000 FCFA', tone:'success' },
    { label:'Seuil Bronze', value:'10 à 19 ans', tone:'info' },
    { label:'Seuil Argent', value:'20 à 29 ans', tone:'info' },
    { label:'Seuil Or', value:'30 ans et plus', tone:'info' },
    { label:'Seuil d’alerte stock Bronze', value:'60 unités', tone:'warning' },
    { label:'Seuil d’alerte stock Argent', value:'40 unités', tone:'warning' },
    { label:'Seuil d’alerte stock Or', value:'30 unités', tone:'warning' },
  ];
  return `<section class="admin-paper"><div class="admin-section-heading"><div><div class="admin-eyebrow">RÉFÉRENTIEL MÉTIER</div><h2>Paramètres</h2></div>${button({ size: 'sm', variant: 'ghost', html: 'Consulter le référentiel', attrs: { 'data-admin-action': 'no-api', 'data-message': 'Lecture des paramètres : service non connecté.' } })}</div><ul class="admin-list">${params.map((p) => `<li><div><strong>${esc(p.label)}</strong></div>${adminBadge(p.value, p.tone)}</li>`).join('')}</ul><p class="admin-context-note">${icon('info', 'size-4')} Les valeurs ci-dessus reprennent le référentiel public. Les valeurs ci-dessus reprennent le référentiel public.</p></section>`;
}

function adminAudit() {
  const entries = [
    { id:'AU-2026-1041', date:'02/10/2026', user:'demo.admin@example.test', action:'Désactivation', object:'USER-MIN-001', result:'Succès', tone:'success' },
    { id:'AU-2026-1039', date:'01/10/2026', user:'demo.admin@example.test', action:'Création', object:'USER-DR-002', result:'Succès', tone:'success' },
    { id:'AU-2026-1034', date:'28/09/2026', user:'demo.admin@example.test', action:'Modification', object:'CAMPAGNE-2026', result:'Succès', tone:'info' },
    { id:'AU-2026-1025', date:'22/09/2026', user:'demo.admin@example.test', action:'Connexion', object:'Plateforme', result:'Succès', tone:'neutral' },
    { id:'AU-2026-1011', date:'15/09/2026', user:'demo.admin@example.test', action:'Décision', object:'Tentative refusée (rôle insuffisant)', result:'Refus', tone:'danger' },
  ];
  return `<section class="admin-paper"><div class="admin-section-heading"><div><div class="admin-eyebrow">NON MODIFIABLE</div><h2>Journal d’audit</h2></div><span class="admin-count">${entries.length} entrées</span></div><div class="admin-controls">${adminSearch('Utilisateur, action, objet…')}${adminFilter('type', 'Type d’action', ['Connexion', 'Création', 'Modification', 'Désactivation', 'Décision'], adminState.status)}</div><div data-admin-results><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Objet</th><th>Résultat</th></tr></thead><tbody>${entries.map((e) => `<tr><td>${esc(e.date)}</td><td>${esc(e.user)}</td><td>${esc(e.action)}</td><td>${esc(e.object)}</td><td>${adminBadge(e.result, e.tone)}</td></tr>`).join('')}</tbody></table></div></div><p class="admin-context-note">${icon('info', 'size-4')} Le journal est en lecture seule et n’est jamais modifié par l’interface.</p></section>`;
}

function adminAlerts() {
  const alerts = [
    { id:'A-001', level:'warning', text:'Stock Or en dessous du seuil d’alerte (43/30).', date:'03/10/2026' },
    { id:'A-002', level:'info', text:'Cérémonie du 18/11/2026 à confirmer (CER-DEMO-2026-008).', date:'02/10/2026' },
    { id:'A-003', level:'critical', text:'Échec de paiement du Trésor : OR-2024-005.', date:'30/09/2026' },
  ];
  return `<section class="admin-paper"><div class="admin-section-heading"><div><div class="admin-eyebrow">VIGILANCE</div><h2>Alertes système</h2></div></div><ul class="admin-alert-list">${alerts.map((a) => `<li class="admin-alert admin-alert-${a.level}"><span class="admin-alert-icon">${icon(a.level === 'critical' ? 'alert' : a.level === 'warning' ? 'alert' : 'info', 'size-4')}</span><div><strong>${esc(a.text)}</strong><small>${esc(a.date)}</small></div></li>`).join('')}</ul></section>`;
}

function adminEmpty(text) { return `<div class="admin-empty">${icon('folder', 'size-7')}<strong>Aucun élément à afficher</strong><p>${esc(text)}</p></div>`; }
function adminUnavailable() { return `<section class="admin-paper admin-unavailable"><span class="admin-unavailable-icon">${icon('info', 'size-6')}</span><div class="admin-eyebrow">DONNÉES INDISPONIBLES</div><h2>Le service d’administration n’est pas connecté.</h2><p>Aucune donnée réelle ni fictive n’est exposée dans cette interface sans service branché.</p></section>`; }
function adminToastHtml() { return adminState.toast ? `<div class="admin-toast admin-toast-${adminState.toastKind}" role="${adminState.toastKind === 'error' ? 'alert' : 'status'}">${icon(adminState.toastKind === 'error' ? 'alert' : 'info', 'size-4')}<span>${esc(adminState.toast)}</span><button type="button" data-admin-action="dismiss-toast" aria-label="Fermer la notification" class="admin-toast-close">${icon('x', 'size-4')}</button></div>` : ''; }

function adminContent(role, page) {
  switch (page) {
    case 'overview': return adminOverview();
    case 'users': return adminUsers();
    case 'internal-accounts': return adminInternalAccounts();
    case 'enterprises': return adminEnterprises();
    case 'campaigns': return adminCampaigns();
    case 'settings': return adminSettings();
    case 'audit': return adminAudit();
    case 'alerts': return adminAlerts();
    case 'profile': return `<section class="admin-paper"><div class="admin-eyebrow">COMPTE</div><h2>Profil administrateur</h2><p class="admin-context-note">${icon('info', 'size-4')} Les informations de l’administrateur proviennent du service d’administration, qui n’est pas branché dans cet aperçu.</p></section>`;
    case 'notifications': return adminAlerts();
    default: return adminEmpty('Rubrique non disponible.');
  }
}

function renderAdmin(role, page) {
  // L'admin utilise désormais la même structure que les autres espaces
  // (header sticky, onglets, hero), pour respecter la cohérence visuelle.
  return renderWorkspace(role, page);
}

function adminAction(action, el) {
  if (action === 'dismiss-toast') { adminState.toast = ''; paintAdminToast(); return; }
  if (action === 'no-api') { adminState.toast = el.dataset.message || 'Action non disponible.'; adminState.toastKind = 'error'; paintAdminToast(); return; }
  if (action === 'user') { adminState.toast = `Consultation de ${el.dataset.email} : service non connecté.`; adminState.toastKind = 'info'; paintAdminToast(); return; }
}

function paintAdminToast() {
  const node = document.getElementById('admin-toast');
  if (node) node.innerHTML = adminToastHtml();
}

function adminInput(el) {
  if (!el.matches('[data-admin-search]')) return false;
  adminState.query = el.value;
  const node = document.querySelector('[data-admin-results]');
  if (!node) return true;
  const data = adminData();
  if (!data) return true;
  const users = (data.users || []).filter((u) => `${u.email} ${u.label}`.toLowerCase().includes(adminState.query.toLowerCase()));
  node.innerHTML = adminUserRows(users);
  return true;
}

function adminChange(el) {
  if (!el.matches('[data-admin-filter]')) return false;
  adminState[el.dataset.adminFilter] = el.value;
  return false; // Le repaint se fait par le routeur.
}
