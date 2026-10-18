/* ==================================================================
   js/data.js
   Données de démonstration, profils (rôles) et navigation.

   Conversion directe de :
     · src/config/brand.ts
     · src/demo/data.ts
     · src/demo/roles.ts
     · src/demo/navigation.ts
   Les types TypeScript de `src/demo/types.ts` disparaissent : ils ne
   servaient qu'à la compilation et sont documentés en JSDoc ci-dessous.

   ⚠️ Toutes les données sont fictives (mode démonstration).
================================================================== */

/* ------------------------- Identité du portail ------------------------- */

/**
 * Emblème officiel : `null` tant qu'aucun fichier validé n'est fourni.
 * Renseigner ici le chemin (ex. "assets/embleme-gabon.svg") pour que
 * <Emblem> l'affiche automatiquement partout (en-tête, connexion, pied
 * de page, espace connecté).
 * @type {string | null}
 */
const OFFICIAL_EMBLEM_SRC = null;

const PORTAL_NAME = "Distinctions Nationales";
const STATE_NAME = "République Gabonaise";

/* --------------------------- Données de démo --------------------------- */

const DEMO_NOTICE = "Distinctions Nationales";

const CAMPAIGNS = [
  "Campagne 2026 — Distinctions professionnelles",
  "Campagne 2025 — Reconnaissance de l'ancienneté",
  "Campagne 2024 — Valorisation du mérite professionnel",
];

/**
 * @typedef {{ label: string, tone: "neutral"|"info"|"warning"|"success"|"danger" }} DemoStatus
 * @typedef {{ id: string, name: string, company: string, role: string, seniority: number,
 *             medal: "Bronze"|"Argent"|"Or",
 *             instruction: "Validé"|"En attente"|"À compléter"|"Refusé",
 *             documents: string[] }} DemoRecipient
 * @typedef {{ reference: string, campaign: string, applicant: string, submitted: string,
 *             updated: string, initialRecipient: string, recipientCount: number,
 *             status: DemoStatus, payment: DemoStatus, ceremony?: string, location?: string,
 *             recipients: DemoRecipient[] }} DemoDossier
 * @typedef {{ id: string, title: string, description: string, date: string,
 *             tone: DemoStatus["tone"], read: boolean, reference?: string }} DemoNotification
 */

/** @type {DemoDossier[]} */
const DOSSIERS = [
  {
    reference: "DNG-2026-00418",
    campaign: CAMPAIGNS[0],
    applicant: "Société Gabonaise de Services et d'Industrie",
    submitted: "12/02/2026",
    updated: "Aujourd'hui, 09:42",
    initialRecipient: "Direction Générale du Travail",
    recipientCount: 8,
    status: { label: "En instruction", tone: "info" },
    payment: { label: "À préparer", tone: "neutral" },
    ceremony: "18 juin 2026",
    location: "Libreville — Salle des conférences",
    recipients: [
      { id: "REC-001", name: "Aline Moubamba", company: "SGSI", role: "Directrice administrative", seniority: 18, medal: "Bronze", instruction: "Validé", documents: ["DTS", "Attestation de travail"] },
      { id: "REC-002", name: "Marc Nkoghe", company: "SGSI", role: "Chef de production", seniority: 23, medal: "Argent", instruction: "Validé", documents: ["DTS", "État de service"] },
      { id: "REC-003", name: "Jeanne Ella", company: "SGSI", role: "Responsable qualité", seniority: 31, medal: "Or", instruction: "À compléter", documents: ["DTS"] },
      { id: "REC-004", name: "Paul Ondo", company: "SGSI", role: "Technicien principal", seniority: 12, medal: "Bronze", instruction: "En attente", documents: ["DTS", "Attestation de travail"] },
    ],
  },
  {
    reference: "DNG-2026-00372",
    campaign: CAMPAIGNS[0],
    applicant: "Entreprise Forestière du Littoral",
    submitted: "29/01/2026",
    updated: "Hier, 16:05",
    initialRecipient: "Direction Régionale du Travail — Estuaire",
    recipientCount: 14,
    status: { label: "Complément demandé", tone: "warning" },
    payment: { label: "Non émis", tone: "neutral" },
    recipients: [
      { id: "REC-005", name: "Hélène Biyogo", company: "EFL", role: "Assistante de direction", seniority: 11, medal: "Bronze", instruction: "À compléter", documents: ["DTS"] },
      { id: "REC-006", name: "Éric Ebang", company: "EFL", role: "Conducteur travaux", seniority: 27, medal: "Argent", instruction: "Validé", documents: ["DTS", "État de service"] },
    ],
  },
  {
    reference: "DNG-2025-01106",
    campaign: CAMPAIGNS[1],
    applicant: "Compagnie des Infrastructures du Gabon",
    submitted: "04/10/2025",
    updated: "04/03/2026",
    initialRecipient: "Ministère du Travail",
    recipientCount: 22,
    status: { label: "Approuvé", tone: "success" },
    payment: { label: "À confirmer", tone: "warning" },
    ceremony: "04 avril 2026",
    location: "Libreville — Hôtel de ville",
    recipients: [
      { id: "REC-007", name: "Nadine Nziengui", company: "CIG", role: "Directrice financière", seniority: 34, medal: "Or", instruction: "Validé", documents: ["DTS", "Attestation de travail", "Pièce d'identité"] },
      { id: "REC-008", name: "Joseph Mba", company: "CIG", role: "Ingénieur travaux", seniority: 21, medal: "Argent", instruction: "Validé", documents: ["DTS", "État de service"] },
    ],
  },
  {
    reference: "DNG-2025-00841",
    campaign: CAMPAIGNS[1],
    applicant: "Entreprise Forestière du Littoral",
    submitted: "16/07/2025",
    updated: "28/02/2026",
    initialRecipient: "Direction Générale du Travail",
    recipientCount: 6,
    status: { label: "Ordre de recette émis", tone: "success" },
    payment: { label: "En attente de paiement", tone: "warning" },
    ceremony: "21 mai 2026",
    location: "Port-Gentil — Centre administratif",
    recipients: [
      { id: "REC-009", name: "Bernard Nzamba", company: "EFL", role: "Chef d'atelier", seniority: 25, medal: "Argent", instruction: "Validé", documents: ["DTS", "État de service"] },
    ],
  },
  {
    reference: "DNG-2024-01984",
    campaign: CAMPAIGNS[2],
    applicant: "Société Gabonaise de Services et d'Industrie",
    submitted: "11/05/2024",
    updated: "18/11/2025",
    initialRecipient: "Direction Régionale du Travail — Estuaire",
    recipientCount: 10,
    status: { label: "Cérémonie terminée", tone: "neutral" },
    payment: { label: "Quittance enregistrée", tone: "success" },
    ceremony: "18 novembre 2025",
    location: "Libreville — Maison Georges Rawiri",
    recipients: [
      { id: "REC-010", name: "Sarah Esono", company: "SGSI", role: "Responsable RH", seniority: 32, medal: "Or", instruction: "Validé", documents: ["DTS", "Attestation de travail"] },
    ],
  },
];

/** @type {DemoRecipient[]} */
const ALL_RECIPIENTS = DOSSIERS.flatMap((dossier) => dossier.recipients);

/** @type {DemoNotification[]} */
const NOTIFICATIONS = [
  { id: "N-001", title: "Complément demandé", description: "Une attestation de travail est attendue pour le dossier DNG-2026-00372.", date: "Aujourd'hui, 10:14", tone: "warning", read: false, reference: "DNG-2026-00372" },
  { id: "N-002", title: "Dossier transmis", description: "Le dossier DNG-2026-00418 a été transmis au Service des Distinctions.", date: "Hier, 16:05", tone: "info", read: false, reference: "DNG-2026-00418" },
  { id: "N-003", title: "Cérémonie confirmée", description: "La cérémonie de la campagne 2025 est planifiée le 04 avril 2026.", date: "04/03/2026", tone: "success", read: true },
  { id: "N-004", title: "Quittance à présenter", description: "La quittance de l'ordre de recette OR-2025-00841 est disponible.", date: "28/02/2026", tone: "info", read: true, reference: "OR-2025-00841" },
];

const ACTIVITIES = [
  { actor: "Claire Mba", role: "Service des Distinctions", action: "a demandé un complément", date: "Aujourd'hui, 10:14", reference: "DNG-2026-00372", comment: "Attestation de travail à joindre pour Hélène Biyogo." },
  { actor: "Secrétariat central", role: "Transmission", action: "a transmis un dossier", date: "Hier, 16:05", reference: "DNG-2026-00418", comment: "Transmission vers le Service des Distinctions Nationales." },
  { actor: "Direction Régionale Estuaire", role: "DR", action: "a rendu un avis", date: "04/03/2026", reference: "DNG-2025-01106", comment: "Avis favorable sur les récipiendaires validés." },
  { actor: "Régie des Médailles", role: "Régisseur", action: "a réservé 8 médailles", date: "03/03/2026", reference: "DNG-2026-00418", comment: "Préparation de la cérémonie du 18 juin 2026." },
];

const STOCK = [
  { type: "Bronze", quantity: 148, reserved: 32, threshold: 60, accent: "bronze" },
  { type: "Argent", quantity: 96, reserved: 24, threshold: 40, accent: "silver" },
  { type: "Or", quantity: 43, reserved: 18, threshold: 30, accent: "gold" },
  { type: "Diplômes", quantity: 360, reserved: 86, threshold: 100, accent: "paper" },
];

const CEREMONIES = [
  { id: "CER-026", date: "04/04/2026", title: "Campagne 2025 — Reconnaissance de l'ancienneté", location: "Libreville — Hôtel de ville", participants: 22, status: "Confirmée", tone: "success" },
  { id: "CER-027", date: "21/05/2026", title: "Distinctions professionnelles — Estuaire", location: "Port-Gentil — Centre administratif", participants: 6, status: "À confirmer", tone: "warning" },
  { id: "CER-028", date: "18/06/2026", title: "Campagne 2026 — Distinctions professionnelles", location: "Libreville — Salle des conférences", participants: 8, status: "Planifiée", tone: "info" },
];

/* ------------------------------ Les rôles ------------------------------ */

/**
 * @typedef {"demandeur"|"recipient"|"secretariat_ministre"|"secretariat_dgt"|"secretariat_dr"|"ministre"|"dgt"|"dr"|"service_agent"|"service_inspecteur"|"service_chef"|"regisseur"|"admin"} DemoRole
 * @typedef {{ label: string, page: string, icon: string }} DemoNavItem
 * @typedef {{ label: string, shortLabel: string, description: string,
 *             accent: "green"|"blue"|"gold", nav: DemoNavItem[] }} DemoRoleConfig
 */

/** Navigation commune pour tous les rôles internes. */
const NAV_DEMANDEUR = [
  { label: "Vue d'ensemble", page: "overview", icon: "home" },
  { label: "Mes dossiers", page: "dossiers", icon: "folder" },
  { label: "Nouveau dossier", page: "new-dossier", icon: "plus" },
  { label: "Récipiendaires", page: "recipients", icon: "users" },
  { label: "Compléments demandés", page: "complements", icon: "upload" },
  { label: "Recours", page: "recours", icon: "scale" },
  { label: "Ordres de recette", page: "payments", icon: "fileText" },
  { label: "Cérémonies", page: "ceremonies", icon: "calendar" },
  { label: "Distinctions à remettre", page: "remises", icon: "medal" },
  { label: "Notifications", page: "notifications", icon: "bell" },
  { label: "Historique", page: "activity", icon: "clock" },
  { label: "Profil et paramètres", page: "profile", icon: "settings" },
];
const NAV_RECIPIENT = [
  { label: "Vue d'ensemble", page: "overview", icon: "home" },
  { label: "Mes distinctions", page: "recipients", icon: "medal" },
  { label: "Mes cérémonies", page: "ceremonies", icon: "calendar" },
  { label: "Documents à fournir", page: "documents", icon: "fileText" },
  { label: "Mes relances", page: "relances", icon: "refresh" },
  { label: "Mes photos", page: "documents", icon: "award" },
  { label: "Notifications", page: "notifications", icon: "bell" },
  { label: "Mon profil", page: "profile", icon: "settings" },
];
const NAV_SECRETARIAT = [
  { label: "Vue d'ensemble", page: "overview", icon: "home" },
  { label: "Boîte de réception", page: "transmissions", icon: "folder" },
  { label: "Courriers à enregistrer", page: "transmissions", icon: "upload" },
  { label: "À transmettre", page: "transmissions", icon: "relay" },
  { label: "Localisation physique", page: "localisation", icon: "mapPin" },
  { label: "Transmissions effectuées", page: "activity", icon: "checkCircle" },
  { label: "Historique", page: "activity", icon: "clock" },
  { label: "Notifications", page: "notifications", icon: "bell" },
  { label: "Profil", page: "profile", icon: "settings" },
];
const NAV_HIERARCHIE = [
  { label: "Vue d'ensemble", page: "overview", icon: "home" },
  { label: "Dossiers transmis", page: "dossiers", icon: "folder" },
  { label: "Décisions initiales", page: "decisions", icon: "checkCircle" },
  { label: "Recours", page: "recours", icon: "scale" },
  { label: "Relances", page: "relances", icon: "refresh" },
  { label: "Demandes de cérémonie", page: "ceremonies", icon: "calendar" },
  { label: "Journal d'activité", page: "activity", icon: "clock" },
  { label: "Notifications", page: "notifications", icon: "bell" },
  { label: "Profil", page: "profile", icon: "settings" },
];
const NAV_SERVICE_AGENT = [
  { label: "Vue d'ensemble", page: "overview", icon: "home" },
  { label: "Dossiers à instruire", page: "instruction", icon: "folder" },
  { label: "Récipiendaires", page: "recipients", icon: "users" },
  { label: "Compléments à demander", page: "complements", icon: "upload" },
  { label: "Assouplissements", page: "adjustments", icon: "scale" },
  { label: "Validation individuelle", page: "eligibility", icon: "checkCircle" },
  { label: "Notifications", page: "notifications", icon: "bell" },
  { label: "Journal d'activité", page: "activity", icon: "clock" },
];
const NAV_SERVICE_INSPECTEUR = [
  { label: "Vue d'ensemble", page: "overview", icon: "home" },
  { label: "Dossiers à contrôler", page: "instruction", icon: "folder" },
  { label: "Justificatifs à vérifier", page: "complements", icon: "upload" },
  { label: "Retraits sans cérémonie", page: "withdrawals", icon: "users" },
  { label: "Anomalies", page: "adjustments", icon: "alert" },
  { label: "Notifications", page: "notifications", icon: "bell" },
  { label: "Journal d'activité", page: "activity", icon: "clock" },
];
const NAV_SERVICE_CHEF = [
  { label: "Vue d'ensemble", page: "overview", icon: "home" },
  { label: "Dossiers à valider", page: "instruction", icon: "folder" },
  { label: "Validation des distinctions", page: "eligibility", icon: "checkCircle" },
  { label: "Ordres de recette", page: "payments", icon: "fileText" },
  { label: "Planification des cérémonies", page: "agenda", icon: "calendar" },
  { label: "Documents de délégation", page: "delegations", icon: "fileText" },
  { label: "Présences", page: "attendance", icon: "users" },
  { label: "Statistiques par campagne", page: "campaigns", icon: "clipboard" },
  { label: "Notifications", page: "notifications", icon: "bell" },
  { label: "Journal d'activité", page: "activity", icon: "clock" },
];
const NAV_REGISSEUR = [
  { label: "Vue d'ensemble", page: "overview", icon: "home" },
  { label: "Stock des médailles", page: "stock", icon: "medal" },
  { label: "Stock des diplômes", page: "stock", icon: "fileText" },
  { label: "Mouvements de stock", page: "movements", icon: "refresh" },
  { label: "Approvisionnements", page: "supplies", icon: "truck" },
  { label: "Bons de commande", page: "orders", icon: "clipboard" },
  { label: "Livraisons", page: "deliveries", icon: "truck" },
  { label: "Budgets par campagne", page: "campaigns", icon: "scale" },
  { label: "Remise des médailles", page: "remises", icon: "medal" },
  { label: "Retraits sans cérémonie", page: "withdrawals", icon: "users" },
  { label: "Fournisseurs", page: "suppliers", icon: "truck" },
  { label: "Historique", page: "activity", icon: "clock" },
  { label: "Notifications", page: "notifications", icon: "bell" },
];
const NAV_ADMIN = [
  { label: "Vue d'ensemble", page: "overview", icon: "home" },
  { label: "Utilisateurs", page: "users", icon: "users" },
  { label: "Comptes internes", page: "internal-accounts", icon: "shield" },
  { label: "Entreprises reconnues", page: "enterprises", icon: "building" },
  { label: "Campagnes", page: "campaigns", icon: "clipboard" },
  { label: "Paramètres métier", page: "settings", icon: "settings" },
  { label: "Journal d'audit", page: "audit", icon: "fileText" },
  { label: "Alertes système", page: "alerts", icon: "alert" },
  { label: "Notifications", page: "notifications", icon: "bell" },
  { label: "Profil", page: "profile", icon: "settings" },
];

/** @type {Record<DemoRole, DemoRoleConfig>} */
const ROLE_CONFIGS = {
  demandeur: {
    label: "Demandeur — Entreprise / Ministère",
    shortLabel: "Demandeur",
    description: "Dépôt et suivi des demandes",
    accent: "green",
    nav: NAV_DEMANDEUR,
  },
  recipient: {
    label: "Récipiendaire / Personne",
    shortLabel: "Récipiendaire",
    description: "Distinctions et documents personnels",
    accent: "gold",
    nav: NAV_RECIPIENT,
  },
  secretariat_ministre: {
    label: "Secrétariat — Ministre",
    shortLabel: "Secrétariat Ministre",
    description: "Réception et transmission pour le Ministre",
    accent: "blue",
    nav: NAV_SECRETARIAT,
  },
  secretariat_dgt: {
    label: "Secrétariat — DGT",
    shortLabel: "Secrétariat DGT",
    description: "Réception et transmission pour la DGT",
    accent: "blue",
    nav: NAV_SECRETARIAT,
  },
  secretariat_dr: {
    label: "Secrétariat — DR",
    shortLabel: "Secrétariat DR",
    description: "Réception et transmission pour la DR",
    accent: "blue",
    nav: NAV_SECRETARIAT,
  },
  ministre: {
    label: "Ministre — Décisions hiérarchiques",
    shortLabel: "Ministre",
    description: "Consultation et avis hiérarchiques",
    accent: "blue",
    nav: NAV_HIERARCHIE,
  },
  dgt: {
    label: "DGT — Décisions hiérarchiques",
    shortLabel: "DGT",
    description: "Examen et transmission des dossiers",
    accent: "blue",
    nav: NAV_HIERARCHIE,
  },
  dr: {
    label: "DR — Décisions hiérarchiques",
    shortLabel: "DR",
    description: "Décision de première instance",
    accent: "green",
    nav: NAV_HIERARCHIE,
  },
  service_agent: {
    label: "Service des Distinctions — Agent",
    shortLabel: "Service · Agent",
    description: "Instruction des dossiers",
    accent: "green",
    nav: NAV_SERVICE_AGENT,
  },
  service_inspecteur: {
    label: "Service des Distinctions — Inspecteur",
    shortLabel: "Service · Inspecteur",
    description: "Contrôle des justificatifs et des opérations",
    accent: "green",
    nav: NAV_SERVICE_INSPECTEUR,
  },
  service_chef: {
    label: "Service des Distinctions — Chef",
    shortLabel: "Service · Chef",
    description: "Validation, financement, cérémonies, pilotage",
    accent: "green",
    nav: NAV_SERVICE_CHEF,
  },
  regisseur: {
    label: "Régisseur des Médailles",
    shortLabel: "Régisseur",
    description: "Stock, approvisionnements et remises",
    accent: "gold",
    nav: NAV_REGISSEUR,
  },
  admin: {
    label: "Administrateur",
    shortLabel: "Administrateur",
    description: "Gestion de la plateforme",
    accent: "blue",
    nav: NAV_ADMIN,
  },
};

/** @type {DemoRole[]} */
const ROLE_ORDER = [
  "demandeur",
  "recipient",
  "secretariat_ministre",
  "secretariat_dgt",
  "secretariat_dr",
  "ministre",
  "dgt",
  "dr",
  "service_agent",
  "service_inspecteur",
  "service_chef",
  "regisseur",
  "admin",
];

/** Regroupe les 3 secrétariats (pour les tests et la navigation interne). */
const SECRETARIAT_ROLES = ["secretariat_ministre", "secretariat_dgt", "secretariat_dr"];
/** Regroupe les 3 services internes. */
const SERVICE_ROLES = ["service_agent", "service_inspecteur", "service_chef"];
/** Rôles internes (non publics) : pas de mode présentation grand public. */
const INTERNAL_ROLES = [...SECRETARIAT_ROLES, "ministre", "dgt", "dr", ...SERVICE_ROLES, "regisseur", "admin"];

function isDemoRole(value) {
  return Boolean(value && ROLE_ORDER.includes(value));
}

/** Dans l'original, toute chaîne non vide était acceptée comme page. */
function isDemoPage(value) {
  return Boolean(value);
}

/* ----------------------------- Navigation ----------------------------- */

/**
 * Lit une URL d'espace connecté. L'original utilisait le chemin
 * (`/app/<role>/<page>`) ; la version statique utilise le hash
 * (`#/app/<role>/<page>`), ce qui permet d'ouvrir le site directement
 * depuis le système de fichiers, sans serveur.
 * @param {string} path
 * @returns {{ role: DemoRole, page: string } | null}
 */
function parseWorkspacePath(path) {
  const parts = String(path || "").split("/").filter(Boolean);
  if (parts[0] !== "app") return null;
  const requested = parts[1];
  let role = isDemoRole(requested) ? requested : null;
  if (!role) {
    // Rétrocompatibilité : les anciens liens "secretariat" et "service"
    // pointent vers le premier sous-rôle, qui partage la même navigation.
    if (requested === "secretariat") role = "secretariat_ministre";
    else if (requested === "service") role = "service_chef";
    else return null;
  }
  return {
    role,
    page: isDemoPage(parts[2]) ? parts[2] : "overview",
  };
}

function workspacePath(role, page = "overview") {
  return `/app/${role}/${page}`;
}
