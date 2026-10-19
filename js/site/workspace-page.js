/* ==================================================================
   js/site/workspace-page.js
   Montage d'une page métier multipage.

   Le document HTML porte la famille et la page (`data-site-family`,
   `data-site-page`). Le rôle vient de la session. Le contenu métier
   réutilise les vues existantes (`cfBanner`, `cfContent`, GAB-ORIENT) :
   aucune règle métier n'est réécrite.
================================================================== */

function siteConfirmBarHtml() {
  if (!cfState.confirm) return "";
  return `<div class="cf-confirm-bar" role="status">
    <span>${typeof icon === "function" ? icon("info", "size-4") : ""}<strong>Confirmation requise</strong> ${esc(cfState.confirm.summary || "cette action")}</span>
    <span class="cf-confirm-actions">${cfBtn("Annuler", "confirm-off", "", "cf-btn-ghost")}${cfBtn("Confirmer", "confirm-on", `data-next="${esc(cfState.confirm.action || "")}" data-id="${esc(cfState.confirm.id || "")}" data-summary="${esc(cfState.confirm.summary || "")}"`, "cf-accent")}</span>
  </div>`;
}

function sitePaintOverlays() {
  const panel = document.getElementById("mp-panel");
  if (panel) panel.innerHTML = cfState.panel && typeof cfPanel === "function" ? cfPanel() : "";
  const viewer = document.getElementById("mp-viewer");
  if (viewer) viewer.innerHTML = cfState.viewer && typeof cfViewer === "function" ? cfViewer() : "";
  const confirm = document.getElementById("mp-confirm");
  if (confirm) confirm.innerHTML = siteConfirmBarHtml();
  const toast = document.getElementById("cf-toast");
  if (toast) toast.innerHTML = typeof cfToastHtml === "function" ? cfToastHtml() : "";
}

/** Repeint uniquement le contenu et les panneaux de la page courante. */
function siteRepaintWorkspace() {
  const ctx = siteContext();
  if (!ctx.ok) { siteRenderAccessDenied(ctx); return; }
  cfState.spaceRole = ctx.role;
  try { cfLoad(); } catch (error) { /* magasin local */ }
  if (typeof goHydrate === "function") goHydrate(ctx.role);

  const main = document.getElementById("view");
  if (!main) return;
  const view = typeof goViewFor === "function" ? (goViewFor(ctx.role, ctx.page) || "") : "";
  main.setAttribute("data-go-view", view);
  main.setAttribute("data-go-page", ctx.page);
  main.innerHTML = (typeof cfBanner === "function" ? cfBanner(ctx.role, ctx.page, {}) : "") +
    (typeof cfContent === "function" ? cfContent(ctx.role, ctx.page) : "");
  if (typeof goInstallHosts === "function") goInstallHosts();
  if (typeof goMountLive === "function") goMountLive(ctx.role, ctx.page);
  sitePaintOverlays();
  siteChromePaint(ctx.role, ctx.page);
}

function siteAccessDeniedHtml(ctx) {
  const role = ctx.role;
  const ownFamily = role ? siteFamilyOf(role) : null;
  const ownHome = ownFamily ? SITE_FAMILIES[ownFamily].base : SITE_PUBLIC.login;
  const title = ctx.reason === "family" ? "Espace non autorisé" : "Page indisponible";
  const lead = ctx.reason === "family"
    ? "Votre compte n'a pas accès à cet espace. Utilisez l'espace correspondant à votre rôle."
    : "Cette page n'est pas proposée pour votre profil. Les droits sont vérifiés à chaque chargement.";
  return `<section class="page-head mp-denied">
    <p class="page-eyebrow">Accès</p>
    <h1 class="page-title">${esc(title)}</h1>
    <p class="page-sub">${esc(lead)}</p>
    <div class="mp-denied-actions">
      <a class="btn btn-primary" href="${ownHome}">Ouvrir mon espace</a>
      <a class="btn btn-secondary" href="${sitePublicPath("home")}">Accueil public</a>
    </div>
  </section>
  <section class="card mt">
    <h2 class="card-title">${typeof icon === "function" ? icon("shield", "size-4") : ""}Contrôle d'accès</h2>
    <p class="card-sub">Les données affichées restent limitées à votre organisme et à vos droits. Modifier l'URL ne donne accès à aucun dossier supplémentaire.</p>
  </section>`;
}

function siteRenderAccessDenied(ctx) {
  const main = document.getElementById("view");
  const body = document.body;
  if (main) {
    main.innerHTML = siteAccessDeniedHtml(ctx);
    main.setAttribute("data-go-view", "");
  }
  if (body) body.classList.add("is-denied");
  siteChromePaint(ctx.role || "", (body && body.dataset.sitePage) || "overview");
}

/** Point d'entrée d'une page métier. */
function siteMountWorkspace() {
  const ctx = siteContext();
  if (!ctx.ok) {
    if (ctx.reason === "anonymous") {
      window.location.replace(siteLoginUrl(window.location.pathname + window.location.search));
      return;
    }
    siteRenderAccessDenied(ctx);
    siteChromeBind();
    return;
  }
  cfState.spaceRole = ctx.role;
  try { cfLoad(); } catch (error) { /* stockage local */ }
  if (typeof goHydrate === "function") goHydrate(ctx.role);
  siteChromeBind();
  siteRepaintWorkspace();

  // L'état de sélection peut venir d'un lien direct (?ref=…).
  const ref = new URLSearchParams(window.location.search).get("ref");
  if (ref && typeof goOpenRef === "function") {
    try { goOpenRef("dossiers", ref); } catch (error) { /* la liste reste utilisable */ }
  }
}
