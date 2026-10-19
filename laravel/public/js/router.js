/* ==================================================================
   js/router.js
   Navigation réelle d'un site multipage.

   Il n'y a plus de routeur client : `navigateTo()` provoque un chargement
   de document (Location.assign). Chaque page possède son propre fichier
   HTML et peut être ouverte, rechargée ou mise en favori directement.

   Les anciennes URL (`#/login`, `#/app/<rôle>/<page>`) sont traduites une
   fois pour conserver les favoris, puis le navigateur charge la nouvelle
   page.
================================================================== */

const PUBLIC_PATHS = {
  "/": "/",
  "/login": "/connexion/",
  "/connexion": "/connexion/",
  "/register": "/inscription/",
  "/inscription": "/inscription/",
};

/**
 * Normalise un chemin public ou d'espace vers l'URL réellement servie.
 * @param {string} pathname
 * @returns {string}
 */
function normalizePath(pathname) {
  let path = String(pathname || "").split("?")[0].split("#")[0] || "/";
  if (path.length > 1) path = path.replace(/\/+$/, "");
  if (PUBLIC_PATHS[path]) return PUBLIC_PATHS[path];

  const legacy = parseWorkspacePath(path);
  if (legacy) return workspacePath(legacy.role, legacy.page);

  if (path.startsWith("/profil/") || path.startsWith("/administration")) {
    return path + (/\/$/.test(path) ? "" : "/");
  }
  return "/";
}

/** Chemin courant (pathname réel du document). */
function currentPath() {
  return normalizePath(window.location.pathname || "/");
}

/** Ancien abonnement SPA : conservé comme API inerte pour les appelants. */
function subscribeRoute() {
  return () => {};
}

/**
 * Navigation par chargement de document.
 * @param {string} path
 */
function navigateTo(path) {
  const raw = String(path || "/");
  const cut = raw.indexOf("?");
  const base = cut === -1 ? raw : raw.slice(0, cut);
  const query = cut === -1 ? "" : raw.slice(cut);
  const target = normalizePath(base) + query;
  if (currentPath() + (window.location.search || "") === target) return;
  window.location.assign(target);
}

/** Défilement doux vers une section de la page d'accueil. */
function scrollToSection(id) {
  const element = document.getElementById(id);
  if (!element) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = element.getBoundingClientRect().top + window.scrollY - 88;
  window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
}
