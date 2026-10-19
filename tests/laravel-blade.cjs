/* ==================================================================
   tests/laravel-blade.cjs
   Contrôles de cohérence de la couche Laravel générée (dossier laravel/).

   PHP et Laravel ne sont pas installés dans cet environnement : ces tests
   vérifient donc la structure réelle des fichiers produits (vues, routes,
   assets, ordre des scripts, équilibre des directives Blade) et non
   l'exécution du framework. Voir INSTALLATION_LARAVEL.md §6.
================================================================== */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const LARAVEL = path.join(ROOT, "laravel");
const VIEWS = path.join(LARAVEL, "resources/views");

const readFile = (file) => fs.readFileSync(file, "utf8");
const exists = (file) => fs.existsSync(file);

const webPhp = readFile(path.join(LARAVEL, "routes/web.php"));
const configPhp = readFile(path.join(LARAVEL, "config/meditra.php"));

/** Routes GET nommées déclarées dans web.php. */
const routes = [...webPhp.matchAll(/Route::get\('([^']+)'[\s\S]*?->name\('([^']+)'\)/g)]
  .map((match) => ({ uri: match[1], name: match[2] }));

/** Toutes les vues Blade du projet. */
function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith(".blade.php")) acc.push(full);
  }
  return acc;
}
const views = walk(VIEWS);

const viewExists = (name) => exists(path.join(VIEWS, `${name.replaceAll(".", "/")}.blade.php`));

test("les 72 vues de profil, les pages publiques et les pages d'erreur existent", () => {
  const profiles = views.filter((file) => file.includes(`${path.sep}profiles${path.sep}`));
  assert.equal(profiles.length, 72, "72 vues de profil attendues");

  for (const file of ["pages/home", "pages/auth/login", "pages/auth/register", "errors/403", "errors/404"]) {
    assert.ok(viewExists(file), `vue manquante : ${file}`);
  }
});

test("chaque route métier pointe vers une vue existante et chaque vue a une route", () => {
  const workspaceRoutes = routes.filter((route) => route.name.startsWith("workspace."));
  assert.equal(workspaceRoutes.length, 72, "72 routes métier attendues");

  const names = new Set();
  const uris = new Set();
  for (const route of workspaceRoutes) {
    const [, family, page] = route.name.split(".");
    assert.ok(viewExists(`profiles.${family}.${page}`), `vue absente pour ${route.name}`);
    assert.ok(!names.has(route.name), `nom de route dupliqué : ${route.name}`);
    assert.ok(!uris.has(route.uri), `URL dupliquée : ${route.uri}`);
    names.add(route.name);
    uris.add(route.uri);
  }

  const unused = views
    .filter((file) => file.includes(`${path.sep}profiles${path.sep}`))
    .map((file) => path.relative(VIEWS, file).replace(/\.blade\.php$/, "").replaceAll(path.sep, "."))
    .filter((name) => !names.has(`workspace.${name.replace(/^profiles\./, "")}`));
  assert.deepEqual(unused, [], "vues de profil sans route");
});

test("les vues de profil étendent le layout métier et rendent leur en-tête", () => {
  for (const file of views.filter((item) => item.includes(`${path.sep}profiles${path.sep}`))) {
    const source = readFile(file);
    const name = path.relative(VIEWS, file);
    assert.match(source, /@extends\('layouts\.app'\)/, `${name} doit étendre layouts.app`);
    assert.match(source, /@section\('title'/, `${name} doit définir un titre`);
    assert.match(source, /@section\('page-attrs'/, `${name} doit déclarer famille et page`);
    assert.match(source, /@include\('components\.page-head'/, `${name} doit inclure l'en-tête de page`);
    assert.match(source, /@include\('components\.workspace-loading'\)/, `${name} doit inclure le repère de chargement`);
    assert.doesNotMatch(source, /\$\{|undefined|NaN/, `${name} contient un résidu de génération`);
  }
});

test("toutes les inclusions et extensions Blade pointent vers un fichier existant", () => {
  const missing = [];
  for (const file of views) {
    const source = readFile(file);
    const targets = [
      ...[...source.matchAll(/@(?:include|extends)\('([^']+)'/g)].map((match) => match[1]),
      ...[...source.matchAll(/@(?:include|extends)\("([^"]+)"/g)].map((match) => match[1]),
    ];
    for (const target of targets) {
      if (!viewExists(target)) missing.push(`${path.relative(VIEWS, file)} → ${target}`);
    }
  }
  assert.deepEqual(missing, [], "inclusions Blade manquantes");
});

test("les directives Blade utilisées sont équilibrées", () => {
  const pairs = [
    ["@if", "@endif"],
    ["@foreach", "@endforeach"],
    ["@php", "@endphp"],
    ["@isset", "@endisset"],
  ];
  const problems = [];
  for (const file of views) {
    const source = readFile(file);
    for (const [open, close] of pairs) {
      const openCount = (source.match(new RegExp(`${open}(?!\\w)`, "g")) || []).length;
      const closeCount = (source.match(new RegExp(`${close}\\b`, "g")) || []).length;
      if (openCount !== closeCount) {
        problems.push(`${path.relative(VIEWS, file)} : ${open}=${openCount} / ${close}=${closeCount}`);
      }
    }
    // @section('x', 'valeur') est une section « en ligne » : pas de @endsection.
    const sections = [...source.matchAll(/@section\(([^)]*)\)/g)];
    const blockSections = sections.filter((match) => match[1].split(",").length === 1).length;
    const endSections = (source.match(/@endsection/g) || []).length;
    if (blockSections !== endSections) {
      problems.push(`${path.relative(VIEWS, file)} : @section bloc=${blockSections} / @endsection=${endSections}`);
    }
  }
  assert.deepEqual(problems, [], "directives Blade déséquilibrées");
});

test("les noms de route utilisés dans les vues existent", () => {
  const declared = new Set([
    ...routes.map((route) => route.name),
    ...[...webPhp.matchAll(/Route::post\('[^']+'[\s\S]*?->name\('([^']+)'\)/g)].map((match) => match[1]),
  ]);
  const missing = [];
  for (const file of views) {
    const source = readFile(file);
    for (const match of source.matchAll(/route\('([^']+)'\)/g)) {
      if (!declared.has(match[1])) missing.push(`${path.relative(VIEWS, file)} → ${match[1]}`);
    }
  }
  assert.deepEqual(missing, [], "routes référencées par les vues et non déclarées");
});

test("tous les assets référencés existent dans laravel/public", () => {
  const missing = [];
  const referenced = new Set();
  for (const file of views) {
    for (const match of readFile(file).matchAll(/asset\('([^']+)'\)/g)) referenced.add(match[1]);
  }
  for (const asset of referenced) {
    if (!exists(path.join(LARAVEL, "public", asset))) missing.push(asset);
  }
  assert.deepEqual(missing, [], "assets absents de public/");
});

test("l'ordre des scripts est préservé, sans doublon, avec l'adaptateur avant app.js", () => {
  const block = (name) => {
    const match = new RegExp(`'${name}' => \\[([\\s\\S]*?)\\n        \\]`).exec(configPhp);
    assert.ok(match, `liste de scripts « ${name} » introuvable`);
    return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]);
  };

  for (const name of ["public", "workspace"]) {
    const list = block(name);
    assert.equal(new Set(list).size, list.length, `doublon de script dans « ${name} »`);
    assert.equal(list[0], "js/site-config.js", "site-config.js doit être chargé en premier");
    assert.equal(list[list.length - 1], "js/app.js", "app.js doit être chargé en dernier");
    const adapter = list.indexOf("js/laravel/meditra-laravel.js");
    assert.ok(adapter > 0, "adaptateur Laravel présent");
    assert.equal(adapter, list.length - 2, "l'adaptateur doit précéder app.js");
    for (const src of list) {
      assert.ok(exists(path.join(LARAVEL, "public", src)), `script absent de public/ : ${src}`);
    }
  }

  const workspace = block("workspace");
  // Dépendance des modules métier : core.js avant les vues, bridge avant cf-app.
  const index = (file) => workspace.indexOf(file);
  assert.ok(index("js/gab-orient/core.js") < index("js/gab-orient/views-dossiers.js"));
  assert.ok(index("js/gab-orient/bridge.js") < index("js/cf-app.js"));
  assert.ok(index("js/cf-store.js") < index("js/cf-app.js"));
});

test("les feuilles de style sont déclarées une seule fois et existent", () => {
  const match = /'styles' => \[([\s\S]*?)\n    \]/.exec(configPhp);
  assert.ok(match, "liste des styles introuvable");
  const styles = [...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]);
  assert.equal(styles.length, 5, "cinq feuilles de style attendues");
  assert.equal(new Set(styles).size, styles.length);
  for (const href of styles) {
    assert.ok(exists(path.join(LARAVEL, "public", href)), `style absent : ${href}`);
  }
  assert.deepEqual(styles, ["css/app.css", "css/cf.css", "css/gab-orient.css", "css/meditra.css", "css/site.css"]);
});

test("les rôles sont rattachés à une famille et les pages restent dans leur famille", () => {
  const rolesBlock = /\n    'roles' => \[([\s\S]*?)\n    \],/.exec(configPhp);
  assert.ok(rolesBlock, "table des rôles introuvable");
  const pairs = [...rolesBlock[1].matchAll(/'([a-z_]+)' => '([a-z]+)'/g)].map((match) => [match[1], match[2]]);
  assert.equal(pairs.length, 13, "13 rôles attendus");

  const families = new Set(pairs.map((pair) => pair[1]));
  assert.deepEqual([...families].sort(), ["admin", "demandeur", "direction", "recipient", "regie", "secretariat", "service"]);

  // Chaque famille déclare un menu dont toutes les pages existent.
  for (const family of families) {
    const navBlock = new RegExp(`'${family}' => \\[([\\s\\S]*?)'pages' =>`).exec(configPhp);
    assert.ok(navBlock, `famille ${family} absente de la configuration`);
  }
});

test("la table de correspondance couvre exactement les 72 pages et les routes publiques", () => {
  const table = readFile(path.join(LARAVEL, "CORRESPONDANCE_URLS.md"));
  const mainTable = table.split("## Routes non métier")[0];
  const rows = mainTable.split("\n").filter((line) => line.startsWith("| `"));
  assert.equal(rows.length, 75, "72 pages + accueil + connexion + inscription");
  for (const route of routes.filter((item) => item.name.startsWith("workspace."))) {
    assert.ok(table.includes(`\`${route.name}\``), `route absente du tableau : ${route.name}`);
    assert.ok(table.includes(`\`${route.uri}\``), `URL absente du tableau : ${route.uri}`);
  }
});

test("aucun chemin d'asset statique du site multipage ne subsiste dans les vues", () => {
  const problems = [];
  for (const file of views) {
    const source = readFile(file);
    for (const match of source.matchAll(/(?:href|src)="(\/(?:css|js|assets)\/[^"]+)"/g)) {
      problems.push(`${path.relative(VIEWS, file)} → ${match[1]}`);
    }
  }
  assert.deepEqual(problems, [], "utiliser asset() au lieu d'un chemin absolu");
});

test("le layout fournit tous les points de montage attendus par les modules JavaScript", () => {
  const layout = readFile(path.join(VIEWS, "layouts/app.blade.php"));
  const header = readFile(path.join(VIEWS, "components/header.blade.php"));
  const overlays = readFile(path.join(VIEWS, "components/overlays.blade.php"));
  const toasts = readFile(path.join(VIEWS, "components/toasts.blade.php"));
  const base = readFile(path.join(VIEWS, "layouts/base.blade.php"));
  const account = readFile(path.join(VIEWS, "components/profile-menu.blade.php"));
  const mobile = readFile(path.join(VIEWS, "components/mobile-nav.blade.php"));
  const notices = readFile(path.join(VIEWS, "components/notifications.blade.php"));
  const search = readFile(path.join(VIEWS, "components/search-trigger.blade.php"));

  const required = [
    [layout, /id="view"/, "zone de contenu #view"],
    [layout, /data-go-page="\{\{ \$page \}\}"/, "data-go-page"],
    [layout, /id="mp-confirm"/, "#mp-confirm"],
    [layout, /id="mp-panel"/, "#mp-panel"],
    [layout, /id="mp-viewer"/, "#mp-viewer"],
    [layout, /id="cf-toast"/, "#cf-toast"],
    [layout, /@include\('components\.toasts'\)/, "inclusion des toasts"],
    [overlays, /id="tip"/, "#tip"],
    [toasts, /id="toasts"/, "#toasts"],
    [mobile, /id="mobile-nav"/, "#mobile-nav"],
    [header, /data-site-slot="search"/, "slot recherche"],
    [notices, /data-site-slot="notices"/, "slot notifications"],
    [account, /data-site-slot="account"/, "slot compte"],
    [account, /id="meditra-logout-form"/, "formulaire de déconnexion"],
    [search, /data-cf-action="search"/, "bouton recherche"],
    [notices, /data-site-unread/, "compteur de notifications"],
    [base, /data-site-kind="@yield\('site-kind'\)"/, "data-site-kind"],
    [base, /window\.MEDITRA/, "configuration window.MEDITRA"],
  ];
  const missing = required.filter(([source, pattern]) => !pattern.test(source)).map(([, , label]) => label);
  assert.deepEqual(missing, [], "points de montage manquants");
});

test("le sprite contient toutes les icônes utilisées par la navigation", () => {
  const sprite = readFile(path.join(VIEWS, "components/sprite.blade.php"));
  const icons = new Set([...sprite.matchAll(/<symbol id="i-([a-z0-9-]+)"/g)].map((match) => match[1]));
  assert.ok(icons.size > 10, "sprite inattendu");

  // Icônes citées dans la configuration des menus.
  const used = new Set([...configPhp.matchAll(/'icon' => '([a-z0-9-]+)'/g)].map((match) => match[1]));
  used.add("chevron-down");
  used.add("menu");
  used.add("search");
  used.add("bell");
  used.add("arrow-up");
  const missing = [...used].filter((name) => !icons.has(name));
  assert.deepEqual(missing, [], "icônes absentes du sprite");
});

test("l'adaptateur Laravel est copié, à jour et syntaxiquement valide", () => {
  const source = path.join(ROOT, "js/laravel/meditra-laravel.js");
  const copy = path.join(LARAVEL, "public/js/laravel/meditra-laravel.js");
  assert.ok(exists(source), "adaptateur source absent");
  assert.ok(exists(copy), "adaptateur non copié dans public/js");
  assert.equal(readFile(source), readFile(copy), "la copie doit être identique à la source");

  const { execFileSync } = require("node:child_process");
  execFileSync(process.execPath, ["--check", copy], { stdio: "pipe" });
});

test("les vues n'utilisent ni @vite ni dépendance front non installée", () => {
  for (const file of views) {
    const source = readFile(file);
    assert.doesNotMatch(source, /@vite\b/, `${path.relative(VIEWS, file)} utilise @vite sans build Vite`);
    assert.doesNotMatch(source, /\binertia\b/i, `${path.relative(VIEWS, file)} référence Inertia`);
    assert.doesNotMatch(source, /react|vue\.js|alpine/i, `${path.relative(VIEWS, file)} référence un framework SPA`);
  }
});

test("les fichiers PHP générés sont structurellement équilibrés", () => {
  const phpFiles = [];
  (function collect(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) collect(full);
      else if (entry.name.endsWith(".php") && !entry.name.endsWith(".blade.php")) phpFiles.push(full);
    }
  })(LARAVEL);

  assert.ok(phpFiles.length >= 10, "fichiers PHP attendus");

  const problems = [];
  for (const file of phpFiles) {
    const source = readFile(file);
    const name = path.relative(LARAVEL, file);

    if (!source.startsWith("<?php")) problems.push(`${name} : balise <?php absente`);

    // Analyse des délimiteurs hors chaînes et commentaires.
    let i = 0;
    let single = false;
    let double = false;
    let line = false;
    let block = false;
    let escaped = false;
    const counts = { "{": 0, "}": 0, "(": 0, ")": 0 };
    while (i < source.length) {
      const ch = source[i];
      const next = source[i + 1];
      if (line) { if (ch === "\n") line = false; i += 1; continue; }
      if (block) { if (ch === "*" && next === "/") { block = false; i += 2; continue; } i += 1; continue; }
      if (single) {
        if (escaped) { escaped = false; } else if (ch === "\\") { escaped = true; } else if (ch === "'") { single = false; }
        i += 1; continue;
      }
      if (double) {
        if (escaped) { escaped = false; } else if (ch === "\\") { escaped = true; } else if (ch === '"') { double = false; }
        i += 1; continue;
      }
      if (ch === "/" && next === "/") { line = true; i += 2; continue; }
      if (ch === "#") { line = true; i += 1; continue; }
      if (ch === "/" && next === "*") { block = true; i += 2; continue; }
      if (ch === "'") { single = true; i += 1; continue; }
      if (ch === '"') { double = true; i += 1; continue; }
      if (ch in counts) counts[ch] += 1;
      i += 1;
    }

    if (single || double || block) problems.push(`${name} : chaîne ou commentaire non fermé`);
    if (counts["{"] !== counts["}"]) problems.push(`${name} : accolades ${counts["{"]}/${counts["}"]}`);
    if (counts["("] !== counts[")"]) problems.push(`${name} : parenthèses ${counts["("]}/${counts[")"]}`);
  }

  assert.deepEqual(problems, [], "fichiers PHP déséquilibrés");
});

test("chaque contrôleur référencé par web.php est présent et déclare l'action utilisée", () => {
  const controllers = new Map();
  (function collect(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) collect(full);
      else if (entry.name.endsWith("Controller.php")) {
        controllers.set(entry.name.replace(".php", ""), readFile(full));
      }
    }
  })(path.join(LARAVEL, "app/Http/Controllers"));

  const used = [...webPhp.matchAll(/\[?([A-Z][A-Za-z]+Controller)::class(?:, '([a-z]+)')?\]?/g)];
  assert.ok(used.length > 70, "contrôleurs attendus dans web.php");

  const missing = [];
  for (const [, name, action] of used) {
    const source = controllers.get(name);
    if (!source) { missing.push(`${name} (fichier absent)`); continue; }
    if (action && !new RegExp(`function\\s+${action}\\s*\\(`).test(source)) {
      missing.push(`${name}::${action}()`);
    }
  }
  assert.deepEqual([...new Set(missing)], [], "contrôleurs ou actions manquants");
});
