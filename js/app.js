/* ==================================================================
   js/app.js — point d'entrée, remplace `src/main.tsx` + `src/App.tsx`.
   Aucun React, aucun Vite ni module npm à l'exécution : HTML, CSS et
   JavaScript natif uniquement.
================================================================== */
(function () {
  "use strict";

  const root = document.getElementById("app");
  if (!root) return;

  let previousRoute = null;
  let previousSessionEmail = null;
  let backTopInProgress = false;

  function render() {
    const route = currentPath();
    const session = getSession();
    const workspace = parseWorkspacePath(route);
    const kind = workspace ? "workspace" : (route === "/login" || route === "/register") ? "login" : "home";

    // Les composants ne sont plus montés lorsque la route change.
    if (previousRoute && previousRoute !== route) {
      unmountHome();
      wsState.modal = null;
      wsState.toast = "";
      if (kind !== "login" || (previousRoute === "/register" && route === "/login")) resetAuthFlow();
    }

    if (kind === "login") {
      document.title = (route === "/register" ? "Inscription" : "Connexion") + " — MEDITRA";
      root.innerHTML = skipLink() + renderLogin(session, route);
      mountLogin();
    } else if (kind === "workspace") {
      const sameSpace = previousRoute === route
        && document.querySelector("[data-ws-content]")
        && document.querySelector("[data-ws-content]").getAttribute("data-cf-role") === workspace.role
        && document.querySelector("[data-ws-content]").getAttribute("data-cf-page") === workspace.page;
      if (sameSpace) {
        previousRoute = route;
        mountAppChrome();
        return;
      }
      document.title = "MEDITRA — Médaille et Distinctions du Travail";
      root.innerHTML = skipLink() + renderWorkspace(workspace.role, workspace.page);
      if (typeof goInstallHosts === "function") goInstallHosts();
      if (typeof goMountLive === "function") goMountLive(workspace.role, workspace.page);
    } else {
      document.title = "MEDITRA — Médaille et Distinctions du Travail";
      root.innerHTML = renderHome(session);
      mountHome();
    }
    root.classList.remove("md-enter");
    void root.offsetWidth;
    root.classList.add("md-enter");

    // Comme `src/App.tsx`, remonter en haut à chaque changement de page.
    if (route !== previousRoute) window.scrollTo({ top: 0, behavior: "auto" });
    previousRoute = route;
    previousSessionEmail = session && session.email;
    mountAppChrome();
  }

  let chromeCleanup = null;
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
      header && header.classList.toggle("is-scrolled", y > 8);
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

  /* --------------------------- Routage et session --------------------------- */

  subscribeRoute(render);
  subscribeAuth(() => {
    const next = getSession();
    const nextEmail = next && next.email;
    // Pas de double rendu lorsque `signIn` envoie une notification identique.
    if (nextEmail !== previousSessionEmail) render();
  });

  /* --------------------------- Événements délégués -------------------------- */

  // Un seul écouteur gère tous les boutons de l'application, y compris ceux
  // créés après un changement de page, de carrousel ou d'état de formulaire.
  root.addEventListener("click", (event) => {
    const workspaceCf = parseWorkspacePath(currentPath());
    const cfEl = event.target.closest && event.target.closest("[data-cf-action]");
    if (workspaceCf && cfEl && root.contains(cfEl) && typeof cfAction === "function") {
      cfAction(cfEl.dataset.cfAction, cfEl, workspaceCf.role, workspaceCf.page);
      return;
    }
    if (event.target.matches('[data-portal-backdrop]')) {
      portalState.overlay = null;
      const workspace = parseWorkspacePath(currentPath());
      if (workspace) portalOverlayPaint(workspace.role);
      return;
    }
    const mapSvg = event.target.closest && event.target.closest(".map-svg");
    if (mapSvg && root.contains(mapSvg) && !event.target.closest("[data-id]") && typeof mapNearestPlace === "function") {
      const rect = mapSvg.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
      const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 80;
      const place = mapNearestPlace(x, y);
      const workspaceMap = parseWorkspacePath(currentPath());
      if (place && workspaceMap) {
        portalState.ceremonyWizard.place = place;
        portalState.ceremonyWizard.placeQuery = place.name;
        portalState.ceremonyWizard.dirty = true;
        portalUpdateResults(workspaceMap.role, workspaceMap.page);
      }
      return;
    }
    if (typeof portalState !== "undefined" && portalState.navOpen && !(event.target.closest && event.target.closest(".portal-nav-drop"))) {
      portalState.navOpen = null;
      const willAct = event.target.closest("[data-action], [data-portal-action]");
      if (!willAct) {
        const workspaceNav = parseWorkspacePath(currentPath());
        if (workspaceNav) portalRepaint(workspaceNav.role, workspaceNav.page);
      }
    }
    const buttonEl = event.target.closest("[data-action], [data-auth-action], [data-portal-action]");
    if (!buttonEl || !root.contains(buttonEl)) return;
    const action = buttonEl.dataset.action;
    const workspace = parseWorkspacePath(currentPath());

    if (action === "nav") {
      navigateTo(buttonEl.dataset.path || "/");
      return;
    }
    if (action === "print") {
      window.print();
      return;
    }
    if (action === "signout") {
      signOut();
      return;
    }
    if (action === "close-modal") {
      wsState.modal = null;
      wsPaintOverlay();
      return;
    }
    if (workspace && document.querySelector("[data-cf-role]") && action === "ws-page") {
      if (typeof cfState !== "undefined") {
        cfState.query = ""; cfState.filter = ""; cfState.page = 1;
        cfState.menu = null; cfState.account = false; cfState.notices = false; cfState.search = false; cfState.mobile = false;
        if (buttonEl.dataset.page !== workspace.page) {
          cfState.selected = null; cfState.tab = "resume"; cfState.revue = null; cfState.confirm = null;
        }
      }
      wsGo(workspace.role, buttonEl.dataset.page);
      return;
    }

    // Page d'accueil : navigation par sections.
    if (action === "scroll") {
      const target = buttonEl.dataset.target;
      const menu = document.getElementById("menu-mobile");
      if (menu && !menu.hidden) closeMobileMenu();
      if (target === "accueil") {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      } else scrollToSection(target);
      return;
    }
    if (action === "home-top") {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (buttonEl.hasAttribute("data-back-to-top")) {
        if (backTopInProgress || window.scrollY < 8) return;
        backTopInProgress = true;
        window.setTimeout(() => { backTopInProgress = false; }, reduce ? 100 : 900);
      }
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      return;
    }
    if (action === "toggle-menu") {
      toggleMobileMenu();
      return;
    }

    // Authentification : même délégation pour connexion, inscription et OTP.
    if ((currentPath() === "/login" || currentPath() === "/register") && buttonEl.hasAttribute("data-auth-action")) {
      handleAuthAction(buttonEl.dataset.authAction, buttonEl);
      return;
    }

    // Espace Administrateur : dispatche via wsAction (admin utilise le même flux).
    if (workspace && workspace.role === 'admin' && buttonEl.hasAttribute('data-admin-action')) {
      // Routage simple des actions admin vers le système existant.
      const a = buttonEl.dataset.adminAction;
      if (a === 'dismiss-toast') { adminState.toast = ''; paintAdminToast(); return; }
      if (a === 'no-api' || a === 'user') {
        const msg = buttonEl.dataset.message || `Action ${a} non disponible sans service connecté.`;
        wsToast(msg); return;
      }
    }

    // Deux espaces éditoriaux : navigation contextuelle, états locaux et modales.
    if (workspace && document.querySelector('[data-portal-role]')) {
      if (buttonEl.hasAttribute('data-portal-action')) {
        portalAction(buttonEl.dataset.portalAction, buttonEl, workspace.role, workspace.page);
        return;
      }
      if (action === 'ws-page') {
        if (typeof portalPageDirty === 'function' && portalPageDirty() && buttonEl.dataset.page !== workspace.page) {
          portalState.overlay = { type: 'abandon' };
          portalState.abandonTo = buttonEl.dataset.page;
          portalOverlayPaint(workspace.role);
          return;
        }
        portalState.query = ''; portalState.status = ''; portalState.campaign = '';
        portalState.medal = ''; portalState.employer = ''; portalState.detail = null;
        portalState.noticesOpen = false; portalState.menu = false; portalState.edit = false;
        portalState.navOpen = null;
        if (typeof portalClearDirty === 'function' && buttonEl.dataset.page !== 'employee-new' && buttonEl.dataset.page !== 'ceremony-request' && buttonEl.dataset.page !== 'withdrawal-request') portalClearDirty();
        if (workspace.page === buttonEl.dataset.page) portalRepaint(workspace.role, workspace.page);
        else wsGo(workspace.role, buttonEl.dataset.page);
        return;
      }
    }
    // Les six autres rôles et le parcours de dépôt préexistant restent disponibles.
    if (workspace && wsAction(action, buttonEl, workspace.role, workspace.page)) return;
  });

  root.addEventListener("input", (event) => {
    const target = event.target;
    if (currentPath() === "/login" || currentPath() === "/register") handleAuthInput(target);
    const workspace = parseWorkspacePath(currentPath());
    if (!workspace) return;
    if (typeof cfInput === "function" && cfInput(target)) return;
    if (workspace.role === 'admin' && target.matches('[data-admin-search]')) { adminInput(target); return; }
    if (!portalInput(target, workspace.role, workspace.page)) wsInput(target, workspace.role, workspace.page);
  });

  root.addEventListener("change", (event) => {
    const target = event.target;
    if (target.id === "remember") authState.remember = target.checked;
    const workspace = parseWorkspacePath(currentPath());
    if (!workspace) return;
    if (typeof cfChange === "function" && cfChange(target)) return;
    if (workspace.role === 'admin' && target.matches('[data-admin-filter]')) { adminChange(target); render(); return; }
    if (portalChange(target, workspace.role, workspace.page)) return;
    if (target.matches("[data-ws-filter]")) wsChange(target, workspace.role, workspace.page);
  });

  root.addEventListener('submit', (event) => {
    const form = event.target;
    // Assistant flottant
    if (form && form.dataset && form.dataset.action === "ws-assistant-submit" && typeof window.assistantSubmit === "function") {
      event.preventDefault();
      window.assistantSubmit(form);
      return;
    }
    if (typeof cfSubmit === "function" && cfSubmit(event)) return;
    const workspace = parseWorkspacePath(currentPath());
    if (workspace) portalSubmit(event, workspace.role, workspace.page);
  });

  root.addEventListener("keydown", handleAuthKeydown);
  root.addEventListener("paste", handleAuthPaste);

  document.addEventListener("keydown", (event) => {
    if (typeof cfKey === "function" && cfKey(event)) return;
    const dialog = document.querySelector('.portal-modal');
    if (event.key === 'Tab' && dialog) {
      const controls = [...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled)')];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    if (event.key === "ArrowDown") {
      const trigger = event.target.closest && event.target.closest('[data-portal-action="nav-menu"]');
      if (trigger && typeof portalState !== "undefined") {
        event.preventDefault();
        const workspaceNav = parseWorkspacePath(currentPath());
        if (workspaceNav && portalState.navOpen !== trigger.dataset.menu) {
          portalState.navOpen = trigger.dataset.menu;
          portalRepaint(workspaceNav.role, workspaceNav.page);
        }
        window.requestAnimationFrame(() => document.querySelector(".portal-nav-menu [role=\"menuitem\"]")?.focus());
        return;
      }
    }
    if (event.key === "Escape") {
      if (typeof portalState !== "undefined" && portalState.navOpen) {
        portalState.navOpen = null;
        const workspaceNav = parseWorkspacePath(currentPath());
        if (workspaceNav) portalRepaint(workspaceNav.role, workspaceNav.page);
      }
      if (portalState.overlay) {
        portalState.overlay = null;
        const workspace = parseWorkspacePath(currentPath());
        if (workspace) portalOverlayPaint(workspace.role);
      }
      if (wsState.modal) {
        wsState.modal = null;
        wsPaintOverlay();
      }
      const menu = document.getElementById("menu-mobile");
      if (menu && !menu.hidden) closeMobileMenu();
    }
  });

  /* ----------------------------- En-tête mobile ----------------------------- */

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

  // Première vue.
  render();
})();
