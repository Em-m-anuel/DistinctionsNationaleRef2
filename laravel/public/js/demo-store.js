/* ==================================================================
   js/demo-store.js
   Données de démonstration enrichies + magasin unique partagé.

   Toutes les pages Employés, Distinctions, Finance, Dossiers et
   Cérémonies lisent et écrivent ici. Aucune copie contradictoire.
   Les montants sont fictifs et centralisés (DEMO_TARIFFS).
================================================================== */

const DEMO_TARIFFS = {
  Bronze: 12000,
  Argent: 18000,
  Or: 24000,
  note: "Barème de la campagne en vigueur.",
};

const DEMO_TODAY = new Date(2026, 9, 14);

const DEMO_NATIONALITIES = [
  "Gabonaise",
  "Camerounaise",
  "Congolaise",
  "Équatoguinéenne",
  "Sénégalaise",
  "Française",
  "Autre",
];

/** Lieux prédéfinis — mode démonstration, aucun géocodage réel. */
const DEMO_PLACES = [
  { id: "lvb-hotel-ville", name: "Hôtel de ville de Libreville", city: "Libreville", address: "Boulevard Triomphal, Boulevard de l’Indépendance, Libreville", lat: 0.3901, lng: 9.4544, x: 18, y: 28, image: "illustration" },
  { id: "lvb-conferences", name: "Salle des conférences — Libreville", city: "Libreville", address: "Centre-ville, Boulevard de l’Indépendance, Libreville", lat: 0.4162, lng: 9.4673, x: 20, y: 32, image: "illustration" },
  { id: "lvb-municipale", name: "Salle municipale de Libreville", city: "Libreville", address: "Quartier Glass, Boulevard de l’Indépendance, Libreville", lat: 0.398, lng: 9.451, x: 17, y: 34, image: "illustration" },
  { id: "lvb-ambassadeurs", name: "Salle des ambassadeurs — Libreville", city: "Libreville", address: "Boulevard de l’Indépendance", lat: 0.405, lng: 9.46, x: 21, y: 30, image: "illustration" },
  { id: "lvb-palais", name: "Palais présidentiel — Libreville", city: "Libreville", address: "Bord de mer, Boulevard de l’Indépendance, Libreville", lat: 0.392, lng: 9.442, x: 16, y: 26, image: "illustration" },
  { id: "pog-admin", name: "Centre administratif — Port-Gentil", city: "Port-Gentil", address: "Port-Gentil, Ogooué-Maritime", lat: -0.7193, lng: 8.7815, x: 8, y: 48, image: "illustration" },
  { id: "fcv-hotel", name: "Hôtel de ville — Franceville", city: "Franceville", address: "Franceville, Haut-Ogooué", lat: -1.6333, lng: 13.5833, x: 78, y: 62, image: "illustration" },
  { id: "oye-pref", name: "Préfecture — Oyem", city: "Oyem", address: "Oyem, Woleu-Ntem", lat: 1.5995, lng: 11.5793, x: 48, y: 12, image: "illustration" },
  { id: "lam-centre", name: "Centre culturel — Lambaréné", city: "Lambaréné", address: "Lambaréné, Moyen-Ogooué", lat: -0.7001, lng: 10.2406, x: 32, y: 46, image: "illustration" },
  { id: "mou-hotel", name: "Hôtel de ville — Mouila", city: "Mouila", address: "Mouila, Ngounié", lat: -1.8687, lng: 11.0559, x: 38, y: 68, image: "illustration" },
];

const DEMO_STORE_SCHEMA = 4;
const DEMO_STORE_KEY = "dn.demo.store.v4";
const DEMO_STORE_LEGACY_KEYS = ["dn.demo.store.v2", "dn.demo.store.v3"];

function demoClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function parseFrDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const text = String(value).trim();
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);
  const fr = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (fr) return new Date(+fr[3], +fr[2] - 1, +fr[1]);
  const dt = new Date(text);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatFrDate(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : parseFrDate(date);
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return dd + "/" + mm + "/" + d.getFullYear();
}

function formatIsoDate(date) {
  const d = date instanceof Date ? date : parseFrDate(date);
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return d.getFullYear() + "-" + mm + "-" + dd;
}

function monthsBetween(start, end) {
  const a = parseFrDate(start);
  const b = parseFrDate(end) || DEMO_TODAY;
  if (!a || !b) return 0;
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) months -= 1;
  return Math.max(0, months);
}

function seniorityLabel(start, end) {
  const months = monthsBetween(start, end);
  if (months < 1) return "Moins d’un mois";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years <= 0) return rest + " mois";
  const y = years + " an" + (years > 1 ? "s" : "");
  return rest ? y + " et " + rest + " mois" : y;
}

function seniorityBucket(start, end) {
  const years = monthsBetween(start, end) / 12;
  if (years < 5) return "Moins de 5 ans";
  if (years < 10) return "5 à 9 ans";
  if (years < 20) return "10 à 19 ans";
  if (years < 30) return "20 à 29 ans";
  return "30 ans et plus";
}

function seniorityYears(start, end) {
  return Math.max(0, Math.floor(monthsBetween(start, end) / 12));
}

function indicativeMedal(years) {
  const n = Number(years) || 0;
  if (n >= 30) return "Or";
  if (n >= 20) return "Argent";
  if (n >= 10) return "Bronze";
  return null;
}

function deathOlderThanTwoYears(dateStr, today) {
  const d = parseFrDate(dateStr);
  if (!d) return false;
  const ref = today instanceof Date ? today : DEMO_TODAY;
  const limit = new Date(ref.getFullYear() - 2, ref.getMonth(), ref.getDate());
  return d.getTime() < limit.getTime();
}

const DEMO_DESTINATIONS = [
  { id: "ministre", label: "Ministre" },
  { id: "dgt", label: "Direction Générale du Travail" },
  { id: "dr", label: "Direction Régionale du Travail" },
];

function demoFullName(person) {
  if (!person) return "";
  if (person.name) return person.name;
  return [person.prenom, person.nom].filter(Boolean).join(" ").trim();
}

function demoNorm(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function demoPlaceById(id) {
  return DEMO_PLACES.find((p) => p.id === id) || null;
}

function demoPlaceByName(name) {
  const n = demoNorm(name);
  return DEMO_PLACES.find((p) => demoNorm(p.name) === n || demoNorm(p.city) === n || demoNorm(p.name + " " + p.city).includes(n)) || null;
}

function medalAmount(medal) {
  return DEMO_TARIFFS[medal] || 0;
}

function orderIssued(order) {
  if (!order) return 0;
  return Number(order.amountIssued != null ? order.amountIssued : order.amount) || 0;
}

function orderPaid(order) {
  if (!order) return 0;
  if (order.amountPaid != null) return Number(order.amountPaid) || 0;
  if (["Quittance disponible", "Paiement enregistré", "En attente de vérification"].includes(order.state)) return orderIssued(order);
  return 0;
}

function orderRemaining(order) {
  if (!order) return 0;
  if (order.remaining != null) return Number(order.remaining) || 0;
  return Math.max(0, orderIssued(order) - orderPaid(order));
}

function financeStatus(order) {
  if (!order) return "Aucun ordre";
  const paid = orderPaid(order);
  const issued = orderIssued(order);
  if (order.state === "En attente de vérification") return "Paiement à vérifier";
  if (order.state === "Quittance disponible") return "Payé — quittance reçue";
  if (order.state === "Paiement enregistré") return "Payé — enregistré";
  if (paid <= 0) return "Reste à payer";
  if (paid < issued) return "Paiement partiel";
  return order.state;
}

function demoEmployee(base) {
  const nom = base.nom;
  const prenom = base.prenom;
  const name = prenom + " " + nom;
  return {
    id: base.id,
    nom,
    prenom,
    name,
    sexe: base.sexe || "Masculin",
    nationalite: base.nationalite || "Gabonaise",
    naturalise: !!base.naturalise,
    poste: base.poste || base.job || "",
    job: base.poste || base.job || "",
    start: base.start,
    end: base.end || null,
    status: base.status || "ACTIF",
    situationPhysique: base.situationPhysique || "Bien portant",
    degreMutilation: base.degreMutilation || null,
    pieceMedicale: base.pieceMedicale || null,
    dateDeces: base.dateDeces || null,
    acteDeces: base.acteDeces || null,
    workPermit: base.workPermit || null,
    naturalizationDoc: base.naturalizationDoc || null,
    lastActivity: base.lastActivity || base.start,
    lastActivityLabel: base.lastActivityLabel || "Fiche créée",
    invitationSent: base.status === "EN_ATTENTE",
    affiliations: base.affiliations || [
      {
        company: base.company || "Organisation",
        job: base.poste || base.job || "",
        start: base.start,
        end: base.end || null,
        status: base.status || "ACTIF",
        confirmed: base.status !== "EN_ATTENTE",
      },
    ],
  };
}

function enrichPortalDemo() {
  if (!PORTAL_DEMO || PORTAL_DEMO.__enriched) return;
  PORTAL_DEMO.__enriched = true;

  const enterpriseEmployees = [
    demoEmployee({
      id: "EMP-SGI-001", nom: "Moussavou", prenom: "Alain", sexe: "Masculin", nationalite: "Gabonaise",
      poste: "Technicien supérieur", start: "12/01/2018", status: "ACTIF",
      lastActivity: "26/09/2026", lastActivityLabel: "Inclus dans le dossier DNG-DEMO-2026-041",
      company: "Société Gabonaise des Infrastructures",
    }),
    demoEmployee({
      id: "EMP-SGI-002", nom: "Nguema", prenom: "Nadia", sexe: "Féminin", nationalite: "Gabonaise",
      poste: "Cheffe de projet", start: "03/05/2016", status: "ACTIF",
      lastActivity: "22/09/2026", lastActivityLabel: "Complément demandé — DNG-DEMO-2026-023",
      company: "Société Gabonaise des Infrastructures",
    }),
    demoEmployee({
      id: "EMP-SGI-003", nom: "Nziengui", prenom: "Imelda", sexe: "Féminin", nationalite: "Gabonaise",
      poste: "Chargée d’études", start: "04/02/2020", status: "ACTIF",
      lastActivity: "16/12/2024", lastActivityLabel: "Distinction d’argent remise",
      company: "Société Gabonaise des Infrastructures",
    }),
    demoEmployee({
      id: "EMP-SGI-004", nom: "Esono", prenom: "Sarah", sexe: "Féminin", nationalite: "Gabonaise",
      poste: "Responsable RH", start: "06/04/2014", status: "ACTIF",
      lastActivity: "02/07/2026", lastActivityLabel: "Ordre de recette — DNG-DEMO-2026-008",
      company: "Société Gabonaise des Infrastructures",
    }),
    demoEmployee({
      id: "EMP-SGI-005", nom: "Ondo", prenom: "Luc", sexe: "Masculin", nationalite: "Gabonaise",
      poste: "Conducteur de travaux", start: "13/03/2011", end: "30/06/2026", status: "TERMINE",
      lastActivity: "14/12/2025", lastActivityLabel: "Fin d’affiliation après cérémonie 2025",
      company: "Société Gabonaise des Infrastructures",
      affiliations: [
        { company: "Société Gabonaise des Infrastructures", job: "Conducteur de travaux", start: "13/03/2011", end: "30/06/2026", status: "TERMINE", confirmed: true },
      ],
    }),
    demoEmployee({
      id: "EMP-SGI-006", nom: "Okoumba", prenom: "Pierre", sexe: "Masculin", nationalite: "Gabonaise",
      poste: "Assistant technique", start: "01/10/2026", status: "EN_ATTENTE",
      lastActivity: "01/10/2026", lastActivityLabel: "Invitation d’affiliation envoyée (simulation)",
      company: "Société Gabonaise des Infrastructures",
    }),
    demoEmployee({
      id: "EMP-SGI-007", nom: "Diallo", prenom: "Fatou", sexe: "Féminin", nationalite: "Sénégalaise",
      poste: "Ingénieure qualité", start: "18/09/2019", status: "ACTIF",
      workPermit: "AUT-EMPLOI-DEMO-007.pdf",
      lastActivity: "15/08/2026", lastActivityLabel: "Fiche mise à jour",
      company: "Société Gabonaise des Infrastructures",
    }),
  ];

  PORTAL_DEMO.enterprise.employees = enterpriseEmployees;

  PORTAL_DEMO.enterprise.dossiers.push({
    ref: "DNG-DEMO-2026-030",
    campaign: "2026",
    date: "15/08/2026",
    status: "Ordre de recette émis",
    next: "Demander une cérémonie ou présenter la quittance",
    initial: "Direction Générale du Travail",
    recipients: ["Imelda Nziengui", "Fatou Diallo"],
    requested: ["Bronze", "Argent"],
    validated: ["Imelda Nziengui — Bronze", "Fatou Diallo — Argent"],
    steps: ["Soumis", "En transmission", "En instruction", "Approuvé", "Ordre de recette émis"],
    history: [["15/08/2026", "Soumis"], ["28/08/2026", "En transmission"], ["12/09/2026", "En instruction"], ["30/09/2026", "Approuvé"], ["06/10/2026", "Ordre de recette émis"]],
    pieces: ["Courrier d’initiation", "Liste des récipiendaires", "DTS", "Décision communiquée"],
    ceremony: null,
    order: "OR-DEMO-2026-030",
  });

  PORTAL_DEMO.enterprise.awards = [
    { name: "Alain Moussavou", employeeId: "EMP-SGI-001", medal: "Bronze", campaign: "2025", date: "14/12/2025", employer: "SGI", dossier: "DNG-DEMO-2025-012", validation: "Validée", remise: "Remise", remiseDate: "14/12/2025", ceremony: "CER-DEMO-2025-012" },
    { name: "Sarah Esono", employeeId: "EMP-SGI-004", medal: "Argent", campaign: "2025", date: "14/12/2025", employer: "SGI", dossier: "DNG-DEMO-2025-012", validation: "Validée", remise: "Remise", remiseDate: "14/12/2025", ceremony: "CER-DEMO-2025-012" },
    { name: "Luc Ondo", employeeId: "EMP-SGI-005", medal: "Or", campaign: "2025", date: "14/12/2025", employer: "SGI", dossier: "DNG-DEMO-2025-012", validation: "Validée", remise: "Remise", remiseDate: "14/12/2025", ceremony: "CER-DEMO-2025-012" },
    { name: "Nadia Nguema", employeeId: "EMP-SGI-002", medal: "Bronze", campaign: "2024", date: "16/12/2024", employer: "SGI", dossier: "DNG-DEMO-2024-005", validation: "Validée", remise: "Remise", remiseDate: "16/12/2024", ceremony: "CER-DEMO-2024-005" },
    { name: "Imelda Nziengui", employeeId: "EMP-SGI-003", medal: "Argent", campaign: "2024", date: "16/12/2024", employer: "SGI", dossier: "DNG-DEMO-2024-005", validation: "Validée", remise: "Remise", remiseDate: "16/12/2024", ceremony: "CER-DEMO-2024-005" },
    { name: "Alain Moussavou", employeeId: "EMP-SGI-001", medal: "Or", campaign: "2026", date: null, employer: "SGI", dossier: "DNG-DEMO-2026-008", validation: "Validée", remise: "En attente de remise", remiseDate: null, ceremony: "CER-DEMO-2026-008" },
    { name: "Sarah Esono", employeeId: "EMP-SGI-004", medal: "Argent", campaign: "2026", date: null, employer: "SGI", dossier: "DNG-DEMO-2026-008", validation: "Validée", remise: "En attente de remise", remiseDate: null, ceremony: "CER-DEMO-2026-008" },
    { name: "Alain Moussavou", employeeId: "EMP-SGI-001", medal: "Bronze", campaign: "2026", date: null, employer: "SGI", dossier: "DNG-DEMO-2026-041", validation: "En attente", remise: "En attente de remise", remiseDate: null, ceremony: null },
    { name: "Nadia Nguema", employeeId: "EMP-SGI-002", medal: "Argent", campaign: "2026", date: null, employer: "SGI", dossier: "DNG-DEMO-2026-041", validation: "En attente", remise: "En attente de remise", remiseDate: null, ceremony: null },
    { name: "Sarah Esono", employeeId: "EMP-SGI-004", medal: "Or", campaign: "2026", date: null, employer: "SGI", dossier: "DNG-DEMO-2026-041", validation: "En attente", remise: "En attente de remise", remiseDate: null, ceremony: null },
    { name: "Nadia Nguema", employeeId: "EMP-SGI-002", medal: "Bronze", campaign: "2026", date: null, employer: "SGI", dossier: "DNG-DEMO-2026-023", validation: "En attente", remise: "En attente de remise", remiseDate: null, ceremony: null },
    { name: "Alain Moussavou", employeeId: "EMP-SGI-001", medal: "Argent", campaign: "2026", date: null, employer: "SGI", dossier: "DNG-DEMO-2026-023", validation: "Refusée", remise: "Non remise", remiseDate: null, ceremony: null },
    { name: "Imelda Nziengui", employeeId: "EMP-SGI-003", medal: "Bronze", campaign: "2026", date: null, employer: "SGI", dossier: "DNG-DEMO-2026-030", validation: "Validée", remise: "En attente de remise", remiseDate: null, ceremony: null },
    { name: "Fatou Diallo", employeeId: "EMP-SGI-007", medal: "Argent", campaign: "2026", date: null, employer: "SGI", dossier: "DNG-DEMO-2026-030", validation: "Validée", remise: "En attente de remise", remiseDate: null, ceremony: null },
  ];

  PORTAL_DEMO.enterprise.orders = [
    { ref: "OR-DEMO-2026-008", dossier: "DNG-DEMO-2026-008", campaign: "2026", amount: 42000, amountIssued: 42000, amountPaid: 42000, remaining: 0, date: "02/07/2026", state: "En attente de vérification", paid: "18/07/2026", receipt: null },
    { ref: "OR-DEMO-2026-030", dossier: "DNG-DEMO-2026-030", campaign: "2026", amount: 30000, amountIssued: 30000, amountPaid: 0, remaining: 30000, date: "06/10/2026", state: "Émis", paid: null, receipt: null },
    { ref: "OR-DEMO-2025-012", dossier: "DNG-DEMO-2025-012", campaign: "2025", amount: 56000, amountIssued: 56000, amountPaid: 56000, remaining: 0, date: "02/09/2025", state: "Quittance disponible", paid: "18/09/2025", receipt: "QUI-DEMO-2025-012" },
    { ref: "OR-DEMO-2024-005", dossier: "DNG-DEMO-2024-005", campaign: "2024", amount: 32000, amountIssued: 32000, amountPaid: 32000, remaining: 0, date: "15/08/2024", state: "Quittance disponible", paid: "30/08/2024", receipt: "QUI-DEMO-2024-005" },
  ];

  PORTAL_DEMO.enterprise.ceremonies = [
    {
      id: "CER-DEMO-2026-008", iso: "2026-11-18", date: "18/11/2026", confirmedDate: "18/11/2026", time: "10:00",
      place: "Libreville — Salle des conférences", placeId: "lvb-conferences",
      address: "Centre-ville, Boulevard de l’Indépendance, Libreville", lat: 0.4162, lng: 9.4673,
      status: "Confirmée", confirmation: "Confirmée", period: "future", type: "Remise de distinctions",
      dossier: "DNG-DEMO-2026-008", campaign: "2026", person: "Alain Moussavou", medal: "Or",
      estimated: 80, presence: null,
      participants: [
        { name: "Alain Moussavou", employeeId: "EMP-SGI-001", role: "Récipiendaire", status: "Invité" },
        { name: "Sarah Esono", employeeId: "EMP-SGI-004", role: "Récipiendaire", status: "Confirmé" },
      ],
      history: [["02/10/2026", "Demande enregistrée"], ["08/10/2026", "Date et lieu confirmés par le Service"]],
      documents: ["Convocation"],
      notes: "Date et lieu confirmés par le service compétent.",
      imageKind: "illustration",
    },
    {
      id: "CER-DEMO-2025-012", iso: "2025-12-14", date: "14/12/2025", confirmedDate: "14/12/2025", time: "10:00",
      place: "Libreville — Hôtel de ville", placeId: "lvb-hotel-ville",
      address: "Boulevard Triomphal, Boulevard de l’Indépendance, Libreville", lat: 0.3901, lng: 9.4544,
      status: "Terminée", confirmation: "Confirmée", period: "past", type: "Remise de distinctions",
      dossier: "DNG-DEMO-2025-012", campaign: "2025", person: "Alain Moussavou", medal: "Bronze",
      estimated: 120, presence: "Présent",
      participants: [
        { name: "Alain Moussavou", employeeId: "EMP-SGI-001", role: "Récipiendaire", status: "Présent" },
        { name: "Sarah Esono", employeeId: "EMP-SGI-004", role: "Récipiendaire", status: "Présent" },
        { name: "Luc Ondo", employeeId: "EMP-SGI-005", role: "Récipiendaire", status: "Absent" },
      ],
      history: [["02/09/2025", "Demande"], ["14/12/2025", "Cérémonie réalisée"]],
      documents: ["Procès-verbal de remise"],
      notes: "",
      imageKind: "illustration",
    },
    {
      id: "CER-DEMO-2024-005", iso: "2024-12-16", date: "16/12/2024", confirmedDate: "16/12/2024", time: "15:00",
      place: "Libreville — Salle municipale", placeId: "lvb-municipale",
      address: "Quartier Glass, Boulevard de l’Indépendance, Libreville", lat: 0.398, lng: 9.451,
      status: "Terminée", confirmation: "Confirmée", period: "past", type: "Remise de distinctions",
      dossier: "DNG-DEMO-2024-005", campaign: "2024", person: "Nadia Nguema", medal: "Bronze",
      estimated: 60, presence: "Présent",
      participants: [
        { name: "Nadia Nguema", employeeId: "EMP-SGI-002", role: "Récipiendaire", status: "Présent" },
        { name: "Imelda Nziengui", employeeId: "EMP-SGI-003", role: "Récipiendaire", status: "Présent" },
      ],
      history: [["15/08/2024", "Demande"], ["16/12/2024", "Cérémonie réalisée"]],
      documents: ["Procès-verbal de remise"],
      notes: "",
      imageKind: "illustration",
    },
    {
      id: "CER-DEMO-2026-023-R", iso: "2026-09-30", date: "30/09/2026", confirmedDate: null, time: "14:00",
      place: "Port-Gentil — Centre administratif", placeId: "pog-admin",
      address: "Port-Gentil, Ogooué-Maritime", lat: -0.7193, lng: 8.7815,
      status: "Refusée", confirmation: "Proposée", period: "past", type: "Remise de distinctions",
      dossier: "DNG-DEMO-2026-023", campaign: "2026", person: "Nadia Nguema", medal: "Bronze",
      estimated: 30, presence: null,
      participants: [
        { name: "Nadia Nguema", employeeId: "EMP-SGI-002", role: "Récipiendaire", status: "Invité" },
        { name: "Alain Moussavou", employeeId: "EMP-SGI-001", role: "Récipiendaire", status: "Invité" },
      ],
      history: [["12/09/2026", "Demande enregistrée"], ["22/09/2026", "Demande refusée — dossier en complément"]],
      documents: [],
      notes: "Refusée car le dossier n’était pas en état d’être célébré.",
      imageKind: "illustration",
    },
  ];

  /* Ministère */
  PORTAL_DEMO.ministere.employees = [
    demoEmployee({
      id: "EMP-MIN-001", nom: "Nzamba", prenom: "Aimée", sexe: "Féminin", nationalite: "Gabonaise",
      poste: "Directrice de la réglementation", start: "02/01/2012", status: "ACTIF",
      lastActivity: "15/12/2025", lastActivityLabel: "Distinction d’argent remise",
      company: "Ministère du Travail et de la Fonction publique",
    }),
    demoEmployee({
      id: "EMP-MIN-002", nom: "Mbadinga", prenom: "Jean-Pierre", sexe: "Masculin", nationalite: "Gabonaise",
      poste: "Conseiller technique", start: "14/03/2009", status: "ACTIF",
      lastActivity: "15/12/2025", lastActivityLabel: "Distinction d’or remise",
      company: "Ministère du Travail et de la Fonction publique",
    }),
    demoEmployee({
      id: "EMP-MIN-003", nom: "Eyenga", prenom: "Lucie", sexe: "Féminin", nationalite: "Gabonaise",
      poste: "Chargée de mission", start: "06/09/2018", status: "ACTIF",
      lastActivity: "30/09/2026", lastActivityLabel: "Inclus dans DNG-DEMO-MIN-2026-002",
      company: "Ministère du Travail et de la Fonction publique",
    }),
    demoEmployee({
      id: "EMP-MIN-004", nom: "Bongo", prenom: "Marc", sexe: "Masculin", nationalite: "Camerounaise",
      poste: "Chargé d’études", start: "11/04/2021", status: "EN_ATTENTE",
      workPermit: "AUT-EMPLOI-DEMO-MIN-004.pdf",
      lastActivity: "02/10/2026", lastActivityLabel: "Invitation d’affiliation envoyée (simulation)",
      company: "Ministère du Travail et de la Fonction publique",
    }),
  ];

  PORTAL_DEMO.ministere.awards = [
    { name: "Aimée Nzamba", employeeId: "EMP-MIN-001", medal: "Argent", campaign: "2025", date: "15/12/2025", employer: "MIN.TRAVAIL", dossier: "DNG-DEMO-MIN-2025-005", validation: "Validée", remise: "Remise", remiseDate: "15/12/2025", ceremony: "CER-DEMO-MIN-2025-005" },
    { name: "Jean-Pierre Mbadinga", employeeId: "EMP-MIN-002", medal: "Or", campaign: "2025", date: "15/12/2025", employer: "MIN.TRAVAIL", dossier: "DNG-DEMO-MIN-2025-005", validation: "Validée", remise: "Remise", remiseDate: "15/12/2025", ceremony: "CER-DEMO-MIN-2025-005" },
    { name: "Aimée Nzamba", employeeId: "EMP-MIN-001", medal: "Bronze", campaign: "2026", date: null, employer: "MIN.TRAVAIL", dossier: "DNG-DEMO-MIN-2026-002", validation: "En attente", remise: "En attente de remise", remiseDate: null, ceremony: null },
    { name: "Jean-Pierre Mbadinga", employeeId: "EMP-MIN-002", medal: "Argent", campaign: "2026", date: null, employer: "MIN.TRAVAIL", dossier: "DNG-DEMO-MIN-2026-002", validation: "En attente", remise: "En attente de remise", remiseDate: null, ceremony: null },
    { name: "Lucie Eyenga", employeeId: "EMP-MIN-003", medal: "Or", campaign: "2026", date: null, employer: "MIN.TRAVAIL", dossier: "DNG-DEMO-MIN-2026-002", validation: "En attente", remise: "En attente de remise", remiseDate: null, ceremony: null },
  ];

  PORTAL_DEMO.ministere.orders = [
    { ref: "OR-DEMO-MIN-2025-005", dossier: "DNG-DEMO-MIN-2025-005", campaign: "2025", amount: 38000, amountIssued: 38000, amountPaid: 38000, remaining: 0, date: "02/09/2025", state: "Quittance disponible", paid: "20/09/2025", receipt: "QUI-DEMO-MIN-2025-005" },
  ];

  /* Personne — Alain Moussavou, employé SGI + invitation en attente. */
  PORTAL_DEMO.person.profile = Object.assign({}, PORTAL_DEMO.person.profile, {
    poste: "Technicien supérieur",
    start: "12/01/2018",
    situationPhysique: "Bien portant",
    naturalise: false,
  });
  PORTAL_DEMO.person.affiliations = [
    {
      id: "AFF-SGI-001", company: "Société Gabonaise des Infrastructures", job: "Technicien supérieur",
      start: "12/01/2018", end: null, status: "ACTIF", confirmed: true,
      orgKey: "enterprise", employeeId: "EMP-SGI-001",
    },
    {
      id: "AFF-KOMO-001", company: "Ateliers du Komo", job: "Technicien",
      start: "10/03/2006", end: "31/12/2017", status: "TERMINE", confirmed: true,
    },
    {
      id: "AFF-CMM-001", company: "Compagnie Minière de Moanda", job: "Contrôleur qualité",
      start: "01/10/2026", end: null, status: "EN_ATTENTE", confirmed: false,
    },
  ];
  const hasInviteAction = (PORTAL_DEMO.person.actions || []).some((a) => a.kind === "affiliation");
  if (!hasInviteAction) {
    PORTAL_DEMO.person.actions.unshift({
      title: "Confirmer une affiliation",
      context: "Invitation — Compagnie Minière de Moanda",
      detail: "Cette structure vous a enregistré. L’affiliation n’est pas confirmée tant que vous ne l’acceptez pas.",
      page: "employers",
      kind: "affiliation",
      affiliationId: "AFF-CMM-001",
    });
  }

  PORTAL_DEMO.person.awards = [
    {
      id: "PAW-2026-OR", name: "Alain Moussavou", medal: "Or", campaign: "2026", date: null,
      employer: "Société Gabonaise des Infrastructures", dossier: "DNG-DEMO-2026-008",
      validation: "Validée", remise: "En attente de remise", ceremony: "CER-DEMO-2026-008",
    },
    {
      id: "PAW-2025-BR", name: "Alain Moussavou", medal: "Bronze", campaign: "2025", date: "14/12/2025",
      employer: "Société Gabonaise des Infrastructures", dossier: "DNG-DEMO-2025-012",
      validation: "Validée", remise: "Remise", ceremony: "CER-DEMO-2025-012",
    },
    {
      id: "PAW-2016-AG", name: "Alain Moussavou", medal: "Argent", campaign: "2016", date: "17/12/2016",
      employer: "Ateliers du Komo", dossier: null,
      validation: "Validée", remise: "Remise", ceremony: null,
    },
  ];
  PORTAL_DEMO.person.ceremonies = [
    {
      id: "CER-DEMO-2026-008", iso: "2026-11-18", date: "18/11/2026", confirmedDate: "18/11/2026", time: "10:00",
      place: "Libreville — Salle des conférences", placeId: "lvb-conferences",
      address: "Centre-ville, Boulevard de l’Indépendance, Libreville", lat: 0.4162, lng: 9.4673,
      status: "Confirmée", confirmation: "Confirmée", period: "future", type: "Remise de distinctions",
      medal: "Or", campaign: "2026", dossier: "DNG-DEMO-2026-008",
      invitation: "Invité", presence: null, validation: "Validée", imageKind: "illustration",
    },
    {
      id: "CER-DEMO-2025-012", iso: "2025-12-14", date: "14/12/2025", confirmedDate: "14/12/2025", time: "10:00",
      place: "Libreville — Hôtel de ville", placeId: "lvb-hotel-ville",
      address: "Boulevard Triomphal, Boulevard de l’Indépendance, Libreville", lat: 0.3901, lng: 9.4544,
      status: "Terminée", confirmation: "Confirmée", period: "past", type: "Remise de distinctions",
      medal: "Bronze", campaign: "2025", dossier: "DNG-DEMO-2025-012",
      invitation: "Confirmé", presence: "Présent", validation: "Validée", imageKind: "illustration",
    },
  ];
  PORTAL_DEMO.person.photos = [
    {
      id: "P-DEMO-01", date: "14/12/2025", medal: "Bronze", ceremony: "CER-DEMO-2025-012",
      place: "Libreville — Hôtel de ville", visual: "bronze",
      context: "Cérémonie de Libreville — illustration conceptuelle ; aucune photographie personnelle fournie.",
    },
    {
      id: "P-DEMO-02", date: null, medal: null, ceremony: null, place: null, visual: null,
      context: "Image indisponible.",
    },
  ];
  PORTAL_DEMO.person.withdrawals = [];
  const hasWithdrawNotice = (PORTAL_DEMO.person.notices || []).some((n) => n.page === "withdrawals");
  if (!hasWithdrawNotice) {
    PORTAL_DEMO.person.notices.unshift({
      id: "P4",
      text: "Votre médaille d’or 2026 est validée. Un retrait sans cérémonie peut être demandé.",
      date: "14/10/2026",
      page: "withdrawals",
    });
  }

  PORTAL_DEMO.ministere.ceremonies = [
    {
      id: "CER-DEMO-MIN-2025-005", iso: "2025-12-15", date: "15/12/2025", confirmedDate: "15/12/2025", time: "10:00",
      place: "Libreville — Hôtel de ville", placeId: "lvb-hotel-ville",
      address: "Boulevard Triomphal, Boulevard de l’Indépendance, Libreville", lat: 0.3901, lng: 9.4544,
      status: "Terminée", confirmation: "Confirmée", period: "past", type: "Remise de distinctions",
      dossier: "DNG-DEMO-MIN-2025-005", campaign: "2025", person: "Aimée Nzamba", medal: "Argent",
      estimated: 90, presence: "Présent",
      participants: [
        { name: "Aimée Nzamba", employeeId: "EMP-MIN-001", role: "Récipiendaire", status: "Présent" },
        { name: "Jean-Pierre Mbadinga", employeeId: "EMP-MIN-002", role: "Récipiendaire", status: "Présent" },
      ],
      history: [["02/09/2025", "Demande"], ["15/12/2025", "Cérémonie réalisée"]],
      documents: ["Procès-verbal de remise"],
      notes: "",
      imageKind: "illustration",
    },
  ];
}

enrichPortalDemo();

/* ------------------------------------------------------------------
   Magasin mutable, unique source pour les interactions de démonstration.
------------------------------------------------------------------ */

let demoLive = null;

function presentationEmail() {
  try {
    return window.sessionStorage.getItem("dn.presentation.email") || window.__demoEmail || "";
  } catch {
    return window.__demoEmail || "";
  }
}

function portalOrgKey() {
  const email = presentationEmail().toLowerCase();
  if (email.includes("ministere")) return "ministere";
  return "enterprise";
}

function demoSeed() {
  enrichPortalDemo();
  hydrateOrgWork(PORTAL_DEMO.enterprise);
  hydrateOrgWork(PORTAL_DEMO.ministere);
  return demoClone(PORTAL_DEMO);
}

function demoStoreIsCurrent(parsed) {
  if (!parsed || Number(parsed.schema) < DEMO_STORE_SCHEMA) return false;
  const emps = parsed.enterprise && parsed.enterprise.employees;
  if (!Array.isArray(emps) || !emps.some((e) => e && e.id && e.prenom)) return false;
  const aff = parsed.person && parsed.person.affiliations;
  if (!Array.isArray(aff) || !aff.some((a) => a && a.id)) return false;
  const awards = parsed.person && parsed.person.awards;
  if (!Array.isArray(awards) || !awards.some((a) => a && a.id && a.validation)) return false;
  if (!Array.isArray(parsed.person.withdrawals)) return false;
  return true;
}

function demoLoad() {
  if (demoLive) return demoLive;
  try {
    DEMO_STORE_LEGACY_KEYS.forEach((key) => {
      try { window.localStorage.removeItem(key); } catch { /* noop */ }
    });
    const raw = window.localStorage.getItem(DEMO_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (demoStoreIsCurrent(parsed)) {
        demoLive = {
          enterprise: parsed.enterprise,
          ministere: parsed.ministere,
          person: parsed.person,
        };
        hydrateOrgWork(demoLive.enterprise);
        hydrateOrgWork(demoLive.ministere);
        return demoLive;
      }
    }
  } catch { /* stockage indisponible ou schéma obsolète */ }
  demoLive = demoSeed();
  demoSave();
  return demoLive;
}

function demoSave() {
  try {
    window.localStorage.setItem(DEMO_STORE_KEY, JSON.stringify({
      schema: DEMO_STORE_SCHEMA,
      enterprise: demoLive.enterprise,
      ministere: demoLive.ministere,
      person: demoLive.person,
    }));
  } catch { /* quota */ }
}

function demoResetStore() {
  demoLive = demoSeed();
  try {
    window.localStorage.removeItem(DEMO_STORE_KEY);
    DEMO_STORE_LEGACY_KEYS.forEach((key) => window.localStorage.removeItem(key));
  } catch { /* noop */ }
  demoSave();
  return demoLive;
}

function demoGet(key) {
  return demoLoad()[key];
}

function demoOrg() {
  return demoGet(portalOrgKey());
}

function demoPushNotice(orgKey, text, page, extra) {
  const data = demoGet(orgKey);
  if (!data) return;
  data.notices = data.notices || [];
  const notice = {
    id: "N" + Date.now(),
    text,
    date: formatFrDate(DEMO_TODAY),
    page: page || "notifications",
  };
  if (extra && extra.ref) notice.ref = extra.ref;
  if (extra && extra.section) notice.section = extra.section;
  data.notices.unshift(notice);
  demoSave();
}

function demoFindEmployee(data, idOrName) {
  if (!data || !data.employees) return null;
  const key = demoNorm(idOrName);
  return data.employees.find((e) => e.id === idOrName || demoNorm(e.name) === key || demoNorm(demoFullName(e)) === key) || null;
}

function employeeAwards(data, employee) {
  const name = demoFullName(employee);
  return (data.awards || []).filter((a) => a.employeeId === employee.id || a.name === name);
}

function employeeInCurrentRequest(data, employee) {
  const name = demoFullName(employee);
  return (data.dossiers || []).some((d) => !["Cérémonie terminée"].includes(d.status) && d.recipients.includes(name));
}

function employeeStats(data, campaign) {
  let list = data.employees || [];
  if (campaign) {
    const names = new Set();
    (data.dossiers || []).filter((d) => d.campaign === campaign).forEach((d) => (d.recipients || []).forEach((n) => names.add(n)));
    (data.awards || []).filter((a) => a.campaign === campaign).forEach((a) => names.add(a.name));
    list = list.filter((e) => names.has(e.name) || names.has(demoFullName(e)));
  }
  const awards = data.awards || [];
  const distinguished = new Set(awards.filter((a) => a.validation === "Validée" || a.remise === "Remise").map((a) => a.employeeId || a.name));
  const inRequest = new Set();
  (data.dossiers || []).forEach((d) => {
    if (["Cérémonie terminée"].includes(d.status)) return;
    d.recipients.forEach((n) => inRequest.add(n));
  });
  const bySexe = { Masculin: 0, Féminin: 0 };
  const byNat = {};
  const bySeniority = { "Moins de 5 ans": 0, "5 à 9 ans": 0, "10 à 19 ans": 0, "20 à 29 ans": 0, "30 ans et plus": 0 };
  const byPoste = {};
  list.forEach((e) => {
    bySexe[e.sexe] = (bySexe[e.sexe] || 0) + 1;
    byNat[e.nationalite] = (byNat[e.nationalite] || 0) + 1;
    const bucket = seniorityBucket(e.start, e.end);
    bySeniority[bucket] = (bySeniority[bucket] || 0) + 1;
    byPoste[e.poste || e.job] = (byPoste[e.poste || e.job] || 0) + 1;
  });
  return {
    total: list.length,
    actifs: list.filter((e) => e.status === "ACTIF").length,
    attente: list.filter((e) => e.status === "EN_ATTENTE").length,
    anciens: list.filter((e) => e.status === "TERMINE").length,
    bySexe,
    byNat,
    bySeniority,
    byPoste,
    distinguished: list.filter((e) => distinguished.has(e.id) || distinguished.has(e.name)).length,
    inRequest: list.filter((e) => inRequest.has(e.name) || inRequest.has(demoFullName(e))).length,
  };
}

function distinctionStats(data) {
  const awards = data.awards || [];
  const byMetal = { Bronze: 0, Argent: 0, Or: 0 };
  const byCampaign = {};
  const byYear = {};
  const people = new Set();
  awards.forEach((a) => {
    byMetal[a.medal] = (byMetal[a.medal] || 0) + 1;
    byCampaign[a.campaign] = (byCampaign[a.campaign] || 0) + 1;
    byYear[a.campaign] = (byYear[a.campaign] || 0) + 1;
    people.add(a.employeeId || a.name);
  });
  return {
    total: awards.length,
    validated: awards.filter((a) => a.validation === "Validée").length,
    pending: awards.filter((a) => a.validation === "En attente").length,
    refused: awards.filter((a) => a.validation === "Refusée").length,
    remised: awards.filter((a) => a.remise === "Remise").length,
    waitingRemise: awards.filter((a) => a.remise === "En attente de remise").length,
    byMetal,
    byCampaign,
    byYear,
    people: people.size,
  };
}

function requestedAmount(data, yearFilter) {
  let total = 0;
  (data.dossiers || []).forEach((d) => {
    if (yearFilter && d.campaign !== yearFilter) return;
    (d.requested || []).forEach((m) => { total += DEMO_TARIFFS[m] || 0; });
  });
  return total;
}

function dossierStats(data) {
  const list = data.dossiers || [];
  const byStatus = {};
  const byCampaign = {};
  let recipients = 0;
  list.forEach((d) => {
    byStatus[d.status] = (byStatus[d.status] || 0) + 1;
    byCampaign[d.campaign] = (byCampaign[d.campaign] || 0) + 1;
    recipients += (d.recipients || []).length;
  });
  const closed = list.filter((d) => /termin|clôtur/i.test(d.status || "")).length;
  return {
    total: list.length,
    open: list.length - closed,
    closed,
    recipients,
    byStatus,
    byCampaign,
  };
}

function dossierIsClosed(d) {
  return /termin|clôtur/i.test((d && d.status) || "");
}

function dossierNeedsAction(d) {
  if (!d) return false;
  if (d.status === "Complément demandé") return true;
  return (d.complements || []).some((c) => c.status === "ouvert");
}

function hydrateDossierWork(d) {
  if (!d) return d;
  if (!Array.isArray(d.complements)) d.complements = [];
  if (!Array.isArray(d.relances)) d.relances = [];
  if (!Array.isArray(d.recours)) d.recours = [];
  if (!Array.isArray(d.documents)) {
    d.documents = (d.pieces || []).map((name, i) => ({
      id: (d.ref || "DOC") + "-P" + (i + 1),
      name,
      kind: /courrier/i.test(name) ? "courrier" : /dts/i.test(name) ? "dts" : /quittance/i.test(name) ? "quittance" : "piece",
      date: d.date || "",
    }));
  }
  return d;
}

function seedDossierWork(d) {
  hydrateDossierWork(d);
  if (d.ref === "DNG-DEMO-2026-023" && !d.complements.length) {
    d.complements.push({
      id: "CPL-023-1",
      objet: "Justificatif d’ancienneté pour Alain Moussavou",
      date: "22/09/2026",
      status: "ouvert",
      destinataire: "Alain Moussavou",
      piecesAttendues: ["Attestation d’emploi", "Relevé de carrière"],
      reponse: null,
    });
  }
  if (d.ref === "DNG-DEMO-2025-012" && !d.relances.length) {
    d.relances.push({
      id: "REL-012-1",
      motif: "Suivi des médailles non remises après la cérémonie",
      date: "20/01/2026",
      status: "Traitée",
      suite: "Cérémonie clôturée — aucune médaille supplémentaire à remettre.",
    });
  }
  if (d.ref === "DNG-DEMO-2025-012" && !d.recours.length) {
    d.recours.push({
      id: "REC-012-1",
      motif: "Contestation d’une médaille non retenue (historique 2025)",
      date: "20/01/2026",
      status: "Traité",
      suite: "Recours examiné. Décision communiquée maintenue.",
    });
  }
  if (d.ref === "DNG-DEMO-2026-008" && !d.documents.some((x) => x.kind === "ordre")) {
    d.documents.push({ id: d.ref + "-OR", name: "Ordre de recette OR-DEMO-2026-008", kind: "ordre", date: "02/07/2026" });
  }
  return d;
}

function hydrateOrgWork(org) {
  if (!org || !Array.isArray(org.dossiers)) return org;
  org.dossiers.forEach(seedDossierWork);
  if (Array.isArray(org.notices)) {
    org.notices.forEach((n) => {
      if (n.ref === "DNG-DEMO-2026-023" && !n.section) n.section = "complements";
      if (n.page === "dossiers" && n.ref && !n.section) n.section = "resume";
    });
  }
  return org;
}

function collectComplements(data) {
  const out = [];
  (data && data.dossiers || []).forEach((d) => {
    hydrateDossierWork(d);
    (d.complements || []).forEach((c) => out.push({ dossier: d, complement: c }));
  });
  return out;
}

function collectRelances(data) {
  const out = [];
  (data && data.dossiers || []).forEach((d) => {
    hydrateDossierWork(d);
    (d.relances || []).forEach((r) => out.push({ dossier: d, relance: r }));
  });
  return out;
}

function collectRecours(data) {
  const out = [];
  (data && data.dossiers || []).forEach((d) => {
    hydrateDossierWork(d);
    (d.recours || []).forEach((r) => out.push({ dossier: d, recours: r }));
  });
  return out;
}

function collectDocuments(data) {
  const out = [];
  (data && data.dossiers || []).forEach((d) => {
    hydrateDossierWork(d);
    (d.documents || []).forEach((doc) => out.push({ dossier: d, document: doc }));
  });
  return out;
}

function canAskRelance(d) {
  if (!d) return false;
  return ["En instruction", "Complément demandé", "Ordre de recette émis", "Cérémonie terminée"].includes(d.status);
}

function canAskRecours(d) {
  if (!d) return false;
  if (d.status === "Complément demandé") return true;
  const refused = (d.validated || []).some((s) => /refus/i.test(s));
  return refused || d.status === "Rejeté" || d.status === "Refusé";
}

function findOrgDossier(orgKey, ref) {
  const data = demoGet(orgKey);
  if (!data) return null;
  const d = (data.dossiers || []).find((x) => x.ref === ref);
  return d ? hydrateDossierWork(d) : null;
}

function replyComplement(orgKey, ref, cid, payload) {
  const d = findOrgDossier(orgKey, ref);
  if (!d) return null;
  const c = (d.complements || []).find((x) => x.id === cid);
  if (!c || c.status !== "ouvert") return null;
  const p = payload || {};
  if (!(p.texte || "").trim() && !(p.piece || p.pieces)) return null;
  c.status = "répondu";
  c.reponse = {
    texte: (p.texte || "").trim(),
    pieces: p.pieces || (p.piece ? [p.piece] : []),
    date: formatFrDate(DEMO_TODAY),
  };
  d.history = d.history || [];
  d.history.push([formatFrDate(DEMO_TODAY), "Complément répondu — " + c.objet]);
  d.next = (d.complements || []).some((x) => x.status === "ouvert")
    ? d.next
    : "Complément transmis — en attente du Service";
  demoPushNotice(orgKey === "ministere" ? "ministere" : "enterprise", "Réponse enregistrée pour " + d.ref + " (« " + c.objet + " »).", "complements", { ref: d.ref, section: "complements" });
  demoSave();
  return c;
}

function addDossierRelance(orgKey, ref, motif) {
  const d = findOrgDossier(orgKey, ref);
  if (!d || !canAskRelance(d)) return null;
  const text = String(motif || "").trim();
  if (!text) return null;
  const rec = {
    id: "REL-" + Date.now().toString(36),
    motif: text,
    date: formatFrDate(DEMO_TODAY),
    status: "Envoyée",
    suite: null,
  };
  d.relances.unshift(rec);
  d.history = d.history || [];
  d.history.push([formatFrDate(DEMO_TODAY), "Relance déposée — " + text]);
  demoPushNotice(orgKey === "ministere" ? "ministere" : "enterprise", "Relance enregistrée pour " + d.ref + ".", "relances", { ref: d.ref, section: "relances" });
  demoSave();
  return rec;
}

function addDossierRecours(orgKey, ref, motif) {
  const d = findOrgDossier(orgKey, ref);
  if (!d || !canAskRecours(d)) return null;
  const text = String(motif || "").trim();
  if (!text) return null;
  const rec = {
    id: "REC-" + Date.now().toString(36),
    motif: text,
    date: formatFrDate(DEMO_TODAY),
    status: "Envoyé",
    suite: null,
  };
  d.recours.unshift(rec);
  d.history = d.history || [];
  d.history.push([formatFrDate(DEMO_TODAY), "Recours déposé — " + text]);
  demoPushNotice(orgKey === "ministere" ? "ministere" : "enterprise", "Recours enregistré pour " + d.ref + ".", "recours", { ref: d.ref, section: "recours" });
  demoSave();
  return rec;
}

function workOverview(data) {
  const list = (data && data.dossiers) || [];
  list.forEach(hydrateDossierWork);
  const open = list.filter((d) => !dossierIsClosed(d));
  const recent = list.slice().sort((a, b) => (parseFrDate(b.date) || 0) - (parseFrDate(a.date) || 0)).slice(0, 3);
  const action = list.filter(dossierNeedsAction);
  const complements = collectComplements(data).filter((x) => x.complement.status === "ouvert");
  const relances = collectRelances(data).filter((x) => /envoy/i.test(x.relance.status));
  const recours = collectRecours(data).filter((x) => /envoy/i.test(x.recours.status));
  const cerPending = (data.ceremonies || []).filter((c) => c.status === "Demande en attente" || c.confirmation === "Proposée");
  const nextCer = (data.ceremonies || []).find((c) => c.period === "future" && c.status !== "Refusée" && c.status !== "Annulée");
  return { list, open, recent, action, complements, relances, recours, cerPending, nextCer };
}

function addDossierRecord(orgKey, payload) {
  const data = demoGet(orgKey);
  const p = payload || {};
  const recipients = p.recipients || [];
  const n = (data.dossiers || []).length + 1;
  const prefix = orgKey === "ministere" ? "DNG-DEMO-MIN-2026-" : "DNG-DEMO-2026-";
  const ref = prefix + String(40 + n).padStart(3, "0");
  const dest = (DEMO_DESTINATIONS.find((d) => d.id === p.destination) || DEMO_DESTINATIONS[2]).label;
  const letterName = p.letter && (p.letter.name || p.letter);
  const dtsName = p.dts && (p.dts.name || p.dts);
  const extraNames = (p.extras || []).map((f) => f.name || f).filter(Boolean);
  const pieces = [letterName, "Liste des récipiendaires", dtsName].concat(extraNames).filter(Boolean);
  const dossier = {
    ref,
    campaign: p.campaign || "2026",
    date: formatFrDate(DEMO_TODAY),
    status: "Soumis",
    next: "En attente de transmission",
    initial: dest,
    destination: p.destination || "dr",
    recipients: recipients.map((r) => r.name || demoFullName(r)),
    requested: recipients.map((r) => r.medal || indicativeMedal(r.years || seniorityYears(r.start)) || "Bronze"),
    validated: [],
    steps: ["Soumis"],
    history: [[formatFrDate(DEMO_TODAY), "Soumis — courrier d’initiation joint"]],
    pieces,
    ceremony: null,
    order: null,
    letter: p.letter || null,
    dts: p.dts || null,
    extras: p.extras || [],
  };
  hydrateDossierWork(dossier);
  data.dossiers.unshift(dossier);
  demoPushNotice(orgKey === "ministere" ? "ministere" : "enterprise", "Dossier " + ref + " créé localement (simulation).", "dossiers");
  demoSave();
  return dossier;
}

function financeStats(data, yearFilter) {
  const orders = (data.orders || []).filter((o) => !yearFilter || o.campaign === yearFilter);
  const dossiers = data.dossiers || [];
  let issued = 0, paid = 0, remaining = 0;
  let receipts = 0, pendingVerify = 0, waitingPay = 0;
  orders.forEach((o) => {
    issued += orderIssued(o);
    paid += orderPaid(o);
    remaining += orderRemaining(o);
    if (o.receipt) receipts += 1;
    if (o.state === "En attente de vérification") pendingVerify += 1;
    if (o.state === "Émis" || orderRemaining(o) > 0 && o.state !== "En attente de vérification") waitingPay += 1;
  });
  const byYear = {};
  (data.orders || []).forEach((o) => {
    const y = o.campaign;
    if (!byYear[y]) byYear[y] = { year: y, issued: 0, paid: 0, remaining: 0, dossiers: 0, recipients: 0, bronze: 0, argent: 0, or: 0 };
    byYear[y].issued += orderIssued(o);
    byYear[y].paid += orderPaid(o);
    byYear[y].remaining += orderRemaining(o);
  });
  dossiers.forEach((d) => {
    const y = d.campaign;
    if (!byYear[y]) byYear[y] = { year: y, issued: 0, paid: 0, remaining: 0, dossiers: 0, recipients: 0, bronze: 0, argent: 0, or: 0 };
    byYear[y].dossiers += 1;
    byYear[y].recipients += (d.recipients || []).length;
    (d.requested || []).forEach((m) => {
      if (m === "Bronze") byYear[y].bronze += 1;
      else if (m === "Argent") byYear[y].argent += 1;
      else if (m === "Or") byYear[y].or += 1;
    });
  });
  const years = Object.keys(byYear).sort();
  const avg = orders.length ? Math.round(issued / new Set(orders.map((o) => o.dossier)).size) : 0;
  return {
    requested: requestedAmount(data, yearFilter),
    issued, paid, remaining,
    orders: orders.length,
    receipts,
    pendingVerify,
    waitingPay,
    byYear,
    years,
    avgPerDossier: avg,
  };
}

function yearlyVariation(stats, year) {
  const years = stats.years;
  const idx = years.indexOf(String(year));
  if (idx < 1) return null;
  const current = stats.byYear[years[idx]];
  const prev = stats.byYear[years[idx - 1]];
  const delta = current.paid - prev.paid;
  const pct = prev.paid ? Math.round((delta / prev.paid) * 100) : null;
  const reasons = [];
  if (current.dossiers !== prev.dossiers) {
    reasons.push("le nombre de dossiers est passé de " + prev.dossiers + " à " + current.dossiers);
  }
  if (current.recipients !== prev.recipients) {
    reasons.push("le nombre de récipiendaires est passé de " + prev.recipients + " à " + current.recipients);
  }
  const metalNow = current.or + current.argent + current.bronze;
  const metalPrev = prev.or + prev.argent + prev.bronze;
  if (current.or !== prev.or || current.argent !== prev.argent || current.bronze !== prev.bronze) {
    reasons.push("la répartition des métaux a changé (Or " + prev.or + "→" + current.or + ", Argent " + prev.argent + "→" + current.argent + ", Bronze " + prev.bronze + "→" + current.bronze + ")");
  }
  return { current, prev, delta, pct, reasons, metalNow, metalPrev };
}

function ceremonyEligibleDossiers(data) {
  return (data.dossiers || []).filter((d) => {
    if (d.status === "Cérémonie terminée") return false;
    const order = (data.orders || []).find((o) => o.ref === d.order);
    const paidOrIssued = order && orderIssued(order) > 0;
    const approved = ["Ordre de recette émis", "Approuvé"].includes(d.status);
    const openCeremony = (data.ceremonies || []).some((c) => c.dossier === d.ref && !["Refusée", "Annulée", "Terminée"].includes(c.status));
    return approved && paidOrIssued && !openCeremony;
  });
}

function ceremonyPeriod(ceremony) {
  if (ceremony.period) return ceremony.period;
  const d = parseFrDate(ceremony.iso || ceremony.date);
  if (!d) return "future";
  return d < DEMO_TODAY ? "past" : "future";
}

function ceremonyStats(data) {
  const list = data.ceremonies || [];
  const upcoming = list.filter((c) => ceremonyPeriod(c) === "future" && ["Confirmée", "Planifiée", "En préparation"].includes(c.status));
  const past = list.filter((c) => c.status === "Terminée" || ceremonyPeriod(c) === "past" && c.status === "Terminée");
  const pending = list.filter((c) => c.status === "Demande en attente");
  const confirmed = list.filter((c) => c.status === "Confirmée" || c.confirmation === "Confirmée");
  const refused = list.filter((c) => c.status === "Refusée" || c.status === "Annulée");
  const preparation = list.filter((c) => c.status === "En préparation");
  let pastParticipants = 0;
  past.forEach((c) => {
    (c.participants || []).forEach((p) => {
      if (p.status === "Présent") pastParticipants += 1;
    });
  });
  const confirmedTotal = confirmed.length;
  const realizedConfirmed = past.filter((c) => c.confirmation === "Confirmée").length;
  const rate = confirmedTotal ? Math.round((realizedConfirmed / confirmedTotal) * 100) : null;
  const byType = {};
  const byYear = {};
  list.forEach((c) => {
    byType[c.type || "Remise de distinctions"] = (byType[c.type || "Remise de distinctions"] || 0) + 1;
    const y = c.campaign || (parseFrDate(c.iso || c.date) || {}).getFullYear?.() || "";
    const year = String(c.campaign || (parseFrDate(c.iso || c.date) ? parseFrDate(c.iso || c.date).getFullYear() : ""));
    if (year) byYear[year] = (byYear[year] || 0) + 1;
  });
  return {
    total: list.length,
    upcoming: upcoming.length,
    past: past.length,
    pending: pending.length,
    confirmed: confirmed.length,
    refused: refused.length,
    preparation: preparation.length,
    pastParticipants,
    rate,
    byType,
    byYear,
  };
}

function toCalendarEvent(ceremony) {
  const iso = ceremony.iso || formatIsoDate(ceremony.confirmedDate || ceremony.date);
  return {
    id: ceremony.id,
    date: iso,
    time: ceremony.time || "10:00",
    place: ceremony.place,
    title: (ceremony.type || "Cérémonie") + " — " + (ceremony.place || ""),
    medal: ceremony.medal || "Bronze",
    campaign: ceremony.campaign || "",
    status: ceremony.status,
    confirmation: ceremony.confirmation,
    recipients: (ceremony.participants || []).length || ceremony.estimated || 0,
    organisation: ceremony.dossier || "",
    type: ceremony.type,
    dossier: ceremony.dossier,
  };
}

function personFullName(person) {
  const p = person && person.profile ? person.profile : person || {};
  return [p.prenom, p.nom].filter(Boolean).join(" ").trim();
}

function personMatchesEmployee(person, employee) {
  if (!person || !person.profile || !employee) return false;
  return demoNorm(person.profile.nom) === demoNorm(employee.nom)
    && demoNorm(person.profile.prenom) === demoNorm(employee.prenom);
}

function inviteMatchingPerson(orgKey, employee) {
  const person = demoGet("person");
  if (!personMatchesEmployee(person, employee)) return null;
  const org = demoGet(orgKey);
  const company = org && org.profile ? org.profile.raison : "";
  person.affiliations = person.affiliations || [];
  const exists = person.affiliations.some((a) => a.employeeId === employee.id
    || (demoNorm(a.company) === demoNorm(company) && a.status === "EN_ATTENTE"));
  if (exists) return null;
  const aff = {
    id: "AFF-" + employee.id,
    company,
    job: employee.poste || employee.job,
    start: employee.start,
    end: null,
    status: "EN_ATTENTE",
    confirmed: false,
    orgKey,
    employeeId: employee.id,
  };
  person.affiliations.unshift(aff);
  person.actions = person.actions || [];
  person.actions.unshift({
    title: "Confirmer une affiliation",
    context: "Invitation — " + company,
    detail: "Cette structure vous a enregistré. L’affiliation n’est pas confirmée tant que vous ne l’acceptez pas.",
    page: "employers",
    kind: "affiliation",
    affiliationId: aff.id,
  });
  demoPushNotice("person", "Une structure vous a enregistré. Confirmez l’affiliation depuis Mes employeurs (simulation).", "employers");
  demoSave();
  return aff;
}

function confirmPersonAffiliation(affId) {
  const person = demoGet("person");
  const aff = (person.affiliations || []).find((a) => a.id === affId || a.company === affId);
  if (!aff || aff.status === "TERMINE") return null;
  aff.status = "ACTIF";
  aff.confirmed = true;
  aff.end = null;
  if (aff.orgKey && aff.employeeId) {
    updateEmployeeRecord(aff.orgKey, aff.employeeId, {
      status: "ACTIF",
      invitationSent: false,
      lastActivityLabel: "Affiliation confirmée par l’employé",
    });
    const emp = demoFindEmployee(demoGet(aff.orgKey), aff.employeeId);
    if (emp && emp.affiliations && emp.affiliations[0]) emp.affiliations[0].confirmed = true;
  }
  person.actions = (person.actions || []).filter((a) => a.affiliationId !== aff.id);
  demoPushNotice("person", "Affiliation confirmée auprès de " + aff.company + " (simulation).", "employers");
  demoSave();
  return aff;
}

function refusePersonAffiliation(affId) {
  const person = demoGet("person");
  const aff = (person.affiliations || []).find((a) => a.id === affId || a.company === affId);
  if (!aff || aff.status !== "EN_ATTENTE") return null;
  aff.status = "REFUSEE";
  aff.confirmed = false;
  aff.end = formatFrDate(DEMO_TODAY);
  if (aff.orgKey && aff.employeeId) {
    updateEmployeeRecord(aff.orgKey, aff.employeeId, {
      status: "TERMINE",
      end: aff.end,
      lastActivityLabel: "Invitation déclinée par la personne",
    });
  }
  person.actions = (person.actions || []).filter((a) => a.affiliationId !== aff.id);
  demoPushNotice("person", "Invitation de " + aff.company + " déclinée (simulation).", "employers");
  demoSave();
  return aff;
}

function syncPersonFromEmployeeConfirm(employee) {
  const person = demoGet("person");
  if (!personMatchesEmployee(person, employee)) return;
  const aff = (person.affiliations || []).find((a) => a.employeeId === employee.id
    || (demoNorm(a.company) === demoNorm((employee.affiliations && employee.affiliations[0] && employee.affiliations[0].company) || "") && a.status === "EN_ATTENTE"));
  if (aff) {
    aff.status = "ACTIF";
    aff.confirmed = true;
    person.actions = (person.actions || []).filter((a) => a.affiliationId !== aff.id);
    demoSave();
  }
}

function addEmployeeRecord(orgKey, fields) {
  const data = demoGet(orgKey);
  const id = "EMP-" + (orgKey === "ministere" ? "MIN" : "SGI") + "-" + String(100 + data.employees.length + 1).padStart(3, "0");
  const record = demoEmployee({
    id,
    nom: fields.nom,
    prenom: fields.prenom,
    sexe: fields.sexe,
    nationalite: fields.nationalite,
    naturalise: fields.naturalise === true || fields.naturalise === "oui",
    poste: fields.poste,
    start: fields.start,
    status: "EN_ATTENTE",
    situationPhysique: fields.situationPhysique || "Bien portant",
    degreMutilation: fields.degreMutilation || null,
    pieceMedicale: fields.pieceMedicale || null,
    dateDeces: fields.dateDeces || null,
    acteDeces: fields.acteDeces || null,
    workPermit: fields.workPermit || null,
    naturalizationDoc: fields.naturalizationDoc || null,
    lastActivity: formatFrDate(DEMO_TODAY),
    lastActivityLabel: "Enregistrement — invitation d’affiliation à confirmer",
    company: data.profile.raison,
  });
  data.employees.push(record);
  demoPushNotice(orgKey, "Invitation d’affiliation envoyée à " + record.name + " (simulation). L’affiliation n’est pas encore confirmée.", "employees");
  inviteMatchingPerson(orgKey, record);
  demoSave();
  return record;
}

function updateEmployeeRecord(orgKey, id, fields) {
  const data = demoGet(orgKey);
  const emp = demoFindEmployee(data, id);
  if (!emp) return null;
  if (emp.status === "TERMINE" && fields.affiliationsLocked) return emp;
  Object.keys(fields).forEach((key) => {
    if (fields[key] !== undefined) emp[key] = fields[key];
  });
  emp.name = emp.prenom + " " + emp.nom;
  emp.job = emp.poste;
  emp.lastActivity = formatFrDate(DEMO_TODAY);
  emp.lastActivityLabel = fields.lastActivityLabel || "Fiche mise à jour";
  demoSave();
  return emp;
}

function addCeremonyRequest(orgKey, payload) {
  const data = demoGet(orgKey);
  const id = "CER-DEM-" + Date.now().toString().slice(-6);
  const dossier = (data.dossiers || []).find((d) => d.ref === payload.dossier);
  const place = payload.place || {};
  const record = {
    id,
    iso: payload.iso,
    date: payload.date,
    confirmedDate: null,
    time: payload.time || "10:00",
    place: place.name || payload.placeName,
    placeId: place.id || null,
    address: place.address || payload.address || "",
    lat: place.lat || null,
    lng: place.lng || null,
    status: "Demande en attente",
    confirmation: "Proposée",
    period: "future",
    type: payload.type || "Remise de distinctions",
    dossier: payload.dossier,
    campaign: dossier ? dossier.campaign : payload.campaign,
    person: dossier ? dossier.recipients[0] : "",
    medal: dossier ? (dossier.requested[0] || "Bronze") : "Bronze",
    estimated: Number(payload.estimated) || (dossier ? dossier.recipients.length : 0),
    presence: null,
    participants: (dossier ? dossier.recipients : []).map((name) => {
      const emp = demoFindEmployee(data, name);
      return { name, employeeId: emp ? emp.id : "", role: "Récipiendaire", status: "Invité" };
    }),
    history: [[formatFrDate(DEMO_TODAY), "Demande enregistrée — en attente de traitement"]],
    documents: [],
    notes: payload.notes || "",
    imageKind: "illustration",
  };
  data.ceremonies.unshift(record);
  if (dossier) dossier.ceremony = id;
  demoPushNotice(orgKey, "Demande de cérémonie " + id + " enregistrée pour le dossier " + payload.dossier + ".", "ceremonies");
  demoSave();
  return record;
}

function personAwardKey(award) {
  if (!award) return "";
  return award.id || [award.medal, award.campaign, award.dossier || award.employer || ""].join("|");
}

function personAwardView(award) {
  if (!award) return null;
  const validation = award.validation || (award.date ? "Validée" : "En attente");
  const remise = award.remise || (award.date ? "Remise" : "En attente de remise");
  return Object.assign({}, award, { id: personAwardKey(award), validation, remise });
}

function personEligibleWithdrawals(person) {
  const list = ((person && person.awards) || []).map(personAwardView);
  const blocked = new Set(
    ((person && person.withdrawals) || [])
      .filter((w) => w.status !== "Refusée" && w.status !== "Annulée")
      .map((w) => w.awardId || personAwardKey(w))
  );
  return list.filter((a) => a.validation === "Validée" && a.remise !== "Remise" && !blocked.has(a.id));
}

function withdrawalQuittanceFor(award) {
  const ent = typeof demoGet === "function" ? demoGet("enterprise") : null;
  const order = ent && (ent.orders || []).find((o) => o.dossier === (award && award.dossier));
  if (!order) return { name: "", label: "Aucune quittance connue pour ce dossier" };
  if (order.receipt) {
    const name = String(order.receipt).endsWith(".pdf") ? order.receipt : order.receipt + ".pdf";
    return { name, label: "Quittance disponible" };
  }
  const paid = typeof orderPaid === "function" ? orderPaid(order) : Number(order.amountPaid || 0);
  if (paid > 0) {
    const stub = "QUI-DEMO-" + String(award.dossier || "").replace(/^DNG-DEMO-/, "") + ".pdf";
    return { name: stub, label: "Paiement enregistré — quittance" };
  }
  return { name: "", label: "Ordre émis, quittance non encore disponible" };
}

function withdrawalPermissionFor(award, person) {
  const company = (award && award.employer)
    || ((person && (person.affiliations || []).find((a) => a.status === "ACTIF")) || {}).company
    || "entreprise";
  const slug = String(company).replace(/[^A-Za-z]/g, "").slice(0, 18) || "entreprise";
  return "autorisation-retrait-" + slug + "-demo.pdf";
}

function addWithdrawalRequest(payload) {
  const person = demoGet("person");
  if (!person) return null;
  person.withdrawals = person.withdrawals || [];
  const rec = {
    id: "RET-DEMO-" + Date.now().toString().slice(-6),
    awardId: payload.awardId,
    medal: payload.medal,
    campaign: payload.campaign,
    dossier: payload.dossier || null,
    employer: payload.employer,
    nom: payload.nom,
    prenom: payload.prenom,
    sexe: payload.sexe,
    nationalite: payload.nationalite,
    quittance: payload.quittance,
    permission: payload.permission,
    motif: payload.motif || "",
    status: "Demande en attente",
    date: formatFrDate(DEMO_TODAY),
    history: [[formatFrDate(DEMO_TODAY), "Demande enregistrée — en attente de traitement"]],
  };
  person.withdrawals.unshift(rec);
  demoPushNotice("person", "Demande de retrait sans cérémonie " + rec.id + " enregistrée.", "withdrawals");
  demoSave();
  return rec;
}

  const DemoStore = {
  tariffs: DEMO_TARIFFS,
  places: DEMO_PLACES,
  load: demoLoad,
  save: demoSave,
  reset: demoResetStore,
  get: demoGet,
  org: demoOrg,
  orgKey: portalOrgKey,
  addEmployee: addEmployeeRecord,
  updateEmployee: updateEmployeeRecord,
  addCeremony: addCeremonyRequest,
  addWithdrawal: addWithdrawalRequest,
  addDossier: addDossierRecord,
  notice: demoPushNotice,
  confirmAffiliation: confirmPersonAffiliation,
  refuseAffiliation: refusePersonAffiliation,
  invitePerson: inviteMatchingPerson,
};
