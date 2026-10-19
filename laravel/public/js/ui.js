/* ==================================================================
   js/ui.js
   Bibliothèque de composants — conversion en JavaScript pur de :

     src/utils/cn.ts                              → cn()
     src/config/brand.ts + components/Emblem.tsx  → emblem()
     src/components/ui/Tricolor.tsx               → tricolor(), eyebrow()
     src/components/ui/Button.tsx                 → button()
     src/components/ui/Card.tsx                   → card()
     src/components/ui/TextField.tsx              → textField()
     src/components/Medal.tsx                     → medal()
     src/components/MedalGlyph.tsx                → medalGlyph()
     src/components/Ribbon.tsx                    → ribbon()
     src/components/landing/InstitutionalMotifs   → institutionalMotifs()
     src/components/landing/LandingBackdrop.tsx   → landingBackdrop()
     src/components/RoleTabs.tsx                  → roleTabs()
     src/components/TimelineStep.tsx              → timelineStep()
     src/components/StatCard.tsx                  → statCard() + animateStats()
     src/components/workspace/*.tsx               → workspaceCard(), cardHeader(),
                                                   statusBadge(), toneBadge(),
                                                   dataTable(), demoBanner(),
                                                   documentPreview(), modal()

   Chaque composant React retournait du JSX ; il retourne ici une
   chaîne HTML strictement équivalente (mêmes classes Tailwind, mêmes
   attributs ARIA, mêmes dégradés SVG).

   Les identifiants de dégradés SVG, générés par `useId()` côté React,
   le sont ici par un compteur global (`uid()`).
================================================================== */

/* ------------------------------------------------------------------
   Utilitaires
------------------------------------------------------------------ */

let __uid = 0;
/** Identifiant unique pour les <defs> SVG (remplace le `useId()` de React). */
function uid(prefix = "id") {
  __uid += 1;
  return `${prefix}-${__uid}`;
}

const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Échappe une chaîne destinée à un nœud de texte ou à un attribut. */
function esc(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"']/g, (character) => ESCAPE_MAP[character]);
}

/** `1` → `01` (utilisé par les compteurs « 01 / 03 » et « Étape 02 »). */
function pad2(value) {
  return String(value).padStart(2, "0");
}

/* --- Fusion de classes (remplace `clsx` + `tailwind-merge`) --- */

const DISPLAY_UTILITIES = new Set([
  "block", "inline-block", "inline", "flex", "inline-flex", "grid",
  "inline-grid", "hidden", "table", "table-row", "table-cell", "contents",
  "flow-root",
]);

const SIZE_TOKENS = new Set([
  "xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl",
]);

/**
 * Groupe de conflit d'une classe utilitaire.
 * Deux classes du même groupe (et du même préfixe de variante) ne peuvent
 * pas coexister : la dernière l'emporte, comme avec `tailwind-merge`.
 * @returns {string | null} null = classe sans conflit possible
 */
function conflictGroup(cls) {
  const parts = String(cls).split(":");
  const base = parts[parts.length - 1];
  const variants = parts.slice(0, -1).join(":");
  if (!base) return null;

  const negative = base.startsWith("-");
  const body = negative ? base.slice(1) : base;
  const dash = body.indexOf("-");
  const head = dash === -1 ? body : body.slice(0, dash);
  const value = dash === -1 ? "" : body.slice(dash + 1);

  let family = null;

  if (DISPLAY_UTILITIES.has(body)) {
    family = "display";
  } else if (head === "text") {
    // `text-sm` / `text-[1.9rem]` = taille ; `text-ink-900` = couleur.
    const isSize =
      SIZE_TOKENS.has(value) || /^\[(length:)?[\d.]+(rem|px|em|%)\]$/i.test(value);
    family = isSize ? "text-size" : "text-color";
  } else if (head === "border") {
    // `border`, `border-2` = épaisseur ; `border-line` = couleur.
    const isWidth = value === "" || /^(\d+|t|r|b|l|x|y)(-\d+)?$/.test(value);
    family = isWidth ? "border-width" : "border-color";
  } else if (head === "rounded") {
    family = "radius";
  } else if (head === "shadow") {
    family = "shadow";
  } else if (head === "opacity") {
    family = "opacity";
  } else if (["p", "px", "py", "pt", "pr", "pb", "pl"].includes(head)) {
    family = "padding:" + head;
  } else if (["m", "mx", "my", "mt", "mr", "mb", "ml"].includes(head)) {
    family = "margin:" + head;
  } else if (["w", "min-w", "max-w"].includes(head)) {
    family = "width:" + head;
  } else if (["h", "min-h", "max-h"].includes(head)) {
    family = "height:" + head;
  } else if (head === "size") {
    family = "size";
  } else if (["gap", "gap-x", "gap-y"].includes(head)) {
    family = "gap:" + head;
  } else if (["grid-cols", "grid-rows"].includes(head)) {
    family = head;
  } else if (["translate-x", "translate-y"].includes(head)) {
    family = "translate:" + head;
  } else {
    return null;
  }

  return (negative ? "-" : "") + (variants ? variants + "|" : "") + family;
}

/**
 * `p-*` écrase les paddings par axe, `size-*` écrase `w-*`/`h-*`, etc.
 * (règles de `tailwind-merge` utiles aux surcharges de `className`).
 */
const GROUP_OVERRIDES = {
  "padding:p": ["padding:px", "padding:py", "padding:pt", "padding:pr", "padding:pb", "padding:pl"],
  "padding:px": ["padding:pl", "padding:pr"],
  "padding:py": ["padding:pt", "padding:pb"],
  "margin:m": ["margin:mx", "margin:my", "margin:mt", "margin:mr", "margin:mb", "margin:ml"],
  "margin:mx": ["margin:ml", "margin:mr"],
  "margin:my": ["margin:mt", "margin:mb"],
  size: ["width:w", "height:h"],
  "gap:gap": ["gap:gap-x", "gap:gap-y"],
};

/**
 * Concatène des classes en résolvant les conflits (équivalent de `cn()`
 * avec clsx + tailwind-merge dans le projet React).
 * Les valeurs falsy sont ignorées, comme le faisait clsx.
 */
function cn(...inputs) {
  /** @type {string[]} */
  const classes = [];
  const push = (value) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(push);
      return;
    }
    if (typeof value === "object") {
      Object.keys(value).forEach((key) => value[key] && classes.push(key));
      return;
    }
    String(value)
      .split(/\s+/)
      .filter(Boolean)
      .forEach((cls) => classes.push(cls));
  };
  inputs.forEach(push);

  const kept = [];
  const seen = new Map(); // groupe → position dans `kept`

  classes.forEach((cls) => {
    const group = conflictGroup(cls);
    if (!group) {
      kept.push(cls);
      return;
    }
    const bare = group.includes("|") ? group.slice(group.indexOf("|") + 1) : group;
    const variantPrefix = group.includes("|") ? group.slice(0, group.indexOf("|")) : "";

    // La nouvelle classe écrase les précédentes du même groupe…
    if (seen.has(group)) kept[seen.get(group)] = null;
    // …ainsi que celles des groupes qu'elle englobe.
    (GROUP_OVERRIDES[bare] || []).forEach((subGroup) => {
      const key = variantPrefix + subGroup;
      if (seen.has(key)) kept[seen.get(key)] = null;
      seen.delete(key);
    });

    seen.set(group, kept.length);
    kept.push(cls);
  });

  return kept.filter(Boolean).join(" ");
}

/** Sérialise un objet d'attributs HTML. Les valeurs falsy sont ignorées. */
function attrs(attributes = {}) {
  return Object.keys(attributes)
    .filter((key) => {
      const value = attributes[key];
      return value !== false && value !== null && value !== undefined && value !== "";
    })
    .map((key) => {
      const value = attributes[key];
      if (value === true) return ` ${key}`;
      return ` ${key}="${esc(value)}"`;
    })
    .join("");
}

/* ------------------------------------------------------------------
   Emblem — src/components/Emblem.tsx
------------------------------------------------------------------ */

/**
 * Emblème de la République Gabonaise.
 * Si `OFFICIAL_EMBLEM_SRC` est renseigné (js/data.js), le fichier
 * officiel validé est affiché ; sinon un emplacement réservé discret
 * est rendu : sceau abstrait aux couleurs nationales, qui n'imite
 * volontairement aucun emblème institutionnel.
 */
function emblem({ size = 44, tone = "light", className = "" } = {}) {
  if (OFFICIAL_EMBLEM_SRC) {
    return `<img src="${esc(OFFICIAL_EMBLEM_SRC)}" width="${size}" height="${size}" alt="Emblème de la République Gabonaise" class="${cn("shrink-0 object-contain", className)}" />`;
  }

  const ringId = uid("ring");
  const clipId = uid("clip");
  const dark = tone === "dark";

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 48 48" role="img"
         aria-label="Emplacement réservé à l'emblème officiel de la République Gabonaise"
         class="${cn("shrink-0", className)}">
      <defs>
        <linearGradient id="${ringId}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FDEA99" />
          <stop offset="50%" stop-color="#E9B900" />
          <stop offset="100%" stop-color="#97720A" />
        </linearGradient>
        <clipPath id="${clipId}">
          <path d="M24 12.5 33 15.6v7.6c0 6-3.8 10.4-9 12.6-5.2-2.2-9-6.6-9-12.6v-7.6Z" />
        </clipPath>
      </defs>

      <circle cx="24" cy="24" r="23" fill="${dark ? "rgba(255,255,255,0.08)" : "#FFFFFF"}" />
      <circle cx="24" cy="24" r="22" fill="none" stroke="url(#${ringId})" stroke-width="1.6" />
      <circle cx="24" cy="24" r="18.6" fill="none"
              stroke="${dark ? "rgba(255,255,255,0.25)" : "#E5EAF0"}"
              stroke-width="0.8" stroke-dasharray="0.6 2.2" stroke-linecap="round" />

      <!-- Écu abstrait tricolore — emplacement réservé -->
      <g clip-path="url(#${clipId})">
        <rect x="14" y="12" width="20" height="8.2" fill="#009E60" />
        <rect x="14" y="20.2" width="20" height="7.6" fill="#FCD116" />
        <rect x="14" y="27.8" width="20" height="9" fill="#3A75C4" />
      </g>
      <path d="M24 12.5 33 15.6v7.6c0 6-3.8 10.4-9 12.6-5.2-2.2-9-6.6-9-12.6v-7.6Z"
            fill="none" stroke="url(#${ringId})" stroke-width="1.2" />
    </svg>`;
}

/* ------------------------------------------------------------------
   Marque MEDITRA — symbole médaille + ruban tricolore (pas un sceau d’État)
------------------------------------------------------------------ */

function meditraSymbolSvg(size = 40) {
  const n = Number(size) || 40;
  return `<svg class="md-symbol" width="${n}" height="${n}" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
    <path d="M18 2h4.1v13.2H18z" fill="#009E60"/>
    <path d="M22.1 2h3.8v13.2h-3.8z" fill="#FCD116"/>
    <path d="M25.9 2H30v13.2h-4.1z" fill="#3A75C4"/>
    <path d="M18 15.2 24 19.4 30 15.2v1.2L24 21 18 16.4z" fill="#102A50"/>
    <circle cx="24" cy="32.2" r="14.6" fill="#102A50"/>
    <circle cx="24" cy="32.2" r="12.2" stroke="#FCD116" stroke-width="1.5"/>
    <path d="M15.8 39.2V25.6L24 33.2l8.2-7.6v13.6" stroke="#FCD116" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function meditraBrand({ size = 40, sub = "Médaille et Distinctions du Travail", className = "" } = {}) {
  return `<span class="md-brand ${className}">
    ${meditraSymbolSvg(size)}
    <span class="md-brand-text">
      <span class="md-brand-name">MEDITRA</span>
      ${sub ? `<span class="md-brand-sub">${esc(sub)}</span>` : ""}
    </span>
  </span>`;
}

/* ------------------------------------------------------------------
   Tricolor / Eyebrow — src/components/ui/Tricolor.tsx
------------------------------------------------------------------ */

/** Liseré aux couleurs nationales (vert, jaune, bleu). */
function tricolor({ className = "", segment = 16, thickness = 3 } = {}) {
  return `<span class="${cn("inline-flex shrink-0 overflow-hidden rounded-full", className)}" style="height:${thickness}px" aria-hidden="true">
    <span class="h-full bg-republic-green-500" style="width:${segment}px"></span>
    <span class="h-full bg-gold-400" style="width:${segment}px"></span>
    <span class="h-full bg-republic-blue-500" style="width:${segment}px"></span>
  </span>`;
}

/** Sur-titre espacé suivi du liseré tricolore. */
function eyebrow(text, { className = "", tone = "light" } = {}) {
  return `<p class="${cn(
    "flex items-center gap-3 text-[0.6875rem] font-semibold tracking-[0.24em] uppercase",
    tone === "dark" ? "text-ink-100" : "text-ink-700",
    className
  )}">
    <span>${esc(text)}</span>
    ${tricolor({ segment: 14 })}
  </p>`;
}

/* ------------------------------------------------------------------
   Button — src/components/ui/Button.tsx
------------------------------------------------------------------ */

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-republic-green-500 " +
  "disabled:cursor-not-allowed disabled:opacity-55 select-none";

const BUTTON_VARIANTS = {
  primary:
    "bg-republic-green-500 text-white shadow-[0_1px_2px_rgba(0,104,63,0.25)] " +
    "hover:bg-republic-green-600 hover:shadow-[0_8px_20px_-10px_rgba(0,104,63,0.6)] " +
    "active:bg-republic-green-700",
  secondary:
    "border border-line-strong bg-white text-ink-800 hover:border-ink-300 hover:bg-canvas " +
    "active:bg-ink-50",
  outline:
    "border border-republic-blue-500/70 bg-white text-ink-900 hover:border-republic-blue-500 hover:bg-republic-blue-50 " +
    "active:bg-republic-blue-100",
  ghost: "text-ink-700 hover:bg-ink-50 active:bg-ink-100",
  onDark:
    "border border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/20 " +
    "active:bg-white/25",
};

const BUTTON_SIZES = {
  sm: "h-9 px-3.5 text-[0.8125rem]",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-[0.9375rem]",
};

const SPINNER_SVG = `
  <svg class="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.4" opacity="0.28" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
  </svg>`;

/**
 * Bouton (ou lien si `href` est fourni).
 * @param {{ variant?: string, size?: string, loading?: boolean, fullWidth?: boolean,
 *           className?: string, html?: string, href?: string,
 *           attrs?: Record<string, any> }} options
 */
function button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className = "",
  html = "",
  href = "",
  attrs: extraAttrs = {},
} = {}) {
  const classes = cn(
    BUTTON_BASE,
    BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary,
    BUTTON_SIZES[size] || BUTTON_SIZES.md,
    fullWidth && "w-full",
    className
  );
  const content = (loading ? SPINNER_SVG : "") + html;
  const isDisabled = loading || Boolean(extraAttrs.disabled);

  if (href) {
    return `<a href="${esc(href)}" class="${classes}"${attrs({
      "aria-disabled": isDisabled || undefined,
      ...extraAttrs,
    })}>${content}</a>`;
  }

  return `<button class="${classes}"${attrs({
    ...extraAttrs,
    type: extraAttrs.type || "button",
    disabled: isDisabled || undefined,
    "aria-busy": loading || undefined,
  })}>${content}</button>`;
}

/* ------------------------------------------------------------------
   Card — src/components/ui/Card.tsx
------------------------------------------------------------------ */

function card({ interactive = false, className = "", html = "", attrs: extraAttrs = {} } = {}) {
  return `<div class="${cn(
    "rounded-2xl border border-line bg-white",
    interactive && "transition-all duration-300 hover:-translate-y-1 hover:border-ink-100 hover:shadow-card",
    className
  )}"${attrs(extraAttrs)}>${html}</div>`;
}

/* ------------------------------------------------------------------
   TextField — src/components/ui/TextField.tsx
------------------------------------------------------------------ */

/**
 * Champ de saisie étiqueté, avec icône, indice et message d'erreur.
 * @param {{ id: string, label: string, hint?: string, error?: string, icon?: string,
 *           trailing?: string, className?: string, attrs?: Record<string, any> }} options
 */
function textField({
  id,
  label,
  hint = "",
  error = "",
  icon: iconName = "",
  trailing = "",
  className = "",
  attrs: inputAttrs = {},
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  const inputClasses = cn(
    "h-12 w-full rounded-xl border bg-white text-[0.9375rem] text-ink-900",
    "placeholder:text-slate-400 outline-none transition-all duration-200",
    "focus:ring-4",
    iconName ? "pl-11" : "pl-4",
    trailing ? "pr-12" : "pr-4",
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-line-strong hover:border-ink-300 focus:border-republic-green-500 focus:ring-republic-green-100/70",
    "disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted"
  );

  return `
    <div class="${cn("w-full", className)}">
      <label for="${esc(id)}" class="mb-1.5 block text-sm font-medium text-ink-800">${esc(label)}</label>
      <div class="relative">
        ${iconName ? `<span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">${icon(iconName, "size-[18px]")}</span>` : ""}
        <input id="${esc(id)}" class="${inputClasses}"${attrs({
          "aria-invalid": error ? "true" : undefined,
          "aria-describedby": describedBy,
          ...inputAttrs,
        })} />
        ${trailing ? `<div class="absolute right-1.5 top-1/2 -translate-y-1/2">${trailing}</div>` : ""}
      </div>
      ${hint && !error ? `<p id="${esc(id)}-hint" class="mt-1.5 text-xs leading-relaxed text-muted">${esc(hint)}</p>` : ""}
      ${error ? `<p id="${esc(id)}-error" class="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-red-600">${icon("alert", "mt-px size-3.5 shrink-0")}<span>${esc(error)}</span></p>` : ""}
    </div>`;
}

/* ------------------------------------------------------------------
   Medal — src/components/Medal.tsx
------------------------------------------------------------------ */

const MEDAL_METALS = {
  bronze: { dark: "#74401F", mid: "#CD7F32", light: "#F0B36D", name: "bronze" },
  argent: { dark: "#74808D", mid: "#C0C0C0", light: "#F7FAFC", name: "argent" },
  or: { dark: "#8C5D0A", mid: "#FFD700", light: "#FFF2A8", name: "or" },
};

const MEDAL_SIZE_CLASSES = {
  sm: "w-24 sm:w-28",
  md: "w-32 sm:w-40",
  lg: "w-56 sm:w-60 lg:w-[20rem]",
};

function starPoints(cx, cy, outer, inner, count) {
  return Array.from({ length: count * 2 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / count;
    const radius = index % 2 === 0 ? outer : inner;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(" ");
}

function gearPoints(cx, cy, outer, inner, count) {
  return starPoints(cx, cy, outer, inner, count);
}

/**
 * Médaille conceptuelle : elle n'imite aucun emblème officiel. Les textes
 * gravés et le médaillon abstrait servent uniquement à la maquette.
 * @param {{ type: "bronze"|"argent"|"or", size?: "sm"|"md"|"lg", showRibbon?: boolean,
 *           className?: string, label?: string }} options
 */
function medal({ type, size = "md", showRibbon = true, className = "", label = "" } = {}) {
  const key = uid("m");
  const metal = MEDAL_METALS[type] || MEDAL_METALS.bronze;
  const metalId = `metal-${key}`;
  const metalSheenId = `sheen-${key}`;
  const ribbonId = `ribbon-${key}`;
  const textArcId = `arc-${key}`;
  const shadowId = `shadow-${key}`;
  const text = type === "or" ? "HONNEUR ET MÉRITE" : "DISTINCTIONS NATIONALES";
  const accessible = label || `Médaille de ${metal.name}, représentation conceptuelle`;

  const weave = Array.from({ length: 18 }, (_, index) =>
    `<path d="M${86 + index * 5} 8l-${index * 0.7} 125" stroke="#FFFFFF" stroke-opacity="0.07" stroke-width="0.7" />`
  ).join("");

  return `
    <div class="${cn("medal-object relative shrink-0", MEDAL_SIZE_CLASSES[size] || MEDAL_SIZE_CLASSES.md, className)}">
      <svg viewBox="0 0 260 350" class="h-auto w-full overflow-visible" role="img" aria-label="${esc(accessible)}">
        <title>${esc(label || `Médaille de ${metal.name} — représentation conceptuelle`)}</title>
        <defs>
          <radialGradient id="${metalId}" cx="32%" cy="24%" r="78%">
            <stop offset="0" stop-color="${metal.light}" />
            <stop offset="0.28" stop-color="${metal.mid}" />
            <stop offset="0.68" stop-color="${metal.dark}" />
            <stop offset="1" stop-color="#281707" />
          </radialGradient>
          <linearGradient id="${metalSheenId}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.72" />
            <stop offset="0.35" stop-color="#FFFFFF" stop-opacity="0.08" />
            <stop offset="0.58" stop-color="#000000" stop-opacity="0.1" />
            <stop offset="1" stop-color="#FFFFFF" stop-opacity="0.2" />
          </linearGradient>
          <linearGradient id="${ribbonId}" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#001F31" stop-opacity="0.28" />
            <stop offset="0.22" stop-color="#FFFFFF" stop-opacity="0.2" />
            <stop offset="0.52" stop-color="#FFFFFF" stop-opacity="0.04" />
            <stop offset="0.8" stop-color="#001F31" stop-opacity="0.16" />
            <stop offset="1" stop-color="#FFFFFF" stop-opacity="0.1" />
          </linearGradient>
          <filter id="${shadowId}" x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="#102A50" flood-opacity="0.24" />
          </filter>
          <path id="${textArcId}" d="M 60 224 A 70 70 0 0 1 200 224" fill="none" />
        </defs>

        ${
          showRibbon
            ? `<g>
                <path d="M82 6h96l-13 112-35 38-35-38Z" fill="#009E60" />
                <path d="M82 6h96l-7 57H89Z" fill="#009E60" />
                <path d="M89 63h82l-6 54-35 39-35-39Z" fill="#FCD116" />
                <path d="M95 117h70l-6 1-29 38-29-38Z" fill="#3A75C4" />
                <path d="M82 6h96l-13 112-35 38-35-38Z" fill="url(#${ribbonId})" />
                <path d="M82 6h96l-13 112-35 38-35-38Z" fill="none" stroke="#FFFFFF" stroke-opacity="0.32" stroke-width="1.2" />
                <path d="M86 10h88M89 63h82M95 117h70" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="1" />
                ${weave}
              </g>`
            : ""
        }

        <g transform="translate(0 6)" filter="url(#${shadowId})">
          <circle cx="130" cy="222" r="95" fill="#F8FAFC" fill-opacity="0.7" />
          <polygon points="${gearPoints(130, 222, 99, 86, 28)}" fill="url(#${metalId})" stroke="${metal.dark}" stroke-width="2" />
          <polygon points="${gearPoints(130, 222, 91, 86, 28)}" fill="url(#${metalSheenId})" opacity="0.62" />
          <circle cx="130" cy="222" r="82" fill="url(#${metalId})" stroke="${metal.light}" stroke-opacity="0.65" stroke-width="2" />
          <circle cx="130" cy="222" r="75" fill="none" stroke="${metal.dark}" stroke-opacity="0.65" stroke-width="3" stroke-dasharray="1 5" stroke-linecap="round" />
          <circle cx="130" cy="222" r="69" fill="none" stroke="${metal.light}" stroke-opacity="0.5" stroke-width="1.1" />

          <!-- Lauriers abstraits -->
          <g fill="none" stroke="${metal.light}" stroke-opacity="0.72" stroke-width="2" stroke-linecap="round">
            <path d="M77 253c-18-22-20-48-9-72" />
            <path d="M183 253c18-22 20-48 9-72" />
          </g>
          <g fill="${metal.light}" fill-opacity="0.58">
            <ellipse cx="71" cy="239" rx="5" ry="2.2" transform="rotate(35 71 239)" />
            <ellipse cx="66" cy="225" rx="5" ry="2.2" transform="rotate(18 66 225)" />
            <ellipse cx="65" cy="211" rx="5" ry="2.2" transform="rotate(-8 65 211)" />
            <ellipse cx="69" cy="196" rx="5" ry="2.2" transform="rotate(-28 69 196)" />
            <ellipse cx="189" cy="239" rx="5" ry="2.2" transform="rotate(-35 189 239)" />
            <ellipse cx="194" cy="225" rx="5" ry="2.2" transform="rotate(-18 194 225)" />
            <ellipse cx="195" cy="211" rx="5" ry="2.2" transform="rotate(8 195 211)" />
            <ellipse cx="191" cy="196" rx="5" ry="2.2" transform="rotate(28 191 196)" />
          </g>

          <text fill="${metal.light}" font-size="7.2" font-weight="700" letter-spacing="1.3">
            <textPath href="#${textArcId}" startOffset="50%" text-anchor="middle">${esc(text)}</textPath>
          </text>

          <circle cx="130" cy="222" r="42" fill="#F8FAFC" fill-opacity="0.9" stroke="${metal.light}" stroke-width="2" />
          <polygon points="${starPoints(130, 222, 32, 14, 12)}" fill="url(#${metalId})" stroke="${metal.dark}" stroke-width="1.2" />
          <circle cx="130" cy="222" r="14" fill="#009E60" />
          <path d="M130 209v26M117 222h26" stroke="#FCD116" stroke-width="2" stroke-opacity="0.9" />
          <path d="M130 211 134 218 142 222 134 226 130 233 126 226 118 222 126 218Z" fill="#3A75C4" fill-opacity="0.9" />

          <text x="130" y="278" text-anchor="middle" fill="${metal.light}" font-size="6.5" font-weight="700" letter-spacing="1.1">HONNEUR ET MÉRITE</text>
          <path d="M92 290h76" stroke="${metal.light}" stroke-opacity="0.55" stroke-width="1" />
        </g>

        ${
          showRibbon
            ? `<g>
                <rect x="111" y="143" width="38" height="14" rx="6" fill="url(#${metalId})" stroke="${metal.dark}" stroke-width="1.2" />
                <circle cx="130" cy="161" r="13" fill="none" stroke="${metal.mid}" stroke-width="5" />
              </g>`
            : ""
        }
      </svg>
    </div>`;
}

/* ------------------------------------------------------------------
   MedalGlyph — src/components/MedalGlyph.tsx
   (composant présent dans le projet d'origine mais non utilisé par les
   pages ; il est conservé ici à l'identique pour rester réutilisable)
------------------------------------------------------------------ */

const MEDAL_GLYPH_METALS = {
  bronze: { base: "#7A4A22", mid: "#B9743C", light: "#E4A870", rim: "#5C3718", label: "Bronze" },
  argent: { base: "#7F8C9A", mid: "#C3CEDA", light: "#F3F7FB", rim: "#5E6B7A", label: "Argent" },
  or: { base: "#9A6C12", mid: "#D9A62F", light: "#FBDE84", rim: "#7A550E", label: "Or" },
};

/**
 * Représentation conceptuelle d'une décoration nationale (maquette) :
 * ruban aux couleurs du Gabon, bélière, médaillon métallique et reliefs.
 * Ces visuels n'imitent aucune décoration officielle existante.
 */
function medalGlyph({ tone, className = "", title = "" } = {}) {
  const key = uid("g");
  const metal = MEDAL_GLYPH_METALS[tone] || MEDAL_GLYPH_METALS.bronze;
  const gradId = `metal-${key}`;
  const sheenId = `sheen-${key}`;
  const ribbonGradId = `ribbon-${key}`;

  const ribbonColors = ["#009E60", "#FCD116", "#3A75C4"];
  // Ruban effilé : bord supérieur de 32 unités, bord inférieur de 20 unités.
  const ribbonTop = [44, 54.67, 65.33, 76];
  const ribbonBottom = [50, 56.67, 63.33, 70];

  const stripes = ribbonColors
    .map((color, index) => {
      const topX = ribbonTop[index];
      const topW = ribbonTop[index + 1] - topX;
      return `<path d="M${topX} 6h${topW}L${ribbonBottom[index + 1]} 66H${ribbonBottom[index]}Z" fill="${color}" />`;
    })
    .join("");

  const weave = Array.from({ length: 13 })
    .map((_, index) => {
      const x = 44 + index * (32 / 12);
      const xb = 50 + (x - 60) * 0.625;
      return `<line x1="${x}" y1="6" x2="${xb}" y2="66" />`;
    })
    .join("");

  const rays = Array.from({ length: 24 })
    .map((_, index) => {
      const angle = (index * Math.PI * 2) / 24;
      const inner = 27;
      const outer = 33.5;
      return `<line x1="${60 + Math.cos(angle) * inner}" y1="${130 + Math.sin(angle) * inner}" x2="${60 + Math.cos(angle) * outer}" y2="${130 + Math.sin(angle) * outer}" />`;
    })
    .join("");

  return `
    <svg viewBox="0 0 120 190" class="${cn("h-auto w-full", className)}" role="img"
         aria-label="Médaille de ${esc(metal.label.toLowerCase())} — représentation conceptuelle">
      ${title ? `<title>${esc(title)}</title>` : ""}
      <defs>
        <linearGradient id="${ribbonGradId}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#000" stop-opacity="0.16" />
          <stop offset="18%" stop-color="#fff" stop-opacity="0.14" />
          <stop offset="55%" stop-color="#000" stop-opacity="0.04" />
          <stop offset="100%" stop-color="#000" stop-opacity="0.2" />
        </linearGradient>
        <linearGradient id="${gradId}" x1="0.15" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stop-color="${metal.light}" />
          <stop offset="38%" stop-color="${metal.mid}" />
          <stop offset="62%" stop-color="${metal.base}" />
          <stop offset="100%" stop-color="${metal.rim}" />
        </linearGradient>
        <radialGradient id="${sheenId}" cx="0.32" cy="0.26" r="0.72">
          <stop offset="0%" stop-color="#fff" stop-opacity="0.85" />
          <stop offset="45%" stop-color="#fff" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#000" stop-opacity="0.12" />
        </radialGradient>
      </defs>

      <g>
        <path d="M44 6h32l-6 60H50Z" fill="#fff" />
        ${stripes}
        <path d="M44 6h32l-6 60H50Z" fill="url(#${ribbonGradId})" />
        <g stroke="#000" stroke-opacity="0.08" stroke-width="0.7">${weave}</g>
        <path d="M44 6h32l-6 60H50Z" fill="none" stroke="#000" stroke-opacity="0.12" stroke-width="0.6" />
      </g>

      <rect x="42" y="60" width="36" height="9" rx="4" fill="url(#${gradId})" />
      <rect x="42" y="60" width="36" height="9" rx="4" fill="none" stroke="${metal.rim}" stroke-opacity="0.5" stroke-width="0.8" />
      <path d="M60 69c-6.2 0-11.2 5-11.2 11.2S53.8 91.4 60 91.4s11.2-5 11.2-11.2" fill="none" stroke="url(#${gradId})" stroke-width="4.4" />

      <circle cx="60" cy="130" r="42" fill="url(#${gradId})" stroke="${metal.rim}" stroke-opacity="0.55" stroke-width="1.4" />
      <circle cx="60" cy="130" r="42" fill="url(#${sheenId})" pointer-events="none" />
      <circle cx="60" cy="130" r="36" fill="none" stroke="${metal.light}" stroke-opacity="0.65" stroke-width="1.1" stroke-dasharray="0.4 2.6" stroke-linecap="round" />
      <g stroke="${metal.rim}" stroke-opacity="0.35" stroke-width="1" stroke-linecap="round">${rays}</g>
      <path d="M39 152c-5-11-5-24 0-35" fill="none" stroke="${metal.base}" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" />
      <path d="M81 152c5-11 5-24 0-35" fill="none" stroke="${metal.rim}" stroke-opacity="0.45" stroke-width="2" stroke-linecap="round" />

      <circle cx="60" cy="130" r="20" fill="#F8FAFC" fill-opacity="0.92" />
      <circle cx="60" cy="130" r="20" fill="none" stroke="${metal.mid}" stroke-opacity="0.8" stroke-width="1.2" />
      <path d="M60 111.5a18.5 18.5 0 0 0-18.5 18.5h37A18.5 18.5 0 0 0 60 111.5Z" fill="#3A75C4" />
      <path d="M60 111.5a18.5 18.5 0 0 1 18.5 18.5h-6.2A12.3 12.3 0 0 0 60 117.7Z" fill="#009E60" />
      <circle cx="60" cy="130" r="6.4" fill="#FCD116" stroke="${metal.rim}" stroke-opacity="0.4" stroke-width="0.8" />
      <circle cx="57.6" cy="127.4" r="2" fill="#fff" fill-opacity="0.75" />
    </svg>`;
}

/* ------------------------------------------------------------------
   Ribbon — src/components/Ribbon.tsx
------------------------------------------------------------------ */

/** Ruban conceptuel aux couleurs du Gabon, avec un léger effet tissu. */
function ribbon({ className = "", compact = false } = {}) {
  const id = uid("rb");
  const width = compact ? 78 : 112;
  const height = compact ? 112 : 158;
  const outline = "M18 4h76l-9 113-29 30-29-30Z";

  return `
    <svg viewBox="0 0 112 158" width="${width}" height="${height}" class="${cn("overflow-visible", className)}"
         role="img" aria-label="Ruban conceptuel aux couleurs du Gabon">
      <defs>
        <linearGradient id="ribbon-shine-${id}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#071f32" stop-opacity="0.2" />
          <stop offset="0.22" stop-color="#FFFFFF" stop-opacity="0.2" />
          <stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0.04" />
          <stop offset="0.8" stop-color="#001c32" stop-opacity="0.16" />
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0.12" />
        </linearGradient>
        <pattern id="ribbon-weave-${id}" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 0 4 4M4 0 0 4" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="0.45" />
        </pattern>
      </defs>
      <path d="${outline}" fill="#009E60" />
      <path d="M18 4h76L88 59H24Z" fill="#009E60" />
      <path d="M24 59h64l-4 53-28 29-28-29Z" fill="#FCD116" />
      <path d="M28 112h56l-4 5-24 30-24-30Z" fill="#3A75C4" />
      <path d="${outline}" fill="url(#ribbon-shine-${id})" />
      <path d="${outline}" fill="url(#ribbon-weave-${id})" opacity="0.55" />
      <path d="${outline}" fill="none" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1" />
      <path d="M24 59h64M28 112h56" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="0.8" />
    </svg>`;
}

/* ------------------------------------------------------------------
   InstitutionalMotifs — src/components/landing/InstitutionalMotifs.tsx
------------------------------------------------------------------ */

const MOTIF_TONES = { blue: "#3A75C4", green: "#009E60", neutral: "#64748B" };

function nationalCurves(opacity = 0.22) {
  return `<g fill="none" stroke-linecap="round">
    <path d="M-20 260C100 178 185 328 318 238S514 194 590 237" stroke="#009E60" stroke-opacity="${opacity}" stroke-width="2" />
    <path d="M-16 271C106 189 190 339 322 249S518 205 594 248" stroke="#FCD116" stroke-opacity="${opacity + 0.04}" stroke-width="2" />
    <path d="M-12 282C112 200 196 350 328 260S522 216 598 259" stroke="#3A75C4" stroke-opacity="${opacity}" stroke-width="2" />
  </g>`;
}

function mapMotif(stroke) {
  return `<g transform="translate(112 20) scale(.78)" fill="none" stroke="${stroke}" stroke-opacity="0.14" stroke-width="2.2" stroke-linejoin="round">
      <path d="M214 25 276 30l20 24 44 4 20 35-7 31 21 39-12 43 12 36-28 31-7 45-35 29-40 4-24 30-47-5-33-31-45-13-16-38-37-24-7-46-29-35 20-38-4-45 30-29 15-42 46-6 30-28Z" />
      <path d="M80 195c24 8 43 25 54 47M107 94c36 22 54 55 56 97M178 52c-11 70-4 134 19 193M158 326c54-29 98-29 154-6" stroke-opacity="0.07" stroke-width="1.2" />
      <circle cx="132" cy="154" r="4" fill="${stroke}" fill-opacity="0.12" stroke="none" />
    </g>${nationalCurves(0.18)}`;
}

function architectureMotif(stroke) {
  return `<g stroke="${stroke}" stroke-opacity="0.1" stroke-width="1.35" fill="none">
      <path d="M42 365h440M72 348h380" />
      <path d="M122 348V170h38v178M180 348V144h38v204M238 348V170h38v178M296 348V144h38v204M354 348V170h38v178" />
      <path d="M101 170h292M98 154h298M144 142c4-44 45-73 86-73s82 29 86 73" />
      <path d="M210 69c4-23 25-41 50-41s46 18 50 41M238 28v-14M282 28v-14M238 14h44" />
      <path d="M206 348V244h68v104M223 348V264h34v84" />
    </g>${nationalCurves(0.13)}`;
}

function botanicalMotif(stroke) {
  return `<g fill="none" stroke="${stroke}" stroke-opacity="0.11" stroke-width="1.25" stroke-linecap="round">
      <path d="M78 402c4-126 67-244 174-330M158 328c-7-67 8-136 50-197M250 378c46-99 113-168 211-224M346 332c16-56 49-102 102-139" />
      <path d="M113 318c-54-20-72-60-74-103 48 11 78 41 82 86M148 253c-39-33-44-72-34-107 39 21 57 55 48 93M185 184c-20-37-12-71 7-98 27 27 32 58 13 87" />
      <path d="M282 319c11-50 43-81 85-98-2 46-26 80-69 98M331 253c22-43 57-64 98-68-12 42-40 70-83 76M383 202c24-34 55-48 90-44-15 34-44 54-80 55" />
      <path d="M74 401c81-27 159-27 235 0M238 405c82-31 165-29 248 5" />
    </g>${nationalCurves(0.11)}`;
}

function panoramaMotif(stroke) {
  return `<g fill="none" stroke="${stroke}" stroke-opacity="0.1" stroke-width="1.2">
      <path d="M0 345c62-25 121-20 177 6 52-36 112-41 181-14 54-21 108-21 162 2" />
      <path d="M15 348v-55h44v52M73 348v-82h62v80M151 351v-45h50v42M371 346v-70h49v69M436 346v-48h58v50" />
      <path d="M274 348V146M255 348h38M263 146h22M269 146V78h10v68M267 78l7-42 7 42M257 205h34M260 253h28" />
      <path d="M0 376c85-18 166-16 244 5s169 21 276-3" />
    </g>
    <g stroke="#64748B" stroke-opacity="0.08" fill="none">
      <path d="M18 354c20-20 23-47 10-68 22 10 35 29 37 50 8-17 21-31 41-39-4 24-19 43-40 54M471 354c-17-17-20-39-9-58-18 9-30 24-32 42-7-15-18-26-34-34 3 20 16 36 34 46" />
    </g>${nationalCurves(0.12)}`;
}

function curvesWithLandmark(stroke) {
  return `${nationalCurves(0.2)}
    <g transform="translate(404 62)" fill="none" stroke="${stroke}" stroke-opacity="0.09" stroke-width="1.15">
      <path d="M44 290V104M29 290h30M33 104h22M38 104V45h12v59M40 45l4-30 4 30M34 147h20M31 195h26M25 290c8-22 12-45 13-70M63 290c-8-22-12-45-13-70" />
      <circle cx="44" cy="10" r="8" />
      <path d="M7 291h84" />
    </g>
    <g transform="translate(48 205)" fill="none" stroke="#64748B" stroke-opacity="0.07" stroke-width="1">
      <path d="M0 146C5 96 8 53 4 14M4 16c-24-8-43 0-60 18M4 16c23-14 44-13 62 1M4 16c-14-23-32-31-53-29M4 16c14-25 34-37 57-36" />
    </g>`;
}

const MOTIF_RENDERERS = {
  map: mapMotif,
  architecture: architectureMotif,
  botanical: botanicalMotif,
  panorama: panoramaMotif,
  curves: curvesWithLandmark,
};

/** Motifs décoratifs institutionnels (fonds de section). */
function institutionalMotifs({ className = "", tone = "blue", variant = "architecture" } = {}) {
  const stroke = MOTIF_TONES[tone] || MOTIF_TONES.blue;
  const renderer = MOTIF_RENDERERS[variant] || architectureMotif;
  return `<svg viewBox="0 0 520 420" fill="none" class="${cn("pointer-events-none select-none", className)}" aria-hidden="true">${renderer(stroke)}</svg>`;
}

/* ------------------------------------------------------------------
   LandingBackdrop — src/components/landing/LandingBackdrop.tsx
------------------------------------------------------------------ */

function tricolorWaves(position) {
  const y = position === "top" ? 70 : 780;
  const direction = position === "top" ? 1 : -1;
  const wave = (offset, color, opacity) =>
    `<path d="M-30 ${y + offset * direction}C160 ${y + (offset + 125) * direction} 260 ${y + (offset - 70) * direction} 470 ${y + (offset + 20) * direction}S820 ${y + (offset + 90) * direction} 1040 ${y + (offset - 5) * direction} 1390 ${y + (offset + 80) * direction} 1660 ${y + (offset - 15) * direction}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.7" />`;
  return `<g fill="none" stroke-linecap="round">
    ${wave(0, "#009E60", "0.24")}
    ${wave(12, "#FCD116", "0.32")}
    ${wave(24, "#3A75C4", "0.24")}
  </g>`;
}

function gabonOutline() {
  return `<g transform="translate(22 158) scale(.62)" fill="none" stroke="#3A75C4" stroke-opacity="0.18" stroke-width="2.1" stroke-linejoin="round">
    <path d="M214 25 276 30l20 24 44 4 20 35-7 31 21 39-12 43 12 36-28 31-7 45-35 29-40 4-24 30-47-5-33-31-45-13-16-38-37-24-7-46-29-35 20-38-4-45 30-29 15-42 46-6 30-28Z" />
    <path d="M80 195c24 8 43 25 54 47M107 94c36 22 54 55 56 97M178 52c-11 70-4 134 19 193M158 326c54-29 98-29 154-6" stroke-opacity="0.07" stroke-width="1" />
  </g>`;
}

function monument() {
  return `<g transform="translate(1360 185)" fill="none" stroke="#3A75C4" stroke-opacity="0.11" stroke-width="1.2">
    <path d="M72 535V187M44 535h56M52 187h40M61 187V80h22v107M64 80 72 24l8 56M60 123h25M50 264h44M47 344h50M38 535c13-35 21-76 22-122M106 535c-13-35-21-76-22-122" />
    <circle cx="72" cy="17" r="14" />
    <path d="M52 205h40M44 535h56" />
  </g>`;
}

function palm({ x, y, scale = 1, flip = false }) {
  return `<g transform="translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})" fill="none" stroke="#64748B" stroke-opacity="0.09" stroke-width="1.2" stroke-linecap="round">
    <path d="M0 210C9 139 15 83 8 22" />
    <path d="M8 25C-27 17-52 29-72 52M8 25C39 6 67 8 92 25M8 25C-12-7-38-18-69-14M8 25C28-10 56-26 88-25M8 25C4-10 13-38 34-62M8 25C-4-12-21-37-48-52" />
    <path d="M-70 52c22-8 43-9 64-2M91 25c-27 4-50 13-69 29M-68-14c22 8 40 20 53 38M87-25C60-12 40 5 25 29M34-62C17-36 10-9 9 18M-48-52c25 18 42 41 52 69" />
  </g>`;
}

function backdropArchitecture() {
  return `<g transform="translate(1040 475)" fill="none" stroke="#3A75C4" stroke-opacity="0.075" stroke-width="1.1">
    <path d="M0 245h500M32 226h431M62 226V105h50v121M132 226V72h50v154M202 226V105h50v121M272 226V72h50v154M342 226V105h50v121" />
    <path d="M42 105h360M39 89h366M98 78c7-49 53-78 95-78s88 29 95 78" />
    <path d="M173 226v-74h52v74M187 226v-57h24v57" />
  </g>`;
}

const BACKDROP_SCENES = {
  hero: () =>
    tricolorWaves("top") + tricolorWaves("bottom") + gabonOutline() + monument() +
    palm({ x: 80, y: 645, scale: 1.15 }) + palm({ x: 1550, y: 630, scale: 0.9, flip: true }) +
    backdropArchitecture(),
  process: () =>
    palm({ x: 50, y: 560, scale: 1.2 }) + palm({ x: 1560, y: 590, scale: 0.85, flip: true }) +
    backdropArchitecture() + tricolorWaves("bottom"),
  medals: () => gabonOutline() + tricolorWaves("top") + palm({ x: 1520, y: 620, scale: 0.8, flip: true }),
  values: () =>
    palm({ x: 80, y: 610, scale: 1.1 }) + palm({ x: 1510, y: 620, scale: 1, flip: true }) +
    backdropArchitecture() + tricolorWaves("bottom"),
  footer: () => tricolorWaves("top") + backdropArchitecture() + palm({ x: 60, y: 625, scale: 0.9 }),
};

function landingBackdrop({ scene, className = "" } = {}) {
  const renderer = BACKDROP_SCENES[scene];
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" class="${cn("pointer-events-none select-none", className)}" aria-hidden="true">${renderer ? renderer() : ""}</svg>`;
}

/* ------------------------------------------------------------------
   RoleTabs — src/components/RoleTabs.tsx
------------------------------------------------------------------ */

/**
 * Sélecteur « Entreprise / Administration ».
 * Le changement d'onglet passe par `data-action="login-space"`.
 */
function roleTabs({ value, disabled = false }) {
  const tabs = [
    { value: "entreprise", label: "Entreprise", icon: "building" },
    { value: "administration", label: "Administration", icon: "user" },
  ];

  return `<div class="grid grid-cols-2 rounded-xl border border-line bg-canvas p-1" role="tablist" aria-label="Type de compte">
    ${tabs
      .map((tab) => {
        const active = tab.value === value;
        return `<button type="button" role="tab" aria-selected="${active}"${attrs({ disabled: disabled || undefined })}
          data-action="login-space" data-space="${tab.value}"
          class="${cn(
            "flex h-10 items-center justify-center gap-2 rounded-lg text-[0.8125rem] font-medium transition-all duration-200",
            active ? "bg-white text-ink-900 shadow-[0_1px_2px_rgba(16,42,80,0.08)]" : "text-muted hover:text-ink-800",
            disabled && "cursor-not-allowed opacity-60"
          )}">
          ${icon(tab.icon, cn("size-4", active && "text-republic-green-600"))}
          ${esc(tab.label)}
        </button>`;
      })
      .join("")}
  </div>`;
}

/* ------------------------------------------------------------------
   TimelineStep — src/components/TimelineStep.tsx
------------------------------------------------------------------ */

function timelineStep({ index, icon: iconName, title, description, last = false }) {
  return `
    <li class="relative flex gap-4 lg:block lg:flex-1 lg:text-center">
      ${
        !last
          ? '<span class="absolute top-12 left-5 h-[calc(100%+1.5rem)] w-px bg-line-strong lg:top-6 lg:left-[calc(50%+2.2rem)] lg:h-px lg:w-[calc(100%-4.4rem)]" aria-hidden="true"></span>'
          : ""
      }
      <span class="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-republic-green-200 bg-white text-republic-green-600 shadow-[0_0_0_5px_rgba(0,158,96,0.07)] lg:mx-auto">
        ${icon(iconName, "size-[18px]")}
      </span>
      <div class="pb-6 lg:pt-5 lg:pb-0 lg:px-2">
        <p class="text-[0.6875rem] font-bold tracking-[0.16em] text-republic-green-600 uppercase">Étape ${pad2(index)}</p>
        <h3 class="mt-1.5 text-[0.9375rem] font-semibold leading-snug text-ink-900">${esc(title)}</h3>
        <p class="mt-2 text-[0.8125rem] leading-relaxed text-muted">${esc(description)}</p>
      </div>
    </li>`;
}

/* ------------------------------------------------------------------
   StatCard — src/components/StatCard.tsx
------------------------------------------------------------------ */

const STAT_ACCENTS = {
  green: "bg-republic-green-50 text-republic-green-600",
  gold: "bg-gold-100 text-gold-700",
  blue: "bg-republic-blue-50 text-republic-blue-600",
};

/**
 * Carte de statistique. Le compteur est animé au scroll par
 * `animateStats()` (équivalent de l'IntersectionObserver React).
 */
function statCard({ value, suffix = "", label, detail, icon: iconName, accent }) {
  return `
    <div class="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/[0.06] p-4"
         data-stat-card data-value="${value}" data-suffix="${esc(suffix)}">
      <span class="${cn("flex size-10 shrink-0 items-center justify-center rounded-xl", STAT_ACCENTS[accent])}">
        ${icon(iconName, "size-[19px]")}
      </span>
      <div>
        <p class="text-[1.6rem] font-semibold tracking-[-0.03em] text-white" data-stat-value>0${esc(suffix)}</p>
        <p class="mt-0.5 text-[0.82rem] font-medium text-white">${esc(label)}</p>
        <p class="mt-0.5 text-[0.72rem] leading-relaxed text-ink-100/65">${esc(detail)}</p>
      </div>
    </div>`;
}

/**
 * Anime les compteurs `[data-stat-card]` présents dans `root` dès qu'ils
 * entrent dans le viewport (comportement identique au composant React :
 * même easing cubique, même durée de 1050 ms, même respect de
 * `prefers-reduced-motion`).
 */
function animateStats(root = document) {
  const cards = Array.from(root.querySelectorAll("[data-stat-card]"));
  if (!cards.length) return () => {};

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        if (card.dataset.statDone === "1") return;
        card.dataset.statDone = "1";
        observer.unobserve(card);

        const value = Number(card.dataset.value || 0);
        const suffix = card.dataset.suffix || "";
        const output = card.querySelector("[data-stat-value]");
        if (!output) return;

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) {
          output.textContent = value.toLocaleString("fr-FR") + suffix;
          return;
        }

        const start = performance.now();
        const duration = 1050;
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          output.textContent = Math.round(value * eased).toLocaleString("fr-FR") + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.35 }
  );

  cards.forEach((card) => observer.observe(card));
  return () => observer.disconnect();
}

/* ------------------------------------------------------------------
   Espace connecté — src/components/workspace/*.tsx
------------------------------------------------------------------ */

function workspaceCard({ className = "", html = "", attrs: extraAttrs = {} } = {}) {
  return `<div class="${cn(
    "rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(16,42,80,0.025)]",
    className
  )}"${attrs(extraAttrs)}>${html}</div>`;
}

function cardHeader({ eyebrow: eyebrowText = "", title, action = "" }) {
  return `
    <div class="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
      <div>
        ${eyebrowText ? `<p class="text-[0.625rem] font-bold tracking-[0.16em] text-muted uppercase">${esc(eyebrowText)}</p>` : ""}
        <h2 class="mt-1 text-[0.95rem] font-semibold text-ink-900">${esc(title)}</h2>
      </div>
      ${action}
    </div>`;
}

const STATUS_TONES = {
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  info: "border-republic-blue-200 bg-republic-blue-50 text-republic-blue-700",
  warning: "border-gold-200 bg-gold-50 text-gold-800",
  success: "border-republic-green-200 bg-republic-green-50 text-republic-green-700",
  danger: "border-red-200 bg-red-50 text-red-700",
};

/** @param {{label: string, tone: string}} status */
function statusBadge(status, dot = true) {
  return `<span class="${cn(
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold",
    STATUS_TONES[status.tone] || STATUS_TONES.neutral
  )}">
    ${dot ? '<span class="size-1.5 rounded-full bg-current" aria-hidden="true"></span>' : ""}
    ${esc(status.label)}
  </span>`;
}

function toneBadge(label, tone) {
  return statusBadge({ label, tone });
}

/**
 * Tableau de données — src/components/workspace/DataTable.tsx
 * @param {{ columns: {key:string,label:string,render:(row:any)=>string,className?:string}[],
 *           rows: any[], rowKey: (row:any)=>string, empty?: string }} options
 */
function dataTable({ columns, rows, rowKey, empty = "Aucun élément à afficher." }) {
  const head = columns
    .map(
      (column) =>
        `<th class="${cn(
          "border-b border-line px-5 py-3 text-[0.625rem] font-bold tracking-[0.12em] text-muted uppercase",
          column.className
        )}">${esc(column.label)}</th>`
    )
    .join("");

  const body = rows.length
    ? rows
        .map(
          (row) =>
            `<tr class="group transition-colors hover:bg-canvas/70">
              ${columns
                .map(
                  (column) =>
                    `<td class="${cn(
                      "px-5 py-4 align-middle text-[0.8125rem] text-ink-700",
                      column.className
                    )}">${column.render(row)}</td>`
                )
                .join("")}
            </tr>`
        )
        .join("")
    : `<tr><td colspan="${columns.length}" class="px-5 py-14 text-center text-sm text-muted">${icon("folder", "mx-auto mb-2 size-6 text-ink-300")}${esc(empty)}</td></tr>`;

  const plural = rows.length > 1 ? "s" : "";

  return `
    <div class="overflow-hidden rounded-2xl border border-line bg-white">
      <div class="overflow-x-auto">
        <table class="min-w-[760px] w-full border-collapse text-left">
          <thead class="bg-canvas"><tr>${head}</tr></thead>
          <tbody class="divide-y divide-line">${body}</tbody>
        </table>
      </div>
      <div class="flex items-center justify-between gap-4 border-t border-line px-5 py-3 text-[0.6875rem] text-muted">
        <span>${rows.length} élément${plural} affiché${plural}</span>
        <div class="flex items-center gap-1">
          <button type="button" disabled class="flex size-7 items-center justify-center rounded-lg border border-line text-ink-300">${icon("arrowLeft", "size-3.5")}</button>
          <span class="flex size-7 items-center justify-center rounded-lg bg-ink-900 text-white">1</span>
          <button type="button" disabled class="flex size-7 items-center justify-center rounded-lg border border-line text-ink-300">${icon("arrowRight", "size-3.5")}</button>
        </div>
      </div>
    </div>`;
}

/** Bandeau permanent rappelant le mode démonstration. */
function demoBanner() {
  return "";
}

/**
 * Aperçu A4 d'un document de démonstration.
 * @param {{ type?: string, reference?: string, compact?: boolean }} options
 */
function documentPreview({ type = "Ordre de recette", reference = "OR-2026-00418", compact = false } = {}) {
  return `
    <div class="${cn("rounded-xl border border-line bg-canvas p-3", compact ? "max-w-xs" : "")}">
      <div class="${cn(
        "relative bg-white shadow-[0_2px_8px_rgba(16,42,80,0.08)]",
        compact ? "aspect-[3/4] p-4" : "min-h-[400px] p-7 sm:p-10"
      )}">
        <div class="flex items-start justify-between border-b-2 border-ink-900 pb-4">
          <div>
            <p class="text-[0.55rem] font-bold tracking-[0.16em] text-ink-900 uppercase">République Gabonaise</p>
            <p class="mt-1 text-[0.5rem] tracking-[0.16em] text-muted uppercase">MEDITRA</p>
          </div>
          <span class="flex size-7 items-center justify-center rounded-full border border-gold-400 text-[0.45rem] font-bold text-gold-700">RG</span>
        </div>
        <div class="py-7 text-center">
          <p class="text-[0.6rem] font-bold tracking-[0.2em] text-muted uppercase">Document</p>
          <h3 class="mt-3 text-sm font-semibold text-ink-900">${esc(type)}</h3>
          <p class="mt-1 text-[0.625rem] text-muted">Référence ${esc(reference)}</p>
        </div>
        <div class="space-y-2.5">
          <div class="h-2 w-3/4 rounded bg-ink-100"></div>
          <div class="h-2 w-full rounded bg-ink-100"></div>
          <div class="h-2 w-5/6 rounded bg-ink-100"></div>
          <div class="mt-5 grid grid-cols-3 gap-2">
            <div class="h-14 rounded border border-line bg-canvas"></div>
            <div class="h-14 rounded border border-line bg-canvas"></div>
            <div class="h-14 rounded border border-line bg-canvas"></div>
          </div>
        </div>
        <p class="absolute right-4 bottom-4 text-[0.5rem] text-muted">MAQUETTE — SANS VALEUR ADMINISTRATIVE</p>
      </div>
      ${
        !compact
          ? `<div class="mt-3 flex justify-end">${button({
              variant: "secondary",
              size: "sm",
              html: icon("printer", "size-3.5") + "Imprimer l'aperçu",
              attrs: { "data-action": "print" },
            })}</div>`
          : ""
      }
    </div>`;
}

/**
 * Fenêtre modale — src/components/workspace/Modal.tsx
 * La fermeture passe par `data-action="close-modal"` (voile et croix).
 */
function modal({ open, title, description = "", html = "" }) {
  if (!open) return "";
  return `
    <div class="fixed inset-0 z-[80] flex items-center justify-center bg-ink-950/30 p-4 backdrop-blur-[2px]"
         role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button type="button" class="absolute inset-0 cursor-default" aria-label="Fermer la fenêtre" data-action="close-modal"></button>
      <div class="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-white shadow-raised">
        <div class="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 id="modal-title" class="text-lg font-semibold text-ink-900">${esc(title)}</h2>
            ${description ? `<p class="mt-1 text-sm leading-relaxed text-muted">${esc(description)}</p>` : ""}
          </div>
          <button type="button" data-action="close-modal" aria-label="Fermer"
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink-900">
            ${icon("x", "size-5")}
          </button>
        </div>
        <div class="px-6 py-5">${html}</div>
      </div>
    </div>`;
}
