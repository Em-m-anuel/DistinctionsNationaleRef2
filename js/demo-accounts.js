/* ==================================================================
   js/demo-accounts.js
   Comptes de démonstration — exclusivement destinés à la présentation.

   Aucun de ces comptes n'est réel.
   - Aucune adresse e-mail n'est valide.
   - Aucun mot de passe n'est un secret de service.
   - Le mot de passe partagé « Demo123! » est unique à l'aperçu local.
   - Ces comptes ne sont JAMAIS acceptés par le service d'authentification
     réel : ils existent uniquement pour piloter le mode présentation
     (`PRESENTATION_MODE`).

   Le tableau DEMO_ACCOUNTS est consommé par :
   - la page de connexion (sélecteur de profil démo) ;
   - js/portal-demo.js (chargement de INTERNAL_DEMO) ;
   - tests/smoke.cjs (vérification d'intégrité).
================================================================== */

const DEMO_PASSWORD = "Demo123!";

/**
 * Comptes de démonstration, mappés sur les rôles de l'application.
 * @typedef {{
 *   email: string,
 *   role: string,
 *   label: string,
 *   shortLabel: string,
 *   category: "demandeur"|"personne"|"secretariat"|"autorite"|"service"|"regisseur"|"admin",
 *   description: string,
 *   icon: string,
 *   accent: "green"|"blue"|"gold"
 * }} DemoAccount
 */

/** @type {DemoAccount[]} */
const DEMO_ACCOUNTS = [
  // ----- Demandeurs (espace entreprise / ministère) -----
  { email: "demo.entreprise@example.test",  role: "demandeur", label: "DEMO · Entreprise",        shortLabel: "Entreprise",       category: "demandeur",  description: "Société Gabonaise des Infrastructures (SGI)",        icon: "building", accent: "green" },
  { email: "demo.ministere@example.test",   role: "demandeur", label: "DEMO · Ministère",         shortLabel: "Ministère",        category: "demandeur",  description: "Ministère du Travail et de la Fonction publique",   icon: "shield",   accent: "blue"  },
  // ----- Récipiendaires -----
  { email: "demo.personne@example.test",    role: "recipient", label: "DEMO · Personne",          shortLabel: "Personne",         category: "personne",   description: "Alain Moussavou — technicien supérieur",            icon: "user",     accent: "gold"  },
  // ----- Secrétariats -----
  { email: "demo.secretariat.ministre@example.test", role: "secretariat_ministre", label: "DEMO · Secrétariat Ministre", shortLabel: "Secr. Ministre", category: "secretariat", description: "Secrétariat central du Ministre",         icon: "inbox",    accent: "blue"  },
  { email: "demo.secretariat.dgt@example.test",       role: "secretariat_dgt",       label: "DEMO · Secrétariat DGT",       shortLabel: "Secr. DGT",      category: "secretariat", description: "Secrétariat de la Direction Générale du Travail", icon: "inbox",    accent: "blue"  },
  { email: "demo.secretariat.dr@example.test",        role: "secretariat_dr",        label: "DEMO · Secrétariat DR",        shortLabel: "Secr. DR",       category: "secretariat", description: "Secrétariat de la Direction Régionale",            icon: "inbox",    accent: "blue"  },
  // ----- Autorités -----
  { email: "demo.ministre@example.test",    role: "ministre", label: "DEMO · Ministre",          shortLabel: "Ministre",        category: "autorite",   description: "Ministre du Travail",                                 icon: "userCheck",accent: "blue"  },
  { email: "demo.dgt@example.test",         role: "dgt",      label: "DEMO · DGT",               shortLabel: "DGT",             category: "autorite",   description: "Direction Générale du Travail",                       icon: "userCheck",accent: "blue"  },
  { email: "demo.dr@example.test",          role: "dr",       label: "DEMO · DR",                shortLabel: "DR",              category: "autorite",   description: "Direction Régionale du Travail — Estuaire",           icon: "userCheck",accent: "green" },
  // ----- Service des Distinctions -----
  { email: "demo.service.agent@example.test",      role: "service_agent",      label: "DEMO · Service · Agent",      shortLabel: "Service · Agent",      category: "service", description: "Agent d'instruction du Service des Distinctions",        icon: "userPlus",  accent: "green" },
  { email: "demo.service.inspecteur@example.test", role: "service_inspecteur", label: "DEMO · Service · Inspecteur", shortLabel: "Service · Inspecteur", category: "service", description: "Inspecteur du Service des Distinctions",                 icon: "shield",    accent: "green" },
  { email: "demo.service.chef@example.test",       role: "service_chef",       label: "DEMO · Service · Chef",       shortLabel: "Service · Chef",       category: "service", description: "Chef du Service des Distinctions Nationales",            icon: "shield",    accent: "green" },
  // ----- Régisseur -----
  { email: "demo.regisseur@example.test", role: "regisseur", label: "DEMO · Régisseur", shortLabel: "Régisseur", category: "regisseur", description: "Régie des Médailles",                       icon: "medal",  accent: "gold" },
  // ----- Administrateur -----
  { email: "demo.admin@example.test",     role: "admin",     label: "DEMO · Administrateur", shortLabel: "Administrateur", category: "admin",    description: "Administrateur de la plateforme",            icon: "settings", accent: "blue" },
];

/**
 * Trouve le compte démo associé à un e-mail. Comparaison insensible à la casse.
 * @param {string} email
 * @returns {DemoAccount | null}
 */
function findDemoAccount(email) {
  if (!email) return null;
  const target = String(email).trim().toLowerCase();
  return DEMO_ACCOUNTS.find((account) => account.email === target) || null;
}

/**
 * Regroupe les comptes par catégorie pour le sélecteur de la page de connexion.
 * @returns {Array<{ key: DemoAccount["category"], label: string, accounts: DemoAccount[] }>}
 */
function groupDemoAccounts() {
  const order = ["demandeur", "personne", "secretariat", "autorite", "service", "regisseur", "admin"];
  const labels = {
    demandeur: "Demandeurs",
    personne: "Personnes / Récipiendaires",
    secretariat: "Secrétariats",
    autorite: "Autorités",
    service: "Service des Distinctions",
    regisseur: "Régisseur",
    admin: "Administration",
  };
  return order.map((key) => ({
    key,
    label: labels[key],
    accounts: DEMO_ACCOUNTS.filter((account) => account.category === key),
  })).filter((group) => group.accounts.length > 0);
}
