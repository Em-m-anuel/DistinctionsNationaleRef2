/* ==================================================================
   js/cf-store.js
   Magasin unique du cahier fonctionnel. Toutes les actions mutent
   cet état, écrivent l’historique et créent les notifications.
================================================================== */

const CF_TODAY = new Date(2026, 9, 14);
const CF_TODAY_FR = "14/10/2026";
const CF_STORE_KEY = "dn.cf.store.v1";
const CF_CURRENCY = "FCFA";
const CF_TARIFFS = { Or: 20000, Argent: 15000, Bronze: 13000, diplome: 3000 };
const CF_CODE = "246810";
const CF_PAGE_SIZE = 8;
const CF_STATUS_LABEL = {
  SOUMIS: "Soumis",
  EN_ETUDE: "En étude",
  APPROUVE: "Approuvé",
  REJETE: "Rejeté",
  VALIDE: "Validé",
  ORDRE_EMIS: "Ordre émis",
  PAYE: "Payé",
  MEDAILLES_REMISES: "Médailles remises",
  CEREMONIE_PLANIFIEE: "Cérémonie planifiée",
  CLOTURE: "Clôturé",
  EN_ATTENTE: "En attente",
  VALIDE_R: "Validé",
  REFUSE: "Refusé",
  ENVOYEE: "Envoyée",
  RECUE: "Reçue",
  LUE: "Lue",
  ACCEPTEE: "Acceptée",
  REFUSEE: "Refusée",
  NON_SIGNE: "Non signé",
  SIGNE_VISUELLEMENT: "Signé visuellement",
  SIGNE_SCELLE: "Signé et scellé",
  EN_ATTENTE_VALIDATION: "En attente de validation",
  ACTIVE: "Active",
  DESACTIVEE: "Désactivée",
};
const CF_STATUS_TONE = {
  SOUMIS: "blue", EN_ETUDE: "gold", APPROUVE: "green", REJETE: "neutral",
  VALIDE: "green", ORDRE_EMIS: "gold", PAYE: "green", MEDAILLES_REMISES: "green",
  CEREMONIE_PLANIFIEE: "blue", CLOTURE: "neutral", EN_ATTENTE: "gold",
  REFUSE: "neutral", ENVOYEE: "blue", RECUE: "gold", LUE: "green",
  ACCEPTEE: "green", REFUSEE: "neutral", ACTIVE: "green",
};
const CF_FRISE = ["SOUMIS", "EN_ETUDE", "APPROUVE", "VALIDE", "ORDRE_EMIS", "PAYE", "MEDAILLES_REMISES", "CEREMONIE_PLANIFIEE", "CLOTURE"];
const CF_LEVELS = ["ministre", "dgt", "dr"];
const CF_LEVEL_LABEL = { ministre: "Ministre", dgt: "DGT", dr: "DR" };
const CF_NEXT_LEVEL = { ministre: "dgt", dgt: "dr" };
const CF_SEC_ROLE = { ministre: "secretariat_ministre", dgt: "secretariat_dgt", dr: "secretariat_dr" };

let cfLive = null;
let cfUndoSnap = null;

function cfClone(v) { return JSON.parse(JSON.stringify(v)); }
function cfPad(n) { return String(n).padStart(2, "0"); }
function cfFormatFr(d) {
  if (!d) return "";
  const x = d instanceof Date ? d : cfParseFr(d);
  if (!x) return "";
  return cfPad(x.getDate()) + "/" + cfPad(x.getMonth() + 1) + "/" + x.getFullYear();
}
function cfParseFr(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const t = String(value).trim();
  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);
  const fr = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (fr) return new Date(+fr[3], +fr[2] - 1, +fr[1]);
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d;
}
function cfMoney(n) {
  if (!Number.isFinite(n)) return "—";
  var formatted;
  try { formatted = (typeof Intl !== "undefined" && Intl.NumberFormat) ? new Intl.NumberFormat("fr-FR").format(n) : String(n); }
  catch (e) { formatted = String(n); }
  return formatted + " " + CF_CURRENCY;
}
function cfUid(prefix) { return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function cfYears(start, end) {
  const a = cfParseFr(start), b = end ? cfParseFr(end) : CF_TODAY;
  if (!a || !b) return 0;
  let y = b.getFullYear() - a.getFullYear();
  if (b.getMonth() < a.getMonth() || (b.getMonth() === a.getMonth() && b.getDate() < a.getDate())) y -= 1;
  return Math.max(0, y);
}
function cfEligibleMedal(years, mutilation) {
  const y = mutilation ? years * 2 : years;
  if (y >= 30) return "Or";
  if (y >= 20) return "Argent";
  if (y >= 10) return "Bronze";
  return null;
}
function cfMedalPrice(metal) { return (CF_TARIFFS[metal] || 0) + CF_TARIFFS.diplome; }

function cfSeed() {
  const users = [
    { id: "U-ENT", email: "demo.entreprise@example.test", nom: "Mba", prenom: "Corinne", role: "demandeur", applicantId: "APP-SGI", actif: true, last: "14/10/2026" },
    { id: "U-MINA", email: "demo.ministere@example.test", nom: "Ndong", prenom: "Patrice", role: "demandeur", applicantId: "APP-MIN", actif: true, last: "13/10/2026" },
    { id: "U-PERS", email: "demo.personne@example.test", nom: "Moussavou", prenom: "Alain", role: "recipient", applicantId: null, cni: "CNI-ALAIN-001", actif: true, last: "10/10/2026" },
    { id: "U-SM", email: "demo.secretariat.ministre@example.test", nom: "Allogho", prenom: "Marie", role: "secretariat_ministre", level: "ministre", actif: true, last: "14/10/2026" },
    { id: "U-SD", email: "demo.secretariat.dgt@example.test", nom: "Obame", prenom: "Serge", role: "secretariat_dgt", level: "dgt", actif: true, last: "14/10/2026" },
    { id: "U-SR", email: "demo.secretariat.dr@example.test", nom: "Essono", prenom: "Laure", role: "secretariat_dr", level: "dr", actif: true, last: "14/10/2026" },
    { id: "U-MIN", email: "demo.ministre@example.test", nom: "Ntoutoume", prenom: "Jean", role: "ministre", level: "ministre", actif: true, last: "14/10/2026", stampId: "ST-MIN" },
    { id: "U-DGT", email: "demo.dgt@example.test", nom: "Mintsa", prenom: "Hélène", role: "dgt", level: "dgt", actif: true, last: "14/10/2026", stampId: "ST-DGT" },
    { id: "U-DR", email: "demo.dr@example.test", nom: "Biyoghe", prenom: "André", role: "dr", level: "dr", actif: true, last: "14/10/2026", stampId: "ST-DR" },
    { id: "U-SA", email: "demo.service.agent@example.test", nom: "Koumba", prenom: "Inès", role: "service_agent", actif: true, last: "14/10/2026", stampId: "ST-SVC" },
    { id: "U-SI", email: "demo.service.inspecteur@example.test", nom: "Nzengue", prenom: "Marc", role: "service_inspecteur", actif: true, last: "14/10/2026", stampId: "ST-SVC" },
    { id: "U-SC", email: "demo.service.chef@example.test", nom: "Oyane", prenom: "Claire", role: "service_chef", actif: true, last: "14/10/2026", stampId: "ST-SVC" },
    { id: "U-RG", email: "demo.regisseur@example.test", nom: "Minko", prenom: "Paul", role: "regisseur", actif: true, last: "14/10/2026" },
    { id: "U-AD", email: "demo.admin@example.test", nom: "Admin", prenom: "Plateforme", role: "admin", actif: true, last: "14/10/2026" },
  ];
  const applicants = [
    { id: "APP-SGI", nom: "Société Gabonaise des Infrastructures", sigle: "SGI", type: "entreprise", nif: "NIF-SGI-001", secteur: "BTP", adresse: "Boulevard de l’Indépendance, Libreville", estReconnu: true, email: "demo.entreprise@example.test" },
    { id: "APP-MIN", nom: "Ministère du Travail et de la Fonction publique", sigle: "MIN.TRAVAIL", type: "ministere", nif: "NIF-MIN-001", secteur: "Administration", adresse: "Boulevard Triomphal, Libreville", estReconnu: true, email: "demo.ministere@example.test" },
    { id: "APP-EFL", nom: "Entreprise Forestière du Littoral", sigle: "EFL", type: "entreprise", nif: "NIF-EFL-001", secteur: "Forêt", adresse: "Avenue du Port, Port-Gentil", estReconnu: true, email: "efl@example.invalid" },
    { id: "APP-KOMO", nom: "Ateliers du Komo", sigle: "KOMO", type: "entreprise", nif: "NIF-KOMO-001", secteur: "Industrie", adresse: "Route de Ntoum, Komo", estReconnu: false, email: "komo@example.invalid" },
  ];
  const campaigns = [
    { id: "CAMP-2026", year: "2026", depositStart: "10/01/2026", depositEnd: "31/03/2026", prorogee: false, ceremonyDate: "17/08/2026", ceremonyPlace: "Esplanade du Sénat, Libreville", status: "en cours", archive: null },
    { id: "CAMP-2025", year: "2025", depositStart: "10/01/2025", depositEnd: "31/03/2025", prorogee: false, ceremonyDate: "16/08/2025", ceremonyPlace: "Esplanade du Sénat, Libreville", status: "cloturee", archive: { submitted: 18, validated: 14, or: 4, argent: 6, bronze: 12, amount: 412000, ceremonies: 1 } },
  ];
  const rec = (o) => Object.assign({
    nationalite: "Gabonaise", sexe: "Masculin", dateDeces: null, presence: null, remis: false,
    medals: [{ metal: o.metal, status: o.rstatus || "EN_ATTENTE", motif: o.motif || "", granted: o.granted || null }],
    complement: null, assouplissement: o.assouplissement || null,
  }, o);
  const dossiers = [
    cfDossier({
      id: "D-001", ref: "DNG-2026-001", campaign: "2026", applicantId: "APP-SGI", destination: "ministre",
      status: "SOUMIS", submitted: "12/10/2026", location: "Secrétariat du Ministre",
      recipients: [
        rec({ id: "R-001a", cni: "CNI-MBA-11", nom: "Mba", prenom: "Aline", poste: "Directrice administrative", start: "04/03/2008", sexe: "Féminin", metal: "Argent", years: 18 }),
        rec({ id: "R-001b", cni: "CNI-ONDO-12", nom: "Ondo", prenom: "Paul", poste: "Technicien", start: "11/06/2015", metal: "Bronze", years: 11 }),
      ],
      history: [["12/10/2026", "Dépôt — statut SOUMIS"]],
    }),
    cfDossier({
      id: "D-002", ref: "DNG-2026-002", campaign: "2026", applicantId: "APP-SGI", destination: "ministre",
      status: "SOUMIS", submitted: "02/10/2026", location: "Cabinet du Ministre",
      transmitted: true, mailPhase: "autorite", mailLevel: "ministre", mailStatus: "RECUE",
      recipients: [rec({ id: "R-002a", cni: "CNI-ESONO-21", nom: "Esono", prenom: "Sarah", poste: "Responsable RH", start: "06/04/2004", sexe: "Féminin", metal: "Or", years: 22 })],
      history: [["02/10/2026", "Dépôt"], ["03/10/2026", "Transmis au Ministre"]],
    }),
    cfDossier({
      id: "D-003", ref: "DNG-2026-003", campaign: "2026", applicantId: "APP-MIN", destination: "dgt",
      status: "SOUMIS", submitted: "28/09/2026", location: "Cabinet DGT",
      transmitted: true, mailPhase: "autorite", mailLevel: "dgt", mailStatus: "LUE",
      indications: [{ by: "Ministre", date: "30/09/2026", text: "Examiner en priorité les dossiers d’ancienneté." }],
      recipients: [
        rec({ id: "R-003a", cni: "CNI-NZAM-31", nom: "Nzamba", prenom: "Aimée", poste: "Directrice", start: "02/01/1996", sexe: "Féminin", metal: "Or", years: 30 }),
        rec({ id: "R-003b", cni: "CNI-MBAD-32", nom: "Mbadinga", prenom: "Jean-Pierre", poste: "Conseiller", start: "14/03/2006", metal: "Argent", years: 20 }),
      ],
      history: [["28/09/2026", "Dépôt"], ["29/09/2026", "Transmis à la DGT"]],
    }),
    cfDossier({
      id: "D-004", ref: "DNG-2026-004", campaign: "2026", applicantId: "APP-EFL", destination: "dr",
      status: "SOUMIS", submitted: "20/09/2026", location: "Cabinet DR Estuaire",
      transmitted: true, mailPhase: "autorite", mailLevel: "dr", mailStatus: "LUE",
      recipients: [rec({ id: "R-004a", cni: "CNI-BIYO-41", nom: "Biyogo", prenom: "Hélène", poste: "Assistante", start: "01/02/2014", sexe: "Féminin", metal: "Bronze", years: 12 })],
      history: [["20/09/2026", "Dépôt"], ["21/09/2026", "Transmis au DR"]],
    }),
    cfDossier({
      id: "D-005", ref: "DNG-2026-005", campaign: "2026", applicantId: "APP-SGI", destination: "dr",
      status: "EN_ETUDE", submitted: "18/02/2026", location: "Service des Distinctions — salle 12",
      transmitted: true, approved: "12/05/2026",
      recipients: [
        rec({ id: "R-005a", cni: "CNI-ALAIN-001", nom: "Moussavou", prenom: "Alain", poste: "Technicien supérieur", start: "12/01/2018", metal: "Bronze", years: 8, rstatus: "EN_ATTENTE", assouplissement: null }),
        rec({ id: "R-005b", cni: "CNI-NGUE-52", nom: "Nguema", prenom: "Nadia", poste: "Cheffe de projet", start: "03/05/2006", sexe: "Féminin", metal: "Argent", years: 20, rstatus: "VALIDE", granted: "Argent" }),
      ],
      complements: [{ id: "CPL-1", recipientId: "R-005a", objet: "Justificatif d’ancienneté", date: "22/09/2026", status: "ouvert", reponse: null }],
      history: [["18/02/2026", "Dépôt"], ["12/05/2026", "Approuvé par le DR"], ["13/05/2026", "Instruction ouverte"], ["22/09/2026", "Complément demandé pour Alain Moussavou"]],
    }),
    cfDossier({
      id: "D-006", ref: "DNG-2026-006", campaign: "2026", applicantId: "APP-SGI", destination: "dr",
      status: "EN_ETUDE", submitted: "11/02/2026", location: "Service des Distinctions",
      transmitted: true, approved: "02/06/2026", readyNotify: true,
      recipients: [
        rec({ id: "R-006a", cni: "CNI-NZIE-61", nom: "Nziengui", prenom: "Imelda", poste: "Chargée d’études", start: "04/02/2005", sexe: "Féminin", metal: "Argent", years: 21, rstatus: "VALIDE", granted: "Argent" }),
        rec({ id: "R-006b", cni: "CNI-DIAL-62", nom: "Diallo", prenom: "Fatou", poste: "Ingénieure", start: "18/09/2014", sexe: "Féminin", nationalite: "Sénégalaise", metal: "Bronze", years: 12, rstatus: "REFUSE", motif: "Pièce d’autorisation d’emploi manquante", granted: null }),
      ],
      history: [["11/02/2026", "Dépôt"], ["02/06/2026", "Approuvé"], ["20/09/2026", "Instruction terminée — à notifier"]],
    }),
    cfDossier({
      id: "D-007", ref: "DNG-2026-007", campaign: "2026", applicantId: "APP-SGI", destination: "dr",
      status: "EN_ETUDE", submitted: "08/02/2026", location: "Service des Distinctions",
      transmitted: true, approved: "10/05/2026", notified: true, notifiedDate: "02/10/2026",
      recipients: [
        rec({ id: "R-007a", cni: "CNI-OKOU-71", nom: "Okoumba", prenom: "Pierre", poste: "Assistant", start: "01/03/2012", metal: "Bronze", years: 14, rstatus: "VALIDE", granted: "Bronze" }),
        rec({ id: "R-007b", cni: "CNI-ONDO-72", nom: "Ondo", prenom: "Luc", poste: "Conducteur", start: "13/03/1994", metal: "Or", years: 32, rstatus: "REFUSE", motif: "Dossier incomplet à la date d’instruction" }),
      ],
      history: [["08/02/2026", "Dépôt"], ["10/05/2026", "Approuvé"], ["02/10/2026", "Liste des validés notifiée"]],
    }),
    cfDossier({
      id: "D-008", ref: "DNG-2026-008", campaign: "2026", applicantId: "APP-MIN", destination: "dr",
      status: "VALIDE", submitted: "15/02/2026", location: "Service des Distinctions",
      transmitted: true, approved: "18/06/2026", notified: true, listAccepted: true,
      recipients: [
        rec({ id: "R-008a", cni: "CNI-EYEN-81", nom: "Eyenga", prenom: "Lucie", poste: "Chargée de mission", start: "06/09/2006", sexe: "Féminin", metal: "Argent", years: 20, rstatus: "VALIDE", granted: "Argent" }),
      ],
      history: [["15/02/2026", "Dépôt"], ["18/06/2026", "Approuvé"], ["01/09/2026", "Liste notifiée"], ["08/09/2026", "Liste acceptée — VALIDE"]],
    }),
    cfDossier({
      id: "D-009", ref: "DNG-2026-009", campaign: "2026", applicantId: "APP-SGI", destination: "dr",
      status: "ORDRE_EMIS", submitted: "08/02/2026", location: "Régie des médailles",
      transmitted: true, approved: "10/05/2026", notified: true, listAccepted: true,
      order: { ref: "OR-2026-009", date: "02/07/2026", amount: 46000, lines: [{ name: "Alain Moussavou", metal: "Or", medal: 20000, diplome: 3000 }, { name: "Sarah Esono", metal: "Argent", medal: 15000, diplome: 3000 }], signStatus: "SIGNE_SCELLE", sealed: true },
      quittance: { scan: "QUI-2026-009.pdf", numero: "QUI-2026-009", montant: 46000, date: "18/07/2026", uploaded: "20/07/2026" },
      recipients: [
        rec({ id: "R-009a", cni: "CNI-ALAIN-001", nom: "Moussavou", prenom: "Alain", poste: "Technicien supérieur", start: "12/01/1994", metal: "Or", years: 32, rstatus: "VALIDE", granted: "Or" }),
        rec({ id: "R-009b", cni: "CNI-ESONO-21", nom: "Esono", prenom: "Sarah", poste: "Responsable RH", start: "06/04/2004", sexe: "Féminin", metal: "Argent", years: 22, rstatus: "VALIDE", granted: "Argent" }),
      ],
      history: [["08/02/2026", "Dépôt"], ["02/07/2026", "Ordre de recette émis"], ["20/07/2026", "Quittance téléversée"]],
    }),
    cfDossier({
      id: "D-010", ref: "DNG-2026-010", campaign: "2026", applicantId: "APP-SGI", destination: "dr",
      status: "PAYE", submitted: "10/02/2026", location: "Régie des médailles",
      transmitted: true, approved: "11/05/2026", notified: true, listAccepted: true,
      order: { ref: "OR-2026-010", date: "15/06/2026", amount: 16000, lines: [{ name: "Imelda Nziengui", metal: "Bronze", medal: 13000, diplome: 3000 }], signStatus: "SIGNE_SCELLE", sealed: true },
      quittance: { scan: "QUI-2026-010.pdf", numero: "QUI-2026-010", montant: 16000, date: "01/07/2026", uploaded: "02/07/2026", conforme: true },
      recipients: [rec({ id: "R-010a", cni: "CNI-NZIE-61", nom: "Nziengui", prenom: "Imelda", poste: "Chargée d’études", start: "04/02/2012", sexe: "Féminin", metal: "Bronze", years: 14, rstatus: "VALIDE", granted: "Bronze" })],
      history: [["10/02/2026", "Dépôt"], ["15/06/2026", "Ordre émis"], ["03/07/2026", "Quittance conforme — PAYE"]],
    }),
    cfDossier({
      id: "D-011", ref: "DNG-2026-011", campaign: "2026", applicantId: "APP-EFL", destination: "dr",
      status: "CEREMONIE_PLANIFIEE", submitted: "20/01/2026", location: "Service des Distinctions",
      transmitted: true, approved: "04/04/2026", notified: true, listAccepted: true,
      order: { ref: "OR-2026-011", date: "12/05/2026", amount: 16000, lines: [{ name: "Éric Ebang", metal: "Bronze", medal: 13000, diplome: 3000 }], signStatus: "SIGNE_SCELLE", sealed: true },
      quittance: { scan: "QUI-2026-011.pdf", numero: "QUI-2026-011", montant: 16000, date: "20/05/2026", conforme: true },
      ceremony: { type: "officielle", date: "17/08/2026", place: "Esplanade du Sénat, Libreville", status: "confirmée" },
      remise: { retirant: "Marie Ebang", qualite: "Représentant du demandeur", piece: "CNI-RET-11", date: "02/06/2026", metals: ["Bronze"] },
      recipients: [rec({ id: "R-011a", cni: "CNI-EBAN-11", nom: "Ebang", prenom: "Éric", poste: "Conducteur travaux", start: "09/07/2013", metal: "Bronze", years: 13, rstatus: "VALIDE", granted: "Bronze", remis: true })],
      history: [["20/01/2026", "Dépôt"], ["02/06/2026", "Remise enregistrée"], ["01/07/2026", "Cérémonie planifiée"]],
    }),
    cfDossier({
      id: "D-012", ref: "DNG-2025-012", campaign: "2025", applicantId: "APP-SGI", destination: "dr",
      status: "CLOTURE", submitted: "10/02/2025", location: "Archives",
      transmitted: true, approved: "04/07/2025", notified: true, listAccepted: true,
      ceremony: { type: "officielle", date: "16/08/2025", place: "Esplanade du Sénat, Libreville", status: "tenue" },
      order: { ref: "OR-2025-012", date: "02/09/2025", amount: 16000, lines: [{ name: "Alain Moussavou", metal: "Bronze", medal: 13000, diplome: 3000 }], signStatus: "SIGNE_SCELLE", sealed: true },
      recipients: [rec({ id: "R-012a", cni: "CNI-ALAIN-001", nom: "Moussavou", prenom: "Alain", poste: "Technicien supérieur", start: "12/01/2010", metal: "Bronze", years: 15, rstatus: "VALIDE", granted: "Bronze", remis: true, presence: "présent" })],
      history: [["10/02/2025", "Dépôt"], ["16/08/2025", "Cérémonie tenue — CLOTURE"]],
    }),
    cfDossier({
      id: "D-013", ref: "DNG-2026-013", campaign: "2026", applicantId: "APP-SGI", destination: "dr",
      status: "REJETE", submitted: "22/02/2026", location: "Cabinet du Ministre",
      transmitted: true, rejected: "18/06/2026", rejectMotif: "Ancienneté insuffisante pour l’ensemble du dossier",
      recours: [{ id: "REC-013", autorite: "ministre", motif: "Retraite anticipée de deux agents", date: "25/06/2026", status: "en attente", pieces: ["Justificatif retraite.pdf"] }],
      recipients: [rec({ id: "R-013a", cni: "CNI-MINK-13", nom: "Minko", prenom: "Georges", poste: "Chef d’atelier", start: "01/09/2018", metal: "Bronze", years: 8 })],
      history: [["22/02/2026", "Dépôt"], ["18/06/2026", "Rejeté par le DR"], ["25/06/2026", "Recours déposé auprès du Ministre"]],
    }),
    cfDossier({
      id: "D-014", ref: "DNG-2026-014", campaign: "2026", applicantId: "APP-EFL", destination: "dr",
      status: "MEDAILLES_REMISES", submitted: "15/04/2026", location: "Service des Distinctions",
      horsDelai: true, transmitted: true, approved: "02/07/2026", notified: true, listAccepted: true,
      ceremonyRequest: { autorite: "dr", dateSouhaitee: "12/11/2026", lieuSouhaite: "Port-Gentil — Centre administratif", status: "negociation" },
      negotiation: [
        { by: "demandeur", date: "20/09/2026", dateProp: "12/11/2026", lieu: "Port-Gentil — Centre administratif" },
        { by: "service", date: "28/09/2026", dateProp: "20/11/2026", lieu: "Port-Gentil — Centre administratif" },
      ],
      order: { ref: "OR-2026-014", date: "20/07/2026", amount: 16000, lines: [{ name: "Hélène Biyogo", metal: "Bronze", medal: 13000, diplome: 3000 }], signStatus: "NON_SIGNE", sealed: false },
      recipients: [rec({ id: "R-014a", cni: "CNI-BIYO-41", nom: "Biyogo", prenom: "Hélène", poste: "Assistante", start: "01/02/2014", sexe: "Féminin", metal: "Bronze", years: 12, rstatus: "VALIDE", granted: "Bronze", remis: true })],
      history: [["15/04/2026", "Dépôt hors délai"], ["02/07/2026", "Approuvé"], ["20/09/2026", "Négociation de cérémonie ouverte"]],
    }),
    cfDossier({
      id: "D-016", ref: "DNG-2026-016", campaign: "2026", applicantId: "APP-MIN", destination: "dr",
      status: "APPROUVE", submitted: "05/03/2026", location: "Service des Distinctions — accueil",
      transmitted: true, approved: "12/10/2026",
      recipients: [rec({ id: "R-016a", cni: "CNI-OWON-16", nom: "Owono", prenom: "Chantal", poste: "Secrétaire principale", start: "09/04/2011", sexe: "Féminin", metal: "Bronze", years: 15 })],
      history: [["05/03/2026", "Dépôt"], ["12/10/2026", "Approuvé par le DR — envoyé au Service"]],
    }),
    cfDossier({
      id: "D-015", ref: "DNG-2025-015", campaign: "2025", applicantId: "APP-SGI", destination: "dr",
      status: "CLOTURE", submitted: "12/02/2025", location: "Chez le demandeur — non distribué",
      transmitted: true, approved: "01/07/2025",
      ceremony: { type: "officielle", date: "16/08/2025", place: "Esplanade du Sénat, Libreville", status: "tenue" },
      relances: [{ id: "REL-015", autorite: "dr", motif: "Deux médailles non distribuées après la cérémonie", date: "02/10/2026", status: "EN_ATTENTE", pieces: [] }],
      recipients: [
        rec({ id: "R-015a", cni: "CNI-OKOU-15", nom: "Okoumba", prenom: "Pierre", poste: "Assistant", start: "01/03/2005", metal: "Argent", years: 20, rstatus: "VALIDE", granted: "Argent", remis: true, presence: "absent" }),
      ],
      history: [["12/02/2025", "Dépôt"], ["16/08/2025", "Cérémonie — absent"], ["02/10/2026", "Relance déposée"]],
    }),
  ];

  const mails = [
    { id: "M-001", dossierId: "D-001", type: "dossier", level: "ministre", phase: "secretariat", status: "a_transmettre", date: "12/10/2026", age: "2 j" },
    { id: "M-016", dossierId: "D-005", type: "dossier", level: "dgt", phase: "secretariat", status: "a_enregistrer", date: "13/10/2026" },
    { id: "M-017", dossierId: "D-004", type: "dossier", level: "dr", phase: "secretariat", status: "a_enregistrer", date: "14/10/2026" },
    { id: "M-002", dossierId: "D-002", type: "dossier", level: "ministre", phase: "autorite", status: "RECUE", date: "03/10/2026", transmittedAt: "03/10/2026" },
    { id: "M-003", dossierId: "D-003", type: "dossier", level: "dgt", phase: "autorite", status: "LUE", date: "29/09/2026", transmittedAt: "29/09/2026" },
    { id: "M-004", dossierId: "D-004", type: "dossier", level: "dr", phase: "autorite", status: "LUE", date: "21/09/2026", transmittedAt: "21/09/2026" },
    { id: "M-013", dossierId: "D-013", type: "recours", level: "ministre", phase: "secretariat", status: "a_transmettre", date: "25/06/2026" },
    { id: "M-015", dossierId: "D-015", type: "relance", level: "dr", phase: "secretariat", status: "a_transmettre", date: "02/10/2026" },
    { id: "M-014", dossierId: "D-014", type: "ceremonie", level: "dr", phase: "autorite", status: "LUE", date: "20/09/2026", transmittedAt: "21/09/2026" },
  ];

  const documents = [
    { id: "DOC-1", dossierId: "D-001", name: "Courrier d’initiation", origin: "téléversé", format: "PDF", date: "12/10/2026", signStatus: "NON_SIGNE", numero: null, cachet: null, visas: [], sealed: false, pages: 2 },
    { id: "DOC-2", dossierId: "D-009", name: "Ordre de recette OR-2026-009", origin: "généré", format: "PDF", date: "02/07/2026", signStatus: "SIGNE_SCELLE", numero: "OR-2026-009", cachet: "Cachet du Service", visas: [{ name: "Claire Oyane", date: "02/07/2026", rang: 1 }], sealed: true, pages: 1 },
    { id: "DOC-3", dossierId: "D-008", name: "Ordre de recette (brouillon)", origin: "généré", format: "PDF", date: "10/10/2026", signStatus: "SIGNE_VISUELLEMENT", numero: null, pendingNumber: true, cachet: "Cachet du Service", visas: [{ name: "Inès Koumba", date: "10/10/2026", rang: 1 }], sealed: false, pages: 1 },
    { id: "DOC-4", dossierId: "D-009", name: "Quittance QUI-2026-009", origin: "téléversé", format: "PDF", date: "20/07/2026", signStatus: "NON_SIGNE", numero: "QUI-2026-009", cachet: null, visas: [], sealed: false, pages: 1 },
  ];

  const ceremonies = [
    { id: "CER-OFF-2026", type: "officielle", campaign: "2026", date: "17/08/2026", place: "Esplanade du Sénat, Libreville", status: "confirmée", dossiers: ["D-011"] },
    { id: "CER-OFF-2025", type: "officielle", campaign: "2025", date: "16/08/2025", place: "Esplanade du Sénat, Libreville", status: "tenue", dossiers: ["D-012", "D-015"] },
    { id: "CER-HD-014", type: "hors délai", campaign: "2026", date: "20/11/2026", place: "Port-Gentil — Centre administratif", status: "proposée", dossiers: ["D-014"] },
    { id: "CER-OCT-2026", type: "rattrapage", campaign: "2026", date: "20/10/2026", place: "Libreville — Salle des conférences", status: "confirmée", dossiers: ["D-010"] },
  ];

  const stock = { Or: 42, Argent: 85, Bronze: 160 };
  const movements = [
    { id: "MV-1", date: "02/06/2026", metal: "Bronze", sens: "sortie", qty: 1, motif: "Remise DNG-2026-011", agent: "Paul Minko", livraison: null },
    { id: "MV-2", date: "12/09/2026", metal: "Or", sens: "entrée", qty: 20, motif: "Livraison partielle CMD-2026-02", agent: "Paul Minko", livraison: "BL-2026-02a" },
    { id: "MV-3", date: "12/09/2026", metal: "Argent", sens: "entrée", qty: 30, motif: "Livraison partielle CMD-2026-02", agent: "Paul Minko", livraison: "BL-2026-02a" },
  ];
  const suppliers = [
    { id: "FOU-1", nom: "Atelier numismatique", contact: "contact@atelier.invalid" },
    { id: "FOU-2", nom: "Fonderie du Littoral", contact: "fonderie@example.invalid" },
  ];
  const purchaseOrders = [
    { id: "CMD-2026-02", fournisseurId: "FOU-1", campaign: "2026", date: "01/09/2026", status: "en cours", budget: 800000, scan: "BC-2026-02.pdf", lines: [{ metal: "Or", qty: 40, prix: 9000 }, { metal: "Argent", qty: 60, prix: 7000 }, { metal: "Bronze", qty: 80, prix: 5000 }] },
  ];
  const deliveries = [
    { id: "BL-2026-02a", commandeId: "CMD-2026-02", date: "12/09/2026", scan: "BL-2026-02a.pdf", lines: [{ metal: "Or", qty: 20 }, { metal: "Argent", qty: 30 }] },
  ];
  const budget = { campaign: "2026", alloue: 1200000, engage: 860000 };

  const withdrawals = [
    { id: "RET-001", tracking: "SUIVI-246810", cni: "CNI-ALAIN-001", nom: "Moussavou", prenom: "Alain", structure: "SGI", campaign: "2026", retirantNom: "Moussavou", retirantPrenom: "Alain", lien: "lui-même", pieces: ["CNI-ALAIN-001.pdf"], status: "en attente", date: "10/10/2026", motif: null, lieu: "Régie des médailles — Libreville, 8h–15h" },
  ];

  const stamps = [
    { id: "ST-SVC", libelle: "Cachet du Service des Distinctions", status: "actif", date: "01/01/2025", agents: ["U-SA", "U-SI", "U-SC"], image: "deposee" },
    { id: "ST-MIN", libelle: "Cachet du Ministre", status: "actif", date: "01/01/2025", agents: ["U-MIN"], image: "deposee" },
    { id: "ST-DGT", libelle: "Cachet de la DGT", status: "actif", date: "01/01/2025", agents: ["U-DGT"], image: "deposee" },
    { id: "ST-DR", libelle: "Cachet du DR", status: "actif", date: "01/01/2025", agents: ["U-DR"], image: "deposee" },
  ];
  const signatures = users.filter((u) => ["ministre", "dgt", "dr", "service_chef", "service_agent"].includes(u.role)).map((u) => ({
    id: "SIG-" + u.id, userId: u.id, status: "ACTIVE", created: "15/01/2026", activated: "15/01/2026", deactivated: null,
  }));

  const notifications = [
    { id: "N-1", to: "demo.secretariat.ministre@example.test", roles: ["secretariat_ministre"], text: "Nouveau dossier DNG-2026-001 à transmettre.", date: "12/10/2026", read: false, page: "inbox", ref: "DNG-2026-001" },
    { id: "N-2", to: "demo.ministre@example.test", roles: ["ministre"], text: "Dossier DNG-2026-002 reçu.", date: "03/10/2026", read: false, page: "dossiers", ref: "DNG-2026-002" },
    { id: "N-3", to: "demo.entreprise@example.test", roles: ["demandeur"], text: "Complément demandé sur DNG-2026-005 (Alain Moussavou).", date: "22/09/2026", read: false, page: "dossiers", ref: "DNG-2026-005" },
    { id: "N-4", to: "demo.entreprise@example.test", roles: ["demandeur"], text: "Liste des validés à accepter — DNG-2026-007.", date: "02/10/2026", read: false, page: "dossiers", ref: "DNG-2026-007" },
    { id: "N-5", to: "demo.regisseur@example.test", roles: ["regisseur"], text: "Quittance à vérifier — DNG-2026-009.", date: "20/07/2026", read: false, page: "remises", ref: "DNG-2026-009" },
    { id: "N-6", to: "demo.service.chef@example.test", roles: ["service_agent", "service_inspecteur", "service_chef"], title: "Instruction ouverte", text: "DNG-2026-005 (SGI) est en étude. Les récipiendaires Alain Moussavou et Nadia Nguema sont à examiner.", date: "13/05/2026", time: "09:00", read: true, page: "instruction", ref: "DNG-2026-005", kind: "controle" },
    { id: "N-7", to: "demo.dr@example.test", roles: ["dr"], text: "Relance REL-015 à traiter.", date: "02/10/2026", read: false, page: "relances", ref: "DNG-2025-015" },
    { id: "N-8", to: "demo.personne@example.test", roles: ["recipient"], text: "Demande de retrait SUIVI-246810 en attente de vérification.", date: "10/10/2026", read: false, page: "overview", ref: "RET-001" },
    { id: "N-INS-1", to: "demo.service.inspecteur@example.test", roles: ["service_inspecteur"], title: "Dossier à contrôler", text: "DNG-2026-005 (SGI) est en étude. Contrôlez les pièces et l’ancienneté des récipiendaires.", date: "14/10/2026", time: "08:20", read: false, page: "instruction", ref: "DNG-2026-005", kind: "controle" },
    { id: "N-INS-2", to: "demo.service.inspecteur@example.test", roles: ["service_inspecteur"], title: "Nouveau document disponible", text: "La quittance QUI-2026-009 a été versée au dossier DNG-2026-009.", date: "13/10/2026", time: "16:05", read: false, page: "justificatifs", ref: "DNG-2026-009", kind: "document" },
    { id: "N-INS-3", to: "demo.service.inspecteur@example.test", roles: ["service_inspecteur"], title: "Complément demandé", text: "Un justificatif d’ancienneté est attendu pour Alain Moussavou (DNG-2026-005).", date: "22/09/2026", time: "10:14", read: false, page: "justificatifs", ref: "DNG-2026-005", kind: "complement" },
    { id: "N-INS-4", to: "demo.service.inspecteur@example.test", roles: ["service_inspecteur"], title: "Retrait sans cérémonie", text: "La demande SUIVI-246810 (Alain Moussavou) attend la vérification de la quittance et de l’autorisation.", date: "10/10/2026", time: "09:40", read: false, page: "retraits", ref: "RET-001", kind: "retrait" },
    { id: "N-INS-5", to: "demo.service.inspecteur@example.test", roles: ["service_inspecteur"], title: "Dossier transmis au Service", text: "DNG-2026-016 (MIN.TRAVAIL) a été approuvé le 12/10/2026 et rejoint la file de contrôle.", date: "12/10/2026", time: "11:02", read: true, page: "instruction", ref: "DNG-2026-016", kind: "maj" },
    { id: "N-SA-1", to: "demo.service.agent@example.test", roles: ["service_agent"], title: "Complément encore ouvert", text: "DNG-2026-005 : le justificatif d’ancienneté d’Alain Moussavou n’a pas encore été versé.", date: "14/10/2026", time: "09:10", read: false, page: "waiting-pieces", ref: "DNG-2026-005", kind: "complement" },
    { id: "N-SC-1", to: "demo.service.chef@example.test", roles: ["service_chef"], title: "Liste prête à notifier", text: "DNG-2026-006 : l’instruction des récipiendaires est achevée. La liste des validés peut être notifiée.", date: "14/10/2026", time: "08:45", read: false, page: "notify", ref: "DNG-2026-006", kind: "maj" },
  ];

  const journal = [
    { id: "J-1", date: "14/10/2026", actor: "Plateforme", action: "Ouverture de session", details: "Magasin initialisé", ip: "127.0.0.1" },
  ];
  const signatureJournal = [
    { id: "SJ-1", date: "15/01/2026", actor: "Claire Oyane", event: "activation", ip: "127.0.0.1" },
    { id: "SJ-2", date: "02/07/2026", actor: "Claire Oyane", event: "apposition", ip: "127.0.0.1" },
    { id: "SJ-3", date: "02/07/2026", actor: "Claire Oyane", event: "scellement", ip: "127.0.0.1" },
  ];

  const stats = {
    campaign: { year: "2026", submitted: 13, validated: 3, recipientsValidated: 8, or: 2, argent: 3, bronze: 5, diplomes: 0, amount: 78000, ceremonies: 0 },
    rankings: { topApplicant: "SGI", topMedal: "Bronze" },
    chainOk: true,
  };

  return {
    schema: 1, currency: CF_CURRENCY, tariffs: Object.assign({ OrAchat: 9000, ArgentAchat: 7000, BronzeAchat: 5000, updated: "01/09/2026" }, CF_TARIFFS),
    users, applicants, campaigns, dossiers, mails, documents, ceremonies,
    stock, movements, suppliers, purchaseOrders, deliveries, budget,
    withdrawals, stamps, signatures, notifications, journal, signatureJournal, stats,
  };
}

function cfDossier(base) {
  return Object.assign({
    pieces: ["Courrier d’initiation", "DTS"],
    history: [], indications: [], complements: [], recours: [], relances: [],
    negotiation: [], ceremony: null, ceremonyRequest: null, order: null, quittance: null, remise: null,
    transmitted: false, notified: false, listAccepted: false, horsDelai: false, location: "—",
    delegues: [],
  }, base);
}

function cfNoticeCatalog() {
  const seeded = cfSeed().notifications || [];
  return seeded;
}
function cfHydrateNotices(store) {
  if (!store) return store;
  store.notifications = store.notifications || [];
  const have = new Set(store.notifications.map((n) => n.id));
  cfNoticeCatalog().forEach((n) => {
    if (!have.has(n.id)) store.notifications.unshift(n);
  });
  return store;
}
function cfLoad() {
  if (cfLive) return cfLive;
  try {
    const raw = window.localStorage.getItem(CF_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.schema === 1 && Array.isArray(parsed.dossiers) && parsed.dossiers.length >= 10) {
        cfLive = cfHydrateNotices(parsed);
        cfSave();
        return cfLive;
      }
    }
  } catch { /* ignore */ }
  cfLive = cfSeed();
  cfSave();
  return cfLive;
}
function cfSave() {
  try { window.localStorage.setItem(CF_STORE_KEY, JSON.stringify(cfLive)); } catch { /* ignore */ }
}
function cfSnapshot() {
  try { cfUndoSnap = cfClone(cfLive); } catch { cfUndoSnap = null; }
}
function cfUndo() {
  if (!cfUndoSnap) return { ok: false };
  cfLive = cfUndoSnap;
  cfUndoSnap = null;
  cfSave();
  return { ok: true };
}
function cfReset() {
  cfLive = cfSeed();
  cfUndoSnap = null;
  try { window.localStorage.removeItem(CF_STORE_KEY); } catch { /* ignore */ }
  cfSave();
  return cfLive;
}
function cfS() { return cfLoad(); }

function cfEmail() {
  try { return window.sessionStorage.getItem("dn.presentation.email") || window.__demoEmail || (typeof getSession === "function" && getSession() && getSession().email) || ""; }
  catch { return window.__demoEmail || ""; }
}
function cfUser() {
  const email = String(cfEmail() || "").toLowerCase();
  const users = cfS().users;
  if (email) return users.find((u) => u.email === email) || null;
  const role = (typeof cfState !== "undefined" && cfState.spaceRole) || (typeof presentationProfile === "function" && presentationProfile()) || (typeof getSession === "function" && getSession() && getSession().role) || "";
  if (role === "demandeur") return users.find((u) => u.role === "demandeur" && u.applicantId === "APP-SGI") || users.find((u) => u.role === "demandeur") || null;
  return users.find((u) => u.role === role) || null;
}
function cfRole() {
  const u = cfUser();
  if (u) return u.role;
  return (typeof cfState !== "undefined" && cfState.spaceRole) || (typeof presentationProfile === "function" && presentationProfile()) || (typeof getSession === "function" && getSession() && getSession().role) || "";
}
function cfIsService(role) { return ["service_agent", "service_inspecteur", "service_chef"].includes(role || cfRole()); }
function cfIsSec(role) { return String(role || cfRole()).startsWith("secretariat_"); }
function cfIsAuth(role) { return ["ministre", "dgt", "dr"].includes(role || cfRole()); }
function cfLevelOf(role) {
  const r = role || cfRole();
  if (r === "secretariat_ministre" || r === "ministre") return "ministre";
  if (r === "secretariat_dgt" || r === "dgt") return "dgt";
  if (r === "secretariat_dr" || r === "dr") return "dr";
  return null;
}
function cfApplicantId() {
  const u = cfUser();
  return u && u.applicantId;
}
function cfFindDossier(idOrRef) {
  return cfS().dossiers.find((d) => d.id === idOrRef || d.ref === idOrRef) || null;
}
function cfApplicant(id) { return cfS().applicants.find((a) => a.id === id) || null; }
function cfCampaign(year) { return cfS().campaigns.find((c) => c.year === String(year)) || cfS().campaigns[0]; }
function cfInDeposit(date) {
  const c = cfCampaign("2026");
  const d = cfParseFr(date || CF_TODAY_FR);
  const a = cfParseFr(c.depositStart), b = cfParseFr(c.depositEnd);
  return d && a && b && d >= a && d <= b;
}

function cfNotify(targets, text, page, ref) {
  const s = cfS();
  const rec = { id: cfUid("N"), to: Array.isArray(targets) ? targets[0] : targets, roles: Array.isArray(targets) ? targets : [targets], text, date: CF_TODAY_FR, read: false, page: page || "overview", ref: ref || "" };
  s.notifications.unshift(rec);
  cfSave();
  return rec;
}
function cfHist(dossier, line) {
  dossier.history = dossier.history || [];
  dossier.history.push([CF_TODAY_FR, line]);
}
function cfSaveDelDraft(id, data) {
  const d = cfFindDossier(id);
  if (!d) return { ok: false, error: "Dossier introuvable." };
  d.delegationDraft = {
    nom: String((data && data.nom) || "").trim(),
    fonction: String((data && data.fonction) || "").trim(),
    organisme: String((data && data.organisme) || "").trim(),
    saved: CF_TODAY_FR,
    by: (cfUser() && cfUser().id) || "",
  };
  cfHist(d, "Brouillon de délégation enregistré (document interne, modèle officiel non figé).");
  cfLog("Délégation (brouillon)", d.ref);
  cfSave();
  return { ok: true };
}
function cfLog(action, details) {
  const u = cfUser();
  cfS().journal.unshift({ id: cfUid("J"), date: CF_TODAY_FR, actor: u ? u.prenom + " " + u.nom : "Système", action, details: details || "", ip: "127.0.0.1" });
}
function cfSigLog(event, actor) {
  cfS().signatureJournal.unshift({ id: cfUid("SJ"), date: CF_TODAY_FR, actor: actor || "Système", event, ip: "127.0.0.1" });
}

function cfVisibleDossiers(role) {
  const s = cfS();
  const r = role || cfRole();
  if (r === "demandeur") {
    const aid = cfApplicantId();
    return s.dossiers.filter((d) => d.applicantId === aid);
  }
  if (cfIsSec(r)) {
    const level = cfLevelOf(r);
    const ids = new Set(s.mails.filter((m) => m.level === level).map((m) => m.dossierId));
    return s.dossiers.filter((d) => ids.has(d.id));
  }
  if (cfIsAuth(r)) {
    const level = cfLevelOf(r);
    /* Dossier « final » pour ministre / DGT : liste définitive (VALIDE et suites) ou rejet.
       SOUMIS / EN_ETUDE / APPROUVE restent dans le circuit secrétariat → DR → Service. */
    const FINAL = ["VALIDE", "REJETE", "ORDRE_EMIS", "PAYE", "MEDAILLES_REMISES", "CEREMONIE_PLANIFIEE", "CLOTURE"];
    if (level === "ministre" || level === "dgt") {
      return s.dossiers.filter((d) => FINAL.includes(d.status));
    }
    const ids = new Set(s.mails.filter((m) => m.level === level && m.phase === "autorite").map((m) => m.dossierId));
    return s.dossiers.filter((d) => ids.has(d.id) || ["APPROUVE", "REJETE", "EN_ETUDE", "VALIDE"].includes(d.status));
  }
  if (cfIsService(r)) return s.dossiers.filter((d) => ["APPROUVE", "EN_ETUDE", "VALIDE", "ORDRE_EMIS", "PAYE", "MEDAILLES_REMISES", "CEREMONIE_PLANIFIEE", "CLOTURE"].includes(d.status));
  if (r === "regisseur") return s.dossiers.filter((d) => ["ORDRE_EMIS", "PAYE", "MEDAILLES_REMISES", "CEREMONIE_PLANIFIEE", "CLOTURE"].includes(d.status));
  if (r === "admin") return s.dossiers.slice();
  if (r === "recipient") {
    const u = cfUser();
    const cni = u && u.cni;
    const nom = u && u.nom;
    const prenom = u && u.prenom;
    return s.dossiers.filter((d) => (d.recipients || []).some((rec) =>
      (cni && rec.cni === cni) || (nom && prenom && rec.nom === nom && rec.prenom === prenom)
    ));
  }
  return [];
}

function cfInbox(role) {
  const level = cfLevelOf(role);
  return cfS().mails.filter((m) => m.level === level && m.phase === "secretariat" && m.status === "a_transmettre");
}
function cfRegisterMail(mailId) {
  const mail = cfS().mails.find((m) => m.id === mailId);
  if (!mail) return { ok: false, error: "Courrier introuvable." };
  mail.status = "a_transmettre";
  mail.registeredAt = CF_TODAY_FR;
  mail.refInterne = "SEC-" + mail.id;
  if (typeof cfSave === "function") cfSave();
  return { ok: true, mail };
}
function cfAuthQueue(role, type) {
  const level = cfLevelOf(role);
  const mails = cfS().mails.filter((m) => m.level === level && m.phase === "autorite");
  return mails.filter((m) => !type || m.type === type).map((m) => ({ mail: m, dossier: cfFindDossier(m.dossierId) })).filter((x) => x.dossier);
}
function cfTodoDemandeur() {
  const list = [];
  cfVisibleDossiers("demandeur").forEach((d) => {
    (d.complements || []).filter((c) => c.status === "ouvert").forEach((c) => list.push({ id: d.id, kind: "complement", label: "Complément sur " + d.ref, page: "dossiers" }));
    if (d.notified && !d.listAccepted && d.status === "EN_ETUDE") list.push({ id: d.id, kind: "liste", label: "Accepter ou contester la liste — " + d.ref, page: "dossiers" });
    if (d.status === "ORDRE_EMIS" && !d.quittance) list.push({ id: d.id, kind: "ordre", label: "Payer au Trésor et téléverser la quittance — " + d.ref, page: "dossiers" });
    if (d.status === "ORDRE_EMIS" && d.quittance && !d.quittance.conforme) list.push({ id: d.id, kind: "quittance", label: "Quittance en vérification — " + d.ref, page: "dossiers" });
    if (d.ceremonyRequest && d.ceremonyRequest.status === "negociation") list.push({ id: d.id, kind: "date", label: "Confirmer la date de cérémonie — " + d.ref, page: "dossiers" });
    if (d.status === "CEREMONIE_PLANIFIEE" && !(d.delegues || []).length) list.push({ id: d.id, kind: "delegation", label: "Compléter la délégation — " + d.ref, page: "dossiers" });
    if (d.status === "REJETE") list.push({ id: d.id, kind: "recours", label: "Dossier rejeté — recours possible — " + d.ref, page: "dossiers" });
  });
  return list;
}

function cfCanOpenDoc(doc, roleOverride) {
  const r = roleOverride || cfRole();
  if (!doc) return false;
  const rawId = doc.dossierId || doc.id || doc;
  const d = typeof rawId === "string" ? cfFindDossier(rawId) : null;
  if (!d || !rawId) return false;
  if (r === "admin") return false;
  if (r === "demandeur") return d.applicantId === cfApplicantId();
  if (cfIsSec(r)) return cfVisibleDossiers(r).some((x) => x.id === d.id) || cfInbox(r).some((m) => m.dossierId === d.id);
  return cfVisibleDossiers(r).some((x) => x.id === d.id);
}

/* ---- mutations ---- */

function cfDeposit(payload) {
  const s = cfS();
  const aid = cfApplicantId();
  const app = cfApplicant(aid);
  if (!app || !app.estReconnu) return { ok: false, error: "Votre structure n’est pas encore reconnue, le dépôt est impossible." };
  const n = s.dossiers.filter((d) => d.ref.startsWith("DNG-2026-")).length + 16;
  const ref = "DNG-2026-" + String(n).padStart(3, "0");
  const hors = !cfInDeposit(CF_TODAY_FR);
  const recs = (payload.recipients || []).map((r, i) => {
    const years = cfYears(r.start);
    const metal = r.metal || cfEligibleMedal(years) || "Bronze";
    return recLike(r, i, metal, years);
  });
  const kind = payload.kind || "nouvelle";
  const d = cfDossier({
    id: cfUid("D"), ref, campaign: "2026", applicantId: aid, destination: payload.destination || "dr",
    status: "SOUMIS", submitted: CF_TODAY_FR, location: "Secrétariat du " + CF_LEVEL_LABEL[payload.destination || "dr"],
    horsDelai: hors, recipients: recs, pieces: payload.pieces || ["Courrier d’initiation", "DTS"],
    kind, relatedRef: payload.relatedRef || "",
    files: payload.files || [],
    history: [[CF_TODAY_FR, "Dépôt " + kind + " — statut SOUMIS" + (hors ? " (hors délai)" : "")]],
  });
  s.dossiers.unshift(d);
  s.mails.unshift({ id: cfUid("M"), dossierId: d.id, type: "dossier", level: d.destination, phase: "secretariat", status: "a_transmettre", date: CF_TODAY_FR });
  s.stats.campaign.submitted += 1;
  cfHist(d, "Accusé de dépôt");
  cfNotify(CF_SEC_ROLE[d.destination], "Nouveau dossier " + ref + " à transmettre.", "inbox", ref);
  cfNotify(cfEmail(), "Accusé de dépôt " + ref + " — statut SOUMIS.", "dossiers", ref);
  cfLog("Dépôt de dossier", ref);
  cfSave();
  return { ok: true, dossier: d };
}
function recLike(r, i, metal, years) {
  return {
    id: r.id || cfUid("R"), cni: r.cni, nom: r.nom, prenom: r.prenom, poste: r.poste, start: r.start,
    nationalite: r.nationalite || "Gabonaise", countryCode: r.countryCode || "", sexe: r.sexe || "", dateDeces: r.dateDeces || null,
    situation: r.situation || "Vivant", review: r.review || "", complement: r.complement || null,
    medals: (r.metals || [metal]).map((m) => ({ metal: m, status: "EN_ATTENTE", motif: "", granted: null })),
    years: years, presence: null, remis: false, assouplissement: r.assouplissement || null,
  };
}

function cfTransmit(mailId, comment) {
  const s = cfS();
  const mail = s.mails.find((m) => m.id === mailId);
  if (!mail || mail.phase !== "secretariat") return { ok: false, error: "Courrier introuvable." };
  const d = cfFindDossier(mail.dossierId);
  if (mail.type === "dossier") {
    mail.level = "dr";
  }
  mail.phase = "autorite";
  mail.status = "ENVOYEE";
  mail.transmittedAt = CF_TODAY_FR;
  mail.comment = comment || "";
  if (d) {
    d.location = mail.type === "dossier" ? "Cabinet du Directeur régional" : ("Cabinet " + CF_LEVEL_LABEL[mail.level]);
    d.transmitted = true;
    d.secretariatOk = true;
    cfHist(d, mail.type === "dossier" ? "Transmis au Directeur régional (conformité confirmée)" : ("Transmis à l’autorité " + CF_LEVEL_LABEL[mail.level]));
  }
  cfNotify(mail.level, "Courrier " + (d ? d.ref : "") + " reçu (" + mail.type + ").", mail.type === "dossier" ? "dossiers" : mail.type, d && d.ref);
  cfLog("Transmission", mail.id);
  cfSave();
  return { ok: true };
}

function cfCascade(dossierId, indications) {
  const d = cfFindDossier(dossierId);
  const level = cfLevelOf();
  if (!d || !CF_NEXT_LEVEL[level]) return { ok: false, error: "Impossible de renvoyer ce dossier." };
  d.indications = d.indications || [];
  if (indications) d.indications.push({ by: CF_LEVEL_LABEL[level], date: CF_TODAY_FR, text: indications });
  const next = CF_NEXT_LEVEL[level];
  cfS().mails.unshift({ id: cfUid("M"), dossierId: d.id, type: "dossier", level: next, phase: "secretariat", status: "a_transmettre", date: CF_TODAY_FR });
  d.location = "Secrétariat " + CF_LEVEL_LABEL[next];
  cfHist(d, "Renvoyé au niveau " + CF_LEVEL_LABEL[next] + " avec indications");
  cfNotify(CF_SEC_ROLE[next], "Dossier " + d.ref + " à transmettre (descente).", "inbox", d.ref);
  cfLog("Cascade", d.ref);
  cfSave();
  return { ok: true };
}

function cfApprove(dossierId) {
  if (cfRole() !== "dr") return { ok: false, error: "Seul le DR rend la décision de première instance." };
  const d = cfFindDossier(dossierId);
  if (!d) return { ok: false, error: "Dossier introuvable." };
  d.status = "APPROUVE";
  d.approved = CF_TODAY_FR;
  d.location = "Service des Distinctions";
  cfHist(d, "Approuvé par le DR — envoyé au Service");
  cfNotify(["service_agent", "service_inspecteur", "service_chef"], "Dossier " + d.ref + " à étudier.", "instruction", d.ref);
  const app = cfApplicant(d.applicantId);
  if (app) cfNotify(app.email, "Votre dossier " + d.ref + " est accepté en première instance.", "dossiers", d.ref);
  cfLog("Approbation", d.ref);
  cfSave();
  return { ok: true };
}
function cfReject(dossierId, motif) {
  if (cfRole() !== "dr") return { ok: false, error: "Seul le DR peut rejeter." };
  const d = cfFindDossier(dossierId);
  if (!d) return { ok: false, error: "Dossier introuvable." };
  d.status = "REJETE";
  d.rejected = CF_TODAY_FR;
  d.rejectMotif = motif || "";
  cfHist(d, "Rejeté par le DR" + (motif ? " — " + motif : " (non motivé)"));
  const app = cfApplicant(d.applicantId);
  if (app) cfNotify(app.email, "Dossier " + d.ref + " rejeté. Un recours est possible.", "dossiers", d.ref);
  cfLog("Rejet", d.ref);
  cfSave();
  return { ok: true };
}

function cfFileRecours(dossierId, payload) {
  const d = cfFindDossier(dossierId);
  if (!d || (d.status !== "REJETE" && !(d.notified && !d.listAccepted))) return { ok: false, error: "Recours impossible sur ce dossier." };
  const rec = { id: cfUid("REC"), autorite: payload.autorite || "dr", motif: payload.motif, date: CF_TODAY_FR, status: "en attente", pieces: payload.pieces || [], contestation: d.notified && d.status === "EN_ETUDE" };
  d.recours = d.recours || [];
  d.recours.unshift(rec);
  cfS().mails.unshift({ id: cfUid("M"), dossierId: d.id, type: "recours", level: rec.autorite, phase: "secretariat", status: "a_transmettre", date: CF_TODAY_FR });
  cfHist(d, "Recours déposé auprès du " + CF_LEVEL_LABEL[rec.autorite]);
  cfNotify(CF_SEC_ROLE[rec.autorite], "Recours sur " + d.ref + ".", "inbox", d.ref);
  cfLog("Recours", d.ref);
  cfSave();
  return { ok: true, recours: rec };
}
function cfDecideRecours(dossierId, accept, indications, motif) {
  const d = cfFindDossier(dossierId);
  const rec = (d && d.recours || []).find((x) => x.status === "en attente");
  if (!d || !rec) return { ok: false, error: "Aucun recours en attente." };
  const app = cfApplicant(d.applicantId);
  if (accept) {
    rec.status = "accepté";
    rec.indications = indications || "";
    d.status = "EN_ETUDE";
    d.location = "Service des Distinctions";
    cfHist(d, "Recours accepté — retour en étude");
    cfNotify(["service_agent", "service_inspecteur", "service_chef"], "Dossier " + d.ref + " de retour en étude (recours).", "instruction", d.ref);
    if (app) cfNotify(app.email, "Recours accepté sur " + d.ref + ".", "dossiers", d.ref);
  } else {
    rec.status = "rejeté";
    rec.motifRejet = motif || "";
    d.status = "REJETE";
    cfHist(d, "Recours rejeté — " + (motif || ""));
    if (app) cfNotify(app.email, "Recours rejeté sur " + d.ref + ". Un nouveau recours est possible.", "dossiers", d.ref);
  }
  cfLog("Décision recours", d.ref);
  cfSave();
  return { ok: true };
}

function cfStartStudy(dossierId) {
  const d = cfFindDossier(dossierId);
  if (!d || d.status !== "APPROUVE") return { ok: false, error: "Dossier non approuvé." };
  d.status = "EN_ETUDE";
  cfHist(d, "Instruction ouverte");
  const app = cfApplicant(d.applicantId);
  if (app) cfNotify(app.email, "Dossier " + d.ref + " en étude.", "dossiers", d.ref);
  cfSave();
  return { ok: true };
}
function cfFlagAnomaly(dossierId, recId, motif) {
  const d = cfFindDossier(dossierId);
  if (!d) return { ok: false, error: "Dossier introuvable." };
  const r = recId && (d.recipients || []).find((x) => x.id === recId);
  const who = r ? (r.prenom + " " + r.nom) : "dossier";
  const u = typeof cfUser === "function" ? cfUser() : null;
  d.anomalies = d.anomalies || [];
  d.anomalies.unshift({
    id: cfUid("ANO"),
    recipientId: recId || null,
    texte: motif || "Anomalie",
    motif: motif || "Anomalie",
    by: u ? (u.prenom + " " + u.nom) : (typeof cfRole === "function" ? cfRole() : "—"),
    date: CF_TODAY_FR,
  });
  cfHist(d, "Anomalie — " + who + (motif ? " : " + motif : ""));
  cfLog("Anomalie signalée", who);
  cfSave();
  return { ok: true };
}
function cfDecideRecipient(dossierId, recId, decision, motif, metals) {
  const d = cfFindDossier(dossierId);
  const r = d && (d.recipients || []).find((x) => x.id === recId);
  if (!r) return { ok: false, error: "Récipiendaire introuvable." };
  (r.medals || []).forEach((m) => {
    if (decision === "VALIDE") {
      m.status = "VALIDE";
      m.granted = (metals && metals[0]) || m.metal;
    } else if (decision === "REFUSE") {
      m.status = "REFUSE";
      m.motif = motif || "";
      m.granted = null;
    }
  });
  if (decision === "REFUSE" && !motif) return { ok: false, error: "Un motif est obligatoire pour un refus." };
  cfHist(d, (r.prenom + " " + r.nom) + " — " + (decision === "VALIDE" ? "validé" : "refusé"));
  cfLog("Décision individuelle", r.nom);
  cfSave();
  return { ok: true };
}
function cfAskComplement(dossierId, recId, objet) {
  const d = cfFindDossier(dossierId);
  if (!d) return { ok: false, error: "Dossier introuvable." };
  d.complements = d.complements || [];
  d.complements.unshift({ id: cfUid("CPL"), recipientId: recId || null, objet, date: CF_TODAY_FR, status: "ouvert", reponse: null });
  d.status = "EN_ETUDE";
  cfHist(d, "Complément demandé" + (recId ? " (ciblé)" : ""));
  const app = cfApplicant(d.applicantId);
  if (app) cfNotify(app.email, "Complément demandé sur " + d.ref + " : " + objet, "dossiers", d.ref);
  cfSave();
  return { ok: true };
}
function cfAnswerComplement(dossierId, cplId, texte, piece) {
  const d = cfFindDossier(dossierId);
  const c = d && (d.complements || []).find((x) => x.id === cplId);
  if (!c) return { ok: false, error: "Demande introuvable." };
  c.status = "ferme";
  c.reponse = { texte, piece: piece && piece.name ? piece.name : piece, file: piece && piece.dataUrl ? piece : null, date: CF_TODAY_FR };
  cfHist(d, "Réponse au complément");
  cfNotify(["service_agent", "service_inspecteur", "service_chef"], "Réponse au complément sur " + d.ref + ".", "instruction", d.ref);
  cfSave();
  return { ok: true };
}
function cfNotifyList(dossierId) {
  const d = cfFindDossier(dossierId);
  if (!d) return { ok: false, error: "Dossier introuvable." };
  const pending = (d.recipients || []).some((r) => (r.medals || []).some((m) => m.status === "EN_ATTENTE"));
  if (pending) return { ok: false, error: "Tous les récipiendaires doivent être décidés." };
  d.notified = true;
  d.notifiedDate = CF_TODAY_FR;
  d.status = "EN_ETUDE";
  cfHist(d, "Liste des validés notifiée");
  const app = cfApplicant(d.applicantId);
  if (app) cfNotify(app.email, "Liste des validés à accepter ou contester — " + d.ref, "dossiers", d.ref);
  cfSave();
  return { ok: true };
}
function cfAcceptList(dossierId) {
  const d = cfFindDossier(dossierId);
  if (!d || !d.notified) return { ok: false, error: "Liste non notifiée." };
  d.listAccepted = true;
  d.status = "VALIDE";
  cfHist(d, "Liste acceptée — VALIDE");
  cfNotify(["service_agent", "service_inspecteur", "service_chef"], "Dossier " + d.ref + " validé, prêt pour l’ordre de recette.", "orders", d.ref);
  cfSave();
  return { ok: true };
}

function cfIssueOrder(dossierId) {
  const d = cfFindDossier(dossierId);
  if (!d || d.status !== "VALIDE") return { ok: false, error: "Dossier non validé." };
  const lines = [];
  (d.recipients || []).forEach((r) => {
    (r.medals || []).filter((m) => m.status === "VALIDE").forEach((m) => {
      lines.push({ name: r.prenom + " " + r.nom, metal: m.granted || m.metal, medal: CF_TARIFFS[m.granted || m.metal], diplome: CF_TARIFFS.diplome });
    });
  });
  const amount = lines.reduce((sum, l) => sum + l.medal + l.diplome, 0);
  d.order = { ref: "OR-" + d.ref.replace("DNG-", ""), date: CF_TODAY_FR, amount, lines, signStatus: "NON_SIGNE", sealed: false };
  d.status = "ORDRE_EMIS";
  cfS().documents.unshift({ id: cfUid("DOC"), dossierId: d.id, name: "Ordre de recette " + d.order.ref, origin: "généré", format: "PDF", date: CF_TODAY_FR, signStatus: "NON_SIGNE", numero: d.order.ref, cachet: null, visas: [], sealed: false, pages: 1 });
  cfHist(d, "Ordre de recette émis — " + cfMoney(amount));
  const app = cfApplicant(d.applicantId);
  if (app) cfNotify(app.email, "Ordre de recette " + d.order.ref + " à payer au Trésor.", "dossiers", d.ref);
  cfNotify("regisseur", "Ordre " + d.order.ref + " à suivre.", "remises", d.ref);
  cfLog("Ordre de recette", d.ref);
  cfSave();
  return { ok: true, order: d.order };
}
function cfUploadQuittance(dossierId, payload) {
  const d = cfFindDossier(dossierId);
  if (!d || d.status !== "ORDRE_EMIS") return { ok: false, error: "Aucun ordre à acquitter." };
  d.quittance = { scan: payload.scan || (payload.file && payload.file.name) || "quittance.pdf", numero: payload.numero, montant: Number(payload.montant) || (d.order && d.order.amount), date: payload.date || CF_TODAY_FR, uploaded: CF_TODAY_FR, file: payload.file || null };
  cfHist(d, "Quittance téléversée");
  cfNotify("regisseur", "Quittance à vérifier — " + d.ref, "remises", d.ref);
  cfSave();
  return { ok: true };
}
function cfVerifyQuittance(dossierId, ok, motif) {
  const d = cfFindDossier(dossierId);
  if (!d || !d.quittance) return { ok: false, error: "Pas de quittance." };
  const app = cfApplicant(d.applicantId);
  if (ok) {
    d.quittance.conforme = true;
    d.status = "PAYE";
    cfHist(d, "Quittance conforme — PAYE");
    if (app) cfNotify(app.email, "Paiement confirmé pour " + d.ref + ".", "dossiers", d.ref);
  } else {
    d.quittance.conforme = false;
    d.quittance.motif = motif || "";
    cfHist(d, "Quittance non conforme");
    if (app) cfNotify(app.email, "Quittance non conforme sur " + d.ref + " — " + (motif || ""), "dossiers", d.ref);
  }
  cfSave();
  return { ok: true };
}
function cfRemise(dossierId, payload) {
  const d = cfFindDossier(dossierId);
  if (!d || d.status !== "PAYE") return { ok: false, error: "Dossier non payé." };
  const metals = payload.metals || [];
  const need = {};
  metals.forEach((m) => { need[m] = (need[m] || 0) + 1; });
  const s = cfS();
  for (const m of Object.keys(need)) {
    if ((s.stock[m] || 0) < need[m]) return { ok: false, error: "Stock insuffisant pour " + m + ".", stock: true };
  }
  metals.forEach((m) => {
    s.stock[m] -= 1;
    s.movements.unshift({ id: cfUid("MV"), date: CF_TODAY_FR, metal: m, sens: "sortie", qty: 1, motif: "Remise " + d.ref, agent: (cfUser() && (cfUser().prenom + " " + cfUser().nom)) || "Régisseur", livraison: null });
  });
  d.remise = { retirant: payload.retirant, qualite: payload.qualite, piece: payload.piece, date: CF_TODAY_FR, metals, observations: payload.observations || "" };
  (d.recipients || []).forEach((r) => {
    if ((r.medals || []).some((m) => m.status === "VALIDE" && metals.includes(m.granted || m.metal))) r.remis = true;
  });
  const all = (d.recipients || []).every((r) => !(r.medals || []).some((m) => m.status === "VALIDE") || r.remis);
  if (all) d.status = "MEDAILLES_REMISES";
  cfHist(d, "Remise enregistrée" + (all ? " — MEDAILLES_REMISES" : " (partielle)"));
  const app = cfApplicant(d.applicantId);
  if (app) cfNotify(app.email, "Médailles remises pour " + d.ref + ". Les diplômes restent au Ministère jusqu’à la cérémonie.", "dossiers", d.ref);
  cfSave();
  return { ok: true };
}

function cfAskCeremony(dossierId, payload) {
  const d = cfFindDossier(dossierId);
  if (!d || !["VALIDE", "PAYE", "MEDAILLES_REMISES"].includes(d.status)) return { ok: false, error: "Cérémonie impossible à ce stade." };
  d.ceremonyRequest = { autorite: payload.autorite || "dr", dateSouhaitee: payload.date, lieuSouhaite: payload.lieu, status: "demande" };
  cfS().mails.unshift({ id: cfUid("M"), dossierId: d.id, type: "ceremonie", level: d.ceremonyRequest.autorite, phase: "secretariat", status: "a_transmettre", date: CF_TODAY_FR });
  cfHist(d, "Demande de cérémonie");
  cfNotify(CF_SEC_ROLE[d.ceremonyRequest.autorite], "Demande de cérémonie " + d.ref, "inbox", d.ref);
  cfSave();
  return { ok: true };
}
function cfValidateCeremonyRequest(dossierId, comment) {
  const d = cfFindDossier(dossierId);
  if (!d || !d.ceremonyRequest) return { ok: false, error: "Pas de demande." };
  d.ceremonyRequest.status = "validee";
  d.ceremonyRequest.comment = comment || "";
  cfHist(d, "Demande de cérémonie validée — transmise au Service");
  cfNotify(["service_agent", "service_inspecteur", "service_chef"], "Demande de cérémonie validée — " + d.ref, "ceremonies", d.ref);
  cfSave();
  return { ok: true };
}
function cfPlanOfficial(dossierId) {
  const d = cfFindDossier(dossierId);
  const c = cfCampaign(d && d.campaign);
  if (!d) return { ok: false, error: "Dossier introuvable." };
  d.ceremony = { type: "officielle", date: c.ceremonyDate, place: c.ceremonyPlace, status: "confirmée" };
  d.status = "CEREMONIE_PLANIFIEE";
  cfHist(d, "Convocation — cérémonie officielle " + c.ceremonyDate);
  const app = cfApplicant(d.applicantId);
  if (app) cfNotify(app.email, "Convocation à la cérémonie officielle du " + c.ceremonyDate + ".", "dossiers", d.ref);
  cfSave();
  return { ok: true };
}
function cfNegotiate(dossierId, dateProp, lieu, accept) {
  const d = cfFindDossier(dossierId);
  if (!d) return { ok: false, error: "Dossier introuvable." };
  d.negotiation = d.negotiation || [];
  const who = cfRole() === "demandeur" ? "demandeur" : "service";
  if (accept) {
    const last = d.negotiation[d.negotiation.length - 1] || {};
    d.ceremony = { type: d.horsDelai ? "hors délai" : "rattrapage", date: last.dateProp || dateProp, place: last.lieu || lieu, status: "confirmée" };
    d.status = "CEREMONIE_PLANIFIEE";
    cfHist(d, "Date et lieu confirmés");
  } else {
    d.negotiation.push({ by: who, date: CF_TODAY_FR, dateProp, lieu });
    cfHist(d, "Proposition de date " + dateProp);
  }
  const other = who === "demandeur" ? ["service_agent", "service_inspecteur", "service_chef"] : (cfApplicant(d.applicantId) && cfApplicant(d.applicantId).email);
  if (other) cfNotify(other, "Proposition de cérémonie sur " + d.ref, who === "demandeur" ? "ceremonies" : "dossiers", d.ref);
  cfSave();
  return { ok: true };
}
function cfValidateDate(dossierId) {
  const d = cfFindDossier(dossierId);
  if (!d || !d.negotiation || !d.negotiation.length) return { ok: false, error: "Pas de négociation." };
  const last = d.negotiation[d.negotiation.length - 1];
  d.ceremony = { type: d.horsDelai ? "hors délai" : "rattrapage", date: last.dateProp, place: last.lieu, status: "confirmée" };
  d.status = "CEREMONIE_PLANIFIEE";
  cfHist(d, "Date et lieu validés officiellement");
  const app = cfApplicant(d.applicantId);
  if (app) cfNotify(app.email, "Date de cérémonie confirmée : " + last.dateProp + " — " + last.lieu, "dossiers", d.ref);
  cfSave();
  return { ok: true };
}
function cfSetDelegues(dossierId, list) {
  const d = cfFindDossier(dossierId);
  if (!d) return { ok: false, error: "Dossier introuvable." };
  d.delegues = list || [];
  cfHist(d, "Délégation complétée");
  cfSave();
  return { ok: true };
}
function cfGenerateDelegation(dossierId) {
  const d = cfFindDossier(dossierId);
  if (!d) return { ok: false, error: "Dossier introuvable." };
  cfS().documents.unshift({ id: cfUid("DOC"), dossierId: d.id, name: "Document de délégation", origin: "généré", format: "PDF", date: CF_TODAY_FR, signStatus: "NON_SIGNE", numero: "DEL-" + d.ref, cachet: null, visas: [], sealed: false, pages: 1 });
  cfHist(d, "Document de délégation généré");
  const app = cfApplicant(d.applicantId);
  if (app) cfNotify(app.email, "Document de délégation reçu — " + d.ref, "dossiers", d.ref);
  cfSave();
  return { ok: true };
}
function cfGenerateDiplomas(dossierId) {
  const d = cfFindDossier(dossierId);
  if (!d) return { ok: false, error: "Dossier introuvable." };
  cfS().documents.unshift({ id: cfUid("DOC"), dossierId: d.id, name: "Diplômes de la cérémonie", origin: "généré", format: "PDF", date: CF_TODAY_FR, signStatus: "NON_SIGNE", numero: "DIP-" + d.ref, cachet: null, visas: [], sealed: false, pages: 3 });
  cfHist(d, "Diplômes générés");
  cfSave();
  return { ok: true };
}
function cfPresence(dossierId, recId, present) {
  const d = cfFindDossier(dossierId);
  const r = d && (d.recipients || []).find((x) => x.id === recId);
  if (!r) return { ok: false, error: "Récipiendaire introuvable." };
  r.presence = present ? "présent" : "absent";
  const allSet = (d.recipients || []).every((x) => x.presence);
  if (allSet) d.status = "CLOTURE";
  cfHist(d, r.prenom + " " + r.nom + " — " + r.presence + (allSet ? " — CLOTURE" : ""));
  cfSave();
  return { ok: true };
}

function cfFileRelance(dossierId, payload) {
  const d = cfFindDossier(dossierId);
  if (!d) return { ok: false, error: "Dossier introuvable." };
  const rel = { id: cfUid("REL"), autorite: payload.autorite || "dr", motif: payload.motif, date: CF_TODAY_FR, status: "EN_ATTENTE", pieces: payload.pieces || [] };
  d.relances = d.relances || [];
  d.relances.unshift(rel);
  cfS().mails.unshift({ id: cfUid("M"), dossierId: d.id, type: "relance", level: rel.autorite, phase: "secretariat", status: "a_transmettre", date: CF_TODAY_FR });
  cfHist(d, "Relance déposée");
  cfNotify(CF_SEC_ROLE[rel.autorite], "Relance sur " + d.ref, "inbox", d.ref);
  cfSave();
  return { ok: true };
}
function cfDecideRelance(dossierId, accept, indications) {
  const d = cfFindDossier(dossierId);
  const rel = d && (d.relances || []).find((x) => x.status === "EN_ATTENTE");
  if (!rel) return { ok: false, error: "Relance introuvable." };
  rel.status = accept ? "ACCEPTEE" : "REFUSEE";
  rel.indications = indications || "";
  cfHist(d, "Relance " + rel.status.toLowerCase());
  const app = cfApplicant(d.applicantId);
  if (accept) cfNotify(["service_agent", "service_inspecteur", "service_chef"], "Relance acceptée — ouvrir un rattrapage pour " + d.ref, "relances", d.ref);
  if (app) cfNotify(app.email, "Relance " + (accept ? "acceptée" : "refusée") + " — " + d.ref, "dossiers", d.ref);
  cfSave();
  return { ok: true };
}
function cfOpenCatchup(dossierId) {
  const d = cfFindDossier(dossierId);
  if (!d) return { ok: false, error: "Dossier introuvable." };
  d.ceremonyRequest = { autorite: "dr", dateSouhaitee: "", lieuSouhaite: "", status: "negociation" };
  d.negotiation = d.negotiation || [];
  cfHist(d, "Cérémonie de rattrapage ouverte");
  cfSave();
  return { ok: true };
}

function cfSubmitWithdrawal(payload) {
  const rec = {
    id: cfUid("RET"), tracking: "SUIVI-" + Math.floor(100000 + Math.random() * 900000),
    cni: payload.cni, nom: payload.nom, prenom: payload.prenom, structure: payload.structure, campaign: payload.campaign,
    retirantNom: payload.retirantNom, retirantPrenom: payload.retirantPrenom, lien: payload.lien || "lui-même",
    pieces: payload.pieces || ["justificatif-demo.pdf"], status: "en attente", date: CF_TODAY_FR, motif: null,
    lieu: "Régie des médailles — Libreville, 8h–15h",
  };
  cfS().withdrawals.unshift(rec);
  cfNotify("regisseur", "Demande de retrait " + rec.tracking + " à vérifier.", "retraits", rec.tracking);
  cfLog("Retrait sans cérémonie", rec.tracking);
  cfSave();
  return { ok: true, withdrawal: rec };
}
function cfDecideWithdrawal(id, ok, motif) {
  const w = cfS().withdrawals.find((x) => x.id === id || x.tracking === id);
  if (!w) return { ok: false, error: "Demande introuvable." };
  w.status = ok ? "autorise" : "refuse";
  w.motif = motif || "";
  cfNotify("recipient", ok ? "Retrait autorisé (" + w.tracking + "). " + w.lieu : "Retrait refusé : " + (motif || ""), "overview", w.tracking);
  cfSave();
  return { ok: true };
}

function cfAdjustStock(metal, sens, qty, motif) {
  if (!motif) return { ok: false, error: "Motif obligatoire." };
  const s = cfS();
  const n = Number(qty) || 0;
  if (sens === "sortie" && (s.stock[metal] || 0) < n) return { ok: false, error: "Stock insuffisant." };
  s.stock[metal] = (s.stock[metal] || 0) + (sens === "entrée" ? n : -n);
  s.movements.unshift({ id: cfUid("MV"), date: CF_TODAY_FR, metal, sens, qty: n, motif, agent: (cfUser() && (cfUser().prenom + " " + cfUser().nom)) || "Régisseur", livraison: null });
  cfSave();
  return { ok: true };
}
function cfCreateOrder(payload) {
  const rec = { id: cfUid("CMD"), fournisseurId: payload.fournisseurId, campaign: "2026", date: CF_TODAY_FR, status: "en cours", budget: Number(payload.budget) || 0, scan: payload.scan || "bc-demo.pdf", lines: payload.lines || [] };
  cfS().purchaseOrders.unshift(rec);
  cfS().budget.engage += rec.lines.reduce((sum, l) => sum + (l.qty * l.prix), 0);
  cfSave();
  return { ok: true, order: rec };
}
function cfReceiveDelivery(payload) {
  const rec = { id: cfUid("BL"), commandeId: payload.commandeId, date: CF_TODAY_FR, scan: payload.scan || "bl-demo.pdf", lines: payload.lines || [] };
  cfS().deliveries.unshift(rec);
  rec.lines.forEach((l) => {
    cfS().stock[l.metal] = (cfS().stock[l.metal] || 0) + Number(l.qty);
    cfS().movements.unshift({ id: cfUid("MV"), date: CF_TODAY_FR, metal: l.metal, sens: "entrée", qty: Number(l.qty), motif: "Livraison " + rec.id, agent: (cfUser() && (cfUser().prenom + " " + cfUser().nom)) || "Régisseur", livraison: rec.id });
  });
  cfSave();
  return { ok: true };
}
function cfSetTariff(metal, vente, achat) {
  if (metal === "diplome") cfS().tariffs.diplome = Number(vente);
  else {
    cfS().tariffs[metal] = Number(vente);
    cfS().tariffs[metal + "Achat"] = achat === "" ? null : Number(achat);
  }
  cfS().tariffs.updated = CF_TODAY_FR;
  cfSave();
  return { ok: true };
}

function cfVisa(docId) {
  const doc = cfS().documents.find((d) => d.id === docId);
  if (!doc || doc.sealed) return { ok: false, error: "Document scellé ou introuvable." };
  const u = cfUser();
  doc.visas = doc.visas || [];
  doc.visas.push({ name: u ? u.prenom + " " + u.nom : "Agent", date: CF_TODAY_FR, rang: doc.visas.length + 1 });
  cfSigLog("visa", u ? u.prenom + " " + u.nom : "");
  cfSave();
  return { ok: true };
}
function cfStamp(docId) {
  const doc = cfS().documents.find((d) => d.id === docId);
  const u = cfUser();
  if (!doc || doc.sealed) return { ok: false, error: "Impossible." };
  const st = cfS().stamps.find((s) => (s.agents || []).includes(u && u.id));
  if (!st) return { ok: false, error: "Vous n’êtes pas habilité à un cachet." };
  doc.cachet = st.libelle;
  cfSigLog("cachet", u.prenom + " " + u.nom);
  cfSave();
  return { ok: true };
}
function cfSignDoc(docId, code) {
  if (String(code) !== CF_CODE) return { ok: false, error: "Code incorrect." };
  const doc = cfS().documents.find((d) => d.id === docId);
  if (!doc || doc.sealed) return { ok: false, error: "Impossible." };
  doc.signStatus = "SIGNE_VISUELLEMENT";
  doc.pendingNumber = true;
  const d = cfFindDossier(doc.dossierId);
  if (d && d.order && doc.name.indexOf("Ordre") >= 0) d.order.signStatus = "SIGNE_VISUELLEMENT";
  cfSigLog("apposition", cfUser() ? cfUser().prenom + " " + cfUser().nom : "");
  cfSave();
  return { ok: true };
}
function cfAddNumber(docId, numero) {
  const doc = cfS().documents.find((d) => d.id === docId);
  if (!doc || !doc.pendingNumber) return { ok: false, error: "Pas en attente de numérotation." };
  doc.numero = numero;
  doc.pendingNumber = false;
  cfSigLog("ajout du numéro", cfUser() ? cfUser().prenom + " " + cfUser().nom : "");
  cfSave();
  return { ok: true };
}
function cfSeal(docId) {
  const doc = cfS().documents.find((d) => d.id === docId);
  if (!doc || doc.signStatus !== "SIGNE_VISUELLEMENT" || doc.pendingNumber) return { ok: false, error: "Le document doit être signé et numéroté." };
  doc.signStatus = "SIGNE_SCELLE";
  doc.sealed = true;
  cfSigLog("scellement", cfUser() ? cfUser().prenom + " " + cfUser().nom : "");
  cfSave();
  return { ok: true };
}

function cfCreateAccount(payload) {
  const rec = { id: cfUid("U"), email: payload.email, nom: payload.nom, prenom: payload.prenom, role: payload.role, actif: true, last: CF_TODAY_FR, applicantId: payload.applicantId || null };
  cfS().users.unshift(rec);
  cfLog("Création de compte", rec.email);
  cfSave();
  return { ok: true, user: rec };
}
function cfToggleUser(id, actif) {
  const u = cfS().users.find((x) => x.id === id);
  if (!u) return { ok: false };
  u.actif = actif;
  cfLog(actif ? "Activation" : "Désactivation", u.email);
  cfSave();
  return { ok: true };
}
function cfToggleApplicant(id, ok) {
  const a = cfApplicant(id);
  if (!a) return { ok: false };
  a.estReconnu = ok;
  cfSave();
  return { ok: true };
}
function cfSaveCampaign(payload) {
  const c = cfS().campaigns.find((x) => x.id === payload.id) || null;
  if (c) Object.assign(c, payload);
  else cfS().campaigns.unshift(Object.assign({ id: cfUid("CAMP"), status: "en cours", archive: null, prorogee: false }, payload));
  cfSave();
  return { ok: true };
}
function cfProroge(id, date) {
  const c = cfS().campaigns.find((x) => x.id === id);
  if (!c) return { ok: false };
  c.depositEnd = date;
  c.prorogee = true;
  cfSave();
  return { ok: true };
}
function cfCloseCampaign(id) {
  const c = cfS().campaigns.find((x) => x.id === id);
  if (!c) return { ok: false };
  c.status = "cloturee";
  c.archive = cfClone(cfS().stats.campaign);
  cfSave();
  return { ok: true };
}
function cfSetLocation(dossierId, loc) {
  const d = cfFindDossier(dossierId);
  if (!d) return { ok: false };
  d.location = loc;
  cfHist(d, "Localisation : " + loc);
  cfSave();
  return { ok: true };
}
function cfMarkRead(id) {
  const n = cfS().notifications.find((x) => x.id === id);
  if (n) n.read = true;
  cfSave();
}
function cfMarkAllRead() {
  const email = String(cfEmail() || "").toLowerCase();
  const role = cfRole();
  cfS().notifications.forEach((n) => {
    if (n.to === email || (n.roles || []).includes(role)) n.read = true;
  });
  cfSave();
}
function cfMyNotices() {
  const email = String(cfEmail() || "").toLowerCase();
  const role = cfRole();
  return cfS().notifications.filter((n) => (email && n.to === email) || (n.roles || []).includes(role));
}
function cfSearch(q) {
  const query = String(q || "").trim().toLowerCase();
  if (query.length < 2) return [];
  const out = [];
  cfVisibleDossiers().forEach((d) => {
    if (d.ref.toLowerCase().includes(query)) out.push({ kind: "dossier", id: d.id, label: d.ref, page: "dossiers" });
    (d.recipients || []).forEach((r) => {
      if ((r.nom + " " + r.prenom + " " + r.cni).toLowerCase().includes(query)) out.push({ kind: "récipiendaire", id: d.id, label: r.prenom + " " + r.nom + " — " + d.ref, page: "dossiers" });
    });
  });
  cfS().applicants.forEach((a) => {
    if (a.nom.toLowerCase().includes(query) && (cfIsService() || cfRole() === "admin")) out.push({ kind: "demandeur", id: a.id, label: a.nom, page: "applicants" });
  });
  return out.slice(0, 12);
}

const CfStore = { load: cfLoad, save: cfSave, reset: cfReset, get: cfS, user: cfUser, role: cfRole, snapshot: cfSnapshot, undo: cfUndo };
