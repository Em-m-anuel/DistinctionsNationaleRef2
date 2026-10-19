/* Pont GAB-ORIENT → FrontII
   - Monte les vues proto (GO.views.*.render) dans l’espace de travail.
   - Hydrate GO.S depuis dn.cf.store.v1 / DemoStore (jamais GO_DATA.seed).
   - GO.can → ipMay ; confirmations → cf-confirm-bar ; wizard 6 et auth inchangés.
*/
(function (g) {
  'use strict';
  var GO = g.GO;

  const PAGE_TO_VIEW = {
    overview: 'apercu', accueil: 'apercu',
    dossiers: 'dossiers', 'dossiers-transmis': 'dossiers', archives: 'dossiers', employers: 'dossiers',
    instruction: 'instruction', ready: 'instruction',
    supervision: 'supervision',
    recipients: 'beneficiaires', beneficiaires: 'beneficiaires', employees: 'beneficiaires',
    'employee-new': 'beneficiaires', 'employee-stats': 'beneficiaires',
    complements: 'complements', 'waiting-pieces': 'complements', relances: 'complements',
    'agent-relances': 'complements', completeness: 'pieces',
    recours: 'recours', 'recours-historique': 'recours', 'agent-recours': 'recours',
    inbox: 'transmissions', transmissions: 'transmissions', courrier: 'transmissions',
    'mail-register': 'transmissions', 'mail-transmit': 'transmissions',
    documents: 'courriers', courriers: 'courriers',
    orders: 'recettes', payments: 'recettes', 'payments-follow': 'recettes',
    stock: 'stock', movements: 'stock', diplomas: 'stock',
    remises: 'remises',
    retraits: 'retraits', withdrawals: 'retraits', actions: 'retraits', 'withdrawal-request': 'retraits',
    controle: 'controle', anomalies: 'controle', adjustments: 'controle',
    'controles-recip': 'controle', 'verify-history': 'controle',
    stats: 'statistiques', 'dossiers-stats': 'statistiques', 'reg-stats': 'statistiques', 'dossier-stats': 'statistiques',
    journal: 'journal', history: 'journal', activity: 'journal',
    users: 'administration', administration: 'administration', comptes: 'administration',
    pieces: 'pieces', justificatifs: 'pieces',
    distinctions: 'distinctions', parcours: 'distinctions',
    notifications: 'notifications',
    ceremonies: 'ceremonies', calendar: 'ceremonies', agenda: 'ceremonies',
    'cer-demandes': 'ceremonies', delegations: 'ceremonies', photos: 'ceremonies',
    'ceremony-request': 'ceremonies', 'ceremony-calendar': 'ceremonies',
    decisions: 'decisions',
    'new-dossier': 'nouveau', nouveau: 'nouveau',
    profile: 'profil', profil: 'profil',
  };

  const ROLE_TO_GO = {
    service_agent: 'agent',
    service_chef: 'chef',
    service_inspecteur: 'inspecteur',
    ministre: 'ministre',
    dgt: 'dgt',
    dr: 'dr',
    secretariat_ministre: 'sec_min',
    secretariat_dgt: 'sec_dgt',
    secretariat_dr: 'sec_dr',
    regisseur: 'regisseur',
    admin: 'admin',
    demandeur: 'demandeur_entreprise',
    applicant: 'demandeur_entreprise',
    recipient: 'recipiendaire',
    recipiendaire: 'recipiendaire',
  };

  const AUTH_TO_GO = { ministre: 'min', dgt: 'dgt', dr: 'dr' };
  const SKIP_PAGES = {};

  function frontRole() {
    if (window.GO && GO._frontRole) return GO._frontRole;
    if (typeof cfRole === 'function' && cfRole()) return cfRole();
    if (typeof cfState !== 'undefined' && cfState.spaceRole) return cfState.spaceRole;
    return '';
  }

  function goRoleKey(role) {
    const r = role || frontRole();
    if (r === 'demandeur' && typeof cfApplicant === 'function') {
      const a = cfApplicant(typeof cfApplicantId === 'function' ? cfApplicantId() : '');
      if (a && String(a.type || '').toLowerCase().indexOf('minist') >= 0) return 'demandeur_ministere';
    }
    return ROLE_TO_GO[r] || 'agent';
  }

  function isoDate(value) {
    if (!value) return (typeof CF_TODAY !== 'undefined' && CF_TODAY) ? toIso(CF_TODAY) : '2026-10-14';
    if (value instanceof Date) return toIso(value);
    const t = String(value).trim();
    const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return iso[1] + '-' + iso[2] + '-' + iso[3];
    const fr = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (fr) return fr[3] + '-' + String(fr[2]).padStart(2, '0') + '-' + String(fr[1]).padStart(2, '0');
    return t.slice(0, 10);
  }
  function toIso(d) {
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  function medalId(metal) {
    const s = String(metal || '').toLowerCase();
    if (s.indexOf('or') >= 0 && s.indexOf('arg') < 0) return 'or';
    if (s.indexOf('arg') >= 0) return 'argent';
    return 'bronze';
  }
  function authorityId(dest) {
    return AUTH_TO_GO[dest] || 'dr';
  }

  function cfToGoStatus(d, role) {
    const st = d.status || '';
    const openCpl = (d.complements || []).some(c => c.status === 'ouvert' || c.status === 'ouvert'.toUpperCase() || c.status === 'EN_ATTENTE');
    if (st === 'REJETE' || st === 'REFUSE') return 'refuse';
    if (st === 'SOUMIS') {
      if (typeof cfIsAuth === 'function' && cfIsAuth(role) && d.transmitted) return 'transmis';
      if (typeof cfIsSec === 'function' && cfIsSec(role)) return 'recu';
      return 'recu';
    }
    if (st === 'EN_ETUDE') return openCpl ? 'complement' : 'en_cours';
    if (st === 'APPROUVE') return 'recu';
    if (['VALIDE', 'ORDRE_EMIS', 'PAYE', 'MEDAILLES_REMISES', 'CEREMONIE_PLANIFIEE', 'CLOTURE'].indexOf(st) >= 0) return 'approuve';
    return 'en_cours';
  }

  function cerState(st) {
    const s = String(st || '').toLowerCase();
    if (s.indexOf('confirm') >= 0) return 'confirme';
    if (s.indexOf('négoc') >= 0 || s.indexOf('negoc') >= 0) return 'negociation';
    if (s.indexOf('tenu') >= 0 || s.indexOf('term') >= 0) return 'termine';
    if (s.indexOf('conflit') >= 0) return 'conflit';
    return 'propose';
  }

  function emptyState(roleKey) {
    return {
      version: (window.GO_DATA && window.GO_DATA.config && window.GO_DATA.config.dataVersion) || 'frontii',
      role: roleKey,
      prefs: { reduceMotion: false, compact: false },
      dossiers: [], documents: [], dts: [], distinctions: [], person: null,
      ceremonies: [], notifications: [], transmissions: [], receiptOrders: [],
      stock: [
        { id: 'st-bronze', item: 'bronze', label: 'Médaille Bronze', available: 0, reserved: 0, threshold: 60 },
        { id: 'st-argent', item: 'argent', label: 'Médaille Argent', available: 0, reserved: 0, threshold: 40 },
        { id: 'st-or', item: 'or', label: 'Médaille Or', available: 0, reserved: 0, threshold: 30 },
        { id: 'st-diplome', item: 'diplome', label: 'Diplôme de distinction', available: 0, reserved: 0, threshold: 100 }
      ],
      suppliers: [], purchaseOrders: [], deliveries: [], stockMovements: [],
      remises: [], withdrawals: [], complements: [], relances: [], controls: [],
      recours: [], audit: [], accounts: []
    };
  }

  function ensureOrg(id, app) {
    const D = window.GO && window.GO.D;
    if (!D || !id) return id;
    if (!D.organisations) D.organisations = [];
    if (!D.organisations.find(o => o.id === id)) {
      D.organisations.push({
        id: id,
        name: (app && (app.nom || app.sigle)) || id,
        short: (app && (app.sigle || app.nom)) || id,
        type: (app && app.type) || 'Entreprise',
        sector: (app && (app.secteur || app.sector)) || '—',
        city: (app && (app.ville || app.city)) || 'Libreville',
        contact: (app && (app.contact || app.nom)) || '—',
        contactRole: 'Interlocuteur',
        email: (app && app.email) || '',
        phone: (app && (app.tel || app.phone)) || ''
      });
    }
    return id;
  }

  function ensureVenue(place) {
    const D = window.GO && window.GO.D;
    if (!D) return 'v0';
    const name = place || 'Libreville';
    const found = (D.venues || []).find(v => v.name === name || v.id === name);
    if (found) return found.id;
    const id = 'v-cf-' + String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24);
    D.venues = D.venues || [];
    D.venues.push({ id: id, name: name, short: name, city: name, address: name, lat: -0.39, lng: 9.45, kind: 'site' });
    return id;
  }

  function mapDossier(d, role) {
    const app = typeof cfApplicant === 'function' ? cfApplicant(d.applicantId) : null;
    const orgId = ensureOrg(d.applicantId || 'org-inconnu', app);
    const history = (d.history || []).map(h => {
      if (Array.isArray(h)) return { date: isoDate(h[0]), time: '09:00', kind: 'note', label: String(h[1] || ''), actor: '' };
      return { date: isoDate(h.date), time: h.time || '09:00', kind: h.kind || 'note', label: h.label || h.action || '', actor: h.actor || '' };
    });
    if (!history.length) history.push({ date: isoDate(d.submitted), time: '09:00', kind: 'depot', label: 'Dépôt', actor: '' });
    const recipients = (d.recipients || []).map(r => {
      const openCpl = (d.complements || []).find(c => c.recipientId === r.id && (c.status === 'ouvert' || c.status === 'EN_ATTENTE'));
      return {
        id: r.id, nom: r.nom || '', prenom: r.prenom || '', fonction: r.poste || r.fonction || '',
        entree: isoDate(r.start), medal: medalId(r.metal || r.granted), sexe: r.sexe || '',
        nationalite: r.nationalite || 'Gabonaise', countryCode: r.countryCode || '',
        situation: r.situation || 'Vivant', dateDeces: r.dateDeces || '',
        review: r.review || (openCpl ? 'complement' : ''),
        complement: r.complement || (openCpl ? { items: openCpl.objet, state: 'ouvert', requested: isoDate(openCpl.date) } : null)
      };
    });
    return {
      ref: d.ref, _cfId: d.id, org: orgId, status: cfToGoStatus(d, role),
      depot: isoDate(d.submitted), authority: authorityId(d.destination),
      channel: d.horsDelai ? 'Hors délai' : 'Téléversement',
      kind: d.kind || 'nouvelle', relatedRef: d.relatedRef || '',
      agent: d.agent || '', recipients: recipients, history: history,
      observations: (d.indications || []).map(x => ({
        date: isoDate(x.date), author: x.by || x.author || '—', text: x.texte || x.text || String(x)
      })),
      complementSince: openComplement(d) ? isoDate(openComplement(d).date) : undefined
    };
  }

  function openComplement(d) {
    return (d.complements || []).find(c => c.status === 'ouvert' || c.status === 'EN_ATTENTE');
  }

  function mapDocuments(store, refs) {
    // Les documents du magasin portent l'identifiant interne du dossier
    // (« D-001 ») ; les vues et `getDossier()` attendent la référence
    // administrative (« DNG-2026-001 »). On rétablit la correspondance.
    const refOf = new Map();
    (store.dossiers || []).forEach(d => {
      if (d.id) refOf.set(d.id, d.ref);
      if (d.ref) refOf.set(d.ref, d.ref);
    });
    const fromStore = (store.documents || []).filter(x => refs.has(x.dossierId) || refs.has(x.dossier)).map(x => ({
      id: x.id, dossier: refOf.get(x.dossierId || x.dossier) || x.dossierId || x.dossier, title: x.name, type: x.origin === 'généré' ? 'sortant' : 'entrant',
      kind: /ordre/i.test(x.name || '') ? 'transmission' : (/décision|decision/i.test(x.name || '') ? 'decision' : 'piece'),
      date: isoDate(x.date), from: x.origin || '—', state: x.signStatus === 'SIGNE_SCELLE' ? 'vise' : (x.signStatus === 'SIGNE_VISUELLEMENT' ? 'attente_visa' : 'enregistre'),
      number: x.numero || '', internal: false, pages: x.pages || 1,
      file: x.file || (x.dataUrl ? { name: x.name, type: x.mime || '', dataUrl: x.dataUrl } : null)
    }));
    (store.dossiers || []).forEach(d => {
      if (!refs.has(d.id)) return;
      (d.files || []).forEach((f, i) => {
        fromStore.push({
          id: (d.id || d.ref) + '-f' + i, dossier: d.ref, title: f.title || f.name || 'Pièce',
          type: 'entrant', kind: f.kind || 'upload', date: isoDate(d.submitted), from: 'Demandeur',
          state: 'depose', number: '', internal: false, pages: 1,
          file: f.dataUrl ? { name: f.name, size: f.size, type: f.type, dataUrl: f.dataUrl } : (f.name ? { name: f.name, size: f.size, type: f.type } : null)
        });
      });
      if (d.quittance && d.quittance.file && d.quittance.file.dataUrl) {
        fromStore.push({
          id: (d.id || d.ref) + '-qui', dossier: d.ref, title: 'Quittance', type: 'piece', kind: 'recu',
          date: isoDate(d.quittance.date || d.quittance.uploaded), from: 'Demandeur', state: 'depose',
          number: d.quittance.numero || '', internal: false, pages: 1, file: d.quittance.file
        });
      }
    });
    return fromStore;
  }

  function mapTransmissions(store, refs, role) {
    return (store.mails || []).filter(m => refs.has(m.dossierId)).map(m => {
      const d = (store.dossiers || []).find(x => x.id === m.dossierId);
      return {
        id: m.id, dossier: d ? d.ref : m.dossierId, date: isoDate(m.date), time: '09:00',
        direction: m.phase === 'secretariat' ? 'entrant' : 'sortant',
        from: m.phase === 'secretariat' ? 'Demandeur' : 'Secrétariat',
        to: m.phase === 'autorite' ? (m.level || 'autorité') : (m.type === 'dossier' ? 'Directeur régional' : 'Service des Distinctions'),
        subject: (d ? d.ref : m.id) + ' — ' + (m.type || 'courrier'),
        state: m.status === 'a_enregistrer' || m.status === 'a_transmettre' ? 'recu' : (m.status === 'RECUE' ? 'enregistre' : (m.status === 'LUE' ? 'transmis' : 'enregistre')),
        authority: authorityId(m.level), channel: 'Navette interne', file: null, cfMailId: m.id
      };
    });
  }

  function mapCeremonies(store, refs) {
    const out = [];
    (store.ceremonies || []).forEach(c => {
      (c.dossiers || []).forEach(did => {
        if (!refs.has(did) && !refs.has(c.id)) return;
        const d = (store.dossiers || []).find(x => x.id === did);
        if (!d) return;
        out.push({
          id: c.id + '-' + did, dossier: d.ref, date: isoDate(c.date), time: '10:00',
          venue: ensureVenue(c.place), state: cerState(c.status), note: c.type || '', validation: c.status === 'confirmée' ? 'validée' : ''
        });
      });
    });
    (store.dossiers || []).forEach(d => {
      if (!refs.has(d.id) || !d.ceremony) return;
      if (out.some(c => c.dossier === d.ref)) return;
      out.push({
        id: 'CER-' + d.id, dossier: d.ref, date: isoDate(d.ceremony.date), time: '10:00',
        venue: ensureVenue(d.ceremony.place), state: cerState(d.ceremony.status), note: d.ceremony.type || ''
      });
    });
    return out;
  }

  function mapComplements(store, refs) {
    const out = [];
    (store.dossiers || []).forEach(d => {
      if (!refs.has(d.id)) return;
      (d.complements || []).forEach(c => {
        out.push({
          id: c.id, dossier: d.ref, recipient: c.recipientId || null, requested: isoDate(c.date), due: isoDate(c.date),
          items: c.objet || c.texte || 'Pièce complémentaire', state: c.status === 'ouvert' || c.status === 'EN_ATTENTE' ? 'attendu' : 'satisfait',
          relances: 0
        });
      });
    });
    return out;
  }

  function mapRecours(store, refs) {
    const out = [];
    (store.dossiers || []).forEach(d => {
      if (!refs.has(d.id)) return;
      (d.recours || []).forEach(r => {
        const st = String(r.status || '').toLowerCase();
        out.push({
          id: r.id, dossier: d.ref, date: isoDate(r.date), author: r.autorite || 'demandeur',
          motif: r.motif || '', state: st.indexOf('accept') >= 0 ? 'accepte' : (st.indexOf('rejet') >= 0 ? 'rejete' : 'en_examen'),
          authority: authorityId(r.autorite)
        });
      });
    });
    return out;
  }

  function mapControls(store, refs) {
    const out = [];
    (store.dossiers || []).forEach(d => {
      if (!refs.has(d.id)) return;
      (d.anomalies || []).forEach((a, i) => {
        out.push({
          id: a.id || ('CTL-' + d.id + '-' + i), dossier: d.ref, date: isoDate(a.date),
          inspector: a.by || 'Inspection du travail', state: 'anomalie', scope: 'Contrôle documentaire',
          findings: [{ code: 'AN-01', label: a.texte || a.motif || 'Anomalie', severity: 'majeure' }],
          note: a.texte || a.motif || ''
        });
      });
    });
    return out;
  }

  function mapOrders(store, refs) {
    return (store.dossiers || []).filter(d => refs.has(d.id) && d.order).map(d => ({
      id: d.order.ref || ('OR-' + d.ref), dossier: d.ref, issued: isoDate(d.order.date),
      due: isoDate(d.order.date), amount: (d.order.amount != null ? Number(d.order.amount).toLocaleString('fr-FR') + ' FCFA' : '—'),
      state: d.quittance ? (d.quittance.conforme ? 'verifie' : 'recu_depose') : 'emis',
      receipts: d.quittance ? [{ date: isoDate(d.quittance.date || d.quittance.uploaded), file: { name: d.quittance.scan || d.quittance.numero }, verifiedBy: d.quittance.conforme ? 'Régie' : null, verifiedOn: isoDate(d.quittance.date) }] : []
    }));
  }

  function mapNotifs(store, role) {
    const email = (typeof cfEmail === 'function' && cfEmail()) || '';
    return (store.notifications || []).filter(n => {
      if (n.roles && n.roles.indexOf(role) >= 0) return true;
      if (email && n.to && String(n.to).toLowerCase() === String(email).toLowerCase()) return true;
      return false;
    }).map(n => ({
      id: n.id, aud: 'service', type: n.kind || 'transmission', title: n.title || n.text, msg: n.text,
      date: isoDate(n.date), time: n.time || '09:00', read: !!n.read, ref: n.ref || '', href: n.page ? '#/' + n.page : ''
    }));
  }

  function mapAudit(store) {
    return (store.journal || []).map(j => ({
      id: j.id, date: isoDate(j.date), time: '09:00', actor: j.actor || '', role: '', action: j.action || '', ref: '', kind: 'info'
    }));
  }

  function mapStock(store) {
    const st = store.stock || {};
    return [
      { id: 'st-or', item: 'or', label: 'Médaille Or', available: Number(st.Or || 0), reserved: 0, threshold: 30 },
      { id: 'st-argent', item: 'argent', label: 'Médaille Argent', available: Number(st.Argent || 0), reserved: 0, threshold: 40 },
      { id: 'st-bronze', item: 'bronze', label: 'Médaille Bronze', available: Number(st.Bronze || 0), reserved: 0, threshold: 60 },
      { id: 'st-diplome', item: 'diplome', label: 'Diplôme de distinction', available: 0, reserved: 0, threshold: 100 }
    ];
  }

  function mapWithdrawals(store, refs) {
    return (store.withdrawals || []).map(w => {
      let dossierRef = w.dossier;
      if (!dossierRef && w.cni) {
        const hit = (store.dossiers || []).find(d => (d.recipients || []).some(r => r.cni === w.cni));
        if (hit) dossierRef = hit.ref;
      }
      return {
        id: w.id, dossier: dossierRef || w.tracking || '', recipients: [], date: isoDate(w.date),
        state: w.status === 'en attente' ? 'demande' : (w.status || 'demande'),
        requester: ((w.retirantPrenom || '') + ' ' + (w.retirantNom || w.nom || '')).trim(),
        justification: w.motif || '', history: []
      };
    }).filter(w => {
      if (!w.dossier) return false;
      const d = (store.dossiers || []).find(x => x.ref === w.dossier || x.id === w.dossier);
      return !d || refs.has(d.id) || refs.has(d.ref);
    });
  }

  function mapDts(dossiers) {
    const out = [];
    dossiers.forEach(d => {
      (d.recipients || []).forEach(r => {
        out.push({ id: 'DTS-' + r.id, dossier: d.ref, recipient: r.id, state: 'saisi' });
      });
    });
    return out;
  }

  function visibleRefs(role) {
    const list = typeof cfVisibleDossiers === 'function' ? cfVisibleDossiers(role) : ((typeof cfS === 'function' ? cfS().dossiers : []) || []);
    const ids = new Set();
    list.forEach(d => { ids.add(d.id); ids.add(d.ref); });
    return { list: list, ids: ids };
  }

  function buildState(role) {
    const roleKey = goRoleKey(role);
    const state = emptyState(roleKey);
    const store = typeof cfS === 'function' ? cfS() : { dossiers: [], documents: [], mails: [], ceremonies: [], notifications: [], journal: [], stock: {}, withdrawals: [] };
    const vis = visibleRefs(role);
    vis.list.forEach(d => state.dossiers.push(mapDossier(d, role)));
    const idSet = new Set(vis.list.map(d => d.id));
    state.documents = mapDocuments(store, idSet);
    state.transmissions = mapTransmissions(store, idSet, role);
    state.ceremonies = mapCeremonies(store, idSet);
    state.complements = mapComplements(store, idSet);
    state.recours = mapRecours(store, idSet);
    state.controls = mapControls(store, idSet);
    state.receiptOrders = mapOrders(store, idSet);
    state.notifications = mapNotifs(store, role);
    state.audit = mapAudit(store);
    state.stock = mapStock(store);
    state.withdrawals = mapWithdrawals(store, idSet);
    state.dts = mapDts(state.dossiers);
    state.accounts = (store.users || []).map(u => ({
      id: u.id, user: u.id, role: goRoleKey(u.role), state: u.actif === false ? 'inactif' : 'actif',
      created: '', last: u.last || '', scope: u.email || ''
    }));
    const u = typeof cfUser === 'function' ? cfUser() : null;
    if (role === 'recipient' || role === 'recipiendaire') {
      const recs = [];
      vis.list.forEach(d => (d.recipients || []).forEach(r => {
        if (u && u.cni && r.cni && r.cni !== u.cni) return;
        if (u && !u.cni && (r.nom !== u.nom || r.prenom !== u.prenom)) return;
        recs.push({ d: d, r: r });
      }));
      const first = recs[0];
      state.person = {
        ids: recs.map(x => x.r.id),
        nom: (u && u.nom) || (first && first.r.nom) || '',
        prenom: (u && u.prenom) || (first && first.r.prenom) || '',
        fonction: (first && (first.r.poste || first.r.fonction)) || '',
        org: first ? (first.d.applicantId || '') : '',
        entree: first ? isoDate(first.r.start) : ''
      };
      state.distinctions = recs.filter(x => x.r.granted || x.r.rstatus === 'VALIDE' || x.r.remis).map(x => ({
        id: x.r.id, person: x.r.id, dossier: x.d.ref, medal: medalId(x.r.granted || x.r.metal),
        year: x.d.campaign || '2026', state: x.r.remis ? 'remise' : 'attribue',
        date: isoDate(x.d.approved || x.d.submitted), ceremony: '', venue: ''
      }));
    }
    return state;
  }

  function patchScope() {
    if (!GO) return;
    GO.myDossiers = function () { return (GO.S && GO.S.dossiers) || []; };
    GO.myDocs = function () { return (GO.S && GO.S.documents) || []; };
    GO.myCers = function () { return (GO.S && GO.S.ceremonies) || []; };
    GO.myDts = function () { return (GO.S && GO.S.dts) || []; };
    GO.myNotifs = function () { return (GO.S && GO.S.notifications) || []; };
    GO.myTransmissions = function () { return (GO.S && GO.S.transmissions) || []; };
    GO.myAudit = function () { return (GO.S && GO.S.audit) || []; };
    GO.myReceiptOrders = function () { return (GO.S && GO.S.receiptOrders) || []; };
    GO.myRemises = function () { return (GO.S && GO.S.remises) || []; };
    GO.myWithdrawals = function () { return (GO.S && GO.S.withdrawals) || []; };
    GO.myControls = function () { return (GO.S && GO.S.controls) || []; };
    GO.myRecours = function () { return (GO.S && GO.S.recours) || []; };
    GO.myComplements = function () { return (GO.S && GO.S.complements) || []; };
    GO.myRelances = function () { return (GO.S && GO.S.relances) || []; };
  }

  function patchOrg() {
    if (!window.GO || GO._orgPatched) return;
    const orig = GO.org.bind(GO);
    GO.org = function (id) {
      const o = orig(id);
      if (o) return o;
      return { id: id || '—', name: String(id || '—'), short: String(id || '—'), type: '—', sector: '—', city: '—', contact: '—', contactRole: '—', email: '', phone: '' };
    };
    const origAuth = GO.authority.bind(GO);
    GO.authority = function (id) {
      return origAuth(id) || { id: id || 'dr', label: 'Direction régionale du Travail', short: 'DR', kind: 'Direction régionale' };
    };
    const origVen = GO.venue.bind(GO);
    GO.venue = function (id) {
      return origVen(id) || { id: id || 'v0', name: 'Libreville', city: 'Libreville', address: 'Libreville' };
    };
    GO._orgPatched = true;
  }

  function patchCan() {
    if (!window.GO) return;
    GO.can = function (key) {
      const role = frontRole();
      const may = (a) => typeof ipMay !== 'function' || ipMay(role, a);
      switch (key) {
        case 'create': return ['demandeur', 'secretariat_ministre', 'secretariat_dgt', 'secretariat_dr'].indexOf(role) >= 0;
        case 'instruct': return may('start-study');
        case 'verify': return may('rec-ok');
        case 'complement': return may('rec-ok');
        case 'relance': return ['service_agent', 'service_chef', 'ministre', 'dgt', 'dr'].indexOf(role) >= 0;
        case 'note': return may('finish-instr');
        case 'visa': return may('visa-doc') && role === 'service_chef';
        case 'transmit': return role === 'service_chef';
        case 'recette': return may('issue-order');
        case 'decide': return may('approve');
        case 'avis': return may('cascade');
        case 'recours': return may('recours-ok') || role === 'demandeur';
        case 'control': return may('flag-anomaly');
        case 'flag': return may('flag-anomaly');
        case 'observe': return role !== 'admin';
        case 'propose': return role === 'demandeur' || role === 'service_chef';
        case 'valider_ceremonie': return may('val-date') || may('cer-ok');
        case 'coordinate': return role === 'service_chef';
        case 'remise': return may('do-remise');
        case 'retrait': return role === 'recipient' || role === 'recipiendaire';
        case 'retrait_traitement': return may('wd-ok');
        case 'paiement_verif': return role === 'regisseur';
        case 'verify_recip': return may('rec-ok') || may('flag-anomaly');
        case 'deposer_recu': return role === 'demandeur';
        case 'receive':
        case 'register':
        case 'route':
        case 'classify': return typeof cfIsSec === 'function' && cfIsSec(role);
        case 'admin': return role === 'admin';
        case 'stock': return role === 'regisseur';
        case 'answer': return role === 'demandeur';
        default: return false;
      }
    };
  }

  function patchConfirm() {
    if (!window.GO) return;
    GO.confirmDialog = function (o) {
      o = o || {};
      return new Promise(function (resolve) {
        const host = document.createElement ? document.createElement('div') : null;
        if (!host || !document.body || !document.body.appendChild) { resolve(false); return; }
        host.className = 'cf-confirm-bar go-confirm-overlay';
        host.setAttribute('role', 'status');
        const check = o.check ? `<label class="check"><input type="checkbox" id="go-confirm-check"> <span>${GO.esc(o.check)}</span></label>` : '';
        host.innerHTML = `<span><strong>${GO.esc(o.title || 'Confirmation requise')}</strong> ${o.message || ''}</span>
          ${check}
          <span class="cf-confirm-actions">
            <button type="button" class="cf-btn cf-btn-ghost" data-go-c="no">${GO.esc(o.cancel || 'Annuler')}</button>
            <button type="button" class="cf-btn cf-accent" data-go-c="yes"${o.check ? ' disabled' : ''}>${GO.esc(o.confirm || 'Confirmer')}</button>
          </span>`;
        document.body.appendChild(host);
        const yes = host.querySelector('[data-go-c="yes"]');
        const box = host.querySelector('#go-confirm-check');
        if (box && yes) box.addEventListener('change', function () { yes.disabled = !box.checked; });
        host.addEventListener('click', function (e) {
          const b = e.target.closest('[data-go-c]');
          if (!b) return;
          host.remove();
          resolve(b.getAttribute('data-go-c') === 'yes');
        });
      });
    };
  }

  function patchActions() {
    if (!window.GO || !GO.dossierActions || GO.dossierActions._frontii) return;
    const A = GO.dossierActions;
    ['instruct', 'complement', 'decide', 'recette', 'control', 'relance', 'transmit', 'note', 'verify', 'answer'].forEach(name => {
      const orig = A[name];
      if (typeof orig !== 'function') return;
      A[name] = async function (d, btn) {
        const need = { instruct: 'instruct', complement: 'complement', decide: 'decide', recette: 'recette', control: 'control', relance: 'relance', transmit: 'transmit', note: 'note', verify: 'verify', answer: 'answer' }[name];
        if (need && !GO.can(need)) {
          GO.toast('error', 'Action non autorisée', 'Ce profil ne peut pas effectuer cet acte.');
          return;
        }
        await orig.call(this, d, btn);
        persistAct(name, d);
      };
    });
    A._frontii = true;
  }

  function persistAct(name, d) {
    if (!d || !d._cfId) return;
    const id = d._cfId;
    try {
      if (typeof cfSnapshot === 'function') cfSnapshot();
      if (name === 'instruct' && typeof cfStartStudy === 'function') cfStartStudy(id);
      if (name === 'complement' && typeof cfAskComplement === 'function') {
        const last = (GO.complementOf && GO.complementOf(d.ref)) || {};
        cfAskComplement(id, null, last.items || 'Complément demandé');
      }
      if (name === 'decide') {
        if (d.status === 'approuve' && typeof cfApprove === 'function') cfApprove(id);
        if (d.status === 'refuse' && typeof cfReject === 'function') cfReject(id, d.rejectMotif || 'Refus motivé');
      }
      if (name === 'recette' && typeof cfIssueOrder === 'function') cfIssueOrder(id);
      if (name === 'control' && typeof cfFlagAnomaly === 'function') {
        const ctl = GO.controlOf && GO.controlOf(d.ref);
        const finding = ctl && ctl.findings && ctl.findings[0];
        if (finding) cfFlagAnomaly(id, null, finding.label);
      }
      if (name === 'answer' && typeof cfAnswerComplement === 'function') {
        const store = cfS();
        const cd = store.dossiers.find(x => x.id === id);
        const open = cd && (cd.complements || []).find(c => c.status === 'ouvert');
        if (open) cfAnswerComplement(id, open.id, 'Réponse déposée', '');
      }
    } catch (e) { /* mutation FrontII optionnelle */ }
  }

  function clearProtoSeed() {
    const D = window.GO_DATA;
    if (!D) return;
    D.seed = emptyState('chef');
    delete D.seed.role;
    delete D.seed.prefs;
    delete D.seed.version;
  }

  function hydrate(role) {
    if (!window.GO || typeof GO.hydrate !== 'function') return null;
    patchOrg();
    patchCan();
    patchConfirm();
    patchSetHash();
    patchScope();
    const resolved = role || frontRole();
    GO._frontRole = resolved;
    if (typeof cfState !== 'undefined') cfState.spaceRole = resolved;
    const state = buildState(resolved);
    GO.hydrate(state);
    GO.allowRoleSwitch = false;
    patchActions();
    GO.onSave = function () { /* l’état métier vit dans dn.cf.store.v1 */ };
    return state;
  }

  function noopEl() {
    const el = {
      innerHTML: '', textContent: '', value: '', hidden: false, disabled: false, isConnected: false,
      classList: { add: function () {}, remove: function () {}, toggle: function () {}, contains: function () { return false; } },
      style: { setProperty: function () {} }, dataset: {},
      addEventListener: function () {}, removeEventListener: function () {},
      setAttribute: function () {}, getAttribute: function () { return null; }, removeAttribute: function () {},
      querySelector: function () { return el; }, querySelectorAll: function () { return []; },
      closest: function () { return null; }, focus: function () {}, click: function () {},
      appendChild: function () { return el; }, getBoundingClientRect: function () { return { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 }; },
      offsetWidth: 960, clientWidth: 960, offsetHeight: 400, offsetLeft: 0, offsetParent: {}, scrollTop: 0
    };
    return el;
  }

  function fakeMain() {
    let html = '';
    const nodes = {};
    function nodeFor(sel) {
      const key = String(sel || '*');
      if (!nodes[key]) nodes[key] = noopEl();
      return nodes[key];
    }
    return {
      _nodes: nodes,
      set innerHTML(v) { html = String(v == null ? '' : v); this._html = html; },
      get innerHTML() { return this._html || html; },
      querySelector: function (sel) { return nodeFor(sel); },
      querySelectorAll: function () { return []; },
      addEventListener: function () {},
      setAttribute: function () {},
      removeAttribute: function () {},
      classList: { add: function () {}, remove: function () {}, toggle: function () {}, contains: function () { return false; } },
      offsetWidth: 960, clientWidth: 960
    };
  }

  function viewFor(role, page) {
    if (!page || SKIP_PAGES[page]) return null;
    if (page === 'new-dossier' || page === 'nouveau') {
      var createRole = goRoleKey(role);
      var createSpec = window.GO && GO.D && GO.D.roles && GO.D.roles[createRole];
      return createSpec && createSpec.can && createSpec.can.create ? 'nouveau' : null;
    }
    if (page === 'profile' || page === 'profil') return 'profil';
    if (page === 'orders' && role === 'regisseur') return 'stock';
    if (page === 'distinctions' && role === 'demandeur') return 'beneficiaires';
    var view = PAGE_TO_VIEW[page] || null;
    if (!view) return null;
    var key = goRoleKey(role);
    var spec = window.GO && GO.D && GO.D.roles && GO.D.roles[key];
    var allowed = spec && spec.views;
    if (allowed && allowed.length && view !== 'nouveau' && view !== 'profil' && allowed.indexOf(view) < 0) return null;
    return view;
  }

  function goHasView(role, page) {
    const v = viewFor(role, page);
    return !!(v && window.GO && GO.views && GO.views[v] && typeof GO.views[v].render === 'function');
  }

  function capture(view, route) {
    if (GO && typeof GO.resetMissing === 'function') GO.resetMissing();
    const main = fakeMain();
    try {
      GO.views[view].render(main, route);
    } catch (err) {
      if (typeof console !== 'undefined' && console.warn) console.warn('GO.' + view, err && err.message);
    }
    let html = main.innerHTML || '';
    function addBag(bag) {
      if (!bag) return;
      Object.keys(bag).forEach(k => {
        const n = bag[k];
        if (n && n.innerHTML) html += n.innerHTML;
      });
    }
    addBag(main._nodes);
    if (GO && typeof GO.dumpMissing === 'function') addBag(GO.dumpMissing());
    return html;
  }

  function routeOf(view, page) {
    return { view: view, id: null, params: typeof URLSearchParams === 'function' ? new URLSearchParams() : { get: function () { return null; } }, raw: view };
  }

  function legalNote(role, page) {
    if (role === 'service_chef' && (page === 'overview' || page === 'orders' || page === 'stats')) {
      return '<p class="go-legal-note">L’ordre de recette n’est pas un paiement. Le paiement s’effectue au Trésor.</p>';
    }
    if (role === 'service_inspecteur' && (page === 'instruction' || page === 'controle' || page === 'overview')) {
      return '<p class="go-legal-note">L’inspecteur signale une anomalie ; il ne valide pas une médaille.</p>';
    }
    return '';
  }

  function goRenderPage(role, page) {
    if (typeof window.GO === 'undefined' || !GO.views) return null;
    const view = viewFor(role, page);
    if (!view || !GO.views[view] || typeof GO.views[view].render !== 'function') return null;
    hydrate(role);
    const html = capture(view, routeOf(view, page));
    return html + legalNote(role, page);
  }

  function mountLive(role, page) {
    const el = typeof document !== 'undefined' && document.getElementById && (document.getElementById('view') || document.getElementById('go-view'));
    if (!el || !window.GO || !GO.views) return;
    const view = el.getAttribute('data-go-view') || viewFor(role, page);
    if (!view || !GO.views[view]) return;
    hydrate(role);
    if (typeof GO.setCurrent === 'function') GO.setCurrent(routeOf(view, page));
    try {
      GO.views[view].render(el, routeOf(view, page));
      if (typeof GO.reveal === 'function') GO.reveal(el);
    } catch (err) {
      if (typeof console !== 'undefined' && console.warn) console.warn('GO mount', view, err);
    }
    rewriteLinks(el, role);
    rememberAppHash();
  }

  function workspacePage(view, role) {
    if (view === 'nouveau') return 'new-dossier';
    if (view === 'apercu') return 'overview';
    if (view === 'beneficiaires') return 'recipients';
    if (view === 'statistiques') return 'stats';
    if (view === 'recettes') return role === 'demandeur' ? 'payments' : 'orders';
    if (view === 'transmissions') return 'inbox';
    if (view === 'courriers') return 'documents';
    if (view === 'administration') return 'users';
    if (view === 'decisions') return 'decisions';
    if (view === 'controle') return 'controle';
    if (view === 'profil') return 'profile';
    return view;
  }

  function rewriteLinks(root, role) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('a[href^="#/"]').forEach(a => {
      const href = a.getAttribute('href') || '';
      const parts = href.replace(/^#\//, '').split('?')[0].split('/');
      const view = parts[0];
      const id = parts[1];
      if (view === 'nouveau') {
        a.setAttribute('href', typeof workspacePath === 'function' ? workspacePath(role, 'new-dossier') : '/profil/' + role + '/new-dossier/');
        return;
      }
      const page = workspacePage(view, role);
      const path = typeof workspacePath === 'function' ? workspacePath(role, page) : '/profil/' + role + '/' + page + '/';
      const current = typeof parseWorkspacePath === 'function' ? parseWorkspacePath(window.location.pathname) : null;
      // Un dossier précis reste un état de la page « dossiers » : on garde
      // l'URL de la page et on ouvre le tiroir sans quitter le document.
      if (id && current && current.family && page === current.page && (view === 'dossiers' || view === 'courriers' || view === 'ceremonies')) {
        a.setAttribute('href', path);
        a.setAttribute('data-go-ref', id);
        return;
      }
      a.setAttribute('href', path);
      if (id && (view === 'dossiers' || view === 'courriers' || view === 'ceremonies')) a.setAttribute('data-go-ref', id);
    });
  }

  function rememberAppHash() {
    const h = (g.location && g.location.hash) || '';
    if (h.indexOf('#/app/') === 0) g.__goLastAppHash = h;
  }

  function liveRole() {
    if (window.GO && GO._frontRole) return GO._frontRole;
    if (typeof cfState !== 'undefined' && cfState.spaceRole) return cfState.spaceRole;
    const fromLast = g.__goLastAppHash && typeof parseWorkspacePath === 'function'
      ? parseWorkspacePath(String(g.__goLastAppHash).replace(/^#/, '')) : null;
    return (fromLast && fromLast.role) || '';
  }

  function protoTarget(hash, role) {
    const h = String(hash || '');
    const m = /^#\/([a-z0-9_-]+)(?:\/([^/?]*))?(?:\?(.*))?$/i.exec(h);
    if (!m || !role) return null;
    return { view: m[1], id: m[2] || null, query: m[3] || '' };
  }

  function protoToAppHash(hash, role) {
    const target = protoTarget(hash, role);
    if (!target) return hash;
    const page = workspacePage(target.view, role);
    const path = typeof workspacePath === 'function' ? workspacePath(role, page) : '/profil/' + role + '/' + page + '/';
    return path;
  }

  function patchSetHash() {
    if (!window.GO || typeof GO.setHash !== 'function' || GO.setHash._frontii) return;
    const orig = GO.setHash;
    GO.setHash = function (hash) {
      const role = liveRole();
      const target = protoTarget(hash, role);
      if (!target || !role) { orig(hash); return; }
      const page = workspacePage(target.view, role);
      const current = typeof parseWorkspacePath === 'function' ? parseWorkspacePath(window.location.pathname) : null;
      const samePage = current && current.family && page === current.page;
      if (!samePage) {
        // Changement de page métier : navigation réelle. La référence du
        // dossier est conservée dans l'URL (?ref=…) pour être rouverte
        // au chargement de la page cible.
        const base = typeof workspacePath === 'function' ? workspacePath(role, page) : '/';
        g.location.assign(target.id ? base + '?ref=' + encodeURIComponent(target.id) : base);
        return;
      }
      // Sous-état d'une même page : paramètre d'URL, sans rechargement.
      const params = typeof URLSearchParams === 'function' ? new URLSearchParams(target.query || '') : null;
      if (target.id) params && params.set('ref', target.id);
      const qs = params ? params.toString() : '';
      try {
        g.history.replaceState(null, '', g.location.pathname + (qs ? '?' + qs : ''));
      } catch (e) { /* état interne seulement */ }
      rememberAppHash();
    };
    GO.setHash._frontii = true;
  }

  function openProtoTarget(view, id) {
    const role = liveRole();
    if (!role || !id || !window.GO || !GO.views) return;
    hydrate(role);
    patchSetHash();
    const params = typeof URLSearchParams === 'function' ? new URLSearchParams() : { get: function () { return null; } };
    if (view === 'dossiers' && GO.views.dossiers && typeof GO.views.dossiers.update === 'function') {
      GO.views.dossiers.update({ view: 'dossiers', id: id, params: params });
      return;
    }
    if ((view === 'courriers' || view === 'documents') && GO.views.courriers && typeof GO.views.courriers.update === 'function') {
      GO.views.courriers.update({ view: 'courriers', id: id, params: params });
    }
  }

  function interceptHash() {
    if (g.__goHashBound) return;
    g.__goHashBound = true;
    rememberAppHash();
    patchSetHash();
    g.addEventListener('hashchange', function () {
      const h = (g.location && g.location.hash) || '';
      if (!h || h === '#' || h === '#/') return;
      if (h.indexOf('#/login') === 0 || h.indexOf('#/register') === 0) {
        g.location.assign(h.indexOf('#/register') === 0 ? '/inscription/' : '/connexion/');
        return;
      }
      if (h.indexOf('#/app/') === 0) { rememberAppHash(); return; }
      const target = protoTarget(h, liveRole());
      const role = liveRole();
      if (!target || !role) return;
      const page = workspacePage(target.view, role);
      const current = typeof parseWorkspacePath === 'function' ? parseWorkspacePath(g.location.pathname) : null;
      if (current && current.family && page === current.page) {
        if (target.id && (target.view === 'dossiers' || target.view === 'courriers' || target.view === 'documents')) openProtoTarget(target.view, target.id);
        try { g.history.replaceState(null, '', g.location.pathname + (target.id ? '?ref=' + encodeURIComponent(target.id) : '')); } catch (e) { /* ignore */ }
        return;
      }
      if (typeof cfGo === 'function') cfGo(role, page, target.id ? { ref: target.id } : null);
    }, true);
    if (typeof document !== 'undefined' && document.addEventListener && !g.__goRefBound) {
      g.__goRefBound = true;
      document.addEventListener('click', function (e) {
        const a = e.target && e.target.closest && e.target.closest('a[data-go-ref]');
        if (!a) return;
        const ref = a.getAttribute('data-go-ref');
        if (!ref) return;
        e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        openProtoTarget('dossiers', ref);
      }, true);
    }
  }

  function installHosts() {
    if (typeof document === 'undefined' || !document.body) return;
    if (!document.getElementById('toasts')) {
      const t = document.createElement('div'); t.id = 'toasts'; t.className = 'go-toasts'; document.body.appendChild(t);
    }
    if (!document.getElementById('tip')) {
      const tip = document.createElement('div'); tip.id = 'tip'; tip.hidden = true; tip.className = 'go-tip'; document.body.appendChild(tip);
    }
  }

  clearProtoSeed();
  patchOrg();
  patchCan();
  patchConfirm();
  interceptHash();

  function expose(name, fn) {
    g[name] = fn;
    try { if (typeof globalThis !== 'undefined') globalThis[name] = fn; } catch (e) { /* ignore */ }
  }
  expose('goRenderPage', goRenderPage);
  expose('goMountLive', mountLive);
  expose('goHasView', goHasView);
  expose('goViewFor', viewFor);
  expose('goHydrate', hydrate);
  expose('goInstallHosts', installHosts);
  expose('goPage', function (role, page) { return goRenderPage(role, page); });
  expose('goOpenRef', openProtoTarget);
  expose('goPageFor', workspacePage);
})(typeof window !== 'undefined' ? window : globalThis);
