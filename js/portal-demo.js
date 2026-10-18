/* Jeu de données LOCAL de présentation : jamais une réponse d'API ni une session.
   Activation limitée à file://, localhost et l'aperçu Arena sans endpoint auth.
   Les valeurs sont synthétiques et n'ont aucune valeur administrative. */
const PRESENTATION_MODE = !AUTH_ENDPOINT && window.DN_PRESENTATION_MODE !== false && (
  window.DN_PRESENTATION_MODE === true || window.location.protocol === 'file:' ||
  ['localhost','127.0.0.1'].includes(window.location.hostname) ||
  /\.e2b\.app$/.test(window.location.hostname)
);
const PRESENTATION_KEY = 'dn.presentation.profile';
const DEMO_OTP_CODE = '246810';

/** Rôles admis en mode présentation : tous les 13 rôles. */
const PRESENTATION_ROLES = [
  'demandeur','recipient',
  'secretariat_ministre','secretariat_dgt','secretariat_dr',
  'ministre','dgt','dr',
  'service_agent','service_inspecteur','service_chef',
  'regisseur','admin',
];
function presentationProfile() {
  if (!PRESENTATION_MODE || getSession()) return null;
  try {
    const role = window.sessionStorage.getItem(PRESENTATION_KEY);
    return PRESENTATION_ROLES.includes(role) ? role : null;
  } catch { return null; }
}
function enterPresentation(role, email) {
  if (!PRESENTATION_MODE || getSession() || !PRESENTATION_ROLES.includes(role)) return false;
  try {
    window.sessionStorage.setItem(PRESENTATION_KEY, role);
    if (email) window.sessionStorage.setItem('dn.presentation.email', email);
    else if (role === 'demandeur') window.sessionStorage.setItem('dn.presentation.email', 'demo.entreprise@example.test');
    else window.sessionStorage.removeItem('dn.presentation.email');
  } catch { /* session non persistante */ }
  try { if (email) window.__demoEmail = email; } catch {}
  return true;
}
function leavePresentation() { try { window.sessionStorage.removeItem(PRESENTATION_KEY); window.sessionStorage.removeItem('dn.presentation.email'); } catch {} }

const PORTAL_DEMO = {
  enterprise: {
    profile: { raison:'Société Gabonaise des Infrastructures', sigle:'SGI', secteur:'BTP et infrastructures', nif:'NIF-DEMO-SGI-001', forme:'SA', structure:'Organisation privée', province:'Estuaire', departement:'Komo-Mondah', ville:'Libreville', rccm:'RCCM-DEMO-001', cnss:'CNSS-DEMO-001', adresse:'Libreville, Estuaire', telephone:'+241 00 00 00 00', email:'sgi@example.invalid', estReconnu:true, created:'12/01/2024', updated:null },
    dossiers: [
      { ref:'DNG-DEMO-2026-041', campaign:'2026', date:'10/09/2026', status:'En instruction', next:'Instruction en cours', initial:'Direction Générale du Travail', recipients:['Alain Moussavou','Nadia Nguema','Sarah Esono'], requested:['Bronze','Argent','Or'], validated:[], steps:['Soumis','En transmission','En instruction'], history:[['10/09/2026','Soumis'],['18/09/2026','En transmission'],['26/09/2026','En instruction']], pieces:['Courrier d’initiation','Liste des récipiendaires','DTS'], ceremony:null, order:null },
      { ref:'DNG-DEMO-2026-023', campaign:'2026', date:'14/06/2026', status:'Complément demandé', next:'Justificatif à fournir pour Alain Moussavou', initial:'Direction Régionale du Travail — Estuaire', recipients:['Nadia Nguema','Alain Moussavou'], requested:['Bronze','Argent'], validated:[], steps:['Soumis','En transmission','En instruction','Complément demandé'], history:[['14/06/2026','Soumis'],['28/06/2026','En transmission'],['16/07/2026','En instruction'],['22/09/2026','Complément demandé']], pieces:['Courrier d’initiation','Liste des récipiendaires','DTS'], ceremony:null, order:null },
      { ref:'DNG-DEMO-2026-008', campaign:'2026', date:'08/02/2026', status:'Ordre de recette émis', next:'Présenter la quittance au Régisseur', initial:'Direction Générale du Travail', recipients:['Alain Moussavou','Sarah Esono'], requested:['Or','Argent'], validated:['Alain Moussavou — Or','Sarah Esono — Argent'], steps:['Soumis','En transmission','En instruction','Approuvé','Ordre de recette émis'], history:[['08/02/2026','Soumis'],['25/02/2026','En transmission'],['17/03/2026','En instruction'],['10/05/2026','Approuvé'],['02/07/2026','Ordre de recette émis']], pieces:['Courrier d’initiation','Liste des récipiendaires','DTS','Décision communiquée'], ceremony:'CER-DEMO-2026-008', order:'OR-DEMO-2026-008' },
      { ref:'DNG-DEMO-2025-012', campaign:'2025', date:'10/04/2025', status:'Cérémonie terminée', next:null, initial:'Direction Générale du Travail', recipients:['Alain Moussavou','Sarah Esono','Luc Ondo'], requested:['Bronze','Argent','Or'], validated:['Alain Moussavou — Bronze','Sarah Esono — Argent','Luc Ondo — Or'], steps:['Soumis','En transmission','En instruction','Approuvé','Ordre de recette émis','Cérémonie terminée'], history:[['10/04/2025','Soumis'],['19/04/2025','En transmission'],['13/05/2025','En instruction'],['04/07/2025','Approuvé'],['02/09/2025','Ordre de recette émis'],['14/12/2025','Cérémonie terminée']], pieces:['Courrier d’initiation','Liste des récipiendaires','DTS','Quittance'], ceremony:'CER-DEMO-2025-012', order:'OR-DEMO-2025-012' },
      { ref:'DNG-DEMO-2024-005', campaign:'2024', date:'08/03/2024', status:'Cérémonie terminée', next:null, initial:'Direction Régionale du Travail — Estuaire', recipients:['Nadia Nguema','Imelda Nziengui'], requested:['Bronze','Argent'], validated:['Nadia Nguema — Bronze','Imelda Nziengui — Argent'], steps:['Soumis','En transmission','En instruction','Approuvé','Ordre de recette émis','Cérémonie terminée'], history:[['08/03/2024','Soumis'],['20/03/2024','En transmission'],['18/04/2024','En instruction'],['02/07/2024','Approuvé'],['15/08/2024','Ordre de recette émis'],['16/12/2024','Cérémonie terminée']], pieces:['Courrier d’initiation','Liste des récipiendaires','DTS','Quittance'], ceremony:'CER-DEMO-2024-005', order:'OR-DEMO-2024-005' },
    ],
    employees: [
      { name:'Alain Moussavou', job:'Technicien supérieur', start:'12/01/2018', end:null, status:'ACTIF' },
      { name:'Nadia Nguema', job:'Cheffe de projet', start:'03/05/2016', end:null, status:'ACTIF' },
      { name:'Imelda Nziengui', job:'Chargée d’études', start:'04/02/2020', end:null, status:'ACTIF' },
      { name:'Sarah Esono', job:'Responsable RH', start:'06/04/2014', end:null, status:'ACTIF' },
      { name:'Luc Ondo', job:'Conducteur de travaux', start:'13/03/2011', end:'30/06/2026', status:'TERMINE' },
    ],
    awards: [
      { name:'Alain Moussavou', medal:'Bronze', campaign:'2025', date:'14/12/2025', employer:'SGI', dossier:'DNG-DEMO-2025-012' },
      { name:'Sarah Esono', medal:'Argent', campaign:'2025', date:'14/12/2025', employer:'SGI', dossier:'DNG-DEMO-2025-012' },
      { name:'Luc Ondo', medal:'Or', campaign:'2025', date:'14/12/2025', employer:'SGI', dossier:'DNG-DEMO-2025-012' },
      { name:'Nadia Nguema', medal:'Bronze', campaign:'2024', date:'16/12/2024', employer:'SGI', dossier:'DNG-DEMO-2024-005' },
      { name:'Imelda Nziengui', medal:'Argent', campaign:'2024', date:'16/12/2024', employer:'SGI', dossier:'DNG-DEMO-2024-005' },
    ],
    orders: [
      { ref:'OR-DEMO-2026-008', dossier:'DNG-DEMO-2026-008', campaign:'2026', amount:42000, date:'02/07/2026', state:'Paiement enregistré', paid:'18/07/2026', receipt:'QUI-DEMO-2026-008' },
      { ref:'OR-DEMO-2025-012', dossier:'DNG-DEMO-2025-012', campaign:'2025', amount:56000, date:'02/09/2025', state:'Quittance disponible', paid:'18/09/2025', receipt:'QUI-DEMO-2025-012' },
      { ref:'OR-DEMO-2024-005', dossier:'DNG-DEMO-2024-005', campaign:'2024', amount:32000, date:'15/08/2024', state:'Quittance disponible', paid:'30/08/2024', receipt:'QUI-DEMO-2024-005' },
    ],
    ceremonies: [
      { id:'CER-DEMO-2026-008', date:'18/11/2026', place:'Libreville — Salle des conférences', status:'Confirmée', period:'future', dossier:'DNG-DEMO-2026-008', person:'Alain Moussavou', medal:'Or', presence:null },
      { id:'CER-DEMO-2025-012', date:'14/12/2025', place:'Libreville — Hôtel de ville', status:'Terminée', period:'past', dossier:'DNG-DEMO-2025-012', person:'Alain Moussavou', medal:'Bronze', presence:'Présent' },
      { id:'CER-DEMO-2024-005', date:'16/12/2024', place:'Libreville — Salle municipale', status:'Terminée', period:'past', dossier:'DNG-DEMO-2024-005', person:'Nadia Nguema', medal:'Bronze', presence:null },
    ],
    notices: [
      { id:'E1', text:'Complément demandé pour DNG-DEMO-2026-023.', date:'22/09/2026', ref:'DNG-DEMO-2026-023', page:'dossiers' },
      { id:'E2', text:'DNG-DEMO-2026-041 reçu pour instruction.', date:'26/09/2026', ref:'DNG-DEMO-2026-041', page:'dossiers' },
      { id:'E3', text:'Cérémonie confirmée pour le 18 novembre 2026.', date:'02/10/2026', ref:'CER-DEMO-2026-008', page:'ceremonies' },
    ],
  },
  person: {
    profile: { nom:'Moussavou', prenom:'Alain', cni:'CNI-DEMO-ALAIN-001', nationalite:'Gabonaise', sexe:'Masculin', email:'alain.moussavou@example.invalid', created:'16/02/2024' },
    affiliations: [
      { company:'Société Gabonaise des Infrastructures', job:'Technicien supérieur', start:'12/01/2018', end:null, status:'ACTIF' },
      { company:'Ateliers du Komo', job:'Technicien', start:'10/03/2006', end:'31/12/2017', status:'TERMINE' },
    ],
    awards: [
      { name:'Alain Moussavou', medal:'Bronze', campaign:'2025', date:'14/12/2025', employer:'Société Gabonaise des Infrastructures', dossier:'DNG-DEMO-2025-012' },
      { name:'Alain Moussavou', medal:'Argent', campaign:'2016', date:'17/12/2016', employer:'Ateliers du Komo', dossier:null },
    ],
    ceremonies: [
      { id:'CER-DEMO-2026-008', date:'18/11/2026', place:'Libreville — Salle des conférences', status:'Confirmée', period:'future', dossier:null, person:'Alain Moussavou', medal:'Or', presence:null },
      { id:'CER-DEMO-2025-012', date:'14/12/2025', place:'Libreville — Hôtel de ville', status:'Terminée', period:'past', dossier:null, person:'Alain Moussavou', medal:'Bronze', presence:'Présent' },
    ],
    photos: [
      { id:'P-DEMO-01', date:'14/12/2025', medal:'Bronze', context:'Cérémonie de Libreville — emplacement illustratif ; aucune photographie personnelle fournie.', visual:'bronze' },
      { id:'P-DEMO-02', date:null, medal:null, context:'Image indisponible.', visual:null },
    ],
    actions: [
      { title:'Fournir une pièce complémentaire', context:'Demande liée au dossier DNG-DEMO-2026-023', detail:'Une justification individuelle est attendue. Transmission non disponible sans service connecté.', page:'actions' },
    ],
    notices: [
      { id:'P1', text:'Une invitation à la cérémonie du 18 novembre 2026 est disponible.', date:'02/10/2026', page:'ceremonies' },
      { id:'P2', text:'Une justification personnelle est demandée pour votre dossier.', date:'22/09/2026', page:'actions' },
      { id:'P3', text:'Votre distinction de bronze de 2025 figure dans votre historique.', date:'14/12/2025', page:'recipients' },
    ],
  },
  ministere: {
    profile: { sigle:'MIN.TRAVAIL', raison:'Ministère du Travail et de la Fonction publique', secteur:'Administration publique', nif:'NIF-DEMO-MIN-001', forme:'Administration', structure:'Administration publique', province:'Estuaire', departement:'Komo-Mondah', ville:'Libreville', adresse:'Boulevard Triomphal, Boulevard de l’Indépendance, Libreville', telephone:'+241 00 00 00 01', email:'demo.ministere@example.test', estReconnu:true, created:'01/01/2023', updated:null },
    dossiers: [
      { ref:'DNG-DEMO-MIN-2026-002', campaign:'2026', date:'22/09/2026', status:'En instruction', next:'Avis hiérarchique attendu', initial:'Ministre', recipients:['Aimée Nzamba','Jean-Pierre Mbadinga','Lucie Eyenga'], requested:['Bronze','Argent','Or'], validated:[], steps:['Soumis','En transmission','En instruction'], history:[['22/09/2026','Soumis par ministère'],['24/09/2026','En transmission'],['30/09/2026','En instruction']], pieces:['Courrier d’initiation','Liste nominative','DTS'], ceremony:null, order:null },
      { ref:'DNG-DEMO-MIN-2025-005', campaign:'2025', date:'18/05/2025', status:'Cérémonie terminée', next:null, initial:'Ministre', recipients:['Aimée Nzamba','Jean-Pierre Mbadinga'], requested:['Argent','Or'], validated:['Aimée Nzamba — Argent','Jean-Pierre Mbadinga — Or'], steps:['Soumis','En transmission','En instruction','Approuvé','Cérémonie terminée'], history:[['18/05/2025','Soumis'],['29/05/2025','En transmission'],['11/07/2025','En instruction'],['02/09/2025','Approuvé'],['15/12/2025','Cérémonie terminée']], pieces:['Courrier d’initiation','Liste nominative','DTS'], ceremony:'CER-DEMO-MIN-2025-005', order:'OR-DEMO-MIN-2025-005' },
    ],
    employees: [
      { name:'Aimée Nzamba', job:'Directrice de la réglementation', start:'02/01/2012', end:null, status:'ACTIF' },
      { name:'Jean-Pierre Mbadinga', job:'Conseiller technique', start:'14/03/2009', end:null, status:'ACTIF' },
      { name:'Lucie Eyenga', job:'Chargée de mission', start:'06/09/2018', end:null, status:'ACTIF' },
    ],
    awards: [
      { name:'Aimée Nzamba', medal:'Argent', campaign:'2025', date:'15/12/2025', employer:'MIN.TRAVAIL', dossier:'DNG-DEMO-MIN-2025-005' },
      { name:'Jean-Pierre Mbadinga', medal:'Or', campaign:'2025', date:'15/12/2025', employer:'MIN.TRAVAIL', dossier:'DNG-DEMO-MIN-2025-005' },
    ],
    orders: [
      { ref:'OR-DEMO-MIN-2025-005', dossier:'DNG-DEMO-MIN-2025-005', campaign:'2025', amount:38000, date:'02/09/2025', state:'Quittance disponible', paid:'20/09/2025', receipt:'QUI-DEMO-MIN-2025-005' },
    ],
    ceremonies: [
      { id:'CER-DEMO-MIN-2025-005', date:'15/12/2025', place:'Libreville — Hôtel de ville', status:'Terminée', period:'past', dossier:'DNG-DEMO-MIN-2025-005', person:'Aimée Nzamba', medal:'Argent', presence:'Présent' },
    ],
    notices: [
      { id:'M1', text:'Dossier DNG-DEMO-MIN-2026-002 reçu pour instruction.', date:'30/09/2026', ref:'DNG-DEMO-MIN-2026-002', page:'dossiers' },
      { id:'M2', text:'Cérémonie ministérielle 2025 : cérémonie terminée.', date:'15/12/2025', ref:'CER-DEMO-MIN-2025-005', page:'ceremonies' },
    ],
  },
};

/* ==================================================================
   INTERNAL_DEMO — données locales pour les 11 rôles internes.

   Pour les rôles internes, le mode présentation utilise des données
   distinctes de PORTAL_DEMO. Aucune n'est réelle ni administrative.
   Le chargement reste local (PRESENTATION_MODE).
================================================================== */

/** @typedef {{ id: string, label: string, date: string, type: string, sender: string, reference: string, status: string, location: string, history: Array<[string,string]> }} InternalMail */
const INTERNAL_BOX = {
  secretariat_ministre: [
    { id:'B-MIN-001', label:'Dossier DNG-DEMO-2026-041', date:'26/09/2026', type:'Demande entrante', sender:'SGI', reference:'DNG-DEMO-2026-041', status:'À enregistrer', location:'Bureau 12 — étagère B', history:[['26/09/2026','Réception']] },
    { id:'B-MIN-002', label:'Dossier DNG-DEMO-MIN-2026-002', date:'30/09/2026', type:'Demande ministérielle', sender:'MIN.TRAVAIL', reference:'DNG-DEMO-MIN-2026-002', status:'À transmettre au Ministre', location:'Bureau 12 — étagère A', history:[['30/09/2026','Réception']] },
    { id:'B-MIN-003', label:'Courrier simple — invitation', date:'02/10/2026', type:'Courrier simple', sender:'Présidence', reference:'PRES-2026-1014', status:'Classé', location:'Archives — armoire 1', history:[['02/10/2026','Réception'],['03/10/2026','Classé']] },
  ],
  secretariat_dgt: [
    { id:'B-DGT-001', label:'Dossier DNG-DEMO-2026-008', date:'25/02/2026', type:'Demande entrante', sender:'SGI', reference:'DNG-DEMO-2026-008', status:'Transmis à la DR', location:'Bureau 8 — boîte 3', history:[['25/02/2026','Réception'],['27/02/2026','Transmis à la DR Estuaire']] },
    { id:'B-DGT-002', label:'Dossier DNG-DEMO-2025-012', date:'19/04/2025', type:'Demande entrante', sender:'SGI', reference:'DNG-DEMO-2025-012', status:'Classé', location:'Archives — carton 4', history:[['19/04/2025','Réception'],['13/05/2025','Instruction'],['15/12/2025','Cérémonie']] },
  ],
  secretariat_dr: [
    { id:'B-DR-001', label:'Dossier DNG-DEMO-2026-023', date:'28/06/2026', type:'Demande entrante', sender:'EFL', reference:'DNG-DEMO-2026-023', status:'À transmettre au Service', location:'Bureau 3 — étagère 1', history:[['28/06/2026','Réception']] },
    { id:'B-DR-002', label:'Dossier DNG-DEMO-2024-005', date:'20/03/2024', type:'Demande entrante', sender:'SGI', reference:'DNG-DEMO-2024-005', status:'Classé', location:'Archives — carton 2', history:[['20/03/2024','Réception'],['18/04/2024','Instruction'],['16/12/2024','Cérémonie']] },
  ],
  ministre: [
    { id:'MIN-001', label:'Avis sur DNG-DEMO-2026-041', date:'27/09/2026', type:'Demande d’avis', sender:'Secrétariat central', reference:'DNG-DEMO-2026-041', status:'À traiter', location:'—', history:[['27/09/2026','Réception']] },
    { id:'MIN-002', label:'Recours sur DNG-DEMO-2025-012', date:'20/01/2026', type:'Recours', sender:'SGI', reference:'DNG-DEMO-2025-012', status:'Traité', location:'—', history:[['20/01/2026','Réception'],['28/01/2026','Décision']] },
  ],
  dgt: [
    { id:'DGT-001', label:'Dossier DNG-DEMO-2026-008', date:'25/02/2026', type:'Dossier transmis', sender:'Secrétariat DGT', reference:'DNG-DEMO-2026-008', status:'Transmis à la DR', location:'—', history:[['25/02/2026','Réception'],['27/02/2026','Transmis à la DR Estuaire']] },
    { id:'DGT-002', label:'Recours sur DNG-DEMO-2024-005', date:'22/01/2025', type:'Recours', sender:'SGI', reference:'DNG-DEMO-2024-005', status:'Traité', location:'—', history:[['22/01/2025','Réception'],['30/01/2025','Décision']] },
  ],
  dr: [
    { id:'DR-001', label:'Dossier DNG-DEMO-2026-023', date:'28/06/2026', type:'Dossier transmis', sender:'Secrétariat DR', reference:'DNG-DEMO-2026-023', status:'À décider', location:'—', history:[['28/06/2026','Réception']] },
    { id:'DR-002', label:'Décision favorable DNG-DEMO-2025-01106', date:'04/03/2026', type:'Décision rendue', sender:'Service des Distinctions', reference:'DNG-2025-01106', status:'Traité', location:'—', history:[['04/03/2026','Décision']] },
  ],
  service_agent: [
    { id:'SAG-001', label:'Dossier DNG-DEMO-2026-041', date:'26/09/2026', type:'Dossier à instruire', sender:'Secrétariat', reference:'DNG-DEMO-2026-041', status:'À instruire', location:'—', history:[['26/09/2026','Réception']] },
    { id:'SAG-002', label:'Dossier DNG-DEMO-2026-008', date:'17/03/2026', type:'Dossier en cours', sender:'DGT', reference:'DNG-DEMO-2026-008', status:'Instruction en cours', location:'—', history:[['17/03/2026','Instruction'],['10/05/2026','Validation']] },
  ],
  service_inspecteur: [
    { id:'SI-001', label:'Dossier DNG-DEMO-2025-012 à contrôler', date:'13/12/2025', type:'Contrôle de routine', sender:'Service distinctions', reference:'DNG-DEMO-2025-012', status:'À contrôler', location:'—', history:[['13/12/2025','Programmation']] },
    { id:'SI-002', label:'Anomalie sur DNG-DEMO-2026-023', date:'22/09/2026', type:'Anomalie', sender:'Service distinctions', reference:'DNG-DEMO-2026-023', status:'À examiner', location:'—', history:[['22/09/2026','Détection']] },
  ],
  service_chef: [
    { id:'SCH-001', label:'Dossier DNG-DEMO-2026-041 à valider', date:'30/09/2026', type:'Validation finale', sender:'Service · Agent', reference:'DNG-DEMO-2026-041', status:'À valider', location:'—', history:[['30/09/2026','Transmission au chef']] },
    { id:'SCH-002', label:'Cérémonie du 18/11/2026 à planifier', date:'02/10/2026', type:'Planification', sender:'Régisseur', reference:'CER-DEMO-2026-008', status:'À planifier', location:'—', history:[['02/10/2026','Demande de planification']] },
  ],
  regisseur: [
    { id:'REG-001', label:'Réservation 8 médailles Or', date:'03/03/2026', type:'Réservation', sender:'Service des Distinctions', reference:'DNG-DEMO-2026-008', status:'Réservée', location:'—', history:[['03/03/2026','Réservation']] },
    { id:'REG-002', label:'BC-2026-0012', date:'20/02/2026', type:'Bon de commande', sender:'Fournisseur démo', reference:'BC-2026-0012', status:'À confirmer', location:'—', history:[['20/02/2026','Préparation']] },
  ],
  admin: [
    { id:'ADM-001', label:'Création du compte demo.dr@example.test', date:'01/01/2026', type:'Compte interne', sender:'Administrateur', reference:'USER-DR-001', status:'Actif', location:'—', history:[['01/01/2026','Création']] },
    { id:'ADM-002', label:'Désactivation temporaire du compte demo.ministre@example.test', date:'15/02/2026', type:'Audit', sender:'Administrateur', reference:'USER-MIN-001', status:'Audité', location:'—', history:[['15/02/2026','Audit']] },
  ],
};

/** Données agrégées pour chaque rôle interne. */
const INTERNAL_DEMO = {
  secretariat_ministre: { mail: INTERNAL_BOX.secretariat_ministre, profile: { name:'Secrétariat du Ministre', department:'Cabinet du Ministre' } },
  secretariat_dgt: { mail: INTERNAL_BOX.secretariat_dgt, profile: { name:'Secrétariat de la DGT', department:'Direction Générale du Travail' } },
  secretariat_dr: { mail: INTERNAL_BOX.secretariat_dr, profile: { name:'Secrétariat de la DR', department:'Direction Régionale — Estuaire' } },
  ministre: { profile: { name:'Mme le Ministre', department:'Ministère du Travail' }, decisions: ['DNG-DEMO-2026-041', 'DNG-DEMO-2025-012'] },
  dgt: { profile: { name:'M. le Directeur Général', department:'Direction Générale du Travail' }, decisions: ['DNG-DEMO-2026-008', 'DNG-DEMO-2024-005'] },
  dr: { profile: { name:'M. le Directeur Régional', department:'Direction Régionale — Estuaire' }, decisions: ['DNG-DEMO-2026-023', 'DNG-2025-01106'] },
  service_agent: { profile: { name:'M. l’Agent d’instruction', department:'Service des Distinctions' }, files: INTERNAL_BOX.service_agent },
  service_inspecteur: { profile: { name:'Mme l’Inspectrice', department:'Service des Distinctions' }, files: INTERNAL_BOX.service_inspecteur },
  service_chef: { profile: { name:'M. le Chef de service', department:'Service des Distinctions' }, files: INTERNAL_BOX.service_chef },
  regisseur: { profile: { name:'M. le Régisseur', department:'Régie des Médailles' }, files: INTERNAL_BOX.regisseur, stock: { Bronze:148, Argent:96, Or:43, Diplomes:360 } },
  admin: { profile: { name:'M. l’Administrateur', department:'Plateforme' }, audit: INTERNAL_BOX.admin, users: DEMO_ACCOUNTS.map((a) => ({ email:a.email, role:a.role, label:a.label, status:'Actif' })) },
};

/** Lit les données internes de présentation pour un rôle. */
function internalDemoData(role) {
  if (!PRESENTATION_MODE) return null;
  if (!INTERNAL_DEMO[role]) return null;
  return INTERNAL_DEMO[role];
}
