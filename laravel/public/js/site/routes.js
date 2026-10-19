/* ==================================================================
   js/site/routes.js
   Résolution de session, garde d'accès et navigation du site multipage.

   Le rôle n'est JAMAIS lu dans l'URL : il provient du compte connecté
   (js/auth.js) ou du profil de présentation (js/portal-demo.js). Une URL
   de famille partagée sert donc la même page à plusieurs personnes, avec
   leurs propres données et permissions.
================================================================== */

const SITE_PUBLIC = {
  home: "/",
  login: "/connexion/",
  register: "/inscription/",
};

/** Rôle effectif de la session courante, ou null. */
function siteSessionRole() {
  try {
    if (typeof cfUser === "function") {
      const user = cfUser();
      if (user && user.role) return user.role;
    }
  } catch (error) { /* magasin indisponible */ }
  try {
    if (typeof cfRole === "function") {
      const role = cfRole();
      if (role) return role;
    }
  } catch (error) { /* ignoré */ }
  try {
    const session = typeof getSession === "function" ? getSession() : null;
    if (session && session.role) return session.role;
  } catch (error) { /* ignoré */ }
  return null;
}

/** Adresse e-mail connue de la session (compte réel ou présentation). */
function siteSessionEmail() {
  try {
    if (typeof cfEmail === "function") return cfEmail() || "";
  } catch (error) { /* ignoré */ }
  const session = typeof getSession === "function" ? getSession() : null;
  return (session && session.email) || "";
}

/** La page est-elle réellement rendue pour ce rôle ? */
function sitePageAllowed(role, page) {
  const family = siteFamilyOf(role);
  if (!family) return false;
  const canonical = siteCanonicalPage(family, page);
  if (!canonical || !SITE_FAMILIES[family].pages.includes(canonical)) return false;
  // La création de dossier obéit à la même permission que le formulaire.
  if (canonical === "new-dossier" && typeof window !== "undefined" && window.GO && typeof window.GO.can === "function") {
    try {
      if (!window.GO.can("create")) return false;
    } catch (error) { /* permission indisponible */ }
  }
  if (typeof goHasView === "function") {
    if (goHasView(role, canonical)) return true;
    if (typeof goViewFor === "function" && goViewFor(role, canonical)) return true;
    return false;
  }
  return true;
}

/** Famille autorisée pour ce rôle. */
function siteRoleFamily(role) {
  return siteFamilyOf(role);
}

/** URL de connexion avec retour vers la page demandée. */
function siteLoginUrl(next) {
  const target = next || (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");
  return SITE_PUBLIC.login + (target && target !== "/" ? "?next=" + encodeURIComponent(target) : "");
}

/** URL après connexion : `next` valide, sinon l'espace du rôle. */
function siteAfterLoginUrl(role, next) {
  if (next) {
    const parsed = typeof parseWorkspacePath === "function" ? parseWorkspacePath(next) : null;
    if (parsed && siteFamilyOf(role) === parsed.family) return next;
  }
  return workspacePath(role, "overview");
}

/**
 * Contexte de la page courante, avec contrôle d'accès.
 * @returns {{ok:true, role:string, family:string, page:string} |
 *           {ok:false, reason:'anonymous'|'family'|'page', role:string|null, family:string, page:string}}
 */
function siteContext() {
  const body = document.body;
  const family = (body && body.dataset.siteFamily) || "";
  const requested = (body && body.dataset.sitePage) || "overview";
  const role = siteSessionRole();
  const page = siteCanonicalPage(family, requested) || requested;
  if (!SITE_FAMILIES[family]) return { ok: false, reason: "page", role, family, page };
  if (!role) return { ok: false, reason: "anonymous", role: null, family, page };
  if (siteFamilyOf(role) !== family) return { ok: false, reason: "family", role, family, page };
  if (!sitePageAllowed(role, page)) return { ok: false, reason: "page", role, family, page };
  return { ok: true, role, family, page };
}

/** Navigation réelle vers une page métier (chargement de document). */
function siteGo(role, page) {
  const family = siteFamilyOf(role);
  const canonical = siteCanonicalPage(family, page);
  // Une page qui n'existe pas dans la famille ne déclenche pas de navigation.
  if (!canonical) return;
  window.location.assign(workspacePath(role, canonical));
}

/** Rôle de la session sans contrôle de page (pour l'en-tête public). */
function siteHasSession() {
  return Boolean(siteSessionRole());
}
