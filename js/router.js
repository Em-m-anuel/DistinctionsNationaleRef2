/* ==================================================================
   js/router.js
   Routage minimaliste — conversion de `src/lib/router.ts`.

   L'original s'appuyait sur l'API History (`/login`, `/app/<role>/<page>`)
   et nécessitait donc un serveur capable de renvoyer `index.html` sur
   toutes les routes. La version statique utilise le **hash** :

       #/            → accueil
       #/login       → connexion   (#/connexion est accepté en alias)
       #/register    → inscription (frontend uniquement)
       #/app/<role>/<page>         → espace connecté

   Avantage : le site fonctionne en double-cliquant sur `index.html`
   (protocole `file://`), sans serveur ni configuration de réécriture.
   Aucun routeur externe n'est utilisé, comme dans l'original.
================================================================== */

const KNOWN_ROUTES = ["/", "/login", "/register"];

/** Normalise un chemin : supprime la query, les slashs de fin, gère l'alias. */
function normalizePath(pathname) {
  const path = String(pathname || "").split("?")[0].replace(/\/+$/, "") || "/";
  if (path === "/connexion") return "/login";
  if (KNOWN_ROUTES.includes(path)) return path;
  if (path.startsWith("/app/")) return path;
  return "/";
}

function normalizeHash(hash) {
  return normalizePath(String(hash || "").replace(/^#/, ""));
}

/**
 * Chemin courant de l'application.
 * Priorité au hash ; à défaut on relit le pathname (utile si le site est
 * servi derrière un serveur qui réécrit déjà les URLs).
 * @returns {string}
 */
function currentPath() {
  const hash = window.location.hash;
  if (hash && hash.length > 1) return normalizeHash(hash);

  const pathname = window.location.pathname || "/";
  const workspace = parseWorkspacePath(pathname);
  if (workspace) return pathname;
  if (pathname === "/login" || pathname === "/connexion") return "/login";
  return "/";
}

/** Abonnement aux changements de route. @param {(path:string)=>void} cb */
function subscribeRoute(cb) {
  const handler = () => cb(currentPath());
  window.addEventListener("hashchange", handler);
  window.addEventListener("popstate", handler);
  return () => {
    window.removeEventListener("hashchange", handler);
    window.removeEventListener("popstate", handler);
  };
}

/**
 * Navigation programmatique (équivalent du `navigateTo` React).
 * @param {string} path ex. "/login" ou "/app/demandeur/dossiers"
 */
function navigateTo(path) {
  const target = normalizePath(path);
  if (currentPath() === target) return;
  window.location.hash = "#" + target;
}

/** Défilement doux vers une section de la page d'accueil. */
function scrollToSection(id) {
  const element = document.getElementById(id);
  if (!element) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = element.getBoundingClientRect().top + window.scrollY - 88;
  window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
}
