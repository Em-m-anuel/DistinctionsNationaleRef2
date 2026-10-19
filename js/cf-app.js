/* ==================================================================
   js/cf-app.js
   Coquille et écrans du cahier fonctionnel. Pas de fenêtre modale
   classique : panneaux, confirmations en place, pages de revue.
================================================================== */

const cfState = {
  menu: null, search: false, searchQ: "", assistant: false, assistantQ: "", assistantLog: [],
  notices: false, account: false, more: false, mobile: false, spaceRole: "",
  panel: null, viewer: null, revue: null, confirm: null, toast: "", toastKind: "info", toastUndo: false, toastSeq: 0,
  selected: null, tab: "resume", query: "", filter: "", sort: "new", page: 1,
  wizard: { step: 1, destination: "dr", nRec: 1, nOr: 0, nArgent: 0, nBronze: 0, letter: "", dts: "", pieces: [], recipients: [], dirty: false },
  form: {}, draft: {}, revueData: null, signStep: 1, signCode: "",
  calOffset: 0, splitIndex: 0,
};

function cfGo(role, page, extra) {
  if (extra && extra.id) cfState.selected = extra.id;
  if (extra && extra.tab) cfState.tab = extra.tab;
  cfState.menu = null; cfState.notices = false; cfState.account = false; cfState.search = false; cfState.more = false; cfState.mobile = false;
  const canonical = typeof siteCanonicalPage === "function" ? siteCanonicalPage(role, page) : page;
  if (!canonical) {
    // Page absente de la famille : on ne renvoie pas l'utilisateur vers un
    // écran sans rapport. Si un dossier est référencé, il est ouvert ici.
    if (extra && extra.ref && typeof goOpenRef === "function") {
      try { goOpenRef("dossiers", extra.ref); } catch (error) { /* tiroir indisponible */ }
    }
    cfPaint();
    return;
  }
  const target = canonical;
  const path = workspacePath(role, target);
  const ref = extra && extra.ref ? "?ref=" + encodeURIComponent(extra.ref) : "";
  if (typeof currentPath === "function" && currentPath() === path) {
    // Déjà sur la page : la référence ouvre directement le dossier.
    if (extra && extra.ref && typeof goOpenRef === "function") {
      try { goOpenRef("dossiers", extra.ref); } catch (error) { /* tiroir indisponible */ }
    }
    cfPaint(); return;
  }
  navigateTo(path + ref);
}
function cfPaint() {
  // Site multipage : seuls le contenu et les panneaux sont repeints ;
  // la page (URL, en-tête, navigation) ne change pas.
  if (typeof siteRepaintWorkspace === "function") { siteRepaintWorkspace(); return; }
  const ws = typeof parseWorkspacePath === "function" ? parseWorkspacePath(typeof currentPath === "function" ? currentPath() : "") : null;
  if (!ws) return;
  const root = document.getElementById("app");
  if (root) { root.innerHTML = (typeof skipLink === "function" ? skipLink() : "") + cfRender(ws.role, ws.page); }
  if (typeof goInstallHosts === "function") goInstallHosts();
  if (typeof goMountLive === "function") goMountLive(ws.role, ws.page);
}
function cfToast(msg, kind, undo) {
  cfState.toast = msg; cfState.toastKind = kind || "info"; cfState.toastUndo = !!undo;
  const seq = ++cfState.toastSeq;
  const el = document.getElementById("cf-toast");
  if (el) el.innerHTML = cfToastHtml();
  if (typeof window !== "undefined" && window.setTimeout) {
    window.setTimeout(() => { if (cfState.toastSeq === seq) { cfState.toast = ""; cfState.toastUndo = false; const n = document.getElementById("cf-toast"); if (n) n.innerHTML = ""; } }, 8000);
  }
}
function cfToastHtml() {
  if (!cfState.toast) return "";
  return `<div class="cf-toast cf-toast-${cfState.toastKind}" role="${cfState.toastKind === "error" ? "alert" : "status"}">${icon(cfState.toastKind === "error" ? "alert" : "checkCircle", "size-4")}<span>${esc(cfState.toast)}</span>${cfState.toastUndo ? `<button type="button" data-cf-action="undo" class="cf-btn cf-tiny">Annuler</button>` : ""}<button type="button" data-cf-action="toast-off" class="cf-icon-btn" aria-label="Fermer">${icon("x", "size-4")}</button></div>`;
}
function cfShowMoney(role) {
  const r = role || cfRole();
  return r === "demandeur" || r === "regisseur" || cfIsService(r);
}

function cfCircuitHtml(d) {
  if (!d) return "";
  const idx = CF_FRISE.indexOf(d.status === "REJETE" ? "SOUMIS" : d.status);
  const steps = [
    { l: "Dépôt", i: 0 },
    { l: "Autorité", i: 0 },
    { l: "Service", i: 2 },
    { l: "Paiement", i: 5 },
    { l: "Cérémonie", i: 7 },
  ];
  return `<ol class="cf-circuit" aria-label="Circuit du dossier">${steps.map((s, n) => {
    const done = idx > s.i || (n === 0 && idx >= 0);
    const now = (n === 1 && (d.status === "SOUMIS" || d.status === "REJETE")) || (n !== 1 && idx === s.i);
    return `<li class="${done && !now ? "is-done" : now ? "is-now" : ""}"><span>${esc(s.l)}</span></li>`;
  }).join("")}</ol>`;
}
function cfDossierIdentite(d) {
  const app = cfApplicant(d.applicantId) || {};
  return `<dl class="cf-facts cf-facts-rich">
    <div><dt>Demandeur</dt><dd>${esc(app.nom || "—")}</dd></div>
    <div><dt>Sigle</dt><dd>${esc(app.sigle || "—")}</dd></div>
    <div><dt>Campagne</dt><dd>${esc(d.campaign || "—")}</dd></div>
    <div><dt>Dépôt</dt><dd>${esc(d.submitted || "—")}${d.horsDelai ? " · hors délai" : ""}</dd></div>
    <div><dt>Destinataire</dt><dd>${esc(CF_LEVEL_LABEL[d.destination] || "—")}</dd></div>
    <div><dt>Référence</dt><dd>${esc(d.ref || d.id)}</dd></div>
  </dl>`;
}
function cfDocsList(d) {
  const docs = cfS().documents.filter((x) => x.dossierId === d.id);
  const names = (d.pieces || []).concat(docs.map((x) => x.name));
  const uniq = names.filter((n, i) => names.indexOf(n) === i);
  if (!uniq.length) return `<p class="cf-muted">Aucune pièce versée.</p>`;
  return `<ul class="cf-docs">${uniq.map((n) => {
    const doc = docs.find((x) => x.name === n) || {};
    return `<li>${icon("document", "size-4")}<span>${esc(n)}</span>${cfBtn("Ouvrir", "view-doc", `data-id="${doc.id || ""}" data-name="${esc(n)}"`, "cf-tiny")}</li>`;
  }).join("")}</ul>`;
}
function cfVisaSlot() {
  return `<div class="cf-visa-slot">
    <p class="cf-visa-kicker">Visa et cachet</p>
    <div class="cf-visa-frame" aria-hidden="true"><span>Emplacement réservé</span></div>
    <p class="cf-muted">Les modèles officiels de visa et de cachet n’ont pas encore été fournis. Cette zone prépare l’accueil du document ; elle n’appose pas un cachet réel.</p>
  </div>`;
}
function cfPlacePicker() {
  const places = typeof DEMO_PLACES !== "undefined" ? DEMO_PLACES : [];
  const selected = cfState.form.placeId;
  const sel = places.find((p) => p.id === selected);
  if (!places.length) {
    return `<p class="cf-muted">Aucun lieu de référence n’est chargé. Voir INTEGRATIONS_TO_COMPLETE.md.</p>`;
  }
  return `<div class="map-picker" data-map-picker>
    <p class="map-picker-banner">${icon("info", "size-4")} <strong>Lieux connus.</strong> Schéma interne — aucun service de géocodage n’est branché.</p>
    <div class="map-picker-layout">
      <div class="map-picker-list" role="listbox" aria-label="Lieux connus">${places.map((p) => `<button type="button" role="option" aria-selected="${selected === p.id}" class="map-place ${selected === p.id ? "is-selected" : ""}" data-cf-action="map-pick" data-place="${p.id}"><strong>${esc(p.name)}</strong><small>${esc(p.address)}</small></button>`).join("")}</div>
      <div class="map-picker-map">
        <svg viewBox="0 0 100 80" class="map-svg" role="img" aria-label="Carte schématique du Gabon">
          <title>Carte schématique du Gabon</title>
          <rect width="100" height="80" fill="#e8efe8"/>
          <path d="M18 22 C28 10, 52 8, 70 16 C86 24, 90 40, 82 54 C70 70, 48 74, 30 68 C14 60, 10 38, 18 22 Z" fill="#d5e4d8" stroke="#5b7791" stroke-width="1.2"/>
          ${places.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="${selected === p.id ? 2.8 : 1.6}" fill="${selected === p.id ? "#009b62" : "#315c91"}"/>`).join("")}
        </svg>
        ${sel ? `<dl class="map-picker-meta"><div><dt>Lieu</dt><dd>${esc(sel.name)}</dd></div><div><dt>Ville</dt><dd>${esc(sel.city)}</dd></div></dl>` : `<p class="cf-muted">Choisissez un lieu dans la liste. Le schéma n’est pas une photographie ni une carte satellite.</p>`}
      </div>
    </div>
  </div>`;
}
function cfPlaceView(label) {
  const places = typeof DEMO_PLACES !== "undefined" ? DEMO_PLACES : [];
  const q = String(label || "").toLowerCase();
  const sel = places.find((p) => q.indexOf(String(p.city).toLowerCase()) !== -1 || q.indexOf(String(p.name).toLowerCase()) !== -1) || null;
  if (!places.length) {
    return `<p class="cf-muted">Aucun lieu de référence. Voir INTEGRATIONS_TO_COMPLETE.md.</p>`;
  }
  return `<div class="map-picker-map">
    <svg viewBox="0 0 100 80" class="map-svg" role="img" aria-label="Carte schématique du Gabon">
      <title>Carte schématique du Gabon</title>
      <rect width="100" height="80" fill="#e8efe8"/>
      <path d="M18 22 C28 10, 52 8, 70 16 C86 24, 90 40, 82 54 C70 70, 48 74, 30 68 C14 60, 10 38, 18 22 Z" fill="#d5e4d8" stroke="#5b7791" stroke-width="1.2"/>
      ${places.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="${sel && sel.id === p.id ? 2.8 : 1.6}" fill="${sel && sel.id === p.id ? "#009b62" : "#315c91"}"/>`).join("")}
    </svg>
    <p class="map-picker-caption">Schéma des villes de référence. Ce n’est ni une photographie du lieu, ni une carte satellite.</p>
    ${sel ? `<dl class="map-picker-meta"><div><dt>Correspondance</dt><dd>${esc(sel.name)}</dd></div><div><dt>Ville</dt><dd>${esc(sel.city)}</dd></div></dl>` : `<p class="cf-muted">${esc(label || "Lieu non rattaché à un point connu.")}</p>`}
  </div>`;
}
function cfCeremonyPlaceForm(id) {
  const date = cfState.form.cerDate || "20/11/2026";
  return `<label>Date proposée<input data-cf-field="cerDate" value="${esc(date)}" placeholder="jj/mm/aaaa" /></label>
    ${cfPlacePicker()}
    ${cfBtn("Envoyer la proposition", "nego-submit", `data-id="${id}"`, "cf-accent")}
    <p class="cf-muted">La proposition n’est pas un acte officiel tant que la date n’est pas validée par le Chef de service.</p>`;
}
function cfAgentFollow(kind) {
  const isRel = kind === "relances";
  const rows = cfS().dossiers.filter((d) => isRel ? (d.relances || []).length : (d.recours || []).length);
  const d = cfFindDossier(cfState.selected) || rows[0];
  const items = isRel ? ((d && d.relances) || []) : ((d && d.recours) || []);
  return `<div class="cf-split">
    <div class="cf-split-list">${rows.map((x) => `<button type="button" class="${d && d.id === x.id ? "is-on" : ""}" data-cf-action="select" data-id="${x.id}"><strong>${esc(x.ref)}</strong><small>${esc(CF_STATUS_LABEL[x.status] || x.status)}</small></button>`).join("") || (typeof cfEmpty === "function" ? cfEmpty(isRel ? "Aucune relance enregistrée." : "Aucun recours enregistré.", "folder") : "")}</div>
    <div class="cf-split-detail">${d ? `<article class="cf-consult">
      <header class="cf-consult-head"><p class="cf-eyebrow">${esc(d.ref)}</p><h2>${esc((cfApplicant(d.applicantId) || {}).nom || "")}</h2>${cfBadge(d.status)}</header>
      ${cfDossierIdentite(d)}
      <h3>${isRel ? "Relances" : "Recours"}</h3>
      ${items.length ? items.map((it) => `<article class="cf-exch"><strong>${esc(it.motif || it.objet || "Sans objet")}</strong><small>${esc(it.date || "")} · ${esc(it.status || "")}${it.autorite ? " · " + esc(CF_LEVEL_LABEL[it.autorite] || it.autorite) : ""}</small></article>`).join("") : "<p class='cf-muted'>Aucun élément.</p>"}
      <p class="cf-muted">L’agent enregistre et suit. Il ne statue pas à la place de l’autorité.</p>
    </article>` : (typeof cfEmpty === "function" ? cfEmpty("Sélectionnez un dossier.", "folder") : "")}</div>
  </div>`;
}
function cfDelegationsDraft() {
  const rows = cfS().dossiers.filter((d) => d.ceremony || d.status === "CEREMONIE_PLANIFIEE" || d.status === "CLOTURE" || d.status === "MEDAILLES_REMISES");
  const d = cfFindDossier(cfState.selected) || rows[0];
  const draft = (d && d.delegationDraft) || {};
  const f = {
    nom: cfState.form.delNom != null ? cfState.form.delNom : (draft.nom || ""),
    fonction: cfState.form.delFonction != null ? cfState.form.delFonction : (draft.fonction || ""),
    organisme: cfState.form.delOrganisme != null ? cfState.form.delOrganisme : (draft.organisme || ""),
  };
  return `<div class="cf-split">
    <div class="cf-split-list">${rows.map((x) => `<button type="button" class="${d && d.id === x.id ? "is-on" : ""}" data-cf-action="select" data-id="${x.id}"><strong>${esc(x.ref)}</strong><small>${esc((x.ceremony && x.ceremony.date) || "sans date")}</small></button>`).join("") || (typeof cfEmpty === "function" ? cfEmpty("Aucun dossier en phase de cérémonie.", "calendar") : "")}</div>
    <div class="cf-split-detail">${d ? `<article class="cf-consult">
      <header class="cf-consult-head"><p class="cf-eyebrow">${esc(d.ref)}</p><h2>Délégation en préparation</h2></header>
      <p class="cf-muted">Saisie structurée interne. Le modèle officiel de délégation n’est pas figé ici.</p>
      <div class="cf-form">
        <label>Nom du délégué<input data-cf-field="delNom" value="${esc(f.nom)}" /></label>
        <label>Fonction<input data-cf-field="delFonction" value="${esc(f.fonction)}" /></label>
        <label>Organisme<input data-cf-field="delOrganisme" value="${esc(f.organisme)}" /></label>
        ${cfBtn("Enregistrer le brouillon", "save-del-draft", `data-id="${d.id}"`, "cf-accent")}
      </div>
      ${draft.saved ? `<p class="cf-muted">Dernier enregistrement : ${esc(draft.saved)}.</p>` : ""}
    </article>` : (typeof cfEmpty === "function" ? cfEmpty("Sélectionnez un dossier.", "folder") : "")}</div>
  </div>`;
}
function cfDelegationsChef() {
  const rows = cfS().dossiers.filter((d) => d.ceremony || d.ceremonyRequest || d.status === "CEREMONIE_PLANIFIEE");
  return rows.map((d) => `<article class="cf-paper"><h2>${esc(d.ref)}</h2>
    <p>${esc((cfApplicant(d.applicantId) || {}).nom || "")} · ${esc((d.ceremony && d.ceremony.date) || (d.ceremonyRequest && d.ceremonyRequest.date) || "date à confirmer")}</p>
    ${d.delegationDraft ? `<p>Brouillon agent : ${esc(d.delegationDraft.nom || "—")} — ${esc(d.delegationDraft.fonction || "")}</p>` : "<p class='cf-muted'>Pas de brouillon agent.</p>"}
    ${cfBtn("Générer la délégation", "gen-del", `data-id="${d.id}"`, "cf-accent")}
    ${cfBtn("Générer les diplômes", "gen-dip", `data-id="${d.id}"`, "cf-btn-ghost")}
    <p class="cf-muted">La génération produit un document interne. Elle ne remplace pas un imprimé officiel signé.</p>
  </article>`).join("") || cfEmpty("Aucune cérémonie à documenter.", "calendar");
}

function cfNav(role) {
  if (typeof ipNav === "function") {
    const custom = ipNav(role);
    if (custom) return custom;
  }
  if (role === "demandeur") return [
    { page: "overview", label: "Accueil" },
    { page: "dossiers", label: "Mes dossiers" },
    { page: "calendar", label: "Calendrier" },
  ];
  if (cfIsSec(role)) return [
    { page: "courrier", label: "Courrier", children: [
      { page: "inbox", label: "Boîte de réception", help: "Courriers arrivés à ce secrétariat." },
      { page: "mail-register", label: "Courriers à enregistrer", help: "Attribuer une référence interne." },
      { page: "mail-transmit", label: "Courriers à transmettre", help: "Faire passer à l’autorité, sans décider." },
    ] },
    { page: "history", label: "Historique" },
  ];
  if (cfIsAuth(role)) {
    const items = [
      { page: "overview", label: "Accueil" },
      { page: "dossiers", label: "Dossiers" },
      { page: "recours", label: "Recours" },
      { page: "relances", label: "Relances" },
      { page: "ceremonies", label: "Cérémonies" },
    ];
    const toSign = cfS().documents.filter((d) => d.signStatus !== "SIGNE_SCELLE" && !d.sealed);
    if (toSign.length) items.push({ page: "a-signer", label: "À signer", count: toSign.length });
    return items;
  }
  if (cfIsService(role)) return [
    { page: "overview", label: "Accueil" },
    { page: "dossiers", label: "Dossiers", children: [
      { page: "instruction", label: "Instruction", help: "Étudier chaque récipiendaire." },
      { page: "notify", label: "À notifier", help: "Envoyer la liste des validés." },
      { page: "orders", label: "Ordres de recette", help: "Calculer et émettre l’ordre." },
    ] },
    { page: "ceremonies", label: "Cérémonies", children: [
      { page: "calendar", label: "Calendrier", help: "Toutes les cérémonies." },
      { page: "cer-demandes", label: "Demandes", help: "Hors délai et rattrapage." },
      { page: "relances", label: "Relances", help: "Relances acceptées." },
    ] },
    { page: "gestion", label: "Gestion", children: [
      { page: "campaigns", label: "Campagnes", help: "Dates de dépôt et cérémonie officielle." },
      { page: "applicants", label: "Demandeurs reconnus", help: "Structures autorisées à déposer." },
    ] },
    { page: "stats", label: "Statistiques" },
  ];
  if (role === "regisseur") return [
    { page: "overview", label: "Accueil" },
    { page: "remises", label: "Remises" },
    { page: "retraits", label: "Retraits" },
    { page: "stock", label: "Stock" },
    { page: "supply", label: "Approvisionnement", children: [
      { page: "budget", label: "Budget", help: "Montant alloué et engagé." },
      { page: "suppliers", label: "Fournisseurs", help: "Liste et contacts." },
      { page: "orders", label: "Commandes", help: "Bons de commande." },
      { page: "deliveries", label: "Livraisons", help: "Bons de livraison." },
    ] },
    { page: "tarifs", label: "Tarifs" },
  ];
  if (role === "admin") return [
    { page: "users", label: "Comptes" },
    { page: "stamps", label: "Cachets" },
    { page: "signatures", label: "Signatures" },
    { page: "journals", label: "Journaux", children: [
      { page: "journal-sig", label: "Signature", help: "Chaîne des événements de signature." },
      { page: "journal", label: "Activité", help: "Journal général." },
    ] },
  ];
  if (role === "recipient") return [];
  return [{ page: "overview", label: "Accueil" }];
}
function cfNavParent(role, page) {
  for (const it of cfNav(role)) {
    if (it.page === page) return it.page;
    if ((it.children || []).some((c) => c.page === page)) return it.page;
  }
  return page;
}
function cfPageTitle(role, page) {
  const map = {
    overview: "Accueil", dossiers: role === "demandeur" ? "Mes dossiers" : "Dossiers", decisions: "Décisions initiales",
    calendar: "Calendrier des cérémonies", profile: "Profil et paramètres",
    "new-dossier": "Nouveau dossier", inbox: "Boîte de réception", "mail-register": "Courriers à enregistrer", "mail-transmit": "Courriers à transmettre", history: "Historique",
    recours: "Recours", relances: "Relances", ceremonies: "Cérémonies", "a-signer": "À signer",
    instruction: "Instruction", notify: "À notifier", orders: "Ordres de recette",
    "cer-demandes": "Demandes de cérémonie", campaigns: "Campagnes", applicants: "Demandeurs reconnus",
    stats: "Statistiques", remises: "Remises", retraits: "Retraits sans cérémonie", stock: "Stock",
    budget: "Budget", suppliers: "Fournisseurs", deliveries: "Livraisons", tarifs: "Tarifs",
    users: "Comptes", stamps: "Cachets", signatures: "Signatures", "journal-sig": "Journal de signature",
    journal: "Journal d’activité", "signature-profil": "Signature et visa",
    notifications: "Notifications", fiche: "Dossier", revue: "Revue",
    "dossiers-transmis": "Dossiers transmis", "dossiers-stats": "Statistiques des dossiers",
    "recours-historique": "Historique des recours", completeness: "Contrôle de complétude",
    "waiting-pieces": "En attente de pièces", justificatifs: "Justificatifs",
    "agent-relances": "Relances suivies", "agent-recours": "Recours suivis",
    "delegations-draft": "Délégations en préparation", delegations: "Délégations et diplômes",
    "controles-recip": "Contrôles par récipiendaire", anomalies: "Anomalies",
    "verify-history": "Historique des vérifications", "payments-follow": "Suivi des paiements",
    archives: "Archives", ready: "Prêts pour décision", localisation: "Localisation physique",
    diplomas: "Stock des diplômes", "reg-stats": "Statistiques de la régie",
    alerts: "État de la plateforme", "internal-accounts": "Comptes internes",
  };
  for (const it of cfNav(role)) {
    if (it.page === page) return it.label;
    const ch = (it.children || []).find((c) => c.page === page);
    if (ch) return ch.label;
  }
  if (page === "localisation" && !(typeof cfIsSec === "function" && cfIsSec(role))) return "Page non disponible";
  return map[page] || "Espace";
}

function cfBadge(status) {
  const label = CF_STATUS_LABEL[status] || status;
  const tone = CF_STATUS_TONE[status] || "neutral";
  return `<span class="cf-badge cf-badge-${tone}">${esc(label)}</span>`;
}
function cfEmpty(text, ico) {
  return `<div class="cf-empty">${icon(ico || "folder", "size-7")}<strong>Aucun élément</strong><p>${esc(text)}</p></div>`;
}
function cfExplain(t) { return `<p class="cf-explain">${icon("info", "size-4")}<span>${t}</span></p>`; }
function cfBtn(label, action, props, cls) {
  return `<button type="button" data-cf-action="${action}" ${props || ""} class="cf-btn ${cls || ""}">${label}</button>`;
}
function cfHref(page) {
  const role = (typeof cfState !== "undefined" && cfState.spaceRole) || (typeof cfRole === "function" ? cfRole() : "");
  return typeof workspacePath === "function" ? workspacePath(role, page) : "#";
}
function cfLink(label, page, cls, extra) {
  return `<a href="${cfHref(page)}" data-page="${page}" ${extra || ""} class="cf-link ${cls || ""}">${label}${icon("arrowRight", "size-4")}</a>`;
}

function cfUnread() { return cfMyNotices().filter((n) => !n.read).length; }

function cfTop(role, page) {
  const u = cfUser();
  const conf = ROLE_CONFIGS[role] || { shortLabel: role, label: role };
  const name = u ? u.prenom + " " + u.nom : conf.shortLabel;
  const unread = cfUnread();
  const current = cfNavParent(role, page);
  const employe = role === "recipient";
  const nav = employe ? "" : cfNav(role).map((it) => {
    const open = cfState.menu === it.page;
    const active = current === it.page;
    const count = it.count ? `<i class="cf-nav-count">${it.count}</i>` : "";
    if (it.children) {
      return `<div class="cf-drop ${open ? "is-open" : ""} ${active ? "is-current" : ""}">
        <button type="button" class="${active ? "is-active" : ""}" data-cf-action="menu" data-menu="${it.page}" aria-expanded="${open}">${esc(it.label)}${count}${icon("chevronDown", "size-3.5")}</button>
        ${open ? `<div class="cf-mega" role="menu">${it.children.map((c) => `<button type="button" role="menuitem" data-action="ws-page" data-page="${c.page}" class="${page === c.page ? "is-active" : ""}"><strong>${esc(c.label)}</strong><span>${esc(c.help || "")}</span></button>`).join("")}</div>` : ""}
      </div>`;
    }
    return `<button type="button" data-action="ws-page" data-page="${it.page}" class="${active ? "is-active" : ""}">${esc(it.label)}${count}</button>`;
  }).join("");
  const accent = role === "demandeur" ? cfBtn("Nouveau dossier " + icon("plus", "size-4"), "go", "data-page=\"new-dossier\"", "cf-accent") : "";
  return `<header class="cf-top ws-header sticky top-0 z-50">
    <div class="cf-top-inner">
      <button type="button" data-action="nav" data-path="/" class="cf-brand">${emblem({ size: 36 })}<span><strong>Distinctions Nationales</strong><small>République Gabonaise</small></span></button>
      ${employe ? `<a class="cf-follow" data-action="ws-page" data-page="overview">Suivre ma demande</a>` : `<nav class="cf-nav ws-tabs" aria-label="Menu du profil">${nav}</nav>${accent}`}
      <div class="cf-tools">
        <button type="button" class="cf-icon-btn cf-mobile-only" data-cf-action="mobile" aria-label="Menu">${icon("menu", "size-5")}</button>
        <button type="button" class="cf-icon-btn" data-cf-action="search" aria-label="Recherche" title="Ctrl+K">${icon("search", "size-5")}</button>
        <button type="button" class="cf-icon-btn" data-cf-action="notices" aria-expanded="${cfState.notices}" aria-label="Notifications">${icon("bell", "size-5")}${unread ? `<i class="cf-dot">${unread}</i>` : ""}</button>
        <button type="button" class="cf-account" data-cf-action="account" aria-expanded="${cfState.account}"><span class="cf-ava">${esc((name || "?").slice(0, 2).toUpperCase())}</span><span class="cf-account-txt">${esc(name)}<small>${esc(conf.shortLabel)}</small></span>${icon("chevronDown", "size-4")}</button>
      </div>
    </div>
    ${cfState.notices ? cfNoticesPop(role) : ""}
    ${cfState.account ? cfAccountMenu(role) : ""}
    ${cfState.search ? cfSearchPalette() : ""}
    ${cfState.mobile ? `<div class="cf-mobile-nav">${cfNav(role).map((it) => (it.children || [{ page: it.page, label: it.label }]).map((c) => `<button type="button" data-action="ws-page" data-page="${c.page}">${esc(c.label)}</button>`).join("")).join("")}</div>` : ""}
  </header>`;
}
function cfNoticesPop(role) {
  const list = cfMyNotices().slice(0, 5);
  return `<div class="cf-pop cf-pop-notices" role="region" aria-label="Notifications">
    <div class="cf-pop-head"><strong>Notifications</strong>${cfBtn("Tout marquer lu", "read-all", "", "cf-tiny")}</div>
    ${list.length ? list.map((n) => `<button type="button" class="cf-notice ${n.read ? "is-read" : ""}" data-cf-action="notice" data-id="${n.id}" data-page="${esc(n.page || "overview")}" data-ref="${esc(n.ref || "")}">${esc(n.text)}<small>${esc(n.date)}</small></button>`).join("") : cfEmpty("Aucune notification.", "bell")}
    ${cfLink("Toutes les notifications", "notifications")}
  </div>`;
}
function cfAccountMenu(role) {
  return `<div class="cf-pop cf-pop-account" role="menu">
    ${cfLink("Mon compte", "profile")}
    ${["ministre", "dgt", "dr", "service_agent", "service_inspecteur", "service_chef"].includes(role) ? cfLink("Ma signature et mon visa", "signature-profil") : ""}
    ${cfIsAuth(role) ? cfLink("Historique", "history") : ""}
    <button type="button" data-cf-action="prefs">Préférences de notification</button>
    <div class="cf-switcher-label">Changer de profil</div>
    <div class="cf-switcher">${(typeof DEMO_ACCOUNTS !== "undefined" ? DEMO_ACCOUNTS : []).map((a) => `<button type="button" data-cf-action="switch" data-role="${esc(a.role)}" data-email="${esc(a.email)}">${esc(a.shortLabel)}</button>`).join("")}</div>
    <button type="button" data-cf-action="logout">${icon("logout", "size-4")} Déconnexion</button>
  </div>`;
}
function cfSearchPalette() {
  const rows = cfSearch(cfState.searchQ);
  return `<div class="cf-palette" role="dialog" aria-label="Recherche">
    <label class="cf-palette-field">${icon("search", "size-4")}<input data-cf-search-global type="search" placeholder="Dossier, demandeur, récipiendaire, CNI…" value="${esc(cfState.searchQ)}" autofocus /></label>
    <div class="cf-palette-list">${rows.length ? rows.map((r) => `<a data-cf-action="search-go" href="${cfHref(r.page)}" data-page="${r.page}" data-id="${esc(r.id)}"><small>${esc(r.kind)}</small>${esc(r.label)}</a>`).join("") : `<p class="cf-muted">Saisissez au moins deux caractères.</p>`}</div>
  </div>`;
}

function cfBanner(role, page, opts) {
  const o = opts || {};
  const title = o.title || cfPageTitle(role, page);
  const crumbs = [`<a href="${cfHref("overview")}" data-page="overview">Accueil</a>`];
  if (page !== "overview") crumbs.push(`<span>${esc(title)}</span>`);
  const actions = o.actions || "";
  const hero = page === "overview" ? `<section class="ws-hero ws-appear"><div class="cf-hero-copy"><p class="cf-greeting">Espace ${esc((ROLE_CONFIGS[role] || {}).shortLabel || role)}</p><h1>${esc(title)}</h1><p class="cf-lead">${esc((ROLE_CONFIGS[role] || {}).description || "")}</p></div></section>` : "";
  return `${hero}<div class="cf-banner"><div class="cf-crumbs">${crumbs.join("<span class=\"cf-sep\">/</span>")}</div><div class="cf-banner-row"><div>${page === "overview" ? "" : `<h1>${esc(title)}</h1>`}${o.status ? cfBadge(o.status) : ""}</div><div class="cf-banner-actions">${actions}</div></div></div>`;
}

function cfShell(role, page, body, opts) {
  if (typeof ipShell === "function") return ipShell(role, page, body, opts);
  const demo = "";
  return `<div class="cf-page portal-page ws-page" data-ws-content data-cf-role="${role}" data-cf-page="${page}">
    ${demo}${cfTop(role, page)}
    <div class="cf-layout ${cfState.assistant ? "has-assistant" : ""} ${cfState.panel ? "has-panel" : ""}">
      <main id="contenu" class="cf-main">
        ${cfBanner(role, page, opts)}
        ${body}
      </main>
      ${cfState.panel ? cfPanel() : ""}
    </div>
    ${cfState.viewer ? cfViewer() : ""}
    <div id="cf-toast">${cfToastHtml()}</div>
    ${typeof portalBackTop === "function" ? portalBackTop() : `<button type="button" data-action="home-top" data-back-to-top aria-label="Revenir en haut" aria-hidden="true" tabindex="-1" class="home-back-top"><span class="home-back-top-icon">${icon("arrowRight", "size-4 -rotate-90")}</span></button>`}
  </div>`;
}

function cfAssistant(role) {
  const log = cfState.assistantLog.length ? cfState.assistantLog : [{ q: "", a: "Je guide cet espace. Exemples : « Comment déposer un recours ? », « Où voir ma quittance ? », « Combien de dossiers validés ? »" }];
  return `<aside class="cf-assistant" aria-label="Assistant">
    <header><strong>Assistant</strong>${cfBtn(icon("x", "size-4"), "assistant", "", "cf-icon-btn")}</header>
    <div class="cf-assistant-log">${log.map((l) => `<div class="cf-a-line">${l.q ? `<p class="cf-q">${esc(l.q)}</p>` : ""}<p class="cf-a">${l.a}</p></div>`).join("")}</div>
    <form data-cf-form="assistant"><input name="q" placeholder="Votre question…" value="${esc(cfState.assistantQ)}" /><button type="submit" class="cf-btn cf-accent">Envoyer</button></form>
    <small>Guide local v1 · réponses préparées</small>
  </aside>`;
}
function cfAnswer(q) {
  const t = String(q || "").toLowerCase();
  const s = cfS();
  if (t.includes("recours")) return { a: "Un recours se dépose depuis la fiche d’un dossier rejeté ou après notification de la liste. Il part au secrétariat de l’autorité saisie.", page: "dossiers" };
  if (t.includes("quittance")) return { a: "La quittance se téléverse dans l’onglet Paiement du dossier, une fois l’ordre de recette émis. Le paiement se fait au Trésor, hors plateforme.", page: "dossiers" };
  if (t.includes("valid")) return { a: "Dossiers validés cette année : " + s.stats.campaign.validated + ". Récipiendaires validés : " + s.stats.campaign.recipientsValidated + ".", page: "stats" };
  if (t.includes("déposer") || t.includes("deposer") || t.includes("nouveau")) return { a: "Le bouton Nouveau dossier ouvre un parcours en six étapes. Seuls les demandeurs reconnus peuvent déposer.", page: "new-dossier" };
  if (t.includes("cérémon") || t.includes("ceremon")) return { a: "Le calendrier n’affiche que les cérémonies. Hors délai, un fil de négociation sert jusqu’à l’accord du Service.", page: "calendar" };
  return { a: "Je n’ai qu’un guide local. Reformulez, ou ouvrez le menu du profil pour l’écran concerné." };
}

function cfPanel() {
  const p = cfState.panel;
  if (!p) return "";
  let inner = "";
  if (p.type === "recipient") inner = cfRecipientPanel(p);
  else if (p.type === "notice") inner = `<h2>${esc(p.title || "Détail")}</h2><p>${esc(p.text || "")}</p>`;
  else if (p.type === "stock") inner = cfStockForm(p.metal);
  else if (p.type === "supplier") inner = cfSupplierForm(p.id);
  else if (p.type === "user") inner = cfUserForm(p.id);
  else if (p.type === "applicant") inner = cfApplicantForm(p.id);
  else if (p.type === "complement") inner = cfComplementForm(p);
  else if (p.type === "quittance") inner = cfQuittanceForm(p.id);
  else if (p.type === "delivery") inner = cfDeliveryForm(p.id);
  else if (p.type === "transmit") inner = cfTransmitForm(p.id);
  else if (p.type === "ceremony-place") inner = cfCeremonyPlaceForm(p.id);
  else inner = `<p>${esc(p.text || "")}</p>`;
  return `<aside class="cf-drawer" role="dialog" aria-modal="true">
    <header><strong>${esc(p.title || "Détail")}</strong>${cfBtn(icon("x", "size-4"), "panel-off", "aria-label=\"Fermer\"", "cf-icon-btn")}</header>
    <div class="cf-drawer-body">${inner}</div>
  </aside>`;
}

function cfConfirmBar(action, summary, props) {
  const idMatch = /data-id="([^"]*)"/.exec(props || "");
  const id = idMatch ? idMatch[1] : "";
  if (cfState.confirm && cfState.confirm.action === action && String(cfState.confirm.id || "") === String(id)) {
    return `<div class="cf-confirm-bar"><span>Confirmer : ${esc(summary)}</span>${cfBtn("Annuler", "confirm-off", "", "cf-btn-ghost")}${cfBtn("Confirmer", action, props, "cf-accent")}</div>`;
  }
  return cfBtn("Confirmer l’action", "confirm-on", `data-next="${action}" data-summary="${esc(summary)}" ${props || ""}`, "cf-accent");
}

function cfFrise(status) {
  const order = CF_FRISE;
  const idx = order.indexOf(status);
  return `<ol class="cf-frise">${order.map((s, i) => `<li class="${i < idx ? "is-done" : i === idx ? "is-now" : ""}"><i></i><span>${esc(CF_STATUS_LABEL[s])}</span></li>`).join("")}</ol>`;
}

function cfFilters(options, value, key) {
  return `<div class="cf-pills">${[{ v: "", l: "Tous" }].concat(options.map((o) => ({ v: o, l: CF_STATUS_LABEL[o] || o }))).map((o) => `<button type="button" data-cf-action="filter" data-key="${key || "filter"}" data-value="${esc(o.v)}" class="${(value || "") === o.v ? "is-on" : ""}">${esc(o.l)}</button>`).join("")}</div>`;
}
function cfPager(total) {
  const pages = Math.max(1, Math.ceil(total / CF_PAGE_SIZE));
  if (pages <= 1) return "";
  const cur = Math.min(cfState.page, pages);
  let b = "";
  for (let i = 1; i <= pages; i += 1) b += `<button type="button" data-cf-action="page" data-page="${i}" class="${i === cur ? "is-on" : ""}">${i}</button>`;
  return `<nav class="cf-pager" aria-label="Pagination">${b}</nav>`;
}
function cfSlice(list) {
  const start = (cfState.page - 1) * CF_PAGE_SIZE;
  return list.slice(start, start + CF_PAGE_SIZE);
}

/* -------------------- pages -------------------- */

function cfDashCards(items) {
  return `<div class="cf-dash">${items.map((it) => `<button type="button" class="cf-card" data-action="ws-page" data-page="${it.page}" ${it.id ? `data-cf-select="${it.id}"` : ""}><small>${esc(it.label)}</small><strong>${esc(String(it.value))}</strong><span>${esc(it.sub || "")}</span></button>`).join("")}</div>`;
}

function cfDemandeurHome() {
  const c = cfCampaign("2026");
  const end = cfParseFr(c.depositEnd);
  const days = end ? Math.max(0, Math.round((end - CF_TODAY) / 86400000)) : 0;
  const app = cfApplicant(cfApplicantId());
  const todo = cfTodoDemandeur();
  const dossiers = cfVisibleDossiers();
  const by = {};
  dossiers.forEach((d) => { by[d.status] = (by[d.status] || 0) + 1; });
  const nextCer = dossiers.map((d) => d.ceremony).filter((x) => x && x.status !== "tenue")[0];
  const banner = app && !app.estReconnu ? `<div class="cf-alert">Votre structure n’est pas encore reconnue, le dépôt est impossible. ${cfBtn("Nouveau dossier", "go", "data-page=\"new-dossier\" disabled", "cf-btn-ghost")}</div>` : "";
  return banner + `<section class="cf-campaign">
      <div class="cf-eyebrow">CAMPAGNE ${esc(c.year)}</div>
      <h2>Période de dépôt ${esc(c.depositStart)} – ${esc(c.depositEnd)}${c.prorogee ? " · prorogée" : ""}</h2>
      <p>${days} jour${days > 1 ? "s" : ""} restant${days > 1 ? "s" : ""} · cérémonie officielle le ${esc(c.ceremonyDate)} — ${esc(c.ceremonyPlace)}</p>
      <div class="cf-timebar"><i style="width:${Math.min(100, Math.max(4, 100 - days / 80 * 100))}%"></i></div>
    </section>
    <div class="cf-two">
      <section class="cf-paper"><h2>À faire</h2>${todo.length ? todo.map((t) => `<article class="cf-todo"><div><strong>${esc(t.label)}</strong></div>${cfBtn("Ouvrir", "open-dossier", `data-id="${t.id}"`, "cf-accent")}</article>`).join("") : cfEmpty("Rien à faire pour le moment.", "checkCircle")}</section>
      <section class="cf-paper"><h2>Mes dossiers en bref</h2><div class="cf-pills">${Object.keys(by).map((k) => `<button type="button" data-cf-action="filter-dossiers" data-value="${k}">${esc(CF_STATUS_LABEL[k])} · ${by[k]}</button>`).join("") || "<p class='cf-muted'>Aucun dossier.</p>"}</div></section>
    </div>
    <section class="cf-paper"><h2>Dernières notifications</h2>${cfMyNotices().slice(0, 4).map((n) => `<p class="cf-line">${esc(n.text)}<small>${esc(n.date)}</small></p>`).join("") || cfEmpty("Aucune.", "bell")}</section>
    <section class="cf-strip">${icon("calendar", "size-5")}<div><strong>${nextCer ? "Prochaine cérémonie · " + nextCer.date : "Aucune cérémonie à venir"}</strong><small>${nextCer ? nextCer.place : "Les dates confirmées apparaîtront ici."}</small></div>${cfLink("Calendrier", "calendar")}</section>`;
}

function cfDossierList(role) {
  let rows = cfVisibleDossiers(role);
  if (cfState.filter) rows = rows.filter((d) => d.status === cfState.filter);
  if (cfState.query) {
    const q = cfState.query.toLowerCase();
    rows = rows.filter((d) => d.ref.toLowerCase().includes(q) || (d.recipients || []).some((r) => (r.nom + " " + r.prenom).toLowerCase().includes(q)));
  }
  rows = rows.slice().sort((a, b) => (cfState.sort === "old" ? 1 : -1) * (cfParseFr(a.submitted) - cfParseFr(b.submitted)));
  const slice = cfSlice(rows);
  const app = (id) => { const a = cfApplicant(id); return a ? a.sigle || a.nom : ""; };
  const statuses = [...new Set(cfVisibleDossiers(role).map((d) => d.status))];
  const newBtn = role === "demandeur" ? cfBtn("Nouveau dossier " + icon("plus", "size-4"), "go", "data-page=\"new-dossier\"", "cf-accent") : "";
  return `${cfFilters(statuses, cfState.filter)}
    <div class="cf-toolbar"><label class="cf-search">${icon("search", "size-4")}<input data-cf-q placeholder="Numéro ou récipiendaire" value="${esc(cfState.query)}" /></label><span class="cf-count">${rows.length} résultat${rows.length > 1 ? "s" : ""}</span>${newBtn}</div>
    ${slice.length ? `<div class="cf-rows">${slice.map((d) => {
      const val = (d.recipients || []).filter((r) => (r.medals || []).some((m) => m.status === "VALIDE")).length;
      const tot = (d.recipients || []).length;
      return `<button type="button" class="cf-row" data-cf-action="open-dossier" data-id="${d.id}">
        <div class="cf-row-main"><strong>${esc(d.ref)}</strong><small>Campagne ${esc(d.campaign)} · ${esc(d.submitted)} · ${esc(app(d.applicantId))}</small>
          <span class="cf-mini-frise">${CF_FRISE.map((s) => `<i class="${s === d.status ? "is-now" : CF_FRISE.indexOf(s) < CF_FRISE.indexOf(d.status) ? "is-done" : ""}"></i>`).join("")}</span>
        </div>
        <span>${val}/${tot}</span>
        <span>${esc(CF_LEVEL_LABEL[d.destination] || d.destination)}</span>
        ${cfBadge(d.status)}
      </button>`;
    }).join("")}</div>${cfPager(rows.length)}` : cfEmpty("Aucun dossier ne correspond.", "folder")}`;
}

function cfFiche(role, d) {
  if (!d) return cfEmpty("Dossier introuvable.", "folder");
  const internal = role !== "demandeur" && role !== "recipient";
  const tab = cfState.tab || "resume";
  const tabs = [
    ["resume", "Résumé"], ["recip", "Récipiendaires"], ["pieces", "Pièces"], ["echanges", "Échanges"],
    ["paiement", "Paiement"], ["remise", "Remise et cérémonie"], ["historique", "Historique"],
  ];
  const next = cfNextAction(role, d);
  let body = "";
  if (tab === "resume") {
    body = `${cfDossierIdentite(d)}
      ${cfCircuitHtml(d)}
      ${internal && d.location ? `<p class="cf-muted">Localisation physique : ${esc(d.location)}</p>` : ""}
      ${cfExplain("À faire : " + (next ? next.label : "Aucune action de votre part pour l’instant."))}`;
  } else if (tab === "recip") {
    body = `<table class="cf-table"><thead><tr><th>Nom</th><th>Médaille</th><th>Statut</th><th>Motif</th></tr></thead><tbody>${(d.recipients || []).map((r) => (r.medals || []).map((m) => `<tr>
      <td><button type="button" class="cf-inline" data-cf-action="panel-rec" data-id="${d.id}" data-rid="${r.id}">${esc(r.prenom)} ${esc(r.nom)}</button></td>
      <td>${esc(m.granted || m.metal)}</td><td>${cfBadge(m.status)}</td><td>${esc(m.motif || "—")}</td>
    </tr>`).join("")).join("")}</tbody></table>`;
  } else if (tab === "pieces") {
    const docs = cfS().documents.filter((x) => x.dossierId === d.id);
    const names = (d.pieces || []).concat(docs.map((x) => x.name));
    body = `<ul class="cf-docs">${names.map((n) => `<li>${icon("document", "size-4")}<span>${esc(n)}</span>${cfBtn("Ouvrir", "view-doc", `data-id="${(docs.find((x) => x.name === n) || {}).id || ""}" data-name="${esc(n)}"`, "cf-tiny")}</li>`).join("")}</ul>
      ${["SOUMIS", "EN_ETUDE", "APPROUVE"].includes(d.status) && role === "demandeur" ? cfBtn("Ajouter une pièce", "fake-piece", `data-id="${d.id}"`, "cf-btn-ghost") : ""}`;
  } else if (tab === "echanges") {
    body = `<h3>Compléments</h3>${(d.complements || []).length ? d.complements.map((c) => `<article class="cf-exch"><strong>${esc(c.objet)}</strong> · ${esc(c.date)} · ${esc(c.status)}${c.reponse ? `<p>Réponse : ${esc(c.reponse.texte || "")}</p>` : (role === "demandeur" && c.status === "ouvert" ? cfBtn("Répondre", "panel-cpl", `data-id="${d.id}" data-cid="${c.id}"`, "cf-accent") : "")}</article>`).join("") : "<p class='cf-muted'>Aucun.</p>"}
      <h3>Recours</h3>${(d.recours || []).length ? d.recours.map((r) => `<article class="cf-exch"><strong>${esc(r.motif)}</strong> · ${esc(CF_LEVEL_LABEL[r.autorite])} · ${esc(r.status)}</article>`).join("") : "<p class='cf-muted'>Aucun.</p>"}
      <h3>Relances</h3>${(d.relances || []).length ? d.relances.map((r) => `<article class="cf-exch"><strong>${esc(r.motif)}</strong> · ${esc(r.status)}</article>`).join("") : "<p class='cf-muted'>Aucune.</p>"}`;
  } else if (tab === "paiement") {
    const o = d.order;
    body = o ? `<dl class="cf-facts"><div><dt>Référence</dt><dd>${esc(o.ref)}</dd></div><div><dt>Date</dt><dd>${esc(o.date)}</dd></div>${cfShowMoney(role) ? `<div><dt>Montant</dt><dd>${esc(cfMoney(o.amount))}</dd></div>` : ""}</dl>
      ${cfShowMoney(role) ? `<table class="cf-table"><thead><tr><th>Récipiendaire</th><th>Métal</th><th>Médaille</th><th>Diplôme</th></tr></thead><tbody>${(o.lines || []).map((l) => `<tr><td>${esc(l.name)}</td><td>${esc(l.metal)}</td><td>${esc(cfMoney(l.medal))}</td><td>${esc(cfMoney(l.diplome))}</td></tr>`).join("")}</tbody></table>` : ""}
      ${d.quittance ? `<p>Quittance ${esc(d.quittance.numero)} · ${cfShowMoney(role) ? esc(cfMoney(d.quittance.montant)) + " · " : ""}${esc(d.quittance.date)}</p>` : (role === "demandeur" && d.status === "ORDRE_EMIS" ? cfBtn("Téléverser la quittance", "panel-qui", `data-id="${d.id}"`, "cf-accent") : "<p class='cf-muted'>Pas encore de quittance.</p>")}
      ${cfExplain("Le paiement se fait au Trésor, hors plateforme.")}` : "<p class='cf-muted'>Aucun ordre de recette.</p>";
  } else if (tab === "remise") {
    body = `${d.remise ? `<p>Retirant ${esc(d.remise.retirant)} (${esc(d.remise.qualite)}) le ${esc(d.remise.date)}.</p>` : "<p class='cf-muted'>Pas encore de remise.</p>"}
      ${d.ceremony ? `<p>Cérémonie ${esc(d.ceremony.type)} · ${esc(d.ceremony.date)} · ${esc(d.ceremony.place)} · ${esc(d.ceremony.status)}</p>` : ""}
      ${(d.negotiation || []).map((n) => `<article class="cf-exch"><strong>${esc(n.dateProp)}</strong> — ${esc(n.lieu)} <small>${esc(n.by)} · ${esc(n.date)}</small>
        ${role === "demandeur" && d.ceremonyRequest && d.ceremonyRequest.status === "negociation" ? cfBtn("Accepter", "nego-ok", `data-id="${d.id}"`, "cf-accent") + cfBtn("Proposer autre chose", "nego-other", `data-id="${d.id}"`, "cf-btn-ghost") : ""}
      </article>`).join("")}
      ${d.status === "CEREMONIE_PLANIFIEE" && role === "demandeur" ? `<div class="cf-form">${cfBtn("Ajouter un délégué", "add-del", `data-id="${d.id}"`, "cf-btn-ghost")}<ul>${(d.delegues || []).map((x) => `<li>${esc(x.nom)} — ${esc(x.fonction)}</li>`).join("")}</ul></div>` : ""}
      ${(d.recipients || []).map((r) => r.presence ? `<p>${esc(r.prenom)} ${esc(r.nom)} : ${esc(r.presence)}</p>` : "").join("")}`;
  } else {
    body = `<ul class="cf-hist">${(d.history || []).map(([dt, l]) => `<li><time>${esc(dt)}</time><span>${esc(l)}</span></li>`).join("")}</ul>
      ${internal ? cfExplain("Localisation physique : " + (d.location || "—")) : cfExplain("Le demandeur ne voit pas la localisation physique du papier.")}`;
  }
  return `<article class="cf-fiche">
    <header class="cf-fiche-head"><div><div class="cf-eyebrow">${esc(d.ref)}</div><h2>${esc(cfApplicant(d.applicantId) ? cfApplicant(d.applicantId).nom : "")}</h2>${cfBadge(d.status)}</div></header>
    ${cfFrise(d.status === "REJETE" ? "SOUMIS" : d.status)}
    <div class="cf-fiche-grid">
      <div>
        <div class="cf-tabs">${tabs.map(([k, l]) => `<button type="button" data-cf-action="tab" data-tab="${k}" class="${tab === k ? "is-on" : ""}">${esc(l)}</button>`).join("")}</div>
        <div class="cf-fiche-body">${body}</div>
      </div>
      <aside class="cf-next"><h3>Prochaine action</h3>${next ? `<p>${esc(next.label)}</p>${next.html}` : "<p class='cf-muted'>Aucune action.</p>"}
        <h4>Dates clés</h4><p>Dépôt ${esc(d.submitted)}</p>${d.approved ? `<p>Approuvé ${esc(d.approved)}</p>` : ""}</aside>
    </div>
  </article>`;
}

function cfNextAction(role, d) {
  if (role === "demandeur") {
    const open = (d.complements || []).find((c) => c.status === "ouvert");
    if (open) return { label: "Répondre au complément « " + open.objet + " ».", html: cfBtn("Répondre", "panel-cpl", `data-id="${d.id}" data-cid="${open.id}"`, "cf-accent") };
    if (d.notified && !d.listAccepted && d.status === "EN_ETUDE") return { label: "Accepter ou contester la liste des validés.", html: cfBtn("Accepter", "accept-list", `data-id="${d.id}"`, "cf-accent") + cfBtn("Contester", "go-recours", `data-id="${d.id}"`, "cf-btn-ghost") };
    if (d.status === "REJETE") return { label: "Dossier rejeté. Vous pouvez déposer un recours.", html: cfBtn("Déposer un recours", "go-recours", `data-id="${d.id}"`, "cf-accent") };
    if (d.status === "ORDRE_EMIS" && !d.quittance) return { label: "Téléverser le scan de la quittance du Trésor.", html: cfBtn("Téléverser", "panel-qui", `data-id="${d.id}"`, "cf-accent") };
    if (d.status === "MEDAILLES_REMISES" && !d.ceremony && !d.ceremonyRequest) return { label: "Demander une cérémonie.", html: cfBtn("Demander", "ask-cer", `data-id="${d.id}"`, "cf-accent") };
    if (d.status === "CLOTURE") return { label: "Cérémonie passée. Relance possible pour les non distribuées.", html: cfBtn("Relancer", "ask-rel", `data-id="${d.id}"`, "cf-btn-ghost") };
  }
  if (role === "service_inspecteur") return { label: "Contrôle des pièces. Aucune validation de médaille depuis cet écran.", html: cfBtn("Signaler une anomalie", "go", "data-page=\\\"anomalies\\\"", "cf-accent") };
  if ((role === "service_agent" || role === "service_chef") && d.status === "APPROUVE") return { label: "Démarrer l’instruction.", html: cfBtn("Démarrer", "start-study", `data-id="${d.id}"`, "cf-accent") };
  if (role === "service_chef" && d.status === "VALIDE" && !d.order) return { label: "Émettre l’ordre de recette.", html: cfBtn("Émettre", "go-order", `data-id="${d.id}"`, "cf-accent") };
  if (role === "regisseur" && d.status === "ORDRE_EMIS" && d.quittance) return { label: "Vérifier la quittance.", html: cfBtn("Ouvrir le guichet", "go", "data-page=\"remises\"", "cf-accent") };
  if (cfRole() === "dr" && d.status === "SOUMIS") return { label: "Décision de première instance.", html: cfBtn("Approuver", "confirm-on", `data-next="approve" data-id="${d.id}" data-summary="Le dossier sera envoyé au Service."`, "cf-accent") + cfBtn("Rejeter", "revue-reject", `data-id="${d.id}"`, "cf-btn-ghost") };
  return null;
}

function cfWizard() {
  const w = cfState.wizard;
  const app = cfApplicant(cfApplicantId());
  if (app && !app.estReconnu) return cfExplain("Votre structure n’est pas encore reconnue, le dépôt est impossible.");
  const steps = ["Destinataire", "Courrier", "Récipiendaires", "DTS et pièces", "Récapitulatif", "Dépôt"];
  const hors = !cfInDeposit(CF_TODAY_FR);
  let form = "";
  if (w.step === 1) {
    form = `<fieldset><legend>Autorité destinataire</legend>${["ministre", "dgt", "dr"].map((l) => `<label class="cf-radio"><input type="radio" name="destination" value="${l}" data-cf-wiz="destination" ${w.destination === l ? "checked" : ""}/> ${esc(CF_LEVEL_LABEL[l])}</label>`).join("")}</fieldset>
      ${hors ? cfExplain("Hors période de dépôt : la cérémonie sera négociée (hors délai) au lieu d’être la cérémonie officielle.") : ""}`;
  } else if (w.step === 2) {
    form = `<label>Courrier d’initiation ${cfBtn(w.letter || "Joindre (simulation)", "wiz-file", "data-field=\"letter\"", "cf-btn-ghost")}</label>
      <label>Nombre de récipiendaires <input type="number" min="1" data-cf-wiz="nRec" value="${esc(w.nRec)}" /></label>
      <div class="cf-three"><label>Or <input type="number" min="0" data-cf-wiz="nOr" value="${esc(w.nOr)}" /></label><label>Argent <input type="number" min="0" data-cf-wiz="nArgent" value="${esc(w.nArgent)}" /></label><label>Bronze <input type="number" min="0" data-cf-wiz="nBronze" value="${esc(w.nBronze)}" /></label></div>`;
  } else if (w.step === 3) {
    form = (w.recipients.length ? w.recipients.map((r, i) => `<article class="cf-rec">${esc(r.prenom)} ${esc(r.nom)} · ${esc((r.metals || [r.metal]).join(", "))} · ${esc(String(r.years))} ans ${r.warn ? `<em>${esc(r.warn)}</em>` : ""} ${cfBtn("Retirer", "wiz-del-rec", `data-index="${i}"`, "cf-tiny")}</article>`).join("") : "") + cfRecipientFields();
  } else if (w.step === 4) {
    form = `<label>DTS ${cfBtn(w.dts || "Joindre (simulation)", "wiz-file", "data-field=\"dts\"", "cf-btn-ghost")}</label>
      <p class="cf-muted">Autres pièces : ${(w.pieces || []).join(", ") || "aucune"} ${cfBtn("Ajouter une pièce", "wiz-file", "data-field=\"piece\"", "cf-tiny")}</p>`;
  } else if (w.step === 5) {
    const miss = [];
    if (!w.letter) miss.push("courrier d’initiation");
    if (!w.dts) miss.push("DTS");
    if (!w.recipients.length) miss.push("récipiendaires");
    form = `<p>Destinataire : ${esc(CF_LEVEL_LABEL[w.destination])} · ${w.recipients.length} récipiendaire(s).</p>
      <ul>${w.recipients.map((r) => `<li>${esc(r.prenom)} ${esc(r.nom)} — ${(r.metals || [r.metal]).join(", ")}</li>`).join("")}</ul>
      ${miss.length ? cfExplain("Dossier incomplet (" + miss.join(", ") + "). Il peut quand même être déposé : le Service demandera les compléments.") : cfExplain("Dossier complet.")}
      ${cfExplain("La liste des récipiendaires est générée par la plateforme. Vous ne la téléversez pas.")}`;
  } else {
    form = `<p>Confirmez le dépôt. Un accusé et un numéro seront affichés. Statut initial : SOUMIS.</p>`;
  }
  const recap = `<aside class="cf-recap"><h3>Récapitulatif</h3><p>${w.recipients.length} récipiendaire(s)</p><ul>${w.recipients.map((r) => `<li>${esc(r.prenom)} ${esc(r.nom)}</li>`).join("")}</ul><p>Pièces : ${[w.letter, w.dts].filter(Boolean).length + (w.pieces || []).length}</p></aside>`;
  return `<div class="cf-wizard">
    <ol class="cf-steps">${steps.map((s, i) => `<li class="${w.step === i + 1 ? "is-now" : w.step > i + 1 ? "is-done" : ""}">${i + 1}. ${esc(s)}</li>`).join("")}</ol>
    <div class="cf-wiz-grid"><div class="cf-paper">${form}<div class="cf-wiz-nav">${w.step > 1 ? cfBtn("Précédent", "wiz-prev", "", "cf-btn-ghost") : ""}${w.step < 6 ? cfBtn("Suivant", "wiz-next", "", "cf-accent") : cfBtn("Déposer", "wiz-submit", "", "cf-accent")}</div></div>${recap}</div>
  </div>`;
}
function cfRecipientFields() {
  const f = cfState.form;
  const years = f.start ? cfYears(f.start) : 0;
  const elig = years ? cfEligibleMedal(years) : null;
  const warn = years && years < 10 ? "Ancienneté sous le seuil de 10 ans, sauf assouplissement." : "";
  return `<div class="cf-grid2">
    <label>CNI *<input name="cni" data-cf-form-field value="${esc(f.cni || "")}" /></label>
    <label>Nom *<input name="nom" data-cf-form-field value="${esc(f.nom || "")}" /></label>
    <label>Prénom *<input name="prenom" data-cf-form-field value="${esc(f.prenom || "")}" /></label>
    <label>Poste *<input name="poste" data-cf-form-field value="${esc(f.poste || "")}" /></label>
    <label>Date d’entrée *<input name="start" placeholder="jj/mm/aaaa" data-cf-form-field value="${esc(f.start || "")}" /></label>
    <label>Nationalité<select name="nationalite" data-cf-form-field><option ${f.nationalite === "Gabonaise" ? "selected" : ""}>Gabonaise</option><option ${f.nationalite === "Sénégalaise" ? "selected" : ""}>Sénégalaise</option><option>Autre</option></select></label>
    <label>Sexe<select name="sexe" data-cf-form-field><option>Masculin</option><option>Féminin</option></select></label>
    <label>Date de décès<input name="dateDeces" data-cf-form-field value="${esc(f.dateDeces || "")}" /></label>
  </div>
  ${years ? `<p class="cf-calc">Ancienneté : ${years} ans · médaille éligible : <strong>${esc(elig || "sous le seuil")}</strong></p>` : ""}
  ${warn ? `<p class="cf-warn">${esc(warn)}</p>` : ""}
  <fieldset class="cf-metals"><legend>Médailles demandées (3 métaux distincts max.)</legend>${["Bronze", "Argent", "Or"].map((m) => `<label><input type="checkbox" data-cf-metal="${m}" ${(f.metals || []).includes(m) ? "checked" : ""}/> ${m}</label>`).join("")}</fieldset>
  ${cfBtn("Ajouter le récipiendaire", "wiz-add-rec", "", "cf-accent")}`;
}

function cfCalendar(role) {
  const events = (cfS().ceremonies || []).filter((c) => {
    if (role === "demandeur") {
      const mine = cfVisibleDossiers().some((d) => (c.dossiers || []).includes(d.id)) || c.type === "officielle";
      return mine;
    }
    return true;
  });
  const offset = cfState.calOffset || 0;
  const ref = new Date(CF_TODAY.getFullYear(), CF_TODAY.getMonth() + offset, 1);
  const startDay = (ref.getDay() + 6) % 7;
  const days = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDay; i += 1) cells.push({ d: 0 });
  for (let d = 1; d <= days; d += 1) cells.push({ d, date: new Date(ref.getFullYear(), ref.getMonth(), d) });
  while (cells.length % 7) cells.push({ d: 0 });
  const months = "janvier février mars avril mai juin juillet août septembre octobre novembre décembre".split(" ");
  const selected = events.find((e) => e.id === cfState.selected) || events.find((e) => e.date === CF_TODAY_FR) || events[0] || null;
  const stClass = (e) => (e.status === "confirmée" ? "is-confirmed" : e.status === "tenue" ? "is-held" : "is-proposed");
  return `<section class="cf-paper">
    <div class="cf-cal-nav">
      ${cfBtn("Année préc.", "cal-year-prev", "", "cf-btn-ghost")}
      ${cfBtn("Mois préc.", "cal-prev", "", "cf-btn-ghost")}
      <strong>${months[ref.getMonth()]} ${ref.getFullYear()}</strong>
      ${cfBtn("Mois suiv.", "cal-next", "", "cf-btn-ghost")}
      ${cfBtn("Année suiv.", "cal-year-next", "", "cf-btn-ghost")}
    </div>
    <div class="ws-calendar"><div class="ws-calendar-grid cf-cal">${["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((w) => `<div class="ws-calendar-weekday">${w}</div>`).join("")}${cells.map((c) => {
      const key = c.date ? cfFormatFr(c.date) : "";
      const ev = events.filter((e) => e.date === key);
      const today = key === CF_TODAY_FR;
      return `<div class="ws-calendar-cell ${c.d ? "" : "is-other"} ${ev.length ? "" : "ws-empty-cell"} ${today ? "is-today" : ""}"><span class="ws-calendar-day">${c.d || ""}</span>${ev.map((e) => `<button type="button" class="ws-calendar-event ${stClass(e)}" data-cf-action="open-cer" data-id="${e.id}">${esc(e.type)}</button>`).join("")}</div>`;
    }).join("")}</div>
      <ul class="cf-cal-legend"><li><i class="is-proposed" style="background:#c9a227"></i>Proposées</li><li><i style="background:#009b62"></i>Confirmées</li><li><i style="background:#315c91"></i>Tenues</li></ul>
    </div>
    ${selected ? `<article class="cf-cer-detail">
      <header class="cf-consult-head"><p class="cf-eyebrow">${esc(selected.id)}</p><h2>${esc(selected.type)} · ${esc(selected.date)}</h2></header>
      <dl class="cf-facts cf-facts-rich">
        <div><dt>Lieu</dt><dd>${esc(selected.place)}</dd></div>
        <div><dt>Statut</dt><dd>${esc(selected.status)}</dd></div>
        <div><dt>Campagne</dt><dd>${esc(selected.campaign)}</dd></div>
        <div><dt>Dossiers</dt><dd>${esc((selected.dossiers || []).join(", ") || "—")}</dd></div>
      </dl>
      <p class="cf-muted">Localisation : schéma des villes de référence. Aucun fond cartographique externe n’est chargé.</p>
      ${cfPlaceView(selected.place)}
    </article>` : ""}
  </section>
  <section class="cf-paper"><h2>Liste</h2>${events.map((e) => `<button type="button" class="cf-row" data-cf-action="open-cer" data-id="${e.id}"><div><strong>${esc(e.date)} · ${esc(e.place)}</strong><small>${esc(e.type)} · ${esc(e.status)} · campagne ${esc(e.campaign)}</small></div></button>`).join("") || cfEmpty("Aucune cérémonie.", "calendar")}</section>`;
}

function cfSplit(list, detailFn, empty) {
  const sel = cfState.selected && list.find((x) => (x.id || x.mail && x.mail.id) === cfState.selected) || list[0];
  if (sel && !cfState.selected) cfState.selected = sel.id || (sel.mail && sel.mail.id);
  return `<div class="cf-split">
    <div class="cf-split-list">${list.length ? list.map((it) => {
      const id = it.id || (it.mail && it.mail.id);
      const title = it.title || (it.dossier && it.dossier.ref) || it.ref || id;
      const sub = it.sub || (it.mail && it.mail.type) || "";
      return `<button type="button" class="cf-split-item ${cfState.selected === id ? "is-on" : ""}" data-cf-action="select" data-id="${id}"><strong>${esc(title)}</strong><small>${esc(sub)}</small></button>`;
    }).join("") : cfEmpty(empty || "File vide.", "inbox")}</div>
    <div class="cf-split-detail">${sel ? detailFn(sel) : cfEmpty("Sélectionnez un élément.", "info")}</div>
  </div>`;
}

function cfSecMails(kind) {
  const level = cfLevelOf(cfRole());
  let mails = cfS().mails.filter((m) => m.level === level && m.phase === "secretariat");
  if (kind === "register") mails = mails.filter((m) => m.status === "a_enregistrer");
  if (kind === "transmit") mails = mails.filter((m) => m.status === "a_transmettre");
  return mails;
}
function cfSecInbox(kind) {
  const mode = kind || "box";
  const empty = mode === "register" ? "Aucun courrier à enregistrer." : mode === "transmit" ? "Aucun courrier à transmettre." : "Aucun courrier dans la boîte.";
  let items = cfSecMails(mode === "box" ? "" : mode).map((m) => ({ id: m.id, mail: m, dossier: cfFindDossier(m.dossierId), title: (cfFindDossier(m.dossierId) || {}).ref, sub: m.type + " · " + m.date + (m.status === "a_enregistrer" ? " · à enregistrer" : " · à transmettre") }));
  if (cfState.query) {
    const q = cfState.query.toLowerCase();
    items = items.filter((it) => ((it.title || "") + " " + (it.sub || "") + " " + ((it.mail && it.mail.internalRef) || "")).toLowerCase().includes(q));
  }
  const current = items.find((x) => x.id === cfState.selected) || items[0];
  const title = mode === "register" ? "Courriers à enregistrer" : mode === "transmit" ? "Courriers à transmettre" : "Registre des courriers";
  const table = typeof goTable === "function" ? goTable(
    [
      { label: "Dossier", cell: (it) => `<strong class="ref">${esc(it.title || "—")}</strong>` },
      { label: "Type", cell: (it) => esc(it.mail.type || "") },
      { label: "Date", cell: (it) => esc(it.mail.date || "") },
      { label: "Statut", cell: (it) => esc(it.mail.status === "a_enregistrer" ? "à enregistrer" : it.mail.status === "a_transmettre" ? "à transmettre" : (it.mail.status || "")) },
      { label: "Réf. interne", cell: (it) => esc(it.mail.internalRef || "non attribué") },
    ],
    items,
    { caption: title, empty, isOn: (it) => current && it.id === current.id, rowAttrs: (it) => `data-cf-action="select" data-id="${it.id}"` }
  ) : "";
  const detail = (() => {
    if (!current) return cfEmpty(empty);
    const d = current.dossier, m = current.mail;
    if (!d) return cfEmpty("Dossier introuvable.");
    const register = m.status === "a_enregistrer"
      ? cfBtn("Enregistrer le courrier", "confirm-on", `data-next="register-mail" data-id="${m.id}" data-summary="Enregistrement interne de ${d.ref}."`, "cf-accent")
      : m.status === "a_transmettre"
        ? cfBtn(m.type === "dossier" ? "Transmettre au Directeur régional" : "Transmettre à l’autorité", "confirm-on", `data-next="transmit" data-id="${m.id}" data-summary="${m.type === "dossier" ? "Confirmer la conformité formelle et transmettre " + d.ref + " au Directeur régional." : "Transmission à " + (CF_LEVEL_LABEL[m.level] || "") + "."}"`, "cf-accent")
        : "";
    return `<article class="cf-mail">
      <header><p class="cf-eyebrow">Courrier ${esc(m.type)}</p><h2>${esc(d.ref)}</h2>${cfBadge(d.status)}</header>
      <dl class="cf-facts cf-facts-rich">
        <div><dt>Date</dt><dd>${esc(m.date || "—")}</dd></div>
        <div><dt>Expéditeur</dt><dd>${esc((cfApplicant(d.applicantId) || {}).nom || "—")}</dd></div>
        <div><dt>Autorité</dt><dd>${esc(CF_LEVEL_LABEL[m.level] || "—")}</dd></div>
        <div><dt>Statut courrier</dt><dd>${esc(m.status || "—")}</dd></div>
        <div><dt>Référence interne</dt><dd>${esc(m.internalRef || "non attribué")}</dd></div>
      </dl>
      <h3>Pièces jointes</h3>${cfDocsList(d)}
      ${register}
      ${cfExplain("Le secrétariat enregistre et transmet. Il ne statue ni sur le dossier, ni sur un recours.")}
    </article>`;
  })();
  return `${typeof goHead === "function" ? goHead({ eyebrow: "Registre", title, sub: "Réception, classement et transmission — sans décider du dossier." }) : ""}
    ${typeof goKpis === "function" ? goKpis([{ label: "Courriers affichés", count: items.length, note: "ce secrétariat uniquement" }]) : ""}
    <section class="portal-paper">${typeof goToolbar === "function" ? goToolbar("Référence, type ou demandeur", `<span class="cf-count">${items.length} courrier${items.length > 1 ? "s" : ""}</span>`) : ""}
      ${table}</section>
    <section class="portal-paper">${detail}</section>`;
}

function cfAuthHome() {
  const q = {
    dossiers: cfAuthQueue(cfRole(), "dossier").length,
    recours: cfAuthQueue(cfRole(), "recours").length,
    relances: cfAuthQueue(cfRole(), "relance").length,
    ceremonies: cfAuthQueue(cfRole(), "ceremonie").length,
  };
  return cfDashCards([
    { label: "Dossiers à décider", value: q.dossiers, page: "dossiers" },
    { label: "Recours à statuer", value: q.recours, page: "recours" },
    { label: "Relances à traiter", value: q.relances, page: "relances" },
    { label: "Demandes de cérémonie", value: q.ceremonies, page: "ceremonies" },
  ]) + `<section class="cf-paper"><h2>Les plus anciens</h2>${cfAuthQueue(cfRole()).slice(0, 5).map((x) => `<button type="button" class="cf-row" data-cf-action="select" data-id="${x.mail.id}" data-action="ws-page" data-page="${x.mail.type === "dossier" ? "dossiers" : x.mail.type === "recours" ? "recours" : x.mail.type === "relance" ? "relances" : "ceremonies"}"><strong>${esc(x.dossier.ref)}</strong><small>${esc(x.mail.type)} · ${esc(x.mail.date)}</small></button>`).join("") || cfEmpty("File vide.")}</section>`;
}

function cfBureau(type) {
  const items = cfAuthQueue(cfState.spaceRole || cfRole(), type === "dossiers" ? "dossier" : type === "ceremonies" ? "ceremonie" : type.replace(/s$/, ""));
  let mapped = items.map((x) => ({ id: x.mail.id, mail: x.mail, dossier: x.dossier, title: x.dossier.ref, sub: x.mail.date + " · " + (cfApplicant(x.dossier.applicantId) || {}).sigle }));
  if (cfState.query) {
    const q = cfState.query.toLowerCase();
    mapped = mapped.filter((it) => ((it.title || "") + " " + (it.sub || "")).toLowerCase().includes(q));
  }
  const level = cfLevelOf();
  const heading = type === "dossiers" ? "Dossiers transmis et décisions" : type === "recours" ? "Recours" : type === "relances" ? "Relances" : "Demandes de cérémonie";
  const current = mapped.find((x) => x.id === cfState.selected) || mapped[0];
  const table = typeof goTable === "function" ? goTable(
    [
      { label: "Dossier", cell: (it) => `<strong class="ref">${esc(it.title)}</strong>` },
      { label: "Reçu le", cell: (it) => esc(it.mail.date || "") },
      { label: "Demandeur", cell: (it) => esc((cfApplicant(it.dossier.applicantId) || {}).sigle || "") },
      { label: "Statut", cell: (it) => cfBadge(it.dossier.status) },
      { label: "Étape", cell: (it) => typeof goStepper === "function" ? goStepper(it.dossier.status) : "" },
    ],
    mapped,
    { caption: heading, empty: "Rien dans cette file.", isOn: (it) => current && it.id === current.id, rowAttrs: (it) => `data-cf-action="select" data-id="${it.id}"` }
  ) : "";
  return `${typeof goHead === "function" ? goHead({ eyebrow: "File de votre niveau", title: heading, sub: "Uniquement les dossiers de votre autorité. Le Ministre et la DGT orientent ; le DR statue en première instance." }) : ""}
    ${typeof goKpis === "function" ? goKpis([{ label: "Dans cette file", count: mapped.length, note: "votre niveau uniquement" }]) : ""}
    <section class="portal-paper">
      ${typeof goToolbar === "function" ? goToolbar("Référence ou demandeur", `<span class="cf-count">${mapped.length} dans cette file</span>`) : ""}
      ${table}
    </section>
    <div class="cf-bureau cf-bureau-detail">
      <h2 class="sr-only">${esc(heading)}</h2>
      <div class="cf-bureau-read">${cfBureauRead(current, type, level)}</div>
      <aside class="cf-bureau-act">${cfBureauAct(current, type, level)}</aside>
    </div>`;
}
function cfBureauRead(it, type) {
  if (!it) return cfEmpty("Sélectionnez un dossier.");
  const d = it.dossier;
  const m = it.mail || {};
  const rec = d.recours || [];
  const rel = d.relances || [];
  return `<article class="cf-consult">
    <header class="cf-consult-head"><p class="cf-eyebrow">${esc(d.ref)}</p><h2>${esc((cfApplicant(d.applicantId) || {}).nom || "")}</h2>${cfBadge(d.status)}</header>
    ${cfDossierIdentite(d)}
    <dl class="cf-facts cf-facts-rich cf-mail-meta">
      <div><dt>Courrier</dt><dd>${esc(m.type || type || "—")}</dd></div>
      <div><dt>Reçu le</dt><dd>${esc(m.date || d.submitted || "—")}</dd></div>
    </dl>
    <h3>Circuit</h3>${cfCircuitHtml(d)}
    <h3>Récipiendaires</h3>
    <table class="cf-table"><thead><tr><th>Identité</th><th>Poste</th><th>Métal</th><th>Ancienneté</th></tr></thead><tbody>
      ${(d.recipients || []).map((r) => `<tr><td>${esc(r.prenom)} ${esc(r.nom)}</td><td>${esc(r.poste || "—")}</td><td>${esc((r.medals || []).map((x) => x.metal).join(", "))}</td><td>${esc(String(r.years != null ? r.years : cfYears(r.start)))} ans</td></tr>`).join("")}
    </tbody></table>
    <h3>Pièces</h3>${cfDocsList(d)}
    ${(d.indications || []).length ? `<h3>Indications</h3>${d.indications.map((i) => `<p class="cf-note">${esc(i.by)} : ${esc(i.text)}</p>`).join("")}` : ""}
    ${type === "recours" && rec.length ? `<h3>Recours</h3>${rec.map((r) => `<article class="cf-exch"><strong>${esc(r.motif)}</strong><small>${esc(r.date || "")} · ${esc(r.status)}</small></article>`).join("")}` : ""}
    ${type === "relances" && rel.length ? `<h3>Relances</h3>${rel.map((r) => `<article class="cf-exch"><strong>${esc(r.motif)}</strong><small>${esc(r.status)}</small></article>`).join("")}` : ""}
    <h3>Historique</h3><ul class="cf-hist">${(d.history || []).slice(-6).map(([dt, l]) => `<li><time>${esc(dt)}</time><span>${esc(l)}</span></li>`).join("") || "<li>Aucun événement.</li>"}</ul>
  </article>`;
}
function cfBureauAct(it, type, level) {
  if (!it) return "";
  const d = it.dossier;
  let actions = "";
  if (type === "dossiers") {
    if (level === "dr") {
      actions = `<h3>Décision de première instance</h3><label>Indications<textarea data-cf-field="indications">${esc(cfState.form.indications || "")}</textarea></label>
        ${cfBtn("Approuver", "confirm-on", `data-next="approve" data-id="${d.id}" data-summary="Le dossier ${d.ref} sera envoyé au Service des Distinctions."`, "cf-accent")}
        ${cfBtn("Rejeter", "revue-reject", `data-id="${d.id}"`, "cf-btn-ghost")}`;
    } else {
      actions = `<h3>Orientation</h3><p class="cf-muted">Vous transmettez avec indications. Vous n’instruisez pas à la place du Service.</p><textarea data-cf-field="indications">${esc(cfState.form.indications || "")}</textarea>
        ${cfBtn("Transmettre au niveau inférieur", "cascade", `data-id="${d.id}"`, "cf-accent")}`;
    }
  } else if (type === "recours") {
    actions = `<h3>Recours</h3><p>${esc(((d.recours || [])[0] || {}).motif || "")}</p>
      <label>Indications / assouplissement<textarea data-cf-field="indications"></textarea></label>
      ${cfBtn("Accepter", "recours-ok", `data-id="${d.id}"`, "cf-accent")}
      ${cfBtn("Rejeter", "revue-recours-no", `data-id="${d.id}"`, "cf-btn-ghost")}`;
  } else if (type === "relances") {
    actions = `<h3>Relance</h3>${cfBtn("Accepter", "relance-ok", `data-id="${d.id}"`, "cf-accent")}${cfBtn("Refuser", "relance-no", `data-id="${d.id}"`, "cf-btn-ghost")}`;
  } else {
    actions = `<h3>Cérémonie</h3>${cfBtn("Valider et transmettre au Service", "cer-ok", `data-id="${d.id}"`, "cf-accent")}`;
  }
  return `${actions}${cfVisaSlot()}`;
}

function cfInstructionQueue(role) {
  const r = role || cfRole();
  const items = [];
  cfS().dossiers.forEach((d) => {
    const cpl = (d.complements || []).filter((c) => c.status === "ouvert");
    const inspecteur = r === "service_inspecteur";
    if (inspecteur) {
      if (["EN_ETUDE", "APPROUVE", "ORDRE_EMIS", "PAYE"].includes(d.status)) {
        items.push({ d, key: "controle", label: "Contrôle documentaire, sans décision de validation", tone: "blue", since: d.submitted });
      }
      return;
    }
    if (d.status === "APPROUVE" && (!ipMay || ipMay(r, "start-study"))) {
      items.push({ d, key: "ouvrir", label: "Ouvrir l’instruction", tone: "blue", since: d.submitted });
    } else if (d.status === "EN_ETUDE" && (!ipMay || ipMay(r, "rec-ok"))) {
      items.push({ d, key: "verifier", label: "Vérification des récipiendaires et des pièces", tone: "blue", since: d.submitted });
    }
    if (cpl.length && (!ipMay || ipMay(r, "rec-ok") || ipMay(r, "flag-anomaly"))) {
      items.push({ d, key: "relancer", label: cpl.length + " complément(s) encore ouvert(s)", tone: "yellow", since: cpl[0].date });
    }
    if (d.status === "VALIDE" && !d.order && ipMay && ipMay(r, "issue-order")) {
      items.push({ d, key: "recette", label: "Ordre de recette à émettre — distinct du paiement", tone: "blue", since: d.submitted });
    }
  });
  return items;
}

function cfInstruction() {
  const role = cfState.spaceRole || cfRole();
  const all = cfInstructionQueue(role);
  const counts = { "": all.length };
  all.forEach((i) => { counts[i.key] = (counts[i.key] || 0) + 1; });
  let items = all;
  if (cfState.filter) items = items.filter((i) => i.key === cfState.filter || i.d.status === cfState.filter);
  if (cfState.query) {
    const q = cfState.query.toLowerCase();
    items = items.filter((i) => i.d.ref.toLowerCase().includes(q) || (typeof ipApplicantName === "function" ? ipApplicantName(i.d.applicantId) : "").toLowerCase().includes(q));
  }
  const selectedId = cfState.selected || (items[0] && items[0].d.id);
  const d = cfFindDossier(selectedId) || (items[0] && items[0].d);
  const decided = d ? (d.recipients || []).filter((r) => (r.medals || []).every((m) => m.status !== "EN_ATTENTE")).length : 0;
  const tot = d ? (d.recipients || []).length : 0;
  const chipItems = [{ key: "", label: "Toutes les actions", n: counts[""] || 0 }].concat(
    [["ouvrir", "À ouvrir"], ["verifier", "À vérifier"], ["controle", "À contrôler"], ["relancer", "Compléments"], ["recette", "Ordre de recette"]]
      .filter(([k]) => counts[k]).map(([k, l]) => ({ key: k, label: l, n: counts[k] }))
  );
  const table = typeof goTable === "function" ? goTable(
    [
      { label: "Dossier", cell: (i) => `<strong class="ref">${esc(i.d.ref)}</strong><br>${cfBadge(i.d.status)}` },
      { label: "Demandeur", cell: (i) => esc(typeof ipApplicantName === "function" ? ipApplicantName(i.d.applicantId) : i.d.applicantId) },
      { label: "Action attendue", cell: (i) => esc(i.label) },
      { label: "Depuis", cell: (i) => (typeof goAgeDays === "function" ? goAgeDays(i.since) : 0) + " j" },
      { label: "Étape", cell: (i) => (typeof goStepper === "function" ? goStepper(i.d.status) : "") },
      { label: "Traiter", cell: (i) => cfBtn("Traiter", "select", `data-id="${i.d.id}"`, "cf-tiny") },
    ],
    items,
    { id: "if-table", caption: "File d’instruction", empty: "Aucune action en attente pour ce profil.", isOn: (i) => d && i.d.id === d.id, rowAttrs: (i) => `data-cf-action="select" data-id="${i.d.id}" data-ref="${esc(i.d.ref)}"` }
  ) : "";
  return `${typeof goHead === "function" ? goHead({ eyebrow: "Instruction", title: "File d’instruction", sub: "Dossiers qui attendent une action de votre part, classés par urgence. Chaque action s’effectue dans la fiche, selon votre rôle." }) : ""}
    <section class="go-card card">${typeof goKpis === "function" ? goKpis([
      { label: "Actions de mon ressort", count: all.length, note: "dossiers visibles avec ce profil" },
      { label: "Urgentes (plus de 15 jours)", count: all.filter((i) => (typeof goAgeDays === "function" ? goAgeDays(i.since) : 0) >= 15).length, note: "délais à surveiller" },
      { label: "Compléments en attente", count: counts.relancer || 0, note: "réponses du demandeur attendues" },
      { label: "À instruire / contrôler", count: (counts.ouvrir || 0) + (counts.verifier || 0) + (counts.controle || 0), note: "file active" },
    ]) : ""}</section>
    <section class="go-card card mt">
      ${typeof goToolbarFull === "function" ? goToolbarFull({ search: { id: "if-q", label: "Rechercher", placeholder: "Référence, organisme…", value: cfState.query }, selects: [{ id: "if-sort", label: "Trier par", key: "sort", value: cfState.sort || "urgence", options: [{ value: "urgence", label: "Urgence (ancienneté de l’action)" }, { value: "old", label: "Date de dépôt" }, { value: "ref", label: "Référence" }] }] }) : goToolbar("Référence ou demandeur")}
      ${typeof goFilterBar === "function" ? goFilterBar(typeof goChips === "function" ? goChips(chipItems, cfState.filter || "", { id: "if-chips", label: "Filtrer par action" }) : "", `<span id="if-count"><strong>${items.length}</strong> ${items.length > 1 ? "dossiers affichés" : "dossier affiché"}</span>`) : ""}
      ${table}<div id="if-empty"></div>
    </section>
    <section class="go-card card mt">${d ? cfInstructionFiche(d, decided, tot) : cfEmpty("Aucun dossier.")}</section>`;
}
function cfInstructionFiche(d, decided, tot) {
  return `<div class="cf-instr">
    <header><h2>${esc(d.ref)}</h2>${cfBadge(d.status)}
      ${cfDossierIdentite(d)}
      ${cfCircuitHtml(d)}
      <p>Localisation : ${esc(d.location || "—")}${(typeof ipMay === "function" && !ipMay(cfRole(), "start-study")) ? "" : " " + cfBtn("Modifier", "set-loc", `data-id="${d.id}"`, "cf-tiny")}</p>
      <div class="cf-gauge"><span>${decided} sur ${tot} récipiendaires décidés</span><i style="width:${tot ? (decided / tot * 100) : 0}%"></i></div>
      ${(typeof ipMay === "function" && !ipMay(cfRole(), "finish-instr")) ? "" : cfBtn("Terminer l’instruction", "finish-instr", `data-id="${d.id}"`, decided === tot && tot ? "cf-accent" : "cf-btn-ghost")}
    </header>
    <table class="cf-table"><thead><tr><th>Nom</th><th>Ancienneté</th><th>Proposée</th><th>Éligible</th><th>Contrôle</th><th>Statut</th><th></th></tr></thead><tbody>
      ${(d.recipients || []).map((r) => {
        const years = r.years || cfYears(r.start);
        const elig = cfEligibleMedal(years, r.assouplissement === "mutilation");
        const metal = (r.medals || [])[0] || { metal: "Bronze", status: "EN_ATTENTE" };
        const ctrl = years < 10 && !r.assouplissement ? "Sous le seuil" : "OK";
        return `<tr>
          <td><button type="button" class="cf-inline" data-cf-action="panel-rec" data-id="${d.id}" data-rid="${r.id}">${esc(r.prenom)} ${esc(r.nom)}</button></td>
          <td>${years} ans</td><td>${esc(metal.metal)}</td><td>${esc(elig || "—")}</td><td>${esc(ctrl)}</td><td>${cfBadge(metal.status)}</td>
          <td class="cf-row-act">${(typeof ipMay === "function" && !ipMay(cfRole(), "rec-ok"))
            ? cfBtn("Signaler", "flag-anomaly", `data-id="${d.id}" data-rid="${r.id}"`, "cf-tiny")
            : cfBtn("Valider", "rec-ok", `data-id="${d.id}" data-rid="${r.id}"`, "cf-tiny") + cfBtn("Refuser", "rec-no", `data-id="${d.id}" data-rid="${r.id}"`, "cf-tiny") + cfBtn("Complément", "panel-ask-cpl", `data-id="${d.id}" data-rid="${r.id}"`, "cf-tiny")}</td>
        </tr>`;
      }).join("")}
    </tbody></table>
    <h3>Fil des compléments</h3>${(d.complements || []).map((c) => `<p>${esc(c.date)} — ${esc(c.objet)} — ${esc(c.status)}${c.reponse ? " · réponse reçue" : ""}</p>`).join("") || "<p class='cf-muted'>Aucun.</p>"}
  </div>`;
}

function cfNotifyPage() {
  const rows = cfS().dossiers.filter((d) => d.status === "EN_ETUDE" && (d.readyNotify || ((d.recipients || []).every((r) => (r.medals || []).every((m) => m.status !== "EN_ATTENTE")) && !d.notified)));
  const d = cfFindDossier(cfState.selected) || rows[0];
  return `<div class="cf-split">
    <div class="cf-split-list">${rows.map((x) => `<button type="button" data-cf-action="select" data-id="${x.id}" class="${d && d.id === x.id ? "is-on" : ""}">${esc(x.ref)}</button>`).join("") || cfEmpty("Rien à notifier.")}</div>
    <div class="cf-split-detail">${d ? `<h2>Aperçu de la liste — ${esc(d.ref)}</h2>
      <ul>${(d.recipients || []).map((r) => `<li>${esc(r.prenom)} ${esc(r.nom)} — ${(r.medals || []).map((m) => m.status + (m.motif ? " (" + m.motif + ")" : "")).join(", ")}</li>`).join("")}</ul>
      <p>Ce qui sera envoyé : la liste des validés, avec les motifs des refus. Destinataire : ${(cfApplicant(d.applicantId) || {}).nom}.</p>
      ${cfBtn("Notifier le demandeur", "confirm-on", `data-next="notify-list" data-id="${d.id}" data-summary="La liste sera envoyée au demandeur."`, "cf-accent")}` : ""}</div>
  </div>`;
}

function cfOrdersPage() {
  if ((cfState.spaceRole || cfRole()) === "regisseur") return cfPurchasePage();
  const rows = cfS().dossiers.filter((d) => d.status === "VALIDE" && !d.order);
  const d = cfFindDossier(cfState.selected) || rows[0];
  const w = cfState.wizard;
  if (cfState.revue === "order" && d) return cfOrderRevue(d);
  return `<div class="cf-split"><div class="cf-split-list">${rows.map((x) => `<button type="button" data-cf-action="select" data-id="${x.id}" class="${d && d.id === x.id ? "is-on" : ""}">${esc(x.ref)}</button>`).join("") || cfEmpty("Aucun ordre à émettre.")}</div>
    <div class="cf-split-detail">${d ? cfOrderWizard(d, w) : ""}</div></div>`;
}
function cfOrderWizard(d, w) {
  const lines = [];
  (d.recipients || []).forEach((r) => (r.medals || []).filter((m) => m.status === "VALIDE").forEach((m) => lines.push({ name: r.prenom + " " + r.nom, metal: m.granted || m.metal, medal: CF_TARIFFS[m.granted || m.metal], diplome: CF_TARIFFS.diplome })));
  const amount = lines.reduce((s, l) => s + l.medal + l.diplome, 0);
  const step = w.orderStep || 1;
  if (step === 1) return `<h2>1. Montant</h2><table class="cf-table"><thead><tr><th>Récipiendaire</th><th>Métal</th><th>Médaille</th><th>Diplôme</th></tr></thead><tbody>${lines.map((l) => `<tr><td>${esc(l.name)}</td><td>${esc(l.metal)}</td><td>${esc(cfMoney(l.medal))}</td><td>${esc(cfMoney(l.diplome))}</td></tr>`).join("")}</tbody></table><p><strong>Total ${esc(cfMoney(amount))}</strong></p>${cfBtn("Voir l’aperçu", "order-step", "data-step=\"2\"", "cf-accent")}`;
  if (step === 2) return `<h2>2. Aperçu</h2><p>Ordre OR-${esc(d.ref.replace("DNG-", ""))} · ${esc(CF_TODAY_FR)} · ${esc(cfMoney(amount))}</p>${cfBtn("Visa, cachet, signature", "order-step", "data-step=\"3\"", "cf-accent")}`;
  if (step === 3) return `<h2>3. Visa, cachet, signature</h2><p>Les composants sont disponibles sur le document généré.</p>${cfBtn("Page de revue", "order-revue", `data-id="${d.id}"`, "cf-accent")}`;
  return "";
}
function cfOrderRevue(d) {
  const app = cfApplicant(d.applicantId);
  return `<section class="cf-revue">
    <h2>Revue — émettre l’ordre</h2>
    <div class="cf-three">
      <article><h3>Ce que vous allez faire</h3><p>Émettre l’ordre de recette du dossier ${esc(d.ref)}.</p></article>
      <article><h3>Qui sera prévenu</h3><p>${esc(app ? app.nom : "")} (demandeur) et le régisseur.</p></article>
      <article><h3>Ce qui change</h3><p>Le dossier passe à ORDRE_EMIS.</p></article>
    </div>
    ${cfBtn("Confirmer l’émission", "issue-order", `data-id="${d.id}"`, "cf-accent")}${cfBtn("Annuler", "revue-off", "", "cf-btn-ghost")}
  </section>`;
}

function cfServiceHome() {
  const s = cfS();
  const instr = s.dossiers.filter((d) => ["APPROUVE", "EN_ETUDE"].includes(d.status) && !d.notified).length;
  const cpl = s.dossiers.reduce((n, d) => n + (d.complements || []).filter((c) => c.status === "ouvert").length, 0);
  const notif = s.dossiers.filter((d) => d.status === "EN_ETUDE" && !d.notified && (d.recipients || []).every((r) => (r.medals || []).every((m) => m.status !== "EN_ATTENTE"))).length;
  const ord = s.dossiers.filter((d) => d.status === "VALIDE" && !d.order).length;
  const cer = s.dossiers.filter((d) => d.ceremonyRequest && d.ceremonyRequest.status === "validee").length;
  const rel = s.dossiers.filter((d) => (d.relances || []).some((r) => r.status === "ACCEPTEE")).length;
  const st = s.stats.campaign;
  return cfDashCards([
    { label: "Dossiers à instruire", value: instr, page: "instruction" },
    { label: "Compléments en attente", value: cpl, page: "instruction" },
    { label: "Listes à notifier", value: notif, page: "notify" },
    { label: "Ordres à émettre", value: ord, page: "orders" },
    { label: "Cérémonies à organiser", value: cer, page: "cer-demandes" },
    { label: "Relances acceptées", value: rel, page: "relances" },
  ]) + `<section class="cf-paper"><h2>Campagne ${esc(st.year)}</h2><p>${st.submitted} soumis · ${st.validated} validés · Or ${st.or} · Argent ${st.argent} · Bronze ${st.bronze}</p></section>`;
}

function cfRegHome() {
  const s = cfS();
  const need = { Or: 0, Argent: 0, Bronze: 0 };
  s.dossiers.filter((d) => ["VALIDE", "ORDRE_EMIS", "PAYE"].includes(d.status)).forEach((d) => {
    (d.recipients || []).forEach((r) => (r.medals || []).filter((m) => m.status === "VALIDE" && !r.remis).forEach((m) => { const k = m.granted || m.metal; need[k] = (need[k] || 0) + 1; }));
  });
  const qui = s.dossiers.filter((d) => d.status === "ORDRE_EMIS" && d.quittance).length;
  const ret = s.withdrawals.filter((w) => w.status === "en attente").length;
  const cmd = s.purchaseOrders.filter((o) => o.status === "en cours").length;
  return `<div class="cf-stock-cards">${["Or", "Argent", "Bronze"].map((m) => `<article class="cf-stock-card"><small>${m}</small><strong>${s.stock[m]}</strong><span>Besoin estimé ${need[m] || 0}</span>${(s.stock[m] || 0) < (need[m] || 0) ? "<em>Alerte stock</em>" : ""}</article>`).join("")}</div>
    ${cfDashCards([
      { label: "Quittances à vérifier", value: qui, page: "remises" },
      { label: "Retraits à contrôler", value: ret, page: "retraits" },
      { label: "Commandes en cours", value: cmd, page: "orders" },
    ])}`;
}

function cfGuichet() {
  const rows = cfS().dossiers.filter((d) => d.status === "ORDRE_EMIS" && d.quittance);
  const d = cfFindDossier(cfState.selected) || rows[0];
  const step = cfState.wizard.remiseStep || 1;
  if (!d) return `${typeof goHead === "function" ? goHead({ eyebrow: "Guichet", title: "Remises", sub: "Après quittance conforme — les diplômes restent au Ministère jusqu’à la cérémonie." }) : ""}${cfEmpty("Aucune quittance à vérifier.")}`;
  const table = typeof goTable === "function" ? goTable(
    [
      { label: "Dossier", cell: (x) => `<strong class="ref">${esc(x.ref)}</strong>` },
      { label: "Quittance", cell: (x) => esc((x.quittance && x.quittance.numero) || "") },
      { label: "Montant", cell: (x) => esc(cfMoney((x.quittance && x.quittance.montant) || 0)) },
    ],
    rows,
    { caption: "Quittances à vérifier", isOn: (x) => x.id === d.id, rowAttrs: (x) => `data-cf-action="select" data-id="${x.id}"` }
  ) : "";
  return `${typeof goHead === "function" ? goHead({ eyebrow: "Guichet", title: "Remises", sub: "Après quittance conforme — les diplômes restent au Ministère jusqu’à la cérémonie." }) : ""}
    <section class="portal-paper">${table}</section>
    <div class="cf-guichet">
    <div>
      <ol class="cf-steps"><li class="${step === 1 ? "is-now" : "is-done"}">1. Vérifier</li><li class="${step === 2 ? "is-now" : step > 2 ? "is-done" : ""}">2. Retirant</li><li class="${step === 3 ? "is-now" : ""}">3. Confirmer</li></ol>
      ${step === 1 ? `<div class="cf-three">
        <article><h3>Quittance scannée</h3><p>${esc(d.quittance.numero)} · ${esc(cfMoney(d.quittance.montant))} · ${esc(d.quittance.date)}</p></article>
        <article><h3>Ordre de recette</h3><p>${esc(d.order.ref)} · ${esc(cfMoney(d.order.amount))}</p></article>
        <article><h3>Dossier</h3><ul>${(d.recipients || []).map((r) => `<li>${esc(r.prenom)} ${esc(r.nom)} — ${(r.medals || []).map((m) => m.granted || m.metal).join(", ")}</li>`).join("")}</ul></article>
      </div>${cfBtn("Quittance conforme", "qui-ok", `data-id="${d.id}"`, "cf-accent")}${cfBtn("Non conforme", "qui-no", `data-id="${d.id}"`, "cf-btn-ghost")}` : ""}
      ${step === 2 ? `<div class="cf-grid2">
        <label>Nom du retirant<input data-cf-field="retirant" value="${esc(cfState.form.retirant || "")}" /></label>
        <label>Prénom<input data-cf-field="retirantP" value="${esc(cfState.form.retirantP || "")}" /></label>
        <label>Qualité<select data-cf-field="qualite"><option>Représentant du demandeur</option><option>Employé</option><option>Mandataire</option><option>Autre</option></select></label>
        <label>Pièce d’identité<input data-cf-field="piece" value="${esc(cfState.form.piece || "")}" /></label>
      </div>
      <fieldset>${(d.recipients || []).flatMap((r) => (r.medals || []).filter((m) => m.status === "VALIDE").map((m) => `<label><input type="checkbox" data-cf-metal="${m.granted || m.metal}" checked /> ${esc(r.prenom)} ${esc(r.nom)} — ${esc(m.granted || m.metal)}</label>`)).join("")}</fieldset>
      ${cfExplain("Les diplômes restent au Ministère jusqu’à la cérémonie.")}
      ${cfBtn("Revue finale", "remise-revue", `data-id="${d.id}"`, "cf-accent")}` : ""}
      ${step === 3 ? `<section class="cf-revue"><h2>Revue — confirmer la remise</h2>
        <div class="cf-three"><article><h3>Ce que vous allez faire</h3><p>Enregistrer la remise pour ${esc(d.ref)}.</p></article>
        <article><h3>Qui sera prévenu</h3><p>Le demandeur.</p></article>
        <article><h3>Ce qui change</h3><p>Le stock diminue. Le dossier passe à MEDAILLES_REMISES si tout est remis.</p></article></div>
        ${cfBtn("Confirmer la remise", "do-remise", `data-id="${d.id}"`, "cf-accent")}</section>` : ""}
    </div>
  </div>`;
}

function cfStockPage() {
  const s = cfS();
  const table = typeof goTable === "function" ? goTable(
    [
      { label: "Date", cell: (m) => esc(m.date) },
      { label: "Métal", cell: (m) => esc(m.metal) },
      { label: "Sens", cell: (m) => esc(m.sens) },
      { label: "Qté", cell: (m) => String(m.qty) },
      { label: "Motif", cell: (m) => esc(m.motif) },
      { label: "Agent", cell: (m) => esc(m.agent) },
    ],
    s.movements,
    { caption: "Mouvements de stock", empty: "Aucun mouvement." }
  ) : "";
  return `${typeof goHead === "function" ? goHead({ eyebrow: "Magasin", title: "Stock des médailles", sub: "Entrées, sorties et ajustements — distinct des ordres de recette." }) : ""}
    ${typeof goKpis === "function" ? goKpis(["Or", "Argent", "Bronze"].map((m) => ({ label: m, count: s.stock[m], note: "unités" }))) : `<div class="cf-stock-cards">${["Or", "Argent", "Bronze"].map((m) => `<article class="cf-stock-card"><small>${m}</small><strong>${s.stock[m]}</strong>${cfBtn("Ajuster", "panel-stock", `data-metal="${m}"`, "cf-tiny")}</article>`).join("")}</div>`}
    <p class="page-actions">${["Or", "Argent", "Bronze"].map((m) => cfBtn("Ajuster " + m, "panel-stock", `data-metal="${m}"`, "cf-tiny")).join(" ")}</p>
    <section class="portal-paper"><h2>Historique des mouvements</h2>${table}</section>`;
}

function cfRetraits() {
  const list = cfS().withdrawals;
  const w = list.find((x) => x.id === cfState.selected) || list[0];
  const table = typeof goTable === "function" ? goTable(
    [
      { label: "Suivi", cell: (x) => `<strong class="ref">${esc(x.tracking)}</strong>` },
      { label: "Demandeur", cell: (x) => esc((x.prenom || "") + " " + (x.nom || "")) },
      { label: "Statut", cell: (x) => esc(x.status || "") },
      { label: "Campagne", cell: (x) => esc(x.campaign || "") },
    ],
    list,
    { caption: "Demandes de retrait", empty: "Aucune demande.", isOn: (x) => w && x.id === w.id, rowAttrs: (x) => `data-cf-action="select" data-id="${x.id}"` }
  ) : "";
  const fiche = !w ? cfEmpty("Aucune demande.") : `<h2>${esc(w.tracking)}</h2>${cfBadge(w.status === "en attente" ? "EN_ATTENTE" : w.status === "autorise" ? "ACCEPTEE" : "REFUSEE")}
      <p>${esc(w.prenom)} ${esc(w.nom)} · CNI ${esc(w.cni)} · ${esc(w.structure)} · ${esc(w.campaign)}</p>
      <p>Retirant : ${esc(w.retirantPrenom)} ${esc(w.retirantNom)} (${esc(w.lien)})</p>
      ${cfBtn("Justificatif valide", "wd-ok", `data-id="${w.id}"`, "cf-accent")}${cfBtn("Justificatif invalide", "wd-no", `data-id="${w.id}"`, "cf-btn-ghost")}`;
  return `${typeof goHead === "function" ? goHead({ eyebrow: "Contrôle", title: "Retraits", sub: "Vérification des justificatifs — sans valider une médaille." }) : ""}
    <section class="portal-paper">${table}</section>
    <section class="portal-paper">${fiche}</section>`;
}

function cfEmploye() {
  const w = cfState.wizard;
  if (cfState.selected || w.tracking) {
    const rec = cfS().withdrawals.find((x) => x.tracking === (w.tracking || cfState.form.tracking));
    return `<section class="cf-center"><h2>Suivi de ma demande</h2>
      <label>Numéro de suivi<input data-cf-field="tracking" value="${esc(w.tracking || "")}" /></label>${cfBtn("Voir", "wd-suivi", "", "cf-accent")}
      ${rec ? `<div class="cf-paper"><p>État : <strong>${esc(rec.status)}</strong></p>${rec.status === "autorise" ? `<p>${esc(rec.lieu)}</p>` : ""} ${rec.status === "refuse" ? `<p>Motif : ${esc(rec.motif || "")}</p>` : ""}
        <ol class="cf-frise"><li class="is-done">Déposée</li><li class="${rec.status !== "en attente" ? "is-now" : ""}">${rec.status === "autorise" ? "Autorisée" : rec.status === "refuse" ? "Refusée" : "Vérification"}</li></ol></div>` : ""}
    </section>`;
  }
  return `<section class="cf-center">
    <ol class="cf-steps"><li class="${(w.wdStep || 1) === 1 ? "is-now" : "is-done"}">Identité</li><li class="${(w.wdStep || 1) === 2 ? "is-now" : (w.wdStep || 1) > 2 ? "is-done" : ""}">Pièces</li><li class="${(w.wdStep || 1) === 3 ? "is-now" : ""}">Envoi</li></ol>
    ${(w.wdStep || 1) === 1 ? `<div class="cf-grid2">
      <label>CNI du récipiendaire<input data-cf-field="cni" /></label><label>Nom<input data-cf-field="nom" /></label>
      <label>Prénom<input data-cf-field="prenom" /></label><label>Structure<input data-cf-field="structure" /></label>
      <label>Campagne<input data-cf-field="campaign" value="2026" /></label>
      <label>Retirant nom<input data-cf-field="retirantNom" /></label><label>Retirant prénom<input data-cf-field="retirantPrenom" /></label>
      <label>Lien<select data-cf-field="lien"><option>lui-même</option><option>mandataire</option></select></label>
    </div>${cfBtn("Pièces", "wd-step", "data-step=\"2\"", "cf-accent")}` : ""}
    ${(w.wdStep || 1) === 2 ? `<p>${cfBtn("Joindre le justificatif d’identité", "fake-wd", "data-field=\"id\"", "cf-btn-ghost")} ${cfBtn("Joindre le mandat", "fake-wd", "data-field=\"mandat\"", "cf-btn-ghost")}</p>${cfBtn("Envoi", "wd-step", "data-step=\"3\"", "cf-accent")}` : ""}
    ${(w.wdStep || 1) === 3 ? `<p>Envoyer la demande. Un numéro de suivi sera affiché.</p>${cfBtn("Envoyer", "wd-send", "", "cf-accent")}` : ""}
  </section>`;
}

function cfStatsPage() {
  const st = cfS().stats.campaign;
  const c25 = cfS().campaigns.find((c) => c.year === "2025");
  const by = {};
  cfS().dossiers.forEach((d) => { by[d.status] = (by[d.status] || 0) + 1; });
  const medals = [["Or", st.or], ["Argent", st.argent], ["Bronze", st.bronze]];
  const maxM = Math.max(1, ...medals.map((m) => m[1] || 0));
  const chart = `<div class="go-bars" role="img" aria-label="Médailles de la campagne">${medals.map(([l, v]) => `<div class="go-bar"><span>${esc(l)}</span><i style="width:${Math.round((v || 0) / maxM * 100)}%"></i><strong>${v}</strong></div>`).join("")}</div>`;
  return `${typeof goHead === "function" ? goHead({ eyebrow: "Pilotage", title: "Statistiques", sub: "Volumes du magasin interne — pas le seed du prototype." }) : ""}
    ${typeof goKpis === "function" ? goKpis([
      { label: "Soumis", count: st.submitted, note: "campagne " + (st.year || "") },
      { label: "Validés", count: st.validated, note: "décisions d’attribution" },
      { label: "Montant des ordres", value: cfMoney(st.amount), note: "ordre ≠ paiement Trésor" },
    ]) : ""}
    ${typeof goPipeline === "function" ? goPipeline(by, "instruction") : ""}
    <section class="portal-paper"><h2>Médailles de la campagne</h2>${chart}</section>
    <section class="portal-paper"><h2>Classements</h2><p>Demandeur le plus distingué : ${esc(cfS().stats.rankings.topApplicant)} · Médaille la plus distribuée : ${esc(cfS().stats.rankings.topMedal)}</p></section>
    <section class="portal-paper"><h2>Comparaison 2025</h2>${c25 && c25.archive ? `<p>Soumis ${c25.archive.submitted} · validés ${c25.archive.validated} · montant ${esc(cfMoney(c25.archive.amount))}</p>${cfBtn("Générer le rapport PDF", "fake-pdf", "", "cf-btn-ghost")}` : ""}</section>`;
}

function cfProfile() {
  const u = cfUser();
  const app = cfApplicant(cfApplicantId());
  return `<section class="cf-paper">
    <h2>Profil et paramètres</h2>
    <p>${esc(u ? u.prenom + " " + u.nom : "Compte")}</p>
    ${app ? `<dl class="cf-facts"><div><dt>Structure</dt><dd>${esc(app.nom)}</dd></div><div><dt>Type</dt><dd>${esc(app.type)}</dd></div><div><dt>NIF</dt><dd>${esc(app.nif)}</dd></div><div><dt>Adresse</dt><dd>${esc(app.adresse)}</dd></div></dl>` : ""}
    <label class="cf-check"><input type="checkbox" checked /> Recevoir les notifications aussi par e-mail</label>
  </section>`;
}
function cfSigProfil() {
  const u = cfUser();
  const sig = cfS().signatures.find((s) => s.userId === (u && u.id));
  const st = cfS().stamps.find((s) => (s.agents || []).includes(u && u.id));
  return `<section class="cf-paper">
    <h2>Ma signature</h2>
    <p>Statut : ${sig ? cfBadge(sig.status) : "Aucune"}</p>
    ${cfBtn("Déposer une image PNG", "sig-upload", "", "cf-btn-ghost")}
    ${cfState.form.sigWait ? `<p>Code envoyé. Saisissez-le pour valider. <input data-cf-field="sigCode" maxlength="6" /> ${cfBtn("Valider le code", "sig-code", "", "cf-accent")}</p>` : ""}
    <h2>Mon visa</h2>${cfBtn("Déposer un paraphe", "visa-upload", "", "cf-btn-ghost")}
    <h2>Mon cachet</h2><p>${st ? esc(st.libelle) : "Aucun cachet rattaché."}</p>
  </section>`;
}

function cfViewer() {
  const v = cfState.viewer;
  const doc = v.id ? cfS().documents.find((d) => d.id === v.id) : { name: v.name || "Document", signStatus: "NON_SIGNE", visas: [], sealed: false, origin: "téléversé", format: "PDF", date: CF_TODAY_FR, pages: 1 };
  if (doc && v.id && !cfCanOpenDoc(doc) && cfRole() === "admin") {
    return `<div class="cf-viewer"><p>Vous n’avez pas accès à ce document.</p>${cfBtn("Fermer", "view-off", "", "cf-accent")}</div>`;
  }
  const tab = v.tab || "infos";
  const r = cfRole();
  const canVisa = ["ministre", "dgt", "dr", "service_chef"].includes(r);
  const canTx = canVisa || r === "service_agent";
  return `<div class="cf-viewer" role="dialog" aria-modal="true">
    <header>
      <strong>${esc(doc.name)}</strong>
      <div>${cfBtn("Télécharger", "dl-doc", `data-id="${doc.id || ""}"`, "cf-btn-ghost")}${canTx ? cfBtn("Transmettre", "panel-tx", `data-id="${doc.id || ""}"`, "cf-btn-ghost") : ""}${canVisa ? cfBtn("Viser", "visa-doc", `data-id="${doc.id || ""}"`, "cf-tiny") + cfBtn("Cacheter", "stamp-doc", `data-id="${doc.id || ""}"`, "cf-tiny") + cfBtn("Signer", "sign-doc", `data-id="${doc.id || ""}"`, "cf-tiny") : ""}${cfBtn("Fermer", "view-off", "", "cf-icon-btn")}</div>
    </header>
    ${doc.sealed ? `<div class="cf-seal-banner">Document scellé, non modifiable. ${cfBtn("Créer une nouvelle version", "doc-version", `data-id="${doc.id || ""}"`, "cf-tiny")}</div>` : ""}
    <div class="cf-viewer-grid">
      <div class="cf-preview">${icon("document", "size-8")}<p>Aperçu · ${esc(doc.format)} · ${doc.pages || 1} page(s)</p></div>
      <aside>
        <div class="cf-tabs">${[["infos", "Infos"], ["tx", "Transmissions"], ["sig", "Visas et signature"]].map(([k, l]) => `<button type="button" data-cf-action="view-tab" data-tab="${k}" class="${tab === k ? "is-on" : ""}">${l}</button>`).join("")}</div>
        ${tab === "infos" ? `<dl class="cf-facts"><div><dt>Origine</dt><dd>${esc(doc.origin || "")}</dd></div><div><dt>Date</dt><dd>${esc(doc.date || "")}</dd></div><div><dt>Signature</dt><dd>${esc(CF_STATUS_LABEL[doc.signStatus] || doc.signStatus || "")}</dd></div><div><dt>Numéro</dt><dd>${esc(doc.numero || "—")}</dd></div><div><dt>Cachet</dt><dd>${esc(doc.cachet || "—")}</dd></div></dl>` : ""}
        ${tab === "sig" ? `<ul>${(doc.visas || []).map((v) => `<li>Visa ${v.rang} — ${esc(v.name)} · ${esc(v.date)}</li>`).join("") || "<li>Aucun visa</li>"}</ul>
          ${doc.pendingNumber ? `<p>En attente de numérotation. ${cfBtn("Ajouter le numéro", "add-num", `data-id="${doc.id}"`, "cf-accent")}</p>` : ""}
          ${doc.signStatus === "SIGNE_VISUELLEMENT" && !doc.pendingNumber ? cfBtn("Finaliser et sceller", "seal-doc", `data-id="${doc.id}"`, "cf-accent") : ""}` : ""}
        ${tab === "tx" ? "<p class='cf-muted'>Historique des transmissions de ce document.</p>" : ""}
      </aside>
    </div>
  </div>`;
}

function cfNoticeKind(n) {
  if (n && n.kind) return n.kind;
  const t = String((n && n.text) || "").toLowerCase();
  if (/complément/.test(t)) return "complement";
  if (/document|pièce|justificatif|quittance/.test(t)) return "document";
  if (/retrait/.test(t)) return "retrait";
  if (/anomal/.test(t)) return "anomalie";
  if (/transmi|mise à jour/.test(t)) return "maj";
  if (/contrôl/.test(t)) return "controle";
  return "dossier";
}
function cfNoticeIconName(kind) {
  return ({ complement: "upload", document: "document", retrait: "users", anomalie: "alert", maj: "refresh", controle: "clipboard", dossier: "folder" })[kind] || "bell";
}
function cfNoticeTitle(n) {
  if (n && n.title) return n.title;
  const text = String((n && n.text) || "");
  const cut = text.split(" — ")[0].split(".")[0];
  return cut || "Avis";
}
function cfNotificationsPage() {
  const all = cfMyNotices();
  const unread = all.filter((n) => !n.read).length;
  const filter = cfState.filter === "unread" || cfState.filter === "non lues" ? "unread" : "";
  let list = filter === "unread" ? all.filter((n) => !n.read) : all.slice();
  const empty = filter
    ? cfEmpty("Aucun avis non lu.", "bell")
    : cfEmpty("Aucun avis pour le moment.", "bell");
  const mark = unread
    ? cfBtn("Tout marquer comme lu", "read-all", "", "cf-btn-ghost")
    : `<button type="button" class="cf-btn cf-btn-ghost" disabled>Tout marquer comme lu</button>`;
  return `<section class="portal-paper cf-notices">
    <div class="cf-notices-toolbar">
      <div class="portal-segment" role="tablist" aria-label="Filtrer les avis">
        <button type="button" data-cf-action="filter" data-key="filter" data-value="" aria-pressed="${filter === ""}">Toutes<span class="cf-count">${all.length}</span></button>
        <button type="button" data-cf-action="filter" data-key="filter" data-value="unread" aria-pressed="${filter === "unread"}">Non lues<span class="cf-count">${unread}</span></button>
      </div>
      ${mark}
    </div>
    <div class="cf-notices-list">${list.map((n, i) => {
      const kind = cfNoticeKind(n);
      const title = cfNoticeTitle(n);
      const same = title === n.text;
      const delay = Math.min(i, 8) * 40;
      const action = n.page
        ? `<button type="button" class="portal-row-link" data-cf-action="notice" data-id="${n.id}" data-page="${esc(n.page)}" data-ref="${esc(n.ref || "")}">Consulter le dossier${icon("arrowRight", "size-4")}</button>`
        : "";
      return `<article class="cf-notice-item ${n.read ? "is-read" : "is-unread"}" style="animation-delay:${delay}ms">
        <span class="cf-notice-dot" aria-hidden="true"></span>
        <span class="cf-notice-icon">${icon(cfNoticeIconName(kind), "size-4")}</span>
        <div class="cf-notice-body">
          <h3>${esc(title)}</h3>
          ${same ? "" : `<p>${esc(n.text)}</p>`}
          <div class="cf-notice-meta">${n.ref ? `<span class="cf-notice-ref">${esc(n.ref)}</span>` : ""}<time datetime="">${esc(n.date)}${n.time ? " · " + esc(n.time) : ""}</time></div>
        </div>
        ${action}
      </article>`;
    }).join("") || empty}</div>
  </section>`;
}

function cfRevueReject(d) {
  if (!d) return cfEmpty("Dossier introuvable.");
  const app = cfApplicant(d.applicantId);
  return `<section class="cf-revue">
    <h2>Revue — rejeter ${esc(d.ref)}</h2>
    <div class="cf-three">
      <article><h3>Ce que vous allez faire</h3><p>Rejeter le dossier. Le motif est facultatif.</p><label>Motif<textarea data-cf-field="motif">${esc(cfState.form.motif || "")}</textarea></label></article>
      <article><h3>Qui sera prévenu</h3><p>${esc(app ? app.nom : "Le demandeur")} pourra déposer un recours.</p></article>
      <article><h3>Ce qui change</h3><p>Le dossier passe à REJETE.</p></article>
    </div>
    ${cfBtn("Confirmer le rejet", "reject", `data-id="${d.id}"`, "cf-accent")}${cfBtn("Annuler", "revue-off", "", "cf-btn-ghost")}
  </section>`;
}

function cfCampaignsPage() {
  return cfS().campaigns.map((c) => `<article class="cf-paper"><h2>Campagne ${esc(c.year)}</h2>
    <p>Dépôt ${esc(c.depositStart)} – ${esc(c.depositEnd)}${c.prorogee ? " (prorogée)" : ""} · cérémonie ${esc(c.ceremonyDate)} — ${esc(c.ceremonyPlace)}</p>
    <div class="cf-mini-frise"></div>
    ${c.status !== "cloturee" ? cfBtn("Proroger la fin de dépôt", "proroge", `data-id="${c.id}"`, "cf-btn-ghost") + cfBtn("Clôturer", "close-camp", `data-id="${c.id}"`, "cf-btn-ghost") : cfBtn("Rapport PDF", "fake-pdf", "", "cf-tiny")}
  </article>`).join("");
}
function cfApplicantsPage() {
  return `<div class="cf-toolbar">${cfBtn("Ajouter", "panel-app", "data-id=\"\"", "cf-accent")}</div>
    <table class="cf-table"><thead><tr><th>Structure</th><th>Type</th><th>Reconnu</th><th></th></tr></thead><tbody>
      ${cfS().applicants.map((a) => `<tr><td>${esc(a.nom)}</td><td>${esc(a.type)}</td><td>${a.estReconnu ? "Oui" : "Non"}</td><td>${cfBtn("Éditer", "panel-app", `data-id="${a.id}"`, "cf-tiny")}${cfBtn(a.estReconnu ? "Retirer la reconnaissance" : "Reconnaître", "toggle-app", `data-id="${a.id}"`, "cf-tiny")}</td></tr>`).join("")}
    </tbody></table>`;
}
function cfUsersPage() {
  let rows = cfS().users;
  if (cfState.query) rows = rows.filter((u) => (u.nom + u.prenom + u.email).toLowerCase().includes(cfState.query.toLowerCase()));
  return `<div class="cf-toolbar"><label class="cf-search">${icon("search", "size-4")}<input data-cf-q value="${esc(cfState.query)}" /></label>${cfBtn("Créer un compte", "panel-user", "data-id=\"\"", "cf-accent")}</div>
    <table class="cf-table"><thead><tr><th>Identifiant</th><th>Nom</th><th>Profil</th><th>Dernier accès</th><th>Actif</th><th></th></tr></thead><tbody>
      ${cfSlice(rows).map((u) => `<tr><td>${esc(u.email)}</td><td>${esc(u.prenom)} ${esc(u.nom)}</td><td>${esc(u.role)}</td><td>${esc(u.last)}</td><td>${u.actif ? "Oui" : "Non"}</td><td>${cfBtn(u.actif ? "Désactiver" : "Activer", "toggle-user", `data-id="${u.id}"`, "cf-tiny")}</td></tr>`).join("")}
    </tbody></table>${cfPager(rows.length)}`;
}
function cfStampsPage() {
  return cfS().stamps.map((s) => `<article class="cf-paper"><h2>${esc(s.libelle)}</h2><p>${esc(s.status)} · ${esc(s.date)}</p><div class="cf-stamp-ph">Image non réaffichée</div>
    <p>Agents habilités : ${(s.agents || []).length}</p></article>`).join("");
}
function cfSignaturesPage() {
  return `<table class="cf-table"><thead><tr><th>Titulaire</th><th>Statut</th><th>Activation</th><th></th></tr></thead><tbody>
    ${cfS().signatures.map((s) => {
      const u = cfS().users.find((x) => x.id === s.userId);
      return `<tr><td>${esc(u ? u.prenom + " " + u.nom : s.userId)}</td><td>${cfBadge(s.status)}</td><td>${esc(s.activated || "")}</td><td>${cfBtn("Forcer la désactivation", "sig-off", `data-id="${s.id}"`, "cf-tiny")}</td></tr>`;
    }).join("")}
  </tbody></table>`;
}
function cfJournalPage(sig) {
  const rows = sig ? cfS().signatureJournal : cfS().journal;
  return `${sig ? `<div class="cf-chain ${cfS().stats.chainOk ? "is-ok" : "is-bad"}">${cfS().stats.chainOk ? "Chaîne vérifiée" : "Chaîne rompue"}</div>` : ""}
    <table class="cf-table"><thead><tr><th>Date</th><th>Acteur</th><th>${sig ? "Événement" : "Action"}</th><th>Détails</th></tr></thead><tbody>
      ${rows.map((r) => `<tr><td>${esc(r.date)}</td><td>${esc(r.actor)}</td><td>${esc(r.event || r.action)}</td><td>${esc(r.details || r.ip || "")}</td></tr>`).join("")}
    </tbody></table>`;
}

function cfRecipientPanel(p) {
  const d = cfFindDossier(p.id);
  const r = d && (d.recipients || []).find((x) => x.id === p.rid);
  if (!r) return "<p>Introuvable.</p>";
  return `<h2>${esc(r.prenom)} ${esc(r.nom)}</h2>
    <p>CNI ${esc(r.cni)} · ${esc(r.poste)} · entrée ${esc(r.start)} · ${esc(r.nationalite)}</p>
    <p>Assouplissements : mutilation 50 % ${r.assouplissement === "mutilation" ? "oui" : "non"} · ${r.dateDeces ? "décédé le " + r.dateDeces : "vivant"}</p>
    ${(r.medals || []).map((m) => `<p>${esc(m.metal)} — ${esc(m.status)}</p>`).join("")}`;
}
function cfComplementForm(p) {
  return `<label>Justification<textarea data-cf-field="texte"></textarea></label>
    ${cfBtn("Joindre une pièce", "fake-file", "data-field=\"piece\"", "cf-btn-ghost")}
    ${cfBtn("Envoyer", "send-cpl", `data-id="${p.id}" data-cid="${p.cid}"`, "cf-accent")}`;
}
function cfQuittanceForm(p) {
  return `<label>Numéro<input data-cf-field="numero" /></label><label>Montant payé<input data-cf-field="montant" /></label><label>Date<input data-cf-field="date" placeholder="jj/mm/aaaa" /></label>
    ${cfBtn("Joindre le scan", "fake-file", "data-field=\"scan\"", "cf-btn-ghost")}
    ${cfBtn("Enregistrer", "send-qui", `data-id="${p.id}"`, "cf-accent")}`;
}
function cfStockForm(metal) {
  return `<p>Métal ${esc(metal)}</p><label>Sens<select data-cf-field="sens"><option>entrée</option><option>sortie</option></select></label>
    <label>Quantité<input type="number" data-cf-field="qty" /></label><label>Motif *<input data-cf-field="motif" /></label>
    ${cfBtn("Enregistrer", "do-stock", `data-metal="${metal}"`, "cf-accent")}`;
}
function cfSupplierForm() {
  return `<label>Nom<input data-cf-field="nom" /></label><label>Contact<input data-cf-field="contact" /></label>${cfBtn("Enregistrer", "save-fou", "", "cf-accent")}`;
}
function cfUserForm() {
  return `<label>Nom<input data-cf-field="nom" /></label><label>Prénom<input data-cf-field="prenom" /></label>
    <label>Rôle<input data-cf-field="role" /></label><label>Identifiant<input data-cf-field="email" /></label>
    ${cfBtn("Créer", "save-user", "", "cf-accent")}`;
}
function cfApplicantForm(id) {
  const a = cfApplicant(id) || {};
  return `<label>Nom<input data-cf-field="nom" value="${esc(a.nom || "")}" /></label>
    <label>Type<select data-cf-field="type"><option>entreprise</option><option>ministere</option></select></label>
    ${cfBtn("Enregistrer", "save-app", `data-id="${id || ""}"`, "cf-accent")}`;
}
function cfDeliveryForm() {
  return `<label>Commande<select data-cf-field="commandeId">${cfS().purchaseOrders.map((o) => `<option value="${o.id}">${esc(o.id)}</option>`).join("")}</select></label>
    <label>Or<input type="number" data-cf-field="or" /></label><label>Argent<input type="number" data-cf-field="argent" /></label><label>Bronze<input type="number" data-cf-field="bronze" /></label>
    ${cfBtn("Enregistrer la livraison", "save-bl", "", "cf-accent")}`;
}
function cfTransmitForm() { return `<p>Destinataire : rôle Secrétariat ou personne.</p><label>Motif<select data-cf-field="motif"><option>pour décision</option><option>pour information</option><option>pour signature</option><option>pour visa</option></select></label>${cfBtn("Transmettre", "do-tx", "", "cf-accent")}`; }

function cfHistoryPage(role) {
  if (cfIsSec(role)) {
    const level = cfLevelOf(role);
    const mails = cfS().mails.filter((m) => m.level === level && m.transmittedAt);
    return `<table class="cf-table"><thead><tr><th>Dossier</th><th>Type</th><th>Envoi</th><th>Statut</th></tr></thead><tbody>${mails.map((m) => `<tr><td>${esc((cfFindDossier(m.dossierId) || {}).ref || "")}</td><td>${esc(m.type)}</td><td>${esc(m.transmittedAt)}</td><td>${esc(m.status)}</td></tr>`).join("")}</tbody></table>`;
  }
  if (cfIsAuth(role)) {
    return `<table class="cf-table"><thead><tr><th>Date</th><th>Objet</th><th>Décision</th></tr></thead><tbody>${cfS().journal.filter((j) => /Appro|Rejet|Recours|Relance|Cérémon/.test(j.action)).map((j) => `<tr><td>${esc(j.date)}</td><td>${esc(j.action)}</td><td>${esc(j.details)}</td></tr>`).join("")}</tbody></table>`;
  }
  return cfJournalPage(false);
}

function cfTarifsPage() {
  const t = cfS().tariffs;
  return `<table class="cf-table"><thead><tr><th>Métal</th><th>Prix de vente</th><th>Prix d’achat</th></tr></thead><tbody>
    ${["Or", "Argent", "Bronze"].map((m) => `<tr><td>${m}</td><td><input data-cf-tarif="${m}" value="${t[m]}" /></td><td><input data-cf-tarif="${m}Achat" value="${t[m + "Achat"] == null ? "" : t[m + "Achat"]}" placeholder="inconnu" /></td></tr>`).join("")}
    <tr><td>Diplôme</td><td><input data-cf-tarif="diplome" value="${t.diplome}" /></td><td>—</td></tr>
  </tbody></table>${cfBtn("Enregistrer", "save-tarif", "", "cf-accent")}<p class="cf-muted">Devise unique : ${CF_CURRENCY}. Dernière modification : ${esc(t.updated || "—")}</p>`;
}
function cfBudgetPage() {
  const b = cfS().budget;
  return `<div class="cf-dash"><article class="cf-card"><small>Alloué</small><strong>${esc(cfMoney(b.alloue))}</strong></article><article class="cf-card"><small>Engagé</small><strong>${esc(cfMoney(b.engage))}</strong></article><article class="cf-card"><small>Reste</small><strong>${esc(cfMoney(b.alloue - b.engage))}</strong></article></div>`;
}
function cfSuppliersPage() {
  return `${cfBtn("Ajouter", "panel-fou", "", "cf-accent")}<table class="cf-table"><thead><tr><th>Nom</th><th>Contact</th></tr></thead><tbody>${cfS().suppliers.map((s) => `<tr><td>${esc(s.nom)}</td><td>${esc(s.contact)}</td></tr>`).join("")}</tbody></table>`;
}
function cfPurchasePage() {
  return `${cfBtn("Nouvelle commande", "new-cmd", "", "cf-accent")}
    ${cfS().purchaseOrders.map((o) => `<article class="cf-paper"><h2>${esc(o.id)}</h2><p>${esc(o.status)} · ${esc(o.date)}</p>
      <table class="cf-table">${o.lines.map((l) => `<tr><td>${esc(l.metal)}</td><td>${l.qty}</td><td>${esc(cfMoney(l.prix))}</td></tr>`).join("")}</table></article>`).join("")}`;
}
function cfDeliveriesPage() {
  return `${cfBtn("Enregistrer une livraison", "panel-bl", "", "cf-accent")}
    ${cfS().deliveries.map((d) => `<article class="cf-paper"><h2>${esc(d.id)}</h2><p>Commande ${esc(d.commandeId)} · ${esc(d.date)}</p></article>`).join("")}`;
}

function cfContent(role, page) {
  if (typeof ipContent === "function") {
    const extra = ipContent(role, page);
    if (extra != null) return extra;
  }
  if (cfState.revue === "reject") return cfRevueReject(cfFindDossier(cfState.selected));
  if (cfState.revue === "order") return cfOrderRevue(cfFindDossier(cfState.selected));
  return `<section class="page-head"><p class="page-eyebrow">Espace</p><h1 class="page-title">Page indisponible</h1><p class="page-sub">Cette page n’est pas proposée pour ce profil.</p></section>`;
}

function cfRender(role, page) {
  cfState.spaceRole = role;
  cfLoad();
  if (typeof goHydrate === "function") goHydrate(role);
  const body = cfContent(role, page);
  return cfShell(role, page, body, {});
}

/* -------------------- actions -------------------- */

function cfAction(action, el, role, page) {
  const id = el && el.dataset && (el.dataset.id || el.dataset.ref);
  const goPaint = () => { cfPaint(); };
  if (typeof ipMay === "function" && !ipMay(role, action)) {
    cfToast("Cette action n’est pas autorisée pour ce profil.", "error");
    return true;
  }
  switch (action) {
    case "menu": cfState.menu = cfState.menu === el.dataset.menu ? null : el.dataset.menu; cfState.account = false; cfState.notices = false; goPaint(); return true;
    case "account": cfState.account = !cfState.account; cfState.menu = null; cfState.notices = false; goPaint(); return true;
    case "notices": cfState.notices = !cfState.notices; cfState.account = false; cfState.menu = null; goPaint(); return true;
    case "search":
      if (typeof window !== "undefined" && window.GO && typeof window.GO.openSearch === "function") { window.GO.openSearch(); return true; }
      cfState.search = !cfState.search; goPaint(); return true;
    case "assistant": cfState.assistant = !cfState.assistant; goPaint(); return true;
    case "mobile": cfState.mobile = !cfState.mobile; goPaint(); return true;
    case "toast-off": cfState.toast = ""; goPaint(); return true;
    case "panel-off": cfState.panel = null; goPaint(); return true;
    case "view-off": cfState.viewer = null; goPaint(); return true;
    case "confirm-off": cfState.confirm = null; goPaint(); return true;
    case "revue-off": cfState.revue = null; goPaint(); return true;
    case "confirm-on":
      if (cfState.confirm && cfState.confirm.action === el.dataset.next && String(cfState.confirm.id || "") === String(el.dataset.id || "")) {
        const next = el.dataset.next;
        cfState.confirm = null;
        return cfAction(next, el, role, page);
      }
      cfState.confirm = { action: el.dataset.next, id: el.dataset.id, summary: el.dataset.summary };
      goPaint(); return true;
    case "undo": {
      const r = typeof cfUndo === "function" ? cfUndo() : { ok: false };
      cfState.toast = ""; cfState.toastUndo = false;
      cfToast(r.ok ? "Action annulée." : "Rien à annuler.");
      goPaint(); return true;
    }
    case "go": cfState.selected = null; cfGo(role, el.dataset.page); return true;
    case "filter": cfState[el.dataset.key || "filter"] = el.dataset.value; cfState.page = 1; goPaint(); return true;
    case "filter-dossiers": cfState.filter = el.dataset.value; cfGo(role, "dossiers"); return true;
    case "page": cfState.page = Number(el.dataset.page) || 1; goPaint(); return true;
    case "tab": cfState.tab = el.dataset.tab; goPaint(); return true;
    case "select": cfState.selected = el.dataset.id; goPaint(); return true;
    case "open-dossier": cfState.selected = el.dataset.id; cfState.tab = "resume"; cfGo(role, "dossiers"); return true;
    case "read-all": cfMarkAllRead(); cfToast("Notifications marquées comme lues."); goPaint(); return true;
    case "notice": {
      cfMarkRead(el.dataset.id);
      cfState.notices = false;
      if (el.dataset.ref) cfState.selected = (cfFindDossier(el.dataset.ref) || {}).id || el.dataset.ref;
      cfGo(role, el.dataset.page || "notifications", el.dataset.ref ? { ref: el.dataset.ref } : null);
      return true;
    }
    case "logout":
      if (typeof leavePresentation === "function") leavePresentation();
      if (typeof signOut === "function") signOut();
      navigateTo("/connexion/"); return true;
    case "switch": {
      if (typeof leavePresentation === "function") leavePresentation();
      if (typeof enterPresentation === "function") enterPresentation(el.dataset.role, el.dataset.email);
      cfState.account = false;
      navigateTo(workspacePath(el.dataset.role, "overview"));
      return true;
    }
    case "reset": cfReset(); cfToast("Données rétablies."); goPaint(); return true;
    case "search-go": cfState.search = false; cfState.selected = el.dataset.id; cfGo(role, el.dataset.page); return true;
    case "register-mail": {
      if (typeof cfSnapshot === "function") cfSnapshot();
      const r = typeof cfRegisterMail === "function" ? cfRegisterMail(cfState.confirm ? cfState.confirm.id : id) : { ok: false, error: "Enregistrement indisponible." };
      cfState.confirm = null;
      cfToast(r.ok ? "Courrier enregistré. Il peut maintenant être transmis." : r.error, r.ok ? "info" : "error", r.ok);
      goPaint(); return true;
    }
    case "transmit": {
      if (typeof cfSnapshot === "function") cfSnapshot();
      const r = cfTransmit(cfState.confirm ? cfState.confirm.id : id);
      cfState.confirm = null;
      cfToast(r.ok ? "Dossier transmis au Directeur régional." : r.error, r.ok ? "info" : "error", r.ok);
      goPaint(); return true;
    }
    case "cascade": {
      const r = cfCascade(id, cfState.form.indications);
      cfToast(r.ok ? "Dossier renvoyé au niveau inférieur." : r.error, r.ok ? "info" : "error");
      goPaint(); return true;
    }
    case "approve": {
      if (typeof cfSnapshot === "function") cfSnapshot();
      const r = cfApprove(cfState.confirm ? cfState.confirm.id : id);
      cfState.confirm = null;
      cfToast(r.ok ? "Dossier approuvé. Le Service est prévenu." : r.error, r.ok ? "info" : "error", r.ok);
      goPaint(); return true;
    }
    case "revue-reject": cfState.revue = "reject"; cfState.selected = id; goPaint(); return true;
    case "reject": {
      if (typeof cfSnapshot === "function") cfSnapshot();
      const r = cfReject(id, cfState.form.motif);
      cfState.revue = null;
      cfToast(r.ok ? "Dossier rejeté. Le demandeur est prévenu." : r.error, r.ok ? "info" : "error", r.ok);
      goPaint(); return true;
    }
    case "recours-ok": {
      const r = cfDecideRecours(id, true, cfState.form.indications);
      cfToast(r.ok ? "Recours accepté." : r.error, r.ok ? "info" : "error"); goPaint(); return true;
    }
    case "revue-recours-no": cfState.form.needMotif = true; {
      const r = cfDecideRecours(id, false, "", cfState.form.motif || "Rejet du recours");
      cfToast(r.ok ? "Recours rejeté." : r.error, r.ok ? "info" : "error"); goPaint(); return true;
    }
    case "relance-ok": cfDecideRelance(id, true); cfToast("Relance acceptée."); goPaint(); return true;
    case "relance-no": cfDecideRelance(id, false); cfToast("Relance refusée."); goPaint(); return true;
    case "cer-ok": cfValidateCeremonyRequest(id); cfToast("Demande transmise au Service."); goPaint(); return true;
    case "start-study": cfStartStudy(id); cfToast("Instruction ouverte."); goPaint(); return true;
    case "flag-anomaly": {
      const dossierId = id || cfState.form.flagDossier;
      const motif = cfState.form.flagTexte || cfState.form.texte || "Anomalie signalée depuis le contrôle.";
      const flagged = typeof cfFlagAnomaly === "function" ? cfFlagAnomaly(dossierId, el.dataset.rid, motif) : { ok: false, error: "Signalement indisponible." };
      cfToast(flagged.ok ? "Anomalie enregistrée. Aucune décision de médaille n’est prise." : (flagged.error || "Signalement impossible."), flagged.ok ? "info" : "error");
      goPaint(); return true;
    }
    case "rec-ok": cfDecideRecipient(id, el.dataset.rid, "VALIDE"); cfToast("Récipiendaire validé."); goPaint(); return true;
    case "rec-no": {
      const motif = window.prompt ? null : "Motif";
      cfState.panel = { type: "complement", title: "Motif de refus", id, rid: el.dataset.rid, mode: "refus" };
      goPaint(); return true;
    }
    case "panel-ask-cpl": cfState.panel = { type: "complement", title: "Demander un complément", id, rid: el.dataset.rid, mode: "ask" }; goPaint(); return true;
    case "panel-rec": cfState.panel = { type: "recipient", title: "Récipiendaire", id, rid: el.dataset.rid }; goPaint(); return true;
    case "panel-cpl": cfState.panel = { type: "complement", title: "Répondre au complément", id, cid: el.dataset.cid, mode: "repondre" }; goPaint(); return true;
    case "panel-qui": cfState.panel = { type: "quittance", title: "Téléverser la quittance", id }; goPaint(); return true;
    case "panel-stock": cfState.panel = { type: "stock", title: "Ajustement de stock", metal: el.dataset.metal }; goPaint(); return true;
    case "panel-fou": cfState.panel = { type: "supplier", title: "Fournisseur" }; goPaint(); return true;
    case "panel-user": cfState.panel = { type: "user", title: "Nouveau compte" }; goPaint(); return true;
    case "panel-app": cfState.panel = { type: "applicant", title: "Demandeur", id }; goPaint(); return true;
    case "panel-bl": cfState.panel = { type: "delivery", title: "Livraison" }; goPaint(); return true;
    case "send-cpl": {
      if (cfState.panel && cfState.panel.mode === "ask") cfAskComplement(id, cfState.panel.rid, cfState.form.texte || "Pièce complémentaire");
      else if (cfState.panel && cfState.panel.mode === "refus") cfDecideRecipient(id, cfState.panel.rid, "REFUSE", cfState.form.texte || "Refus motivé");
      else cfAnswerComplement(id, el.dataset.cid, cfState.form.texte || "", cfState.form.piece);
      cfState.panel = null; cfToast("Enregistré."); goPaint(); return true;
    }
    case "send-qui": {
      const r = cfUploadQuittance(id, cfState.form);
      cfState.panel = null; cfToast(r.ok ? "Quittance téléversée. Le régisseur est prévenu." : r.error, r.ok ? "info" : "error"); goPaint(); return true;
    }
    case "accept-list": cfAcceptList(id); cfToast("Liste acceptée. Dossier validé."); goPaint(); return true;
    case "go-recours": {
      const r = cfFileRecours(id, { autorite: "ministre", motif: "Contestation de la décision" });
      cfToast(r.ok ? "Recours déposé." : r.error, r.ok ? "info" : "error"); goPaint(); return true;
    }
    case "notify-list": {
      const r = cfNotifyList(cfState.confirm ? cfState.confirm.id : id);
      cfState.confirm = null; cfToast(r.ok ? "Liste notifiée." : r.error, r.ok ? "info" : "error"); goPaint(); return true;
    }
    case "finish-instr": cfState.selected = id; cfGo(role, "notify"); return true;
    case "go-order": cfState.selected = id; cfState.wizard.orderStep = 1; cfGo(role, "orders"); return true;
    case "order-step": cfState.wizard.orderStep = Number(el.dataset.step); goPaint(); return true;
    case "order-revue": cfState.revue = "order"; cfState.selected = id; goPaint(); return true;
    case "issue-order": {
      const r = cfIssueOrder(id); cfState.revue = null;
      cfToast(r.ok ? "Ordre émis. Demandeur et régisseur prévenus." : r.error, r.ok ? "info" : "error"); goPaint(); return true;
    }
    case "qui-ok": {
      const r = cfVerifyQuittance(id, true); cfState.wizard.remiseStep = 2;
      cfToast(r.ok ? "Quittance conforme. Dossier payé." : r.error, r.ok ? "info" : "error"); goPaint(); return true;
    }
    case "qui-no": cfVerifyQuittance(id, false, "Numéro ou montant non concordant"); cfToast("Demandeur prévenu."); goPaint(); return true;
    case "remise-revue": cfState.wizard.remiseStep = 3; goPaint(); return true;
    case "do-remise": {
      const metals = Object.keys(cfState.form).filter((k) => ["Or", "Argent", "Bronze"].includes(k) && cfState.form[k]);
      const r = cfRemise(id, { retirant: (cfState.form.retirantP || "") + " " + (cfState.form.retirant || "Retirant"), qualite: cfState.form.qualite || "Représentant du demandeur", piece: cfState.form.piece || "CNI-DEMO", metals: metals.length ? metals : ["Bronze"] });
      cfToast(r.ok ? "Remise enregistrée. Les diplômes restent au Ministère." : r.error, r.ok ? "info" : "error");
      if (r.stock) { /* shortcut */ }
      cfState.wizard.remiseStep = 1; goPaint(); return true;
    }
    case "ask-cer": cfAskCeremony(id, { autorite: "dr", date: "20/11/2026", lieu: "Libreville" }); cfToast("Demande envoyée au secrétariat."); goPaint(); return true;
    case "ask-rel": cfFileRelance(id, { autorite: "dr", motif: "Distinctions non distribuées" }); cfToast("Relance déposée."); goPaint(); return true;
    case "nego-ok": cfNegotiate(id, "", "", true); cfToast("Date acceptée."); goPaint(); return true;
    case "nego-other": cfNegotiate(id, "05/12/2026", "Libreville — Hôtel de ville", false); cfToast("Contre-proposition envoyée."); goPaint(); return true;
    case "nego-svc":
      cfState.panel = { type: "ceremony-place", id, title: "Proposer une date et un lieu" };
      goPaint(); return true;
    case "val-date": cfValidateDate(id); cfToast("Date validée officiellement."); goPaint(); return true;
    case "catchup": cfOpenCatchup(id); cfToast("Cérémonie de rattrapage ouverte."); cfGo(role, "cer-demandes"); return true;
    case "gen-del": cfGenerateDelegation(id); cfToast("Document de délégation généré."); goPaint(); return true;
    case "gen-dip": cfGenerateDiplomas(id); cfToast("Diplômes générés."); goPaint(); return true;
    case "add-del": { const d = cfFindDossier(id); if (d) { d.delegues = d.delegues || []; d.delegues.push({ nom: "Membre " + (d.delegues.length + 1), fonction: "Représentant" }); cfSave(); } goPaint(); return true; }
    case "wd-ok": cfDecideWithdrawal(id, true); cfToast("Retrait autorisé. L’employé est prévenu."); goPaint(); return true;
    case "wd-no": cfDecideWithdrawal(id, false, "Justificatif illisible"); cfToast("Retrait refusé."); goPaint(); return true;
    case "wd-step": cfState.wizard.wdStep = Number(el.dataset.step); goPaint(); return true;
    case "wd-send": {
      const r = cfSubmitWithdrawal(cfState.form);
      cfState.wizard.tracking = r.withdrawal.tracking;
      cfToast("Demande envoyée. Numéro " + r.withdrawal.tracking); goPaint(); return true;
    }
    case "wd-suivi": cfState.wizard.tracking = cfState.form.tracking; goPaint(); return true;
    case "do-stock": {
      const r = cfAdjustStock(el.dataset.metal, cfState.form.sens || "entrée", cfState.form.qty, cfState.form.motif);
      cfState.panel = null; cfToast(r.ok ? "Stock mis à jour." : r.error, r.ok ? "info" : "error"); goPaint(); return true;
    }
    case "save-fou": cfS().suppliers.unshift({ id: cfUid("FOU"), nom: cfState.form.nom, contact: cfState.form.contact }); cfSave(); cfState.panel = null; cfToast("Fournisseur ajouté."); goPaint(); return true;
    case "save-user": cfCreateAccount(cfState.form); cfState.panel = null; cfToast("Compte créé."); goPaint(); return true;
    case "save-app": { if (id) { const a = cfApplicant(id); if (a) a.nom = cfState.form.nom || a.nom; } else cfS().applicants.unshift({ id: cfUid("APP"), nom: cfState.form.nom, type: cfState.form.type || "entreprise", estReconnu: true, nif: "NIF-NEW", adresse: "—" }); cfSave(); cfState.panel = null; goPaint(); return true; }
    case "save-bl": {
      cfReceiveDelivery({ commandeId: cfState.form.commandeId, lines: [{ metal: "Or", qty: Number(cfState.form.or) || 0 }, { metal: "Argent", qty: Number(cfState.form.argent) || 0 }, { metal: "Bronze", qty: Number(cfState.form.bronze) || 0 }].filter((l) => l.qty) });
      cfState.panel = null; cfToast("Livraison enregistrée. Entrées de stock créées."); goPaint(); return true;
    }
    case "new-cmd": cfCreateOrder({ fournisseurId: "FOU-1", lines: [{ metal: "Bronze", qty: 20, prix: 5000 }] }); cfToast("Commande créée."); goPaint(); return true;
    case "toggle-user": { const u = cfS().users.find((x) => x.id === id); cfToggleUser(id, !(u && u.actif)); goPaint(); return true; }
    case "toggle-app": { const a = cfApplicant(id); cfToggleApplicant(id, !(a && a.estReconnu)); goPaint(); return true; }
    case "save-tarif": Object.keys(cfState.form).forEach((k) => { if (k in cfS().tariffs || k.endsWith("Achat") || k === "diplome") cfS().tariffs[k] = cfState.form[k] === "" ? null : Number(cfState.form[k]); }); cfS().tariffs.updated = CF_TODAY_FR; cfSave(); cfToast("Tarifs enregistrés."); goPaint(); return true;
    case "proroge": cfProroge(id, "15/04/2026"); cfToast("Date de fin prorogée. La cérémonie ne bouge pas."); goPaint(); return true;
    case "close-camp": cfCloseCampaign(id); cfToast("Campagne clôturée. Cliché archivé."); goPaint(); return true;
    case "set-loc": cfSetLocation(id, "Service des Distinctions — salle 4"); cfToast("Localisation mise à jour."); goPaint(); return true;
    case "view-doc": cfState.viewer = { id: id || el.dataset.id, name: el.dataset.name, tab: "infos" }; goPaint(); return true;
    case "view-tab": if (cfState.viewer) cfState.viewer.tab = el.dataset.tab; goPaint(); return true;
    case "visa-doc": { const r = cfVisa(id); cfToast(r.ok ? "Visa apposé." : r.error, r.ok ? "info" : "error"); goPaint(); return true; }
    case "stamp-doc": { const r = cfStamp(id); cfToast(r.ok ? "Cachet apposé." : r.error, r.ok ? "info" : "error"); goPaint(); return true; }
    case "sign-doc": {
      const r = cfSignDoc(id, CF_CODE);
      cfToast(r.ok ? "Document signé visuellement. En attente de numérotation." : r.error, r.ok ? "info" : "error"); goPaint(); return true;
    }
    case "add-num": cfAddNumber(id, "N-" + Date.now().toString().slice(-5)); cfToast("Numéro ajouté."); goPaint(); return true;
    case "seal-doc": { const r = cfSeal(id); cfToast(r.ok ? "Document scellé." : r.error, r.ok ? "info" : "error"); goPaint(); return true; }
    case "dl-doc": cfLog("Téléchargement", id); cfToast("Téléchargement journalisé."); return true;
    case "doc-version": {
      const doc = cfS().documents.find((d) => d.id === id);
      if (doc) cfS().documents.unshift(Object.assign(cfClone(doc), { id: cfUid("DOC"), sealed: false, signStatus: "NON_SIGNE", numero: null, date: CF_TODAY_FR, name: doc.name + " (nouvelle version)" }));
      cfSave(); cfToast("Nouvelle version créée."); goPaint(); return true;
    }
    case "sig-upload": cfState.form.sigWait = true; cfToast("Profil créé. Un code à 6 chiffres a été envoyé."); goPaint(); return true;
    case "sig-code": {
      if (String(cfState.form.sigCode) !== CF_CODE) { cfToast("Code incorrect.", "error"); return true; }
      const u = cfUser();
      cfS().signatures.forEach((s) => { if (s.userId === (u && u.id) && s.status === "ACTIVE") s.status = "DESACTIVEE"; });
      cfS().signatures.unshift({ id: cfUid("SIG"), userId: u && u.id, status: "ACTIVE", created: CF_TODAY_FR, activated: CF_TODAY_FR });
      cfState.form.sigWait = false; cfToast("Signature activée."); goPaint(); return true;
    }
    case "sig-off": {
      const s = cfS().signatures.find((x) => x.id === id); if (s) { s.status = "DESACTIVEE"; s.deactivated = CF_TODAY_FR; }
      cfSave(); cfToast("Signature désactivée."); goPaint(); return true;
    }
    case "wiz-next": cfState.wizard.step = Math.min(6, (cfState.wizard.step || 1) + 1); goPaint(); return true;
    case "wiz-prev": cfState.wizard.step = Math.max(1, (cfState.wizard.step || 1) - 1); goPaint(); return true;
    case "wiz-file": cfState.wizard[el.dataset.field === "piece" ? "pieces" : el.dataset.field] = el.dataset.field === "piece" ? (cfState.wizard.pieces || []).concat(["piece-demo.pdf"]) : "piece-demo.pdf"; cfToast("Pièce simulée jointe."); goPaint(); return true;
    case "wiz-add-rec": {
      const f = cfState.form;
      if (!f.nom || !f.prenom || !f.cni || !f.start) { cfToast("Champs obligatoires manquants.", "error"); return true; }
      const years = cfYears(f.start);
      const metals = f.metals && f.metals.length ? f.metals.slice(0, 3) : [cfEligibleMedal(years) || "Bronze"];
      const dup = cfState.wizard.recipients.some((r) => r.cni === f.cni && (r.metals || []).some((m) => metals.includes(m)));
      const rec = { cni: f.cni, nom: f.nom, prenom: f.prenom, poste: f.poste, start: f.start, nationalite: f.nationalite, sexe: f.sexe, dateDeces: f.dateDeces, metals, years, warn: dup ? "Doublon probable (même CNI, même médaille)." : (years < 10 ? "Sous le seuil de 10 ans." : "") };
      cfState.wizard.recipients.push(rec);
      cfState.form = {};
      cfToast("Récipiendaire ajouté."); goPaint(); return true;
    }
    case "wiz-del-rec": cfState.wizard.recipients.splice(Number(el.dataset.index), 1); goPaint(); return true;
    case "wiz-submit": {
      const r = cfDeposit({ destination: cfState.wizard.destination, recipients: cfState.wizard.recipients, pieces: ["Courrier d’initiation", "DTS"].concat(cfState.wizard.pieces || []) });
      if (!r.ok) { cfToast(r.error, "error"); return true; }
      cfState.wizard = { step: 1, destination: "dr", nRec: 1, nOr: 0, nArgent: 0, nBronze: 0, letter: "", dts: "", pieces: [], recipients: [], dirty: false };
      cfState.selected = r.dossier.id;
      cfToast("Dossier " + r.dossier.ref + " déposé. Statut SOUMIS.");
      cfGo(role, "dossiers"); return true;
    }
    case "cal-prev": cfState.calOffset -= 1; goPaint(); return true;
    case "cal-next": cfState.calOffset += 1; goPaint(); return true;
    case "cal-year-prev": cfState.calOffset -= 12; goPaint(); return true;
    case "cal-year-next": cfState.calOffset += 12; goPaint(); return true;
    case "open-cer": cfState.selected = id; goPaint(); return true;
    case "map-pick": {
      cfState.form.placeId = el.dataset.place;
      const pl = (typeof DEMO_PLACES !== "undefined" ? DEMO_PLACES : []).find((p) => p.id === el.dataset.place);
      if (pl) cfState.form.placeName = pl.name + " — " + pl.city;
      goPaint(); return true;
    }
    case "save-del-draft": {
      const r = typeof cfSaveDelDraft === "function" ? cfSaveDelDraft(id, {
        nom: cfState.form.delNom, fonction: cfState.form.delFonction, organisme: cfState.form.delOrganisme,
      }) : { ok: false, error: "Enregistrement indisponible." };
      cfToast(r.ok ? "Brouillon de délégation enregistré." : r.error, r.ok ? "info" : "error");
      goPaint(); return true;
    }
    case "nego-submit": {
      const place = cfState.form.placeName || "Port-Gentil — Centre administratif";
      const date = cfState.form.cerDate || "20/11/2026";
      cfNegotiate(id, date, place, false);
      cfState.panel = null;
      cfToast("Proposition envoyée.");
      goPaint(); return true;
    }
    case "fake-file": case "fake-piece": case "fake-wd": case "fake-pdf": case "visa-upload":
      cfToast("Aucun fichier n’a été transmis."); return true;
    case "prefs": cfToast("Préférence enregistrée localement."); return true;
    default: return false;
  }
}

function cfInput(el) {
  if (el.matches("[data-cf-search-global]")) { cfState.searchQ = el.value; const box = document.querySelector(".cf-palette-list"); if (box) { const rows = cfSearch(el.value); box.innerHTML = rows.length ? rows.map((r) => `<button type="button" data-cf-action="search-go" data-page="${r.page}" data-id="${esc(r.id)}"><small>${esc(r.kind)}</small>${esc(r.label)}</button>`).join("") : `<p class="cf-muted">Saisissez au moins deux caractères.</p>`; } return true; }
  if (el.matches("[data-cf-q]")) { cfState.query = el.value; cfState.page = 1; cfPaint(); return true; }
  if (el.matches("[data-cf-wiz]")) { cfState.wizard[el.dataset.cfWiz] = el.value; cfState.wizard.dirty = true; return true; }
  if (el.matches("[data-cf-form-field]")) { cfState.form[el.name] = el.value; return true; }
  if (el.matches("[data-cf-field]")) { cfState.form[el.dataset.cfField] = el.value; return true; }
  if (el.matches("[data-cf-tarif]")) { cfState.form[el.dataset.cfTarif] = el.value; return true; }
  return false;
}
function cfChange(el) {
  if (el.matches("[data-cf-metal]")) {
    const m = el.dataset.cfMetal;
    cfState.form.metals = cfState.form.metals || [];
    if (el.checked) { if (!cfState.form.metals.includes(m) && cfState.form.metals.length < 3) cfState.form.metals.push(m); }
    else cfState.form.metals = cfState.form.metals.filter((x) => x !== m);
    cfState.form[m] = el.checked;
    return true;
  }
  if (el.matches("[data-cf-wiz]")) { cfState.wizard[el.dataset.cfWiz] = el.value; return true; }
  if (el.matches("[data-cf-form-field]")) { cfState.form[el.name] = el.value; if (el.name === "start") cfPaint(); return true; }
  if (el.matches("[data-cf-field]")) { cfState.form[el.dataset.cfField] = el.value; return true; }
  if (el.matches("[data-cf-sort]")) { cfState[el.dataset.cfSort || "sort"] = el.value; cfPaint(); return true; }
  return false;
}
function cfSubmit(ev) {
  const form = ev.target;
  if (form && form.dataset && form.dataset.cfForm === "assistant") {
    ev.preventDefault();
    const q = (form.q && form.q.value) || "";
    const a = cfAnswer(q);
    cfState.assistantLog.push({ q, a: a.a });
    cfLog("Assistant", q);
    cfPaint();
    return true;
  }
  return false;
}

function cfKey(ev) {
  if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") { ev.preventDefault(); cfState.search = true; cfPaint(); return true; }
  if (ev.key === "Escape") {
    if (cfState.viewer) { cfState.viewer = null; cfPaint(); return true; }
    if (cfState.panel) { cfState.panel = null; cfPaint(); return true; }
    if (cfState.search) { cfState.search = false; cfPaint(); return true; }
    if (cfState.menu || cfState.account || cfState.notices || cfState.assistant) { cfState.menu = null; cfState.account = false; cfState.notices = false; cfPaint(); return true; }
  }
  if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
    const list = document.querySelector(".cf-split-list, .cf-bureau-list");
    if (!list) return false;
    const items = [...list.querySelectorAll("[data-cf-action=\"select\"]")];
    const i = items.findIndex((x) => x.classList.contains("is-on"));
    const next = ev.key === "ArrowDown" ? Math.min(items.length - 1, i + 1) : Math.max(0, i - 1);
    if (items[next]) { ev.preventDefault(); items[next].click(); }
    return true;
  }
  return false;
}

function renderWorkspace(role, page) { return cfRender(role, page); }
function renderAdmin(role, page) { return cfRender(role || "admin", page || "users"); }
function renderCf(role, page) { return cfRender(role, page); }
