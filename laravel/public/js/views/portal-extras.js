/* ==================================================================
   js/views/portal-extras.js
   Modules Employés, Distinctions, Finance et Cérémonies — espace
   Demandeur (entreprise / ministère). Réutilise le magasin DemoStore.
================================================================== */

Object.assign(portalState, {
  affiliation: "",
  navOpen: null,
  empSort: "name",
  empSortDir: "asc",
  empPage: 1,
  empNationality: "",
  empSeniority: "",
  empCampaign: "",
  empDetail: null,
  empForm: {},
  empFormDirty: false,
  empFormMode: "create",
  empEditingId: null,
  ceremonyWizard: { step: 1, dossier: "", date: "", time: "10:00", place: null, placeQuery: "", estimated: "", notes: "", dirty: false, type: "Remise de distinctions" },
  financeYear: "",
  financeCompare: "",
  financePay: "",
  financeDossier: "",
  distEmployee: "",
  distYear: "",
  distRemise: "",
  distValidation: "",
  calView: "month",
  calStatus: "",
  calType: "",
  calCampaign: "",
  cerBucket: "",
  cerDetail: null,
  mapEmpty: false,
  personSource: "employee",
  abandonTo: null,
  withdrawWizard: { step: 1, awardId: "", motif: "", quittance: "", permission: "", dirty: false },
  withdrawDetail: null,
  createWizard: { step: 1, destination: "dr", letter: null, recipients: [], dts: null, extras: [], dirty: false, done: false, createdRef: "" },
  files: {},
  dossierPage: 1,
  dossierTab: "resume",
  dossierPeriod: "",
  workReply: {},
  docPreview: null,
});

Object.assign(PORTAL_STATUS, {
  EN_ATTENTE: "gold",
  Émis: "gold",
  "En attente de vérification": "gold",
  Validée: "green",
  "En attente": "gold",
  Refusée: "neutral",
  Remise: "green",
  "En attente de remise": "gold",
  "Non remise": "neutral",
  "Demande en attente": "gold",
  "En préparation": "blue",
  Annulée: "neutral",
  Proposée: "gold",
  Négociée: "blue",
  Planifiée: "blue",
  Invité: "blue",
  Confirmé: "green",
  Absent: "neutral",
  "Payé — quittance reçue": "green",
  "Reste à payer": "gold",
  "Paiement à vérifier": "gold",
  "Paiement partiel": "gold",
  "Aucun ordre": "neutral",
  Actif: "green",
  "Invitation en attente": "gold",
  "Ancienne affiliation": "neutral",
  REFUSEE: "neutral",
  "Invitation déclinée": "neutral",
  "Retrait autorisé": "green",
  "Retrait effectué": "green",
});

const EMP_PAGE_SIZE = 6;
const AFFILIATION_LABEL = { ACTIF: "Actif", EN_ATTENTE: "Invitation en attente", TERMINE: "Ancienne affiliation" };

function portalPageDirty() {
  return !!(portalState.empFormDirty
    || (portalState.ceremonyWizard && portalState.ceremonyWizard.dirty)
    || (portalState.withdrawWizard && portalState.withdrawWizard.dirty)
    || (portalState.createWizard && portalState.createWizard.dirty));
}

function portalClearDirty() {
  portalState.empFormDirty = false;
  if (portalState.ceremonyWizard) portalState.ceremonyWizard.dirty = false;
  if (portalState.withdrawWizard) portalState.withdrawWizard.dirty = false;
  if (portalState.createWizard) portalState.createWizard.dirty = false;
}

function emptyWithdrawWizard() {
  return { step: 1, awardId: "", motif: "", quittance: "", permission: "", files: {}, dirty: false };
}

function emptyCreateWizard() {
  return { step: 1, destination: "dr", letter: null, recipients: [], dts: null, extras: [], dirty: false, done: false, createdRef: "" };
}

function portalNavItems(role) {
  if (role === "demandeur") {
    return [
      { page: "overview", label: "Vue d’ensemble" },
      { page: "dossiers", label: "Dossiers", children: [
        { page: "dossiers", label: "Mes dossiers" },
        { page: "new-dossier", label: "Créer une demande" },
        { page: "complements", label: "Compléments" },
        { page: "relances", label: "Relances" },
        { page: "recours", label: "Recours" },
        { page: "documents", label: "Courriers et pièces" },
        { page: "dossier-stats", label: "Statistiques des dossiers" },
      ] },
      { page: "employees", label: "Employés", children: [
        { page: "employees", label: "Liste des employés" },
        { page: "employee-new", label: "Enregistrer un employé" },
        { page: "employee-stats", label: "Statistiques des employés" },
      ] },
      { page: "distinctions", label: "Distinctions" },
      { page: "payments", label: "Finance" },
      { page: "ceremonies", label: "Cérémonies", children: [
        { page: "ceremony-request", label: "Demande de cérémonie" },
        { page: "ceremony-calendar", label: "Calendrier des cérémonies" },
        { page: "ceremonies", label: "Mes cérémonies" },
      ] },
      { page: "notifications", label: "Notifications" },
      { page: "profile", label: "Profil" },
    ];
  }
  return [
    { page: "overview", label: "Vue d’ensemble" },
    { page: "parcours", label: "Mon parcours", children: [
      { page: "recipients", label: "Mes distinctions" },
      { page: "employers", label: "Mes employeurs" },
      { page: "ceremonies", label: "Mes cérémonies" },
      { page: "photos", label: "Mes photos" },
    ] },
    { page: "withdrawals", label: "Retrait sans cérémonie", children: [
      { page: "withdrawal-request", label: "Nouvelle demande" },
      { page: "withdrawals", label: "Mes demandes" },
    ] },
    { page: "actions", label: "Actions à effectuer" },
    { page: "notifications", label: "Notifications" },
    { page: "profile", label: "Profil" },
  ];
}

function portalNavLabel(role, page) {
  for (const item of portalNavItems(role)) {
    if (item.page === page) return item.label;
    const child = (item.children || []).find((c) => c.page === page);
    if (child) return child.label;
  }
  return "Vue d’ensemble";
}

function portalNavParent(role, page) {
  for (const item of portalNavItems(role)) {
    if (item.page === page) return item.page;
    if ((item.children || []).some((c) => c.page === page)) return item.page;
  }
  return "overview";
}

function portalTabsHtml(role, page) {
  const current = portalNavParent(role, page);
  return portalNavItems(role).map((item) => {
    const open = portalState.navOpen === item.page;
    const active = current === item.page;
    if (item.children) {
      return `<div class="portal-nav-drop ${open ? "is-open" : ""} ${active ? "is-current" : ""}">
        <button type="button" class="${active ? "active" : ""}" data-portal-action="nav-menu" data-menu="${item.page}" aria-expanded="${open}" aria-haspopup="true">${esc(item.label)}${icon("chevronDown", "size-3.5 portal-nav-caret")}</button>
        ${open ? `<div class="portal-nav-menu" role="menu">${item.children.map((c) => `<button type="button" role="menuitem" data-action="ws-page" data-page="${c.page}" class="${page === c.page ? "is-active" : ""}">${esc(c.label)}</button>`).join("")}</div>` : ""}
      </div>`;
    }
    return `<button type="button" data-action="ws-page" data-page="${item.page}" aria-current="${active ? "page" : "false"}" class="${active ? "active" : ""}">${esc(item.label)}</button>`;
  }).join("");
}

function portalBackTop() {
  return `<button type="button" data-action="home-top" data-back-to-top aria-label="Revenir en haut" aria-hidden="true" tabindex="-1" class="home-back-top"><span class="home-back-top-icon">${icon("arrowRight", "size-4 -rotate-90")}</span></button>`;
}

function portalExplain(text) {
  return `<p class="portal-explain">${icon("info", "size-4")}<span>${text}</span></p>`;
}

function portalInitials(person) {
  const name = typeof person === "string" ? person : demoFullName(person);
  return esc(name.split(" ").map((x) => x[0]).filter(Boolean).slice(0, 2).join("").toUpperCase());
}

function portalSortHeader(label, key, current, dir) {
  const active = current === key;
  return `<button type="button" class="portal-th-sort ${active ? "is-active" : ""}" data-portal-action="emp-sort" data-sort="${key}">${esc(label)}${active ? `<small>${dir === "asc" ? "↑" : "↓"}</small>` : ""}</button>`;
}

function portalPager(total, page, size, action) {
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(page, pages);
  if (pages <= 1) return "";
  const buttons = [];
  for (let i = 1; i <= pages; i += 1) {
    buttons.push(`<button type="button" data-portal-action="${action}" data-page="${i}" class="portal-page-btn ${i === current ? "is-active" : ""}" aria-current="${i === current ? "page" : "false"}">${i}</button>`);
  }
  return `<nav class="portal-pager" aria-label="Pagination">${buttons.join("")}</nav>`;
}

function portalBarChart(items, opts) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const unit = opts.unit || "";
  const click = opts.action || "";
  const key = opts.key || "id";
  return `<figure class="portal-chart">
    <figcaption><strong>${esc(opts.title || "")}</strong>${opts.caption ? `<small>${esc(opts.caption)}</small>` : ""}</figcaption>
    <div class="portal-bars portal-bars-interactive">${items.map((item) => {
      const body = `<span>${esc(item.label)}</span><div title="${esc(item.label)} : ${item.value} ${unit}"><i style="width:${Math.round((item.value / max) * 100)}%"></i></div><strong>${item.value}</strong>`;
      return click
        ? `<button type="button" class="portal-bar-line" data-portal-action="${click}" data-value="${esc(String(item[key]))}">${body}</button>`
        : `<div class="portal-bar-line">${body}</div>`;
    }).join("")}</div>
    <p class="portal-chart-unit">Unité : ${esc(unit || "nombre")}</p>
  </figure>`;
}

function portalDonut(segments, opts) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const palette = { Bronze: "#c39600", Argent: "#6b8cb5", Or: "#d6a72c", Masculin: "#315c91", Féminin: "#009b62", Actif: "#009b62", Attente: "#c39600", Anciens: "#64748b" };
  const circles = segments.map((seg) => {
    const frac = total ? seg.value / total : 0;
    const dash = frac * c;
    const gap = c - dash;
    const color = seg.color || palette[seg.label] || "#315c91";
    const circle = `<circle cx="56" cy="56" r="${r}" fill="none" stroke="${color}" stroke-width="12" stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${-offset}" transform="rotate(-90 56 56)"></circle>`;
    offset += dash;
    return circle;
  }).join("");
  return `<figure class="portal-donut">
    <figcaption><strong>${esc(opts.title || "")}</strong>${opts.caption ? `<small>${esc(opts.caption)}</small>` : ""}</figcaption>
    <div class="portal-donut-layout">
      <svg viewBox="0 0 112 112" class="portal-donut-svg" aria-hidden="true">${circles}<text x="56" y="52" text-anchor="middle" font-size="18" font-weight="700" fill="#142d52">${total}</text><text x="56" y="70" text-anchor="middle" font-size="8" fill="#64748b">${esc(opts.center || "")}</text></svg>
      <ul class="portal-donut-legend">${segments.map((seg) => `<li><i style="background:${esc(seg.color || palette[seg.label] || "#315c91")}"></i><span>${esc(seg.label)}</span><strong>${seg.value}</strong></li>`).join("")}</ul>
    </div>
  </figure>`;
}

function portalYearChart(years, opts) {
  const max = Math.max(1, ...years.map((y) => y.value));
  return `<figure class="portal-year-chart">
    <figcaption><strong>${esc(opts.title || "")}</strong><small>${esc(opts.caption || "")}</small></figcaption>
    <div class="portal-year-bars">${years.map((y) => `<button type="button" class="portal-year-col" data-portal-action="${opts.action || "finance-year"}" data-value="${esc(y.label)}"><span class="portal-year-fill" style="height:${Math.round((y.value / max) * 100)}%"></span><strong>${typeof y.value === "number" && y.value > 999 ? new Intl.NumberFormat("fr-FR").format(y.value) : y.value}</strong><small>${esc(y.label)}</small></button>`).join("")}</div>
    <p class="portal-chart-unit">${esc(opts.unit || "")}</p>
  </figure>`;
}

/* ------------------------------------------------------------------
   Formulaire personne (récipiendaire / employé) — une seule implémentation
------------------------------------------------------------------ */

function portalFileLabel(stored) {
  if (!stored) return "Aucune pièce";
  if (typeof stored === "string") return stored;
  const ko = stored.size ? " · " + Math.max(1, Math.round(stored.size / 1024)) + " Ko" : "";
  return (stored.name || "Pièce") + ko;
}

function portalFileInput(field, stored, label) {
  const name = typeof stored === "string" ? stored : (stored && stored.name) || "";
  const id = "file-" + field.replace(/[^a-z0-9_-]/gi, "");
  return `<label class="person-file">
      <span>${esc(label)}</span>
      <span class="person-file-row">
        <input type="hidden" name="${esc(field)}" value="${esc(name)}"/>
        <input type="file" data-portal-file="${esc(field)}" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,application/pdf" class="sr-only" id="${id}"/>
        <label for="${id}" class="portal-btn portal-secondary">${name ? "Remplacer la pièce" : "Joindre une pièce"}</label>
        <em data-file-label="${esc(field)}">${esc(portalFileLabel(stored))}</em>
      </span>
      <small data-error-for="${esc(field)}"></small>
    </label>`;
}

function personFormHtml(values, options) {
  const v = values || {};
  const opt = options || {};
  const nat = v.nationalite || "Gabonaise";
  const sit = v.situationPhysique || "Bien portant";
  const naturalise = v.naturalise === true || v.naturalise === "oui" || v.naturalise === "on";
  const otherNat = nat === "Autre" || (nat && !DEMO_NATIONALITIES.includes(nat));
  return `<div class="person-form" data-person-form="${opt.id || "person"}">
    <div class="portal-profile-grid">
      <label><span>Nom</span><input name="nom" required value="${esc(v.nom || "")}" autocomplete="family-name"/><small data-error-for="nom"></small></label>
      <label><span>Prénom</span><input name="prenom" required value="${esc(v.prenom || "")}" autocomplete="given-name"/><small data-error-for="prenom"></small></label>
      <label><span>Sexe</span><select name="sexe" required><option value="">Choisir</option><option value="Masculin" ${v.sexe === "Masculin" ? "selected" : ""}>Masculin</option><option value="Féminin" ${v.sexe === "Féminin" ? "selected" : ""}>Féminin</option></select><small data-error-for="sexe"></small></label>
      <label><span>Nationalité</span><select name="nationalite" data-person-watch="nationalite">${DEMO_NATIONALITIES.map((n) => `<option ${nat === n || (otherNat && n === "Autre") ? "selected" : ""}>${esc(n)}</option>`).join("")}</select><small data-error-for="nationalite"></small></label>
      ${otherNat ? `<label><span>Préciser la nationalité</span><input name="nationaliteAutre" value="${esc(v.nationaliteAutre || (DEMO_NATIONALITIES.includes(nat) ? "" : nat))}"/></label>` : ""}
      <label><span>Poste occupé</span><input name="poste" required value="${esc(v.poste || v.job || "")}"/><small data-error-for="poste"></small></label>
      <label><span>Date d’embauche</span><input name="start" type="text" inputmode="numeric" placeholder="jj/mm/aaaa" required value="${esc(v.start || "")}"/><small data-error-for="start"></small></label>
      ${opt.showMedal ? `<label><span>Médaille demandée</span><select name="medal"><option ${v.medal === "Bronze" ? "selected" : ""}>Bronze</option><option ${v.medal === "Argent" ? "selected" : ""}>Argent</option><option ${v.medal === "Or" ? "selected" : ""}>Or</option></select></label>` : ""}
    </div>
    <label class="person-check"><input type="checkbox" name="naturalise" data-person-watch="naturalise" ${naturalise ? "checked" : ""}/> Personne naturalisée gabonaise</label>
    <div class="portal-profile-grid" data-person-extra>
      ${nat !== "Gabonaise" ? portalFileInput("workPermit", v.workPermit, "Autorisation d’emploi (non gabonais)") : ""}
      ${naturalise ? portalFileInput("naturalizationDoc", v.naturalizationDoc, "Justificatif de naturalisation") : ""}
    </div>
    <fieldset class="person-physical">
      <legend>Situation physique déclarée</legend>
      <p class="portal-muted">Cette information n’apparaît dans les tableaux généraux que lorsqu’elle est nécessaire. Les pièces médicales restent dans la fiche individuelle.</p>
      <div class="portal-segment person-sit">${["Bien portant", "Mutilé", "Décédé"].map((s) => `<button type="button" data-portal-action="person-sit" data-value="${s}" aria-pressed="${sit === s}">${s}</button>`).join("")}</div>
      <input type="hidden" name="situationPhysique" value="${esc(sit)}"/>
      ${sit === "Mutilé" ? `<div class="portal-profile-grid"><label><span>Degré de mutilation</span><input name="degreMutilation" value="${esc(v.degreMutilation || "")}" placeholder="Déclaration, sans détail clinique"/><small data-error-for="degreMutilation"></small></label>${portalFileInput("pieceMedicale", v.pieceMedicale, "Pièce médicale")}</div>` : ""}
      ${sit === "Décédé" ? `<div class="portal-profile-grid"><label><span>Date de décès</span><input name="dateDeces" data-person-watch="dateDeces" placeholder="jj/mm/aaaa" value="${esc(v.dateDeces || "")}"/><small data-error-for="dateDeces"></small></label>${portalFileInput("acteDeces", v.acteDeces, "Acte de décès")}</div>${deathOlderThanTwoYears(v.dateDeces) ? `<p class="portal-warn" role="status">Le décès déclaré date de plus de deux ans. Cette information est signalée ; elle n’empêche pas de poursuivre la demande.</p>` : ""}` : ""}
    </fieldset>
  </div>`;
}

function personFormRead(root) {
  if (!root) return {};
  const fields = {};
  root.querySelectorAll("input, select, textarea").forEach((el) => {
    if (!el.name) return;
    if (el.type === "checkbox") fields[el.name] = el.checked;
    else fields[el.name] = el.value;
  });
  if (fields.nationalite === "Autre" && fields.nationaliteAutre) fields.nationalite = fields.nationaliteAutre;
  return fields;
}

function personFormValidate(fields) {
  const errors = {};
  if (!String(fields.nom || "").trim()) errors.nom = "Le nom est requis.";
  if (!String(fields.prenom || "").trim()) errors.prenom = "Le prénom est requis.";
  if (!fields.sexe) errors.sexe = "Indiquez le sexe.";
  if (!fields.nationalite) errors.nationalite = "Indiquez la nationalité.";
  if (!String(fields.poste || "").trim()) errors.poste = "Indiquez le poste occupé.";
  if (!fields.start || !parseFrDate(fields.start)) errors.start = "Indiquez une date d’embauche au format jj/mm/aaaa.";
  if (fields.nationalite && fields.nationalite !== "Gabonaise" && !fields.workPermit) errors.workPermit = "Joignez l’autorisation d’emploi (simulation).";
  if (fields.naturalise && !fields.naturalizationDoc) errors.naturalizationDoc = "Joignez le justificatif de naturalisation (simulation).";
  if (fields.situationPhysique === "Mutilé") {
    if (!fields.degreMutilation) errors.degreMutilation = "Indiquez le degré déclaré.";
    if (!fields.pieceMedicale) errors.pieceMedicale = "Joignez la pièce médicale, consultable uniquement dans cette fiche.";
  }
  if (fields.situationPhysique === "Décédé") {
    if (!fields.dateDeces || !parseFrDate(fields.dateDeces)) errors.dateDeces = "Indiquez la date de décès.";
    if (!fields.acteDeces) errors.acteDeces = "Joignez l’acte de décès (simulation).";
  }
  return errors;
}

function personFormApplyErrors(root, errors) {
  if (!root) return;
  root.querySelectorAll("[data-error-for]").forEach((n) => { n.textContent = ""; });
  root.querySelectorAll("[aria-invalid]").forEach((n) => n.removeAttribute("aria-invalid"));
  Object.keys(errors).forEach((key) => {
    const note = root.querySelector(`[data-error-for="${key}"]`);
    if (note) note.textContent = errors[key];
    const input = root.querySelector(`[name="${key}"]`);
    if (input) input.setAttribute("aria-invalid", "true");
  });
}

/* ------------------------------------------------------------------
   Carte des lieux proposés
------------------------------------------------------------------ */

function mapPickerHtml(wizard) {
  const query = wizard.placeQuery || "";
  const selected = wizard.place;
  const q = demoNorm(query);
  const matches = q
    ? DEMO_PLACES.filter((p) => demoNorm(p.name).includes(q) || demoNorm(p.city).includes(q) || demoNorm(p.address).includes(q))
    : DEMO_PLACES;
  const empty = q && matches.length === 0;
  return `<div class="map-picker" data-map-picker>
    <div class="map-picker-banner">${icon("info", "size-4")} <strong>Lieux proposés.</strong> Recherchez un lieu dans la liste ou sélectionnez-le sur la carte.</div>
    <label class="portal-search map-picker-search">${icon("search", "size-4")}<span class="sr-only">Rechercher un lieu</span><input type="search" data-map-search placeholder="Rechercher un lieu au Gabon" value="${esc(query)}" autocomplete="off"/></label>
    <div class="map-picker-layout">
      <div class="map-picker-list" role="listbox" aria-label="Lieux prédéfinis">${
        empty ? `<p class="map-picker-empty">Aucun lieu prédéfini ne correspond à « ${esc(query)} ». Essayez Libreville, Port-Gentil, Franceville, Oyem…</p>`
        : matches.map((p) => `<button type="button" role="option" aria-selected="${selected && selected.id === p.id}" data-portal-action="map-select" data-id="${p.id}" class="map-place ${selected && selected.id === p.id ? "is-selected" : ""}"><strong>${esc(p.name)}</strong><small>${esc(p.address)}</small></button>`).join("")
      }</div>
      <div class="map-picker-map">
        <svg viewBox="0 0 100 80" class="map-svg" role="img" aria-label="Carte schématique du Gabon">
          <title>Carte schématique du Gabon</title>
          <path d="M50 102 L448 100 Q470 102 472 120 L470 200 Q465 240 458 280 Q448 320 432 360 Q415 400 390 425 Q360 445 320 452 Q280 458 230 460 Q180 460 140 450 Q100 440 70 410 Q40 380 28 340 Q22 290 30 240 Q38 200 32 170 Q30 140 40 115 Q45 105 50 102 Z" transform="translate(-5,-18) scale(0.21)" fill="#eef4f8" stroke="#5b7791" stroke-width="4"/>
          ${DEMO_PLACES.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="${selected && selected.id === p.id ? 2.6 : 1.6}" fill="${selected && selected.id === p.id ? "#009b62" : "#315c91"}" data-portal-action="map-select" data-id="${p.id}" class="map-dot"/>`).join("")}
          ${selected ? `<circle cx="${selected.x}" cy="${selected.y}" r="4.5" fill="none" stroke="#009b62" stroke-width="0.7"/><text x="${Math.min(92, selected.x + 3)}" y="${Math.max(6, selected.y - 3)}" font-size="3.2" fill="#142d52">${esc(selected.city)}</text>` : ""}
        </svg>
        <p class="map-picker-caption">Cliquez un point sur la carte pour sélectionner le lieu prédéfini le plus proche. Les coordonnées affichées sont indicatives.</p>
        ${selected ? `<dl class="map-picker-meta"><div><dt>Lieu</dt><dd>${esc(selected.name)}</dd></div><div><dt>Adresse</dt><dd>${esc(selected.address)}</dd></div><div><dt>Coordonnées</dt><dd>${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}</dd></div></dl>` : `<p class="portal-muted">Aucun lieu sélectionné.</p>`}
      </div>
    </div>
  </div>`;
}

function mapNearestPlace(x, y) {
  let best = DEMO_PLACES[0], dist = Infinity;
  DEMO_PLACES.forEach((p) => {
    const d = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (d < dist) { dist = d; best = p; }
  });
  return best;
}

function placeIllustration(place) {
  const label = place ? place.name : "Lieu non renseigné";
  return `<figure class="place-illustration">
    <svg viewBox="0 0 240 140" aria-hidden="true">
      <rect width="240" height="140" fill="#f7f8fa"/>
      <path d="M20 118h200" stroke="#c9d4df" stroke-width="2"/>
      <path d="M50 118 V58 h28 v60 M90 118 V42 h40 v76 M142 118 V64 h36 v54" fill="#e8eef4" stroke="#5b7791" stroke-width="1.4"/>
      <path d="M90 42 l20 -16 20 16" fill="none" stroke="#5b7791" stroke-width="1.4"/>
      <rect x="102" y="70" width="16" height="22" fill="#fff" stroke="#5b7791"/>
    </svg>
    <figcaption>Illustration neutre — ${esc(label)}. Ce n’est pas une photographie du lieu.</figcaption>
  </figure>`;
}

/* ------------------------------------------------------------------
   Calendrier mensuel partagé (cérémonies)
------------------------------------------------------------------ */

function renderMonthCalendar(events, options) {
  const opts = options || {};
  const monthOffset = wsState.calendarOffset || 0;
  const ref = wsCalendarMonthName(monthOffset);
  const today = DEMO_TODAY;
  const filtered = (events || []).filter((e) => {
    if (opts.status && e.status !== opts.status && e.confirmation !== opts.status) return false;
    if (opts.campaign && String(e.campaign) !== String(opts.campaign)) return false;
    if (opts.type && e.type !== opts.type) return false;
    return true;
  });
  const firstOfMonth = new Date(ref.year, ref.month, 1);
  const startDay = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(ref.year, ref.month + 1, 0).getDate();
  const cells = [];
  const prevMonthDays = new Date(ref.year, ref.month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i -= 1) cells.push({ day: prevMonthDays - i, other: true, date: new Date(ref.year, ref.month - 1, prevMonthDays - i) });
  for (let d = 1; d <= daysInMonth; d += 1) cells.push({ day: d, other: false, date: new Date(ref.year, ref.month, d) });
  while (cells.length < 42) {
    const last = cells[cells.length - 1];
    const next = new Date(last.date.getFullYear(), last.date.getMonth(), last.date.getDate() + 1);
    cells.push({ day: next.getDate(), other: next.getMonth() !== ref.month, date: next });
  }
  const todayKey = today.toDateString();
  const byDate = filtered.reduce((acc, e) => {
    const key = parseFrDate(e.date) ? parseFrDate(e.date).toDateString() : "";
    if (!key) return acc;
    (acc[key] = acc[key] || []).push(e);
    return acc;
  }, {});
  const cellsHtml = cells.map((c) => {
    const key = c.date.toDateString();
    const list = byDate[key] || [];
    const multi = list.length > 1 ? `<span class="ws-calendar-multi" title="${list.length} cérémonies">${list.length}</span>` : "";
    const eventsHtml = list.slice(0, 3).map((e) => {
      const tone = e.confirmation === "Confirmée" || e.status === "Confirmée" || e.status === "Terminée" ? "or" : e.confirmation === "Négociée" ? "argent" : "bronze";
      const pending = e.confirmation === "Proposée" || e.status === "Demande en attente";
      return `<button type="button" data-portal-action="cer-open" data-id="${esc(e.id)}" class="ws-calendar-event is-${pending ? "pending" : tone}"><span>${icon("medal", "size-3")}</span>${esc((e.title || e.place || "").replace(/^.+ — /, "").slice(0, 18))}</button>`;
    }).join("");
    const overflow = list.length > 3 ? `<span class="ws-calendar-event is-pending">+${list.length - 3}</span>` : "";
    return `<div class="ws-calendar-cell${c.other ? " is-other" : ""}${key === todayKey ? " is-today" : ""}${list.length > 1 ? " has-multi" : ""}"><span class="ws-calendar-day">${c.day}${multi}</span><div class="ws-calendar-events">${eventsHtml}${overflow}</div></div>`;
  }).join("");
  return `<section class="ws-paper portal-calendar-wrap">
    <div class="ws-section-heading">
      <div>
        <div class="ws-eyebrow">CALENDRIER DES CÉRÉMONIES</div>
        <h2 class="ws-page-title">${esc(opts.heading || "Cérémonies planifiées")}</h2>
        <p class="ws-page-lead">Les dates proposées, négociées et confirmées sont distinguées. Les cérémonies passées restent consultables.</p>
      </div>
      <div class="ws-calendar-toolbar">
        <div class="ws-calendar-nav">
          <button type="button" data-action="ws-cal-prev" class="ws-icon-btn" aria-label="Mois précédent">${icon("chevronLeft", "size-4")}</button>
          <span class="ws-calendar-title">${esc(ref.label)}</span>
          <button type="button" data-action="ws-cal-next" class="ws-icon-btn" aria-label="Mois suivant">${icon("chevronRight", "size-4")}</button>
        </div>
        <button type="button" data-action="ws-cal-today" class="ws-link">Aujourd’hui</button>
      </div>
    </div>
    <div class="ws-calendar"><div class="ws-calendar-grid">${WS_WEEKDAYS.map((w) => `<div class="ws-calendar-weekday">${w}</div>`).join("")}${cellsHtml}</div></div>
    <ul class="portal-cal-legend"><li><i class="is-pending"></i> Date proposée</li><li><i class="is-argent"></i> Date négociée</li><li><i class="is-or"></i> Date confirmée ou passée</li></ul>
  </section>`;
}

/* ------------------------------------------------------------------
   Employés
------------------------------------------------------------------ */

function filteredEmployees(data) {
  const q = demoNorm(portalState.query);
  let rows = (data.employees || []).slice();
  if (portalState.affiliation) rows = rows.filter((e) => e.status === portalState.affiliation);
  if (portalState.empNationality) rows = rows.filter((e) => e.nationalite === portalState.empNationality);
  if (portalState.empSeniority) rows = rows.filter((e) => seniorityBucket(e.start, e.end) === portalState.empSeniority);
  if (q) rows = rows.filter((e) => demoNorm(e.name + " " + e.nom + " " + e.prenom + " " + (e.poste || "")).includes(q));
  const key = portalState.empSort;
  const dir = portalState.empSortDir === "desc" ? -1 : 1;
  rows.sort((a, b) => {
    let av, bv;
    if (key === "start") { av = parseFrDate(a.start); bv = parseFrDate(b.start); }
    else if (key === "seniority") { av = monthsBetween(a.start, a.end); bv = monthsBetween(b.start, b.end); }
    else if (key === "awards") { av = employeeAwards(data, a).length; bv = employeeAwards(data, b).length; }
    else { av = demoNorm(a[key] || a.name); bv = demoNorm(b[key] || b.name); }
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
  return rows;
}

function portalEmployeesPage(data) {
  if (!data) return portalUnavailable();
  const rows = filteredEmployees(data);
  const page = Math.max(1, portalState.empPage || 1);
  const slice = rows.slice((page - 1) * EMP_PAGE_SIZE, page * EMP_PAGE_SIZE);
  const nats = [...new Set(data.employees.map((e) => e.nationalite))];
  const buckets = ["Moins de 5 ans", "5 à 9 ans", "10 à 19 ans", "20 à 29 ans", "30 ans et plus"];
  const detail = portalState.empDetail ? demoFindEmployee(data, portalState.empDetail) : null;
  return `<section class="portal-paper portal-reveal">
    <div class="portal-section-heading"><div><div class="portal-eyebrow">PERSONNES DE LA STRUCTURE</div><h2>Liste des employés</h2></div>
      <div class="portal-heading-actions">${portalLink("Enregistrer un employé", "demandeur", "employee-new", "portal-primary-link")}</div>
    </div>
    ${portalExplain("Les employés actifs, les invitations en attente et les anciennes affiliations sont distingués. Les pièces médicales ne figurent pas dans ce tableau.")}
    <div class="portal-controls">
      ${portalSearch("Nom ou prénom")}
      ${portalFilter("affiliation", "Affiliation", ["ACTIF", "EN_ATTENTE", "TERMINE"], portalState.affiliation).replace(">ACTIF<", ">Actif<").replace(">EN_ATTENTE<", ">Invitation en attente<").replace(">TERMINE<", ">Ancienne affiliation<")}
      ${portalFilter("empNationality", "Nationalité", nats, portalState.empNationality)}
      ${portalFilter("empSeniority", "Ancienneté", buckets, portalState.empSeniority)}
    </div>
    <div data-portal-results>${portalEmployeeTable(slice, data, rows.length)}</div>
    ${portalPager(rows.length, page, EMP_PAGE_SIZE, "emp-page")}
  </section>${detail ? portalEmployeeFiche(detail, data) : ""}`;
}

function portalEmployeeTable(rows, data, total) {
  if (!rows.length) return portalEmpty("Aucun employé ne correspond à ces critères.", "users");
  return `<div class="portal-table-wrap"><table class="portal-table portal-emp-table"><thead><tr>
    <th>Identité</th>
    <th>${portalSortHeader("Sexe", "sexe", portalState.empSort, portalState.empSortDir)}</th>
    <th>${portalSortHeader("Nationalité", "nationalite", portalState.empSort, portalState.empSortDir)}</th>
    <th>${portalSortHeader("Poste", "poste", portalState.empSort, portalState.empSortDir)}</th>
    <th>${portalSortHeader("Embauche", "start", portalState.empSort, portalState.empSortDir)}</th>
    <th>${portalSortHeader("Ancienneté", "seniority", portalState.empSort, portalState.empSortDir)}</th>
    <th>Affiliation</th>
    <th>${portalSortHeader("Distinctions", "awards", portalState.empSort, portalState.empSortDir)}</th>
    <th>Dernière activité</th>
    <th><span class="sr-only">Actions</span></th>
  </tr></thead><tbody>${rows.map((e) => {
    const awards = employeeAwards(data, e);
    const ongoing = awards.filter((a) => a.validation === "En attente" || a.remise === "En attente de remise").length;
    const sit = e.situationPhysique && e.situationPhysique !== "Bien portant" ? `<small class="portal-sit-flag">Situation déclarée : ${esc(e.situationPhysique)}</small>` : "";
    const fullName = demoFullName(e) || [e.prenom, e.nom].filter(Boolean).join(" ") || e.name || "—";
    return `<tr class="portal-emp-${(e.status || "actif").toLowerCase()}">
      <td><div class="portal-person-cell"><span class="portal-person-avatar">${portalInitials(e)}</span><span><strong>${esc(fullName)}</strong>${sit}</span></div></td>
      <td>${esc(e.sexe || "—")}</td>
      <td>${esc(e.nationalite || "—")}</td>
      <td>${esc(e.poste || e.job || "—")}</td>
      <td>${esc(e.start || "—")}</td>
      <td>${esc(seniorityLabel(e.start, e.end))}</td>
      <td>${portalBadge(AFFILIATION_LABEL[e.status] || e.status || "—")}</td>
      <td>${awards.length}${ongoing ? `<small>${ongoing} en cours</small>` : ""}</td>
      <td><small>${esc(e.lastActivity || "—")}</small><small>${esc(e.lastActivityLabel || "")}</small></td>
      <td>${portalButton("Fiche " + icon("arrowRight", "size-4"), "emp-open", `data-id="${esc(e.id || fullName)}"`, "portal-row-link")}</td>
    </tr>`;
  }).join("")}</tbody></table></div><p class="portal-count">${total} personne${total > 1 ? "s" : ""}</p>`;
}

function portalEmployeeFiche(emp, data) {
  const awards = employeeAwards(data, emp);
  const locked = emp.status === "TERMINE";
  const medical = emp.situationPhysique === "Mutilé" || emp.situationPhysique === "Décédé";
  return `<section class="portal-detail portal-reveal" id="portal-emp-detail" tabindex="-1">
    <div class="portal-detail-header">
      <div class="person-profile-head">
        <span class="person-avatar-lg" aria-hidden="true">${portalInitials(emp)}</span>
        <div><div class="portal-eyebrow">PROFIL EMPLOYÉ · DONNÉES FICTIVES</div><h2>${esc(emp.prenom)} ${esc(emp.nom)}</h2><p>${esc(emp.poste)} · ${portalBadge(AFFILIATION_LABEL[emp.status])}</p>
        <p class="portal-muted">L’avatar est généré à partir des initiales. Aucune photographie personnelle n’est associée.</p></div>
      </div>
      ${portalButton(icon("x", "size-4") + " Fermer", "emp-close", "", "portal-secondary")}
    </div>
    <div class="portal-detail-facts">
      <div><small>Sexe</small><strong>${esc(emp.sexe)}</strong></div>
      <div><small>Nationalité</small><strong>${esc(emp.nationalite)}</strong></div>
      <div><small>Ancienneté</small><strong>${esc(seniorityLabel(emp.start, emp.end))}</strong></div>
      <div><small>Embauche</small><strong>${esc(emp.start)}</strong></div>
      <div><small>Distinctions</small><strong>${awards.length}</strong></div>
      <div><small>Dernière activité</small><strong>${esc(emp.lastActivityLabel)}</strong></div>
    </div>
    <div class="portal-detail-columns">
      <div>
        <h3>Affiliations</h3>
        <ul class="portal-history">${(emp.affiliations || []).map((a) => `<li><time>${esc(a.start)}${a.end ? " → " + esc(a.end) : " → en cours"}</time><span>${esc(a.job)} · ${esc(AFFILIATION_LABEL[a.status] || a.status)}${a.confirmed ? "" : " · non confirmée"}</span></li>`).join("")}</ul>
        ${locked ? portalExplain("Les anciennes affiliations sont consultables. Leur historique ne peut pas être modifié rétroactivement.") : ""}
        <h3>Distinctions</h3>
        ${awards.length ? `<ul class="portal-detail-list">${awards.map((a) => `<li>${icon("medal", "size-4")}<span>${esc(a.medal)} · campagne ${esc(a.campaign)}<small>${esc(a.validation)} · ${esc(a.remise)}${a.dossier ? " · " + esc(a.dossier) : ""}</small></span></li>`).join("")}</ul>` : "<p class='portal-muted'>Aucune distinction connue.</p>"}
      </div>
      <div>
        ${medical ? `<h3>Situation physique déclarée</h3><p class="portal-small-paragraph">${esc(emp.situationPhysique)}${emp.degreMutilation ? " · " + esc(emp.degreMutilation) : ""}${emp.dateDeces ? " · décès le " + esc(emp.dateDeces) : ""}</p>
          <p class="portal-context-note">${icon("lock", "size-4")} Pièces médicales accessibles uniquement dans cette fiche : ${esc(emp.pieceMedicale || emp.acteDeces || "aucune pièce jointe")}.</p>` : `<h3>Situation physique</h3><p class="portal-muted">Bien portant — aucun détail médical n’est affiché.</p>`}
        ${emp.nationalite !== "Gabonaise" ? `<h3>Autorisation d’emploi</h3><p class="portal-small-paragraph">${esc(emp.workPermit || "Non jointe")}</p>` : ""}
        <h3>Actions</h3>
        <div class="portal-detail-actions portal-emp-actions">
          ${locked ? "" : portalButton("Modifier les informations", "emp-edit", `data-id="${esc(emp.id)}"`, "portal-secondary")}
          ${emp.status === "EN_ATTENTE" ? portalButton("Simuler la confirmation par l’employé", "emp-confirm-aff", `data-id="${esc(emp.id)}"`, "portal-primary-link") : ""}
          ${emp.status === "ACTIF" ? portalButton("Clôturer l’affiliation", "emp-end", `data-id="${esc(emp.id)}"`, "portal-secondary") : ""}
          ${portalLink("Voir les distinctions", "demandeur", "distinctions", "")}
        </div>
      </div>
    </div>
  </section>`;
}

function portalEmployeeNew(data, role) {
  if (!data) return portalUnavailable();
  const mode = portalState.empFormMode;
  const values = portalState.empForm || {};
  if (mode === "confirm") {
    return `<section class="portal-paper portal-reveal">
      <div class="portal-eyebrow">VÉRIFICATION AVANT ENREGISTREMENT</div>
      <h2>Confirmer la fiche de ${esc(values.prenom)} ${esc(values.nom)}</h2>
      ${portalExplain("L’enregistrement crée ou met à jour la fiche employé et l’affiliation. Il ne crée pas de demande de distinction.")}
      <dl class="portal-modal-facts">
        <div><dt>Identité</dt><dd>${esc(values.prenom)} ${esc(values.nom)} · ${esc(values.sexe)}</dd></div>
        <div><dt>Nationalité</dt><dd>${esc(values.nationalite)}</dd></div>
        <div><dt>Poste</dt><dd>${esc(values.poste)}</dd></div>
        <div><dt>Embauche</dt><dd>${esc(values.start)}</dd></div>
        <div><dt>Situation physique</dt><dd>${esc(values.situationPhysique || "Bien portant")}</dd></div>
        <div><dt>Affiliation</dt><dd>Invitation en attente de confirmation par l’employé</dd></div>
      </dl>
      <div class="portal-form-actions">${portalButton("Modifier", "emp-back-form", "", "portal-secondary")}${portalButton("Confirmer l’enregistrement", "emp-save", "", "portal-primary-link")}</div>
    </section>`;
  }
  const editing = portalState.empEditingId ? demoFindEmployee(data, portalState.empEditingId) : null;
  return `<section class="portal-paper portal-reveal">
    <div class="portal-eyebrow">${editing ? "MODIFICATION" : "NOUVEL EMPLOYÉ"}</div>
    <h2>${editing ? "Modifier la fiche" : "Enregistrer un employé"}</h2>
    ${portalExplain("Mêmes champs et mêmes règles que pour un récipiendaire dans le parcours de création d’une demande. Aucun dossier n’est créé automatiquement.")}
    <form id="employee-form" novalidate>
      ${personFormHtml(editing ? { ...editing, ...values } : values, { id: "employee" })}
      <div class="portal-form-actions">${portalButton("Annuler", "emp-cancel", "", "portal-secondary")}<button type="submit" class="portal-btn portal-primary-link">Vérifier avant confirmation ${icon("arrowRight", "size-4")}</button></div>
    </form>
  </section>`;
}

function portalEmployeeStats(data) {
  if (!data) return portalUnavailable();
  const campaigns = [...new Set((data.dossiers || []).map((d) => d.campaign).concat((data.awards || []).map((a) => a.campaign)))].filter(Boolean).sort();
  const s = employeeStats(data, portalState.empCampaign);
  const sexe = [{ label: "Masculin", value: s.bySexe.Masculin || 0 }, { label: "Féminin", value: s.bySexe.Féminin || 0 }];
  const nat = Object.keys(s.byNat).map((k) => ({ label: k, value: s.byNat[k], id: k }));
  const sen = Object.keys(s.bySeniority).map((k) => ({ label: k, value: s.bySeniority[k], id: k }));
  const poste = Object.keys(s.byPoste).map((k) => ({ label: k, value: s.byPoste[k] }));
  return `<section class="portal-paper portal-reveal">
    <div class="portal-eyebrow">TABLEAU DE BORD RH</div>
    <h2>Statistiques des employés</h2>
    ${portalExplain("Chiffres calculés à partir des fiches de cette structure uniquement. Cliquez un indicateur pour ouvrir la liste filtrée correspondante.")}
    <div class="portal-controls">${portalFilter("empCampaign", "Campagne ou période", campaigns, portalState.empCampaign)}</div>
    <div class="portal-stats">
      ${portalStat("Total", s.total, "Fiches de la structure", "users", "employees")}
      <button type="button" data-portal-action="emp-filter-status" data-value="ACTIF" class="portal-stat">${portalStat("Actifs", s.actifs, "Affiliations confirmées", "checkCircle").replace(/^<div class="portal-stat">/, "").replace(/<\/div>$/, "")}</button>
      <button type="button" data-portal-action="emp-filter-status" data-value="EN_ATTENTE" class="portal-stat">${portalStat("En attente", s.attente, "Invitations non confirmées", "clock").replace(/^<div class="portal-stat">/, "").replace(/<\/div>$/, "")}</button>
      <button type="button" data-portal-action="emp-filter-status" data-value="TERMINE" class="portal-stat">${portalStat("Anciens", s.anciens, "Affiliations closes", "users").replace(/^<div class="portal-stat">/, "").replace(/<\/div>$/, "")}</button>
    </div>
    <div class="portal-stats">
      ${portalStat("Ayant une distinction", s.distinguished, "Au moins une distinction validée ou remise", "medal", "distinctions")}
      ${portalStat("Dans une demande en cours", s.inRequest, "Dossier non clôturé", "folder", "dossiers")}
    </div>
  </section>
  <div class="portal-chart-grid">
    ${portalDonut(sexe, { title: "Répartition par sexe", caption: "Effectif de la structure", center: "personnes" })}
    ${portalBarChart(nat, { title: "Répartition par nationalité", caption: "Nationalité déclarée", unit: "personnes", action: "emp-filter-nat", key: "id" })}
    ${portalBarChart(sen, { title: "Répartition par ancienneté", caption: "Calculée au 14/10/2026", unit: "personnes", action: "emp-filter-sen", key: "id" })}
    ${poste.length ? portalBarChart(poste, { title: "Répartition par poste", caption: "Postes renseignés dans les fiches", unit: "personnes" }) : ""}
  </div>`;
}

/* ------------------------------------------------------------------
   Distinctions
------------------------------------------------------------------ */

function portalDistinctionsPage(data) {
  if (!data) return portalUnavailable();
  const s = distinctionStats(data);
  let list = (data.awards || []).slice();
  if (portalState.medal) list = list.filter((a) => a.medal === portalState.medal);
  if (portalState.campaign) list = list.filter((a) => a.campaign === portalState.campaign);
  if (portalState.distYear) list = list.filter((a) => a.campaign === portalState.distYear);
  if (portalState.distEmployee) list = list.filter((a) => a.name === portalState.distEmployee || a.employeeId === portalState.distEmployee);
  if (portalState.status) list = list.filter((a) => a.validation === portalState.status);
  if (portalState.distRemise) list = list.filter((a) => a.remise === portalState.distRemise);
  if (portalState.distValidation) list = list.filter((a) => a.validation === portalState.distValidation);
  const people = [...new Set((data.awards || []).map((a) => a.name))];
  const campaigns = [...new Set((data.awards || []).map((a) => a.campaign))].sort();
  const metalItems = ["Bronze", "Argent", "Or"].map((m) => ({ label: m, value: s.byMetal[m] || 0, id: m }));
  const yearItems = campaigns.map((y) => ({ label: y, value: s.byYear[y] || 0, id: y }));
  const campItems = Object.keys(s.byCampaign).sort().map((c) => ({ label: "Campagne " + c, value: s.byCampaign[c], id: c }));
  return `${`<section class="portal-award-summary portal-reveal"><div><div class="portal-eyebrow">DISTINCTIONS DE LA STRUCTURE</div><h2>${s.total} distinction${s.total > 1 ? "s" : ""} suivies</h2><p>${s.people} employés distincts concernés. Un même employé peut avoir plusieurs distinctions.</p></div></section>`}
    <div class="portal-stats portal-reveal">
      ${portalStat("Total", s.total, "Toutes campagnes", "medal")}
      ${portalStat("Validées", s.validated, "Décision favorable", "checkCircle")}
      ${portalStat("En attente", s.pending, "Instruction en cours", "clock")}
      ${portalStat("Refusées", s.refused, "Validation refusée", "x")}
      ${portalStat("Remises", s.remised, "Distinction physiquement remise", "award")}
      ${portalStat("En attente de remise", s.waitingRemise, "Validées, non encore remises", "calendar")}
    </div>
    <div class="portal-chart-grid">
      ${portalDonut(metalItems, { title: "Répartition par métal", caption: "Bronze, Argent, Or — nombre de distinctions, pas d’employés", center: "médailles" })}
      ${portalBarChart(campItems, { title: "Distinctions par campagne", caption: "Cliquez une barre pour filtrer la liste", unit: "distinctions", action: "dist-campaign", key: "id" })}
      ${portalYearChart(yearItems.map((y) => ({ label: y.label, value: y.value })), { title: "Évolution annuelle", caption: "Nombre de distinctions par année de campagne", unit: "distinctions", action: "dist-year" })}
    </div>
    <section class="portal-paper portal-reveal">
      <div class="portal-section-heading"><div><div class="portal-eyebrow">PAR EMPLOYÉ</div><h2>Liste détaillée</h2></div><span class="portal-count">${list.length} ligne${list.length > 1 ? "s" : ""}</span></div>
      <div class="portal-controls">
        ${portalFilter("distEmployee", "Employé", people, portalState.distEmployee)}
        ${portalFilter("medal", "Métal", ["Bronze", "Argent", "Or"], portalState.medal)}
        ${portalFilter("campaign", "Campagne", campaigns, portalState.campaign)}
        ${portalFilter("distYear", "Année", campaigns, portalState.distYear)}
        ${portalFilter("distValidation", "Validation", ["Validée", "En attente", "Refusée"], portalState.distValidation)}
        ${portalFilter("distRemise", "Remise", ["Remise", "En attente de remise", "Non remise"], portalState.distRemise)}
      </div>
      ${list.length ? `<div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Employé</th><th>Métal</th><th>Campagne</th><th>Dossier</th><th>Validation</th><th>Remise</th><th>Date de remise</th><th>Cérémonie</th></tr></thead><tbody>${list.map((a) => `<tr>
        <td><button type="button" class="portal-row-link" data-portal-action="emp-open" data-id="${esc(a.employeeId || a.name)}">${esc(a.name)}</button></td>
        <td><span class="portal-medal-mini">${medal({ type: a.medal === "Or" ? "or" : a.medal === "Argent" ? "argent" : "bronze", size: "sm", showRibbon: false, label: a.medal })} ${esc(a.medal)}</span></td>
        <td>${esc(a.campaign)}</td>
        <td>${a.dossier ? portalButton(a.dossier, "dossier", `data-ref="${esc(a.dossier)}"`, "portal-row-link") : "—"}</td>
        <td>${portalBadge(a.validation)}</td>
        <td>${portalBadge(a.remise)}</td>
        <td>${esc(a.remiseDate || "—")}</td>
        <td>${a.ceremony ? `<button type="button" class="portal-row-link" data-portal-action="cer-open" data-id="${esc(a.ceremony)}">${esc(a.ceremony)}</button>` : "—"}</td>
      </tr>`).join("")}</tbody></table></div>` : portalEmpty("Aucune distinction ne correspond à ces filtres.", "medal")}
    </section>`;
}

/* ------------------------------------------------------------------
   Finance
------------------------------------------------------------------ */

function portalFinancePage(data) {
  if (!data) return portalUnavailable();
  const year = portalState.financeYear;
  const s = financeStats(data, year);
  const all = financeStats(data);
  let dossiers = (data.dossiers || []).slice();
  if (year) dossiers = dossiers.filter((d) => d.campaign === year);
  if (portalState.campaign) dossiers = dossiers.filter((d) => d.campaign === portalState.campaign);
  if (portalState.financeDossier) dossiers = dossiers.filter((d) => d.ref === portalState.financeDossier);
  const rows = dossiers.map((d) => {
    const order = (data.orders || []).find((o) => o.ref === d.order);
    const medals = {};
    (d.requested || []).forEach((m) => { medals[m] = (medals[m] || 0) + 1; });
    return { dossier: d, order, medals, issued: orderIssued(order), paid: orderPaid(order), remaining: orderRemaining(order), status: financeStatus(order) };
  }).filter((row) => {
    if (portalState.financePay === "paye") return row.paid > 0 && row.remaining === 0;
    if (portalState.financePay === "attente") return row.remaining > 0 || row.status === "Paiement à vérifier";
    if (portalState.financePay === "aucun") return !row.order;
    return true;
  });
  const years = all.years;
  const yearItems = years.map((y) => ({ label: y, value: all.byYear[y].paid }));
  const lastYear = years[years.length - 1];
  const variation = yearlyVariation(all, portalState.financeYear || lastYear);
  let variationText = "Les années affichées correspondent aux campagnes enregistrées.";
  if (variation) {
    const verb = variation.delta > 0 ? "augmenté" : variation.delta < 0 ? "diminué" : "été stables";
    const pct = variation.pct == null ? "" : " de " + Math.abs(variation.pct) + " %";
    variationText = `Les dépenses payées ont ${verb}${pct} par rapport à l’année précédente (${new Intl.NumberFormat("fr-FR").format(variation.prev.paid)} → ${new Intl.NumberFormat("fr-FR").format(variation.current.paid)} FCFA).`;
    if (variation.reasons.length) variationText += " Cette évolution est à mettre en regard de " + variation.reasons.join(" et de ") + ".";
    else variationText += " Les données disponibles ne permettent pas d’attribuer une cause unique à cette variation.";
  }
  const compare = portalState.financeCompare;
  let compareHtml = "";
  if (compare && (portalState.financeYear || lastYear) && compare !== (portalState.financeYear || lastYear)) {
    const a = all.byYear[portalState.financeYear || lastYear];
    const b = all.byYear[compare];
    if (a && b) {
      const dPaid = a.paid - b.paid;
      const pct = b.paid ? Math.round((dPaid / b.paid) * 100) : null;
      compareHtml = `<section class="portal-paper"><h2>Comparaison ${esc(compare)} / ${esc(a.year)}</h2>
        <div class="portal-detail-facts">
          <div><small>Payé ${esc(compare)}</small><strong>${portalMoney(b.paid)}</strong></div>
          <div><small>Payé ${esc(a.year)}</small><strong>${portalMoney(a.paid)}</strong></div>
          <div><small>Écart</small><strong>${dPaid >= 0 ? "+" : ""}${portalMoney(dPaid)}${pct == null ? "" : " (" + (pct >= 0 ? "+" : "") + pct + " %)"}</strong></div>
        </div>
        ${portalExplain("Comparaison des montants effectivement payés, distincts des ordres de recette émis.")}
      </section>`;
    }
  }
  return `<section class="portal-paper portal-reveal">
      <div class="portal-eyebrow">SUIVI FINANCIER DE LA STRUCTURE</div>
      <h2>Tableau de bord financier</h2>
      ${portalExplain("Un ordre de recette n’est pas un paiement : seuls les montants payés sont considérés comme réglés. Barème : " + DEMO_TARIFFS.note)}
      <div class="portal-stats">
        ${portalStat("Demandé", portalMoney(s.requested), "Montant calculé sur les médailles demandées", "fileText")}
        ${portalStat("Ordre émis", portalMoney(s.issued), s.orders + " ordre" + (s.orders > 1 ? "s" : "") + " de recette", "clipboard")}
        ${portalStat("Payé", portalMoney(s.paid), "Paiements enregistrés ou quittancés", "checkCircle")}
        ${portalStat("Reste à payer", portalMoney(s.remaining), "Émis moins payé", "clock")}
      </div>
      <div class="portal-stats">
        ${portalStat("Ordres émis", s.orders, "Tous états confondus", "fileText")}
        ${portalStat("Quittances reçues", s.receipts, "Justificatifs connus", "document")}
        ${portalStat("Paiements à vérifier", s.pendingVerify, "Payés, quittance non encore validée", "alert")}
        ${portalStat("Coût moyen par dossier", s.avgPerDossier ? portalMoney(s.avgPerDossier) : "—", "Sur les dossiers ayant un ordre", "scale")}
      </div>
    </section>
    ${portalYearChart(yearItems, { title: "Évolution des dépenses payées", caption: "Montants effectivement payés par année de campagne. Cliquez une barre pour filtrer.", unit: "FCFA", action: "finance-year" })}
    <p class="portal-variation">${esc(variationText)}</p>
    <section class="portal-paper portal-reveal">
      <div class="portal-section-heading"><div><div class="portal-eyebrow">DÉPENSES PAR DEMANDE</div><h2>Détail des dossiers</h2></div>
        ${portalButton("Exporter le tableau (CSV)", "finance-export", "", "portal-secondary")}
      </div>
      <div class="portal-controls">
        ${portalFilter("financeYear", "Année", years, portalState.financeYear)}
        ${portalFilter("campaign", "Campagne", years, portalState.campaign)}
        ${portalFilter("financePay", "Paiement", ["paye", "attente", "aucun"], portalState.financePay).replace(">paye<", ">Payé<").replace(">attente<", ">Reste à payer / à vérifier<").replace(">aucun<", ">Sans ordre<")}
        ${portalFilter("financeDossier", "Dossier", data.dossiers.map((d) => d.ref), portalState.financeDossier)}
        ${portalFilter("financeCompare", "Comparer avec", years, portalState.financeCompare)}
      </div>
      ${rows.length ? `<div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Dossier</th><th>Campagne</th><th>Date</th><th>Récipiendaires</th><th>Médailles</th><th>Ordre émis</th><th>Payé</th><th>Reste</th><th>Statut financier</th></tr></thead><tbody>${rows.map((r) => `<tr>
        <td>${portalButton(r.dossier.ref, "dossier", `data-ref="${esc(r.dossier.ref)}"`, "portal-row-link")}</td>
        <td>${esc(r.dossier.campaign)}</td>
        <td>${esc(r.dossier.date)}</td>
        <td>${r.dossier.recipients.length}</td>
        <td>${["Bronze", "Argent", "Or"].filter((m) => r.medals[m]).map((m) => m + " " + r.medals[m]).join(" · ") || "—"}</td>
        <td>${r.order ? portalMoney(r.issued) : "—"}</td>
        <td>${r.order ? portalMoney(r.paid) : "—"}</td>
        <td>${r.order ? portalMoney(r.remaining) : "—"}</td>
        <td>${portalBadge(r.status)}</td>
      </tr>`).join("")}</tbody></table></div>` : portalEmpty("Aucun dossier ne correspond aux filtres financiers.", "fileText")}
    </section>
    ${compareHtml}
    <p class="portal-context-note">${icon("info", "size-4")} ${esc(DEMO_TARIFFS.note)} Bronze ${portalMoney(DEMO_TARIFFS.Bronze)} · Argent ${portalMoney(DEMO_TARIFFS.Argent)} · Or ${portalMoney(DEMO_TARIFFS.Or)}.</p>`;
}

/* ------------------------------------------------------------------
   Cérémonies
------------------------------------------------------------------ */

function portalCeremonyRequest(data) {
  if (!data) return portalUnavailable();
  const w = portalState.ceremonyWizard;
  const eligible = ceremonyEligibleDossiers(data);
  if (w.step === 1) {
    return `<section class="portal-paper portal-reveal">
      <div class="portal-wizard-steps">${["Dossier", "Date et lieu", "Récapitulatif"].map((l, i) => `<span class="${i === 0 ? "is-current" : ""}">${i + 1}. ${l}</span>`).join("")}</div>
      <div class="portal-eyebrow">DEMANDE DE CÉRÉMONIE</div>
      <h2>1. Choisir le dossier</h2>
      ${portalExplain("Une cérémonie est toujours liée à un dossier de votre structure, dont les distinctions sont validées et l’ordre de recette émis, sans cérémonie déjà ouverte.")}
      ${eligible.length ? `<div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Dossier</th><th>Campagne</th><th>Récipiendaires</th><th>Statut</th><th>Paiement</th><th>Distinctions</th><th></th></tr></thead><tbody>${eligible.map((d) => {
        const order = (data.orders || []).find((o) => o.ref === d.order);
        return `<tr class="${w.dossier === d.ref ? "is-selected-row" : ""}">
          <td><strong>${esc(d.ref)}</strong></td>
          <td>${esc(d.campaign)}</td>
          <td>${d.recipients.length}</td>
          <td>${portalBadge(d.status)}</td>
          <td>${portalBadge(financeStatus(order))}</td>
          <td>${esc((d.requested || []).join(", "))}</td>
          <td>${portalButton(w.dossier === d.ref ? "Sélectionné" : "Choisir", "cer-pick-dossier", `data-ref="${esc(d.ref)}"`, w.dossier === d.ref ? "portal-primary-link" : "portal-secondary")}</td>
        </tr>`;
      }).join("")}</tbody></table></div>
      <div class="portal-form-actions">${portalButton("Continuer", "cer-step", "data-step=\"2\"", "portal-primary-link")}</div>`
      : `<div class="portal-empty">${icon("calendar", "size-7")}<strong>Aucun dossier éligible</strong><p>Une demande de cérémonie n’est possible que pour un dossier de votre structure dont les distinctions ont été validées, dont un ordre de recette a été émis, et qui n’a pas déjà une cérémonie ouverte ou terminée.</p>${portalLink("Voir la liste des dossiers", "demandeur", "dossiers", "portal-primary-link")}</div>`}
    </section>`;
  }
  if (w.step === 2) {
    return `<section class="portal-paper portal-reveal">
      <div class="portal-wizard-steps">${["Dossier", "Date et lieu", "Récapitulatif"].map((l, i) => `<span class="${i === 1 ? "is-current" : i < 1 ? "is-done" : ""}">${i + 1}. ${l}</span>`).join("")}</div>
      <div class="portal-eyebrow">PROPOSITION — NON CONFIRMÉE</div>
      <h2>2. Date et lieu souhaités</h2>
      ${portalExplain("La date et le lieu constituent une proposition. Ils ne sont pas officiellement confirmés avant validation par le service compétent.")}
      <div class="portal-profile-grid">
        <label><span>Date souhaitée</span><input type="date" data-cer-field="date" value="${esc(w.iso || "")}" min="2026-10-14"/></label>
        <label><span>Heure souhaitée</span><input type="time" data-cer-field="time" value="${esc(w.time || "10:00")}"/></label>
        <label><span>Nombre de participants estimé</span><input type="number" min="1" data-cer-field="estimated" value="${esc(w.estimated || "")}"/></label>
        <label><span>Type de cérémonie</span><select data-cer-field="type"><option ${w.type === "Remise de distinctions" ? "selected" : ""}>Remise de distinctions</option><option ${w.type === "Cérémonie interne" ? "selected" : ""}>Cérémonie interne</option><option ${w.type === "Remise posthume" ? "selected" : ""}>Remise posthume</option></select></label>
        <label class="sm-span-2"><span>Informations complémentaires</span><textarea data-cer-field="notes" rows="3">${esc(w.notes || "")}</textarea></label>
      </div>
      <h3 class="portal-sub">Lieu proposé</h3>
      ${mapPickerHtml(w)}
      <div class="portal-form-actions">${portalButton("Retour", "cer-step", "data-step=\"1\"", "portal-secondary")}${portalButton("Voir le récapitulatif", "cer-step", "data-step=\"3\"", "portal-primary-link")}</div>
    </section>`;
  }
  const dossier = (data.dossiers || []).find((d) => d.ref === w.dossier);
  const place = w.place;
  return `<section class="portal-paper portal-reveal">
    <div class="portal-wizard-steps">${["Dossier", "Date et lieu", "Récapitulatif"].map((l, i) => `<span class="${i === 2 ? "is-current" : "is-done"}">${i + 1}. ${l}</span>`).join("")}</div>
    <div class="portal-eyebrow">ENVOI DE LA DEMANDE</div>
    <h2>3. Récapitulatif</h2>
    <dl class="portal-modal-facts">
      <div><dt>Dossier</dt><dd>${esc(w.dossier)}</dd></div>
      <div><dt>Campagne</dt><dd>${esc(dossier ? dossier.campaign : "—")}</dd></div>
      <div><dt>Date et heure proposées</dt><dd>${esc(w.date || w.iso || "—")} · ${esc(w.time || "—")}</dd></div>
      <div><dt>Lieu proposé</dt><dd>${esc(place ? place.name : "—")}</dd></div>
      <div><dt>Participants estimés</dt><dd>${esc(w.estimated || (dossier ? String(dossier.recipients.length) : "—"))}</dd></div>
      <div><dt>Statut initial</dt><dd>Demande en attente de traitement — date et lieu non confirmés</dd></div>
    </dl>
    ${place ? `<div class="map-picker-map recap-map">${mapPickerHtml({ place, placeQuery: place.name })}</div>` : ""}
    ${w.notes ? `<p class="portal-small-paragraph">Observations : ${esc(w.notes)}</p>` : ""}
    <div class="portal-form-actions">${portalButton("Modifier", "cer-step", "data-step=\"2\"", "portal-secondary")}${portalButton("Envoyer la demande", "cer-submit", "", "portal-primary-link")}</div>
  </section>`;
}

function portalCeremonyCalendar(data) {
  if (!data) return portalUnavailable();
  const events = (data.ceremonies || []).map(toCalendarEvent);
  const statuses = [...new Set(data.ceremonies.map((c) => c.status))];
  const types = [...new Set(data.ceremonies.map((c) => c.type))];
  const campaigns = [...new Set(data.ceremonies.map((c) => c.campaign))];
  const list = events.filter((e) => {
    if (portalState.calStatus && e.status !== portalState.calStatus) return false;
    if (portalState.calType && e.type !== portalState.calType) return false;
    if (portalState.calCampaign && e.campaign !== portalState.calCampaign) return false;
    return true;
  });
  const detail = portalState.cerDetail ? data.ceremonies.find((c) => c.id === portalState.cerDetail) : null;
  return `<section class="portal-paper portal-reveal">
      <div class="portal-section-heading"><div><div class="portal-eyebrow">CALENDRIER</div><h2>Calendrier des cérémonies</h2></div>
        <div class="portal-segment"><button type="button" data-portal-action="cal-view" data-value="month" aria-pressed="${portalState.calView !== "list"}">Mois</button><button type="button" data-portal-action="cal-view" data-value="list" aria-pressed="${portalState.calView === "list"}">Liste</button></div>
      </div>
      <div class="portal-controls">
        ${portalFilter("calStatus", "Statut", statuses, portalState.calStatus)}
        ${portalFilter("calCampaign", "Campagne", campaigns, portalState.calCampaign)}
        ${portalFilter("calType", "Type", types, portalState.calType)}
      </div>
    </section>
    ${portalState.calView === "list" ? `<section class="portal-paper"><div class="portal-ceremonies">${list.length ? list.map((e) => {
      const c = data.ceremonies.find((x) => x.id === e.id);
      return ceremonyCard(c, data);
    }).join("") : portalEmpty("Aucune cérémonie pour ces filtres.", "calendar")}</div></section>` : renderMonthCalendar(list, { status: portalState.calStatus, campaign: portalState.calCampaign, type: portalState.calType, heading: "Vue mensuelle" })}
    ${detail ? ceremonyFiche(detail, data) : ""}`;
}

function ceremonyCard(c, data) {
  if (!c) return "";
  const date = c.confirmedDate && c.confirmedDate !== c.date ? `Proposée ${c.date} · confirmée ${c.confirmedDate}` : (c.date || "");
  return `<article class="portal-ceremony">
    <div class="portal-date-block"><strong>${esc((c.date || "").slice(0, 2))}</strong><span>${esc((c.date || "").slice(3, 10))}</span></div>
    <div>
      <div class="portal-eyebrow">${esc(c.type || "CÉRÉMONIE")} · ${esc(c.id)}</div>
      <h3>${esc(c.place)}</h3>
      <p>Dossier ${esc(c.dossier || "—")} · campagne ${esc(c.campaign || "—")}</p>
      <small>${esc(date)} · ${esc(c.time || "")} · ${portalBadge(c.confirmation || c.status)}</small>
    </div>
    ${portalBadge(c.status)}
    ${portalButton("Détail", "cer-open", `data-id="${esc(c.id)}"`, "portal-row-link")}
  </article>`;
}

function ceremonyFiche(c, data) {
  const upcoming = ceremonyPeriod(c) === "future" && c.status !== "Terminée";
  const place = demoPlaceById(c.placeId) || demoPlaceByName(c.place);
  const participants = c.participants || [];
  return `<section class="portal-detail portal-reveal" id="portal-cer-detail" tabindex="-1">
    <div class="portal-detail-header"><div><div class="portal-eyebrow">CÉRÉMONIE · ${esc(c.id)}</div><h2>${esc(c.place)}</h2><p>${esc(c.type)} · ${portalBadge(c.status)} · confirmation ${portalBadge(c.confirmation || "—")}</p></div>${portalButton(icon("x", "size-4") + " Fermer", "cer-close", "", "portal-secondary")}</div>
    <div class="portal-detail-facts">
      <div><small>Date proposée</small><strong>${esc(c.date || "—")}</strong></div>
      <div><small>Date confirmée</small><strong>${esc(c.confirmedDate || "Non confirmée")}</strong></div>
      <div><small>Heure</small><strong>${esc(c.time || "—")}</strong></div>
      <div><small>Dossier</small><strong>${esc(c.dossier || "—")}</strong></div>
      <div><small>Campagne</small><strong>${esc(c.campaign || "—")}</strong></div>
      <div><small>Participants</small><strong>${participants.length || c.estimated || 0}</strong></div>
    </div>
    <div class="portal-detail-columns">
      <div>
        ${placeIllustration(place || { name: c.place })}
        <h3>Lieu</h3>
        <p class="portal-small-paragraph">${esc(c.place)}<br/>${esc(c.address || "")}${c.lat ? `<br/>Coordonnées indicatives : ${c.lat}, ${c.lng}` : ""}</p>
        <h3>Historique</h3>
        <ul class="portal-history">${(c.history || []).map(([d, l]) => `<li><time>${esc(d)}</time><span>${esc(l)}</span></li>`).join("")}</ul>
        <h3>Documents</h3>
        ${(c.documents || []).length ? `<ul class="portal-detail-list">${c.documents.map((d) => `<li>${icon("document", "size-4")}${esc(d)}</li>`).join("")}</ul>` : "<p class='portal-muted'>Aucun document disponible.</p>"}
      </div>
      <div>
        <h3>${upcoming ? "Personnes invitées ou attendues" : "Participants enregistrés"}</h3>
        ${participants.length ? `<ul class="portal-detail-list">${participants.map((p) => `<li>${icon("user", "size-4")}<span>${esc(p.name)}<small>${esc(p.role || "")} · ${esc(p.status)}${p.status === "Présent" ? "" : p.status === "Invité" || p.status === "Confirmé" ? " — présence non enregistrée" : ""}</small></span></li>`).join("")}</ul>` : "<p class='portal-muted'>Aucune personne listée.</p>"}
        <h3>Actions encore possibles</h3>
        <div class="portal-detail-actions">
          ${c.status === "Demande en attente" ? portalButton("Modifier la proposition", "cer-edit-request", `data-id="${esc(c.id)}"`, "portal-secondary") : ""}
          ${c.status === "Terminée" || c.status === "Refusée" || c.status === "Annulée" ? "<p class='portal-muted'>Aucune action de modification sur une cérémonie close.</p>" : ""}
          ${c.dossier ? portalButton("Ouvrir le dossier", "dossier", `data-ref="${esc(c.dossier)}"`, "portal-secondary") : ""}
        </div>
      </div>
    </div>
  </section>`;
}

function portalMyCeremonies(data) {
  if (!data) return portalUnavailable();
  const s = ceremonyStats(data);
  const bucket = portalState.cerBucket;
  const list = (data.ceremonies || []).filter((c) => {
    if (!bucket) return true;
    if (bucket === "upcoming") return ceremonyPeriod(c) === "future" && ["Confirmée", "Planifiée"].includes(c.status);
    if (bucket === "prep") return c.status === "En préparation";
    if (bucket === "pending") return c.status === "Demande en attente";
    if (bucket === "confirmed") return c.status === "Confirmée" || c.confirmation === "Confirmée";
    if (bucket === "past") return c.status === "Terminée";
    if (bucket === "refused") return c.status === "Refusée" || c.status === "Annulée";
    return true;
  });
  const typeItems = Object.keys(s.byType).map((k) => ({ label: k, value: s.byType[k] }));
  const yearItems = Object.keys(s.byYear).sort().map((y) => ({ label: y, value: s.byYear[y] }));
  const detail = portalState.cerDetail ? data.ceremonies.find((c) => c.id === portalState.cerDetail) : null;
  return `<section class="portal-paper portal-reveal">
      <div class="portal-section-heading"><div><div class="portal-eyebrow">SUIVI DES CÉRÉMONIES</div><h2>Mes cérémonies</h2></div>${portalLink("Nouvelle demande", "demandeur", "ceremony-request", "portal-primary-link")}</div>
      ${portalExplain("Les indicateurs portent uniquement sur les cérémonies de votre structure. Cliquez un chiffre pour filtrer la liste.")}
      <div class="portal-stats">
        <button type="button" class="portal-stat" data-portal-action="cer-bucket" data-value="">${portalStat("Total", s.total, "Toutes cérémonies", "calendar").replace(/^<div class="portal-stat">/, "").replace(/<\/div>$/, "")}</button>
        <button type="button" class="portal-stat" data-portal-action="cer-bucket" data-value="upcoming">${portalStat("À venir", s.upcoming, "Confirmées ou planifiées", "clock").replace(/^<div class="portal-stat">/, "").replace(/<\/div>$/, "")}</button>
        <button type="button" class="portal-stat" data-portal-action="cer-bucket" data-value="past">${portalStat("Réalisées", s.past, "Cérémonies terminées", "checkCircle").replace(/^<div class="portal-stat">/, "").replace(/<\/div>$/, "")}</button>
        <button type="button" class="portal-stat" data-portal-action="cer-bucket" data-value="pending">${portalStat("Demandes en attente", s.pending, "Non encore traitées", "alert").replace(/^<div class="portal-stat">/, "").replace(/<\/div>$/, "")}</button>
      </div>
      <div class="portal-stats">
        <button type="button" class="portal-stat" data-portal-action="cer-bucket" data-value="confirmed">${portalStat("Confirmées", s.confirmed, "Date et lieu validés", "checkCircle").replace(/^<div class="portal-stat">/, "").replace(/<\/div>$/, "")}</button>
        <button type="button" class="portal-stat" data-portal-action="cer-bucket" data-value="refused">${portalStat("Refusées / annulées", s.refused, "Demandes non retenues", "x").replace(/^<div class="portal-stat">/, "").replace(/<\/div>$/, "")}</button>
        ${portalStat("Participants aux cérémonies passées", s.pastParticipants, "Présences effectivement enregistrées", "users")}
        ${portalStat("Taux de réalisation", s.rate == null ? "—" : s.rate + " %", "Cérémonies confirmées déjà réalisées", "award")}
      </div>
    </section>
    <div class="portal-chart-grid">
      ${yearItems.length ? portalBarChart(yearItems, { title: "Évolution annuelle", caption: "Nombre de cérémonies par campagne", unit: "cérémonies" }) : ""}
      ${typeItems.length ? portalDonut(typeItems, { title: "Répartition par type", caption: "Types renseignés", center: "cérémonies" }) : ""}
    </div>
    <section class="portal-paper">
      <div class="portal-section-heading"><h2>${bucket ? "Liste filtrée" : "Toutes les cérémonies"}</h2><span class="portal-count">${list.length}</span></div>
      <div class="portal-ceremonies">${list.length ? list.map((c) => ceremonyCard(c, data)).join("") : portalEmpty("Aucune cérémonie dans cette catégorie.", "calendar")}</div>
    </section>
    ${detail ? ceremonyFiche(detail, data) : ""}`;
}

function portalPersonPending(data) {
  return (data.affiliations || []).filter((a) => a.status === "EN_ATTENTE");
}

function portalPersonOverview(data) {
  if (!data) return portalUnavailable();
  const pending = portalPersonPending(data);
  const eligible = typeof personEligibleWithdrawals === "function" ? personEligibleWithdrawals(data) : [];
  const awards = data.awards || [];
  const next = (data.ceremonies || []).find((c) => c.period === "future" && c.status !== "Refusée" && c.status !== "Annulée");
  const proposed = next && next.status !== "Confirmée" && next.confirmation !== "Confirmée";
  const actions = data.actions || [];
  const notices = portalNotices("recipient", data).slice(0, 4);
  const seen = new Set();
  const todo = [];
  pending.forEach((a) => {
    seen.add("aff-" + a.id);
    todo.push({ title: "Invitation d’affiliation", text: (a.company || "") + " — à confirmer", page: "employers" });
  });
  eligible.forEach((a) => {
    todo.push({ title: "Retrait sans cérémonie possible", text: (a.medal || "") + " · " + (a.employer || ""), page: "withdrawals" });
  });
  actions.forEach((a) => {
    const key = (a.kind || "") + (a.affiliationId || a.title || "");
    if (a.kind === "affiliation" && seen.has("aff-" + a.affiliationId)) return;
    if (seen.has(key)) return;
    seen.add(key);
    todo.push({ title: a.title, text: a.detail || a.context || "", page: a.page || "actions" });
  });
  return `<div class="portal-stats portal-reveal">
      ${portalStat("Mes distinctions", awards.length, "Tous employeurs", "medal", "recipients")}
      ${portalStat("Invitations", pending.length, "Affiliation à confirmer", "users", "employers")}
      ${portalStat("Actions à effectuer", todo.length, "Vous concernent uniquement", "fileText", "actions")}
      ${portalStat("Retraits possibles", eligible.length, "Sans cérémonie", "award", "withdrawals")}
    </div>
    <div class="portal-feature-grid">
      <section class="portal-paper portal-reveal">
        <div class="portal-section-heading"><div><div class="portal-eyebrow">À TRAITER</div><h2>Ce qui vous concerne</h2></div>${portalLink("Toutes les actions", "recipient", "actions")}</div>
        <div class="portal-activity">${todo.length ? todo.map((t) => `<button type="button" class="portal-activity-row" data-action="ws-page" data-page="${t.page}">
          <span class="portal-activity-mark"></span><span><strong>${esc(t.title)}</strong><small>${esc(t.text)}</small></span>${icon("arrowRight", "size-4")}
        </button>`).join("") : portalEmpty("Aucune action personnelle en attente.", "checkCircle")}</div>
      </section>
      <section class="portal-paper portal-reveal">
        <div class="portal-section-heading"><div><div class="portal-eyebrow">AVIS</div><h2>Notifications récentes</h2></div>${portalLink("Tout voir", "recipient", "notifications")}</div>
        <div class="portal-activity">${notices.length ? notices.map((n) => `<button type="button" class="portal-activity-row" data-portal-action="notice" data-id="${esc(n.id)}">
          <span class="portal-activity-mark"></span><span><strong>${esc(n.text)}</strong><small>${esc(n.date)}</small></span>${icon("arrowRight", "size-4")}
        </button>`).join("") : portalEmpty("Aucune notification.", "bell")}</div>
      </section>
    </div>
    <section class="portal-bottom-strip portal-reveal">
      <div>${icon("calendar", "size-5")}<span><strong>${next ? "Prochaine cérémonie · " + next.date : "Aucune cérémonie à venir"}</strong><small>${next ? esc(next.place) + (proposed ? " · date proposée, non confirmée" : " · confirmée") : "Les invitations confirmées apparaîtront ici."}</small></span></div>
      ${portalLink("Mes cérémonies", "recipient", "ceremonies")}
    </section>`;
}

function portalWorkNotices(role, data) {
  if (!data) return portalUnavailable();
  const list = portalNotices(role, data);
  const q = (portalState.query || "").toLowerCase();
  const filter = portalState.noticeFilter || "";
  const unreadN = list.filter((n) => !portalState.read.has(n.id)).length;
  const rows = list.filter((n) => {
    const hay = ((n.text || "") + " " + (n.ref || "")).toLowerCase();
    if (q && !hay.includes(q)) return false;
    const read = portalState.read.has(n.id);
    if (filter === "unread" && read) return false;
    if (filter === "read" && !read) return false;
    return true;
  });
  const order = [];
  const grouped = {};
  rows.forEach((n) => {
    const key = n.date || "Sans date";
    if (!grouped[key]) {
      grouped[key] = [];
      order.push(key);
    }
    grouped[key].push(n);
  });
  const body = rows.length
    ? order.map((g) => `<div class="notice-group">
        <div class="portal-eyebrow">${esc(g)}</div>
        ${grouped[g].map((n) => {
          const read = portalState.read.has(n.id);
          return `<button type="button" class="portal-activity-row ${read ? "is-read" : ""}" data-portal-action="notice" data-id="${esc(n.id)}">
            <span class="portal-activity-mark"></span>
            <span><strong>${esc(n.text)}</strong><small>${esc(n.ref ? n.ref + " · " : "")}${read ? "Lu localement" : "Non lu"}</small></span>
            ${icon("arrowRight", "size-4")}
          </button>`;
        }).join("")}
      </div>`).join("")
    : portalEmpty("Aucune notification ne correspond.", "bell");
  return `<section class="portal-paper portal-reveal">
      <div class="portal-section-heading"><div><div class="portal-eyebrow">MESSAGES</div><h2>Notifications</h2></div>${portalButton("Tout marquer lu", "read-all", "", "portal-secondary")}</div>
      ${portalExplain(role === "demandeur"
        ? "Chaque avis ouvre le dossier ou la page concernée. Relance et recours restent des démarches distinctes."
        : "Avis personnels : affiliations, cérémonies, retraits. Aucun montant n’est affiché.")}
      <div class="go-chips" role="group" aria-label="Filtrer les notifications">
        <button type="button" class="go-chip ${filter === "" ? "is-on" : ""}" data-portal-action="notice-filter" data-value="">Toutes<span class="chip-n">${list.length}</span></button>
        <button type="button" class="go-chip ${filter === "unread" ? "is-on" : ""}" data-portal-action="notice-filter" data-value="unread">Non lues<span class="chip-n">${unreadN}</span></button>
        <button type="button" class="go-chip ${filter === "read" ? "is-on" : ""}" data-portal-action="notice-filter" data-value="read">Lues<span class="chip-n">${list.length - unreadN}</span></button>
      </div>
      ${portalSearch("Texte ou référence")}
      <div data-portal-results class="portal-activity">${body}</div>
    </section>`;
}

function portalPersonEmployers(data) {
  if (!data) return portalUnavailable();
  const list = data.affiliations || [];
  const pending = list.filter((a) => a.status === "EN_ATTENTE");
  const active = list.filter((a) => a.status === "ACTIF");
  const closed = list.filter((a) => a.status === "TERMINE" || a.status === "REFUSEE");
  const card = (a) => {
    const locked = a.status === "TERMINE" || a.status === "REFUSEE";
    const years = seniorityLabel(a.start, a.end);
    return `<article class="aff-card aff-${(a.status || "").toLowerCase()} journey-card">
      <div class="aff-card-head">
        <span class="portal-person-avatar journey-mono">${esc((a.company || "?").slice(0, 2).toUpperCase())}</span>
        <div>
          <div class="portal-eyebrow">${esc(AFFILIATION_LABEL[a.status] || a.status).toUpperCase()}</div>
          <h3>${esc(a.company)}</h3>
          <p>${esc(a.job || "Poste non renseigné")}</p>
          <small>Du ${esc(a.start)}${a.end ? " au " + esc(a.end) : " à aujourd’hui"} · ${esc(years)}</small>
        </div>
        ${portalBadge(AFFILIATION_LABEL[a.status] || a.status)}
      </div>
      ${a.status === "EN_ATTENTE" ? `<p class="portal-muted">Cette affiliation n’est pas encore confirmée. Tant que vous ne l’acceptez pas, la structure ne peut pas vous considérer comme employé actif pour une demande de distinction.</p>
        <div class="portal-detail-actions">${portalButton("Confirmer l’affiliation", "person-aff-confirm", `data-id="${esc(a.id)}"`, "portal-primary-link")}${portalButton("Décliner", "person-aff-refuse", `data-id="${esc(a.id)}"`, "portal-secondary")}</div>` : ""}
      ${a.status === "ACTIF" ? `<p class="portal-muted">Affiliation confirmée. Vous pouvez consulter l’historique ; il n’est pas modifié rétroactivement.</p>` : ""}
      ${locked ? portalExplain("Ancienne affiliation : consultation uniquement. L’historique ne peut pas être modifié rétroactivement.") : ""}
    </article>`;
  };
  const timeline = list.length ? `<ol class="journey-timeline">${list.map((a) => `<li class="is-${(a.status || "").toLowerCase()}">
      <span class="journey-dot"></span>
      <strong>${esc(a.company)}</strong>
      <small>${esc(a.start)}${a.end ? " → " + esc(a.end) : " → aujourd’hui"} · ${esc(AFFILIATION_LABEL[a.status] || a.status)}</small>
    </li>`).join("")}</ol>` : "";
  return `<section class="portal-paper portal-reveal">
      <div class="portal-section-heading">
        <div>
          <div class="portal-eyebrow">MON PARCOURS PROFESSIONNEL</div>
          <h2>Mes employeurs</h2>
        </div>
        <span class="portal-count">${list.length} affiliation${list.length > 1 ? "s" : ""}</span>
      </div>
      ${portalExplain("Vos affiliations connues du système. Une invitation reste en attente jusqu’à votre confirmation. Ce n’est pas un CV complet.")}
      <div class="portal-stats">
        ${portalStat("Actives", active.length, "Confirmées", "checkCircle")}
        ${portalStat("Invitations", pending.length, "À confirmer", "bell")}
        ${portalStat("Anciennes", closed.length, "Consultation seule", "clock")}
      </div>
      ${timeline}
    </section>
    ${pending.length ? `<section class="portal-paper portal-reveal"><h3 class="portal-sub">Invitations en attente</h3>${pending.map(card).join("")}</section>` : ""}
    ${active.length ? `<section class="portal-paper portal-reveal"><h3 class="portal-sub">Affiliations actives</h3>${active.map(card).join("")}</section>` : ""}
    ${closed.length ? `<section class="portal-paper portal-reveal"><h3 class="portal-sub">Anciennes affiliations</h3>${closed.map(card).join("")}</section>` : ""}
    ${list.length ? "" : portalEmpty("Aucune affiliation connue.", "users")}`;
}

function portalPersonProfile(data) {
  if (!data) return portalUnavailable();
  const profile = portalProfile("recipient", data);
  const active = (data.affiliations || []).find((a) => a.status === "ACTIF");
  const pending = portalPersonPending(data).length;
  const values = Object.assign({
    nom: profile.nom,
    prenom: profile.prenom,
    sexe: profile.sexe,
    nationalite: profile.nationalite,
    poste: profile.poste || (active && active.job) || "",
    start: profile.start || (active && active.start) || "",
    situationPhysique: profile.situationPhysique || "Bien portant",
    naturalise: profile.naturalise,
    workPermit: profile.workPermit,
    naturalizationDoc: profile.naturalizationDoc,
  }, portalState.empForm || {});
  if (portalState.edit) {
    return `<section class="portal-paper portal-reveal">
      <div class="portal-eyebrow">MODIFICATION DU PROFIL</div>
      <h2>Mes informations</h2>
      ${portalExplain("Mêmes champs que le formulaire employé / récipiendaire. Les anciennes affiliations ne sont pas modifiables ici.")}
      <form id="person-profile-form" novalidate>
        ${personFormHtml(values, { id: "person-profile" })}
        <div class="portal-form-actions">${portalButton("Annuler", "cancel-edit", "", "portal-secondary")}<button type="submit" class="portal-btn portal-primary-link">Enregistrer ${icon("check", "size-4")}</button></div>
      </form>
    </section>`;
  }
  return `<section class="portal-paper portal-reveal">
    <div class="person-profile-head">
      <span class="person-avatar-lg" aria-hidden="true">${portalInitials(profile.prenom + " " + profile.nom)}</span>
      <div>
        <div class="portal-eyebrow">PROFIL EMPLOYÉ</div>
        <h2>${esc(profile.prenom)} ${esc(profile.nom)}</h2>
        <p>${esc(active ? active.job : profile.poste || "Poste non renseigné")} · ${portalBadge(active ? "Actif" : "Sans affiliation active")}</p>
        <p class="portal-muted">Aucune photographie personnelle n’est associée à ce compte.</p>
      </div>
      ${portalButton("Modifier mes informations", "edit", "", "portal-secondary")}
    </div>
    <div class="portal-detail-facts">
      <div><small>Sexe</small><strong>${esc(profile.sexe || "—")}</strong></div>
      <div><small>Nationalité</small><strong>${esc(profile.nationalite || "—")}</strong></div>
      <div><small>CNI</small><strong>${esc(profile.cni || "—")}</strong></div>
      <div><small>E-mail</small><strong>${esc(profile.email || "—")}</strong></div>
      <div><small>Embauche (affiliation active)</small><strong>${esc(active ? active.start : "—")}</strong></div>
      <div><small>Ancienneté</small><strong>${esc(active ? seniorityLabel(active.start, active.end) : "—")}</strong></div>
    </div>
    ${pending ? portalExplain(pending + " invitation" + (pending > 1 ? "s" : "") + " d’affiliation en attente de votre confirmation.") : ""}
    <h3 class="portal-sub">Affiliations</h3>
    <ul class="portal-history">${(data.affiliations || []).map((a) => `<li><time>${esc(a.start)}${a.end ? " → " + esc(a.end) : ""}</time><span>${esc(a.company)} · ${esc(a.job || "")} · ${esc(AFFILIATION_LABEL[a.status] || a.status)}</span></li>`).join("")}</ul>
    ${portalLink("Gérer les invitations", "recipient", "employers", "portal-secondary")}
  </section>`;
}

function portalPersonActions(data) {
  if (!data) return portalUnavailable();
  const pending = portalPersonPending(data);
  const eligible = typeof personEligibleWithdrawals === "function" ? personEligibleWithdrawals(data) : [];
  const inviteBlocks = pending.map((a) => `<article>
      <span class="portal-action-icon">${icon("users", "size-5")}</span>
      <div>
        <h3>Confirmer l’affiliation — ${esc(a.company)}</h3>
        <p>Vous avez été enregistré comme ${esc(a.job || "employé")}. L’affiliation n’est pas confirmée tant que vous ne l’acceptez pas.</p>
        <small>Invitation · depuis le ${esc(a.start)}</small>
      </div>
      <div class="portal-detail-actions">${portalButton("Confirmer", "person-aff-confirm", `data-id="${esc(a.id)}"`, "portal-primary-link")}${portalButton("Décliner", "person-aff-refuse", `data-id="${esc(a.id)}"`, "portal-secondary")}</div>
    </article>`).join("");
  const withdrawBlocks = eligible.map((a) => `<article>
      <span class="portal-action-icon">${icon("medal", "size-5")}</span>
      <div>
        <h3>Retrait sans cérémonie — médaille ${esc(a.medal)} ${esc(a.campaign)}</h3>
        <p>Distinction validée, encore en attente de remise. Vous pouvez demander un retrait sans cérémonie.</p>
        <small>${esc(a.employer || "")}${a.dossier ? " · " + esc(a.dossier) : ""}</small>
      </div>
      ${portalButton("Ouvrir la demande", "wd-pick", `data-id="${esc(a.id)}"`, "portal-primary-link")}
    </article>`).join("");
  const others = (data.actions || []).filter((a) => a.kind !== "affiliation");
  const otherBlocks = others.map((a) => `<article><span class="portal-action-icon">${icon("fileText", "size-5")}</span><div><h3>${esc(a.title)}</h3><p>${esc(a.detail)}</p><small>${esc(a.context)}</small></div>${portalButton("Voir les modalités", "no-api", "data-message=\"Transmission personnelle non connectée au service.\"", "portal-secondary")}</article>`).join("");
  const body = inviteBlocks + withdrawBlocks + otherBlocks;
  return `<section class="portal-paper portal-reveal">
    <div class="portal-eyebrow">VOUS CONCERNE UNIQUEMENT</div>
    <h2>Actions à effectuer</h2>
    <div class="portal-action-list">${body || portalEmpty("Aucune action personnelle en attente.", "checkCircle")}</div>
  </section>`;
}

function portalPersonParcours(data) {
  if (!data) return portalUnavailable();
  const awards = (data.awards || []).length;
  const employers = (data.affiliations || []).length;
  const ceremonies = (data.ceremonies || []).length;
  const photos = (data.photos || []).length;
  const card = (page, ico, title, text, count) => `<button type="button" data-action="ws-page" data-page="${page}" class="journey-hub-card">
      <span class="portal-stat-icon">${icon(ico, "size-5")}</span>
      <strong>${esc(title)}</strong>
      <p>${esc(text)}</p>
      <small>${count}</small>
    </button>`;
  return `<section class="portal-paper portal-reveal">
      <div class="portal-eyebrow">MON PARCOURS</div>
      <h2>Distinctions, employeurs, cérémonies et photos</h2>
      ${portalExplain("Retrouvez ici l’ensemble de votre parcours de reconnaissance. Aucun montant n’est affiché dans cet espace personnel.")}
      <div class="journey-hub">${card("recipients", "medal", "Mes distinctions", "Médailles connues, validation et remise.", awards + " distinction" + (awards > 1 ? "s" : ""))}${card("employers", "building", "Mes employeurs", "Affiliations actives, invitations et historiques.", employers + " affiliation" + (employers > 1 ? "s" : ""))}${card("ceremonies", "calendar", "Mes cérémonies", "Calendrier, invitation et validation.", ceremonies + " cérémonie" + (ceremonies > 1 ? "s" : ""))}${card("photos", "award", "Mes photos", "Illustrations conceptuelles, sans photographie personnelle.", photos + " visuel" + (photos > 1 ? "s" : ""))}</div>
    </section>`;
}

function portalPersonAwards(data) {
  if (!data) return portalUnavailable();
  const list = ((data.awards || []).map(personAwardView)).filter((a) => {
    if (portalState.medal && a.medal !== portalState.medal) return false;
    if (portalState.campaign && a.campaign !== portalState.campaign) return false;
    if (portalState.employer && a.employer !== portalState.employer) return false;
    return true;
  });
  const eligible = typeof personEligibleWithdrawals === "function" ? personEligibleWithdrawals(data) : [];
  const eligibleIds = new Set(eligible.map((a) => a.id));
  const medals = [...new Set((data.awards || []).map((a) => a.medal))];
  const campaigns = [...new Set((data.awards || []).map((a) => a.campaign))];
  const employers = [...new Set((data.awards || []).map((a) => a.employer).filter(Boolean))];
  const cards = list.map((a) => {
    const visual = a.medal === "Or" ? "or" : a.medal === "Argent" ? "argent" : "bronze";
    const canWithdraw = eligibleIds.has(a.id);
    return `<article class="journey-award">
      <span class="portal-medal-art">${medal({ type: visual, size: "sm", showRibbon: false, label: "Médaille conceptuelle de " + a.medal })}</span>
      <div>
        <div class="portal-eyebrow">MÉDAILLE ${esc(a.medal.toUpperCase())} · CAMPAGNE ${esc(a.campaign)}</div>
        <h3>Distinction de ${esc(a.medal)}</h3>
        <p>${esc(a.employer || "Employeur non renseigné")}${a.date ? " · attribuée le " + esc(a.date) : " · remise non effectuée"}</p>
        <div class="journey-chips">${portalBadge(a.validation)}${portalBadge(a.remise)}${a.ceremony ? `<span class="portal-muted">Cérémonie ${esc(a.ceremony)}</span>` : ""}</div>
      </div>
      <div class="journey-award-actions">
        ${a.ceremony ? portalButton("Voir la cérémonie", "cer-open", `data-id="${esc(a.ceremony)}"`, "portal-secondary") : ""}
        ${canWithdraw ? portalButton("Retrait sans cérémonie", "wd-pick", `data-id="${esc(a.id)}"`, "portal-primary-link") : ""}
      </div>
    </article>`;
  }).join("");
  return `<section class="portal-paper portal-reveal">
      <div class="portal-section-heading">
        <div>
          <div class="portal-eyebrow">TOUS EMPLOYEURS CONFONDUS</div>
          <h2>Mes distinctions</h2>
        </div>
        <span class="portal-count">${list.length} résultat${list.length > 1 ? "s" : ""}</span>
      </div>
      ${portalExplain("Statut de validation et de remise pour chaque distinction connue. Aucun montant n’est affiché.")}
      <div class="portal-controls">
        ${portalFilter("medal", "Médaille", medals, portalState.medal)}
        ${portalFilter("campaign", "Campagne", campaigns, portalState.campaign)}
        ${portalFilter("employer", "Employeur", employers, portalState.employer)}
      </div>
      <div class="journey-award-list">${cards || portalEmpty("Aucune distinction ne correspond à ces filtres.", "medal")}</div>
    </section>`;
}

function personCeremonyView(c, data) {
  const award = ((data && data.awards) || []).find((a) => a.ceremony === c.id || (a.medal === c.medal && a.campaign === c.campaign));
  const validation = c.validation || (award && award.validation) || "En attente";
  const invitation = c.presence === "Présent" ? "Présent" : (c.invitation || c.presence || "Invité");
  const iso = c.iso || formatIsoDate(c.confirmedDate || c.date);
  return Object.assign({}, c, { validation, invitation, iso, period: c.period || (parseFrDate(c.date) && parseFrDate(c.date) < DEMO_TODAY ? "past" : "future") });
}

function portalPersonCeremonyCard(c) {
  if (!c) return "";
  return `<article class="portal-ceremony journey-ceremony">
    <div class="portal-date-block"><strong>${esc((c.date || "").slice(0, 2))}</strong><span>${esc((c.date || "").slice(3, 10))}</span></div>
    <div>
      <div class="portal-eyebrow">${esc(c.type || "CÉRÉMONIE")} · ${esc(c.id)}</div>
      <h3>${esc(c.place)}</h3>
      <p>Médaille ${esc(c.medal || "—")} · campagne ${esc(c.campaign || "—")}</p>
      <div class="journey-chips">${portalBadge(c.status)}${portalBadge(c.validation)}${portalBadge(c.presence || c.invitation || "Invité")}</div>
    </div>
    ${portalButton("Détail", "cer-open", `data-id="${esc(c.id)}"`, "portal-row-link")}
  </article>`;
}

function portalPersonCeremonyFiche(c) {
  if (!c) return "";
  const place = (typeof demoPlaceById === "function" && c.placeId ? demoPlaceById(c.placeId) : null) || (typeof demoPlaceByName === "function" ? demoPlaceByName(c.place) : null);
  const future = (c.period || "") === "future" && c.status !== "Terminée";
  return `<section class="portal-detail portal-reveal" id="portal-cer-detail" tabindex="-1">
    <div class="portal-detail-header">
      <div>
        <div class="portal-eyebrow">MA CÉRÉMONIE · ${esc(c.id)}</div>
        <h2>${esc(c.place)}</h2>
        <p>${esc(c.type || "Cérémonie")} · ${portalBadge(c.status)} · ${portalBadge(c.confirmation || "—")}</p>
      </div>
      ${portalButton(icon("x", "size-4") + " Fermer", "cer-close", "", "portal-secondary")}
    </div>
    <div class="portal-detail-facts">
      <div><small>Date</small><strong>${esc(c.confirmedDate || c.date || "—")}</strong></div>
      <div><small>Heure</small><strong>${esc(c.time || "—")}</strong></div>
      <div><small>Médaille</small><strong>${esc(c.medal || "—")}</strong></div>
      <div><small>Validation de la distinction</small><strong>${esc(c.validation || "—")}</strong></div>
      <div><small>Invitation</small><strong>${esc(c.invitation || "—")}</strong></div>
      <div><small>Présence</small><strong>${esc(c.presence || (future ? "Non enregistrée" : "Non renseignée"))}</strong></div>
    </div>
    <div class="portal-detail-columns">
      <div>
        ${typeof placeIllustration === "function" ? placeIllustration(place || { name: c.place }) : ""}
        <h3>Lieu</h3>
        <p class="portal-small-paragraph">${esc(c.place)}<br/>${esc(c.address || "")}</p>
      </div>
      <div>
        <h3>Votre situation</h3>
        <p class="portal-small-paragraph">La distinction liée à cette cérémonie est <strong>${esc(c.validation)}</strong>. ${c.confirmation === "Confirmée" ? "La date et le lieu de la cérémonie sont confirmés." : "La cérémonie n’est pas encore confirmée."}</p>
        <div class="portal-detail-actions">
          ${future && c.invitation === "Invité" ? portalButton("Confirmer ma présence", "person-cer-confirm", `data-id="${esc(c.id)}"`, "portal-primary-link") : ""}
          ${c.validation === "Validée" && future ? portalLink("Demander un retrait sans cérémonie", "recipient", "withdrawal-request", "portal-secondary") : ""}
        </div>
      </div>
    </div>
  </section>`;
}

function portalPersonCeremonies(data) {
  if (!data) return portalUnavailable();
  const list = (data.ceremonies || []).map((c) => personCeremonyView(c, data));
  const period = portalState.period;
  const shown = list.filter((c) => {
    if (period === "future") return c.period === "future";
    if (period === "past") return c.period === "past";
    return true;
  });
  const events = shown.map(toCalendarEvent);
  const detail = portalState.cerDetail ? list.find((c) => c.id === portalState.cerDetail) : null;
  const validated = list.filter((c) => c.validation === "Validée").length;
  const confirmed = list.filter((c) => c.invitation === "Confirmé" || c.presence === "Présent").length;
  return `<section class="portal-paper portal-reveal">
      <div class="portal-section-heading">
        <div>
          <div class="portal-eyebrow">INVITATIONS ET REMISES CONNUES</div>
          <h2>Mes cérémonies</h2>
        </div>
        <div class="portal-segment">
          <button type="button" data-portal-action="cal-view" data-value="month" aria-pressed="${portalState.calView !== "list"}">Calendrier</button>
          <button type="button" data-portal-action="cal-view" data-value="list" aria-pressed="${portalState.calView === "list"}">Liste</button>
        </div>
      </div>
      ${portalExplain("Calendrier de vos cérémonies. Chaque fiche indique si votre distinction est validée et si votre invitation ou votre présence est confirmée.")}
      <div class="portal-stats">
        ${portalStat("À venir", list.filter((c) => c.period === "future").length, "Sur invitation", "calendar")}
        ${portalStat("Passées", list.filter((c) => c.period === "past").length, "Déjà tenues", "checkCircle")}
        ${portalStat("Distinctions validées", validated, "Pour ces cérémonies", "medal")}
        ${portalStat("Présence confirmée", confirmed, "Invitation ou présence", "users")}
      </div>
      <div class="portal-segment" style="margin-bottom:16px">
        <button type="button" data-portal-action="period" data-value="future" aria-pressed="${period === "future"}">À venir</button>
        <button type="button" data-portal-action="period" data-value="past" aria-pressed="${period === "past"}">Passées</button>
        <button type="button" data-portal-action="period" data-value="" aria-pressed="${!period}">Toutes</button>
      </div>
    </section>
    ${portalState.calView === "list" ? "" : renderMonthCalendar(events, { heading: "Mon calendrier" })}
    <section class="portal-paper portal-reveal">
      <div class="portal-section-heading">
        <h2>${period === "past" ? "Cérémonies passées" : period === "future" ? "Cérémonies à venir" : "Toutes mes cérémonies"}</h2>
        <span class="portal-count">${shown.length}</span>
      </div>
      <div class="portal-ceremonies">${shown.length ? shown.map(portalPersonCeremonyCard).join("") : portalEmpty("Aucune cérémonie connue pour cette période.", "calendar")}</div>
    </section>
    ${detail ? portalPersonCeremonyFiche(detail) : ""}`;
}

function portalPersonPhotos(data) {
  if (!data) return portalUnavailable();
  const photos = data.photos || [];
  const cards = photos.map((p, i) => `<button type="button" data-portal-action="photo" data-index="${i}" class="portal-photo journey-photo ${p.visual ? "" : "is-missing"}">
      <span class="portal-photo-visual">
        ${p.visual ? medal({ type: p.visual, size: "md", label: "Illustration conceptuelle de la médaille" }) : `<span class="portal-photo-error">${icon("alert", "size-6")}<small>Image indisponible</small></span>`}
        <span class="journey-photo-tag">${p.visual ? "Illustration" : "Manquante"}</span>
      </span>
      <strong>${esc((p.context || "").split(" — ")[0] || (p.visual ? "Remise de " + p.medal : "Visuel manquant"))}</strong>
      <small>${p.visual ? `${esc(p.date || "")} · ${esc(p.medal || "")}` : "Visuel manquant"}</small>
      ${p.ceremony ? `<small>Cérémonie ${esc(p.ceremony)}${p.place ? " · " + esc(p.place) : ""}</small>` : ""}
      ${icon("search", "size-4")}
    </button>`).join("");
  return `<section class="portal-paper portal-reveal">
      <div class="portal-section-heading">
        <div>
          <div class="portal-eyebrow">GALERIE PERSONNELLE</div>
          <h2>Mes photos de remise</h2>
        </div>
        <span class="portal-count">${photos.length} visuel${photos.length > 1 ? "s" : ""}</span>
      </div>
      ${portalExplain("Aucune PHOTO_DECORATION réelle n’est reliée à cette interface. Les visuels ci-dessous sont des emplacements conceptuels, sans personne réelle.")}
      <div class="portal-photo-grid journey-photo-grid">${cards || portalEmpty("Aucune photo personnelle disponible.", "award")}</div>
    </section>`;
}

function portalWithdrawFileRow(label, field, name, hint) {
  return `<label class="person-file">
      <span>${esc(label)}</span>
      <span class="person-file-row">
        <button type="button" class="portal-btn portal-secondary" data-portal-action="wd-file" data-field="${field}">${name ? "Remplacer la pièce" : "Joindre une pièce"}</button>
        <em>${esc(name || "Aucune pièce")}</em>
      </span>
      <small class="portal-muted">${esc(hint || "")}</small>
    </label>`;
}

function portalPersonWithdrawals(data) {
  if (!data) return portalUnavailable();
  const list = data.withdrawals || [];
  const eligible = typeof personEligibleWithdrawals === "function" ? personEligibleWithdrawals(data) : [];
  const detail = portalState.withdrawDetail ? list.find((w) => w.id === portalState.withdrawDetail) : null;
  const rows = list.map((w) => `<article class="journey-withdraw">
      <div>
        <div class="portal-eyebrow">${esc(w.id)} · ${esc(w.date)}</div>
        <h3>Médaille ${esc(w.medal)} · campagne ${esc(w.campaign)}</h3>
        <p>${esc(w.prenom)} ${esc(w.nom)} · ${esc(w.employer || "")}${w.dossier ? " · " + esc(w.dossier) : ""}</p>
        <small>Quittance : ${esc(w.quittance || "—")} · Autorisation : ${esc(w.permission || "—")}</small>
      </div>
      ${portalBadge(w.status)}
      ${portalButton("Détail", "wd-open", `data-id="${esc(w.id)}"`, "portal-row-link")}
    </article>`).join("");
  const fiche = detail ? `<section class="portal-detail portal-reveal" id="portal-wd-detail" tabindex="-1">
      <div class="portal-detail-header"><div><div class="portal-eyebrow">DEMANDE DE RETRAIT</div><h2>${esc(detail.id)}</h2><p>Médaille ${esc(detail.medal)} · ${esc(detail.date)}</p></div>${portalButton(icon("x", "size-4") + " Fermer", "wd-close", "", "portal-secondary")}</div>
      <div class="portal-detail-facts">
        <div><small>Identité</small><strong>${esc(detail.prenom)} ${esc(detail.nom)}</strong></div>
        <div><small>Sexe</small><strong>${esc(detail.sexe || "—")}</strong></div>
        <div><small>Nationalité</small><strong>${esc(detail.nationalite || "—")}</strong></div>
        <div><small>Entreprise</small><strong>${esc(detail.employer || "—")}</strong></div>
        <div><small>Quittance</small><strong>${esc(detail.quittance || "—")}</strong></div>
        <div><small>Autorisation d’entreprise</small><strong>${esc(detail.permission || "—")}</strong></div>
      </div>
      <ul class="portal-history">${(detail.history || []).map(([d, l]) => `<li><time>${esc(d)}</time><span>${esc(l)}</span></li>`).join("")}</ul>
    </section>` : "";
  return `<section class="portal-paper portal-reveal">
      <div class="portal-section-heading">
        <div>
          <div class="portal-eyebrow">RETRAIT SANS CÉRÉMONIE</div>
          <h2>Mes demandes</h2>
        </div>
        ${portalLink("Nouvelle demande", "recipient", "withdrawal-request", "portal-primary-link")}
      </div>
      ${portalExplain("Une demande de retrait sans cérémonie concerne une distinction validée, non encore remise. L’identité est préremplie ; la quittance et l’autorisation d’entreprise numérisée sont jointes.")}
      ${eligible.length ? `<p class="portal-muted">${eligible.length} distinction${eligible.length > 1 ? "s" : ""} éligible${eligible.length > 1 ? "s" : ""} à un nouveau retrait.</p>` : ""}
      <div class="journey-withdraw-list">${rows || portalEmpty("Aucune demande de retrait enregistrée.", "fileText")}</div>
    </section>${fiche}`;
}

function portalPersonWithdrawalRequest(data) {
  if (!data) return portalUnavailable();
  const w = portalState.withdrawWizard || emptyWithdrawWizard();
  const profile = portalProfile("recipient", data) || {};
  const eligible = typeof personEligibleWithdrawals === "function" ? personEligibleWithdrawals(data) : [];
  const selected = eligible.find((a) => a.id === w.awardId) || ((data.awards || []).map(personAwardView).find((a) => a.id === w.awardId));
  const steps = ["Choisir la distinction", "Identité", "Pièces", "Récapitulatif"];
  const stepper = `<div class="portal-wizard-steps" data-wd-steps>${steps.map((l, i) => `<span class="${w.step === i + 1 ? "is-current" : w.step > i + 1 ? "is-done" : ""}">${i + 1}. ${l}</span>`).join("")}</div>`;
  if (w.step <= 1) {
    return `<section class="portal-paper portal-reveal">
      ${stepper}
      <div class="portal-eyebrow">NOUVELLE DEMANDE</div>
      <h2>1. Choisir la distinction</h2>
      ${portalExplain("Sélectionnez la demande / distinction concernée. Seules les médailles validées et non encore remises peuvent faire l’objet d’un retrait sans cérémonie.")}
      ${eligible.length ? `<div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Distinction</th><th>Employeur</th><th>Dossier</th><th>Validation</th><th>Remise</th><th><span class="sr-only">Choisir</span></th></tr></thead><tbody>${eligible.map((a) => `<tr class="${w.awardId === a.id ? "is-selected-row" : ""}">
          <td><strong>Médaille ${esc(a.medal)}</strong><small>Campagne ${esc(a.campaign)}</small></td>
          <td>${esc(a.employer || "—")}</td>
          <td>${esc(a.dossier || "—")}</td>
          <td>${portalBadge(a.validation)}</td>
          <td>${portalBadge(a.remise)}</td>
          <td>${portalButton(w.awardId === a.id ? "Sélectionné" : "Choisir", "wd-pick-award", `data-id="${esc(a.id)}"`, w.awardId === a.id ? "portal-primary-link" : "portal-secondary")}</td>
        </tr>`).join("")}</tbody></table></div>
        <div class="portal-form-actions">${portalButton("Continuer", "wd-step", "data-step=\"2\"", "portal-primary-link")}</div>`
        : `<div class="portal-empty">${icon("medal", "size-7")}<strong>Aucune distinction éligible</strong><p>Un retrait sans cérémonie n’est possible que pour une distinction validée, non encore remise, et sans demande déjà ouverte.</p>${portalLink("Voir mes distinctions", "recipient", "recipients", "portal-primary-link")}</div>`}
    </section>`;
  }
  const q = selected && typeof withdrawalQuittanceFor === "function" ? withdrawalQuittanceFor(selected) : { name: w.quittance, label: "" };
  const identity = `<dl class="portal-modal-facts">
        <div><dt>Nom</dt><dd>${esc(profile.nom || "")}</dd></div>
        <div><dt>Prénom</dt><dd>${esc(profile.prenom || "")}</dd></div>
        <div><dt>Sexe</dt><dd>${esc(profile.sexe || "—")}</dd></div>
        <div><dt>Nationalité</dt><dd>${esc(profile.nationalite || "—")}</dd></div>
        <div><dt>Entreprise</dt><dd>${esc((selected && selected.employer) || "—")}</dd></div>
        <div><dt>Distinction</dt><dd>Médaille ${esc((selected && selected.medal) || "—")} · ${esc((selected && selected.campaign) || "")}</dd></div>
        <div><dt>Dossier</dt><dd>${esc((selected && selected.dossier) || "Sans dossier")}</dd></div>
        <div><dt>Validation</dt><dd>${esc((selected && selected.validation) || "—")}</dd></div>
      </dl>`;
  if (w.step === 2) {
    return `<section class="portal-paper portal-reveal">
      ${stepper}
      <div class="portal-eyebrow">IDENTITÉ PRÉREMPLIE</div>
      <h2>2. Vérifier l’identité</h2>
      ${portalExplain("Les champs d’identité sont repris de votre profil. Aucun montant n’est affiché.")}
      ${identity}
      ${selected && selected.ceremony ? portalExplain("Une cérémonie est associée à cette distinction (" + selected.ceremony + "). Ce retrait se ferait sans cérémonie.") : ""}
      <div class="portal-form-actions">${portalButton("Retour", "wd-step", "data-step=\"1\"", "portal-secondary")}${portalButton("Continuer", "wd-step", "data-step=\"3\"", "portal-primary-link")}</div>
    </section>`;
  }
  if (w.step === 3) {
    return `<section class="portal-paper portal-reveal">
      ${stepper}
      <div class="portal-eyebrow">PIÈCES CONSERVÉES LOCALEMENT</div>
      <h2>3. Quittance et autorisation d’entreprise</h2>
      ${portalExplain("Joignez la quittance et l’autorisation d’entreprise numérisée.")}
      <div class="portal-profile-grid">
        ${portalFileInput("quittance", (w.files && w.files.quittance) || w.quittance, "Quittance")}
        ${portalFileInput("permission", (w.files && w.files.permission) || w.permission, "Autorisation de l’entreprise (numérisée)")}
        <label class="sm-span-2"><span>Motif (facultatif)</span><textarea data-wd-field="motif" rows="3">${esc(w.motif || "")}</textarea></label>
      </div>
      ${q.label ? `<p class="portal-muted">${esc(q.label)}</p>` : ""}
      <div class="portal-form-actions">${portalButton("Retour", "wd-step", "data-step=\"2\"", "portal-secondary")}${portalButton("Voir le récapitulatif", "wd-step", "data-step=\"4\"", "portal-primary-link")}</div>
    </section>`;
  }
  return `<section class="portal-paper portal-reveal">
      ${stepper}
      <div class="portal-eyebrow">ENVOI DE LA DEMANDE</div>
      <h2>4. Récapitulatif</h2>
      ${identity}
      <p class="portal-muted">Quittance : ${esc(portalFileLabel((w.files && w.files.quittance) || w.quittance))} · Autorisation : ${esc(portalFileLabel((w.files && w.files.permission) || w.permission))}</p>
      ${!w.quittance || !w.permission ? `<p class="portal-warn" role="status">La quittance et l’autorisation d’entreprise sont requises.</p>` : portalExplain("La demande sera enregistrée localement, sans transmission réelle.")}
      <div class="portal-form-actions">${portalButton("Retour", "wd-step", "data-step=\"3\"", "portal-secondary")}${portalButton("Envoyer la demande", "wd-submit", "", "portal-primary-link")}</div>
    </section>`;
}

function portalCreateStepper(step) {
  const labels = ["Courrier d’initiation", "Récipiendaires", "Situation particulière", "Ancienneté et médaille", "Pièces complémentaires", "Récapitulatif"];
  return `<div class="portal-wizard-steps" data-create-steps>${labels.map((l, i) => `<span class="${step === i + 1 ? "is-current" : step > i + 1 ? "is-done" : ""}">${i + 1}. ${l}</span>`).join("")}</div>`;
}

function portalCreateNav(step) {
  return `<div class="portal-form-actions">${step > 1 ? portalButton("Retour", "create-step", `data-step="${step - 1}"`, "portal-secondary") : ""}${step < 6 ? portalButton("Continuer", "create-step", `data-step="${step + 1}"`, "portal-primary-link") : portalButton("Créer la demande", "create-submit", "", "portal-primary-link")}</div>`;
}

function portalRecipientYears(r) {
  return r.years != null ? Number(r.years) : seniorityYears(r.start);
}

function portalDossierStatsPage(data) {
  if (!data) return portalUnavailable();
  const s = dossierStats(data);
  const statusItems = Object.keys(s.byStatus).map((k) => ({ label: k, value: s.byStatus[k] }));
  const campItems = Object.keys(s.byCampaign).sort().map((k) => ({ label: "Campagne " + k, value: s.byCampaign[k], id: k }));
  return `<section class="portal-paper portal-reveal">
      <div class="portal-eyebrow">SUIVI DES DEMANDES</div>
      <h2>Statistiques des dossiers</h2>
      ${portalExplain("Chiffres calculés à partir des dossiers de cette structure uniquement.")}
      <div class="portal-stats">
        ${portalStat("Total", s.total, "Toutes campagnes", "folder", "dossiers")}
        ${portalStat("En cours", s.open, "Non clôturés", "clock", "dossiers")}
        ${portalStat("Clôturés", s.closed, "Cérémonie terminée", "checkCircle")}
        ${portalStat("Récipiendaires", s.recipients, "Personnes concernées", "users")}
      </div>
    </section>
    <div class="portal-chart-grid">
      ${portalDonut(statusItems, { title: "Répartition par statut", caption: "Statut communiqué au demandeur", center: "dossiers" })}
      ${portalBarChart(campItems, { title: "Dossiers par campagne", caption: "Cliquez une barre pour ouvrir la liste filtrée", unit: "dossiers", action: "dossier-campaign", key: "id" })}
    </div>`;
}

function portalCreateDossier(data) {
  if (!data) return portalUnavailable();
  const w = portalState.createWizard || emptyCreateWizard();
  if (w.done) {
    return `<section class="portal-paper portal-reveal" data-create-wizard>
      <div class="portal-eyebrow">DEMANDE CRÉÉE</div>
      <h2>Dossier ${esc(w.createdRef)}</h2>
      ${portalExplain("La demande est enregistrée. Vérifiez le récapitulatif avant de quitter cette page.")}
      <div class="portal-form-actions">${portalLink("Voir mes dossiers", "demandeur", "dossiers", "portal-primary-link")}${portalButton("Créer une autre demande", "create-reset", "", "portal-secondary")}</div>
    </section>`;
  }
  const step = w.step || 1;
  let body = "";
  if (step === 1) {
    const dests = typeof DEMO_DESTINATIONS !== "undefined" ? DEMO_DESTINATIONS : [{ id: "dr", label: "Direction Régionale du Travail" }];
    body = `<h2>1. Courrier d’initiation</h2>
      ${portalExplain("Le courrier d’initiation est obligatoire.")}
      <div class="portal-profile-grid">
        <label><span>Autorité destinataire</span><select data-create-field="destination">${dests.map((d) => `<option value="${d.id}" ${w.destination === d.id ? "selected" : ""}>${esc(d.label)}</option>`).join("")}</select></label>
      </div>
      ${portalFileInput("letter", w.letter, "Courrier d’initiation (PDF ou document)")}
      ${w.letter ? `<p class="portal-muted">Pièce conservée : ${esc(portalFileLabel(w.letter))}</p>` : `<p class="portal-warn" role="status">Joignez le courrier avant de continuer.</p>`}`;
  } else if (step === 2) {
    const rows = (w.recipients || []).map((r, i) => `<tr>
        <td>${esc(r.prenom)} ${esc(r.nom)}</td>
        <td>${esc(r.poste || "—")}</td>
        <td>${esc(r.nationalite || "—")}</td>
        <td>${portalButton("Retirer", "create-del-rec", `data-index="${i}"`, "portal-row-link")}</td>
      </tr>`).join("");
    body = `<h2>2. Récipiendaires</h2>
      ${portalExplain("Saisissez chaque récipiendaire. Les justificatifs d’emploi ou de naturalisation n’apparaissent que lorsqu’ils sont nécessaires. Cette saisie n’enregistre pas automatiquement une affiliation.")}
      ${(w.recipients || []).length ? `<div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Identité</th><th>Poste</th><th>Nationalité</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>` : `<p class="portal-muted">Aucun récipiendaire pour l’instant.</p>`}
      <h3 class="portal-sub">Ajouter un récipiendaire</h3>
      ${personFormHtml(portalState.empForm, { id: "create-recipient", showMedal: false })}
      <div class="portal-form-actions">${portalButton("Ajouter à la demande", "create-add-rec", "", "portal-secondary")}</div>`;
  } else if (step === 3) {
    const cards = (w.recipients || []).map((r, i) => {
      const warn = r.situationPhysique === "Décédé" && deathOlderThanTwoYears(r.dateDeces);
      return `<article class="portal-paper" data-create-sit="${i}">
        <h3>${esc(r.prenom)} ${esc(r.nom)}</h3>
        <p class="portal-muted">${esc(r.situationPhysique || "Bien portant")}${r.dateDeces ? " · décès le " + esc(r.dateDeces) : ""}${r.degreMutilation ? " · " + esc(r.degreMutilation) : ""}</p>
        <div class="portal-segment person-sit">${["Bien portant", "Mutilé", "Décédé"].map((s) => `<button type="button" data-portal-action="create-sit" data-index="${i}" data-value="${s}" aria-pressed="${(r.situationPhysique || "Bien portant") === s}">${s}</button>`).join("")}</div>
        ${warn ? `<p class="portal-warn" role="status">Le décès déclaré date de plus de deux ans. Cette information est signalée ; elle n’empêche pas de poursuivre la demande.</p>` : ""}
      </article>`;
    }).join("");
    body = `<h2>3. Situation particulière</h2>
      ${portalExplain("Bien portant, mutilé ou décédé. Un décès de plus de deux ans est signalé, sans bloquer la création.")}
      ${cards || `<p class="portal-warn">Ajoutez au moins un récipiendaire à l’étape précédente.</p>`}`;
  } else if (step === 4) {
    const rows = (w.recipients || []).map((r, i) => {
      const years = portalRecipientYears(r);
      const hint = indicativeMedal(years);
      return `<tr>
        <td>${esc(r.prenom)} ${esc(r.nom)}</td>
        <td>${years} an${years > 1 ? "s" : ""}</td>
        <td>${hint ? "Médaille " + esc(hint) : "Sous le seuil indicatif de 10 ans"}</td>
        <td><select data-create-medal="${i}"><option ${r.medal === "Bronze" ? "selected" : ""}>Bronze</option><option ${r.medal === "Argent" ? "selected" : ""}>Argent</option><option ${r.medal === "Or" ? "selected" : ""}>Or</option></select></td>
      </tr>`;
    }).join("");
    body = `<h2>4. Ancienneté et médaille</h2>
      ${portalExplain("L’ancienneté est calculée au 14/10/2026. La médaille indiquée est un repère ; elle n’est pas un moteur réglementaire.")}
      ${(w.recipients || []).length ? `<div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Récipiendaire</th><th>Ancienneté</th><th>Médaille indicative</th><th>Médaille demandée</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<p class="portal-warn">Aucun récipiendaire.</p>`}`;
  } else if (step === 5) {
    const extras = (w.extras || []).map((f) => `<li>${esc(portalFileLabel(f))}</li>`).join("");
    body = `<h2>5. Pièces complémentaires</h2>
      ${portalExplain("Le DTS est facultatif à la création. Un dossier peut être déposé sans ce document ; le service pourra demander un complément plus tard.")}
      ${portalFileInput("dts", w.dts, "DTS — Document de travail et de synthèse (facultatif)")}
      ${portalFileInput("extra", null, "Autre justificatif")}
      ${extras ? `<ul class="portal-detail-list">${extras}</ul>` : `<p class="portal-muted">Aucune pièce complémentaire pour l’instant.</p>`}`;
  } else {
    const dest = (typeof DEMO_DESTINATIONS !== "undefined" ? DEMO_DESTINATIONS : []).find((d) => d.id === w.destination);
    const miss = [];
    if (!w.letter) miss.push("courrier d’initiation");
    if (!(w.recipients || []).length) miss.push("au moins un récipiendaire");
    body = `<h2>6. Récapitulatif</h2>
      <dl class="portal-modal-facts">
        <div><dt>Destinataire</dt><dd>${esc(dest ? dest.label : w.destination)}</dd></div>
        <div><dt>Courrier</dt><dd>${esc(w.letter ? portalFileLabel(w.letter) : "Manquant")}</dd></div>
        <div><dt>Récipiendaires</dt><dd>${(w.recipients || []).length}</dd></div>
        <div><dt>DTS</dt><dd>${esc(w.dts ? portalFileLabel(w.dts) : "Non joint (facultatif)")}</dd></div>
      </dl>
      <ul class="portal-detail-list">${(w.recipients || []).map((r) => `<li>${icon("user", "size-4")}<span>${esc(r.prenom)} ${esc(r.nom)}<small>${esc(r.poste || "")} · ${portalRecipientYears(r)} ans · ${esc(r.medal || indicativeMedal(portalRecipientYears(r)) || "—")} · ${esc(r.situationPhysique || "Bien portant")}</small></span></li>`).join("")}</ul>
      ${miss.length ? `<p class="portal-warn" role="status">Éléments manquants : ${esc(miss.join(", "))}. Le courrier et au moins un récipiendaire sont requis.</p>` : portalExplain("Vérifiez les informations. La création enregistre le dossier dans le magasin local.")}`;
  }
  return `<section class="portal-paper portal-reveal" data-create-wizard>
    ${portalCreateStepper(step)}
    <div class="portal-eyebrow">CRÉER UNE DEMANDE · DÉMONSTRATION</div>
    ${body}
    ${portalCreateNav(step)}
  </section>`;
}

const WORK_PAGE_SIZE = 6;
const WORK_TABS = [
  ["resume", "Résumé"],
  ["recip", "Récipiendaires"],
  ["documents", "Documents"],
  ["complements", "Compléments"],
  ["relances", "Relances"],
  ["recours", "Recours"],
  ["ceremonie", "Cérémonie"],
  ["historique", "Historique"],
];

function workStatusBuckets() {
  return ["Soumis", "En instruction", "Complément demandé", "Ordre de recette émis", "Cérémonie terminée"];
}

function workMatchesQuery(d, q) {
  if (!q) return true;
  const hay = [d.ref, d.campaign, (d.recipients || []).join(" "), d.status, d.initial].join(" ").toLowerCase();
  return hay.includes(q.toLowerCase());
}

function workMatchesPeriod(d, period) {
  if (!period) return true;
  const dt = typeof parseFrDate === "function" ? parseFrDate(d.date) : null;
  if (!dt) return true;
  const y = dt.getFullYear();
  if (period === "2026") return y === 2026;
  if (period === "2025") return y === 2025;
  if (period === "older") return y < 2025;
  return true;
}

function workDossierStatus(s) {
  return !s || s === "open" || s === "action" || workStatusBuckets().includes(s);
}

function workFilteredDossiers(data) {
  const list = ((data && data.dossiers) || []).map((d) => (typeof hydrateDossierWork === "function" ? hydrateDossierWork(d) : d));
  return list.filter((d) => {
    const st = workDossierStatus(portalState.status) ? portalState.status : "";
    if (st === "action" && typeof dossierNeedsAction === "function" && !dossierNeedsAction(d)) return false;
    if (st === "open" && typeof dossierIsClosed === "function" && dossierIsClosed(d)) return false;
    if (st && st !== "action" && st !== "open" && d.status !== st) return false;
    if (portalState.campaign && d.campaign !== portalState.campaign) return false;
    if (!workMatchesQuery(d, portalState.query)) return false;
    if (!workMatchesPeriod(d, portalState.dossierPeriod)) return false;
    return true;
  }).sort((a, b) => {
    const da = typeof parseFrDate === "function" ? parseFrDate(a.date) : 0;
    const db = typeof parseFrDate === "function" ? parseFrDate(b.date) : 0;
    return (portalState.sort === "old" ? 1 : -1) * ((db || 0) - (da || 0));
  });
}

function workChip(label, value, count, current) {
  return `<button type="button" class="go-chip ${current === value ? "is-on" : ""}" data-portal-action="work-filter" data-status="${esc(value)}">${esc(label)}<span class="chip-n">${count}</span></button>`;
}

function portalWorkStat(label, value, sub, ico, page, status) {
  return `<button type="button" class="portal-stat" data-portal-action="work-goto" data-page="${page}" data-status="${esc(status || "")}">
    <span class="portal-stat-icon">${icon(ico, "size-5")}</span>
    <span class="portal-stat-body"><small>${esc(label)}</small><strong>${esc(String(value))}</strong><span>${esc(sub)}</span></span>
    ${icon("arrowRight", "size-4 portal-stat-arrow")}
  </button>`;
}

function portalWorkOverview(data, role) {
  if (!data) return portalUnavailable();
  const w = typeof workOverview === "function" ? workOverview(data) : { list: data.dossiers || [], open: [], recent: [], action: [], complements: [], relances: [], recours: [], cerPending: [], nextCer: null };
  const next = w.nextCer;
  const todo = [
    ...w.complements.map((x) => ({ title: "Complément à fournir", text: x.dossier.ref + " — " + x.complement.objet, page: "complements", ref: x.dossier.ref })),
    ...w.relances.map((x) => ({ title: "Relance en cours", text: x.dossier.ref + " — " + x.relance.motif, page: "relances", ref: x.dossier.ref })),
    ...w.recours.map((x) => ({ title: "Recours en cours", text: x.dossier.ref + " — " + x.recours.motif, page: "recours", ref: x.dossier.ref })),
    ...w.cerPending.map((c) => ({ title: "Cérémonie proposée", text: (c.date || "Date à confirmer") + " · " + (c.place || ""), page: "ceremonies", ref: c.id })),
  ];
  const recent = (w.recent || []).map((d) => `<button type="button" class="portal-activity-row" data-portal-action="work-open" data-ref="${esc(d.ref)}" data-page="dossiers">
      <span class="portal-activity-mark"></span>
      <span><strong>${esc(d.ref)}</strong><small>${esc(d.date)} · ${esc(d.next || d.status)}</small></span>
      ${portalBadge(d.status)}
    </button>`).join("");
  return `${typeof goHead === "function" ? goHead({ eyebrow: "Vue d’ensemble", title: "Vue d’ensemble", sub: "Demandes de votre organisme, actions de votre ressort et circuit des dossiers." }) : ""}
    <div class="portal-stats portal-reveal">
      ${portalWorkStat("Dossiers en cours", w.open.length, "Non clôturés", "folder", "dossiers", "open")}
      ${portalWorkStat("Récemment déposés", (w.recent || []).length, "Derniers enregistrements", "clock", "dossiers", "")}
      ${portalWorkStat("Action requise", w.action.length, "Complément ou réponse", "alert", "dossiers", "action")}
      ${portalWorkStat("Compléments ouverts", w.complements.length, "À traiter par vous", "fileText", "complements", "ouvert")}
    </div>
    <div class="portal-stats portal-reveal" style="--i:1">
      ${portalWorkStat("Relances en cours", w.relances.length, "Suivi demandé", "refresh", "relances", "")}
      ${portalWorkStat("Recours en cours", w.recours.length, "Démarche distincte", "scale", "recours", "")}
      ${portalWorkStat("Cérémonies proposées", w.cerPending.length, "Non confirmées", "calendar", "ceremonies", "")}
      ${portalWorkStat("Prochaine échéance", next ? next.date : "—", next ? (next.status === "Confirmée" ? "Date confirmée" : "Proposition en attente") : "Aucune", "calendar", next ? "ceremonies" : "ceremony-calendar", "")}
    </div>
    <div class="portal-feature-grid">
      <section class="portal-paper portal-reveal">
        <div class="portal-section-heading"><div><div class="portal-eyebrow">À TRAITER</div><h2>Actions qui vous concernent</h2></div>${portalLink("Tous les dossiers", role, "dossiers")}</div>
        <div class="portal-activity">${todo.length ? todo.map((t) => `<button type="button" class="portal-activity-row" data-portal-action="work-open" data-ref="${esc(t.ref || "")}" data-page="${t.page}">
          <span class="portal-activity-mark"></span><span><strong>${esc(t.title)}</strong><small>${esc(t.text)}</small></span>${icon("arrowRight", "size-4")}
        </button>`).join("") : portalEmpty("Aucune action en attente de votre part.", "checkCircle")}</div>
      </section>
      <section class="portal-paper portal-reveal">
        <div class="portal-section-heading"><div><div class="portal-eyebrow">ACTIVITÉ RÉCENTE</div><h2>Dossiers récemment déposés</h2></div>${portalLink("Voir la liste", role, "dossiers")}</div>
        <div class="portal-activity">${recent || portalEmpty("Aucun dossier.")}</div>
      </section>
    </div>
    ${typeof goPipeline === "function" ? (() => {
      const by = {};
      (data.dossiers || []).forEach((d) => { by[d.status] = (by[d.status] || 0) + 1; });
      return goPipeline(by, "dossiers");
    })() : ""}
    <section class="portal-bottom-strip portal-reveal">
      <div>${icon("calendar", "size-5")}<span><strong>${next ? "Prochaine cérémonie · " + next.date : "Aucune cérémonie à venir"}</strong><small>${next ? esc(next.place) + (next.status === "Confirmée" ? " · confirmée" : " · date proposée") : "Les dates confirmées apparaîtront ici."}</small></span></div>
      ${portalLink("Voir les cérémonies", role, "ceremonies")}
    </section>`;
}

function portalWorkDossiers(data, role) {
  if (!data) return portalUnavailable();
  const rows = workFilteredDossiers(data);
  const all = data.dossiers || [];
  const page = portalState.dossierPage || 1;
  const slice = rows.slice((page - 1) * WORK_PAGE_SIZE, page * WORK_PAGE_SIZE);
  const counts = { "": all.length, open: all.filter((d) => typeof dossierIsClosed === "function" ? !dossierIsClosed(d) : true).length, action: all.filter((d) => typeof dossierNeedsAction === "function" && dossierNeedsAction(d)).length };
  workStatusBuckets().forEach((s) => { counts[s] = all.filter((d) => d.status === s).length; });
  const current = portalState.status || "";
  const table = slice.length ? `<div class="portal-table-wrap table-wrap"><table class="data-table portal-table responsive" id="df-table"><thead><tr><th>Référence</th><th>Dépôt</th><th>Statut</th><th>Récipiendaires</th><th>Prochaine étape</th><th><span class="sr-only">Détail</span></th></tr></thead><tbody>${slice.map((d) => `<tr>
      <td data-label="Référence"><strong>${esc(d.ref)}</strong><small>Campagne ${esc(d.campaign)}</small></td>
      <td data-label="Dépôt">${esc(d.date)}</td>
      <td data-label="Statut">${portalBadge(d.status)}</td>
      <td data-label="Récipiendaires">${(d.recipients || []).length}</td>
      <td data-label="Prochaine étape">${esc(d.next || "Dossier clôturé")}</td>
      <td data-label="">${portalButton("Consulter " + icon("arrowRight", "size-4"), "work-open", `data-ref="${esc(d.ref)}" data-page="dossiers"`, "portal-row-link")}</td>
    </tr>`).join("")}</tbody></table></div>` : portalEmpty("Aucun dossier ne correspond à ces critères.");
  return `${typeof goHead === "function" ? goHead({ eyebrow: "Instruction", title: "Mes dossiers", sub: "Demandes déposées par votre organisme, leur avancement et les pièces échangées." }) : ""}
    <section class="go-card card portal-paper portal-reveal">
      <div class="portal-section-heading"><div><div class="portal-eyebrow">SUIVI DES DEMANDES</div><h2>Mes dossiers</h2></div>
        <div class="portal-heading-actions">${portalLink("Créer une demande", role, "new-dossier", "portal-primary-link")}<span class="portal-count">${rows.length} dossier${rows.length > 1 ? "s" : ""}</span></div>
      </div>
      <div class="go-chips" role="group" aria-label="Filtrer par statut">
        ${workChip("Tous", "", counts[""], current)}
        ${workChip("En cours", "open", counts.open, current)}
        ${workChip("Action requise", "action", counts.action, current)}
        ${workStatusBuckets().map((s) => workChip(s, s, counts[s] || 0, current)).join("")}
      </div>
      <div class="portal-controls">${portalSearch("Référence, récipiendaire ou organisme")}
        ${portalFilter("campaign", "Campagne", [...new Set(all.map((d) => d.campaign))], portalState.campaign)}
        <label class="portal-filter"><span>Période</span><select data-portal-filter="dossierPeriod">
          <option value="">Toutes</option>
          <option value="2026" ${portalState.dossierPeriod === "2026" ? "selected" : ""}>2026</option>
          <option value="2025" ${portalState.dossierPeriod === "2025" ? "selected" : ""}>2025</option>
          <option value="older" ${portalState.dossierPeriod === "older" ? "selected" : ""}>Avant 2025</option>
        </select></label>
        <label class="portal-filter"><span>Date</span><select data-portal-filter="sort">
          <option value="new" ${portalState.sort === "new" ? "selected" : ""}>Plus récents</option>
          <option value="old" ${portalState.sort === "old" ? "selected" : ""}>Plus anciens</option>
        </select></label>
      </div>
      <div data-portal-results>${table}${portalPager(rows.length, page, WORK_PAGE_SIZE, "work-page")}</div>
    </section>
    ${portalState.detail ? portalWorkDossierDetail((data.dossiers || []).find((d) => d.ref === portalState.detail), data, role) : ""}
    <div class="portal-context-note">${icon("info", "size-4")} Le courrier d’initiation est obligatoire pour déposer une demande. ${portalLink("Créer une demande", role, "new-dossier")}</div>`;
}

function portalWorkDossierDetail(d, data, role) {
  if (!d) return "";
  if (typeof hydrateDossierWork === "function") hydrateDossierWork(d);
  const order = (data.orders || []).find((o) => o.ref === d.order);
  const cer = (data.ceremonies || []).find((c) => c.id === d.ceremony || c.dossier === d.ref);
  const tab = portalState.dossierTab || "resume";
  const openCpl = (d.complements || []).filter((c) => c.status === "ouvert").length;
  const visibleTabs = WORK_TABS.filter(([k]) => {
    if (k === "complements") return (d.complements || []).length;
    if (k === "relances") return (d.relances || []).length || (typeof canAskRelance === "function" && canAskRelance(d));
    if (k === "recours") return (d.recours || []).length || (typeof canAskRecours === "function" && canAskRecours(d));
    if (k === "ceremonie") return !!(cer || d.ceremony);
    return true;
  });
  const current = visibleTabs.some((t) => t[0] === tab) ? tab : "resume";
  let body = "";
  if (current === "resume") {
    body = `<div class="work-meta">
        <div><small>Destinataire initial</small><strong>${esc(d.initial)}</strong></div>
        <div><small>Statut communiqué</small>${portalBadge(d.status)}</div>
        <div><small>Prochaine étape</small><strong>${esc(d.next || "Aucune action attendue")}</strong></div>
        <div><small>Campagne</small><strong>${esc(d.campaign)}</strong></div>
      </div>
      <h3>Progression communiquée</h3>
      <ol class="portal-steps">${(d.steps || []).map((step, i) => `<li class="${i === (d.steps || []).length - 1 ? "is-current" : "is-complete"}"><span>${i + 1}</span>${esc(step)}</li>`).join("")}</ol>
      ${openCpl ? `<p class="portal-warn" role="status">${openCpl} complément${openCpl > 1 ? "s" : ""} à fournir. ${portalButton("Répondre", "work-open", `data-ref="${esc(d.ref)}" data-page="complements"`, "portal-secondary")}</p>` : ""}`;
  } else if (current === "recip") {
    body = `<ul class="portal-detail-list">${(d.recipients || []).map((name, i) => `<li>${icon("user", "size-4")}<span>${esc(name)}<small>Demandée : ${esc((d.requested || [])[i] || "—")} · ${(d.validated || []).some((s) => String(s).startsWith(name + " —")) ? "Validée individuellement" : "Validation non connue"}</small></span></li>`).join("")}</ul>`;
  } else if (current === "documents") {
    const docs = d.documents || [];
    body = docs.length ? `<ul class="portal-detail-list">${docs.map((doc) => `<li>${icon("document", "size-4")}<span>${esc(doc.name)}<small>${esc(doc.kind)} · ${esc(doc.date || d.date)}</small></span>${portalButton("Aperçu", "work-doc", `data-ref="${esc(d.ref)}" data-id="${esc(doc.id)}"`, "portal-small")}</li>`).join("")}</ul>` : `<p class="work-empty-hint">Aucune pièce associée.</p>`;
  } else if (current === "complements") {
    body = (d.complements || []).length ? d.complements.map((c) => workComplementCard(d, c, role)).join("") : `<p class="work-empty-hint">Aucun complément demandé sur ce dossier.</p>`;
  } else if (current === "relances") {
    body = (d.relances || []).map((r) => `<article class="work-card"><h3>${esc(r.motif)}</h3><small>${esc(r.date)} · ${esc(r.status)}</small>${r.suite ? `<p>${esc(r.suite)}</p>` : ""}</article>`).join("") || `<p class="work-empty-hint">Aucune relance.</p>`;
    if (typeof canAskRelance === "function" && canAskRelance(d)) {
      body += `<div class="work-actions">${portalButton("Déposer une relance", "work-open", `data-ref="${esc(d.ref)}" data-page="relances"`, "portal-secondary")}</div>`;
    }
  } else if (current === "recours") {
    body = (d.recours || []).map((r) => `<article class="work-card"><h3>${esc(r.motif)}</h3><small>${esc(r.date)} · ${esc(r.status)}</small>${r.suite ? `<p>${esc(r.suite)}</p>` : ""}</article>`).join("") || `<p class="work-empty-hint">Aucun recours.</p>`;
    if (typeof canAskRecours === "function" && canAskRecours(d)) {
      body += `<div class="work-actions">${portalButton("Déposer un recours", "work-open", `data-ref="${esc(d.ref)}" data-page="recours"`, "portal-secondary")}</div>`;
    }
  } else if (current === "ceremonie") {
    const proposed = cer && cer.status !== "Confirmée" && cer.status !== "Terminée";
    body = cer ? `<div class="work-meta">
        <div><small>Date</small><strong>${esc(cer.confirmedDate || cer.date || "—")}</strong></div>
        <div><small>Statut</small>${portalBadge(cer.status)}</div>
        <div><small>Lieu</small><strong>${esc(cer.place)}</strong></div>
      </div>
      <p class="portal-small-paragraph">${proposed ? "Date et lieu proposés — en attente de validation administrative. Ce n’est pas une confirmation." : (cer.status === "Confirmée" ? "Date et lieu confirmés par le service compétent." : "Cérémonie close.")}</p>` : `<p class="work-empty-hint">Aucune cérémonie liée.</p>`;
  } else {
    body = `<ul class="work-timeline">${(d.history || []).map(([date, label]) => `<li><time>${esc(date)}</time><span>${esc(label)}</span></li>`).join("")}</ul>`;
  }
  return `<section class="portal-detail portal-reveal" id="portal-detail" tabindex="-1">
    <div class="portal-detail-header"><div><div class="portal-eyebrow">FICHE DU DOSSIER</div><h2>${esc(d.ref)}</h2><p>Campagne ${esc(d.campaign)} · déposé le ${esc(d.date)}</p></div>${portalButton(icon("x", "size-4") + " Fermer", "close-detail", "", "portal-secondary")}</div>
    <div class="work-tabs" role="tablist">${visibleTabs.map(([k, l]) => `<button type="button" role="tab" class="work-tab ${current === k ? "is-on" : ""}" data-portal-action="work-tab" data-tab="${k}" aria-selected="${current === k}">${esc(l)}</button>`).join("")}</div>
    <div class="work-section">${body}</div>
    ${order ? `<div class="portal-detail-actions">${portalButton("Voir l’ordre de recette " + icon("arrowRight", "size-4"), "order", `data-ref="${esc(order.ref)}"`, "portal-primary-link")}</div>` : ""}
  </section>`;
}

function workComplementCard(d, c, role) {
  const open = c.status === "ouvert";
  const draft = (portalState.workReply && portalState.workReply[c.id]) || "";
  return `<article class="work-card" id="cpl-${esc(c.id)}">
    <h3>${esc(c.objet)}</h3>
    <small>Dossier ${esc(d.ref)} · demandé le ${esc(c.date)}${c.destinataire ? " · " + esc(c.destinataire) : ""} · ${esc(c.status)}</small>
    ${(c.piecesAttendues || []).length ? `<p>Pièces attendues : ${esc(c.piecesAttendues.join(", "))}</p>` : ""}
    ${c.reponse ? `<p>Réponse du ${esc(c.reponse.date)} : ${esc(c.reponse.texte || "Pièces transmises.")}</p>` : ""}
    ${open ? `<label><span class="sr-only">Réponse</span><textarea data-work-reply="${esc(c.id)}" rows="3" placeholder="Précisez les éléments transmis.">${esc(draft)}</textarea></label>
      <div class="work-actions">${portalButton("Joindre une pièce", "work-cpl-file", `data-cid="${esc(c.id)}" data-ref="${esc(d.ref)}"`, "portal-secondary")}${portalButton("Transmettre la réponse", "work-cpl-send", `data-cid="${esc(c.id)}" data-ref="${esc(d.ref)}"`, "portal-primary-link")}</div>
      <p class="work-empty-hint">Ouvrir cette page ne clôture pas le complément.</p>` : `<p class="work-empty-hint">Complément ${esc(c.status)}.</p>`}
  </article>`;
}

function portalWorkComplements(data, role) {
  if (!data) return portalUnavailable();
  const items = (typeof collectComplements === "function" ? collectComplements(data) : []).filter((x) => {
    if (portalState.status === "ouvert") return x.complement.status === "ouvert";
    if (portalState.status === "répondu") return x.complement.status === "répondu";
    return true;
  });
  const open = items.filter((x) => x.complement.status === "ouvert");
  return `<section class="portal-paper portal-reveal">
      <div class="portal-section-heading"><div><div class="portal-eyebrow">À COMPLÉTER</div><h2>Compléments</h2></div><span class="portal-count">${open.length} ouvert${open.length > 1 ? "s" : ""}</span></div>
      ${portalExplain("Un complément n’est traité que lorsque la réponse est transmise, pas lorsque la page est ouverte.")}
      <div class="go-chips">
        ${workChip("Tous", "", items.length, portalState.status || "")}
        ${workChip("Ouverts", "ouvert", open.length, portalState.status)}
      </div>
      <div class="work-section">${items.length ? items.map((x) => workComplementCard(x.dossier, x.complement, role)).join("") : portalEmpty("Aucun complément pour vos dossiers.", "checkCircle")}</div>
    </section>`;
}

function portalWorkFollowForm(kind, data) {
  const can = kind === "relance" ? canAskRelance : canAskRecours;
  const eligible = (data.dossiers || []).filter((d) => typeof can === "function" && can(d));
  const title = kind === "relance" ? "Nouvelle relance" : "Nouveau recours";
  const help = kind === "relance"
    ? "Une relance sollicite un suivi. Elle n’ouvre pas une contestation."
    : "Un recours est une démarche administrative distincte d’une relance.";
  if (!eligible.length) {
    return `<section class="portal-paper portal-reveal"><h2>${esc(title)}</h2>${portalExplain("Aucun dossier n’est dans un état permettant cette opération.")}</section>`;
  }
  return `<section class="portal-paper portal-reveal" data-work-follow="${kind}">
      <div class="portal-eyebrow">${kind === "relance" ? "SUIVI" : "CONTESTATION"}</div>
      <h2>${esc(title)}</h2>
      ${portalExplain(help)}
      <div class="portal-profile-grid">
        <label><span>Dossier</span><select data-work-follow-ref>${eligible.map((d) => `<option value="${esc(d.ref)}" ${portalState.detail === d.ref ? "selected" : ""}>${esc(d.ref)} · ${esc(d.status)}</option>`).join("")}</select></label>
        <label class="sm-span-2"><span>Motif</span><textarea data-work-follow-motif rows="3" placeholder="${kind === "relance" ? "Précisez le suivi demandé." : "Exposez le motif du recours."}">${esc((portalState.workReply && portalState.workReply.follow) || "")}</textarea></label>
      </div>
      <div class="work-actions">${portalButton(kind === "relance" ? "Enregistrer la relance" : "Enregistrer le recours", "work-follow-send", `data-kind="${kind}"`, "portal-primary-link")}</div>
    </section>`;
}

function portalWorkRelances(data, role) {
  if (!data) return portalUnavailable();
  const items = typeof collectRelances === "function" ? collectRelances(data) : [];
  return `<section class="portal-paper portal-reveal">
      <div class="portal-section-heading"><div><div class="portal-eyebrow">SUIVI</div><h2>Relances</h2></div></div>
      ${portalExplain("La relance n’est pas un recours. Elle ne statue pas sur le dossier.")}
      <div class="work-section">${items.length ? items.map((x) => `<article class="work-card">
        <h3>${esc(x.relance.motif)}</h3>
        <small>${esc(x.dossier.ref)} · ${esc(x.relance.date)} · ${esc(x.relance.status)}</small>
        ${x.relance.suite ? `<p>${esc(x.relance.suite)}</p>` : ""}
        <div class="work-actions">${portalButton("Ouvrir le dossier", "work-open", `data-ref="${esc(x.dossier.ref)}" data-page="dossiers" data-tab="relances"`, "portal-row-link")}</div>
      </article>`).join("") : portalEmpty("Aucune relance enregistrée.", "refresh")}</div>
    </section>${portalWorkFollowForm("relance", data)}`;
}

function portalWorkRecours(data, role) {
  if (!data) return portalUnavailable();
  const items = typeof collectRecours === "function" ? collectRecours(data) : [];
  return `<section class="portal-paper portal-reveal">
      <div class="portal-section-heading"><div><div class="portal-eyebrow">CONTESTATION</div><h2>Recours</h2></div></div>
      ${portalExplain("Le recours est distinct de la relance. Il n’est proposé que si l’état du dossier le permet.")}
      <div class="work-section">${items.length ? items.map((x) => `<article class="work-card">
        <h3>${esc(x.recours.motif)}</h3>
        <small>${esc(x.dossier.ref)} · ${esc(x.recours.date)} · ${esc(x.recours.status)}</small>
        ${x.recours.suite ? `<p>${esc(x.recours.suite)}</p>` : ""}
        <div class="work-actions">${portalButton("Ouvrir le dossier", "work-open", `data-ref="${esc(x.dossier.ref)}" data-page="dossiers" data-tab="recours"`, "portal-row-link")}</div>
      </article>`).join("") : portalEmpty("Aucun recours enregistré.", "scale")}</div>
    </section>${portalWorkFollowForm("recours", data)}`;
}

function portalWorkDocuments(data, role) {
  if (!data) return portalUnavailable();
  const items = typeof collectDocuments === "function" ? collectDocuments(data) : [];
  const q = (portalState.query || "").toLowerCase();
  const rows = items.filter((x) => !q || `${x.document.name} ${x.dossier.ref}`.toLowerCase().includes(q));
  return `<section class="portal-paper portal-reveal">
      <div class="portal-section-heading"><div><div class="portal-eyebrow">PIÈCES</div><h2>Courriers et documents</h2></div><span class="portal-count">${rows.length}</span></div>
      ${portalExplain("Consultation uniquement. Les visas et transmissions restent réservés aux services internes.")}
      ${portalSearch("Nom du document ou référence")}
      ${rows.length ? `<div class="portal-table-wrap"><table class="portal-table responsive"><thead><tr><th>Document</th><th>Dossier</th><th>Type</th><th>Date</th><th></th></tr></thead><tbody>${rows.map((x) => `<tr>
        <td data-label="Document"><strong>${esc(x.document.name)}</strong></td>
        <td data-label="Dossier">${esc(x.dossier.ref)}</td>
        <td data-label="Type">${esc(x.document.kind)}</td>
        <td data-label="Date">${esc(x.document.date || x.dossier.date)}</td>
        <td>${portalButton("Aperçu", "work-doc", `data-ref="${esc(x.dossier.ref)}" data-id="${esc(x.document.id)}"`, "portal-row-link")}</td>
      </tr>`).join("")}</tbody></table></div>` : portalEmpty("Aucun document.")}
    </section>`;
}

function portalExtrasContent(role, page, data) {
  if (role === "recipient") {
    if (page === "overview") return portalPersonOverview(data);
    if (page === "parcours") return portalPersonParcours(data);
    if (page === "recipients") return portalPersonAwards(data);
    if (page === "employers") return portalPersonEmployers(data);
    if (page === "ceremonies") return portalPersonCeremonies(data);
    if (page === "photos") return portalPersonPhotos(data);
    if (page === "withdrawals") return portalPersonWithdrawals(data);
    if (page === "withdrawal-request") return portalPersonWithdrawalRequest(data);
    if (page === "profile") return portalPersonProfile(data);
    if (page === "actions") return portalPersonActions(data);
    if (page === "notifications") return portalWorkNotices(role, data);
    return null;
  }
  if (role !== "demandeur") {
    if (page === "ceremonies") return portalCeremonies(role, data);
    return null;
  }
  if (page === "overview") return portalWorkOverview(data, role);
  if (page === "dossiers") return portalWorkDossiers(data, role);
  if (page === "complements") return portalWorkComplements(data, role);
  if (page === "relances") return portalWorkRelances(data, role);
  if (page === "recours") return portalWorkRecours(data, role);
  if (page === "documents") return portalWorkDocuments(data, role);
  if (page === "employees") return portalEmployeesPage(data);
  if (page === "employee-new") return portalEmployeeNew(data, role);
  if (page === "employee-stats") return portalEmployeeStats(data);
  if (page === "distinctions") return portalDistinctionsPage(data);
  if (page === "payments") return portalFinancePage(data);
  if (page === "ceremony-request") return portalCeremonyRequest(data);
  if (page === "ceremony-calendar") return portalCeremonyCalendar(data);
  if (page === "ceremonies") return portalMyCeremonies(data);
  if (page === "new-dossier") return portalCreateDossier(data);
  if (page === "dossier-stats") return portalDossierStatsPage(data);
  if (page === "notifications") return portalWorkNotices(role, data);
  return null;
}

function portalExtrasAction(action, el, role, page) {
  const data = portalData(role);
  const org = portalOrgKey();
  switch (action) {
    case "notice-filter": {
      portalState.noticeFilter = el.dataset.value || "";
      portalUpdateResults(role, page);
      return true;
    }
    case "nav-menu": {
      portalState.navOpen = portalState.navOpen === el.dataset.menu ? null : el.dataset.menu;
      portalState.menu = false;
      portalState.noticesOpen = false;
      portalRepaint(role, page);
      return true;
    }
    case "work-filter":
      portalState.status = el.dataset.status || "";
      portalState.dossierPage = 1;
      portalUpdateResults(role, page);
      return true;
    case "work-page":
      portalState.dossierPage = Number(el.dataset.page) || 1;
      portalUpdateResults(role, page);
      return true;
    case "work-tab":
      portalState.dossierTab = el.dataset.tab || "resume";
      portalUpdateResults(role, page);
      document.getElementById("portal-detail")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
      return true;
    case "work-goto": {
      portalState.status = el.dataset.status || "";
      portalState.query = "";
      portalState.dossierPage = 1;
      portalState.detail = null;
      const target = el.dataset.page || "dossiers";
      if (target === page) portalUpdateResults(role, page);
      else wsGo(role, target);
      return true;
    }
    case "work-open": {
      const ref = el.dataset.ref || "";
      const target = el.dataset.page || "dossiers";
      portalState.detail = ref;
      if (el.dataset.tab) portalState.dossierTab = el.dataset.tab;
      else if (target === "complements") portalState.dossierTab = "complements";
      else if (target === "relances") portalState.dossierTab = "relances";
      else if (target === "recours") portalState.dossierTab = "recours";
      else portalState.dossierTab = portalState.dossierTab || "resume";
      if (target === page) {
        portalUpdateResults(role, page);
        document.getElementById("portal-detail")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
      } else wsGo(role, target);
      return true;
    }
    case "work-doc": {
      portalState.overlay = { type: "work-doc", ref: el.dataset.ref, id: el.dataset.id };
      portalOverlayPaint(role);
      return true;
    }
    case "work-cpl-file": {
      portalState.files = portalState.files || {};
      portalState.files["cpl-" + el.dataset.cid] = { name: "complement-" + (el.dataset.ref || "dossier") + ".pdf", size: 24576 };
      portalNotice("Pièce conservée localement : " + portalState.files["cpl-" + el.dataset.cid].name + ". Aucun envoi réel.");
      return true;
    }
    case "work-cpl-send": {
      const cid = el.dataset.cid;
      const ref = el.dataset.ref;
      const texte = (portalState.workReply && portalState.workReply[cid]) || "";
      const file = portalState.files && portalState.files["cpl-" + cid];
      if (!texte.trim() && !file) {
        portalNotice("Indiquez une réponse ou joignez une pièce.", "error");
        return true;
      }
      const rec = replyComplement(portalOrgKey(), ref, cid, { texte, piece: file && file.name });
      if (!rec) {
        portalNotice("Ce complément n’est plus ouvert.", "error");
        return true;
      }
      if (portalState.workReply) delete portalState.workReply[cid];
      portalNotice("Réponse enregistrée pour " + ref + ". Le complément n’est plus ouvert.");
      portalUpdateResults(role, page);
      return true;
    }
    case "work-follow-send": {
      const kind = el.dataset.kind;
      const root = document.querySelector("[data-work-follow]");
      const ref = (root && root.querySelector("[data-work-follow-ref]") && root.querySelector("[data-work-follow-ref]").value) || portalState.detail;
      const motif = (root && root.querySelector("[data-work-follow-motif]") && root.querySelector("[data-work-follow-motif]").value) || "";
      if (!ref || !motif.trim()) {
        portalNotice("Choisissez un dossier et un motif.", "error");
        return true;
      }
      const rec = kind === "relance" ? addDossierRelance(portalOrgKey(), ref, motif) : addDossierRecours(portalOrgKey(), ref, motif);
      if (!rec) {
        portalNotice("Cette opération n’est pas autorisée pour ce dossier.", "error");
        return true;
      }
      if (portalState.workReply) portalState.workReply.follow = "";
      portalNotice((kind === "relance" ? "Relance" : "Recours") + " enregistré pour " + ref + ".");
      portalUpdateResults(role, page);
      return true;
    }
    case "emp-sort": {
      if (portalState.empSort === el.dataset.sort) portalState.empSortDir = portalState.empSortDir === "asc" ? "desc" : "asc";
      else { portalState.empSort = el.dataset.sort; portalState.empSortDir = "asc"; }
      portalUpdateResults(role, page);
      return true;
    }
    case "emp-page":
      portalState.empPage = Number(el.dataset.page) || 1;
      portalUpdateResults(role, page);
      return true;
    case "emp-open": {
      const emp = demoFindEmployee(data, el.dataset.id);
      if (page !== "employees") {
        portalState.empDetail = emp ? emp.id : el.dataset.id;
        portalState.affiliation = "";
        wsGo(role, "employees");
        return true;
      }
      portalState.empDetail = el.dataset.id;
      portalUpdateResults(role, page);
      document.getElementById("portal-emp-detail")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
      return true;
    }
    case "emp-close":
      portalState.empDetail = null;
      portalUpdateResults(role, page);
      return true;
    case "emp-edit":
      portalState.empEditingId = el.dataset.id;
      portalState.empForm = { ...demoFindEmployee(data, el.dataset.id) };
      portalState.empFormMode = "create";
      portalState.empFormDirty = false;
      wsGo(role, "employee-new");
      return true;
    case "emp-cancel":
      portalClearDirty();
      portalState.empForm = {};
      portalState.empEditingId = null;
      wsGo(role, "employees");
      return true;
    case "emp-back-form":
      portalState.empFormMode = "create";
      portalUpdateResults(role, page);
      return true;
    case "emp-save": {
      const fields = portalState.empForm;
      const editing = portalState.empEditingId;
      const rec = editing
        ? updateEmployeeRecord(org, editing, fields)
        : addEmployeeRecord(org, fields);
      portalClearDirty();
      portalState.empForm = {};
      portalState.empEditingId = null;
      portalState.empFormMode = "create";
      portalState.empDetail = rec && rec.id;
      portalNotice(editing ? "Fiche mise à jour localement. Aucune demande de distinction n’a été créée." : "Employé enregistré. Affiliation en attente de confirmation par l’employé (simulation). Aucune demande de distinction n’a été créée.");
      wsGo(role, "employees");
      return true;
    }
    case "emp-confirm-aff": {
      updateEmployeeRecord(org, el.dataset.id, { status: "ACTIF", invitationSent: false, lastActivityLabel: "Affiliation confirmée par l’employé (simulation)" });
      const emp = demoFindEmployee(demoOrg(), el.dataset.id);
      if (emp && emp.affiliations && emp.affiliations[0]) emp.affiliations[0].confirmed = true;
      if (emp) syncPersonFromEmployeeConfirm(emp);
      demoSave();
      portalNotice("Affiliation confirmée.");
      portalRepaint(role, page);
      return true;
    }
    case "person-aff-confirm": {
      const aff = confirmPersonAffiliation(el.dataset.id);
      portalNotice(aff ? "Affiliation confirmée. Vous figurez désormais comme employé actif auprès de " + aff.company + "." : "Invitation introuvable.", aff ? "info" : "error");
      portalRepaint(role, page);
      return true;
    }
    case "person-aff-refuse": {
      const aff = refusePersonAffiliation(el.dataset.id);
      portalNotice(aff ? "Invitation déclinée. L’historique reste consultable, sans modification rétroactive." : "Invitation introuvable.", aff ? "info" : "error");
      portalRepaint(role, page);
      return true;
    }
    case "emp-end": {
      const emp = demoFindEmployee(data, el.dataset.id);
      updateEmployeeRecord(org, el.dataset.id, { status: "TERMINE", end: formatFrDate(DEMO_TODAY), lastActivityLabel: "Affiliation clôturée" });
      if (emp && emp.affiliations && emp.affiliations[0]) {
        emp.affiliations[0].status = "TERMINE";
        emp.affiliations[0].end = formatFrDate(DEMO_TODAY);
      }
      demoSave();
      portalNotice("Affiliation clôturée. L’historique reste consultable, sans modification rétroactive.");
      portalRepaint(role, page);
      return true;
    }
    case "emp-filter-status":
      portalState.affiliation = el.dataset.value;
      portalState.empPage = 1;
      wsGo(role, "employees");
      return true;
    case "emp-filter-nat":
      portalState.empNationality = el.dataset.value;
      wsGo(role, "employees");
      return true;
    case "emp-filter-sen":
      portalState.empSeniority = el.dataset.value;
      wsGo(role, "employees");
      return true;
    case "person-sit": {
      portalState.empForm = Object.assign(portalState.empForm, personFormRead(document.querySelector("[data-person-form]")), { situationPhysique: el.dataset.value });
      portalState.empFormDirty = true;
      portalUpdateResults(role, page);
      return true;
    }
    case "fake-file": {
      const name = el.dataset.field + "-demo.pdf";
      portalState.empForm = Object.assign(portalState.empForm, personFormRead(document.querySelector("[data-person-form]")), { [el.dataset.field]: name });
      portalState.empFormDirty = true;
      if (portalState.ceremonyWizard) { /* keep */ }
      portalUpdateResults(role, page);
      portalNotice("Pièce jointe simulée : " + name + " — aucun fichier n’a été transmis.");
      return true;
    }
    case "dist-campaign":
      portalState.campaign = el.dataset.value;
      portalUpdateResults(role, page);
      return true;
    case "dist-year":
      portalState.distYear = el.dataset.value;
      portalUpdateResults(role, page);
      return true;
    case "finance-year":
      portalState.financeYear = el.dataset.value;
      portalUpdateResults(role, page);
      return true;
    case "finance-export": {
      const rows = (data.dossiers || []).map((d) => {
        const order = (data.orders || []).find((o) => o.ref === d.order);
        return [d.ref, d.campaign, d.date, d.recipients.length, orderIssued(order), orderPaid(order), orderRemaining(order), financeStatus(order)].join(";");
      });
      const csv = "Dossier;Campagne;Date;Recipiendaires;Emis;Paye;Reste;Statut\n" + rows.join("\n");
      try {
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "finances-demonstration.csv";
        a.click();
        URL.revokeObjectURL(url);
        portalNotice("Export CSV téléchargé.");
      } catch {
        portalNotice("Export indisponible dans cet environnement.", "error");
      }
      return true;
    }
    case "map-select": {
      const place = demoPlaceById(el.dataset.id);
      portalState.ceremonyWizard.place = place;
      portalState.ceremonyWizard.placeQuery = place ? place.name : "";
      portalState.ceremonyWizard.dirty = true;
      portalUpdateResults(role, page);
      return true;
    }
    case "cer-pick-dossier":
      portalState.ceremonyWizard.dossier = el.dataset.ref;
      portalState.ceremonyWizard.dirty = true;
      portalUpdateResults(role, page);
      return true;
    case "cer-step": {
      const step = Number(el.dataset.step);
      if (step === 2 && !portalState.ceremonyWizard.dossier) {
        portalNotice("Sélectionnez un dossier avant de continuer.", "error");
        return true;
      }
      if (step === 3) {
        if (!portalState.ceremonyWizard.iso && !portalState.ceremonyWizard.date) {
          portalNotice("Indiquez une date souhaitée.", "error");
          return true;
        }
        if (!portalState.ceremonyWizard.place) {
          portalNotice("Sélectionnez un lieu dans la liste ou sur la carte.", "error");
          return true;
        }
        if (portalState.ceremonyWizard.iso) portalState.ceremonyWizard.date = formatFrDate(portalState.ceremonyWizard.iso);
      }
      portalState.ceremonyWizard.step = step;
      portalUpdateResults(role, page);
      return true;
    }
    case "cer-submit": {
      const w = portalState.ceremonyWizard;
      const rec = addCeremonyRequest(org, {
        dossier: w.dossier,
        date: w.date,
        iso: w.iso,
        time: w.time,
        place: w.place,
        estimated: w.estimated,
        notes: w.notes,
        type: w.type,
      });
      portalClearDirty();
      portalState.ceremonyWizard = { step: 1, dossier: "", date: "", time: "10:00", place: null, placeQuery: "", estimated: "", notes: "", dirty: false, type: "Remise de distinctions" };
      portalState.cerDetail = rec.id;
      portalNotice("Demande " + rec.id + " créée. Statut : en attente de traitement. Date et lieu non confirmés.");
      wsGo(role, "ceremonies");
      return true;
    }
    case "cer-open":
      portalState.cerDetail = el.dataset.id;
      if (page !== "ceremonies" && page !== "ceremony-calendar") wsGo(role, "ceremonies");
      else portalUpdateResults(role, page);
      setTimeout(() => document.getElementById("portal-cer-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
      return true;
    case "cer-close":
      portalState.cerDetail = null;
      portalUpdateResults(role, page);
      return true;
    case "cer-bucket":
      portalState.cerBucket = el.dataset.value;
      portalUpdateResults(role, page);
      return true;
    case "cer-edit-request": {
      const c = data.ceremonies.find((x) => x.id === el.dataset.id);
      if (!c || c.status !== "Demande en attente") return true;
      portalState.ceremonyWizard = {
        step: 2,
        dossier: c.dossier,
        date: c.date,
        iso: c.iso,
        time: c.time,
        place: demoPlaceById(c.placeId),
        placeQuery: c.place,
        estimated: String(c.estimated || ""),
        notes: c.notes || "",
        dirty: false,
        type: c.type,
      };
      wsGo(role, "ceremony-request");
      return true;
    }
    case "create-step": {
      const w = portalState.createWizard || emptyCreateWizard();
      const next = Number(el.dataset.step) || 1;
      if (next > 1 && !w.letter) {
        portalNotice("Le courrier d’initiation est obligatoire.", "error");
        w.step = 1;
        portalState.createWizard = w;
        portalUpdateResults(role, page);
        return true;
      }
      if (next > 2 && !(w.recipients || []).length) {
        portalNotice("Ajoutez au moins un récipiendaire.", "error");
        w.step = 2;
        portalState.createWizard = w;
        portalUpdateResults(role, page);
        return true;
      }
      w.step = Math.max(1, Math.min(6, next));
      w.dirty = true;
      portalState.createWizard = w;
      portalUpdateResults(role, page);
      return true;
    }
    case "create-add-rec": {
      const root = document.querySelector("[data-person-form]");
      const fields = personFormRead(root);
      const errors = personFormValidate(fields);
      personFormApplyErrors(root, errors);
      if (Object.keys(errors).length) {
        portalNotice("Corrigez les champs du récipiendaire avant de l’ajouter.", "error");
        return true;
      }
      const years = seniorityYears(fields.start);
      const rec = Object.assign({}, fields, {
        name: (fields.prenom || "") + " " + (fields.nom || ""),
        years,
        medal: fields.medal || indicativeMedal(years) || "Bronze",
        situationPhysique: fields.situationPhysique || "Bien portant",
      });
      const w = portalState.createWizard || emptyCreateWizard();
      w.recipients = (w.recipients || []).concat([rec]);
      w.dirty = true;
      portalState.createWizard = w;
      portalState.empForm = {};
      portalNotice("Récipiendaire ajouté à la demande. Aucune affiliation employé n’a été créée automatiquement.");
      portalUpdateResults(role, page);
      return true;
    }
    case "create-del-rec": {
      const w = portalState.createWizard || emptyCreateWizard();
      w.recipients = (w.recipients || []).filter((_, i) => i !== Number(el.dataset.index));
      w.dirty = true;
      portalState.createWizard = w;
      portalUpdateResults(role, page);
      return true;
    }
    case "create-sit": {
      const w = portalState.createWizard || emptyCreateWizard();
      const rec = w.recipients[Number(el.dataset.index)];
      if (rec) rec.situationPhysique = el.dataset.value;
      w.dirty = true;
      portalState.createWizard = w;
      portalUpdateResults(role, page);
      return true;
    }
    case "create-submit": {
      const w = portalState.createWizard || emptyCreateWizard();
      if (!w.letter) {
        portalNotice("Le courrier d’initiation est obligatoire.", "error");
        w.step = 1;
        portalState.createWizard = w;
        portalUpdateResults(role, page);
        return true;
      }
      if (!(w.recipients || []).length) {
        portalNotice("Ajoutez au moins un récipiendaire.", "error");
        w.step = 2;
        portalState.createWizard = w;
        portalUpdateResults(role, page);
        return true;
      }
      const rec = addDossierRecord(org, {
        destination: w.destination,
        letter: w.letter,
        dts: w.dts,
        extras: w.extras,
        recipients: w.recipients,
      });
      portalClearDirty();
      portalState.createWizard = Object.assign(emptyCreateWizard(), { done: true, createdRef: rec.ref });
      portalState.detail = rec.ref;
      portalNotice("Dossier " + rec.ref + " créé. Statut : Soumis. Aucune transmission réelle.");
      portalUpdateResults(role, page);
      return true;
    }
    case "create-reset":
      portalState.createWizard = emptyCreateWizard();
      portalState.wizardPrepared = true;
      portalUpdateResults(role, page);
      return true;
    case "dossier-campaign":
      portalState.campaign = el.dataset.value || el.dataset.id || "";
      wsGo(role, "dossiers");
      return true;
    case "wizard-add-person": {
      const root = document.querySelector("[data-person-form]");
      const fields = personFormRead(root);
      const errors = personFormValidate(fields);
      personFormApplyErrors(root, errors);
      if (Object.keys(errors).length) {
        portalNotice("Corrigez les champs du récipiendaire avant de l’ajouter.", "error");
        return true;
      }
      const years = Math.max(0, Math.floor(monthsBetween(fields.start) / 12));
      wsState.recipients.push({
        id: "rec-" + Date.now(),
        name: fields.prenom + " " + fields.nom,
        function: fields.poste,
        seniority: String(years),
        medal: fields.medal || "Bronze",
      });
      portalState.empForm = {};
      portalNotice("Récipiendaire ajouté à la demande. Aucune affiliation employé n’a été créée automatiquement.");
      wsPaint(role, page);
      return true;
    }
    case "cal-view":
      portalState.calView = el.dataset.value;
      portalUpdateResults(role, page);
      return true;
    case "person-cer-confirm": {
      const person = demoGet("person");
      const c = (person.ceremonies || []).find((x) => x.id === el.dataset.id);
      if (c) {
        c.invitation = "Confirmé";
        demoSave();
        portalNotice("Présence confirmée localement. Aucune convocation n’a été transmise.");
      }
      portalUpdateResults(role, page);
      return true;
    }
    case "wd-pick":
    case "wd-pick-award": {
      const person = demoGet("person");
      const award = ((person && person.awards) || []).map(personAwardView).find((a) => a.id === el.dataset.id);
      if (!award) {
        portalNotice("Distinction introuvable.", "error");
        return true;
      }
      const q = withdrawalQuittanceFor(award);
      portalState.withdrawWizard = {
        step: action === "wd-pick" ? 2 : 1,
        awardId: award.id,
        motif: (portalState.withdrawWizard && portalState.withdrawWizard.motif) || "",
        quittance: q.name || "",
        permission: withdrawalPermissionFor(award, person),
        dirty: true,
      };
      if (page !== "withdrawal-request") wsGo(role, "withdrawal-request");
      else portalUpdateResults(role, page);
      return true;
    }
    case "wd-step": {
      const step = Number(el.dataset.step);
      if (step >= 2 && !(portalState.withdrawWizard && portalState.withdrawWizard.awardId)) {
        portalNotice("Sélectionnez une distinction avant de continuer.", "error");
        return true;
      }
      if (step >= 3) {
        const person = demoGet("person");
        const award = ((person && person.awards) || []).map(personAwardView).find((a) => a.id === portalState.withdrawWizard.awardId);
        if (award) {
          if (!portalState.withdrawWizard.quittance) portalState.withdrawWizard.quittance = withdrawalQuittanceFor(award).name || "";
          if (!portalState.withdrawWizard.permission) portalState.withdrawWizard.permission = withdrawalPermissionFor(award, person);
        }
      }
      if (step >= 4 && (!portalState.withdrawWizard.quittance || !portalState.withdrawWizard.permission)) {
        portalNotice("Joignez la quittance et l’autorisation d’entreprise.", "error");
        portalState.withdrawWizard.step = 3;
        portalUpdateResults(role, page);
        return true;
      }
      portalState.withdrawWizard.step = step;
      portalState.withdrawWizard.dirty = true;
      portalUpdateResults(role, page);
      return true;
    }
    case "wd-file": {
      const field = el.dataset.field;
      const name = field === "quittance" ? "quittance-retrait-demo.pdf" : "autorisation-entreprise-demo.pdf";
      portalState.withdrawWizard[field] = name;
      portalState.withdrawWizard.dirty = true;
      portalUpdateResults(role, page);
      portalNotice("Pièce jointe simulée : " + name + " — aucun fichier n’a été transmis.");
      return true;
    }
    case "wd-submit": {
      const wiz = portalState.withdrawWizard || emptyWithdrawWizard();
      const person = demoGet("person");
      const profile = portalProfile("recipient", person) || {};
      const award = ((person && person.awards) || []).map(personAwardView).find((a) => a.id === wiz.awardId);
      if (!award) {
        portalNotice("Sélectionnez une distinction.", "error");
        return true;
      }
      if (!wiz.quittance) {
        portalNotice("Joignez la quittance avant d’envoyer la demande.", "error");
        return true;
      }
      if (!wiz.permission) {
        portalNotice("Joignez l’autorisation d’entreprise numérisée.", "error");
        return true;
      }
      const rec = addWithdrawalRequest({
        awardId: award.id,
        medal: award.medal,
        campaign: award.campaign,
        dossier: award.dossier,
        employer: award.employer,
        nom: profile.nom,
        prenom: profile.prenom,
        sexe: profile.sexe,
        nationalite: profile.nationalite,
        quittance: wiz.quittance,
        permission: wiz.permission,
        motif: wiz.motif,
      });
      portalClearDirty();
      portalState.withdrawWizard = emptyWithdrawWizard();
      portalState.withdrawDetail = rec.id;
      portalNotice("Demande " + rec.id + " enregistrée. Statut : en attente de traitement.");
      wsGo(role, "withdrawals");
      return true;
    }
    case "wd-open":
      portalState.withdrawDetail = el.dataset.id;
      portalUpdateResults(role, page);
      setTimeout(() => document.getElementById("portal-wd-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
      return true;
    case "wd-close":
      portalState.withdrawDetail = null;
      portalUpdateResults(role, page);
      return true;
    case "confirm-abandon":
      portalClearDirty();
      portalState.overlay = null;
      if (portalState.abandonTo) wsGo(role, portalState.abandonTo);
      portalState.abandonTo = null;
      return true;
    default:
      return false;
  }
}

function portalExtrasInput(el, role, page) {
  if (el.matches("[data-work-reply]")) {
    portalState.workReply = portalState.workReply || {};
    portalState.workReply[el.dataset.workReply] = el.value;
    return true;
  }
  if (el.matches("[data-work-follow-motif]")) {
    portalState.workReply = portalState.workReply || {};
    portalState.workReply.follow = el.value;
    return true;
  }
  if (el.matches("[data-portal-search]") && (page === "dossiers" || page === "documents" || page === "complements" || page === "notifications")) {
    portalState.query = el.value;
    portalState.dossierPage = 1;
    portalUpdateResults(role, page);
    return true;
  }
  if (el.matches("[data-map-search]")) {
    const value = el.value;
    portalState.ceremonyWizard.placeQuery = value;
    portalState.ceremonyWizard.dirty = true;
    const match = DEMO_PLACES.find((p) => demoNorm(p.name) === demoNorm(value));
    if (!match && portalState.ceremonyWizard.place && demoNorm(portalState.ceremonyWizard.place.name) !== demoNorm(value)) {
      portalState.ceremonyWizard.place = null;
    }
    const list = document.querySelector(".map-picker-list");
    const map = document.querySelector(".map-picker-map");
    if (list && map) {
      const wrap = document.querySelector("[data-map-picker]");
      if (wrap) wrap.outerHTML = mapPickerHtml(portalState.ceremonyWizard);
    }
    return true;
  }
  if (el.matches("[data-cer-field]")) {
    const field = el.dataset.cerField;
    portalState.ceremonyWizard[field] = el.value;
    if (field === "date") portalState.ceremonyWizard.iso = el.value;
    portalState.ceremonyWizard.dirty = true;
    return true;
  }
  if (el.matches("[data-wd-field]")) {
    portalState.withdrawWizard[el.dataset.wdField] = el.value;
    portalState.withdrawWizard.dirty = true;
    return true;
  }
  if (el.closest("[data-person-form]")) {
    portalState.empForm = personFormRead(el.closest("[data-person-form]"));
    portalState.empFormDirty = true;
    if (el.matches("[data-person-watch]")) portalUpdateResults(role, page);
    return true;
  }
  if (el.matches("[data-portal-search]") && page === "employees") {
    portalState.query = el.value;
    portalState.empPage = 1;
    const node = document.querySelector("[data-portal-results]");
    const data = portalData(role);
    if (node && data) node.innerHTML = portalEmployeeTable(filteredEmployees(data).slice(0, EMP_PAGE_SIZE), data, filteredEmployees(data).length);
    return true;
  }
  return false;
}

function portalRememberFile(field, file, role, page) {
  if (!file) return false;
  const meta = { name: file.name, size: file.size || 0, type: file.type || "application/octet-stream" };
  portalState.files = Object.assign({}, portalState.files, { [field]: meta });
  if (page === "new-dossier") {
    const w = portalState.createWizard || emptyCreateWizard();
    if (field === "letter") w.letter = meta;
    else if (field === "dts") w.dts = meta;
    else w.extras = (w.extras || []).concat([meta]);
    w.dirty = true;
    portalState.createWizard = w;
  } else if (page === "withdrawal-request") {
    const w = portalState.withdrawWizard || emptyWithdrawWizard();
    w[field] = meta.name;
    w.files = Object.assign({}, w.files || {}, { [field]: meta });
    w.dirty = true;
    portalState.withdrawWizard = w;
  } else {
    const root = document.querySelector("[data-person-form]");
    portalState.empForm = Object.assign({}, portalState.empForm, root ? personFormRead(root) : {}, { [field]: meta.name });
    portalState.empFormDirty = true;
  }
  portalNotice("Pièce conservée : " + meta.name + (meta.size ? " (" + Math.max(1, Math.round(meta.size / 1024)) + " Ko)" : "") + ".");
  portalUpdateResults(role, page);
  return true;
}

function portalExtrasChange(el, role, page) {
  if (el.matches("[data-portal-file]")) {
    return portalRememberFile(el.dataset.portalFile, el.files && el.files[0], role, page);
  }
  if (el.matches("[data-create-field]")) {
    const w = portalState.createWizard || emptyCreateWizard();
    w[el.dataset.createField] = el.value;
    w.dirty = true;
    portalState.createWizard = w;
    return true;
  }
  if (el.matches("[data-create-medal]")) {
    const w = portalState.createWizard || emptyCreateWizard();
    const rec = w.recipients[Number(el.dataset.createMedal)];
    if (rec) rec.medal = el.value;
    w.dirty = true;
    portalState.createWizard = w;
    return true;
  }
  if (el.matches("[data-portal-filter]")) {
    const key = el.dataset.portalFilter;
    portalState[key] = el.value;
    if (key === "affiliation" || key === "empNationality" || key === "empSeniority") portalState.empPage = 1;
    if (key === "status" || key === "campaign" || key === "sort" || key === "dossierPeriod") portalState.dossierPage = 1;
    portalUpdateResults(role, page);
    return true;
  }
  if (el.matches("[data-person-watch]")) {
    portalState.empForm = personFormRead(el.closest("[data-person-form]"));
    portalState.empFormDirty = true;
    portalUpdateResults(role, page);
    return true;
  }
  return false;
}

function portalExtrasSubmit(event, role, page) {
  if (event.target.id === "person-profile-form") {
    event.preventDefault();
    const root = event.target.querySelector("[data-person-form]");
    const fields = personFormRead(root);
    const errors = personFormValidate(fields);
    personFormApplyErrors(root, errors);
    if (Object.keys(errors).length) {
      portalNotice("Corrigez les champs signalés avant de continuer.", "error");
      return true;
    }
    const person = demoGet("person");
    if (person && person.profile) {
      Object.assign(person.profile, {
        nom: fields.nom,
        prenom: fields.prenom,
        sexe: fields.sexe,
        nationalite: fields.nationalite,
        poste: fields.poste,
        start: fields.start,
        situationPhysique: fields.situationPhysique || "Bien portant",
        naturalise: !!fields.naturalise,
        workPermit: fields.workPermit || null,
        naturalizationDoc: fields.naturalizationDoc || null,
        degreMutilation: fields.degreMutilation || null,
        pieceMedicale: fields.pieceMedicale || null,
        dateDeces: fields.dateDeces || null,
        acteDeces: fields.acteDeces || null,
      });
      demoSave();
    }
    portalClearDirty();
    portalState.empForm = {};
    portalState.edit = false;
    portalNotice("Profil mis à jour localement. Aucune donnée n’a été envoyée à un serveur.");
    portalUpdateResults(role, page);
    return true;
  }
  if (event.target.id !== "employee-form") return false;
  event.preventDefault();
  const root = event.target.querySelector("[data-person-form]");
  const fields = personFormRead(root);
  const errors = personFormValidate(fields);
  personFormApplyErrors(root, errors);
  if (Object.keys(errors).length) {
    portalNotice("Corrigez les champs signalés avant de continuer.", "error");
    return true;
  }
  const data = portalData(role);
  const dup = (data.employees || []).find((e) => demoNorm(e.nom) === demoNorm(fields.nom) && demoNorm(e.prenom) === demoNorm(fields.prenom) && e.id !== portalState.empEditingId);
  if (dup) {
    portalNotice("Une fiche existe déjà pour " + dup.prenom + " " + dup.nom + " (" + (AFFILIATION_LABEL[dup.status] || dup.status) + ").", "error");
    return true;
  }
  portalState.empForm = fields;
  portalState.empFormMode = "confirm";
  portalUpdateResults(role, page);
  return true;
}
