/* ==================================================================
   tests/laravel-adapter.cjs
   Comportement de js/laravel/meditra-laravel.js : conversion des URL
   statiques en routes Laravel, rôle issu du serveur, mode démonstration.

   Le test exécute le vrai fichier dans un contexte `vm` avec les globals
   que le site fournit déjà (site-config.js, routes.js…), sans navigateur.
================================================================== */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");

const BASE = "https://meditra.test";

/** Table de routes telle que la produit App\Support\Meditra::urls(). */
const URLS = {
  demandeur: { overview: `${BASE}/profil/demandeur`, dossiers: `${BASE}/profil/demandeur/dossiers` },
  direction: { overview: `${BASE}/profil/direction`, dossiers: `${BASE}/profil/direction/dossiers` },
  admin: { overview: `${BASE}/administration`, users: `${BASE}/administration/users` },
};

function boot({ user = null, demo = true, demoRole = null, demoProfile = `${BASE}/demo/profil`, withSession = true } = {}) {
  const storage = () => {
    const map = new Map();
    return {
      getItem: (key) => (map.has(key) ? map.get(key) : null),
      setItem: (key, value) => map.set(key, String(value)),
      removeItem: (key) => map.delete(key),
    };
  };

  const context = {
    console,
    setTimeout,
    clearTimeout,
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) }),
    document: {
      documentElement: { classList: { add() {} }, dataset: {} },
      querySelector: () => null,
      getElementById: () => null,
    },
    window: {
      location: { pathname: "/profil/direction/dossiers", search: "", hash: "", assign() {} },
      sessionStorage: storage(),
      localStorage: storage(),
    },
  };
  // Dans un navigateur, window === globalThis : l'adaptateur affecte
  // `window.sitePagePath`, ce qui remplace bien la fonction globale.
  context.window = context;
  vm.createContext(context);

  // Modules réels du site, dans leur ordre de chargement.
  for (const file of ["js/site-config.js", "js/data.js", "js/router.js", "js/site/routes.js"]) {
    vm.runInContext(read(file), context, { filename: file });
  }

  // Remplacés par Laravel : table de routes, session, démonstration.
  vm.runInContext(
    `
    window.MEDITRA = ${JSON.stringify({
      base: BASE,
      urls: URLS,
      public: {
        home: `${BASE}/`,
        login: `${BASE}/connexion`,
        register: `${BASE}/inscription`,
        logout: `${BASE}/deconnexion`,
      },
      user,
      demo,
      demo_role: demoRole,
      demo_profile: demoProfile,
    })};
    cfState = { spaceRole: "", notices: false, account: false, search: false, mobile: false };
    function cfEmail() { return ""; }
    function cfUser() { return null; }
    function enterPresentation() { return true; }
    function presentationProfile() { return "demandeur"; }
    ${withSession ? "" : "function siteSessionRole() { return null; }"}
    `,
    context,
  );

  vm.runInContext(read("js/laravel/meditra-laravel.js"), context, { filename: "meditra-laravel.js" });
  return context;
}

test("sans window.MEDITRA, l'adaptateur ne modifie rien (site statique intact)", () => {
  const context = {
    console,
    window: { location: { pathname: "/profil/demandeur/", search: "", hash: "" } },
    document: { documentElement: { classList: { add() {} }, dataset: {} }, querySelector: () => null },
  };
  vm.createContext(context);
  vm.runInContext(read("js/site-config.js"), context);
  const before = vm.runInContext("sitePagePath('demandeur','dossiers')", context);
  vm.runInContext(read("js/laravel/meditra-laravel.js"), context);
  const after = vm.runInContext("sitePagePath('demandeur','dossiers')", context);
  assert.equal(before, "/profil/demandeur/dossiers/");
  assert.equal(after, before);
});

test("les bases de familles et les URL de page viennent des routes Laravel", () => {
  const context = boot();
  assert.equal(vm.runInContext("SITE_FAMILIES.demandeur.base", context), URLS.demandeur.overview);
  assert.equal(vm.runInContext("SITE_FAMILIES.direction.base", context), URLS.direction.overview);
  assert.equal(vm.runInContext("sitePagePath('direction','dossiers')", context), URLS.direction.dossiers);
  assert.equal(vm.runInContext("sitePagePath('admin','users')", context), URLS.admin.users);
  assert.equal(vm.runInContext("sitePagePath('direction','overview')", context), URLS.direction.overview);
  // Repli conservé pour une page sans route dédiée.
  assert.equal(vm.runInContext("workspacePath('direction','decisions')", context), `${BASE}/profil/direction/decisions/`);
});

test("les URL publiques remplacent les chemins statiques", () => {
  const context = boot();
  assert.equal(vm.runInContext("SITE_PUBLIC.login", context), `${BASE}/connexion`);
  assert.equal(vm.runInContext("SITE_PUBLIC.register", context), `${BASE}/inscription`);
  assert.equal(vm.runInContext("normalizePath('/connexion')", context), `${BASE}/connexion`);
});

test("le rôle vient du compte fourni par le serveur, jamais de l'URL", () => {
  const context = boot({ user: { prenom: "Aline", nom: "Ndong", email: "a.ndon@example.test", role: "dr" } });
  assert.equal(vm.runInContext("siteSessionRole()", context), "dr");
  assert.equal(vm.runInContext("cfUser().prenom", context), "Aline");
  assert.equal(vm.runInContext("cfUser().role", context), "dr");
  assert.equal(vm.runInContext("cfEmail()", context), "a.ndon@example.test");
  assert.equal(vm.runInContext("cfState.spaceRole", context), "dr");
});

test("le rôle de démonstration décidé par le serveur est adopté sans session locale", () => {
  const context = boot({ demoRole: "ministre", withSession: false });
  assert.equal(vm.runInContext("siteSessionRole()", context), "ministre");
  assert.equal(vm.runInContext("cfState.spaceRole", context), "ministre");
});

test("MEDITRA_DEMO=false neutralise la sélection de profil et la présentation", () => {
  const context = boot({ demo: false, demoRole: null });
  assert.equal(vm.runInContext("window.DN_PRESENTATION_MODE", context), false);
  assert.equal(vm.runInContext("presentationProfile()", context), null);
  assert.deepEqual(
    JSON.parse(JSON.stringify(vm.runInContext("enterPresentation('ministre')", context))),
    { ok: false, error: { message: "La démonstration est désactivée sur cette installation." } },
  );
});

test("la sélection d'un profil de démonstration est transmise au serveur", () => {
  const context = boot({ demo: true });
  let payload = null;
  context.fetch = (url, options) => {
    payload = { url, options };
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
  };
  assert.equal(vm.runInContext("enterPresentation('service_chef')", context), true);
  return Promise.resolve().then(() => {
    assert.equal(payload.url, `${BASE}/demo/profil`);
    assert.equal(payload.options.method, "POST");
    assert.equal(payload.options.credentials, "same-origin");
    assert.equal(JSON.parse(payload.options.body).role, "service_chef");
  });
});

test("la déconnexion utilise le formulaire POST protégé par CSRF", () => {
  let submitted = false;
  const context = boot();
  context.document.getElementById = (id) => (id === "meditra-logout-form" ? { submit: () => { submitted = true; } } : null);
  assert.equal(vm.runInContext("meditraLogout()", context), true);
  assert.equal(submitted, true);
});
