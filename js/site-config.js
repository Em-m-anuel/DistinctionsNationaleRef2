/* ==================================================================
   js/site-config.js
   Configuration du site multipage (source unique des URL).

   Un profil n'a pas une copie de l'interface : les URL sont regroupées
   par famille fonctionnelle (demandeur, secrétariat, direction, service,
   régie, administration, récipiendaire). Le rôle réel reste déterminé par
   la session (compte connecté ou profil de présentation) et non par l'URL.

   Chargé avant js/data.js : `workspacePath()` et `parseWorkspacePath()`
   s'appuient sur cette table.
================================================================== */

/** Pages métier de chaque famille, dans l'ordre du menu. */
const SITE_FAMILIES = {
  demandeur: {
    label: "Espace demandeur",
    base: "/profil/demandeur/",
    roles: ["demandeur"],
    pages: [
      "overview", "dossiers", "new-dossier", "recipients", "complements",
      "recours", "documents", "ceremonies", "payments", "pieces", "journal",
      "notifications", "profile",
    ],
  },
  recipient: {
    label: "Espace récipiendaire",
    dir: "recipiendaire",
    base: "/profil/recipiendaire/",
    roles: ["recipient"],
    pages: [
      "overview", "dossiers", "documents", "ceremonies", "distinctions",
      "retraits", "notifications", "profile",
    ],
  },
  secretariat: {
    label: "Secrétariat",
    base: "/profil/secretariat/",
    roles: ["secretariat_ministre", "secretariat_dgt", "secretariat_dr"],
    pages: [
      "overview", "dossiers", "new-dossier", "documents", "inbox",
      "ceremonies", "journal", "notifications", "profile",
    ],
  },
  direction: {
    label: "Direction",
    base: "/profil/direction/",
    roles: ["ministre", "dgt", "dr"],
    pages: [
      "overview", "dossiers", "decisions", "recours", "documents",
      "ceremonies", "stats", "journal", "notifications", "profile",
    ],
  },
  service: {
    label: "Service des Distinctions",
    base: "/profil/service/",
    roles: ["service_agent", "service_inspecteur", "service_chef"],
    pages: [
      "overview", "dossiers", "instruction", "supervision",
      "recipients", "complements", "recours", "documents", "ceremonies",
      "remises", "orders", "stats", "journal", "controle", "notifications",
      "profile",
    ],
  },
  regie: {
    label: "Régie des Médailles",
    base: "/profil/regie/",
    roles: ["regisseur"],
    pages: [
      "overview", "dossiers", "documents", "ceremonies", "remises",
      "orders", "stock", "retraits", "journal", "notifications", "profile",
    ],
  },
  admin: {
    label: "Administration",
    base: "/administration/",
    roles: ["admin"],
    pages: ["overview", "journal", "users", "notifications", "profile"],
  },
};

/** Libellés des pages (titres de document et fil d'Ariane). */
const SITE_PAGE_LABELS = {
  overview: "Vue d'ensemble",
  dossiers: "Dossiers",
  "new-dossier": "Nouveau dossier",
  recipients: "Récipiendaires",
  complements: "Compléments et relances",
  recours: "Recours",
  documents: "Courriers",
  ceremonies: "Cérémonies",
  payments: "Ordres de recette",
  pieces: "DTS et pièces",
  journal: "Journal d'activité",
  notifications: "Notifications",
  profile: "Profil et paramètres",
  distinctions: "Distinctions",
  retraits: "Retraits sans cérémonie",
  inbox: "Registre des courriers",
  decisions: "Décisions initiales",
  stats: "Statistiques",
  instruction: "Instruction",
  supervision: "Supervision",
  remises: "Remises des médailles",
  orders: "Ordres de recette",
  stock: "Stock des médailles",
  controle: "Contrôles et anomalies",
  users: "Comptes",
};

/**
 * Alias historiques : une page qui n'a pas sa propre URL est rattachée
 * à la page métier qui la rend réellement. Plusieurs cibles sont testées
 * dans l'ordre ; la première présente dans la famille gagne.
 */
const SITE_PAGE_ALIASES = {
  accueil: ["overview"],
  activity: ["journal"],
  history: ["journal"],
  agenda: ["ceremonies"],
  calendar: ["ceremonies"],
  "ceremony-calendar": ["ceremonies"],
  "ceremony-request": ["ceremonies"],
  "cer-demandes": ["ceremonies"],
  photos: ["ceremonies"],
  delegations: ["ceremonies"],
  "dossier-stats": ["stats"],
  employers: ["dossiers"],
  "employee-new": ["recipients", "distinctions"],
  "employee-stats": ["recipients", "distinctions"],
  employees: ["recipients", "distinctions"],
  "waiting-pieces": ["pieces", "complements"],
  justificatifs: ["pieces", "complements"],
  relances: ["complements"],
  "agent-relances": ["complements"],
  "agent-recours": ["recours"],
  "recours-historique": ["recours"],
  courrier: ["inbox", "documents"],
  transmissions: ["inbox", "documents"],
  "mail-register": ["inbox", "documents"],
  "mail-transmit": ["inbox", "documents"],
  withdrawals: ["retraits"],
  "withdrawal-request": ["retraits"],
  actions: ["retraits"],
  movements: ["stock"],
  diplomas: ["stock"],
  adjustments: ["controle"],
  anomalies: ["controle"],
  "controles-recip": ["controle"],
  "verify-history": ["journal"],
  "a-signer": ["documents"],
  "signature-profil": ["profile"],
  localisation: ["dossiers"],
  notify: ["instruction"],
  ready: ["instruction"],
  affiliations: ["distinctions"],
  parcours: ["distinctions"],
  "premium-quality": ["distinctions"],
  "internal-accounts": ["users"],
  campaigns: ["users"],
  settings: ["profile"],
  first: ["overview"],
  last: ["overview"],
  next: ["overview"],
  prev: ["overview"],
};

/** Segment d'URL (`/profil/<dir>/`) → famille fonctionnelle. */
const SITE_FAMILY_DIRS = Object.keys(SITE_FAMILIES).reduce((map, family) => {
  map[SITE_FAMILIES[family].dir || family] = family;
  return map;
}, {});

/** Rôle technique → famille fonctionnelle. */
const SITE_ROLE_FAMILY = Object.keys(SITE_FAMILIES).reduce((map, family) => {
  SITE_FAMILIES[family].roles.forEach((role) => { map[role] = family; });
  return map;
}, {});

function siteFamilyOf(role) {
  return SITE_ROLE_FAMILY[role] || null;
}

function siteFamilyConfig(roleOrFamily) {
  return SITE_FAMILIES[roleOrFamily]
    || SITE_FAMILIES[SITE_ROLE_FAMILY[roleOrFamily]]
    || SITE_FAMILIES[SITE_FAMILY_DIRS[roleOrFamily]]
    || null;
}

function siteFamilyRepresentativeRole(family) {
  const config = SITE_FAMILIES[family];
  return config ? config.roles[0] : null;
}

/**
 * Page canonique réellement servie par une famille.
 * @returns {string|null}
 */
function siteCanonicalPage(roleOrFamily, page) {
  const config = siteFamilyConfig(roleOrFamily);
  if (!config) return null;
  const name = String(page || "overview");
  if (config.pages.includes(name)) return name;
  const aliases = SITE_PAGE_ALIASES[name] || [];
  for (const candidate of aliases) {
    if (config.pages.includes(candidate)) return candidate;
  }
  if (name === "" || name === "index") return "overview";
  return null;
}

/** URL absolue d'une page de la famille du rôle connecté. */
function sitePagePath(roleOrFamily, page) {
  const config = siteFamilyConfig(roleOrFamily);
  if (!config) return "/";
  const canonical = siteCanonicalPage(roleOrFamily, page);
  if (!canonical || canonical === "overview") return config.base;
  return config.base + canonical + "/";
}

/**
 * URL d'une page publique. Les valeurs par défaut sont celles du site
 * multipage ; l'adaptateur Laravel les remplace par les routes de
 * l'application (SITE_PUBLIC), y compris sous un sous-dossier.
 * @param {'home'|'login'|'register'} name
 */
function sitePublicPath(name) {
  const key = name || "home";
  if (typeof SITE_PUBLIC !== "undefined" && SITE_PUBLIC[key]) return SITE_PUBLIC[key];
  if (key === "login") return "/connexion/";
  if (key === "register") return "/inscription/";
  return "/";
}

/** Toutes les URL du site, dérivées de la configuration. */
function siteAllRoutes() {
  const routes = [];
  Object.keys(SITE_FAMILIES).forEach((family) => {
    const config = SITE_FAMILIES[family];
    config.pages.forEach((page) => {
      routes.push({ family, page, path: sitePagePath(family, page) });
    });
  });
  return routes;
}
