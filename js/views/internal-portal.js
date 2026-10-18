/* ==================================================================
   js/views/internal-portal.js
   Harmonisation des espaces internes (autorités, service, régie, admin)
   sur la coquille visuelle du portail. Les actions restent celles du
   magasin cf-store ; aucun pouvoir métier n’est inventé.
================================================================== */

const IP_SPACE = {
  ministre: { eyebrow: "ESPACE MINISTRE", art: "senate", greeting: "Cabinet du Ministre" },
  dgt: { eyebrow: "ESPACE DGT", art: "senate", greeting: "Direction Générale du Travail" },
  dr: { eyebrow: "ESPACE DR", art: "scale", greeting: "Direction de la Réglementation" },
  secretariat_ministre: { eyebrow: "SECRÉTARIAT — MINISTRE", art: "inbox", greeting: "Secrétariat du Ministre" },
  secretariat_dgt: { eyebrow: "SECRÉTARIAT — DGT", art: "inbox", greeting: "Secrétariat de la DGT" },
  secretariat_dr: { eyebrow: "SECRÉTARIAT — DR", art: "inbox", greeting: "Secrétariat de la DR" },
  service_agent: { eyebrow: "SERVICE DES DISTINCTIONS — AGENT", art: "scale", greeting: "Instruction" },
  service_inspecteur: { eyebrow: "SERVICE DES DISTINCTIONS — INSPECTEUR", art: "scale", greeting: "Contrôle" },
  service_chef: { eyebrow: "SERVICE DES DISTINCTIONS — CHEF", art: "scale", greeting: "Pilotage du Service" },
  regisseur: { eyebrow: "RÉGIE DES MÉDAILLES", art: "treasure", greeting: "Stock et remises" },
  admin: { eyebrow: "ADMINISTRATION TECHNIQUE", art: "compass", greeting: "Comptes et journaux" },
  demandeur: { eyebrow: "ESPACE DEMANDEUR", art: "scale", greeting: "Structure déposante" },
  recipient: { eyebrow: "ESPACE RÉCIPIENDAIRE", art: "medal", greeting: "Distinctions vous concernant" },
};

function goRef() {
  if (typeof window !== "undefined" && window.GO) return window.GO;
  if (typeof GO !== "undefined") return GO;
  return null;
}
function goIco(name) {
  const G = goRef();
  if (G && typeof G.icon === "function") return G.icon(name);
  return `<svg class="ic" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
}

function viewToPage(view, role) {
  if (typeof goPageFor === "function") return goPageFor(view, role);
  if (view === "nouveau") return "new-dossier";
  if (view === "apercu") return "overview";
  if (view === "beneficiaires") return "recipients";
  if (view === "statistiques") return "stats";
  if (view === "recettes") return role === "demandeur" ? "payments" : "orders";
  if (view === "transmissions") return "inbox";
  if (view === "courriers") return "documents";
  if (view === "administration") return "users";
  if (view === "profil") return "profile";
  return view;
}

function ipNav(role) {
  if (typeof cfState !== "undefined") cfState.spaceRole = role;
  if (typeof goHydrate === "function") goHydrate(role);
  const G = goRef();
  const secs = (G && typeof G.navSections === "function") ? G.navSections() : [];
  if (!secs.length) return null;
  return secs.map((sec) => {
    const children = (sec.pages || []).map((p) => ({ page: viewToPage(p.view, role), label: p.label, view: p.view }));
    if (children.length <= 1) return { page: (children[0] && children[0].page) || "overview", label: sec.label, icon: sec.icon, count: sec.count };
    return { page: children[0].page, label: sec.label, icon: sec.icon, count: sec.count, children };
  });
}

function ipMay(role, action) {
  const r = role || (typeof cfRole === "function" ? cfRole() : "");
  const map = {
    approve: ["dr"],
    cascade: ["ministre", "dgt"],
    reject: ["dr", "ministre", "dgt"],
    "rec-ok": ["service_agent", "service_chef"],
    "rec-no": ["service_agent", "service_chef"],
    "start-study": ["service_agent", "service_chef"],
    "finish-instr": ["service_agent", "service_chef"],
    "notify-list": ["service_chef"],
    "issue-order": ["service_chef"],
    "val-date": ["service_chef"],
    "gen-del": ["service_chef"],
    "gen-dip": ["service_chef"],
    "go-order": ["service_chef"],
    "order-revue": ["service_chef"],
    "order-step": ["service_chef"],
    "recours-ok": ["ministre", "dgt", "dr"],
    "revue-recours-no": ["ministre", "dgt", "dr"],
    "relance-ok": ["ministre", "dgt", "dr"],
    "relance-no": ["ministre", "dgt", "dr"],
    "cer-ok": ["ministre", "dgt", "dr"],
    "do-remise": ["regisseur"],
    "qui-ok": ["regisseur"],
    "wd-ok": ["regisseur", "service_inspecteur"],
    "toggle-user": ["admin"],
    "flag-anomaly": ["service_inspecteur", "service_agent"],
    transmit: ["secretariat_ministre", "secretariat_dgt", "secretariat_dr"],
    "visa-doc": ["ministre", "dgt", "dr", "service_chef"],
    "stamp-doc": ["ministre", "dgt", "dr", "service_chef"],
    "sign-doc": ["ministre", "dgt", "dr", "service_chef"],
    "seal-doc": ["ministre", "dgt", "dr", "service_chef"],
    "nego-svc": ["service_chef"],
    "nego-submit": ["service_chef"],
    catchup: ["service_chef"],
    "save-del-draft": ["service_agent", "service_chef"],
  };
  const allowed = map[action];
  if (!allowed) return true;
  return allowed.includes(r);
}

function ipDenied(text) {
  return `<section class="page-head"><p class="page-eyebrow">Accès</p><h1 class="page-title">Page indisponible</h1><p class="page-sub">${esc(text)}</p></section>`;
}

function ipStat(label, value, sub, page, ico) {
  if (typeof portalStat === "function") return portalStat(label, value, sub, ico || "folder", page || "");
  return `<button type="button" data-action="ws-page" data-page="${page || "overview"}" class="portal-stat"><small>${esc(label)}</small><strong>${esc(String(value))}</strong><span>${esc(sub || "")}</span></button>`;
}

function ipPaper(title, body, eyebrow) {
  return `<section class="page-head"><p class="page-eyebrow">${esc(eyebrow || "")}</p>${title ? `<h1 class="page-title">${title}</h1>` : ""}</section>
    <section class="card mt">${body}</section>`;
}

function ipStatusLabel(status) {
  return (typeof CF_STATUS_LABEL !== "undefined" && CF_STATUS_LABEL[status]) || status || "—";
}

function ipActivity(items, emptyText) {
  if (!items.length) return typeof cfEmpty === "function" ? cfEmpty(emptyText || "Rien à traiter pour le moment.", "checkCircle") : "";
  return `<div class="portal-activity">${items.join("")}</div>`;
}

function ipActivityRow(page, title, sub, attrs, badge) {
  return `<button type="button" class="portal-activity-row" data-action="ws-page" data-page="${page}" ${attrs || ""}>
    <span class="portal-activity-mark"></span>
    <span><strong>${esc(title)}</strong><small>${esc(sub)}</small></span>
    ${badge || (typeof icon === "function" ? icon("arrowRight", "size-4") : "")}
  </button>`;
}

function ipApplicantName(id) {
  const a = typeof cfApplicant === "function" ? cfApplicant(id) : null;
  return a ? (a.sigle || a.nom) : "—";
}

function ipQueue(role, type) {
  return typeof cfAuthQueue === "function" ? cfAuthQueue(role, type) : [];
}

function ipAuthHome(role) {
  const qD = ipQueue(role, "dossier");
  const qR = ipQueue(role, "recours");
  const qL = ipQueue(role, "relance");
  const qC = ipQueue(role, "ceremonie");
  const oldest = ipQueue(role).slice(0, 6);
  const lead = role === "dr"
    ? "Décision de première instance : n’approuvez ou ne rejetez que les dossiers de votre file."
    : "Vous orientez le dossier (indications + transmission). Vous n’instruisez pas à la place du Service.";
  const rows = oldest.length ? oldest.map((x) => {
    const page = x.mail.type === "dossier" ? "dossiers" : x.mail.type === "recours" ? "recours" : x.mail.type === "relance" ? "relances" : "ceremonies";
    return `<button type="button" class="portal-activity-row" data-cf-action="select" data-id="${x.mail.id}" data-action="ws-page" data-page="${page}">
      <span class="portal-activity-mark"></span>
      <span><strong>${esc(x.dossier.ref)}</strong><small>${esc(x.mail.type)} · ${esc(x.mail.date)} · ${esc(ipApplicantName(x.dossier.applicantId))}</small></span>
      ${typeof cfBadge === "function" ? cfBadge(x.dossier.status) : ""}
    </button>`;
  }).join("") : (typeof cfEmpty === "function" ? cfEmpty("Aucune file en attente.", "checkCircle") : "");
  return `<div class="portal-stats portal-reveal">
      ${ipStat("Dossiers à examiner", qD.length, "File de votre niveau", "dossiers", "folder")}
      ${ipStat("Recours", qR.length, "À statuer", "recours", "scale")}
      ${ipStat("Relances", qL.length, "À traiter", "relances", "refresh")}
      ${ipStat("Cérémonies", qC.length, "Demandes à examiner", "ceremonies", "calendar")}
    </div>
    ${ipPaper("Les plus anciens", rows, "PRIORITÉ")}
    ${typeof goPipeline === "function" ? goPipeline({ dossiers: qD.length, recours: qR.length, relances: qL.length, ceremonies: qC.length }, "dossiers") : ""}
    ${typeof portalExplain === "function" ? portalExplain(lead) : ""}`;
}

function ipAgentHome() {
  const s = cfS();
  const list = s.dossiers.filter((d) => ["APPROUVE", "EN_ETUDE"].includes(d.status));
  const cplItems = [];
  s.dossiers.forEach((d) => (d.complements || []).filter((c) => c.status === "ouvert").forEach((c) => cplItems.push({ d, c })));
  const recip = s.dossiers.reduce((n, d) => n + (d.recipients || []).length, 0);
  const rows = list.slice(0, 6).map((d) => ipActivityRow(
    "instruction",
    d.ref,
    ipApplicantName(d.applicantId) + " · " + ipStatusLabel(d.status),
    `data-cf-action="select" data-id="${d.id}"`,
    typeof cfBadge === "function" ? cfBadge(d.status) : ""
  ));
  const cplRows = cplItems.slice(0, 6).map((x) => ipActivityRow(
    "waiting-pieces",
    x.d.ref,
    (x.c.objet || "Complément") + " · " + (x.c.date || ""),
    `data-cf-action="select" data-id="${x.d.id}"`
  ));
  return `<div class="portal-stats portal-reveal">
      ${ipStat("Dossiers à instruire", list.length, "Approuvés ou en étude", "instruction", "folder")}
      ${ipStat("Compléments ouverts", cplItems.length, "Pièces encore attendues", "waiting-pieces", "upload")}
      ${ipStat("Récipiendaires suivis", recip, "Toutes campagnes visibles", "recipients", "users")}
    </div>
    <div class="portal-feature-grid">
      ${ipPaper("File d’instruction", ipActivity(rows, "Aucun dossier à instruire."), "À TRAITER")}
      ${ipPaper("Compléments ouverts", ipActivity(cplRows, "Aucun complément ouvert."), "PIÈCES")}
    </div>
    ${typeof goPipeline === "function" ? (() => { const by = {}; cfS().dossiers.forEach((d) => { by[d.status] = (by[d.status] || 0) + 1; }); return goPipeline(by, "instruction"); })() : ""}
    ${typeof portalExplain === "function" ? portalExplain("L’agent instruit le dossier et les récipiendaires. Il n’émet pas l’ordre de recette et n’organise pas la cérémonie.") : ""}`;
}

function ipInspecteurHome() {
  const s = cfS();
  const ctrl = s.dossiers.filter((d) => ["EN_ETUDE", "APPROUVE", "ORDRE_EMIS", "PAYE"].includes(d.status));
  const wd = (s.withdrawals || []).filter((w) => w.status === "en attente");
  const flags = [];
  s.dossiers.forEach((d) => (d.anomalies || []).forEach((a) => flags.push({ d, a })));
  const ctrlRows = ctrl.slice(0, 6).map((d) => ipActivityRow(
    "instruction",
    d.ref,
    ipApplicantName(d.applicantId) + " · " + ipStatusLabel(d.status),
    `data-cf-action="select" data-id="${d.id}"`,
    typeof cfBadge === "function" ? cfBadge(d.status) : ""
  ));
  const flagRows = flags.slice(0, 6).map((x) => ipActivityRow(
    "anomalies",
    x.d.ref,
    (x.a.texte || x.a.motif || "Signalement") + " · " + (x.a.date || ""),
    `data-cf-action="select" data-id="${x.d.id}"`
  ));
  const wdRows = wd.slice(0, 6).map((w) => ipActivityRow(
    "retraits",
    (w.prenom || "") + " " + (w.nom || w.tracking || w.id),
    (w.campaign || "") + " · " + (w.status || "en attente"),
    `data-cf-action="select" data-id="${w.id}"`
  ));
  return `<div class="portal-stats portal-reveal">
      ${ipStat("Dossiers à contrôler", ctrl.length, "Consultation et pièces", "instruction", "folder")}
      ${ipStat("Retraits en attente", wd.length, "Quittance et autorisation", "retraits", "users")}
      ${ipStat("Anomalies signalées", flags.length, "Sans décision de validation", "anomalies", "alert")}
    </div>
    <div class="portal-feature-grid">
      ${ipPaper("Contrôles en cours", ipActivity(ctrlRows, "Aucun dossier à contrôler."), "VÉRIFICATION")}
      ${ipPaper("Retraits et signalements", ipActivity(wdRows.concat(flagRows), "Aucun retrait ni signalement."), "SANS DÉCISION")}
    </div>
    ${typeof goPipeline === "function" ? (() => { const by = {}; ctrl.forEach((d) => { by[d.status] = (by[d.status] || 0) + 1; }); return goPipeline(by, "instruction"); })() : ""}
    ${typeof portalExplain === "function" ? portalExplain("L’inspecteur vérifie et signale. Il ne valide pas une médaille, n’émet pas d’ordre et n’approuve pas un dossier à la place du DR ou du Chef de service.") : ""}`;
}

function ipChefHome() {
  const s = cfS();
  const instr = s.dossiers.filter((d) => ["APPROUVE", "EN_ETUDE"].includes(d.status));
  const ready = s.dossiers.filter((d) => d.status === "EN_ETUDE" && !d.notified && (d.recipients || []).every((r) => (r.medals || []).every((m) => m.status !== "EN_ATTENTE")));
  const ord = s.dossiers.filter((d) => d.status === "VALIDE" && !d.order);
  const pay = s.dossiers.filter((d) => d.status === "ORDRE_EMIS");
  const cer = s.dossiers.filter((d) => d.ceremonyRequest);
  const arch = s.dossiers.filter((d) => d.status === "CLOTURE");
  const readyRows = ready.slice(0, 6).map((d) => ipActivityRow(
    "notify",
    d.ref,
    ipApplicantName(d.applicantId) + " — instruction achevée",
    `data-cf-action="select" data-id="${d.id}"`,
    typeof cfBadge === "function" ? cfBadge(d.status) : ""
  ));
  const ordRows = ord.slice(0, 6).map((d) => ipActivityRow(
    "orders",
    d.ref,
    "Ordre de recette à émettre — distinct du paiement",
    `data-cf-action="select" data-id="${d.id}"`
  ));
  return `<div class="portal-stats portal-reveal">
      ${ipStat("En instruction", instr.length, "Étude en cours", "instruction", "folder")}
      ${ipStat("Prêts / à notifier", ready.length, "Liste des validés", "notify", "checkCircle")}
      ${ipStat("Ordres à émettre", ord.length, "Distinct du paiement", "orders", "fileText")}
      ${ipStat("En attente de paiement", pay.length, "Quittance du Trésor", "payments-follow", "clock")}
      ${ipStat("Cérémonies", cer.length, "Demandes ouvertes", "cer-demandes", "calendar")}
      ${ipStat("Archivés", arch.length, "Dossiers clôturés", "archives", "clipboard")}
    </div>
    <div class="portal-feature-grid">
      ${ipPaper("Listes à notifier", ipActivity(readyRows, "Aucune liste prête."), "INSTRUCTION ACHEVÉE")}
      ${ipPaper("Ordres de recette", ipActivity(ordRows, "Aucun ordre à émettre."), "ORDRE ≠ PAIEMENT")}
    </div>
    ${typeof goPipeline === "function" ? (() => { const by = {}; cfS().dossiers.forEach((d) => { by[d.status] = (by[d.status] || 0) + 1; }); return goPipeline(by, "instruction"); })() : ""}
    ${typeof portalExplain === "function" ? portalExplain("L’ordre de recette n’est pas un paiement. Le paiement se fait au Trésor ; la quittance est versée ensuite.") : ""}`;
}

function ipRegHome() {
  const html = typeof cfRegHome === "function" ? cfRegHome() : "";
  const restyle = html.replace(/class="cf-dash"/g, "class=\"portal-stats\"")
    .replace(/class="cf-card"/g, "class=\"portal-stat\"")
    .replace(/class="cf-stock-cards"/g, "class=\"portal-stats\"")
    .replace(/class="cf-stock-card"/g, "class=\"portal-stat\"");
  const s = cfS();
  const qui = s.dossiers.filter((d) => d.status === "ORDRE_EMIS" && d.quittance);
  const ret = (s.withdrawals || []).filter((w) => w.status === "en attente");
  const moves = (s.movements || []).slice(0, 6);
  const quiRows = qui.slice(0, 6).map((d) => ipActivityRow(
    "remises",
    d.ref,
    "Quittance à vérifier avant remise",
    `data-cf-action="select" data-id="${d.id}"`
  ));
  const moveRows = moves.map((m) => ipActivityRow(
    "movements",
    (m.sens || "") + " · " + (m.metal || ""),
    (m.date || "") + " · " + (m.motif || "") + (m.qty != null ? " · " + m.qty : "")
  ));
  const retRows = ret.slice(0, 4).map((w) => ipActivityRow(
    "retraits",
    (w.prenom || "") + " " + (w.nom || w.tracking || w.id),
    (w.status || "en attente") + " · " + (w.date || "")
  ));
  return restyle
    + `<div class="portal-feature-grid">
        ${ipPaper("Guichet", ipActivity(quiRows.concat(retRows), "Aucune remise ni retrait en attente."), "REMISES")}
        ${ipPaper("Derniers mouvements", ipActivity(moveRows, "Aucun mouvement."), "STOCK")}
      </div>`
    + (typeof portalExplain === "function" ? portalExplain("Le régisseur remet après quittance conforme. Les commandes d’approvisionnement ne sont pas des ordres de recette.") : "");
}

function ipAdminHome() {
  const s = cfS();
  const inactive = s.users.filter((u) => !u.actif);
  const chain = s.stats && s.stats.chainOk;
  const journal = (s.journal || []).slice(0, 6);
  const userRows = inactive.slice(0, 6).map((u) => ipActivityRow(
    "internal-accounts",
    (u.prenom || "") + " " + (u.nom || u.email),
    (u.role || "") + " · inactif",
    `data-cf-action="select" data-id="${u.id}"`
  ));
  const journalRows = journal.map((j) => ipActivityRow(
    "journal",
    j.action || "Événement",
    (j.date || "") + " · " + (j.actor || "") + (j.details ? " · " + j.details : "")
  ));
  return `<div class="portal-stats portal-reveal">
      ${ipStat("Comptes", s.users.length, inactive.length ? inactive.length + " inactif(s)" : "Tous actifs", "users", "users")}
      ${ipStat("Cachets", s.stamps.length, "Cachets enregistrés", "stamps", "award")}
      ${ipStat("Journaux", s.journal.length, "Événements d’audit", "journal", "fileText")}
      ${ipStat("Chaîne de signature", chain ? "Vérifiée" : "À contrôler", "Journal technique", "journal-sig", "shield")}
    </div>
    <div class="portal-feature-grid">
      ${ipPaper("Comptes à revoir", ipActivity(userRows, "Aucun compte inactif."), "ADMINISTRATION")}
      ${ipPaper("Journal récent", ipActivity(journalRows, "Aucun événement."), "AUDIT")}
    </div>
    ${typeof portalExplain === "function" ? portalExplain("L’administrateur gère les comptes, les cachets et les journaux. Il n’examine pas les dossiers, n’approuve pas une distinction et n’émet pas d’ordre de recette.") : ""}`;
}

function ipSecHome(role) {
  const box = typeof cfSecMails === "function" ? cfSecMails("") : (typeof cfInbox === "function" ? cfInbox(role) : []);
  const reg = typeof cfSecMails === "function" ? cfSecMails("register") : [];
  const tx = typeof cfSecMails === "function" ? cfSecMails("transmit") : (typeof cfInbox === "function" ? cfInbox(role) : []);
  const rowFor = (m, page) => {
    const d = typeof cfFindDossier === "function" ? cfFindDossier(m.dossierId) : null;
    return ipActivityRow(
      page,
      (d && d.ref) || m.dossierId || m.id,
      (m.type || "courrier") + " · " + (m.date || "") + (m.status === "a_enregistrer" ? " · à enregistrer" : m.status === "a_transmettre" ? " · à transmettre" : ""),
      `data-cf-action="select" data-id="${m.id}"`
    );
  };
  const regRows = reg.slice(0, 6).map((m) => rowFor(m, "mail-register"));
  const txRows = tx.slice(0, 6).map((m) => rowFor(m, "mail-transmit"));
  return `<div class="portal-stats portal-reveal">
      ${ipStat("Boîte", box.length, "Courriers de ce niveau", "inbox", "inbox")}
      ${ipStat("À enregistrer", reg.length, "Référence interne", "mail-register", "upload")}
      ${ipStat("À transmettre", tx.length, "Sans décider", "mail-transmit", "relay")}
    </div>
    <div class="portal-feature-grid">
      ${ipPaper("Courriers à enregistrer", ipActivity(regRows, "Aucun courrier à enregistrer."), "RÉFÉRENCE")}
      ${ipPaper("Courriers à transmettre", ipActivity(txRows, "Aucun courrier à transmettre."), "SANS DÉCISION")}
    </div>
    ${typeof portalExplain === "function" ? portalExplain("Le secrétariat enregistre et transmet. Il ne statue ni sur le dossier, ni sur un recours.") : ""}`;
}

function ipTransmitted(role) {
  const level = cfLevelOf(role);
  const mails = cfS().mails.filter((m) => m.level === level && (m.transmittedAt || m.phase === "autorite"));
  const rows = mails.map((m) => {
    const d = cfFindDossier(m.dossierId);
    return `<tr><td>${esc(d ? d.ref : m.dossierId)}</td><td>${esc(m.type)}</td><td>${esc(m.transmittedAt || m.date)}</td><td>${esc(m.status)}</td></tr>`;
  }).join("");
  return ipPaper("Dossiers transmis", rows
    ? `<div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Dossier</th><th>Type</th><th>Date</th><th>Statut</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : (typeof cfEmpty === "function" ? cfEmpty("Aucun dossier transmis à ce niveau.", "folder") : ""), "HISTORIQUE DE VOTRE NIVEAU");
}

function ipAuthStats(role) {
  const q = {
    dossiers: ipQueue(role, "dossier").length,
    recours: ipQueue(role, "recours").length,
    relances: ipQueue(role, "relance").length,
    ceremonies: ipQueue(role, "ceremonie").length,
  };
  return `<div class="portal-stats">
      ${ipStat("File dossiers", q.dossiers, "En attente", "dossiers", "folder")}
      ${ipStat("File recours", q.recours, "En attente", "recours", "scale")}
      ${ipStat("File relances", q.relances, "En attente", "relances", "refresh")}
      ${ipStat("File cérémonies", q.ceremonies, "En attente", "ceremonies", "calendar")}
    </div>
    ${typeof portalExplain === "function" ? portalExplain("Ces chiffres ne concernent que votre niveau. Les dossiers des autres autorités ne sont pas mélangés.") : ""}`;
}

function ipRecipientsPage() {
  const rows = [];
  cfS().dossiers.forEach((d) => (d.recipients || []).forEach((r) => {
    const years = r.years || (typeof cfYears === "function" ? cfYears(r.start) : "—");
    const metal = ((r.medals || [])[0] || {}).metal || "—";
    rows.push(`<tr>
      <td><button type="button" class="portal-row-link" data-cf-action="panel-rec" data-id="${d.id}" data-rid="${r.id}">${esc(r.prenom)} ${esc(r.nom)}</button></td>
      <td>${esc(d.ref)}</td><td>${esc(String(years))} ans</td><td>${esc(metal)}</td>
      <td>${esc(r.nationalite || "—")}</td>
    </tr>`);
  }));
  return ipPaper("Récipiendaires", rows.length
    ? `<div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Personne</th><th>Dossier</th><th>Ancienneté</th><th>Médaille proposée</th><th>Nationalité</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>`
    : cfEmpty("Aucun récipiendaire visible.", "users"), "INSTRUCTION");
}

function ipCompleteness() {
  const rows = cfS().dossiers.filter((d) => ["SOUMIS", "APPROUVE", "EN_ETUDE"].includes(d.status)).map((d) => {
    const miss = (d.pieces || []).length ? "" : "Liste des pièces incomplète";
    const open = (d.complements || []).filter((c) => c.status === "ouvert").length;
    return `<tr><td>${esc(d.ref)}</td><td>${esc(ipApplicantName(d.applicantId))}</td><td>${(d.pieces || []).length} pièce(s)</td><td>${open ? open + " complément(s) ouvert(s)" : (miss || "Complet en l’état")}</td>
      <td>${cfBtn("Ouvrir", "open-dossier", `data-id="${d.id}"`, "cf-tiny")}</td></tr>`;
  }).join("");
  return ipPaper("Contrôle de complétude", `<div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Dossier</th><th>Demandeur</th><th>Pièces</th><th>État</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`, "PIÈCES DU DOSSIER");
}

function ipWaitingPieces() {
  const items = [];
  cfS().dossiers.forEach((d) => (d.complements || []).filter((c) => c.status === "ouvert").forEach((c) => {
    items.push(`<article class="portal-activity-row"><span><strong>${esc(d.ref)}</strong><small>${esc(c.objet)} · ${esc(c.date)}</small></span>${cfBtn("Dossier", "open-dossier", `data-id="${d.id}"`, "cf-tiny")}</article>`);
  }));
  return ipPaper("En attente de pièces", items.join("") || cfEmpty("Aucun complément ouvert.", "checkCircle"), "COMPLÉMENTS");
}

function ipJustificatifs() {
  const rows = cfS().dossiers.filter((d) => ["EN_ETUDE", "APPROUVE", "ORDRE_EMIS"].includes(d.status)).map((d) => {
    const docs = cfS().documents.filter((x) => x.dossierId === d.id);
    return `<tr><td>${esc(d.ref)}</td><td>${(d.pieces || []).join(", ") || "—"}</td><td>${docs.length} document(s)</td>
      <td>${cfBtn("Contrôler", "open-dossier", `data-id="${d.id}"`, "cf-tiny")}</td></tr>`;
  }).join("");
  return ipPaper("Justificatifs à vérifier", `<div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Dossier</th><th>Pièces déclarées</th><th>Documents</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    ${portalExplain ? portalExplain("Pièces attendues, pièces reçues, pièces encore à vérifier — sans valider la médaille.") : ""}`, "CONTRÔLE");
}

function ipControlesRecip() {
  return ipRecipientsPage().replace("Récipiendaires", "Contrôles par récipiendaire");
}

function ipAnomalies() {
  const rows = [];
  cfS().dossiers.forEach((d) => (d.anomalies || []).forEach((a) => {
    rows.push(`<tr><td>${esc(d.ref)}</td><td>${esc(a.date)}</td><td>${esc(a.by || "—")}</td><td>${esc(a.texte || a.motif || "")}</td></tr>`);
  }));
  const form = `<div class="portal-profile-grid">
      <label><span>Dossier</span><select data-cf-field="flagDossier">${cfS().dossiers.map((d) => `<option value="${d.id}">${esc(d.ref)}</option>`).join("")}</select></label>
      <label class="sm-span-2"><span>Observation</span><textarea data-cf-field="flagTexte" rows="3" placeholder="Anomalie constatée, sans décision."></textarea></label>
    </div>
    ${cfBtn("Enregistrer le signalement", "flag-anomaly", "", "cf-accent")}`;
  return ipPaper("Anomalies signalées", (rows.length ? `<div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Dossier</th><th>Date</th><th>Auteur</th><th>Observation</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>` : cfEmpty("Aucun signalement.", "checkCircle")) + form, "SANS DÉCISION MÉTIER");
}

function ipVerifyHistory() {
  const rows = cfS().journal.filter((j) => /quittance|retrait|anomal|contrôl|verif/i.test(j.action + " " + (j.details || "")));
  return ipPaper("Historique des vérifications", rows.length
    ? `<div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Date</th><th>Acteur</th><th>Action</th><th>Détails</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(r.date)}</td><td>${esc(r.actor)}</td><td>${esc(r.action)}</td><td>${esc(r.details || "")}</td></tr>`).join("")}</tbody></table></div>`
    : cfEmpty("Aucune vérification enregistrée.", "clock"), "JOURNAL FILTRÉ");
}

function ipPaymentsFollow() {
  const rows = cfS().dossiers.filter((d) => d.order).map((d) => {
    const paid = d.quittance && d.quittance.conforme;
    return `<tr><td>${esc(d.ref)}</td><td>${esc(d.order.ref)}</td><td>${esc(cfMoney(d.order.amount))}</td>
      <td>${paid ? "Payé — quittance conforme" : d.quittance ? "Quittance à vérifier" : "Reste à payer"}</td></tr>`;
  }).join("");
  return ipPaper("Suivi des paiements", `${portalExplain ? portalExplain("L’ordre émis et le paiement (quittance) sont deux informations distinctes.") : ""}
    <div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Dossier</th><th>Ordre</th><th>Montant de l’ordre</th><th>Paiement</th></tr></thead><tbody>${rows}</tbody></table></div>`, "ORDRE ≠ PAIEMENT");
}

function ipArchives() {
  const rows = cfS().dossiers.filter((d) => ["CLOTURE", "REJETE"].includes(d.status));
  return ipPaper("Archives", rows.length
    ? `<div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Dossier</th><th>Statut</th><th>Demandeur</th><th>Dépôt</th></tr></thead><tbody>${rows.map((d) => `<tr><td>${esc(d.ref)}</td><td>${cfBadge(d.status)}</td><td>${esc(ipApplicantName(d.applicantId))}</td><td>${esc(d.submitted)}</td></tr>`).join("")}</tbody></table></div>`
    : cfEmpty("Aucune archive.", "folder"), "DOSSIERS CLOTURÉS");
}

function ipReady() {
  const rows = cfS().dossiers.filter((d) => d.status === "EN_ETUDE" && (d.recipients || []).every((r) => (r.medals || []).every((m) => m.status !== "EN_ATTENTE")));
  return ipPaper("Prêts pour décision", rows.map((d) => `<article class="cf-row" data-cf-action="select" data-id="${d.id}" data-action="ws-page" data-page="notify"><strong>${esc(d.ref)}</strong>${cfBadge(d.status)}</article>`).join("") || cfEmpty("Aucun dossier prêt.", "checkCircle"), "INSTRUCTION ACHEVÉE");
}

function ipLocalisation() {
  const rows = cfS().dossiers.map((d) => `<tr><td>${esc(d.ref)}</td><td>${esc(d.location || "—")}</td><td>${cfBadge(d.status)}</td></tr>`).join("");
  return ipPaper("Localisation physique", `${portalExplain ? portalExplain("Cette information est strictement interne. Elle n’apparaît jamais dans l’espace demandeur ou personne.") : ""}
    <div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Dossier</th><th>Emplacement</th><th>Statut</th></tr></thead><tbody>${rows}</tbody></table></div>`, "SECRÉTARIAT");
}

function ipDiplomas() {
  const n = cfS().dossiers.reduce((acc, d) => acc + (d.recipients || []).filter((r) => (r.medals || []).some((m) => m.status === "VALIDE")).length, 0);
  return `<div class="portal-stats">${ipStat("Diplômes à prévoir", n, "Récipiendaires validés", "stock", "fileText")}</div>
    ${portalExplain ? portalExplain("Les diplômes restent au Ministère jusqu’à la cérémonie. Cette vue est indicative.") : ""}`;
}

function ipRegStats() {
  const s = cfS();
  return `<div class="portal-stats">
      ${ipStat("Or", s.stock.Or, "Disponible", "stock", "medal")}
      ${ipStat("Argent", s.stock.Argent, "Disponible", "stock", "medal")}
      ${ipStat("Bronze", s.stock.Bronze, "Disponible", "stock", "medal")}
      ${ipStat("Mouvements", s.movements.length, "Historique", "movements", "refresh")}
    </div>`;
}

function ipAlerts() {
  const chain = cfS().stats && cfS().stats.chainOk;
  return ipPaper("État de la plateforme", `<ul class="portal-detail-list">
      <li>${icon("info", "size-4")}<span>Enregistrements locaux de la plateforme</span></li>
      <li>${icon(chain ? "checkCircle" : "alert", "size-4")}<span>Chaîne de signature : ${chain ? "vérifiée" : "à contrôler"}</span></li>
    </ul>
    ${cfBtn("Réinitialiser les données", "confirm-on", `data-next="reset" data-id="demo" data-summary="Les données locales de cet espace seront rétablies."`, "cf-accent")}
    ${portalExplain ? portalExplain("La réinitialisation est une opération technique. Elle ne constitue pas une décision métier.") : ""}`, "ADMINISTRATION");
}

function ipInternalAccounts() {
  const rows = cfS().users.filter((u) => INTERNAL_ROLES && INTERNAL_ROLES.includes(u.role));
  return ipPaper("Comptes internes", `<div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Identifiant</th><th>Nom</th><th>Rôle</th><th>Actif</th><th></th></tr></thead><tbody>
    ${rows.map((u) => `<tr><td>${esc(u.email)}</td><td>${esc(u.prenom)} ${esc(u.nom)}</td><td>${esc(u.role)}</td><td>${u.actif ? "Oui" : "Non"}</td>
      <td>${cfBtn(u.actif ? "Désactiver" : "Activer", "confirm-on", `data-next="toggle-user" data-id="${u.id}" data-summary="${u.actif ? "Désactiver" : "Activer"} le compte ${u.email}."`, "cf-tiny")}</td></tr>`).join("")}
  </tbody></table></div>
  ${portalExplain ? portalExplain("Activation technique d’un compte. Cela ne confère pas les pouvoirs d’un autre rôle.") : ""}`, "ADMINISTRATION");
}

function ipRecoursHisto(role) {
  const level = cfLevelOf(role);
  const rows = [];
  cfS().dossiers.forEach((d) => (d.recours || []).filter((r) => r.autorite === level && r.status !== "EN_ATTENTE").forEach((r) => {
    rows.push(`<tr><td>${esc(d.ref)}</td><td>${esc(r.date)}</td><td>${esc(r.status)}</td><td>${esc(r.motif || "")}</td></tr>`);
  }));
  return ipPaper("Historique des recours", rows.length
    ? `<div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Dossier</th><th>Date</th><th>Décision</th><th>Motif</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>`
    : cfEmpty("Aucun recours traité à ce niveau.", "scale"), "VOTRE NIVEAU");
}

function ipContent(role, page) {
  if (role === "admin" && (page === "dossiers" || page === "instruction" || page === "orders" || page === "remises" || page === "enterprises" || page === "applicants")) {
    return ipDenied("L’administrateur n’a pas de file métier. Utilisez les comptes, cachets et journaux.");
  }
  if (page === "localisation") {
    if (typeof cfIsSec === "function" && cfIsSec(role)) return ipLocalisation();
    return ipDenied("L’emplacement du dossier papier est réservé aux secrétariats.");
  }
  if (typeof goPage === "function") {
    const html = goPage(role, page);
    if (html != null) return html;
  }
  return null;
}

function ipTabs(role, page) {
  if (typeof goHydrate === "function") goHydrate(role);
  const G = goRef();
  const secs = (G && typeof G.navSections === "function") ? G.navSections() : [];
  const currentView = (typeof goViewFor === "function" && goViewFor(role, page)) || page;
  const unread = typeof cfUnread === "function" ? cfUnread() : 0;
  const pathOf = (pg) => (typeof workspacePath === "function" ? "#" + workspacePath(role, pg) : "#/app/" + role + "/" + pg);
  return secs.map((sec) => {
    const pages = (sec.pages || []).map((p) => ({ page: viewToPage(p.view, role), view: p.view, label: p.label }));
    if (!pages.length) return "";
    const active = pages.some((p) => p.view === currentView || p.page === page);
    const open = cfState.menu === sec.key;
    const cnt = sec.count ? `<span class="nav-count ${unread ? "" : "is-zero"}">${unread || 0}</span>` : "";
    const menu = pages.length > 1
      ? `<button class="nav-caret" type="button" data-cf-action="menu" data-menu="${sec.key}" aria-expanded="${open}" aria-haspopup="true" aria-label="Autres accès : ${esc(sec.label)}">${goIco("chevron-down")}</button>
          ${open ? `<div class="dd-menu" id="nav-${sec.key}">${pages.map((p) => `<button class="menu-item" type="button" data-action="ws-page" data-page="${p.page}">${goIco(p.view === "nouveau" ? "plus" : sec.icon)}${esc(p.label)}</button>`).join("")}</div>` : ""}`
      : "";
    return `<li class="nav-item${active ? " is-current" : ""}">
      <a class="nav-link" href="${pathOf(pages[0].page)}" data-action="ws-page" data-page="${pages[0].page}" ${active ? 'aria-current="page"' : ""}>${goIco(sec.icon)}${esc(sec.label)}${cnt}</a>${menu}
    </li>`;
  }).join("");
}

function ipHead(role, page) {
  const u = typeof cfUser === "function" ? cfUser() : null;
  const conf = (typeof ROLE_CONFIGS !== "undefined" && ROLE_CONFIGS[role]) || { shortLabel: role };
  const name = u ? u.prenom + " " + u.nom : conf.shortLabel;
  const initials = esc((name || "?").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase());
  const unread = typeof cfUnread === "function" ? cfUnread() : 0;
  const overview = typeof workspacePath === "function" ? "#" + workspacePath(role, "overview") : "#/app/" + role + "/overview";
  return `<header class="site-header sticky" id="site-header">
    <div class="container hdr-top">
      <button class="icon-btn nav-toggle" type="button" data-cf-action="mobile" aria-label="Ouvrir le menu de navigation" aria-expanded="${!!cfState.mobile}">${goIco("menu")}</button>
      <a class="brand" href="${overview}" data-action="ws-page" data-page="overview" aria-label="MEDITRA, accueil de l’espace">
        ${typeof meditraBrand === "function" ? meditraBrand({ size: 36, sub: "République Gabonaise" }) : `<span class="md-brand-name">MEDITRA</span>`}
      </a>
      <button class="search-trigger" type="button" data-cf-action="search" aria-label="Rechercher (raccourci Ctrl+K)">
        ${goIco("search")}<span>Rechercher un dossier, un courrier…</span><kbd>Ctrl+K</kbd>
      </button>
      <div class="hdr-actions">
        <div class="dd">
          <button class="icon-btn" type="button" data-cf-action="notices" aria-expanded="${!!cfState.notices}" aria-label="Notifications">
            ${goIco("bell")}${unread ? `<span class="count">${unread > 9 ? "9+" : unread}</span>` : ""}
          </button>
          ${cfState.notices && typeof cfNoticesPop === "function" ? cfNoticesPop(role) : ""}
        </div>
        <div class="dd">
          <button class="account-btn" type="button" data-cf-action="account" aria-expanded="${!!cfState.account}">
            <span class="avatar">${initials}</span>
            <span class="account-meta"><strong>${esc(name)}</strong><span>${esc(conf.shortLabel)}</span></span>
            ${goIco("chevron-down")}
          </button>
          ${cfState.account && typeof cfAccountMenu === "function" ? cfAccountMenu(role) : ""}
        </div>
      </div>
    </div>
    <nav class="main-nav" aria-label="Navigation principale">
      <div class="container"><ul id="nav-list">${ipTabs(role, page)}</ul></div>
    </nav>
    ${cfState.search && typeof cfSearchPalette === "function" ? cfSearchPalette() : ""}
    ${cfState.mobile ? `<div class="mobile-nav" id="mobile-nav"><div class="mobile-nav-list">${((typeof ipNav === "function" && ipNav(role)) || []).map((it) => (it.children || [{ page: it.page, label: it.label }]).map((c) => `<button type="button" data-action="ws-page" data-page="${c.page}">${esc(c.label)}</button>`).join("")).join("")}<button type="button" data-action="nav" data-path="/">Accueil public</button></div></div>` : ""}
  </header>`;
}

function ipHero(role, page, opts) {
  return "";
}

function ipShell(role, page, body, opts) {
  const view = (typeof goViewFor === "function" && goViewFor(role, page)) || "";
  const confirm = cfState.confirm
    ? `<div class="cf-confirm-bar" role="status">
        <span>${typeof icon === "function" ? icon("info", "size-4") : goIco("info")}<strong>Confirmation requise</strong> ${esc(cfState.confirm.summary || "cette action")}</span>
        <span class="cf-confirm-actions">${cfBtn("Annuler", "confirm-off", "", "cf-btn-ghost")}${cfBtn("Confirmer", "confirm-on", `data-next="${esc(cfState.confirm.action || "")}" data-id="${esc(cfState.confirm.id || "")}" data-summary="${esc(cfState.confirm.summary || "")}"`, "cf-accent")}</span>
      </div>`
    : "";
  return `<div class="go-workspace" data-ws-content data-cf-role="${role}" data-cf-page="${page}">
    <div class="progress-rail" aria-hidden="true"><i class="progress-fill"></i></div>
    ${ipHead(role, page)}
    ${confirm}
    <main id="view" class="container go-host" tabindex="-1" data-go-view="${esc(view)}" data-go-page="${esc(page)}">${body || ""}</main>
    <footer class="container site-footer">
      <span class="footer-mark"><span class="flag-dots" aria-hidden="true"><i></i><i></i><i></i></span> MEDITRA</span>
      <span>République Gabonaise — Médaille et Distinctions du Travail</span>
    </footer>
    ${cfState.panel && typeof cfPanel === "function" ? cfPanel() : ""}
    ${cfState.viewer && typeof cfViewer === "function" ? cfViewer() : ""}
    <div id="cf-toast">${typeof cfToastHtml === "function" ? cfToastHtml() : ""}</div>
    <button type="button" data-action="home-top" data-back-to-top id="to-top" class="to-top home-back-top" aria-label="Revenir en haut" aria-hidden="true" tabindex="-1">${goIco("arrow-up")}</button>
  </div>`;
}
