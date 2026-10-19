#!/usr/bin/env node
/* ==================================================================
   tools/build-laravel.mjs
   Génère la couche Laravel 12 (vues Blade, configuration, routes)
   à partir des sources réelles du site multipage :

     · js/site-config.js      familles, pages, libellés, URL
     · js/views/internal-portal.js  menu effectif de chaque rôle
     · index.html             sprite SVG des icônes
     · css/, js/, assets/     ressources copiées dans public/

   Sortie : laravel/
     resources/views/{layouts,components,pages,profiles}
     config/meditra.php
     routes/web.php
     public/{css,js,assets}

   Relancer `node tools/build-laravel.mjs` après toute évolution des
   pages ou du menu. Aucune dépendance npm.
================================================================== */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "laravel");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const write = (file, content) => {
  const target = path.join(OUT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
  return file;
};
const written = [];
const emit = (file, content) => written.push(write(file, content));

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
  "globalThis.H = { ipNav, icon, meditraBrand, DEMO_ACCOUNTS, SITE_FAMILIES, SITE_PAGE_LABELS, sitePagePath, siteCanonicalPage };",
  ctx,
);
const H = ctx.H;
const FAMILIES = H.SITE_FAMILIES;
const FAMILY_KEYS = Object.keys(FAMILIES);

/* --------------------------------- Utilitaires ------------------------------- */

const esc = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const bladeStr = (value) => `'${String(value).replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;
const phpKey = (key) => (/^[a-z_][a-z0-9_]*$/i.test(key) ? `'${key}'` : `'${String(key).replaceAll("'", "\\'")}'`);
const phpScalar = (value) => {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  return `'${String(value).replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;
};
function php(value, indent = 0) {
  const pad = "    ".repeat(indent);
  const inner = "    ".repeat(indent + 1);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    if (Object.keys(value).every((key, index) => String(index) === key)) {
      return `[\n${value.map((item) => `${inner}${php(item, indent + 1)},`).join("\n")}\n${pad}]`;
    }
    return `[\n${Object.entries(value).map(([k, v]) => `${inner}${phpKey(k)} => ${php(v, indent + 1)},`).join("\n")}\n${pad}]`;
  }
  if (value && typeof value === "object") {
    return `[\n${Object.entries(value).map(([k, v]) => `${inner}${phpKey(k)} => ${php(v, indent + 1)},`).join("\n")}\n${pad}]`;
  }
  return phpScalar(value);
}

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

/* ------------------------------ Textes des pages ----------------------------- */

const PAGE_DESCRIPTIONS = {
  overview: "Synthèse de votre activité, des échéances et des actions attendues.",
  dossiers: "Suivi des dossiers de distinction, du dépôt à la clôture.",
  "new-dossier": "Dépôt d’une nouvelle demande de distinction et constitution des pièces.",
  recipients: "Bénéficiaires et récipiendaires rattachés aux dossiers suivis.",
  complements: "Pièces complémentaires, relances et réponses attendues.",
  recours: "Recours et contestations, avec leur instruction et leurs suites.",
  documents: "Courriers, transmissions et pièces officielles échangées.",
  ceremonies: "Planification et suivi des cérémonies de remise des médailles.",
  payments: "Ordres de recette, quittances et suivi des encaissements.",
  pieces: "DTS, diplômes et pièces justificatives des dossiers.",
  journal: "Journal d’activité et historique des actions réalisées.",
  notifications: "Alertes, échéances et messages reçus sur votre espace.",
  profile: "Profil, coordonnées, signature et paramètres du compte.",
  distinctions: "Distinctions obtenues et parcours du récipiendaire.",
  retraits: "Retraits sans cérémonie et remises exceptionnelles.",
  inbox: "Registre des courriers entrants et sortants du secrétariat.",
  decisions: "Décisions initiales, signatures et suites à donner.",
  stats: "Statistiques et indicateurs d’activité du dispositif.",
  instruction: "File d’instruction et contrôle des pièces déposées.",
  supervision: "Supervision des dossiers et de la charge de travail.",
  remises: "Remises des médailles et suivi des mouvements de stock.",
  orders: "Ordres de recette émis, encaissements et rapprochements.",
  stock: "Stock des médailles, diplômes et mouvements de la régie.",
  controle: "Contrôles, anomalies et vérifications des récipiendaires.",
  users: "Comptes, rôles, campagnes et journaux d’accès.",
};

const familyBase = (family) => {
  const conf = FAMILIES[family];
  return conf.dir ? `/profil/${conf.dir}` : conf.base.replace(/\/$/, "");
};
const routeName = (family, page) => `workspace.${family}.${page}`;
const pagePath = (family, page) => (page === "overview" ? familyBase(family) : `${familyBase(family)}/${page}`);
const pageLabel = (page) => H.SITE_PAGE_LABELS[page] || page;
const familyRouteBase = (family) => routeName(family, "overview");

/* ------------------------------- Assets & ordre ------------------------------ */

const STYLES = ["css/app.css", "css/cf.css", "css/gab-orient.css", "css/meditra.css", "css/site.css"];

const COMMON_SCRIPTS = [
  "js/site-config.js", "js/icons.js", "js/data.js", "js/auth.js", "js/demo-accounts.js",
  "js/portal-demo.js", "js/demo-store.js", "js/router.js", "js/ui.js", "js/views/home.js",
  "js/registration.js", "js/views/login.js",
];

const WORKSPACE_SCRIPTS = [
  ...COMMON_SCRIPTS,
  "js/views/workspace.js", "js/views/portals.js", "js/views/portal-extras.js",
  "js/views/admin.js", "js/views/role-pages.js", "js/views/shared.js", "js/cf-store.js",
  "js/gab-orient/data.js", "js/gab-orient/charts.js", "js/gab-orient/map.js", "js/gab-orient/core.js",
  "js/gab-orient/views-dossiers.js", "js/gab-orient/views-demande.js", "js/gab-orient/views-courriers.js",
  "js/gab-orient/views-ceremonies.js", "js/gab-orient/views-service.js", "js/gab-orient/views-decisions.js",
  "js/gab-orient/views-regie.js", "js/gab-orient/views-admin.js", "js/gab-orient/bridge.js",
  "js/views/go-ui.js", "js/views/go-pages.js", "js/views/internal-portal.js", "js/cf-app.js",
  "js/site/routes.js", "js/site/chrome.js", "js/site/workspace-page.js",
];

// L'adaptateur Laravel doit précéder app.js : il aligne URL, session et rôle.
const withAdapter = (list) => {
  const index = list.indexOf("js/app.js");
  const copy = [...list];
  copy.splice(index === -1 ? copy.length : index, 0, "js/laravel/meditra-laravel.js");
  return copy;
};
const PUBLIC_SCRIPTS = withAdapter([...COMMON_SCRIPTS, "js/site/routes.js", "js/app.js"]);
const WORKSPACE_ALL = withAdapter([...WORKSPACE_SCRIPTS, "js/app.js"]);

/* ----------------------------------- Sprite ---------------------------------- */

const SPRITE = (() => {
  const legacy = read("index.html");
  const start = legacy.indexOf('<svg width="0"');
  const end = legacy.indexOf("</svg>", start);
  if (start < 0 || end < 0) throw new Error("Sprite SVG introuvable dans index.html");
  return legacy.slice(start, end + "</svg>".length);
})();

const BRAND_HTML = H.meditraBrand({ size: 36, sub: "République Gabonaise" });

/* ============================ 1. Config Laravel ============================= */

const configFamilies = {};
for (const family of FAMILY_KEYS) {
  const conf = FAMILIES[family];
  const pages = {};
  for (const page of conf.pages) {
    pages[page] = {
      label: pageLabel(page),
      title: page === "overview" ? `${conf.label} — MEDITRA` : `${pageLabel(page)} — ${conf.label} | MEDITRA`,
      description: PAGE_DESCRIPTIONS[page] || `${pageLabel(page)} — ${conf.label} du portail MEDITRA.`,
      route: routeName(family, page),
      path: pagePath(family, page),
    };
  }
  configFamilies[family] = {
    label: conf.label,
    dir: conf.dir || family,
    base: familyBase(family),
    roles: conf.roles,
    pages,
    navigation: familyNav(family).map((section) => ({
      page: section.page,
      label: section.label,
      icon: section.icon,
      count: section.count,
      route: routeName(family, section.page),
      roles: [...section.roles],
      children: section.children
        .filter((child) => child.page !== section.page)
        .map((child) => ({
          page: child.page,
          label: child.label,
          icon: child.view === "nouveau" ? "plus" : section.icon,
          route: routeName(family, child.page),
          roles: [...child.roles],
        })),
    })),
  };
}

const ROLE_TO_FAMILY = {};
for (const family of FAMILY_KEYS) {
  for (const role of FAMILIES[family].roles) ROLE_TO_FAMILY[role] = family;
}

const configPhp = `<?php

/*
|--------------------------------------------------------------------------
| Configuration MEDITRA
|--------------------------------------------------------------------------
|
| Fichier GÉNÉRÉ par tools/build-laravel.mjs à partir de js/site-config.js.
| Ne pas modifier à la main : relancer la génération après toute évolution
| des familles, des pages ou des menus.
|
| · families : familles fonctionnelles, pages, titres, routes et menus
| · roles    : rôle technique → famille autorisée
| · demo     : autorise le jeu de démonstration (à passer à false en prod)
|
*/

return [
    'title' => 'MEDITRA — Médaille et Distinctions du Travail',
    'description' => 'MEDITRA — portail de dépôt, de suivi et d’attribution des médailles du travail de la République Gabonaise.',

    'demo' => env('MEDITRA_DEMO', true),

    'styles' => ${php(STYLES, 1)},

    'scripts' => [
        'public' => ${php(PUBLIC_SCRIPTS, 2)},
        'workspace' => ${php(WORKSPACE_ALL, 2)},
    ],

    'families' => ${php(configFamilies, 1)},

    'roles' => ${php(ROLE_TO_FAMILY, 1)},

    'demo_roles' => ${php(FAMILY_KEYS.flatMap((family) => FAMILIES[family].roles), 1)},
];
`;
emit("config/meditra.php", configPhp);

/* ============================== 2. Layouts ================================== */

emit("resources/views/layouts/base.blade.php", `<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="description" content="@yield('description', config('meditra.description'))">
    <meta name="theme-color" content="#102A50">
    <title>@yield('title', config('meditra.title'))</title>
    <link rel="icon" href="{{ asset('assets/brand/meditra-favicon.svg') }}" type="image/svg+xml">
    <link rel="apple-touch-icon" href="{{ asset('assets/brand/meditra-favicon.svg') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,500;0,600;1,500&family=Sora:wght@400;500;600;700&display=swap" rel="stylesheet">
    @include('components.styles')
    @stack('head')

    {{-- Configuration lue par js/laravel/meditra-laravel.js --}}
    <script>
        window.MEDITRA = @json($meditraConfig ?? []);
        @if (! config('meditra.demo'))
        window.DN_PRESENTATION_MODE = false;
        @endif
    </script>
</head>
<body class="@yield('body-class')" data-site-kind="@yield('site-kind')" @yield('page-attrs')>
@include('components.sprite')
@yield('body')
@include('components.scripts', ['scriptSet' => $scriptSet ?? 'public'])
@include('components.boot-guard')
@stack('scripts')
</body>
</html>
`);

emit("resources/views/layouts/app.blade.php", `{{--
    Layout des pages métier (72 pages).
    En-tête, navigation par famille, fil d'Ariane, zone de contenu montée
    par js/site/workspace-page.js, panneaux et notifications.
--}}
@extends('layouts.base')

@section('body-class', 'mp-workspace')
@section('site-kind', 'workspace')

@section('body')
    <a class="mp-skip" href="#view">Aller au contenu</a>
    @include('components.noscript')
    <div class="go-workspace">
        <div class="progress-rail" aria-hidden="true"><i class="progress-fill"></i></div>

        @include('components.header')
        @include('components.breadcrumb')

        <div id="mp-confirm"></div>

        <main id="view" class="container go-host" tabindex="-1" data-go-view="" data-go-page="{{ $page }}">
            @yield('workspace')
        </main>

        @include('components.footer')
        <div id="mp-panel"></div>
        <div id="mp-viewer"></div>
        <div id="cf-toast"></div>
        @include('components.back-to-top')
    </div>

    @include('components.toasts')
    @include('components.overlays')
@endsection
`);

emit("resources/views/layouts/public.blade.php", `{{-- Layout public : accueil. Le contenu est rendu par js/views/home.js. --}}
@extends('layouts.base')

@section('body-class', 'mp-home')
@section('site-kind', 'home')

@section('body')
    @include('components.noscript')
    <div id="app">
        @include('components.home-fallback')
    </div>
    @include('components.toasts')
    @include('components.overlays')
@endsection
`);

emit("resources/views/layouts/auth.blade.php", `{{-- Layout d'authentification : connexion et inscription. --}}
@extends('layouts.base')

@section('body-class', 'mp-auth')
@section('site-kind', 'auth')

@section('body')
    @include('components.noscript')
    <div id="app">
        @yield('auth-content')
    </div>
    @include('components.toasts')
    @include('components.overlays')
@endsection
`);

/* ============================= 3. Composants ================================ */

emit("resources/views/components/styles.blade.php", `{{-- Feuilles de style, dans l'ordre historique du site multipage. --}}
@foreach (config('meditra.styles', []) as $href)
    <link rel="stylesheet" href="{{ asset($href) }}">
@endforeach
`);

emit("resources/views/components/scripts.blade.php", `{{--
    Scripts, dans l'ordre de chargement d'origine. L'adaptateur
    js/laravel/meditra-laravel.js est inséré juste avant js/app.js :
    l'ordre des modules métier n'est pas modifié.
--}}
@foreach (config('meditra.scripts.' . ($scriptSet ?? 'public'), []) as $src)
    <script src="{{ asset($src) }}"></script>
@endforeach
`);

emit("resources/views/components/sprite.blade.php", `{{-- Sprite SVG des icônes (symboles #i-*), identique au site statique. --}}
${SPRITE}
`);

emit("resources/views/components/icon.blade.php", `{{-- Icône du sprite : <x-icon name="bell" /> ou @include('components.icon', ['name' => 'bell']). --}}
<svg class="ic" aria-hidden="true" focusable="false"><use href="#i-{{ $name }}"></use></svg>
`);

emit("resources/views/components/noscript.blade.php", `<noscript>
    <div class="mp-noscript container">
        <strong>JavaScript est désactivé.</strong>
        Ce portail affiche ses pages avec JavaScript. Les liens de navigation et, sur la connexion,
        le formulaire standard restent utilisables.
    </div>
</noscript>
`);

emit("resources/views/components/header.blade.php", `{{--
    En-tête partagé des pages métier.
    Reçoit : $family, $page, $navigation (config('meditra.families.*.navigation')),
             $familyLabel, $pageLabel.
--}}
<header class="site-header sticky" id="site-header">
    <div class="container hdr-top">
        <button class="icon-btn nav-toggle" type="button" data-site-action="mobile" aria-label="Ouvrir le menu de navigation" aria-expanded="false">
            @include('components.icon', ['name' => 'menu'])
        </button>

        <a class="brand" href="{{ route('workspace.' . $family . '.overview') }}" aria-label="MEDITRA, accueil de l’espace">
            ${BRAND_HTML}
        </a>

        @include('components.search-trigger')

        <div class="hdr-actions">
            @include('components.notifications')
            @include('components.profile-menu')
        </div>
    </div>

    @include('components.navigation')

    <div data-site-slot="search"></div>
    @include('components.mobile-nav')
</header>
`);

emit("resources/views/components/search-trigger.blade.php", `<button class="search-trigger" type="button" data-cf-action="search" aria-label="Rechercher (raccourci Ctrl+K)">
    @include('components.icon', ['name' => 'search'])
    <span>Rechercher un dossier, un courrier…</span>
    <kbd>Ctrl+K</kbd>
</button>
`);

emit("resources/views/components/navigation.blade.php", `{{--
    Navigation principale : vraie liste de liens (aucun routeur client).
    Le filtrage par rôle est appliqué à l'affichage par js/site/chrome.js
    à partir de data-nav-roles ; l'autorisation réelle est vérifiée par
    App\\Http\\Controllers\\WorkspaceController.
--}}
<nav class="main-nav" aria-label="Navigation principale">
    <div class="container">
        <ul id="nav-list">
            @foreach ($navigation as $item)
                @php
                    $isCurrent = $item['page'] === $page;
                    $isSection = $isCurrent;
                    foreach ($item['children'] as $child) {
                        if ($child['page'] === $page) { $isSection = true; }
                    }
                    $roles = implode(' ', $item['roles']);
                @endphp
                <li class="nav-item{{ $isSection ? ' is-current' : '' }}" data-nav-roles="{{ $roles }}">
                    <a class="{{ $isCurrent ? 'nav-link is-current' : 'nav-link' }}"
                       href="{{ route($item['route']) }}"
                       data-nav-page="{{ $item['page'] }}"
                       data-nav-parent-page="{{ $item['page'] }}"
                       data-nav-roles="{{ $roles }}"
                       @if ($isCurrent) aria-current="page" @endif>
                        @include('components.icon', ['name' => $item['icon']]){{ $item['label'] }}@if ($item['count'])<span class="nav-count is-zero" data-site-unread hidden>0</span>@endif
                    </a>
                    @if (! empty($item['children']))
                        <button class="nav-caret" type="button" data-site-action="menu" aria-expanded="false" aria-haspopup="true"
                                aria-controls="nav-{{ $item['page'] }}" aria-label="Autres accès : {{ $item['label'] }}">
                            @include('components.icon', ['name' => 'chevron-down'])
                        </button>
                        <div class="dd-menu" id="nav-{{ $item['page'] }}" hidden>
                            @foreach ($item['children'] as $child)
                                <a class="menu-item" href="{{ route($child['route']) }}"
                                   data-nav-page="{{ $child['page'] }}"
                                   data-nav-roles="{{ implode(' ', $child['roles']) }}"
                                   @if ($child['page'] === $page) aria-current="page" @endif>
                                    @include('components.icon', ['name' => $child['icon']]){{ $child['label'] }}
                                </a>
                            @endforeach
                        </div>
                    @endif
                </li>
            @endforeach
        </ul>
    </div>
</nav>
`);

emit("resources/views/components/mobile-nav.blade.php", `{{-- Navigation mobile : mêmes liens, à plat. --}}
<div class="mobile-nav" id="mobile-nav" hidden>
    <div class="mobile-nav-list">
        @foreach ($navigation as $item)
            <a href="{{ route($item['route']) }}" data-nav-page="{{ $item['page'] }}"
               data-nav-roles="{{ implode(' ', $item['roles']) }}"
               @if ($item['page'] === $page) aria-current="page" @endif>{{ $item['label'] }}</a>
            @foreach ($item['children'] as $child)
                <a href="{{ route($child['route']) }}" data-nav-page="{{ $child['page'] }}"
                   data-nav-roles="{{ implode(' ', $child['roles']) }}"
                   @if ($child['page'] === $page) aria-current="page" @endif>{{ $child['label'] }}</a>
            @endforeach
        @endforeach
        <a href="{{ route('home') }}">Accueil public</a>
    </div>
</div>
`);

emit("resources/views/components/notifications.blade.php", `<div class="dd">
    <button class="icon-btn" type="button" data-cf-action="notices" aria-expanded="false" aria-label="Notifications">
        @include('components.icon', ['name' => 'bell'])
        <span class="count" data-site-unread hidden>0</span>
    </button>
    <div data-site-slot="notices"></div>
</div>
`);

emit("resources/views/components/profile-menu.blade.php", `{{--
    Menu de compte. Le nom, le rôle et les initiales sont renseignés par
    js/site/chrome.js à partir du compte authentifié (window.MEDITRA.user).
    La déconnexion utilise le formulaire POST protégé par CSRF.
--}}
<div class="dd">
    <button class="account-btn" type="button" data-cf-action="account" aria-expanded="false">
        <span class="avatar" data-site-initials>—</span>
        <span class="account-meta">
            <strong data-site-name>Chargement…</strong>
            <span data-site-role>—</span>
        </span>
        @include('components.icon', ['name' => 'chevron-down'])
    </button>
    <div data-site-slot="account"></div>
</div>

<form id="meditra-logout-form" method="POST" action="{{ route('logout') }}" hidden>
    @csrf
</form>
`);

emit("resources/views/components/breadcrumb.blade.php", `<nav class="page-crumbs container" aria-label="Fil d’Ariane">
    <ol>
        <li><a href="{{ route('home') }}">Accueil</a></li>
        <li><a href="{{ route('workspace.' . $family . '.overview') }}">{{ $familyLabel }}</a></li>
        @if ($page !== 'overview')
            <li aria-current="page">{{ $pageLabel }}</li>
        @endif
    </ol>
</nav>
`);

emit("resources/views/components/page-head.blade.php", `<section class="page-head reveal">
    <p class="page-eyebrow">{{ $eyebrow ?? $familyLabel }}</p>
    <h1 class="page-title">{{ $title }}</h1>
    @isset($subtitle)
        <p class="page-sub">{{ $subtitle }}</p>
    @endisset
</section>
`);

emit("resources/views/components/workspace-loading.blade.php", `{{--
    Repère de chargement rendu par Blade : il reste visible si JavaScript
    est indisponible et il est remplacé par le contenu métier hydraté
    (js/site/workspace-page.js) dès que les scripts sont actifs.
--}}
<div class="mp-loading" role="status">Chargement de la page…</div>

<noscript>
    <section class="card mt">
        <h2 class="card-title">Contenu métier simulé</h2>
        <p class="card-sub">
            Les dossiers, courriers et décisions affichés sur cette page proviennent du jeu de
            démonstration et sont chargés par JavaScript. Aucun contrôleur ne fournit encore de
            données : voir <code>INTEGRATION_BACKEND.md</code>.
        </p>
    </section>
</noscript>
`);

emit("resources/views/components/access-denied.blade.php", `<section class="page-head mp-denied">
    <p class="page-eyebrow">Accès</p>
    <h1 class="page-title">{{ $title }}</h1>
    <p class="page-sub">{{ $lead }}</p>
    <div class="mp-denied-actions">
        <a class="btn btn-primary" href="{{ $home }}">Ouvrir mon espace</a>
        <a class="btn btn-secondary" href="{{ route('home') }}">Accueil public</a>
    </div>
</section>
<section class="card mt">
    <h2 class="card-title">Contrôle d’accès</h2>
    <p class="card-sub">
        Les données affichées restent limitées à votre organisme et à vos droits.
        Modifier l’URL ne donne accès à aucun dossier supplémentaire.
    </p>
</section>
`);

emit("resources/views/components/footer.blade.php", `<footer class="container site-footer">
    <span class="footer-mark"><span class="flag-dots" aria-hidden="true"><i></i><i></i><i></i></span> MEDITRA</span>
    <span>République Gabonaise — Médaille et Distinctions du Travail</span>
</footer>
`);

emit("resources/views/components/back-to-top.blade.php", `<button type="button" data-action="home-top" data-back-to-top id="to-top"
        class="to-top home-back-top" aria-label="Revenir en haut" aria-hidden="true" tabindex="-1">
    @include('components.icon', ['name' => 'arrow-up'])
</button>
`);

emit("resources/views/components/toasts.blade.php", `<div id="toasts" class="toast-stack go-toasts"></div>
`);

emit("resources/views/components/overlays.blade.php", `<div id="tip" class="tip go-tip" hidden></div>
{{-- Chargement différé de la carte : sans réseau, js/gab-orient/map.js prend le relais. --}}
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js" async
        onload="window.__leaflet='ok'" onerror="window.__leaflet='error'"></script>
`);

emit("resources/views/components/boot-guard.blade.php", `<script>
    window.setTimeout(function () {
        if (window.__siteBooted) return;
        var zone = document.getElementById("view") || document.getElementById("app");
        if (!zone) return;
        var html = [
            '<section style="max-width:720px;margin:64px auto;padding:0 20px;font-family:system-ui,sans-serif">',
            '<p style="letter-spacing:.12em;text-transform:uppercase;font-size:12px;color:#007e50;font-weight:700">Chargement interrompu</p>',
            '<h1 style="font-size:26px;margin:8px 0 12px;color:#102a50">Le site n’a pas pu charger ses fichiers</h1>',
            '<p style="color:#3f556b;line-height:1.6">Les scripts de cette page ne sont pas accessibles. ',
            'Vérifiez que <code>public/js</code> et <code>public/css</code> ont bien été copiés, ',
            'puis videz le cache du navigateur.</p>',
            '<p style="margin-top:18px"><a href="{{ route('home') }}" style="display:inline-block;padding:10px 16px;border-radius:10px;background:#102a50;color:#fff;text-decoration:none">Revenir à l’accueil</a></p>',
            '</section>'
        ].join("");
        zone.innerHTML = html;
    }, 3500);
</script>
`);

emit("resources/views/components/home-fallback.blade.php", `{{--
    Contenu de secours de l'accueil, rendu par Blade.
    Il est remplacé par js/views/home.js dès l'activation des scripts
    (mise en page complète, illustrations et animations).
--}}
<div class="home-page">
    <main id="contenu">
        <section class="container" style="padding: 64px 0 40px">
            <p class="page-eyebrow">République Gabonaise</p>
            <h1 class="page-title">Médaille et Distinctions du Travail</h1>
            <p class="page-sub">
                Déposez et suivez une demande de distinction, de l’instruction à la cérémonie.
                Le portail réunit les demandeurs, les secrétariats, la Direction Générale du Travail,
                les Directions Régionales, le Service des Distinctions et la Régie des Médailles.
            </p>
            <div class="mp-denied-actions" style="margin-top: 22px">
                <a class="btn btn-primary" href="{{ route('login') }}">Se connecter</a>
                <a class="btn btn-secondary" href="{{ route('register') }}">Créer un compte</a>
            </div>
        </section>
        <section class="container" style="padding-bottom: 56px">
            <h2 class="card-title">Espaces du portail</h2>
            <ul class="mp-nf-list">
                @foreach (config('meditra.families') as $family => $conf)
                    <li><a href="{{ route('workspace.' . $family . '.overview') }}">{{ $conf['label'] }}</a></li>
                @endforeach
            </ul>
        </section>
    </main>
</div>
`);

emit("resources/views/components/auth-fallback.blade.php", `{{--
    Formulaire de connexion standard (sans JavaScript), rendu par Blade.
    Avec JavaScript, js/views/login.js remplace ce panneau par l'interface
    complète (mot de passe, OTP, mot de passe oublié, sélection de profil
    de démonstration) et utilise les routes Laravel pour la soumission.
--}}
<div class="auth-page">
    <div class="auth-topline" aria-hidden="true"></div>
    <main id="contenu" class="auth-main">
        <div class="auth-main-content">
            <div class="auth-card" id="login-panel">
                <h1 class="auth-title">{{ $title }}</h1>
                <p class="auth-sub">{{ $subtitle }}</p>

                @if ($errors->any())
                    <div class="cf-flash cf-flash-error" role="alert">
                        {{ $errors->first() }}
                    </div>
                @endif

                <form method="POST" action="{{ $action }}">
                    @csrf
                    @if ($mode === 'login')
                        <label class="auth-field">
                            <span>Adresse e-mail</span>
                            <input type="email" name="email" value="{{ old('email') }}" required autocomplete="email">
                        </label>
                        <label class="auth-field">
                            <span>Mot de passe</span>
                            <input type="password" name="password" required autocomplete="current-password">
                        </label>
                        <label class="auth-check">
                            <input type="checkbox" name="remember" value="1"> Se souvenir de moi
                        </label>
                    @else
                        <label class="auth-field">
                            <span>Nom</span>
                            <input type="text" name="nom" value="{{ old('nom') }}" required>
                        </label>
                        <label class="auth-field">
                            <span>Prénom</span>
                            <input type="text" name="prenom" value="{{ old('prenom') }}" required>
                        </label>
                        <label class="auth-field">
                            <span>Adresse e-mail</span>
                            <input type="email" name="email" value="{{ old('email') }}" required autocomplete="email">
                        </label>
                        <label class="auth-field">
                            <span>Mot de passe</span>
                            <input type="password" name="password" required autocomplete="new-password" minlength="8">
                        </label>
                        <label class="auth-field">
                            <span>Confirmation</span>
                            <input type="password" name="password_confirmation" required autocomplete="new-password">
                        </label>
                    @endif

                    <button class="btn btn-primary" type="submit">{{ $submit }}</button>
                </form>

                <p class="auth-alt">
                    @if ($mode === 'login')
                        <a href="{{ route('register') }}">Créer un compte</a>
                    @else
                        <a href="{{ route('login') }}">J’ai déjà un compte</a>
                    @endif
                </p>
            </div>
        </div>
        <footer class="auth-footer">© {{ date('Y') }} République Gabonaise — MEDITRA</footer>
    </main>
</div>
`);

/* =============================== 4. Pages =================================== */

emit("resources/views/pages/home.blade.php", `@extends('layouts.public')

@section('title', 'MEDITRA — Médaille et Distinctions du Travail')
@section('description', 'MEDITRA — Médaille et Distinctions du Travail. Portail de dépôt, de suivi et d’attribution des médailles du travail de la République Gabonaise.')
`);

emit("resources/views/pages/auth/login.blade.php", `@extends('layouts.auth')

@section('title', 'Connexion — MEDITRA')
@section('description', 'Connexion au portail MEDITRA des Médailles et Distinctions du Travail.')

@section('auth-content')
    @include('components.auth-fallback', [
        'mode' => 'login',
        'title' => 'Connexion',
        'subtitle' => 'Accédez à votre espace MEDITRA.',
        'action' => route('login.store'),
        'submit' => 'Se connecter',
    ])
@endsection
`);

emit("resources/views/pages/auth/register.blade.php", `@extends('layouts.auth')

@section('title', 'Inscription — MEDITRA')
@section('description', 'Inscription au portail MEDITRA des Médailles et Distinctions du Travail.')

@section('body-class', 'mp-auth')

@section('auth-content')
    @include('components.auth-fallback', [
        'mode' => 'register',
        'title' => 'Créer un compte',
        'subtitle' => 'Un espace à votre mesure.',
        'action' => route('register.store'),
        'submit' => 'Créer mon compte',
    ])
@endsection
`);

for (const [code, view] of [["403", "forbidden"], ["404", "not-found"]]) {
  const title = code === "403" ? "Accès non autorisé" : "Page introuvable";
  const lead = code === "403"
    ? "Votre compte n’a pas accès à cet espace. Les droits sont vérifiés pour chaque page, côté serveur."
    : "L’adresse demandée ne correspond à aucune page du portail.";
  emit(`resources/views/pages/errors/${view}.blade.php`, `{{-- Page ${code} : rendue par Laravel (errors/${code}.blade.php peut aussi être utilisée). --}}
@extends('layouts.base')

@section('body-class', 'mp-home')
@section('site-kind', 'error')

@section('title', '${title} — MEDITRA')

@section('body')
    <main class="container mp-nf">
        <p class="page-eyebrow">Erreur ${code}</p>
        <h1>${title}</h1>
        <p class="page-sub">${lead}</p>
        <p>
            <a class="btn btn-primary" href="{{ route('home') }}">Revenir à l’accueil</a>
            <a class="btn btn-secondary" href="{{ route('login') }}">Se connecter</a>
        </p>
        <h2 class="card-title">Espaces du portail</h2>
        <ul class="mp-nf-list">
            @foreach (config('meditra.families') as $family => $conf)
                <li><a href="{{ route('workspace.' . $family . '.overview') }}">{{ $conf['label'] }}</a></li>
            @endforeach
        </ul>
    </main>
@endsection
`);
}

/* ============================ 5. Vues de profil ============================= */

for (const family of FAMILY_KEYS) {
  const conf = FAMILIES[family];
  for (const page of conf.pages) {
    const meta = configFamilies[family].pages[page];
    emit(`resources/views/profiles/${family}/${page}.blade.php`, `{{--
    ${conf.label} · ${meta.label}
    URL : ${meta.path}   Route : ${meta.route}
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', ${bladeStr(meta.title)})
@section('description', ${bladeStr(meta.description)})
@section('page-attrs', 'data-site-family="${family}" data-site-page="${page}"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => ${bladeStr(conf.label)},
        'title' => ${bladeStr(meta.label)},
        'subtitle' => ${bladeStr(meta.description)},
    ])

    @include('components.workspace-loading')
@endsection
`);
  }
}

/* ========================= 6. Routes et fichiers PHP ======================== */

const routeLines = [];
for (const family of FAMILY_KEYS) {
  const conf = FAMILIES[family];
  routeLines.push(`// ${conf.label} (${conf.roles.join(", ")})`);
  for (const page of conf.pages) {
    const meta = configFamilies[family].pages[page];
    routeLines.push(`Route::get('${meta.path}', [WorkspaceController::class, 'show'])`);
    routeLines.push(`    ->defaults('family', '${family}')`);
    routeLines.push(`    ->defaults('page', '${page}')`);
    routeLines.push(`    ->name('${meta.route}');`);
  }
  routeLines.push("");
}

emit("routes/web.php", `<?php

use App\\Http\\Controllers\\Auth\\LoginController;
use App\\Http\\Controllers\\Auth\\RegisterController;
use App\\Http\\Controllers\\DemoProfileController;
use App\\Http\\Controllers\\HomeController;
use App\\Http\\Controllers\\LegacyRedirectController;
use App\\Http\\Controllers\\WorkspaceController;
use Illuminate\\Support\\Facades\\Route;

/*
|--------------------------------------------------------------------------
| Routes web — MEDITRA
|--------------------------------------------------------------------------
|
| GÉNÉRÉ par tools/build-laravel.mjs. Les ${FAMILY_KEYS.length} familles et les
| ${FAMILY_KEYS.reduce((total, family) => total + FAMILIES[family].pages.length, 0)} pages métier reprennent exactement les URL du site multipage, sans
| barre finale (Laravel ignore la barre finale en correspondance).
|
| Correspondance complète : CORRESPONDANCE_URLS.md
|
*/

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/connexion', [LoginController::class, 'create'])->name('login');
Route::post('/connexion', [LoginController::class, 'store'])->name('login.store');
Route::post('/deconnexion', [LoginController::class, 'destroy'])->name('logout');

Route::get('/inscription', [RegisterController::class, 'create'])->name('register');
Route::post('/inscription', [RegisterController::class, 'store'])->name('register.store');

// Sélection d'un profil du jeu de démonstration (MEDITRA_DEMO=true uniquement).
Route::post('/demo/profil', DemoProfileController::class)->name('demo.profile');

// Anciennes URL de la SPA (#/app/<rôle>/<page>) et URL /app/... -> redirection.
Route::get('/app/{role}/{page?}', LegacyRedirectController::class)->name('legacy');

${routeLines.join("\n").trimEnd()}

/*
| Pages d'erreur : resources/views/errors/403.blade.php et 404.blade.php
| reprennent pages/errors/*.blade.php (Laravel les résout automatiquement).
*/
`);
emit("resources/views/errors/403.blade.php", readGenerated("pages/errors/forbidden.blade.php"));
emit("resources/views/errors/404.blade.php", readGenerated("pages/errors/not-found.blade.php"));

function readGenerated(file) {
  return fs.readFileSync(path.join(OUT, "resources/views", file), "utf8");
}

/* ======================= 6 bis. Correspondance des URL ====================== */

const legacyHash = (role, page) => `#/app/${role}/${page}`;
const rows = [];
rows.push("| Ancienne URL (SPA à hash) | URL du site multipage | Route Laravel | Nom de route | Vue Blade |");
rows.push("| --- | --- | --- | --- | --- |");
rows.push("| `#/` | `/` | `/` | `home` | `pages/home.blade.php` |");
rows.push("| `#/login` | `/connexion/` | `/connexion` | `login` | `pages/auth/login.blade.php` |");
rows.push("| `#/register` | `/inscription/` | `/inscription` | `register` | `pages/auth/register.blade.php` |");
for (const family of FAMILY_KEYS) {
  const conf = FAMILIES[family];
  for (const page of conf.pages) {
    const meta = configFamilies[family].pages[page];
    const hash = legacyHash(conf.roles[0], page);
    rows.push(`| \`${hash}\` | \`${meta.path}/\` | \`${meta.path}\` | \`${meta.route}\` | \`profiles/${family}/${page}.blade.php\` |`);
  }
}
const correspondence = `# Correspondance des URL, routes et vues

Table GÉNÉRÉE par \`tools/build-laravel.mjs\`. Toute ligne correspond à une page
réellement produite : le nombre de vues de profil est de ${FAMILY_KEYS.reduce((total, family) => total + FAMILIES[family].pages.length, 0)} et le nombre de routes métier de
${FAMILY_KEYS.reduce((total, family) => total + FAMILIES[family].pages.length, 0)}.

- Les URL sont **identiques** à celles du site multipage ; Laravel ignore la
  barre finale en correspondance, donc les deux formes fonctionnent.
- Le rôle n'apparaît jamais dans l'URL : il vient de la session Laravel
  (ou, en démonstration, de la session de présentation).
- Les URL \`/app/{role}/{page}\` (ancienne SPA) sont redirigées en 301 par
  \`LegacyRedirectController\`.

${rows.join("\n")}

## Routes non métier

| URL | Méthode | Nom | Contrôleur | Rôle |
| --- | --- | --- | --- | --- |
| \`/\` | GET | \`home\` | \`HomeController@index\` | accueil public |
| \`/connexion\` | GET | \`login\` | \`LoginController@create\` | formulaire de connexion |
| \`/connexion\` | POST | \`login.store\` | \`LoginController@store\` | authentification |
| \`/deconnexion\` | POST | \`logout\` | \`LoginController@destroy\` | fermeture de session (CSRF) |
| \`/inscription\` | GET | \`register\` | \`RegisterController@create\` | formulaire d'inscription |
| \`/inscription\` | POST | \`register.store\` | \`RegisterController@store\` | validation seule (voir INTEGRATION_BACKEND) |
| \`/demo/profil\` | POST | \`demo.profile\` | \`DemoProfileController\` | sélection du profil de démonstration |
| \`/app/{role}/{page?}\` | GET | \`legacy\` | \`LegacyRedirectController\` | redirection 301 des anciens favoris |

## Pages d'erreur

| Vue | Déclencheur |
| --- | --- |
| \`resources/views/errors/403.blade.php\` | \`abort(403)\` — rôle hors de la famille de la page |
| \`resources/views/errors/404.blade.php\` | route inexistante ou page inconnue |
`;
emit("CORRESPONDANCE_URLS.md", correspondence);

/* ============================ 7. Copie des assets =========================== */

function copyTree(source, target) {
  const from = path.join(ROOT, source);
  const to = path.join(OUT, target);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
}

copyTree("css", "public/css");
fs.rmSync(path.join(OUT, "public/css/theme.css"), { force: true }); // source Tailwind, non servie
copyTree("js", "public/js");
copyTree("assets", "public/assets");

/* ================================= Résumé =================================== */

const profileViews = FAMILY_KEYS.reduce((total, family) => total + FAMILIES[family].pages.length, 0);
console.log(`Laravel 12 — ${profileViews} vues de profil, ${written.length} fichiers générés.`);
console.log(`Sortie : ${path.relative(ROOT, OUT)}/`);
console.log(`Ressources copiées : public/css, public/js, public/assets`);
