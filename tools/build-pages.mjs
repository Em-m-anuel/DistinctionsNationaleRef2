#!/usr/bin/env node
/* ==================================================================
   tools/build-pages.mjs
   Génère les documents HTML du site multipage à partir de :
     · js/site-config.js         (familles, pages, URL)
     · js/gab-orient/…           (menu effectif de chaque rôle)
     · index.html historique     (sprite SVG des icônes)

   Aucune dépendance npm : Node lit les sources et évalue les scripts
   navigateur dans un contexte `vm` isolé, comme le font les tests.
   Relancer `node tools/build-pages.mjs` après toute évolution du menu.
================================================================== */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const write = (file, content) => {
  const target = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
};

/* ------------------------- Contexte navigateur simulé ------------------------ */

function storage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
}

const SCRIPTS = [
  "js/site-config.js",
  "js/icons.js", "js/data.js", "js/auth.js", "js/demo-accounts.js", "js/portal-demo.js",
  "js/demo-store.js", "js/router.js", "js/ui.js", "js/views/home.js", "js/registration.js",
  "js/views/login.js", "js/views/workspace.js", "js/views/portals.js", "js/views/portal-extras.js",
  "js/views/admin.js", "js/views/role-pages.js", "js/views/shared.js", "js/cf-store.js",
  "js/gab-orient/data.js", "js/gab-orient/charts.js", "js/gab-orient/map.js", "js/gab-orient/core.js",
  "js/gab-orient/views-dossiers.js", "js/gab-orient/views-demande.js", "js/gab-orient/views-courriers.js",
  "js/gab-orient/views-ceremonies.js", "js/gab-orient/views-service.js", "js/gab-orient/views-decisions.js",
  "js/gab-orient/views-regie.js", "js/gab-orient/views-admin.js", "js/gab-orient/bridge.js",
  "js/views/go-ui.js", "js/views/go-pages.js", "js/views/internal-portal.js", "js/cf-app.js",
];

const ctx = vm.createContext({
  window: {
    DN_AUTH_ENDPOINT: null,
    location: { hash: "", pathname: "/", protocol: "http:", hostname: "localhost", search: "" },
    localStorage: storage(),
    sessionStorage: storage(),
  },
  document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
  console,
  setTimeout,
  clearTimeout,
  Intl,
  URLSearchParams,
});

for (const file of SCRIPTS) {
  vm.runInContext(read(file), ctx, { filename: file });
}
vm.runInContext(
  "globalThis.H = { ipNav, icon, meditraBrand, emblem, DEMO_ACCOUNTS, ROLE_CONFIGS, SITE_FAMILIES, SITE_PAGE_LABELS, sitePagePath, siteCanonicalPage };",
  ctx,
);
const H = ctx.H;

/* --------------------------------- Utilitaires ------------------------------- */

const esc = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

function spriteIcon(name) {
  return `<svg class="ic" aria-hidden="true" focusable="false"><use href="#i-${esc(name)}"></use></svg>`;
}

function pageLabel(family, page) {
  return H.SITE_PAGE_LABELS[page] || H.SITE_FAMILIES[family].label;
}

const FAMILIES = H.SITE_FAMILIES;
const FAMILY_KEYS = Object.keys(FAMILIES);

/* --------------------------- Menu effectif par rôle -------------------------- */

const ROLE_NAV = {};
for (const family of FAMILY_KEYS) {
  for (const role of FAMILIES[family].roles) {
    const account = H.DEMO_ACCOUNTS.find((entry) => entry.role === role);
    ctx.window.__demoEmail = (account && account.email) || "";
    vm.runInContext(`cfState.spaceRole = ${JSON.stringify(role)};`, ctx);
    let nav = [];
    try { nav = H.ipNav(role) || []; } catch (error) { nav = []; }
    ROLE_NAV[role] = nav.filter(Boolean);
  }
}
ctx.window.__demoEmail = "";
vm.runInContext('cfState.spaceRole = "";', ctx);

/** Fusionne les menus des rôles d'une famille (mêmes pages, droits explicites). */
function familyNav(family) {
  const sections = [];
  const byPage = new Map();
  for (const role of FAMILIES[family].roles) {
    for (const item of ROLE_NAV[role] || []) {
      const page = H.siteCanonicalPage(family, item.page);
      if (!page) continue;
      let section = byPage.get(page);
      if (!section) {
        section = { page, label: item.label, icon: item.icon, count: Boolean(item.count), roles: new Set(), children: [], childByPage: new Map() };
        byPage.set(page, section);
        sections.push(section);
      }
      section.roles.add(role);
      for (const child of item.children || []) {
        const childPage = H.siteCanonicalPage(family, child.page);
        if (!childPage) continue;
        let entry = section.childByPage.get(childPage);
        if (!entry) {
          entry = { page: childPage, label: child.label, view: child.view, roles: new Set() };
          section.childByPage.set(childPage, entry);
          section.children.push(entry);
        }
        entry.roles.add(role);
      }
    }
  }
  return sections;
}

function linkHref(family, page) {
  return H.sitePagePath(family, page);
}

function navLinkClasses(active) {
  return `nav-link${active ? " is-current" : ""}`;
}

function renderFamilyNav(family, currentPage) {
  const sections = familyNav(family);
  return sections.map((section) => {
    const roles = [...section.roles].join(" ");
    const children = section.children.filter((child) => child.page !== section.page);
    const activeSection = section.page === currentPage || section.children.some((child) => child.page === currentPage);
    const href = linkHref(family, section.page);
    const caret = children.length
      ? `<button class="nav-caret" type="button" data-site-action="menu" aria-expanded="false" aria-haspopup="true" aria-controls="nav-${esc(section.page)}" aria-label="Autres accès : ${esc(section.label)}">${spriteIcon("chevron-down")}</button>
         <div class="dd-menu" id="nav-${esc(section.page)}" hidden>
           ${children.map((child) => `<a class="menu-item" href="${linkHref(family, child.page)}" data-nav-page="${esc(child.page)}" data-nav-roles="${[...child.roles].join(" ")}"${child.page === currentPage ? ' aria-current="page"' : ""}>${spriteIcon(child.view === "nouveau" ? "plus" : section.icon)}${esc(child.label)}</a>`).join("")}
         </div>`
      : "";
    return `<li class="nav-item${activeSection ? " is-current" : ""}" data-nav-roles="${roles}">
      <a class="${navLinkClasses(section.page === currentPage)}" href="${href}" data-nav-page="${esc(section.page)}" data-nav-parent-page="${esc(section.page)}" data-nav-roles="${roles}"${section.page === currentPage ? ' aria-current="page"' : ""}>${spriteIcon(section.icon)}${esc(section.label)}${section.count ? '<span class="nav-count is-zero" data-site-unread hidden>0</span>' : ""}</a>${caret}
    </li>`;
  }).join("");
}

function renderMobileNav(family, currentPage) {
  const links = [];
  for (const section of familyNav(family)) {
    links.push({ page: section.page, label: section.label, icon: section.icon, roles: [...section.roles] });
    for (const child of section.children) {
      if (child.page === section.page) continue;
      links.push({ page: child.page, label: child.label, icon: section.icon, roles: [...child.roles] });
    }
  }
  const seen = new Set();
  return links.filter((link) => (seen.has(link.page) ? false : (seen.add(link.page), true)))
    .map((link) => `<a href="${linkHref(family, link.page)}" data-nav-page="${esc(link.page)}" data-nav-roles="${link.roles.join(" ")}"${link.page === currentPage ? ' aria-current="page"' : ""}>${esc(link.label)}</a>`)
    .join("");
}

/* ---------------------------------- Chrome ---------------------------------- */

function workspaceHeader(family, currentPage) {
  const base = FAMILIES[family].base;
  return `<header class="site-header sticky" id="site-header">
    <div class="container hdr-top">
      <button class="icon-btn nav-toggle" type="button" data-site-action="mobile" aria-label="Ouvrir le menu de navigation" aria-expanded="false">${spriteIcon("menu")}</button>
      <a class="brand" href="${base}" aria-label="MEDITRA, accueil de l’espace">
        ${H.meditraBrand({ size: 36, sub: "République Gabonaise" })}
      </a>
      <button class="search-trigger" type="button" data-cf-action="search" aria-label="Rechercher (raccourci Ctrl+K)">
        ${spriteIcon("search")}<span>Rechercher un dossier, un courrier…</span><kbd>Ctrl+K</kbd>
      </button>
      <div class="hdr-actions">
        <div class="dd">
          <button class="icon-btn" type="button" data-cf-action="notices" aria-expanded="false" aria-label="Notifications">
            ${spriteIcon("bell")}<span class="count" data-site-unread hidden>0</span>
          </button>
          <div data-site-slot="notices"></div>
        </div>
        <div class="dd">
          <button class="account-btn" type="button" data-cf-action="account" aria-expanded="false">
            <span class="avatar" data-site-initials>—</span>
            <span class="account-meta"><strong data-site-name>Chargement…</strong><span data-site-role>—</span></span>
            ${spriteIcon("chevron-down")}
          </button>
          <div data-site-slot="account"></div>
        </div>
      </div>
    </div>
    <nav class="main-nav" aria-label="Navigation principale">
      <div class="container"><ul id="nav-list">${renderFamilyNav(family, currentPage)}</ul></div>
    </nav>
    <div data-site-slot="search"></div>
    <div class="mobile-nav" id="mobile-nav" hidden>
      <div class="mobile-nav-list">${renderMobileNav(family, currentPage)}<a href="/">Accueil public</a></div>
    </div>
  </header>`;
}

function siteFooter() {
  return `<footer class="container site-footer">
    <span class="footer-mark"><span class="flag-dots" aria-hidden="true"><i></i><i></i><i></i></span> MEDITRA</span>
    <span>République Gabonaise — Médaille et Distinctions du Travail</span>
  </footer>`;
}

function backToTop() {
  return `<button type="button" data-action="home-top" data-back-to-top id="to-top" class="to-top home-back-top" aria-label="Revenir en haut" aria-hidden="true" tabindex="-1">${spriteIcon("arrow-up")}</button>`;
}

/* -------------------------------- Documents --------------------------------- */

const CSS_LINKS = [
  "/css/app.css",
  "/css/cf.css",
  "/css/gab-orient.css",
  "/css/meditra.css",
  "/css/site.css",
];

const SPRITE = (() => {
  const legacy = read("index.html");
  const start = legacy.indexOf("<svg width=\"0\"");
  const end = legacy.indexOf("</svg>", start);
  if (start < 0 || end < 0) throw new Error("Sprite SVG introuvable dans index.html");
  return legacy.slice(start, end + "</svg>".length);
})();

function head({ title, description, extraCss = [] }) {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${esc(description)}" />
    <meta name="theme-color" content="#102A50" />
    <link rel="icon" href="/assets/brand/meditra-favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/assets/brand/meditra-favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,500;0,600;1,500&family=Sora:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <title>${esc(title)}</title>
    ${CSS_LINKS.map((href) => `<link rel="stylesheet" href="${href}" />`).join("\n    ")}
    ${extraCss.map((href) => `<link rel="stylesheet" href="${href}" />`).join("\n    ")}
  </head>`;
}

const COMMON_SCRIPTS = [
  "/js/site-config.js",
  "/js/icons.js",
  "/js/data.js",
  "/js/auth.js",
  "/js/demo-accounts.js",
  "/js/portal-demo.js",
  "/js/demo-store.js",
  "/js/router.js",
  "/js/ui.js",
  "/js/views/home.js",
  "/js/registration.js",
  "/js/views/login.js",
];

const WORKSPACE_SCRIPTS = [
  ...COMMON_SCRIPTS,
  "/js/views/workspace.js",
  "/js/views/portals.js",
  "/js/views/portal-extras.js",
  "/js/views/admin.js",
  "/js/views/role-pages.js",
  "/js/views/shared.js",
  "/js/cf-store.js",
  "/js/gab-orient/data.js",
  "/js/gab-orient/charts.js",
  "/js/gab-orient/map.js",
  "/js/gab-orient/core.js",
  "/js/gab-orient/views-dossiers.js",
  "/js/gab-orient/views-demande.js",
  "/js/gab-orient/views-courriers.js",
  "/js/gab-orient/views-ceremonies.js",
  "/js/gab-orient/views-service.js",
  "/js/gab-orient/views-decisions.js",
  "/js/gab-orient/views-regie.js",
  "/js/gab-orient/views-admin.js",
  "/js/gab-orient/bridge.js",
  "/js/views/go-ui.js",
  "/js/views/go-pages.js",
  "/js/views/internal-portal.js",
  "/js/cf-app.js",
  "/js/site/routes.js",
  "/js/site/chrome.js",
  "/js/site/workspace-page.js",
  "/js/app.js",
];

function scriptTags(list) {
  return list.map((src) => `    <script src="${src}"></script>`).join("\n");
}

const LEAFLET = `    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js" async onload="window.__leaflet='ok'" onerror="window.__leaflet='error'"></script>`;

function workspaceDocument(family, page) {
  const config = FAMILIES[family];
  const label = pageLabel(family, page);
  const title = page === "overview" ? `${config.label} — MEDITRA` : `${label} — ${config.label} | MEDITRA`;
  const description = `${label} — ${config.label} du portail MEDITRA des Médailles et Distinctions du Travail de la République Gabonaise.`;
  return `${head({ title, description })}
  <body class="mp-workspace" data-site-kind="workspace" data-site-family="${family}" data-site-page="${page}">
    <a class="mp-skip" href="#view">Aller au contenu</a>
    ${SPRITE}
    <div class="go-workspace">
      <div class="progress-rail" aria-hidden="true"><i class="progress-fill"></i></div>
      ${workspaceHeader(family, page)}
      <div id="mp-confirm"></div>
      <main id="view" class="container go-host" tabindex="-1" data-go-view="" data-go-page="${esc(page)}">
        <div class="mp-loading" role="status">Chargement de la page…</div>
      </main>
      ${siteFooter()}
      <div id="mp-panel"></div>
      <div id="mp-viewer"></div>
      <div id="cf-toast"></div>
      ${backToTop()}
    </div>
    <div id="toasts" class="toast-stack go-toasts"></div>
    <div id="tip" class="tip go-tip" hidden></div>
${LEAFLET}
${scriptTags(WORKSPACE_SCRIPTS)}
  </body>
</html>
`;
}

function homeDocument() {
  return `${head({
    title: "MEDITRA — Médaille et Distinctions du Travail",
    description: "MEDITRA — Médaille et Distinctions du Travail. Portail de dépôt, de suivi et d’attribution des médailles du travail de la République Gabonaise.",
  })}
  <body class="mp-home" data-site-kind="home">
    ${SPRITE}
    <div id="app"></div>
    <div id="toasts" class="toast-stack go-toasts"></div>
    <div id="tip" class="tip go-tip" hidden></div>
${scriptTags([...COMMON_SCRIPTS, "/js/site/routes.js", "/js/app.js"])}
  </body>
</html>
`;
}

function authDocument(mode) {
  const register = mode === "register";
  return `${head({
    title: `${register ? "Inscription" : "Connexion"} — MEDITRA`,
    description: `${register ? "Inscription" : "Connexion"} au portail MEDITRA des Médailles et Distinctions du Travail de la République Gabonaise.`,
  })}
  <body class="mp-auth" data-site-kind="auth" data-site-auth="${mode}">
    ${SPRITE}
    <div id="app"></div>
    <div id="toasts" class="toast-stack go-toasts"></div>
    <div id="tip" class="tip go-tip" hidden></div>
${scriptTags([...COMMON_SCRIPTS, "/js/site/routes.js", "/js/app.js"])}
  </body>
</html>
`;
}

/* ---------------------------------- Sortie ---------------------------------- */

const generated = [];
for (const family of FAMILY_KEYS) {
  for (const page of FAMILIES[family].pages) {
    const relative = `${FAMILIES[family].base.replace(/^\//, "")}${page === "overview" ? "" : page + "/"}index.html`;
    write(relative, workspaceDocument(family, page));
    generated.push(relative);
  }
}
write("index.html", homeDocument());
write("connexion/index.html", authDocument("login"));
write("inscription/index.html", authDocument("register"));
generated.push("index.html", "connexion/index.html", "inscription/index.html");

console.log(`Site multipage généré : ${generated.length} documents.`);
for (const file of generated) console.log("  · " + file);
