import type { DemoDossier, DemoNotification, DemoRecipient } from "@/demo/types";

export const DEMO_NOTICE = "MODE DÉMONSTRATION — DONNÉES FICTIVES";

export const CAMPAIGNS = [
  "Campagne 2026 — Distinctions professionnelles",
  "Campagne 2025 — Reconnaissance de l'ancienneté",
  "Campagne 2024 — Valorisation du mérite professionnel",
];

export const DOSSIERS: DemoDossier[] = [
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

export const ALL_RECIPIENTS: DemoRecipient[] = DOSSIERS.flatMap((dossier) => dossier.recipients);

export const NOTIFICATIONS: DemoNotification[] = [
  { id: "N-001", title: "Complément demandé", description: "Une attestation de travail est attendue pour le dossier DNG-2026-00372.", date: "Aujourd'hui, 10:14", tone: "warning", read: false, reference: "DNG-2026-00372" },
  { id: "N-002", title: "Dossier transmis", description: "Le dossier DNG-2026-00418 a été transmis au Service des Distinctions.", date: "Hier, 16:05", tone: "info", read: false, reference: "DNG-2026-00418" },
  { id: "N-003", title: "Cérémonie confirmée", description: "La cérémonie de la campagne 2025 est planifiée le 04 avril 2026.", date: "04/03/2026", tone: "success", read: true },
  { id: "N-004", title: "Quittance à présenter", description: "La quittance de l'ordre de recette OR-2025-00841 est disponible.", date: "28/02/2026", tone: "info", read: true, reference: "OR-2025-00841" },
];

export const ACTIVITIES = [
  { actor: "Claire Mba", role: "Service des Distinctions", action: "a demandé un complément", date: "Aujourd'hui, 10:14", reference: "DNG-2026-00372", comment: "Attestation de travail à joindre pour Hélène Biyogo." },
  { actor: "Secrétariat central", role: "Transmission", action: "a transmis un dossier", date: "Hier, 16:05", reference: "DNG-2026-00418", comment: "Transmission vers le Service des Distinctions Nationales." },
  { actor: "Direction Régionale Estuaire", role: "DR", action: "a rendu un avis", date: "04/03/2026", reference: "DNG-2025-01106", comment: "Avis favorable sur les récipiendaires validés." },
  { actor: "Régie des Médailles", role: "Régisseur", action: "a réservé 8 médailles", date: "03/03/2026", reference: "DNG-2026-00418", comment: "Préparation de la cérémonie du 18 juin 2026." },
];

export const STOCK = [
  { type: "Bronze", quantity: 148, reserved: 32, threshold: 60, accent: "bronze" },
  { type: "Argent", quantity: 96, reserved: 24, threshold: 40, accent: "silver" },
  { type: "Or", quantity: 43, reserved: 18, threshold: 30, accent: "gold" },
  { type: "Diplômes", quantity: 360, reserved: 86, threshold: 100, accent: "paper" },
];

export const CEREMONIES = [
  { id: "CER-026", date: "04/04/2026", title: "Campagne 2025 — Reconnaissance de l'ancienneté", location: "Libreville — Hôtel de ville", participants: 22, status: "Confirmée", tone: "success" as const },
  { id: "CER-027", date: "21/05/2026", title: "Distinctions professionnelles — Estuaire", location: "Port-Gentil — Centre administratif", participants: 6, status: "À confirmer", tone: "warning" as const },
  { id: "CER-028", date: "18/06/2026", title: "Campagne 2026 — Distinctions professionnelles", location: "Libreville — Salle des conférences", participants: 8, status: "Planifiée", tone: "info" as const },
];