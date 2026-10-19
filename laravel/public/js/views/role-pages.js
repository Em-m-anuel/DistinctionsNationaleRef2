/* ==================================================================
   js/views/role-pages.js
   Pages spécifiques aux profils internes (ministre, dgt, dr,
   services, secrétaire, régisseur, admin).

   Toutes les pages sont fictives, purement illustratives. Aucun
   service backend n'est branché.
================================================================== */

const ROLE_DATA = {
  decisions: [
    { ref: "DNG-DEMO-2026-041", org: "SGI", recipients: 3, medal: "Argent", status: "À décider", tone: "warning", submitted: "10/09/2026" },
    { ref: "DNG-DEMO-MIN-2026-002", org: "MIN.TRAVAIL", recipients: 3, medal: "Bronze", status: "À décider", tone: "warning", submitted: "22/09/2026" },
    { ref: "DNG-DEMO-2026-008", org: "SGI", recipients: 2, medal: "Or", status: "Décidé", tone: "success", submitted: "08/02/2026", decision: "Approuvé" },
    { ref: "DNG-DEMO-2025-012", org: "SGI", recipients: 3, medal: "Or", status: "Décidé", tone: "success", submitted: "10/04/2025", decision: "Approuvé" },
  ],
  recours: [
    { ref: "REC-DEMO-2026-001", dossier: "DNG-DEMO-2025-01106", org: "CIG", reason: "Ancienneté contestée", submitted: "12/01/2026", status: "À examiner", tone: "warning" },
    { ref: "REC-DEMO-2025-002", dossier: "DNG-DEMO-2024-01984", org: "SGI", reason: "Pièce manquante levée", submitted: "18/11/2025", status: "Traité", tone: "success" },
    { ref: "REC-DEMO-2025-001", dossier: "DNG-DEMO-2024-005", org: "SGI", reason: "Posthume", submitted: "10/10/2024", status: "Traité", tone: "success" },
  ],
  relances: [
    { ref: "REL-DEMO-2026-001", dossier: "DNG-DEMO-2026-008", type: "Quittance à présenter", status: "En attente", tone: "warning" },
    { ref: "REL-DEMO-2026-002", dossier: "DNG-DEMO-2025-012", type: "Cérémonie confirmée", status: "Confirmé", tone: "success" },
    { ref: "REL-DEMO-2025-003", dossier: "DNG-DEMO-2024-005", type: "Distinction remise", status: "Terminé", tone: "neutral" },
  ],
};

/* ----- Décisions hiérarchiques (Ministre / DGT / DR) ----- */
function wsDecisionsPage(role) {
  const data = ROLE_DATA.decisions;
  const isDR = role === "dr";
  return wsIntro(
    "Décisions hiérarchiques",
    isDR ? "Le DR est l'autorité de décision finale sur le dossier initial. Examinez, approuvez ou rejetez avec motif." : "Examinez les dossiers et rendez un avis ou une décision.",
    isDR ? "Direction Régionale" : ROLE_CONFIGS[role].shortLabel.toUpperCase(),
  ) + `<div class="ws-paper"><div class="ws-section-heading"><div class="ws-eyebrow">DOSSIERS À DÉCIDER</div><h2 class="ws-page-title">Liste des dossiers</h2></div>${data.length ? `<div class="ws-table-wrap"><table class="ws-table"><thead><tr><th>Référence</th><th>Demandeur</th><th>Récipiendaires</th><th>Médaille</th><th>Déposé le</th><th>Statut</th><th><span class="sr-only">Action</span></th></tr></thead><tbody>${data.map((d) => `<tr><td><strong>${esc(d.ref)}</strong></td><td>${esc(d.org)}</td><td>${d.recipients}</td><td>${esc(d.medal)}</td><td>${esc(d.submitted)}</td><td>${toneBadge(d.status, d.tone)}</td><td>${d.status === "À décider" ? `<div class="ws-row-actions">${WBTN("Approuver", "ws-decision", { variant: "primary", attrs: { "data-kind": "approve", "data-ref": d.ref } })}${WBTN("Rejeter", "ws-decision", { variant: "secondary", attrs: { "data-kind": "reject", "data-ref": d.ref } })}</div>` : WBTN("Détail", "ws-no-api", { variant: "ghost", attrs: { "data-message": "Détail de la décision : service non connecté." } })}</td></tr>`).join("")}</tbody></table></div>` : `<p class="ws-empty">${icon("inbox", "size-7")}<strong>Aucun dossier à traiter</strong><span>Les dossiers transmis apparaîtront ici lorsqu'ils seront prêts à être examinés.</span></p>`}</div>`;
}

/* ----- Recours ----- */
function wsRecoursPage(role) {
  const data = ROLE_DATA.recours;
  return wsIntro(
    "Recours",
    "Recours déposés par les demandeurs après un rejet. Examinez la justification et décidez.",
    ROLE_CONFIGS[role].shortLabel.toUpperCase(),
  ) + `<div class="ws-paper"><div class="ws-section-heading"><div class="ws-eyebrow">RECOURS À EXAMINER</div><h2 class="ws-page-title">Liste des recours</h2></div>${data.length ? `<div class="ws-table-wrap"><table class="ws-table"><thead><tr><th>Référence</th><th>Dossier</th><th>Demandeur</th><th>Motif</th><th>Déposé le</th><th>Statut</th><th><span class="sr-only">Action</span></th></tr></thead><tbody>${data.map((r) => `<tr><td><strong>${esc(r.ref)}</strong></td><td>${esc(r.dossier)}</td><td>${esc(r.org)}</td><td>${esc(r.reason)}</td><td>${esc(r.submitted)}</td><td>${toneBadge(r.status, r.tone)}</td><td><div class="ws-row-actions">${WBTN("Examiner", "ws-no-api", { variant: "ghost", attrs: { "data-message": "Examen du recours : service non connecté." } })}${r.status === "À examiner" ? WBTN("Décider", "ws-decision", { variant: "primary", attrs: { "data-kind": "approve", "data-ref": r.ref } }) : ""}</div></td></tr>`).join("")}</tbody></table></div>` : `<p class="ws-empty">${icon("scale", "size-7")}<strong>Aucun recours</strong><span>Aucun recours à examiner pour le moment.</span></p>`}</div>`;
}

/* ----- Relances ----- */
function wsRelancesPage(role) {
  const data = ROLE_DATA.relances;
  return wsIntro(
    "Relances",
    "Demandes de suivi liées à vos dossiers. Confirmez ou proposez une nouvelle date.",
    ROLE_CONFIGS[role].shortLabel.toUpperCase(),
  ) + `<div class="ws-paper"><div class="ws-section-heading"><div class="ws-eyebrow">DEMANDES DE SUIVI</div><h2 class="ws-page-title">Relances à traiter</h2></div>${data.length ? `<div class="ws-table-wrap"><table class="ws-table"><thead><tr><th>Référence</th><th>Dossier</th><th>Type</th><th>Statut</th><th><span class="sr-only">Action</span></th></tr></thead><tbody>${data.map((r) => `<tr><td><strong>${esc(r.ref)}</strong></td><td>${esc(r.dossier)}</td><td>${esc(r.type)}</td><td>${toneBadge(r.status, r.tone)}</td><td><div class="ws-row-actions">${WBTN("Traiter", "ws-no-api", { variant: "ghost", attrs: { "data-message": "Traitement de la relance : service non connecté." } })}</div></td></tr>`).join("")}</tbody></table></div>` : `<p class="ws-empty">${icon("refresh", "size-7")}<strong>Aucune relance</strong><span>Aucune relance en attente.</span></p>`}</div>`;
}

/* ----- Activité interne ----- */
function wsActivityInternal(role) {
  const activities = [
    { actor: ROLE_CONFIGS[role].shortLabel, action: "a traité un dossier", ref: "DNG-DEMO-2026-008", date: "10/05/2026", comment: "Décision d'approbation." },
    { actor: ROLE_CONFIGS[role].shortLabel, action: "a demandé un complément", ref: "DNG-DEMO-2026-023", date: "22/09/2026", comment: "Attestation de travail à fournir." },
    { actor: ROLE_CONFIGS[role].shortLabel, action: "a transmis un dossier", ref: "DNG-DEMO-2026-041", date: "26/09/2026", comment: "Transmission au niveau suivant." },
    { actor: ROLE_CONFIGS[role].shortLabel, action: "a rendu un avis", ref: "DNG-DEMO-2025-01106", date: "04/03/2026", comment: "Avis favorable sur les récipiendaires." },
  ];
  return wsIntro(
    "Journal d'activité",
    "Chronologie illustrative des actions et transmissions internes.",
    "Traçabilité",
  ) + `<div class="ws-paper"><div class="ws-section-heading"><div class="ws-eyebrow">ACTIVITÉ RÉCENTE</div><h2 class="ws-page-title">Journal interne</h2></div><ul class="ws-activity-list">${activities.map((a) => `<li><span class="ws-activity-icon">${icon("clock", "size-4")}</span><div><strong>${esc(a.actor)}</strong> ${esc(a.action)} <span>${esc(a.ref)}</span><small>${esc(a.date)} · ${esc(a.comment)}</small></div></li>`).join("")}</ul></div>`;
}
