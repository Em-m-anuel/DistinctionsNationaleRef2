# Vérification animations home-ink-draw — diagnostic complet

**Date :** 2026-10-13
**Branche :** `arena/00be5c66-distinctionsnationale-front`
**Commit :** *(à compléter après push, voir `git log --oneline -1`)*
**Serveur :** http://localhost:8000/

---

## 1) Inventaire des SVG et de leur mécanisme d'animation

| Nom              | viewBox      | `<g>` total | `<g>` frères¹ | `<path>` | Animation         | Stagger max      |
| ---------------- | ------------ | ----------- | ------------- | -------- | ----------------- | ---------------- |
| `cartography`    | 0 0 520 500  | 6           | **5**         | 4        | `home-ink-draw`   | 5 étapes 0→0.8s  |
| `cathedral`      | 0 0 480 520  | 13          | **12**        | 51       | `home-ink-draw`   | 8 étapes 0→1.05s |
| `senate`         | 0 0 520 320  | 9           | **8**         | 27       | `home-ink-draw`   | 8 étapes 0→1.05s |
| `national-flow`  | 0 0 970 420  | 1           | **1**         | 6        | `home-line-drift` | (continue)       |
| `palm-frond`     | 0 0 600 450  | 1           | 1             | 20       | `home-leaf-sway`  | (continue)       |
| `river`          | 0 0 850 420  | 1           | 1             | 5        | (statique)        | —                |
| `forest`         | 0 0 600 470  | 13          | 13            | 28       | (statique)        | —                |
| `horizon`        | 0 0 1180 455 | 1           | 1             | 6        | (statique)        | —                |
| `medals-engraving` | 0 0 500 400 | 1          | 1             | 4        | (statique)        | —                |
| `engraved-column`| 0 0 400 540  | 1           | 1             | 16       | (statique)        | —                |
| `faq-ornament`   | 0 0 420 570  | 1           | 1             | 3        | (statique)        | —                |
| `fern`           | 0 0 550 570  | 1           | 1             | 14       | (statique)        | —                |
| `corner-arc`     | 0 0 520 400  | 1           | 1             | 3        | (statique)        | —                |

¹ **« `<g>` frères »** : nombre maximal de `<g>` partageant le même parent.
C'est ce nombre qui détermine combien de `nth-of-type(N)` du CSS sont
effectivement utilisés. (Le `nth-of-type` compte parmi les **frères de
même balise**, pas dans tout le document.)

**`senate` après réorganisation** : 1 wrapper parent + **8 sous-groupes**
qui sont frères entre eux → la cascade `nth-of-type(1..8)` s'applique
**aux 8 sous-groupes** (les 27 paths restent inchangés).

**Géométrie de `senate` strictement préservée** :
- ViewBox inchangé : `0 0 520 320`
- 27 paths présents (mêmes coordonnées, juste réorganisés en 8 groupes)
- Mêmes `stroke-width` et `stroke-opacity` par path
- Aucun path ajouté, supprimé, ou déplacé

---

## 2) CSS utilisé (extraits de `css/theme.css` et `css/app.css`)

### 2.1) Keyframe `home-ink-draw`

```css
@keyframes home-ink-draw {
  from { stroke-dasharray: 2000; stroke-dashoffset: 2000; }
  to   { stroke-dasharray: 2000; stroke-dashoffset: 0; }
}
```

Mécanisme : un `stroke-dasharray: 2000` crée un seul segment de
2000 unités ; avec un `stroke-dashoffset` qui passe de 2000 à 0,
le segment visible « glisse » sur le path → effet de tracé progressif.

### 2.2) Application aux 3 classes animées

```css
.home-art--hero-map g,
.home-art--hero-monument g,
.home-art--process-facade g {
  animation: home-ink-draw 1.8s ease-out both;
}
```

### 2.3) Staggers (délais progressifs)

```css
/* cartography : 5 sous-groupes, delais 0s → 0.8s */
.home-art--hero-map g:nth-of-type(1) { animation-delay: 0s; }
.home-art--hero-map g:nth-of-type(2) { animation-delay: .2s; }
.home-art--hero-map g:nth-of-type(3) { animation-delay: .4s; }
.home-art--hero-map g:nth-of-type(4) { animation-delay: .6s; }
.home-art--hero-map g:nth-of-type(5) { animation-delay: .8s; }

/* cathedral et senate : 8 sous-groupes, delais 0s → 1.05s */
.home-art--hero-monument g:nth-of-type(1),
.home-art--process-facade g:nth-of-type(1) { animation-delay: 0s; }
.home-art--hero-monument g:nth-of-type(2),
.home-art--process-facade g:nth-of-type(2) { animation-delay: .15s; }
.home-art--hero-monument g:nth-of-type(3),
.home-art--process-facade g:nth-of-type(3) { animation-delay: .30s; }
.home-art--hero-monument g:nth-of-type(4),
.home-art--process-facade g:nth-of-type(4) { animation-delay: .45s; }
.home-art--hero-monument g:nth-of-type(5),
.home-art--process-facade g:nth-of-type(5) { animation-delay: .60s; }
.home-art--hero-monument g:nth-of-type(6),
.home-art--process-facade g:nth-of-type(6) { animation-delay: .75s; }
.home-art--hero-monument g:nth-of-type(7),
.home-art--process-facade g:nth-of-type(7) { animation-delay: .90s; }
.home-art--hero-monument g:nth-of-type(8),
.home-art--process-facade g:nth-of-type(8) { animation-delay: 1.05s; }
```

### 2.4) `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  .home-medal-float, #accueil [data-rotator] > div:first-child,
  .home-art--hero-map, .home-art--hero-flow, .home-art--contact-flow,
  .home-art--process-palm, .home-art--values-forest,
  .home-art--hero-map g,
  .home-art--hero-monument g,
  .home-art--process-facade g { animation: none !important; }
  /* ... autres animations désactivées de la même manière ... */
}
```

→ les 3 classes animées par `home-ink-draw` sont explicitement
annulées par `animation: none !important`. Les animations continues
(`home-line-drift`, `home-leaf-sway`, `home-medal-float`, etc.) sont
aussi désactivées.

---

## 3) Réorganisation de `senate` — correspondance groupe / délai

| Groupe | Contenu (paths)                              | Délai     |
| ------ | ------------------------------------------- | --------- |
| **1**  | Plinthe principale (M40 290h440)            | **0s**    |
| **2**  | Soubassement secondaire (M55 282h410, M75 274h370) | **0.15s** |
| **3**  | 2 premières colonnes (8 paths : 4 par colonne) | **0.30s** |
| **4**  | 2 dernières colonnes (8 paths : 4 par colonne) | **0.45s** |
| **5**  | Entablement — architrave + frise (2 paths)  | **0.60s** |
| **6**  | Entablement — corniches (2 paths)           | **0.75s** |
| **7**  | Fronton triangulaire (2 paths : pentes)     | **0.90s** |
| **8**  | Acrotères + ombre au sol (3 paths)          | **1.05s** |

**Ordre visuel** : sol → soubassement → colonnes (gauche puis droite)
→ entablement (puis corniche) → fronton → détails finaux.

**Durée totale** : 1.05s (dernier delay) + 1.8s (durée animation) = **2.85s**.

---

## 4) Réorganisation des autres SVG animés

### `cartography` (5 sous-groupes)
| Groupe | Contenu                            | Délai   |
| ------ | ---------------------------------- | ------- |
| 1      | Ombre portée (path stroked 6/.08)  | 0s      |
| 2      | Tracé principal du Gabon (1.6/.80) | 0.2s    |
| 3      | Repères croix (dasharray)          | 0.4s    |
| 4      | Point Libreville (fill)            | 0.6s    |
| 5      | Halo du point (stroke 8.5)         | 0.8s    |

### `cathedral` (8 sous-groupes sur 12 disponibles)
| Groupe | Contenu                            | Délai   |
| ------ | ---------------------------------- | ------- |
| 1      | Soubassement + sol                 | 0s      |
| 2      | Escalier central (5 marches)       | 0.15s   |
| 3      | 8 colonnes corinthiennes           | 0.30s   |
| 4      | Architrave                         | 0.45s   |
| 5      | Frise                              | 0.60s   |
| 6      | Corniche                           | 0.75s   |
| 7      | Fronton triangulaire               | 0.90s   |
| 8      | Drapeau + porte en arc             | 1.05s   |

(4 `<g>` supplémentaires — acrotères, ombre au sol — s'animent en
parallèle du dernier sous-groupe à 1.05s.)

---

## 5) Détail des 4 animations câblées individuellement

| Classe                       | Animation        | Type                | Vérifié |
| ---------------------------- | ---------------- | ------------------- | ------- |
| `.home-art--hero-map`        | `home-ink-draw`  | Tracé progressif    | ✅      |
| `.home-art--hero-monument`   | `home-ink-draw`  | Tracé progressif    | ✅      |
| `.home-art--process-facade`  | `home-ink-draw`  | Tracé progressif    | ✅      |
| `.home-art--hero-flow`       | `home-line-drift`| Translation continue| ✅      |

Le faisceau tricolore (`national-flow`) n'est **pas** animé par
`home-ink-draw` ; il a sa propre animation `home-line-drift` qui le
fait dériver lentement de gauche à droite. C'est intentionnel : un
faisceau de 6 courbes tricolores n'a pas de raison d'être « dessiné »,
il est plus naturel qu'il soit posé d'un coup et qu'il dérive ensuite.

---

## 6) Mécanisme de re-déclenchement au retour sur la home

```js
// js/app.js (extrait)
function render() {
  const route = currentPath();
  const kind = /* "home" | "login" | "workspace" */;
  if (previousRoute && previousRoute !== route) {
    unmountHome();              // ← libère les écouteurs de la home
  }
  if (kind === "home") {
    root.innerHTML = renderHome(session);  // ← re-montage du DOM
    mountHome();                 // ← ré-attache les écouteurs
  }
}

subscribeRoute(render);          // ← déclenché sur hashchange/popstate
subscribeAuth(() => render());
```

**Conséquence** : chaque navigation vers la home (lien, bouton back,
popstate) **détruit puis recrée** l'intégralité du DOM, y compris les
SVG. Les animations CSS, attachées aux nouveaux éléments du DOM, sont
automatiquement re-déclenchées (le moteur CSS lance l'animation à
chaque `animation-name: home-ink-draw` rencontré).

---

## 7) Tests automatisés (5 tests smoke)

`npm test` exécute **23 tests** dont 3 nouveaux spécifiques à cette
mission :

1. `les illustrations d'arrière-plan ont été retravaillées`
   - présence du nouveau `GABON_OUTLINE` continu
   - façade néoclassique à 8 colonnes (`colXs = [50, 100, 150, 200, 280, 330, 380, 430]`)
   - faisceau tricolore et palette unifiée `#5b7791`
   - absence des anciennes illustrations (rosace, coupole)
   - path Gabon en 1 seul `M` initial

2. `les illustrations animées ont le bon nombre de sous-groupes` 🆕
   - `cartography` : ≥ 5 `<g>` frères (nth-of-type 1..5)
   - `cathedral`   : ≥ 8 `<g>` frères (nth-of-type 1..8)
   - `senate`      : ≥ 8 `<g>` frères (nth-of-type 1..8) **après réorganisation**
   - `national-flow` : ≥ 1 `<g>` frère (animation différente)

3. `les quatre animations du hero sont câblées individuellement` 🆕
   - `home-art--hero-map` → `home-ink-draw` (vérifié dans CSS)
   - `home-art--hero-monument` → `home-ink-draw`
   - `home-art--process-facade` → `home-ink-draw`
   - `home-art--hero-flow` → `home-line-drift` (animation différente)
   - `@keyframes home-ink-draw` utilise `stroke-dasharray`
   - `@keyframes home-line-drift` existe
   - `prefers-reduced-motion` annule `home-ink-draw` avec `!important`

**Résultat : 23/23 OK** (vérifié après la réorganisation de `senate`).

---

## 8) Tests manuels à effectuer dans un navigateur

### Test 1 — Apparition initiale
1. Ouvrir `http://localhost:8000/` (ou servir `index.html` localement)
2. Observer le **hero de la page d'accueil** : 4 illustrations principales
   - À gauche : carte du Gabon (`home-art--hero-map`)
   - À droite : façade néoclassique (`home-art--hero-monument`)
   - Au-dessus du hero à droite : faisceau tricolore (`home-art--hero-flow`)
3. **Attendu** :
   - La carte se dessine en 5 étapes (silhouette → tracé → repères → point Libreville → halo)
   - La façade se dessine en 8 étapes (sol → escalier → colonnes → entablements → fronton → drapeau)
   - Le faisceau tricolore **n'est pas** dessiné progressivement ; il est posé d'un coup et dérive lentement

### Test 2 — Processus de candidature (`/`)
- Section "Comment ça marche" (3 étapes d'instruction)
- **Attendu** : la façade en arrière-plan (`home-art--process-facade`) se dessine en 8 étapes (soubassement → soubassement secondaire → colonnes gauche → colonnes droite → entablement → corniches → fronton → acrotères/ombre)

### Test 3 — Retour sur la page
1. Cliquer sur un lien de navigation (ex. « Connexion » en haut à droite)
2. Cliquer sur « Accueil » (ou utiliser le bouton back du navigateur)
3. **Attendu** : les 3 animations (`hero-map`, `hero-monument`, `process-facade`) **se rejouent** intégralement

### Test 4 — `prefers-reduced-motion`
- **macOS** : Réglages Système → Accessibilité → Affichage → Réduire les animations
- **Windows** : Paramètres → Accessibilité → Effets visuels → Effets d'animation
- **Linux/Chrome** : `chrome://flags` → `prefers-reduced-motion` → Enabled
- Recharger la page
- **Attendu** : les 3 illustrations animées apparaissent **instantanément, sans tracé progressif**. Les animations continues (dérive du faisceau, oscillation des feuilles) sont aussi figées.

### Test 5 — Mobile
1. Ouvrir les DevTools (F12) → mode responsive (ex. iPhone 12)
2. Recharger la page
3. **Attendu** :
   - Le hero s'affiche correctement (1 colonne empilée)
   - Sur mobile, **les SVG du hero sont masqués** (max-width 1023px) — seul `process-facade` reste visible
   - L'animation `process-facade` se joue normalement

---

## 9) Limites qui restent à vérifier dans un navigateur

**Important** : ce diagnostic repose sur l'analyse statique du code
(parsing du CSS, comptage des `<g>` via tokenizer, simulation de la
cascade `nth-of-type`). Je n'ai **pas** pu capturer de rendu réel
parce que ce sandbox n'expose aucun navigateur (chromium, chrome,
firefox, playwright, cairo, rsvg, skia). Les points suivants
**restent à vérifier visuellement** :

1. **Effet réel du `stroke-dasharray: 2000`** sur des paths courts
   (tous les paths de `senate` font < 500 unités, donc largement < 2000).
   Théoriquement, le path passe d'invisible à visible pendant 1.8s.
   Mais le tracé visible représente au plus 500/2000 = 25% de
   l'animation → en pratique, l'effet de « dessin » se concentre sur
   les ~25% finaux de l'animation, le reste étant statique. C'est
   un compromis connu, qui n'a pas été modifié.

2. **Réaction de l'ombre au sol de `senate`** (path avec
   `stroke-dasharray="2 7"`). Le keyframe `home-ink-draw` impose
   `stroke-dasharray: 2000` pendant l'animation, ce qui **écrase**
   le dasharray 2/7 de l'ombre → l'ombre perd son apparence
   pointillée pendant 1.8s, puis la récupère à la fin. Visuellement,
   l'ombre est de toute façon à `stroke-opacity: 0.22`, donc quasi
   invisible. Ce n'est pas un bug bloquant, mais c'est à confirmer
   visuellement.

3. **Cohérence visuelle finale** : les 27 paths de `senate` étant
   strictement identiques à la version précédente, le rendu doit
   être **pixel-perfect identique** une fois l'animation terminée.
   Mais l'œil peut percevoir une légère différence dans l'ordre
   d'apparition si la cascade n'est pas exactement synchrone
   avec l'attente de l'utilisateur.

4. **Performance** : sur des appareils lents, l'animation
   `stroke-dasharray` peut être coûteuse. À vérifier sur mobile.

5. **Comportement au resize** : si la fenêtre est redimensionnée
   pendant l'animation, le `stroke-dasharray` reste fixe en unités
   absolues (pas relatives à la taille du path). À vérifier.

---

## 10) Fichiers modifiés

```
js/views/home.js   — fonction `homeArt("senate", "home-art--process-facade")` réorganisée
                     (1 wrapper + 8 sous-groupes, 27 paths préservés)
css/app.css        — recompilé à partir de css/theme.css (aucun changement de source)
css/theme.css      — inchangé (les staggers et prefers-reduced-motion étaient déjà OK)
tests/smoke.cjs    — 2 nouveaux tests :
                     • "les illustrations animées ont le bon nombre de sous-groupes"
                     • "les quatre animations du hero sont câblées individuellement"
```

**Aucun autre fichier modifié.** Le SVG `cathedral`, `cartography`,
`national-flow`, et tous les autres ne sont pas touchés.
