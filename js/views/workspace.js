/* ==================================================================
   js/views/workspace.js
   Espaces connectés — conversion de `src/pages/WorkspacePage.tsx` et
   `src/components/workspace/{WorkspaceSidebar,WorkspaceTopbar,...}.tsx`.
   Huit profils ; indicatif issues de js/data.js. Aucun appel métier.
================================================================== */
const wsState = {
  sidebarOpen: false, switcherOpen: false, notificationsOpen: false, menu: false,
  toast: "", modal: null, query: "", status: "Tous les statuts",
  wizardStep: 1, wizardDone: false, recipients: [{ id: "new-1", name: "Aline Moubamba", function: "Directrice administrative", seniority: "18", medal: "Bronze" }],
  notices: NOTIFICATIONS.map(n => ({ ...n })), decision: "", attendance: {},
  lines: [{ type: "Bronze", quantity: 80, price: "18 000 FCFA" }, { type: "Argent", quantity: 40, price: "28 000 FCFA" }],
  calendarOffset: 0,
};
const MEDAL_TYPES = { Bronze: "bronze", Argent: "argent", Or: "or" };
const WBTN = (html, action, opts = {}) => button({ html, size: opts.size || "sm", variant: opts.variant || "secondary", className: opts.className || "", attrs: { "data-action": action, ...(opts.attrs || {}) } });
const WLINK = (html, page, opts = {}) => WBTN(html, "ws-page", { ...opts, attrs: { "data-page": page, ...(opts.attrs || {}) } });
function wsGo(role, page) { navigateTo(workspacePath(role, page)); }
function wsIntro(title, description = "", eyebrowText = "Espace connecté", action = "") {
  return `<div class="ws-section-heading"><div><div class="ws-eyebrow">${esc(eyebrowText)} <span class="auth-triple"></span></div><h1 class="ws-page-title">${esc(title)}</h1>${description ? `<p class="ws-page-lead">${esc(description)}</p>` : ""}</div>${action ? `<div class="ws-section-action">${action}</div>` : ""}</div>`;
}
function wsHero(role, page, profile) {
  const conf = ROLE_CONFIGS[role];
  const active = conf.nav.find((n) => n.page === page);
  const title = (active && active.label) || "Vue d'ensemble";
  const description = conf.description || "";
  const accent = conf.accent === "green" ? "republic-green" : conf.accent === "gold" ? "gold" : "republic-blue";
  const pattern = role === "admin" ? "compass" : role === "regisseur" ? "treasure" : role === "service_chef" || role === "service_agent" ? "scale" : role.startsWith("service_") ? "scale" : role === "ministre" || role === "dgt" || role === "dr" ? "senate" : role.startsWith("secretariat_") ? "inbox" : "senate";
  const profileName = profile ? (profile.name || profile.shortLabel || conf.shortLabel) : conf.shortLabel;
  return `<section class="ws-hero ws-appear">
    <div class="ws-hero-art" aria-hidden="true">${homeArt(pattern, "ws-hero-etch")}</div>
    <div class="ws-eyebrow ws-hero-eyebrow">${esc(conf.label)} <span class="auth-triple"></span></div>
    <div class="ws-hero-layout">
      <div>
        <p class="ws-greeting">Bonjour, <span>${esc(profileName)}</span></p>
        <h1>${esc(title)}</h1>
        <p class="ws-lead">${esc(description)}.</p>
      </div>
      <div class="ws-seal ws-seal-${accent}" aria-hidden="true">
        <span>HONNEUR<br>ET MÉRITE</span>
        <i></i>
      </div>
    </div>
  </section>`;
}
function wsMetric(label, value, detail, iconName, accent = "green", page = "") {
  const tone = accent === "blue" ? "bg-republic-blue-50 text-republic-blue-600" : accent === "gold" ? "bg-gold-100 text-gold-800" : "bg-republic-green-50 text-republic-green-600";
  const body = `<span class="flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}">${icon(iconName, "size-[19px]")}</span><span class="min-w-0"><span class="block text-[0.6875rem] font-medium text-muted">${esc(label)}</span><span class="mt-1 block text-2xl font-semibold tracking-[-0.04em] text-ink-900">${esc(value)}</span><span class="mt-1 block truncate text-[0.6875rem] text-muted">${esc(detail)}</span></span>`;
  return page ? `<button type="button" data-action="ws-page" data-page="${page}" class="flex w-full items-start gap-3 rounded-2xl border border-line bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-ink-100 hover:shadow-card">${body}</button>` : `<div class="flex items-start gap-3 rounded-2xl border border-line bg-white p-4">${body}</div>`;
}
function wsOverview(role) {
  const recipient = role === "recipient", regisseur = role === "regisseur";
  const internal = ["ministre", "dgt", "dr", "service_agent", "service_inspecteur", "service_chef", "secretariat_ministre", "secretariat_dgt", "secretariat_dr"].includes(role);
  const isAdmin = role === "admin";
  const metrics = recipient ? [
    ["Distinctions obtenues", "4", "Depuis 2011", "medal", "gold", "recipients"], ["Prochaine cérémonie", "04 avr.", "Libreville", "calendar", "blue", "ceremonies"], ["Documents à fournir", "2", "À compléter", "fileText", "green", "documents"], ["Notifications", "3", "Non lues", "bell", "blue", "notifications"]
  ] : regisseur ? [
    ["Médailles disponibles", "287", "Tous types confondus", "medal", "gold", "stock"], ["Diplômes en stock", "360", "86 réservés", "fileText", "blue", ""], ["Approvisionnements", "3", "En cours", "truck", "green", "supplies"], ["Retraits en attente", "18", "À préparer", "users", "gold", "withdrawals"]
  ] : isAdmin ? [
    ["Utilisateurs", "14", "Tous profils", "users", "blue", "users"], ["Comptes internes", "11", "Rôles distincts", "shield", "green", "internal-accounts"], ["Campagnes actives", "1", "2026", "clipboard", "gold", "campaigns"], ["Alertes système", "3", "À examiner", "alert", "blue", "alerts"]
  ] : internal ? [
    ["Dossiers reçus", "42", "+8 ce mois", "folder", "blue", "dossiers"], ["En attente", "17", "À examiner", "checkCircle", "gold", "decisions"], ["Recours", "4", "3 nouveaux", "scale", "green", "recours"], ["Cérémonies", "6", "À confirmer", "calendar", "blue", "ceremonies"]
  ] : [
    ["Dossiers soumis", "12", "+2 ce trimestre", "folder", "green", "dossiers"], ["Dossiers en cours", "5", "Instruction", "clock", "blue", "dossiers"], ["Compléments demandés", "3", "À traiter", "upload", "gold", "complements"], ["Dossiers approuvés", "4", "2 cérémonies planifiées", "checkCircle", "green", "dossiers"]
  ];
  const statHtml = `<div class="ws-stats">${metrics.map((m) => `<div class="ws-stat"><span class="ws-stat-icon">${icon(m[3], "size-5")}</span><span class="ws-stat-body"><small>${esc(m[0])}</small><strong>${esc(m[1])}</strong><span>${esc(m[2])}</span></span></div>`).join("")}</div>`;
  return statHtml + `<div class="ws-paper"><div class="ws-section-heading"><div><div class="ws-eyebrow">VUE D'ENSEMBLE</div><h2 class="ws-page-title">${isAdmin ? "Activité de la plateforme" : internal ? "Activité récente" : recipient ? "Vos distinctions en un coup d'œil" : "Activité de votre organisation"}</h2></div>${WLINK(icon("bell", "size-4") + "Voir les notifications", "notifications", { variant: "ghost" })}</div><ul class="ws-activity-list">${ACTIVITIES.slice(0, 4).map((a) => `<li><span class="ws-activity-icon">${icon("clock", "size-4")}</span><div><strong>${esc(a.actor)}</strong> <span class="ws-muted">(${esc(a.role)})</span> ${esc(a.action)} <strong>${esc(a.reference)}</strong><small>${esc(a.date)} · ${esc(a.comment)}</small></div></li>`).join("")}</ul></div>`;
}
function dossierDetails(d) {
  return `<div><div class="grid gap-3 sm:grid-cols-2"><div class="rounded-xl bg-canvas p-4"><p class="text-xs text-muted">Demandeur</p><p class="mt-1 text-sm font-medium text-ink-900">${esc(d.applicant)}</p></div><div class="rounded-xl bg-canvas p-4"><p class="text-xs text-muted">Destinataire initial</p><p class="mt-1 text-sm font-medium text-ink-900">${esc(d.initialRecipient)}</p></div></div><div class="mt-5 flex items-center justify-between"><span class="text-sm font-semibold">Statut actuel</span>${statusBadge(d.status)}</div><div class="mt-5 rounded-xl border border-line p-4"><p class="text-xs font-bold uppercase text-muted">Chronologie visible</p><ol class="mt-4 space-y-4">${["Dossier soumis", "Transmission hiérarchique", d.status.label].map((s, i) => `<li class="flex gap-3"><span class="flex size-6 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold ${i === 2 ? "bg-gold-100 text-gold-800" : "bg-republic-green-50 text-republic-green-700"}">${i + 1}</span><span class="text-[0.8125rem]">${esc(s)}</span></li>`).join("")}</ol></div><div class="mt-5"><p class="text-sm font-semibold">Récipiendaires (${d.recipients.length})</p><div class="mt-3 divide-y divide-line rounded-xl border border-line">${d.recipients.map(r => `<div class="flex items-center justify-between gap-3 px-3 py-3"><span><span class="block text-[0.8125rem] font-medium">${esc(r.name)}</span><span class="block text-xs text-muted">${esc(r.role)}</span></span><span class="flex items-center gap-2"><span class="text-xs text-muted">${r.medal}</span>${toneBadge(r.instruction, r.instruction === "Validé" ? "success" : r.instruction === "À compléter" ? "warning" : "info")}</span></div>`).join("")}</div></div><div class="mt-6 flex justify-end gap-2">${WBTN("Fermer", "close-modal")}${WLINK("Voir les pièces", "documents", { variant: "primary", attrs: { "data-close-modal": "1" } })}</div></div>`;
}
function wsDossiers(role) {
  const filtered = DOSSIERS.filter(d => (wsState.status === "Tous les statuts" || d.status.label === wsState.status) && `${d.reference} ${d.applicant} ${d.campaign}`.toLowerCase().includes(wsState.query.toLowerCase()));
  return wsIntro(role === "demandeur" ? "Mes dossiers" : "Dossiers transmis", "Une vue cohérente des dossiers, de leur réception à la remise des distinctions.", role === "demandeur" ? "Mon activité" : "Instruction", role === "demandeur" ? WLINK(icon("plus", "size-4") + "Nouveau dossier", "new-dossier", { variant: "primary", size: "md" }) : "")
  + `<div class="mb-4 flex flex-col gap-3 rounded-2xl border border-line bg-white p-3 sm:flex-row"><label class="relative min-w-0 flex-1"><span class="sr-only">Rechercher un dossier</span>${icon("search", "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted")}<input data-ws-search="dossiers" value="${esc(wsState.query)}" class="h-10 w-full rounded-xl border border-line bg-canvas pl-9 pr-3 text-[0.8125rem] outline-none focus:border-republic-green-500 focus:ring-4 focus:ring-republic-green-100" placeholder="Rechercher une référence, un demandeur…" /></label><label class="relative"><span class="sr-only">Filtrer par statut</span>${icon("filter", "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted")}<select data-ws-filter class="h-10 w-full min-w-48 appearance-none rounded-xl border border-line bg-canvas pl-9 pr-8 text-[0.8125rem] text-ink-700 outline-none focus:border-republic-green-500"><option>Tous les statuts</option>${[...new Set(DOSSIERS.map(d => d.status.label))].map(s => `<option ${wsState.status === s ? "selected" : ""}>${esc(s)}</option>`).join("")}</select></label>${WBTN(icon("refresh", "size-4") + "Réinitialiser", "ws-reset-filter")}</div><div id="ws-table">${wsDossiersTable(filtered)}</div>`;
}
function wsDossiersTable(rows) {
  return dataTable({ columns: [
    { key: "ref", label: "Référence", render: d => `<button type="button" data-action="ws-dossier" data-ref="${esc(d.reference)}" class="font-semibold text-republic-blue-700 hover:underline">${esc(d.reference)}</button>` },
    { key: "applicant", label: "Demandeur / campagne", render: d => `<div><p class="max-w-52 truncate font-medium text-ink-900">${esc(d.applicant)}</p><p class="mt-1 max-w-52 truncate text-[0.6875rem] text-muted">${esc(d.campaign.split(" — ")[0])}</p></div>` },
    { key: "date", label: "Soumission", render: d => esc(d.submitted) },
    { key: "count", label: "Récipiendaires", render: d => `<span class="font-medium text-ink-900">${d.recipientCount}</span>` },
    { key: "recipient", label: "Destinataire initial", render: d => `<span class="max-w-40 truncate block">${esc(d.initialRecipient)}</span>` },
    { key: "status", label: "Statut", render: d => statusBadge(d.status) },
    { key: "action", label: "", render: d => `<button type="button" data-action="ws-dossier" data-ref="${esc(d.reference)}" aria-label="Détails ${esc(d.reference)}" class="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink-900">${icon("more", "size-4")}</button>` }
  ], rows, rowKey: d => d.reference });
}
function wsRecipients(role) {
  const rows = ALL_RECIPIENTS.filter(r => `${r.name} ${r.company} ${r.medal}`.toLowerCase().includes(wsState.query.toLowerCase()));
  return wsIntro(role === "recipient" ? "Mes distinctions" : "Récipiendaires", "Identités et distinctions, partagées de manière cohérente entre les espaces.", role === "recipient" ? "Mon espace" : "Instruction")
  + `<div class="mb-4 flex items-center gap-3 rounded-2xl border border-line bg-white p-3"><div class="relative flex-1">${icon("search", "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted")}<input data-ws-search="recipients" value="${esc(wsState.query)}" placeholder="Rechercher une personne…" class="h-10 w-full rounded-xl border border-line bg-canvas pl-9 pr-3 text-[0.8125rem] outline-none focus:border-republic-green-500" /></div><span class="hidden text-[0.75rem] text-muted sm:block" id="ws-result-count">${rows.length} résultat${rows.length > 1 ? "s" : ""}</span></div><div id="ws-table">${wsRecipientsTable(rows)}</div>`;
}
function wsRecipientsTable(rows) {
  return dataTable({ columns: [
    { key: "name", label: "Récipiendaire", render: r => `<div class="flex items-center gap-3"><span class="flex size-8 items-center justify-center rounded-full bg-ink-100 text-[0.625rem] font-bold text-ink-700">${esc(r.name.split(" ").map(s => s[0]).join("").slice(0, 2))}</span><span><span class="block font-medium text-ink-900">${esc(r.name)}</span><span class="block text-[0.6875rem] text-muted">${esc(r.id)}</span></span></div>` },
    { key: "company", label: "Employeur", render: r => esc(r.company) }, { key: "role", label: "Fonction", render: r => esc(r.role) }, { key: "seniority", label: "Ancienneté", render: r => `${r.seniority} ans` },
    { key: "medal", label: "Médaille", render: r => `<span class="inline-flex items-center gap-2"><span class="w-6">${medal({ type: MEDAL_TYPES[r.medal], size: "sm", showRibbon: false })}</span>${esc(r.medal)}</span>` },
    { key: "instruction", label: "État", render: r => toneBadge(r.instruction, r.instruction === "Validé" ? "success" : r.instruction === "À compléter" ? "warning" : r.instruction === "Refusé" ? "danger" : "info") }
  ], rows, rowKey: r => r.id });
}
function wsWizard() {
  if (wsState.wizardDone) return `<div class="mx-auto max-w-xl py-12 text-center"><span class="mx-auto flex size-16 items-center justify-center rounded-full bg-republic-green-50 text-republic-green-600">${icon("checkCircle", "size-8")}</span><h2 class="mt-6 text-2xl font-semibold text-ink-900">Soumission simulée</h2><p class="mt-3 text-sm leading-relaxed text-muted">La maquette a enregistré votre action. Aucun dossier n'a été transmis à un serveur.</p>${WBTN("Créer un autre brouillon", "ws-wizard-reset", { variant: "primary", size: "md", className: "mt-7" })}</div>`;
  const step = wsState.wizardStep;
  const labels = ["Informations générales", "Courrier d'initiation", "Récipiendaires", "Documents", "Récapitulatif"];
  let content = "";
  if (step === 1) content = `<div class="grid gap-5 sm:grid-cols-2">${textField({ id: "applicant", label: "Entreprise ou ministère demandeur", attrs: { value: "Société Gabonaise de Services et d'Industrie" } })}${textField({ id: "reference", label: "Référence interne", attrs: { placeholder: "REF-ENT-2026-01" } })}<label class="sm:col-span-2"><span class="mb-1.5 block text-sm font-medium text-ink-800">Campagne de distinction</span><select class="h-12 w-full rounded-xl border border-line-strong bg-white px-4 text-sm text-ink-800 outline-none focus:border-republic-green-500"><option>${esc(CAMPAIGNS[0])}</option><option>${esc(CAMPAIGNS[1])}</option></select></label><label class="sm:col-span-2"><span class="mb-1.5 block text-sm font-medium text-ink-800">Destinataire initial</span><select class="h-12 w-full rounded-xl border border-line-strong bg-white px-4 text-sm text-ink-800 outline-none focus:border-republic-green-500"><option>Ministre</option><option>Direction Générale du Travail</option><option>Direction Régionale du Travail</option></select></label></div>`;
  if (step === 2) content = `<div><div class="rounded-2xl border border-dashed border-republic-green-300 bg-republic-green-50/50 p-8 text-center">${icon("upload", "mx-auto size-8 text-republic-green-600")}<p class="mt-3 text-sm font-semibold text-ink-900">Déposer le courrier d'initiation</p><p class="mt-1 text-xs text-muted">PDF ou DOCX · 10 Mo maximum · fichier local uniquement</p>${WBTN("Choisir un fichier", "ws-file", { className: "mt-5" })}</div><div class="mt-4 flex items-center gap-3 rounded-xl border border-line p-3">${icon("fileText", "size-5 text-republic-blue-600")}<span class="flex-1 text-xs font-medium text-ink-800">courrier-initiation-2026.pdf <small class="ml-2 text-muted">1,2 Mo</small></span>${icon("checkCircle", "size-4 text-republic-green-600")}</div></div>`;
  if (step === 3) content = `<div><div class="flex items-center justify-between gap-3"><div><h3 class="text-sm font-semibold text-ink-900">Liste des récipiendaires</h3><p class="mt-1 text-xs text-muted">Ajoutez les personnes concernées par cette demande. Le formulaire ci-dessous est le même que pour l’enregistrement d’un employé.</p></div>${WBTN(icon("plus", "size-4") + "Ajouter un salarié actif", "ws-add-recipient", { variant: "primary" })}</div><div class="mt-5 overflow-x-auto rounded-xl border border-line"><table class="min-w-[650px] w-full text-left text-xs"><thead class="bg-canvas"><tr>${["Nom et prénom", "Fonction", "Ancienneté", "Médaille", ""].map(t => `<th class="px-4 py-3 font-bold text-muted uppercase">${t}</th>`).join("")}</tr></thead><tbody class="divide-y divide-line">${wsState.recipients.map((r, i) => `<tr><td class="px-4 py-3 font-medium text-ink-900">${esc(r.name)}</td><td class="px-4 py-3 text-muted">${esc(r.function)}</td><td class="px-4 py-3 text-muted">${esc(r.seniority)} ans</td><td class="px-4 py-3"><span class="inline-flex items-center gap-2"><span class="w-7">${medal({ type: MEDAL_TYPES[r.medal], size: "sm", showRibbon: false })}</span>${esc(r.medal)}</span></td><td class="px-4 py-3 text-right"><button type="button" data-action="ws-remove-recipient" data-index="${i}" aria-label="Retirer ${esc(r.name)}" class="rounded p-1.5 text-muted hover:bg-red-50 hover:text-red-600">${icon("x", "size-4")}</button></td></tr>`).join("")}</tbody></table></div>${typeof personFormHtml === "function" ? `<div class="mt-6 rounded-xl border border-line p-4"><h3 class="text-sm font-semibold text-ink-900">Saisir un récipiendaire</h3><p class="mt-1 mb-4 text-xs text-muted">Même champs et mêmes règles que l’enregistrement d’un employé. Cette saisie n’enregistre pas automatiquement une affiliation.</p>${personFormHtml(typeof portalState !== "undefined" ? portalState.empForm : {}, { id: "wizard-recipient", showMedal: true })}${typeof portalButton === "function" ? `<div class="portal-form-actions mt-4">${portalButton("Ajouter à la demande", "wizard-add-person", "", "portal-primary-link")}</div>` : ""}</div>` : ""}</div>`;
  if (step === 4) content = `<div class="space-y-4">${[["Ajouter le DTS", "Document de travail et de synthèse", "upload"], ["Autres justificatifs", "Attestations, états de service, pièces utiles", "plus"]].map(([title, subtitle, glyph]) => `<label class="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-line-strong p-5 hover:border-republic-green-300"><span class="flex size-11 items-center justify-center rounded-xl bg-republic-green-50 text-republic-green-600">${icon(glyph, "size-5")}</span><span><span class="block text-sm font-medium text-ink-900">${title}</span><span class="mt-1 block text-xs text-muted">${subtitle}</span></span><input type="file" class="sr-only" /></label>`).join("")}</div>`;
  if (step === 5) content = `<div class="space-y-4"><div class="grid gap-3 sm:grid-cols-3">${[["Destinataire", "Direction Générale du Travail"], ["Récipiendaires", String(wsState.recipients.length)], ["Pièces", "3 fichiers"]].map(([a,b]) => `<div class="rounded-xl bg-canvas p-4"><p class="text-xs text-muted">${a}</p><p class="mt-1 text-sm font-semibold text-ink-900">${b}</p></div>`).join("")}</div><p class="rounded-xl border border-gold-200 bg-gold-50 p-4 text-xs leading-relaxed text-gold-800">Vérifiez les informations avant la soumission. Cette action sera uniquement simulée.</p></div>`;
  return wsIntro("Nouveau dossier", "Assistant visuel en cinq étapes. Parcourez les étapes, puis soumettez la demande.", "Dépôt") + `<div class="mb-6 overflow-x-auto"><ol class="flex min-w-[650px] items-start">${labels.map((label, i) => `<li class="relative flex flex-1 flex-col items-center text-center"><span class="relative z-10 flex size-9 items-center justify-center rounded-full border text-xs font-bold ${i+1 <= step ? "border-republic-green-500 bg-republic-green-500 text-white" : "border-line-strong bg-white text-muted"}">${i+1 <= step ? icon("check", "size-4") : i+1}</span>${i < 4 ? `<span class="absolute top-4 left-1/2 h-px w-full ${i+1 < step ? "bg-republic-green-500" : "bg-line-strong"}"></span>` : ""}<span class="mt-2 max-w-28 text-[0.625rem] font-medium ${i+1 === step ? "text-ink-900" : "text-muted"}">${esc(label)}</span></li>`).join("")}</ol></div>` + workspaceCard({ className: "p-5 sm:p-7", html: content + `<div class="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-line pt-5 sm:flex-row">${button({ variant: "secondary", html: "Retour", attrs: { "data-action": "ws-wizard-prev", disabled: step === 1 } })}<div class="flex gap-2">${WBTN("Enregistrer le brouillon", "ws-draft", { variant: "ghost", size: "md" })}${step < 5 ? WBTN("Continuer " + icon("arrowRight", "size-4"), "ws-wizard-next", { variant: "primary", size: "md" }) : WBTN("Soumettre la demande " + icon("check", "size-4"), "ws-wizard-submit", { variant: "primary", size: "md" })}</div></div>` });
}
function wsNotifications() {
  return wsIntro("Notifications", "Alertes associées à votre profil.", "Centre de notifications", WBTN(icon("check", "size-4") + "Tout marquer lu", "ws-read-all")) + `<div class="space-y-3">${wsState.notices.map(n => `<div class="flex items-start gap-4 rounded-2xl border bg-white p-5 transition ${n.read ? "border-line" : "border-republic-green-200 bg-republic-green-50/20"}"><span class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${n.tone === "warning" ? "bg-gold-100 text-gold-800" : n.tone === "success" ? "bg-republic-green-50 text-republic-green-700" : "bg-republic-blue-50 text-republic-blue-700"}">${icon(n.tone === "success" ? "checkCircle" : n.tone === "warning" ? "alert" : "bell", "size-5")}</span><div class="min-w-0 flex-1"><div class="flex flex-wrap justify-between gap-2"><p class="text-sm font-semibold text-ink-900">${esc(n.title)}</p><time class="text-[0.6875rem] text-muted">${esc(n.date)}</time></div><p class="mt-1 text-[0.8125rem] leading-relaxed text-muted">${esc(n.description)}</p>${n.reference ? `<span class="mt-2 inline-block rounded-md bg-canvas px-2 py-1 text-[0.625rem] font-medium text-ink-700">${esc(n.reference)}</span>` : ""}</div>${!n.read ? `<button type="button" data-action="ws-read" data-id="${n.id}" class="text-[0.6875rem] font-semibold text-republic-green-700 hover:underline">Marquer lu</button>` : ""}</div>`).join("")}</div>`;
}
function wsActivity() {
  return wsIntro("Journal d'activité", "Chronologie illustrative des actions et transmissions. L'espace demandeur n'expose pas les détails internes.", "Traçabilité") + workspaceCard({ html: cardHeader({ title: "Activité récente" }) + `<div class="divide-y divide-line">${ACTIVITIES.map(a => `<div class="flex gap-4 px-5 py-5 sm:px-6"><span class="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-ink-50 text-ink-700">${icon("clock", "size-4")}</span><div class="min-w-0 flex-1"><p class="text-sm text-ink-800"><strong>${esc(a.actor)}</strong> <span class="text-muted">(${esc(a.role)})</span> ${esc(a.action)} <strong>${esc(a.reference)}</strong></p><p class="mt-1 text-xs text-muted">${esc(a.date)} · ${esc(a.comment)}</p></div></div>`).join("")}</div>` });
}
function wsTransmissions(role) {
  const data = internalDemoData(role);
  const label = { secretariat_ministre: 'Secrétariat — Ministre', secretariat_dgt: 'Secrétariat — DGT', secretariat_dr: 'Secrétariat — DR' }[role] || 'Secrétariat';
  const mailbox = data && data.mail ? data.mail : [];
  return wsIntro("Boîte de transmission", `${label} : réception, enregistrement et transmission des courriers et dossiers.`, "Secrétariat") + workspaceCard({ html: cardHeader({ title: "Boîte de réception", action: toneBadge(`${mailbox.length} éléments`, "info") }) + `<div class="divide-y divide-line">${mailbox.length ? mailbox.map((entry) => `<div class="flex flex-wrap items-center gap-4 px-5 py-5"><span class="flex size-10 items-center justify-center rounded-xl bg-republic-blue-50 text-republic-blue-700">${icon("inbox", "size-5")}</span><div class="min-w-32 flex-1"><p class="text-sm font-semibold text-ink-900">${esc(entry.label)}</p><p class="mt-1 text-[0.6875rem] text-muted">${esc(entry.date)} · ${esc(entry.type)} · expéditeur : ${esc(entry.sender)}</p></div>${toneBadge(entry.status, entry.status === 'Transmis à la DR' || entry.status === 'Traité' || entry.status === 'Classé' ? 'success' : 'warning')}${WBTN(icon("eye", "size-4") + "Consulter", "ws-transmission", { variant: "ghost", attrs: { "data-id": entry.id, "data-ref": entry.reference } })}</div>`).join("") : '<div class="px-5 py-8 text-center text-sm text-muted">Aucun courrier dans la boîte de réception.</div>'}</div>` }) + workspaceCard({ html: cardHeader({ title: "Localisation physique", action: WBTN(icon("mapPin", "size-4") + "Mettre à jour", "ws-no-api", { variant: "ghost", attrs: { "data-message": "Mise à jour de la localisation : service non connecté." } }) }) + `<p class="px-5 pb-5 text-xs leading-relaxed text-muted">La localisation physique reste strictement interne. Elle n'est jamais visible depuis les espaces demandeurs ou personnes.</p><ul class="divide-y divide-line">${mailbox.map((entry) => `<li class="flex items-center gap-3 px-5 py-3"><span class="flex size-8 items-center justify-center rounded-lg bg-canvas text-republic-blue-700">${icon("mapPin", "size-4")}</span><div class="flex-1"><p class="text-[0.8125rem] font-medium text-ink-900">${esc(entry.reference)}</p><p class="text-[0.6875rem] text-muted">${esc(entry.location)}</p></div><time class="text-[0.6875rem] text-muted">${esc(entry.date)}</time></li>`).join("")}</ul>` });
}
function wsLocalisation(role) {
  const data = internalDemoData(role);
  const mailbox = data && data.mail ? data.mail : [];
  return wsIntro("Localisation physique", "Cette vue récapitule l'emplacement physique des dossiers. Elle est strictement réservée aux rôles internes autorisés.", "Secrétariat") + workspaceCard({ html: cardHeader({ title: "Emplacement courant" }) + `<div class="overflow-x-auto"><table class="min-w-[640px] w-full text-left text-xs"><thead class="bg-canvas text-[0.625rem] font-bold tracking-[0.12em] text-muted uppercase"><tr><th class="px-5 py-3">Référence</th><th class="px-5 py-3">Objet</th><th class="px-5 py-3">Emplacement</th><th class="px-5 py-3">Date</th></tr></thead><tbody class="divide-y divide-line">${mailbox.length ? mailbox.map((entry) => `<tr><td class="px-5 py-3 font-semibold text-ink-900">${esc(entry.reference)}</td><td class="px-5 py-3 text-muted">${esc(entry.label)}</td><td class="px-5 py-3 text-muted">${esc(entry.location)}</td><td class="px-5 py-3 text-muted">${esc(entry.date)}</td></tr>`).join("") : '<tr><td colspan="4" class="px-5 py-6 text-center text-muted">Aucune localisation enregistrée.</td></tr>'}</tbody></table></div>` });
}
function wsDocuments() {
  return wsIntro("Documents à fournir", "Les pièces attendues pour constituer le dossier.", "Pièces et justificatifs") + `<div class="grid gap-5 md:grid-cols-[1fr_0.7fr]">${workspaceCard({ html: cardHeader({ title: "Liste des pièces" }) + `<div class="divide-y divide-line">${["DTS — Document de travail et de synthèse", "Attestation de travail", "Pièce d'identité", "Photo de la cérémonie"].map((t,i) => `<div class="flex items-center gap-3 px-5 py-4"><span class="flex size-9 items-center justify-center rounded-lg ${i < 2 ? "bg-gold-100 text-gold-800" : "bg-canvas text-muted"}">${icon("fileText", "size-4")}</span><div class="flex-1"><p class="text-[0.8125rem] font-medium text-ink-900">${esc(t)}</p><p class="mt-1 text-[0.6875rem] text-muted">${i < 2 ? "À fournir" : "Optionnel"}</p></div>${toneBadge(i < 2 ? "À compléter" : "Reçu", i < 2 ? "warning" : "success")}</div>`).join("")}</div>` })}${workspaceCard({ className: "p-6", html: `<div class="rounded-2xl border border-dashed border-republic-green-300 bg-republic-green-50/50 p-7 text-center">${icon("upload", "mx-auto size-8 text-republic-green-600")}<p class="mt-3 text-sm font-semibold text-ink-900">Ajouter un document</p><p class="mt-1 text-xs leading-relaxed text-muted">Glissez un fichier ici ou sélectionnez-le. Aucun envoi réel.</p>${WBTN("Choisir un fichier", "ws-file", { className: "mt-5" })}</div>` })}</div>`;
}
function wsCeremonies(role) {
  return wsIntro("Cérémonies", "Vue mensuelle des cérémonies, dates, lieux et informations logistiques. Cliquez sur un jour pour consulter le détail.", "Calendrier des distinctions", WBTN(icon("calendar", "size-4") + "Vue calendrier", "ws-ceremony", { attrs: { "data-id": CEREMONIES[0].id } })) + wsCalendar(role) + `<section class="ws-paper"><div class="ws-section-heading"><div class="ws-eyebrow">VUE LISTE</div><h2 class="ws-page-title">Toutes les cérémonies</h2></div><div class="ws-events-list">${CEREMONIES.map(c => `<article class="ws-event-row"><div class="ws-event-date"><strong>${esc(c.date.slice(0,2))}</strong><span>${esc(c.date.slice(3,10))}</span></div><div class="ws-event-body"><h3>${esc(c.title)}</h3><p>${icon("mapPin", "size-4")} ${esc(c.location)}</p><small>${icon("users", "size-4")} ${c.participants} participants</small></div>${toneBadge(c.status, c.tone)}${WBTN(icon("arrowRight", "size-4") + "Détail", "ws-ceremony", { variant: "ghost", className: "ws-row-link", attrs: { "data-id": c.id } })}</article>`).join("")}</div></section>`;
}
function wsPayments() {
  const orders = [{ ref: "OR-2025-00841", dossier: "DNG-2025-00841", amount: "1 260 000 FCFA", status: "En attente de paiement", tone: "warning" }, { ref: "OR-2026-00112", dossier: "DNG-2025-01106", amount: "2 840 000 FCFA", status: "Quittance enregistrée", tone: "success" }];
  return wsIntro("Ordres de recette", "Montants, quittances et paiements présentés comme des exemples. Aucune transaction financière n'est possible.", "Trésor et quittances") + `<div class="grid gap-5 lg:grid-cols-[1fr_0.7fr]">${workspaceCard({ html: cardHeader({ title: "Ordres disponibles", action: toneBadge("2 ordres", "info") }) + `<div class="divide-y divide-line">${orders.map(o => `<div class="flex flex-wrap items-center gap-4 px-5 py-5"><span class="flex size-10 items-center justify-center rounded-xl bg-republic-blue-50 text-republic-blue-700">${icon("fileText", "size-5")}</span><div class="min-w-32 flex-1"><p class="text-sm font-semibold text-ink-900">${o.ref}</p><p class="mt-1 text-[0.6875rem] text-muted">Dossier ${o.dossier} · montant</p></div><span class="text-sm font-semibold text-ink-900">${o.amount}</span>${toneBadge(o.status, o.tone)}${WBTN(icon("download", "size-4") + "Aperçu", "ws-preview-order", { variant: "ghost", attrs: { "data-ref": o.ref } })}</div>`).join("")}</div>` })}${documentPreview({ type: "Ordre de recette", reference: "OR-2025-00841", compact: true })}</div>`;
}
function wsDecisions(role) {
  return wsIntro("Décisions initiales", `${role === "dr" ? "Le DR est l'autorité de décision de première instance sur le dossier initial." : "Consultez le dossier et enregistrez un avis."}`, ROLE_CONFIGS[role].shortLabel) + workspaceCard({ html: cardHeader({ title: "Dossier en attente de décision", action: toneBadge("À examiner", "warning") }) + `<div class="grid gap-4 p-5 sm:grid-cols-3">${[["Référence","DNG-2026-00418"],["Demandeur","SGSI"],["Récipiendaires","8 personnes"]].map(([a,b]) => `<div><p class="text-[0.6875rem] text-muted">${a}</p><p class="mt-1 text-sm font-semibold text-ink-900">${b}</p></div>`).join("")}</div><div class="border-t border-line px-5 py-5"><p class="text-sm font-semibold text-ink-900">Résumé de la décision</p><textarea placeholder="Ajouter des indications ou un motif de décision…" class="mt-3 min-h-28 w-full rounded-xl border border-line-strong bg-white p-3 text-sm outline-none focus:border-republic-green-500 focus:ring-4 focus:ring-republic-green-100"></textarea><div class="mt-4 flex flex-wrap gap-2">${WBTN(icon("check", "size-4")+"Approuver", "ws-decision", {variant:"primary",size:"md",attrs:{"data-kind":"approve"}})}${WBTN(icon("x", "size-4")+"Rejeter", "ws-decision", {size:"md",attrs:{"data-kind":"reject"}})}</div>${wsState.decision ? `<p class="mt-4 rounded-xl bg-republic-green-50 p-3 text-xs font-medium text-republic-green-700">${esc(wsState.decision)}</p>` : ""}</div>` });
}
function wsEligibility() {
  const types = [{ type: "bronze", label: "Bronze", threshold: "10 à 19 ans" },{ type: "argent", label: "Argent", threshold: "20 à 29 ans" },{ type: "or", label: "Or", threshold: "30 ans et plus" }];
  return wsIntro("Validation des distinctions", "Les seuils et indicateurs ci-dessous sont des repères ; ils ne constituent pas un moteur réglementaire.", "Instruction illustrative") + workspaceCard({ html: cardHeader({ title: "Éligibilité illustrée", action: toneBadge("Repères", "info") }) + `<div class="grid gap-4 p-5 sm:grid-cols-3">${types.map(t => `<div class="rounded-xl border border-line bg-canvas p-4"><div class="flex items-center gap-3"><span class="w-12">${medal({type:t.type,size:"sm",showRibbon:false})}</span><div><p class="text-sm font-semibold text-ink-900">${t.label}</p><p class="mt-1 text-xs text-muted">${t.threshold}</p></div></div></div>`).join("")}</div><div class="divide-y divide-line">${ALL_RECIPIENTS.slice(0,6).map(r => `<div class="flex flex-wrap items-center gap-4 px-5 py-4"><div class="min-w-48 flex-1"><p class="text-sm font-medium text-ink-900">${esc(r.name)}</p><p class="mt-1 text-xs text-muted">${esc(r.company)} · ${r.seniority} ans déclarés</p></div><span class="text-xs text-muted">Demandé : <strong class="text-ink-800">${r.medal}</strong></span>${r.seniority >= (r.medal === "Bronze" ? 10 : r.medal === "Argent" ? 20 : 30) ? toneBadge("Seuil atteint","success") : toneBadge("À examiner","warning")}</div>`).join("")}</div>` });
}
function wsAttendance() {
  return wsIntro("Présences", "Liste illustrative des invités à la cérémonie du 04 avril 2026.", "Organisation") + workspaceCard({ html: cardHeader({title:"Invités et remise des diplômes"}) + `<div class="divide-y divide-line">${ALL_RECIPIENTS.slice(0,6).map(r => `<div class="flex flex-wrap items-center gap-4 px-5 py-4"><div class="flex min-w-48 flex-1 items-center gap-3"><span class="flex size-8 items-center justify-center rounded-full bg-ink-100 text-[0.625rem] font-bold text-ink-700">${esc(r.name.slice(0,2).toUpperCase())}</span><span><span class="block text-sm font-medium text-ink-900">${esc(r.name)}</span><span class="block text-xs text-muted">Médaille ${r.medal}</span></span></div>${toneBadge(wsState.attendance[r.id] ? "Présence confirmée" : "À confirmer", wsState.attendance[r.id] ? "success" : "warning")}${WBTN(wsState.attendance[r.id] ? "Marquer absent" : "Confirmer", "ws-attendance", {variant:"ghost",attrs:{"data-id":r.id}})}</div>`).join("")}</div>` });
}
function wsPreviewPage(type, reference) {
  return wsIntro(type, "Aperçu du document. La prévisualisation utilise l'impression du navigateur.", "Document imprimable", WBTN(icon("printer", "size-4")+"Imprimer", "print")) + documentPreview({type, reference});
}
function wsStock() {
  return wsIntro("Stock des médailles", "Quantités indicatives, réservations fictives et seuils d'alerte illustratifs.", "Stock physique") + `<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">${STOCK.map(s => workspaceCard({className:"p-5",html:`<div class="flex items-start justify-between"><span class="flex size-10 items-center justify-center rounded-xl ${s.accent === "gold" ? "bg-gold-100 text-gold-800" : s.accent === "paper" ? "bg-republic-blue-50 text-republic-blue-700" : "bg-republic-green-50 text-republic-green-700"}">${icon(s.type === "Diplômes" ? "fileText" : "medal", "size-5")}</span>${toneBadge(s.quantity < s.threshold ? "Stock faible" : "Disponible", s.quantity < s.threshold ? "warning" : "success")}</div><p class="mt-6 text-sm font-semibold text-ink-900">${esc(s.type)}</p><p class="mt-1 text-3xl font-semibold tracking-[-0.05em] text-ink-900">${s.quantity}</p><p class="mt-1 text-xs text-muted">${s.reserved} réservés · seuil démo ${s.threshold}</p><div class="mt-5 h-2 rounded-full bg-canvas"><span class="block h-full rounded-full bg-republic-green-500" style="width:${Math.min(s.quantity/(s.quantity+s.reserved)*100,100)}%"></span></div>`})).join("")}</div><div class="mt-5">${dataTable({columns:[{key:"type",label:"Type",render:s=>`<span class="font-medium text-ink-900">${esc(s.type)}</span>`},{key:"available",label:"Disponible",render:s=>s.quantity},{key:"reserved",label:"Réservé",render:s=>s.reserved},{key:"last",label:"Dernier mouvement",render:()=>"03/03/2026 · Entrée"},{key:"campaign",label:"Campagne",render:()=>"Campagne 2026"}],rows:STOCK,rowKey:s=>s.type})}</div>`;
}
function wsMovements() {
  const rows = STOCK.flatMap((s,i) => [{id:`${s.type}-in`,date:"03/03/2026",ref:`MV-2026-0${i+4}`,type:s.type,quantity:i===3?120:36,reason:"Réception fournisseur",author:"Régie des Médailles"},{id:`${s.type}-out`,date:"28/02/2026",ref:`MV-2026-0${i+1}`,type:s.type,quantity:s.reserved,reason:"Réservation cérémonie",author:"Régie des Médailles"}]);
  return wsIntro("Mouvements de stock", "Entrées et sorties liées aux campagnes.", "Traçabilité physique") + dataTable({ columns: [{key:"date",label:"Date",render:r=>r.date},{key:"ref",label:"Référence",render:r=>`<span class="font-semibold text-ink-900">${r.ref}</span>`},{key:"type",label:"Article",render:r=>esc(r.type)},{key:"quantity",label:"Quantité",render:r=>`<span class="font-semibold text-republic-green-700">+${r.quantity}</span>`},{key:"reason",label:"Motif",render:r=>r.reason},{key:"author",label:"Auteur",render:r=>r.author}],rows,rowKey:r=>r.id });
}
function wsOrders() {
  return wsIntro("Bons de commande", "Prix et quantités pour le suivi d'une commande externe.", "Approvisionnement", WBTN(icon("plus","size-4")+"Ajouter une ligne", "ws-add-line", {variant:"primary",size:"md"})) + workspaceCard({html:cardHeader({title:"BC-2026-0012",action:toneBadge("En préparation","warning")})+`<div class="overflow-x-auto"><table class="min-w-[600px] w-full text-left text-sm"><thead class="bg-canvas text-[0.625rem] font-bold tracking-[0.12em] text-muted uppercase"><tr><th class="px-5 py-3">Article</th><th class="px-5 py-3">Quantité</th><th class="px-5 py-3">Prix unitaire</th><th></th></tr></thead><tbody class="divide-y divide-line">${wsState.lines.map((l,i)=>`<tr><td class="px-5 py-4 font-medium text-ink-900">${esc(l.type)}</td><td class="px-5 py-4 text-muted">${l.quantity}</td><td class="px-5 py-4 text-muted">${esc(l.price)}</td><td class="px-5 py-4 text-right"><button type="button" data-action="ws-remove-line" data-index="${i}" class="text-xs font-medium text-red-600">Retirer</button></td></tr>`).join("")}</tbody></table></div><div class="flex flex-col items-start justify-between gap-3 border-t border-line p-5 sm:flex-row sm:items-center"><p class="text-xs text-muted">Total indicatif : <strong class="text-ink-900">3 120 000 FCFA</strong> · indicatif</p>${WBTN("Confirmer l'envoi","ws-confirm-order")}</div>`});
}
function wsDeliveries() {
  const entries = [{ref:"LIV-2026-003",date:"03/03/2026",title:"Livraison partielle — BC-2026-0012",detail:"80 Bronze · 40 Argent · 120 diplômes",status:"Partielle",tone:"warning"},{ref:"LIV-2026-002",date:"12/02/2026",title:"Livraison totale — BC-2026-0008",detail:"60 Bronze · 25 Argent · 15 Or",status:"Conforme",tone:"success"}];
  return wsIntro("Livraisons", "Contrôle illustratif des quantités attendues et reçues.", "Réceptions fournisseur") + `<div class="grid gap-5 md:grid-cols-2">${entries.map(e=>workspaceCard({className:"p-5",html:`<div class="flex items-center justify-between"><span class="text-[0.6875rem] font-bold tracking-[0.12em] text-muted uppercase">${e.ref}</span>${toneBadge(e.status,e.tone)}</div><h3 class="mt-4 text-sm font-semibold text-ink-900">${e.title}</h3><p class="mt-2 text-xs text-muted">${e.date} · ${e.detail}</p>${WBTN("Consulter le bordereau "+icon("arrowRight","size-3.5"),"ws-delivery",{variant:"ghost",className:"mt-5 px-0",attrs:{"data-ref":e.ref}})}`})).join("")}</div>`;
}
function wsWithdrawals() {
  return wsIntro("Retraits sans cérémonie", "Justificatifs et personnes venues récupérer une distinction, concernés.", "Remise physique") + workspaceCard({html:cardHeader({title:"Demandes de retrait"})+`<div class="divide-y divide-line">${ALL_RECIPIENTS.slice(0,5).map((r,i)=>`<div class="flex flex-wrap items-center gap-4 px-5 py-4"><div class="flex min-w-48 flex-1 items-center gap-3"><span class="w-10">${medal({type:MEDAL_TYPES[r.medal],size:"sm",showRibbon:false})}</span><span><span class="block text-sm font-medium text-ink-900">${esc(r.name)}</span><span class="block text-xs text-muted">Médaille ${r.medal} · ${esc(r.company)}</span></span></div>${toneBadge(i%2?"Justificatif à vérifier":"Quittance présentée",i%2?"warning":"info")}${WBTN("Consulter","ws-withdrawal",{variant:"ghost",attrs:{"data-id":r.id}})}</div>`).join("")}</div>`});
}
function wsBudget() {
  return wsIntro("Budgets par campagne", "Montants indicatifs, sans valeur comptable ni engagement réel.", "Pilotage financier") + `<div class="grid gap-5 md:grid-cols-3">${CAMPAIGNS.map((c,i)=>workspaceCard({className:"p-5",html:`<p class="text-xs font-bold tracking-[0.12em] text-muted uppercase">${esc(c.split(" — ")[0])}</p><h3 class="mt-3 text-sm font-semibold leading-snug text-ink-900">${esc(c.split(" — ")[1])}</h3><div class="mt-6 flex items-end justify-between"><span class="text-2xl font-semibold text-ink-900">${[12.4,8.7,5.2][i]} M</span><span class="text-xs text-muted">FCFA alloués</span></div><div class="mt-4 h-2 rounded-full bg-canvas"><span class="block h-full rounded-full bg-republic-green-500" style="width:${[72,54,88][i]}%"></span></div><p class="mt-2 text-xs text-muted">${[72,54,88][i]} % consommé · solde indicatif</p>`})).join("")}</div>`;
}
function wsGeneric(page) {
  const titles = {complements:["Compléments et justificatifs","Pièces attendues et réponses simulées"],recours:["Recours","Décisions contestées et examens particuliers"],relances:["Relances","Demandes de suivi et réponses illustratives"],adjustments:["Assouplissements","Situations particulières à examiner"],transmissions:["Boîte de transmission","Courriers, dossiers et éléments reçus"],campaigns:["Statistiques par campagne","Indicateurs par période et campagne"]};
  const [title,description] = titles[page] || ["Vue détaillée","Informations"];
  return wsIntro(title,description+".","Espace connecté",WBTN(icon("plus","size-4")+"Nouvel élément","ws-new-element",{variant:"primary",size:"md"})) + `<div class="grid gap-5 md:grid-cols-3">${["DNG-2026-00418","DNG-2026-00372","DNG-2025-01106"].map((ref,i)=>workspaceCard({className:"p-5",html:`<div class="flex items-center justify-between"><span class="text-[0.6875rem] font-bold tracking-[0.1em] text-muted uppercase">${page==="transmissions"?"Courrier":"Élément"} ${i+1}</span>${toneBadge(i===1?"En attente":"En cours",i===1?"warning":"info")}</div><h3 class="mt-4 text-sm font-semibold text-ink-900">${ref}</h3><p class="mt-2 text-xs leading-relaxed text-muted">${page==="complements"?"Attestation de travail et pièce justificative ciblée.":page==="recours"?"Examen d'une décision sur l'ancienneté déclarée.":page==="transmissions"?"Transmission vers le niveau administratif prévu.":"Fiche à consulter."}</p>${WBTN("Consulter "+icon("arrowRight","size-3.5"),"ws-dossier",{variant:"ghost",className:"mt-5 px-0",attrs:{"data-ref":ref}})}`})).join("")}</div>`;
}
function wsProfile(role) {
  const conf=ROLE_CONFIGS[role];
  return wsIntro("Profil et paramètres","Préférences visuelles et informations de session.","Compte")+`<div class="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">${workspaceCard({className:"p-6 text-center",html:`<span class="mx-auto flex size-20 items-center justify-center rounded-full bg-ink-900 text-xl font-semibold text-white">${esc(conf.shortLabel.slice(0,2).toUpperCase())}</span><h3 class="mt-5 text-lg font-semibold text-ink-900">${esc(conf.label)}</h3><p class="mt-2 text-sm text-muted">Compte</p>${toneBadge("Session locale","success")}`})}${workspaceCard({className:"p-6",html:`<h3 class="text-sm font-semibold text-ink-900">Préférences</h3><div class="mt-5 space-y-4">${[["Notifications","Afficher les alertes dans la barre supérieure",true],["Mode contraste renforcé","Préférence visuelle locale",false]].map(([t,d,checked])=>`<label class="flex items-center justify-between gap-4 rounded-xl border border-line p-4"><span><span class="block text-sm font-medium text-ink-900">${t}</span><span class="mt-1 block text-xs text-muted">${d}</span></span><input type="checkbox" ${checked?"checked":""} class="size-5 accent-republic-green-500" /></label>`).join("")}</div>`})}</div>`;
}
function wsContent(role,page) {
  // Compatibilité descendante : « service » désigne désormais le chef de service.
  if (role === "service") role = "service_chef";
  if(page==="overview") {
    const profile = internalDemoData(role);
    return wsHero(role, page, profile && profile.profile) + wsOverview(role);
  }
  if(page==="dossiers"||page==="instruction") return wsDossiers(role);
  if(page==="new-dossier") return wsWizard();
  if(page==="recipients") return wsRecipients(role);
  if(page==="notifications") return wsNotifications();
  if(page==="activity") return wsActivity();
  if(page==="documents") return wsDocuments();
  if(page==="ceremonies") return wsCeremonies(role);
  if(page==="payments") return wsPayments();
  if(page==="decisions") return wsDecisions(role);
  // Le profil est accessible depuis la topbar, y compris lorsque le menu
  // du service et de la régie ne comporte pas de lien « Profil ».
  if(page==="profile") return wsProfile(role);
  if(["service_agent","service_inspecteur","service_chef"].includes(role)) {
    if(["adjustments","complements","campaigns"].includes(page)) return wsGeneric(page);
    if(page==="eligibility") return wsEligibility();
    if(page==="agenda") return wsCeremonies();
    if(page==="delegations") return wsPreviewPage("Document de délégation","DEL-2026-0026");
    if(page==="attendance") return wsAttendance();
    if(role === "service_agent" && page === "instruction") return wsDossiers("service_agent");
    return wsDossiers("service_chef");
  }
  if(role==="regisseur") {
    if(page==="stock") return wsStock();
    if(page==="movements") return wsMovements();
    if(page==="orders"||page==="supplies") return wsOrders();
    if(page==="deliveries") return wsDeliveries();
    if(page==="withdrawals") return wsWithdrawals();
    if(page==="remises") return wsPreviewPage("Bon de remise des médailles","REM-2026-00418");
    if(page==="campaigns") return wsBudget();
    if(page === "suppliers") return wsGeneric('suppliers');
    return wsStock();
  }
  if(["secretariat_ministre","secretariat_dgt","secretariat_dr"].includes(role)) {
    if(page === "transmissions") return wsTransmissions(role);
    if(page === "localisation") return wsLocalisation(role);
    if(["activity"].includes(page)) return wsActivity();
    if(page === "overview") return wsOverview(role);
    if(page === "notifications") return wsNotifications();
    if(page === "profile") return wsProfile(role);
    return wsTransmissions(role);
  }
  if(["ministre","dgt","dr"].includes(role)) {
    if (page === "decisions") return wsDecisionsPage(role);
    if (page === "recours") return wsRecoursPage(role);
    if (page === "relances") return wsRelancesPage(role);
    if (page === "activity") return wsActivityInternal(role);
    return wsContent("service_chef", page); // Réutilise les mêmes écrans.
  }
  if (role === "admin") return adminContent(role, page);
  if(page==="profile") return wsProfile(role);
  return wsGeneric(page);
}
/* ----------------------- Header sticky (style portail) ----------------------- */
function wsHeader(role, page, extra) {
  const conf = ROLE_CONFIGS[role];
  const unread = wsState.notices.filter((n) => !n.read).length;
  const profile = extra && extra.profile ? extra.profile : null;
  const org = role === "demandeur" || role === "admin" || role === "regisseur" || role.startsWith("service_") || role.startsWith("secretariat_") || ["ministre", "dgt", "dr"].includes(role);
  const display = profile ? (org && profile.shortLabel ? profile.shortLabel : profile.name || profile.label || conf.shortLabel) : conf.shortLabel;
  const subtitle = profile ? (profile.department || profile.email || "Mode démo") : "Mode démo";
  const avatar = conf.shortLabel.slice(0, 2).toUpperCase();
  const accent = conf.accent === "green" ? "republic-green" : conf.accent === "gold" ? "gold" : "republic-blue";
  const accentBg = conf.accent === "green" ? "bg-republic-green-50 text-republic-green-700" : conf.accent === "gold" ? "bg-gold-100 text-gold-800" : "bg-republic-blue-50 text-republic-blue-700";
  return `<header class="ws-header sticky top-0 z-50">
    <div class="ws-header-inner">
      <button type="button" data-action="ws-home" class="ws-brand" aria-label="Accueil République Gabonaise">
        ${emblem({ size: 40, className: "transition-transform duration-300 hover:scale-[1.04]" })}
        <span class="ws-brand-text">
          <strong>République Gabonaise</strong>
          <small>MEDITRA</small>
        </span>
      </button>
      <div class="ws-header-meta">
        <span class="ws-header-eyebrow">${esc(conf.label)}</span>
      </div>
      <div class="ws-header-tools">
        <button type="button" data-action="ws-toggle-menu" aria-label="Ouvrir la navigation" class="ws-icon-btn ws-menu-toggle" aria-expanded="false">
          ${icon("menu", "size-5")}
        </button>
        <div class="ws-notif-wrap">
          <button type="button" data-action="ws-notif-dropdown" aria-label="Notifications${unread ? ' : ' + unread + ' non lues' : ''}" class="ws-icon-btn ws-notif-btn" aria-expanded="${wsState.notificationsOpen}">
            ${icon("bell", "size-[18px]")}${unread ? `<span class="ws-notif-dot">${unread}</span>` : ""}
          </button>
          ${wsState.notificationsOpen ? `<div class="ws-popover" role="region" aria-label="Notifications récentes">
            <div class="ws-popover-title"><strong>Notifications</strong>${WBTN("Tout marquer lu", "ws-read-all", { variant: "ghost", className: "text-[0.6875rem]" })}</div>
            ${wsState.notices.length ? wsState.notices.slice(0, 3).map((n) => `<button type="button" data-action="ws-read" data-id="${esc(n.id)}" class="ws-notice-mini"><span>${esc(n.title)}</span><small>${esc(n.date)}</small></button>`).join("") : `<div class="ws-popover-empty">${icon("bell", "size-4")} Aucune notification</div>`}
            ${WLINK("Voir les notifications", "notifications", { className: "mt-3 w-full" })}
          </div>` : ""}
        </div>
        ${(typeof PRESENTATION_MODE !== "undefined" && PRESENTATION_MODE) || (typeof window !== "undefined" && window.PRESENTATION_MODE) ? `<button type="button" data-action="ws-switcher" class="ws-icon-btn ws-switcher-btn" aria-label="Changer de profil" aria-expanded="${wsState.switcherOpen}">${icon("users", "size-[18px]")}<span class="ws-switcher-btn-label">Profils</span></button>${wsState.switcherOpen ? (typeof renderProfileSwitcher === "function" ? renderProfileSwitcher(role) : "") : ""}` : ""}
        <button type="button" data-action="ws-account" class="ws-account" aria-expanded="${wsState.menu}">
          <span class="ws-avatar ws-avatar-${accent}">${esc(avatar)}</span>
          <span class="ws-account-text">
            <strong>${esc(display)}</strong>
            <small>${esc(subtitle)}</small>
          </span>
          ${icon("chevronDown", "size-4 ws-account-chevron" + (wsState.menu ? " is-open" : ""))}
        </button>
        ${wsState.menu ? `<div class="ws-account-menu" role="menu">
          ${WLINK("Mon profil", "profile", { className: "ws-menu-item", attrs: { role: "menuitem" } })}
          <button type="button" data-action="ws-profile-help" class="ws-menu-item" role="menuitem">${icon("info", "size-4")} Aide en ligne</button>
          ${(typeof PRESENTATION_MODE !== "undefined" && PRESENTATION_MODE) || (typeof window !== "undefined" && window.PRESENTATION_MODE) ? `<button type="button" data-action="ws-switcher" class="ws-menu-item" role="menuitem">${icon("users", "size-4")} Changer de profil</button>` : ""}
          <button type="button" data-action="signout" class="ws-menu-item" role="menuitem">${icon("logout", "size-4")} Déconnexion</button>
        </div>` : ""}
      </div>
    </div>
    <nav class="ws-tabs" aria-label="Navigation de l'espace">
      <div class="ws-tabs-inner">${conf.nav.map((n) => `<button type="button" data-action="ws-page" data-page="${n.page}" class="ws-tab${n.page === page ? " is-active" : ""}" aria-current="${n.page === page ? "page" : "false"}">${icon(n.icon, "size-4")}<span>${esc(n.label)}</span></button>`).join("")}</div>
    </nav>
    <div id="ws-mobile-menu" hidden class="ws-mobile-menu">
      <div class="ws-mobile-menu-inner">${conf.nav.map((n) => `<button type="button" data-action="ws-page" data-page="${n.page}" class="ws-mobile-link${n.page === page ? " is-active" : ""}">${icon(n.icon, "size-4")}<span>${esc(n.label)}</span></button>`).join("")}</div>
    </div>
  </header>`;
}
/* ==================================================================
   Calendrier des cérémonies
   - Vue mensuelle, navigation < > + bouton "Aujourd'hui".
   - Pastilles cliquables par cérémonie ; ouvre un modal de détail.
   - Compatible tous rôles : entreprise, personne, service, chef,
     ministre, dgt, dr.
================================================================== */
const WS_WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const WS_MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function wsCalendarSeed() {
  // Construit une liste de cérémonies fictives pour le calendrier.
  // Chaque cérémonie est liée à une date absolue.
  return [
    { id:"CAL-2026-004", date:"2026-04-04", time:"10:00", place:"Libreville — Hôtel de ville", title:"Cérémonie 2025 — Reconnaissance de l'ancienneté", medal:"Bronze", campaign:"2025", status:"Confirmée", recipients:22, organisation:"Ministère du Travail" },
    { id:"CAL-2026-005", date:"2026-04-18", time:"15:00", place:"Libreville — Salle des ambassadeurs", title:"Distinctions professionnelles — Tour interne", medal:"Argent", campaign:"2026", status:"Planifiée", recipients:8, organisation:"SGI" },
    { id:"CAL-2026-006", date:"2026-05-21", time:"11:30", place:"Port-Gentil — Centre administratif", title:"Distinctions professionnelles — Estuaire", medal:"Bronze", campaign:"2026", status:"À confirmer", recipients:6, organisation:"EFL" },
    { id:"CAL-2026-007", date:"2026-06-18", time:"09:00", place:"Libreville — Salle des conférences", title:"Campagne 2026 — Distinctions professionnelles", medal:"Or", campaign:"2026", status:"Planifiée", recipients:8, organisation:"CIG" },
    { id:"CAL-2026-008", date:"2026-07-09", time:"14:00", place:"Libreville — Hôtel de ville", title:"Distinctions — Reconnaissance de mérite exceptionnel", medal:"Or", campaign:"2026", status:"À confirmer", recipients:3, organisation:"SGI" },
    { id:"CAL-2026-009", date:"2026-09-12", time:"10:30", place:"Franceville — Hôtel de ville", title:"Distinctions — Province du Haut-Ogooué", medal:"Argent", campaign:"2026", status:"À confirmer", recipients:5, organisation:"EFL" },
    { id:"CAL-2026-010", date:"2026-10-15", time:"15:00", place:"Libreville — Palais présidentiel", title:"Cérémonie nationale — Distinctions de la République", medal:"Or", campaign:"2026", status:"Planifiée", recipients:14, organisation:"Présidence" },
    { id:"CAL-2026-011", date:"2026-11-18", time:"10:00", place:"Libreville — Salle des conférences", title:"Cérémonie de clôture — Campagne 2026", medal:"Or", campaign:"2026", status:"Planifiée", recipients:10, organisation:"SGI" },
  ];
}
function wsCalendarToday() { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), 1); }
function wsCalendarMonthName(monthOffset) {
  const base = wsCalendarToday();
  const d = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  return { year: d.getFullYear(), month: d.getMonth(), label: WS_MONTHS[d.getMonth()] + " " + d.getFullYear(), date: d };
}
function wsCalendar(role, options = {}) {
  const monthOffset = wsState.calendarOffset || 0;
  const ref = wsCalendarMonthName(monthOffset);
  const today = new Date();
  const events = wsCalendarSeed().filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === ref.year && d.getMonth() === ref.month;
  });
  const firstOfMonth = new Date(ref.year, ref.month, 1);
  const startDay = (firstOfMonth.getDay() + 6) % 7; // Lundi = 0
  const daysInMonth = new Date(ref.year, ref.month + 1, 0).getDate();
  const cells = [];
  // Jours du mois précédent
  const prevMonthDays = new Date(ref.year, ref.month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, other: true, date: new Date(ref.year, ref.month - 1, prevMonthDays - i) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, other: false, date: new Date(ref.year, ref.month, d) });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1];
    const next = new Date(last.date.getFullYear(), last.date.getMonth(), last.date.getDate() + 1);
    cells.push({ day: next.getDate(), other: next.getMonth() !== ref.month, date: next });
  }
  const todayKey = today.toDateString();
  const eventsByDate = events.reduce((acc, e) => {
    const key = new Date(e.date).toDateString();
    (acc[key] = acc[key] || []).push(e);
    return acc;
  }, {});
  const filters = options.filters || null;
  const visibleEvents = filters ? events.filter((e) => (!filters.medal || e.medal === filters.medal) && (!filters.status || e.status === filters.status)) : events;
  const visibleByDate = visibleEvents.reduce((acc, e) => {
    const key = new Date(e.date).toDateString();
    (acc[key] = acc[key] || []).push(e);
    return acc;
  }, {});
  const cellsHtml = cells.map((c) => {
    const key = c.date.toDateString();
    const list = visibleByDate[key] || [];
    const eventsHtml = list.slice(0, 3).map((e) => `<button type="button" data-action="ws-event" data-id="${esc(e.id)}" class="ws-calendar-event is-${esc(e.medal.toLowerCase().replace('é', 'e'))}"><span>${icon("medal", "size-3")}</span>${esc(e.title.replace(/^.+ — /, '').slice(0, 18))}</button>`).join('');
    const overflow = list.length > 3 ? `<span class="ws-calendar-event is-pending">+${list.length - 3}</span>` : '';
    return `<div class="ws-calendar-cell${c.other ? " is-other" : ""}${key === todayKey ? " is-today" : ""}"><span class="ws-calendar-day">${c.day}</span><div class="ws-calendar-events">${eventsHtml}${overflow}</div></div>`;
  }).join('');
  return `<section class="ws-paper">
    <div class="ws-section-heading">
      <div>
        <div class="ws-eyebrow">CALENDRIER DES CÉRÉMONIES</div>
        <h2 class="ws-page-title">Cérémonies planifiées</h2>
        <p class="ws-page-lead">Vue mensuelle des cérémonies confirmées, planifiées et à confirmer. Cliquez sur une cérémonie pour consulter son détail.</p>
      </div>
      <div class="ws-calendar-toolbar">
        <div class="ws-calendar-nav">
          <button type="button" data-action="ws-cal-prev" class="ws-icon-btn" aria-label="Mois précédent">${icon("chevronLeft", "size-4")}</button>
          <span class="ws-calendar-title">${esc(ref.label)}</span>
          <button type="button" data-action="ws-cal-next" class="ws-icon-btn" aria-label="Mois suivant">${icon("chevronRight", "size-4")}</button>
        </div>
        <button type="button" data-action="ws-cal-today" class="ws-link">Aujourd'hui</button>
      </div>
    </div>
    <div class="ws-calendar">
      <div class="ws-calendar-grid">${WS_WEEKDAYS.map((w) => `<div class="ws-calendar-weekday">${w}</div>`).join('')}${cellsHtml}</div>
    </div>
  </section>`;
}
function wsEventDetail(eventId) {
  const e = wsCalendarSeed().find((x) => x.id === eventId);
  if (!e) return "";
  const statusTone = e.status === "Confirmée" ? "success" : e.status === "Planifiée" ? "info" : "warning";
  return `<div class="ws-event-detail">
    <div class="ws-eyebrow">CÉRÉMONIE · ${esc(e.id)}</div>
    <h2 class="ws-page-title">${esc(e.title)}</h2>
    <div class="ws-event-grid">
      <div><span>Date</span><strong>${esc(new Date(e.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }))}</strong></div>
      <div><span>Heure</span><strong>${esc(e.time)}</strong></div>
      <div><span>Lieu</span><strong>${esc(e.place)}</strong></div>
      <div><span>Statut</span>${toneBadge(e.status, statusTone)}</div>
      <div><span>Récipiendaires</span><strong>${e.recipients}</strong></div>
      <div><span>Campagne</span><strong>${esc(e.campaign)}</strong></div>
      <div><span>Médaille</span><strong>${esc(e.medal)}</strong></div>
      <div><span>Organisation</span><strong>${esc(e.organisation)}</strong></div>
    </div>
    <p class="ws-context-note">${icon("info", "size-4")} Les cérémonies confirmées apparaissent dans le calendrier.</p>
    <div class="ws-modal-actions">
      ${WBTN("Fermer", "close-modal", { variant: "secondary" })}
      ${WBTN("Voir la liste", "ws-page", { variant: "primary", attrs: { "data-page": "ceremonies" } })}
    </div>
  </div>`;
}
function wsModalHtml() {
  const m=wsState.modal;
  if(!m) return "";
  if(m.type==="dossier") { const d=DOSSIERS.find(x=>x.reference===m.ref); return d?modal({open:true,title:d.reference,description:d.campaign,html:dossierDetails(d)}):""; }
  if(m.type==="ceremony") { const c=CEREMONIES.find(x=>x.id===m.id); return c?modal({open:true,title:c.title,description:"Fiche logistique",html:`<div class="space-y-3 text-sm"><p class="flex items-center gap-2 text-ink-800">${icon("calendar","size-4 text-republic-blue-600")}${esc(c.date)}</p><p class="flex items-center gap-2 text-ink-800">${icon("mapPin","size-4 text-republic-blue-600")}${esc(c.location)}</p><p class="flex items-center gap-2 text-ink-800">${icon("users","size-4 text-republic-blue-600")}${c.participants} participants prévus</p></div><div class="mt-6 flex justify-end gap-2">${WBTN("Fermer","close-modal")}${WBTN("Confirmer la lecture","close-modal",{variant:"primary"})}</div>`}):""; }
  if(m.type==="decision") return modal({open:true,title:m.kind==="approve"?"Confirmer l'approbation":"Confirmer le rejet",description:"Cette action est uniquement simulée dans la maquette.",html:`<p class="text-sm leading-relaxed text-muted">Vous êtes sur le point d'illustrer une décision pour le dossier DNG-2026-00418. Aucun changement métier réel ne sera effectué.</p><div class="mt-6 flex justify-end gap-2">${WBTN("Annuler","close-modal")}${WBTN(m.kind==="approve"?"Confirmer l'approbation":"Confirmer le rejet","ws-confirm-decision",{variant:"primary",attrs:{"data-kind":m.kind}})}</div>`});
  if(m.type==="preview") return modal({open:true,title:"Aperçu — "+m.ref,description:"Aperçu du document",html:documentPreview({reference:m.ref})});
  if(m.type==="info") return modal({open:true,title:m.title||"Information",description:"Information",html:`<p class="text-sm leading-relaxed text-muted">${esc(m.description)}</p><div class="mt-6 flex justify-end">${WBTN("Fermer","close-modal")}</div>`});
  return "";
}
function renderWorkspace(role,page) {
  const profile = internalDemoData(role);
  return `<div class="ws-page" data-ws-role="${role}" data-ws-page="${page}"><div class="auth-topline"></div>${wsHeader(role, page, { profile: profile && profile.profile ? profile.profile : null })}${demoBanner()}<main id="contenu" class="ws-main" data-ws-content>${wsContent(role,page)}</main><footer class="ws-footer"><span>${DEMO_NOTICE}</span><span>République Gabonaise — MEDITRA</span></footer><div id="ws-overlay">${wsModalHtml()}</div><div id="ws-toast">${wsToastHtml()}</div>${typeof portalBackTop === "function" ? portalBackTop() : ""}</div>`;
}
function wsToastHtml(){return wsState.toast?`<div role="status" class="fixed right-4 bottom-4 z-[70] flex max-w-sm items-start gap-3 rounded-xl border border-republic-green-200 bg-white p-4 text-xs text-ink-800 shadow-raised">${icon("checkCircle","size-4 shrink-0 text-republic-green-600")}<span>${esc(wsState.toast)}</span><button type="button" data-action="ws-dismiss-toast" class="text-muted" aria-label="Masquer le message">${icon("x","size-4")}</button></div>`:"";}
function wsPaint(role,page){
  const wizard=document.querySelector('[data-portal-wizard]');
  const node=wizard||document.querySelector('[data-ws-content]');
  if(node)node.innerHTML=wizard?`<p class="portal-context-note">Seuls les salariés actifs peuvent être ajoutés.</p>${wsWizard()}`:wsContent(role,page);
  wsPaintOverlay();
}
function wsPaintOverlay(){const node=document.getElementById("ws-overlay");if(node)node.innerHTML=wsModalHtml();const toast=document.getElementById("ws-toast");if(toast)toast.innerHTML=wsToastHtml();}
function wsRepaintAll(role,page){const app=document.getElementById("app");if(app)app.innerHTML=renderWorkspace(role,page);}
function wsToast(message){wsState.toast=message;if(document.querySelector('[data-portal-wizard]'))portalNotice(message);else wsPaintOverlay();}
/* Retourne true si l'action a été prise en charge. */
function wsAction(action,el,role,page){
  switch(action){
    case "ws-page": wsState.sidebarOpen=false;wsState.notificationsOpen=false;wsState.modal=null;wsState.query="";if(page===el.dataset.page)wsRepaintAll(role,page);else wsGo(role,el.dataset.page);return true;
    case "ws-role": wsState.sidebarOpen=false;wsState.switcherOpen=false;wsState.query="";if(role===el.dataset.role&&page==="overview")wsRepaintAll(role,page);else wsGo(el.dataset.role,"overview");return true;
    case "ws-open-sidebar":wsState.sidebarOpen=true;wsRepaintAll(role,page);return true;
    case "ws-close-sidebar":wsState.sidebarOpen=false;wsRepaintAll(role,page);return true;
    case "ws-switcher":wsState.switcherOpen=!wsState.switcherOpen;wsRepaintAll(role,page);return true;
    case "ws-notif-dropdown":wsState.notificationsOpen=!wsState.notificationsOpen;wsState.menu=false;wsRepaintAll(role,page);return true;
    case "ws-toggle-menu":{
      const menu = document.getElementById("ws-mobile-menu");
      const btn = document.querySelector('[data-action="ws-toggle-menu"]');
      if (!menu || !btn) return true;
      const open = menu.hidden;
      menu.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      btn.innerHTML = icon(open ? "x" : "menu", "size-5");
      return true;
    }
    case "ws-account":wsState.menu=!wsState.menu;wsState.notificationsOpen=false;wsRepaintAll(role,page);return true;
    case "ws-home":navigateTo("/");return true;
    case "ws-profile-help":wsState.menu=false;wsPaintOverlay();wsToast("Aucune aide en ligne n'est connectée dans cet aperçu.");return true;
    case "ws-switch-role": if (typeof doSwitchProfile === "function") { doSwitchProfile(el.dataset.role, el.dataset.email); } return true;
    case "ws-assistant-toggle": if (typeof assistantToggle === "function") { wsState.menu=false; assistantToggle(); } return true;
    case "ws-assistant-clear": if (typeof assistantClear === "function") { assistantClear(); } return true;
    case "ws-assistant-submit": { const f = el && el.tagName === "FORM" ? el : (el && el.closest ? el.closest("form") : null); if (f && typeof assistantSubmit === "function") { assistantSubmit(f); } return true; }
    case "ws-notif-toggle":wsState.notificationsOpen=!wsState.notificationsOpen;wsRepaintAll(role,page);return true;
    case "ws-read-all":wsState.notices.forEach(n=>n.read=true);wsState.notificationsOpen=false;wsRepaintAll(role,page);return true;
    case "ws-read":{const n=wsState.notices.find(n=>n.id===el.dataset.id);if(n)n.read=true;wsRepaintAll(role,page);return true;}
    case "ws-dossier":wsState.modal={type:"dossier",ref:el.dataset.ref};wsPaintOverlay();return true;
    case "ws-ceremony":wsState.modal={type:"ceremony",id:el.dataset.id};wsPaintOverlay();return true;
    case "ws-preview-order":wsState.modal={type:"preview",ref:el.dataset.ref};wsPaintOverlay();return true;
    case "ws-decision":wsState.modal={type:"decision",kind:el.dataset.kind};wsPaintOverlay();return true;
    case "ws-confirm-decision":wsState.decision=el.dataset.kind==="approve"?"Décision d'approbation simulée.":"Décision de rejet simulée.";wsState.modal=null;wsPaint(role,page);return true;
    case "ws-attendance": wsState.attendance[el.dataset.id]=!wsState.attendance[el.dataset.id];wsPaint(role,page);return true;
    case "ws-reset-filter": wsState.query="";wsState.status="Tous les statuts";wsPaint(role,page);return true;
    case "ws-wizard-next": wsState.wizardStep=Math.min(5,wsState.wizardStep+1);wsPaint(role,page);return true;
    case "ws-wizard-prev": wsState.wizardStep=Math.max(1,wsState.wizardStep-1);wsPaint(role,page);return true;
    case "ws-wizard-submit": wsState.wizardDone=true;wsPaint(role,page);return true;
    case "ws-wizard-reset": wsState.wizardDone=false;wsState.wizardStep=1;wsState.recipients=document.querySelector('[data-portal-wizard]')?[]:[{id:"new-1",name:"Aline Moubamba",function:"Directrice administrative",seniority:"18",medal:"Bronze"}];wsPaint(role,page);return true;
    case "ws-add-recipient":{
      if(document.querySelector('[data-portal-wizard]')){
        const active=portalData('demandeur')?.employees?.filter(e=>e.status==='ACTIF')||[];
        const next=active.find(e=>!wsState.recipients.some(r=>r.name===e.name));
        if(!next){wsToast('Tous les salariés actifs de la présentation sont déjà affichés.');return true;}
        wsState.recipients.push({id:next.name,name:next.name,function:next.job,seniority:String(2026-Number(next.start.slice(-4))),medal:'Bronze'});
      }else wsState.recipients.push({id:`new-${Date.now()}`,name:"Nouveau récipiendaire",function:"Fonction à renseigner",seniority:"10",medal:"Bronze"});
      wsPaint(role,page);return true;
    }
    case "ws-remove-recipient": wsState.recipients.splice(Number(el.dataset.index),1);wsPaint(role,page);return true;
    case "ws-draft": wsToast("Brouillon enregistré.");return true;
    case "ws-file": wsToast("Sélection de fichier simulée : courrier-initiation-2026.pdf");return true;
    case "ws-add-line": wsState.lines.push({type:"Diplômes",quantity:100,price:"4 500 FCFA"});wsPaint(role,page);return true;
    case "ws-remove-line": wsState.lines.splice(Number(el.dataset.index),1);wsPaint(role,page);return true;
    case "ws-confirm-order": wsToast("Envoi de la commande simulé. Aucune opération réelle.");return true;
    case "ws-new-element": wsState.modal={type:"info",title:"Nouvel élément",description:"Cette opération n'enregistre pas encore de donnée métier."};wsPaintOverlay();return true;
    case "ws-delivery": wsState.modal={type:"info",title:"Bordereau "+el.dataset.ref,description:"Bordereau de livraison."};wsPaintOverlay();return true;
    case "ws-event":{
      const html = wsEventDetail(el.dataset.id);
      if (html) { wsState.modal = { type: "ceremony-detail" }; wsPaintOverlay(); /* custom render via HTML injection */ const overlay = document.getElementById("ws-overlay"); if (overlay) { overlay.innerHTML = modal({ open: true, title: "Détail de la cérémonie", description: "", html }); } }
      return true;
    }
    case "ws-cal-prev": wsState.calendarOffset = (wsState.calendarOffset || 0) - 1; wsPaint(role, page); return true;
    case "ws-cal-next": wsState.calendarOffset = (wsState.calendarOffset || 0) + 1; wsPaint(role, page); return true;
    case "ws-cal-today": wsState.calendarOffset = 0; wsPaint(role, page); return true;
    case "ws-transmission": wsState.modal={type:"info",title:"Courrier "+el.dataset.ref,description:"Détails du courrier. Service d'enregistrement non connecté."};wsPaintOverlay();return true;
    case "ws-no-api": wsToast(el.dataset.message || "Action non disponible.");return true;
    case "ws-withdrawal":{const r=ALL_RECIPIENTS.find(x=>x.id===el.dataset.id);wsState.modal={type:"info",title:"Demande de retrait",description:r?`${r.name} — médaille ${r.medal}. Contrôle des justificatifs simulé.`:"Consultation simulée."};wsPaintOverlay();return true;}
    case "ws-dismiss-toast": wsState.toast="";wsPaintOverlay();return true;
    default:return false;
  }
}
function wsInput(target,role,page){
  if(!target.matches("[data-ws-search]"))return;
  wsState.query=target.value;
  const rows=target.dataset.wsSearch==="dossiers"
    ?DOSSIERS.filter(d=>(wsState.status==="Tous les statuts"||d.status.label===wsState.status)&&`${d.reference} ${d.applicant} ${d.campaign}`.toLowerCase().includes(wsState.query.toLowerCase()))
    :ALL_RECIPIENTS.filter(r=>`${r.name} ${r.company} ${r.medal}`.toLowerCase().includes(wsState.query.toLowerCase()));
  const container=document.getElementById("ws-table");if(container)container.innerHTML=target.dataset.wsSearch==="dossiers"?wsDossiersTable(rows):wsRecipientsTable(rows);
  const count=document.getElementById("ws-result-count");if(count)count.textContent=`${rows.length} résultat${rows.length>1?"s":""}`;
}
function wsChange(target,role,page){
  if(target.matches("[data-ws-filter]")){wsState.status=target.value;wsPaint(role,page);}
}
