/* ==================================================================
   js/laravel/meditra-laravel.js
   Adaptateur « site statique → Laravel ».

   Chargé en dernier, juste avant js/app.js, il aligne les modules
   existants sur les URL et la session fournies par Laravel :

     · window.MEDITRA            (injecté par le layout Blade)
         base        racine de l'application (ex. "https://exemple.gouv.ga")
         urls        { famille: { page: url } } générées par route()
         public      { home, login, register, logout }
         user        { prenom, nom, email, role } ou null
         demo        true  → jeu de démonstration autorisé
         family/page page courante rendue par le contrôleur

   Aucune règle métier n'est modifiée : seules les URL, la session et
   l'origine du rôle changent. Sans window.MEDITRA, ce fichier ne fait
   rien : le site statique continue de fonctionner à l'identique.
================================================================== */
(function () {
  "use strict";

  const config = window.MEDITRA;
  if (!config || typeof config !== "object") return;

  const users = config.user || null;
  const demoAllowed = config.demo !== false;

  /* ------------------------------- URL racine ------------------------------ */

  const base = String(config.base || "").replace(/\/+$/, "");
  const withBase = (path) => {
    const value = String(path || "/");
    if (!base) return value;
    return value.indexOf(base) === 0 ? value : base + value;
  };

  /* ------------------------- URL par famille et page ----------------------- */

  // Les bases de familles viennent des routes Laravel (route() généré).
  if (typeof SITE_FAMILIES !== "undefined") {
    Object.keys(SITE_FAMILIES).forEach((family) => {
      const urls = (config.urls && config.urls[family]) || {};
      const overview = urls.overview;
      if (overview) SITE_FAMILIES[family].base = overview;
    });
  }

  // Les URL publiques remplacent les chemins statiques.
  if (typeof SITE_PUBLIC !== "undefined" && config.public) {
    if (config.public.home) SITE_PUBLIC.home = config.public.home;
    if (config.public.login) SITE_PUBLIC.login = config.public.login;
    if (config.public.register) SITE_PUBLIC.register = config.public.register;
  }
  if (typeof PUBLIC_PATHS !== "undefined" && config.public) {
    const login = config.public.login || "/connexion";
    const register = config.public.register || "/inscription";
    PUBLIC_PATHS["/login"] = login;
    PUBLIC_PATHS["/connexion"] = login;
    PUBLIC_PATHS["/register"] = register;
    PUBLIC_PATHS["/inscription"] = register;
  }

  /** Famille correspondant à un rôle ou à une clé de famille. */
  function resolveFamily(roleOrFamily) {
    if (!roleOrFamily) return null;
    if (config.urls && config.urls[roleOrFamily]) return roleOrFamily;
    if (typeof siteFamilyConfig !== "function") return null;
    const conf = siteFamilyConfig(roleOrFamily);
    if (!conf) return null;
    return Object.keys(SITE_FAMILIES).find((key) => SITE_FAMILIES[key] === conf) || null;
  }

  /**
   * URL d'une page de famille : table de routes Laravel d'abord, puis
   * concaténation sur l'URL de la vue d'ensemble. Aucun chemin n'est
   * construit à partir de la racine du site en dur.
   */
  window.sitePagePath = function (roleOrFamily, page) {
    const family = resolveFamily(roleOrFamily);
    const table = family && config.urls ? config.urls[family] : null;
    if (table) {
      const canonical = typeof siteCanonicalPage === "function" ? siteCanonicalPage(family, page) : page;
      if (canonical && table[canonical]) return table[canonical];
      if (canonical === "overview" && table.overview) return table.overview;
      if (table.overview) return table.overview.replace(/\/$/, "") + "/" + canonical + "/";
    }
    return sitePagePathBefore ? sitePagePathBefore(roleOrFamily, page) : (config.public && config.public.home) || "/";
  };

  /* -------------------------------- Session -------------------------------- */

  // Le rôle vient du serveur : l'URL ne le contient jamais.
  if (users && users.role) {
    const roleBefore = typeof siteSessionRole === "function" ? siteSessionRole : null;
    window.siteSessionRole = function () {
      return users.role || (roleBefore ? roleBefore() : null);
    };

    // Le nom affiché dans l'en-tête est celui du compte Laravel.
    if (typeof cfEmail === "function") {
      window.cfEmail = function () {
        return users.email || "";
      };
    }
    if (typeof cfUser === "function") {
      const cfUserBefore = cfUser;
      window.cfUser = function () {
        let demo = null;
        try { demo = cfUserBefore(); } catch (error) { demo = null; }
        return Object.assign({}, demo || {}, {
          prenom: users.prenom || (demo && demo.prenom) || "",
          nom: users.nom || (demo && demo.nom) || "",
          email: users.email || (demo && demo.email) || "",
          role: users.role,
        });
      };
    }

    // Le magasin métier travaille sur le rôle authentifié.
    if (typeof cfState !== "undefined" && cfState) cfState.spaceRole = users.role;
  }

  /* ---------------------------- Mode démonstration ------------------------- */

  // En production (demo = false), aucun profil fictif ne doit être proposé
  // ni accepté : la sélection de profil de présentation est neutralisée.
  if (!demoAllowed) {
    window.DN_PRESENTATION_MODE = false;
    if (typeof enterPresentation === "function") {
      window.enterPresentation = function () {
        return { ok: false, error: { message: "La démonstration est désactivée sur cette installation." } };
      };
    }
    if (typeof presentationProfile === "function") {
      window.presentationProfile = function () { return null; };
    }
  }

  /* -------------------- Sélection d'un profil de démonstration ------------- */

  // Le choix du profil est aussi envoyé au serveur : le rendu Blade et les
  // contrôleurs connaissent alors le même rôle que le navigateur.
  if (config.demo && config.demo_profile && typeof enterPresentation === "function") {
    const enterBefore = window.enterPresentation;
    window.enterPresentation = function (role, email) {
      const ok = enterBefore(role, email);
      if (ok !== false) {
        const meta = document.querySelector('meta[name="csrf-token"]');
        try {
          fetch(config.demo_profile, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "X-CSRF-TOKEN": meta ? meta.getAttribute("content") : "",
            },
            body: JSON.stringify({ role: role }),
            credentials: "same-origin",
          }).catch(function () { /* le rendu Blade garde son rôle de repli */ });
        } catch (error) { /* fetch indisponible */ }
      }
      return ok;
    };
  }

  // Sans compte authentifié, le rôle de démonstration décidé par le serveur
  // fait foi (accès direct à une URL d'espace).
  if (!users && config.demo_role) {
    const demoRole = config.demo_role;
    window.siteSessionRole = function () { return demoRole; };
    if (typeof cfState !== "undefined" && cfState) cfState.spaceRole = demoRole;
  }

  /* ------------------------------ Déconnexion ------------------------------ */

  // La déconnexion Laravel est une route POST protégée par CSRF : on la
  // laisse au formulaire serveur plutôt qu'à une navigation GET.
  window.meditraLogout = function () {
    const form = document.getElementById("meditra-logout-form");
    if (form) { form.submit(); return true; }
    if (config.public && config.public.logout) {
      window.location.assign(withBase(config.public.logout));
      return true;
    }
    return false;
  };

  /* ------------------------- Contenu rendu par Blade ----------------------- */

  // Les vues Blade fournissent déjà un en-tête de page et des repères de
  // chargement : on les signale pour que le diagnostic d'échec ne les
  // confonde pas avec un montage raté.
  document.documentElement.classList.add("is-laravel");
  document.documentElement.dataset.meditraDemo = String(demoAllowed);
})();
