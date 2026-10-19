/* ==================================================================
   js/site/chrome.js
   En-tête partagé des pages métier : compte, notifications, recherche,
   menus de navigation et navigation mobile.

   La navigation principale est présente dans le HTML statique de chaque
   page (vrais liens). Ce script la filtre selon le rôle effectif, met en
   évidence la page courante et anime les menus.
================================================================== */

const SITE_CHROME = {
  cleanups: [],
};

function siteChromeSlot(name) {
  return document.querySelector(`[data-site-slot="${name}"]`);
}

function siteChromeUnread() {
  try {
    return typeof cfUnread === "function" ? cfUnread() : 0;
  } catch (error) {
    return 0;
  }
}

function siteChromePaint(role, page) {
  const conf = (typeof ROLE_CONFIGS !== "undefined" && ROLE_CONFIGS[role]) || { shortLabel: role, label: role };
  let user = null;
  try { user = typeof cfUser === "function" ? cfUser() : null; } catch (error) { user = null; }
  const name = user ? `${user.prenom} ${user.nom}` : conf.shortLabel;
  const initials = (name || "?").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  const nameEl = document.querySelector("[data-site-name]");
  const roleEl = document.querySelector("[data-site-role]");
  const initialsEl = document.querySelector("[data-site-initials]");
  if (nameEl) nameEl.textContent = name;
  if (roleEl) roleEl.textContent = conf.shortLabel;
  if (initialsEl) initialsEl.textContent = initials;

  const unread = siteChromeUnread();
  const badge = document.querySelector("[data-site-unread]");
  if (badge) {
    badge.hidden = !unread;
    badge.textContent = unread > 9 ? "9+" : String(unread);
  }

  const notices = siteChromeSlot("notices");
  if (notices) notices.innerHTML = cfState.notices ? cfNoticesPop(role) : "";
  const account = siteChromeSlot("account");
  if (account) account.innerHTML = cfState.account ? cfAccountMenu(role) : "";
  const search = siteChromeSlot("search");
  if (search) search.innerHTML = cfState.search ? cfSearchPalette() : "";

  const noticesBtn = document.querySelector('[data-cf-action="notices"]');
  if (noticesBtn) noticesBtn.setAttribute("aria-expanded", String(Boolean(cfState.notices)));
  const accountBtn = document.querySelector('[data-cf-action="account"]');
  if (accountBtn) accountBtn.setAttribute("aria-expanded", String(Boolean(cfState.account)));

  const mobile = document.getElementById("mobile-nav");
  if (mobile) mobile.hidden = !cfState.mobile;
  const mobileBtn = document.querySelector('[data-site-action="mobile"]');
  if (mobileBtn) mobileBtn.setAttribute("aria-expanded", String(Boolean(cfState.mobile)));

  siteChromeFilterNav(role, page);
}

function siteChromeFilterNav(role, page) {
  document.querySelectorAll("[data-nav-roles]").forEach((item) => {
    const roles = String(item.dataset.navRoles || "").split(/\s+/).filter(Boolean);
    const visible = !roles.length || roles.includes(role);
    item.hidden = !visible;
    item.classList.toggle("is-hidden", !visible);
  });

  document.querySelectorAll("[data-nav-page]").forEach((link) => {
    const target = link.dataset.navPage;
    const allowed = typeof sitePageAllowed === "function" ? sitePageAllowed(role, target) : true;
    if (!allowed) { link.hidden = true; link.classList.add("is-hidden"); return; }
    link.hidden = false;
    link.classList.remove("is-hidden");
    const active = target === page;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  // Un menu parent dont la page d'accueil n'est pas autorisée pointe vers
  // sa première entrée réellement visible.
  document.querySelectorAll("[data-nav-parent-page]").forEach((parent) => {
    const target = parent.dataset.navParentPage;
    const allowed = typeof sitePageAllowed === "function" ? sitePageAllowed(role, target) : true;
    if (allowed) return;
    const submenu = parent.parentElement && parent.parentElement.querySelector(".dd-menu");
    const first = submenu && submenu.querySelector("a:not([hidden])");
    if (first) parent.setAttribute("href", first.getAttribute("href"));
  });

  document.querySelectorAll(".nav-item").forEach((item) => {
    const links = [...item.querySelectorAll("a:not([hidden])")];
    const anyActive = links.some((link) => link.getAttribute("aria-current") === "page");
    item.classList.toggle("is-current", anyActive);
  });
}

function siteChromeToggleMenu(button) {
  const id = button.getAttribute("aria-controls");
  const menu = id ? document.getElementById(id) : button.parentElement.querySelector(".dd-menu");
  if (!menu) return;
  const open = menu.hidden;
  document.querySelectorAll(".dd-menu").forEach((other) => {
    if (other !== menu) {
      other.hidden = true;
      const caret = other.parentElement.querySelector('[data-site-action="menu"]');
      if (caret) caret.setAttribute("aria-expanded", "false");
    }
  });
  menu.hidden = !open;
  button.setAttribute("aria-expanded", String(open));
}

function siteChromeCloseMenus() {
  document.querySelectorAll(".dd-menu").forEach((menu) => { menu.hidden = true; });
  document.querySelectorAll('[data-site-action="menu"]').forEach((button) => button.setAttribute("aria-expanded", "false"));
}

function siteChromeBind() {
  if (SITE_CHROME.bound) return;
  SITE_CHROME.bound = true;
  document.addEventListener("click", (event) => {
    const caret = event.target.closest && event.target.closest('[data-site-action="menu"]');
    if (caret) {
      event.preventDefault();
      siteChromeToggleMenu(caret);
      return;
    }
    if (!(event.target.closest && event.target.closest(".nav-item"))) siteChromeCloseMenus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      siteChromeCloseMenus();
      const mobile = document.getElementById("mobile-nav");
      if (mobile && !mobile.hidden) {
        cfState.mobile = false;
        siteChromePaint(siteSessionRole(), document.body.dataset.sitePage || "overview");
      }
    }
  });
}
