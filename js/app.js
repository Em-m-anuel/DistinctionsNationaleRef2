/* ==================================================================
   js/app.js — amorçage d'une page du site multipage.

   Chaque document HTML est une page réelle :
     · /                        accueil public
     · /connexion/              connexion
     · /inscription/            inscription
     · /profil/<famille>/<page>/ espace métier
     · /administration/<page>/   administration

   Aucun routeur client, aucune navigation par hash : les liens du site
   sont de vrais liens et `navigateTo()` charge un nouveau document.
================================================================== */
(function () {
  "use strict";

  const body = document.body;
  const kind = body.dataset.siteKind || "workspace";
  const root = document.getElementById("app");
  let chromeCleanup = null;

  /* ------------------------ Filet de sécurité d'affichage ------------------- */

  // Une erreur d'exécution ne doit jamais laisser une page blanche : on
  // affiche un message lisible (avec la cause) au lieu de rien.
  function showBootError(error) {
    const message = (error && (error.message || error.reason && error.reason.message)) || String(error || "Erreur inconnue");
    const zone = document.getElementById("view") || root || document.body;
    if (!zone) return;
    zone.innerHTML = `<section class="page-head mp-boot-error" role="alert">
      <p class="page-eyebrow">Affichage interrompu</p>
      <h1 class="page-title">Cette page n'a pas pu s'afficher</h1>
      <p class="page-sub">Le contenu n'a pas pu être monté. Vos données ne sont pas en cause.</p>
      <p class="mp-boot-detail"><code>${String(message).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]))}</code></p>
      <div class="mp-denied-actions">
        <a class="btn btn-primary" href="${window.location.pathname}">Recharger la page</a>
        <a class="btn btn-secondary" href="${sitePublicPath("home")}">Accueil public</a>
      </div>
    </section>`;
  }

  window.addEventListener("error", (event) => {
    // Erreurs des scripts tiers (polices, carte) : sans incidence ici.
    if (event && event.target && event.target.tagName === "SCRIPT" && event.target.src && !/\/js\//.test(event.target.src)) return;
    showBootError(event.error || event.message);
  });
  window.addEventListener("unhandledrejection", (event) => showBootError(event.reason));

  /* -------------------- Anciens favoris (href="#/…") ----------------------- */

  // Les URL à hash de l'ancienne SPA ne sont plus des routes. Un favori
  // enregistré est traduit une seule fois vers la page réelle, puis le
  // navigateur charge le document correspondant.
  function redirectLegacyHash() {
    const hash = window.location.hash || "";
    if (!hash || hash === "#" || hash === "#/") return false;
    if (hash === "#/login") { window.location.replace(sitePublicPath("login")); return true; }
    if (hash === "#/register") { window.location.replace(sitePublicPath("register")); return true; }
    if (hash.indexOf("#/app/") === 0) {
      const parsed = typeof parseWorkspacePath === "function" ? parseWorkspacePath(hash.slice(1)) : null;
      if (parsed) {
        window.location.replace(workspacePath(parsed.role, parsed.page));
        return true;
      }
      window.location.replace(sitePublicPath("login"));
      return true;
    }
    const ref = /^#\/dossiers\/([^/?]+)/.exec(hash);
    const role = typeof siteSessionRole === "function" ? siteSessionRole() : null;
    if (ref && role && typeof workspacePath === "function") {
      window.location.replace(workspacePath(role, "dossiers") + "?ref=" + encodeURIComponent(ref[1]));
      return true;
    }
    return false;
  }

  if (redirectLegacyHash()) return;

  /* ----------------------------- Rendu initial ----------------------------- */

  try {
    if (kind === "home") {
      if (root) root.innerHTML = renderHome(getSession());
      mountHome();
      mountAppChrome();
    } else if (kind === "auth") {
      const route = body.dataset.siteAuth === "register" ? "/register" : "/login";
      document.title = (route === "/register" ? "Inscription" : "Connexion") + " — MEDITRA";
      if (root) root.innerHTML = renderLogin(getSession(), route);
      mountLogin();
      mountAppChrome();
    } else if (typeof siteMountWorkspace === "function") {
      siteMountWorkspace();
      mountAppChrome();
    } else {
      showBootError(new Error("siteMountWorkspace indisponible : js/site/workspace-page.js n'a pas été chargé."));
    }
  } catch (error) {
    showBootError(error);
  }

  // Le garde-fou en ligne des pages générées vérifie ce drapeau : s'il est
  // absent après quelques secondes, les scripts n'ont pas été chargés.
  window.__siteBooted = true;

  // Si le montage n'a rien produit (script non chargé, exception silencieuse),
  // l'écran de chargement est remplacé par un diagnostic actionnable.
  window.setTimeout(() => {
    if (kind !== "workspace") return;
    const view = document.getElementById("view");
    if (!view) return;
    if (!view.querySelector(".mp-loading")) return;
    showBootError(new Error("Le contenu de la page ne s'est pas monté (scripts bloqués ou incomplets)."));
  }, 6000);

  /* ------------------------------ Chrome visuel ---------------------------- */

  function mountAppChrome() {
    if (chromeCleanup) chromeCleanup();
    const btn = document.querySelector("[data-back-to-top]");
    const header = document.querySelector(".site-header, .portal-chrome, .ws-header, [data-site-header]");
    const onScroll = () => {
      const y = window.scrollY;
      if (btn) {
        const show = y > 460;
        btn.classList.toggle("is-visible", show);
        btn.setAttribute("aria-hidden", show ? "false" : "true");
        btn.tabIndex = show ? 0 : -1;
      }
      if (header) header.classList.toggle("is-scrolled", y > 8);
      const fill = document.querySelector(".progress-fill");
      if (fill) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        fill.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + "%";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    chromeCleanup = () => window.removeEventListener("scroll", onScroll);
  }

  function workspaceContext() {
    if (typeof siteContext !== "function") return null;
    const ctx = siteContext();
    return ctx && ctx.ok ? ctx : null;
  }

  /* --------------------------- Événements délégués -------------------------- */

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const siteMenu = target.closest('[data-site-action="menu"]');
    if (siteMenu) { event.preventDefault(); siteChromeToggleMenu(siteMenu); return; }

    const mobile = target.closest('[data-site-action="mobile"]');
    if (mobile && typeof cfState !== "undefined") {
      cfState.mobile = !cfState.mobile;
      cfState.account = false; cfState.notices = false; cfState.menu = null;
      if (typeof siteChromePaint === "function") siteChromePaint(siteSessionRole(), body.dataset.sitePage || "overview");
      return;
    }

    if (kind === "auth" && target.closest("[data-auth-action]")) {
      handleAuthAction(target.closest("[data-auth-action]").dataset.authAction, target.closest("[data-auth-action]"));
      return;
    }

    const workspace = workspaceContext();
    const page = workspace ? workspace.page : null;
    const role = workspace ? workspace.role : null;

    const cfEl = target.closest("[data-cf-action]");
    if (workspace && cfEl && typeof cfAction === "function") {
      cfAction(cfEl.dataset.cfAction, cfEl, role, page);
      return;
    }

    if (event.target.matches && event.target.matches("[data-portal-backdrop]")) {
      if (typeof portalState !== "undefined") portalState.overlay = null;
      if (typeof portalRepaint === "function" && workspace) portalRepaint(role, page);
      return;
    }

    if (typeof portalState !== "undefined" && portalState.navOpen && !(target.closest && target.closest(".portal-nav-drop"))) {
      portalState.navOpen = null;
      if (target.closest("[data-action], [data-portal-action]") === null && typeof portalRepaint === "function" && workspace) portalRepaint(role, page);
    }

    const buttonEl = target.closest("[data-action], [data-auth-action], [data-portal-action]");
    if (!buttonEl) return;
    const action = buttonEl.dataset.action;

    if (action === "nav") { navigateTo(buttonEl.dataset.path || "/"); return; }
    if (action === "print") { window.print(); return; }
    if (action === "signout") {
      if (typeof leavePresentation === "function") leavePresentation();
      signOut();
      window.location.assign(sitePublicPath("login"));
      return;
    }
    if (action === "close-modal") {
      if (typeof wsState !== "undefined") wsState.modal = null;
      if (typeof wsPaintOverlay === "function") wsPaintOverlay();
      return;
    }
    if (action === "ws-page" && workspace) {
      const requested = buttonEl.dataset.page;
      if (requested) siteGo(role, requested);
      return;
    }
    if (action === "scroll") {
      const id = buttonEl.dataset.target;
      const menu = document.getElementById("menu-mobile");
      if (menu && !menu.hidden) closeMobileMenu();
      if (id === "accueil") {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      } else scrollToSection(id);
      return;
    }
    if (action === "home-top") {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      return;
    }
    if (action === "toggle-menu") { toggleMobileMenu(); return; }

    if (buttonEl.hasAttribute("data-portal-action") && workspace && typeof portalAction === "function") {
      portalAction(buttonEl.dataset.portalAction, buttonEl, role, page);
      return;
    }
    if (buttonEl.hasAttribute("data-admin-action") && workspace) {
      const adminAction = buttonEl.dataset.adminAction;
      if (adminAction === "dismiss-toast" && typeof adminState !== "undefined") { adminState.toast = ""; if (typeof paintAdminToast === "function") paintAdminToast(); return; }
      if (adminAction === "no-api" || adminAction === "user") {
        if (typeof cfToast === "function") cfToast(buttonEl.dataset.message || `Action ${adminAction} non disponible sans service connecté.`);
        return;
      }
    }
    if (workspace && typeof wsAction === "function" && wsAction(action, buttonEl, role, page)) return;
  });

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (kind === "auth") handleAuthInput(target);
    const workspace = workspaceContext();
    if (!workspace) return;
    if (typeof cfInput === "function" && cfInput(target)) return;
    if (typeof adminInput === "function" && target.matches("[data-admin-search]")) { adminInput(target); return; }
    if (typeof wsInput === "function") wsInput(target, workspace.role, workspace.page);
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target.id === "remember" && typeof authState !== "undefined") authState.remember = target.checked;
    const workspace = workspaceContext();
    if (!workspace) return;
    if (typeof cfChange === "function" && cfChange(target)) return;
    if (typeof adminChange === "function" && target.matches("[data-admin-filter]")) { adminChange(target); siteRepaintWorkspace(); return; }
    if (typeof wsChange === "function" && target.matches("[data-ws-filter]")) wsChange(target, workspace.role, workspace.page);
  });

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (form && form.dataset && form.dataset.action === "ws-assistant-submit" && typeof window.assistantSubmit === "function") {
      event.preventDefault();
      window.assistantSubmit(form);
      return;
    }
    if (typeof cfSubmit === "function" && cfSubmit(event)) return;
    const workspace = workspaceContext();
    if (workspace && typeof portalSubmit === "function") portalSubmit(event, workspace.role, workspace.page);
  });

  document.addEventListener("keydown", (event) => {
    if (kind === "auth" && typeof handleAuthKeydown === "function") handleAuthKeydown(event);
    if (typeof cfKey === "function" && cfKey(event)) return;
    const dialog = document.querySelector(".portal-modal");
    if (event.key === "Tab" && dialog) {
      const controls = [...dialog.querySelectorAll("button:not(:disabled),a[href],input:not(:disabled)")];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    if (event.key === "Escape") {
      if (typeof portalState !== "undefined" && portalState.overlay) {
        portalState.overlay = null;
        const workspace = workspaceContext();
        if (workspace && typeof portalOverlayPaint === "function") portalOverlayPaint(workspace.role);
      }
      if (typeof wsState !== "undefined" && wsState.modal) {
        wsState.modal = null;
        if (typeof wsPaintOverlay === "function") wsPaintOverlay();
      }
      const menu = document.getElementById("menu-mobile");
      if (menu && !menu.hidden) closeMobileMenu();
    }
  });

  document.addEventListener("paste", (event) => {
    if (kind === "auth" && typeof handleAuthPaste === "function") handleAuthPaste(event);
  });

  /* ----------------------------- En-tête mobile ---------------------------- */

  function toggleMobileMenu() {
    const menu = document.getElementById("menu-mobile");
    const button = document.querySelector('[data-action="toggle-menu"]');
    if (!menu || !button) return;
    menu.hidden = !menu.hidden;
    const open = !menu.hidden;
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    button.innerHTML = icon(open ? "close" : "menu", "size-5");
  }

  function closeMobileMenu() {
    const menu = document.getElementById("menu-mobile");
    const button = document.querySelector('[data-action="toggle-menu"]');
    if (!menu || !button) return;
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Ouvrir le menu");
    button.innerHTML = icon("menu", "size-5");
  }
})();
