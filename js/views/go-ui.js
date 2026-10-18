/* Briques GAB-ORIENT (ui.head, card, kpis, toolbar, chips, table, pipeline).
   Données et pouvoirs : FrontII (ipMay, dn.cf.store.v1). Pas de GO_DATA ni GO.modal. */
function goHead(o) {
  o = o || {};
  return `<section class="page-head go-page-head">
    <div>${o.eyebrow ? `<div class="page-eyebrow">${esc(o.eyebrow)}</div>` : ""}
      ${o.title ? `<h2 class="page-title">${esc(o.title)}</h2>` : ""}
      ${o.sub ? `<p class="page-sub">${o.sub}</p>` : ""}</div>
    ${o.actions ? `<div class="page-actions">${o.actions}</div>` : ""}
  </section>`;
}
function goCard(o) {
  o = o || {};
  const ic = o.icon && typeof icon === "function" ? icon(o.icon, "size-4") : "";
  return `<section class="go-card card ${o.cls || ""}"${o.id ? ` id="${o.id}"` : ""}${o.label ? ` aria-labelledby="${o.label}"` : ""}>
    <div class="card-head"><div><h2 class="card-title"${o.label ? ` id="${o.label}"` : ""}>${ic}${esc(o.title || "")}</h2>${o.sub ? `<p class="card-sub">${o.sub}</p>` : ""}</div>${o.tools || ""}</div>
    ${o.body != null ? `<div class="card-body">${o.body}</div>` : ""}
  </section>`;
}
function goKpis(items) {
  return `<div class="kpi-strip">${(items || []).map((k) => `<button type="button" class="kpi"${k.page ? ` data-action="ws-page" data-page="${k.page}"` : ""}${k.filter != null ? ` data-cf-action="filter" data-value="${esc(k.filter)}"` : ""}>
    <div class="kpi-label">${esc(k.label)}</div>
    <div class="kpi-value">${esc(String(k.count != null ? k.count : (k.value != null ? k.value : "—")))}</div>
    <div class="kpi-note">${esc(k.note || "")}</div>
  </button>`).join("")}</div>`;
}
function goChips(items, active, opts) {
  opts = opts || {};
  const action = opts.action || "filter";
  const key = opts.key || "filter";
  const attr = opts.attr || "data-value";
  return `<div class="go-chips chip-row" ${opts.id ? `id="${opts.id}"` : ""} role="group" aria-label="${esc(opts.label || "Filtrer")}">${(items || []).map((it) => `<button type="button" class="go-chip ${String(it.key) === String(active) ? "is-on" : ""}" data-cf-action="${action}" data-key="${key}" ${attr}="${esc(it.key)}">${esc(it.label)}<span class="chip-n">${it.n}</span></button>`).join("")}</div>`;
}
function goToolbar(placeholder, extra) {
  return `<div class="cf-toolbar go-toolbar"><label class="cf-search">${icon("search", "size-4")}<input data-cf-q value="${esc(typeof cfState !== "undefined" ? cfState.query : "")}" placeholder="${esc(placeholder || "Rechercher")}" /></label>${extra || ""}</div>`;
}
function goToolbarFull(o) {
  o = o || {};
  const search = o.search ? `<div class="field grow"><label class="mini-label" for="${o.search.id}">${esc(o.search.label || "Rechercher")}</label><div class="search-field">${icon("search", "size-4")}<input id="${o.search.id}" class="input" data-cf-q type="search" placeholder="${esc(o.search.placeholder || "")}" value="${esc(o.search.value != null ? o.search.value : (typeof cfState !== "undefined" ? cfState.query : ""))}" autocomplete="off"></div></div>` : "";
  const selects = (o.selects || []).map((s) => `<div class="field"><label class="mini-label" for="${s.id}">${esc(s.label)}</label><select class="select" id="${s.id}" data-cf-sort="${esc(s.key || "sort")}">${s.options.map((op) => `<option value="${esc(op.value)}"${String(op.value) === String(s.value) ? " selected" : ""}>${esc(op.label)}</option>`).join("")}</select></div>`).join("");
  return `<div class="toolbar go-toolbar">${search}${selects}${o.extra || ""}</div>`;
}
function goFilterBar(chips, count) {
  return `<div class="filter-bar"${chips ? "" : " style=\"justify-content:flex-end\""}>${chips || ""}<span class="result-count" aria-live="polite">${count || ""}</span></div>`;
}
function goTable(cols, rows, o) {
  o = o || {};
  const head = cols.map((c) => `<th scope="col"${c.cls ? ` class="${c.cls}"` : ""}>${c.head != null ? c.head : esc(c.label || "")}</th>`).join("");
  if (!rows.length) {
    return `<div class="table-wrap"><table class="data-table portal-table responsive"${o.id ? ` id="${o.id}"` : ""}>${o.caption ? `<caption class="sr-only">${esc(o.caption)}</caption>` : ""}<thead><tr>${head}</tr></thead><tbody><tr><td colspan="${cols.length}">${esc(o.empty || "Aucun élément.")}</td></tr></tbody></table></div>${o.emptyId ? `<div id="${o.emptyId}"></div>` : ""}`;
  }
  const body = rows.map((r, i) => `<tr class="is-clickable row-in ${o.isOn && o.isOn(r) ? "is-on" : ""}"${o.rowAttrs ? " " + o.rowAttrs(r, i) : ""}>${cols.map((c) => `<td data-label="${esc(c.label || "")}"${c.cls ? ` class="${c.cls}"` : ""}>${c.cell(r, i)}</td>`).join("")}</tr>`).join("");
  return `<div class="table-wrap"><table class="data-table portal-table responsive"${o.id ? ` id="${o.id}"` : ""}>${o.caption ? `<caption class="sr-only">${esc(o.caption)}</caption>` : ""}<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}
function goEmpty(title, text, ic) {
  const ico = typeof icon === "function" ? icon(ic || "folder", "size-5") : "";
  return `<div class="go-empty empty">${ico}<h3>${esc(title || "Aucun élément")}</h3><p>${esc(text || "")}</p></div>`;
}
function goDl(items) {
  return `<dl class="dl-grid">${(items || []).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v == null || v === "" ? "—" : v}</dd></div>`).join("")}</dl>`;
}
function goList(items) {
  if (!(items || []).length) return "";
  return `<ul class="list-plain">${items.map((it) => `<li><span class="list-plain-main">${it.html}</span>${it.action || ""}</li>`).join("")}</ul>`;
}
function goStepper(status) {
  const order = typeof CF_FRISE !== "undefined" ? CF_FRISE : [];
  const cur = order.indexOf(status);
  return `<span class="go-stepper" aria-hidden="true">${order.map((s, i) => `<i class="${i < cur ? "is-done" : i === cur ? "is-now" : ""}" title="${esc((typeof CF_STATUS_LABEL !== "undefined" && CF_STATUS_LABEL[s]) || s)}"></i>`).join("")}</span>`;
}
function goPipeline(counts, page) {
  const keys = Object.keys(counts || {});
  const total = keys.reduce((n, k) => n + (counts[k] || 0), 0);
  const bar = keys.map((k) => {
    const n = counts[k] || 0;
    if (!n) return "";
    return `<span class="pipe-seg" style="flex-grow:${n}"></span>`;
  }).join("");
  const cells = keys.map((k) => `<button type="button" class="pipe-cell" data-action="ws-page" data-page="${page || "dossiers"}" data-cf-action="filter" data-value="${esc(k)}">
      <span class="pipe-cell-label">${esc((typeof CF_STATUS_LABEL !== "undefined" && CF_STATUS_LABEL[k]) || k)}</span>
      <span class="pipe-cell-value">${counts[k] || 0}</span>
    </button>`).join("");
  return `<section class="go-card card pipeline-card">
    <div class="card-head"><div><h2 class="card-title">${typeof icon === "function" ? icon("chart", "size-4") : ""}Circuit des dossiers</h2>
      <p class="card-sub">${total} dossier${total > 1 ? "s" : ""} — chaque segment ouvre la liste filtrée.</p></div></div>
    <div class="card-body"><div class="pipeline"><div class="pipe-bar" role="img" aria-label="Répartition par statut">${bar || "<span class=\"pipe-seg\"></span>"}</div>
      <div class="pipe-cells">${cells}</div></div></div>
  </section>`;
}
function goAgeDays(fr) {
  if (!fr) return 0;
  if (typeof cfParseFr === "function") {
    const d = cfParseFr(fr);
    if (d) {
      const today = typeof CF_TODAY !== "undefined" ? CF_TODAY : new Date();
      return Math.max(0, Math.round((today - d) / 86400000));
    }
  }
  const iso = Date.parse(fr);
  if (!isNaN(iso)) {
    const today = typeof CF_TODAY !== "undefined" ? CF_TODAY : new Date();
    return Math.max(0, Math.round((today - iso) / 86400000));
  }
  return 0;
}
function goBtn(label, page, cls) {
  return `<button type="button" class="btn ${cls || "btn-secondary"}" data-action="ws-page" data-page="${page}">${label}</button>`;
}
function goLink(label, page, cls) {
  return `<button type="button" class="btn ${cls || "btn-ghost btn-sm"}" data-action="ws-page" data-page="${page}">${label}</button>`;
}
function goPlural(n, one, many) {
  return n + " " + (n > 1 ? many : one);
}
