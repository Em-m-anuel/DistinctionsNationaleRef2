/* ==================================================================
   js/views/home.js
   Page d'accueil publique — conversion de :
     · src/App.tsx (mise en page : lien d'évitement, en-tête, pied)
     · src/pages/HomePage.tsx
     · src/components/Header.tsx
     · src/components/Footer.tsx
     · src/components/landing/HeroMedalRotator.tsx

   Le JSX devient du HTML en chaîne ; l'état React (menu mobile,
   scroll-spy, carrousel de médailles, compteurs) devient de petites
   fonctions d'initialisation appelées après le montage du DOM.
================================================================== */

/* ------------------------------ Contenus ------------------------------ */

const ACCENT_STYLES = {
  green: { icon: "bg-republic-green-50 text-republic-green-600", border: "hover:border-republic-green-200" },
  gold: { icon: "bg-gold-100 text-gold-700", border: "hover:border-gold-200" },
  blue: { icon: "bg-republic-blue-50 text-republic-blue-600", border: "hover:border-republic-blue-200" },
};

const HOME_MEDALS = [
  { type: "bronze", title: "Médaille de bronze", finish: "Métal cuivré et reflets chauds", duration: "10 à 19 ans", description: "Elle distingue un engagement professionnel durable et une première étape de reconnaissance nationale." },
  { type: "argent", title: "Médaille d'argent", finish: "Métal argenté et reflets froids", duration: "20 à 29 ans", description: "Elle récompense une contribution confirmée, inscrite dans la continuité et la transmission." },
  { type: "or", title: "Médaille d'or", finish: "Métal doré et finitions lumineuses", duration: "30 ans et plus", description: "Distinction supérieure, elle honore un parcours professionnel exceptionnel et exemplaire." },
];

const HOME_PROCESS = [
  { icon: "document", title: "Constitution du dossier", description: "L'entreprise prépare le courrier d'initiation, la liste des récipiendaires, les DTS et les autres pièces justificatives nécessaires." },
  { icon: "hierarchy", title: "Transmission hiérarchique", description: "Le dossier suit le circuit administratif prévu, à travers les secrétariats et les autorités compétentes, jusqu'à la décision sur le dossier initial." },
  { icon: "checkCircle", title: "Instruction et validation", description: "Le Service des Distinctions examine les pièces, vérifie les situations individuelles et prépare la validation des distinctions." },
  { icon: "building", title: "Ordre de recette et retrait", description: "Après validation, un ordre de recette est délivré. L'entreprise effectue le paiement auprès du Trésor, puis présente la quittance pour retirer les médailles." },
  { icon: "medal", title: "Cérémonie officielle", description: "La date et le lieu sont organisés avec le service compétent. Les diplômes sont remis aux présents pendant la cérémonie, et les distinctions non distribuées restent à suivre par l'entreprise." },
];

const HOME_VALUES = [
  { icon: "scale", accent: "green", title: "Équité", description: "Examen des dossiers selon les critères applicables, avec la même exigence pour chaque demande." },
  { icon: "transparency", accent: "blue", title: "Transparence", description: "Visibilité sur la progression des demandes et sur les étapes du circuit administratif." },
  { icon: "award", accent: "gold", title: "Engagement", description: "Reconnaissance de l'investissement professionnel et des parcours qui contribuent au développement du Gabon." },
];

const HOME_ADJUSTMENTS = [
  { icon: "shield", accent: "green", title: "Situations particulières", description: "Certaines situations peuvent faire l'objet d'un examen spécifique selon les règles applicables." },
  { icon: "award", accent: "gold", title: "Remise posthume", description: "Une remise posthume peut être envisagée dans le cadre prévu, avec les justificatifs nécessaires." },
  { icon: "scale", accent: "blue", title: "Examen d'un recours", description: "Une situation particulière peut être soumise à examen sans préjuger de l'issue de l'instruction." },
];

/* Questions publiées dans l'accueil : reprises du circuit décrit par le
   demandeur ; aucune règle, adresse ou prestation nouvelle n'est créée. */
const HOME_FAQ = [
  { question: "Qui peut soumettre une demande de distinction nationale ?", answer: "Les entreprises et les organismes habilités disposant d'un compte demandeur peuvent constituer et soumettre un dossier conformément aux conditions prévues par le dispositif." },
  { question: "Quelles pièces faut-il fournir ?", answer: "Le dossier comprend notamment le courrier d'initiation, la liste des récipiendaires, les DTS et les autres pièces justificatives requises. Le service peut demander des documents complémentaires si le dossier est incomplet." },
  { question: "Quelles sont les conditions d'ancienneté pour obtenir une médaille ?", answer: "<ul><li>Bronze : de 10 à 19 ans d'ancienneté.</li><li>Argent : de 20 à 29 ans d'ancienneté.</li><li>Or : 30 ans et plus.</li></ul><p>Certaines situations particulières peuvent faire l'objet d'un assouplissement, conformément aux règles du dispositif.</p>" },
  { question: "Comment suivre l'évolution de mon dossier ?", answer: "L'espace demandeur permet de consulter les changements de statut, les étapes de traitement et les informations de suivi disponibles." },
  { question: "Que se passe-t-il si mon dossier est incomplet ?", answer: "Le service peut demander une pièce manquante ou une justification ciblée concernant un récipiendaire précis. Le demandeur peut alors transmettre les éléments demandés." },
  { question: "Que faire si ma demande est rejetée ?", answer: "Un recours peut être introduit à la suite du rejet du dossier initial, avec les pièces justificatives appropriées. Le traitement dépend de la décision de l'autorité compétente." },
  { question: "Comment se déroule le paiement ?", answer: "Après validation du dossier et établissement de l'ordre de recette, le demandeur effectue le paiement auprès du Trésor, qui délivre une quittance. Cette quittance est présentée au Régisseur des Médailles lors du retrait." },
  { question: "Comment est fixée la date de cérémonie ?", answer: "La cérémonie peut être planifiée automatiquement lorsque le dossier respecte les délais prévus. Dans les situations nécessitant une confirmation particulière, la date et le lieu sont négociés avec le Service des Distinctions Nationales." },
  { question: "Peut-on récupérer une distinction sans assister à la cérémonie ?", answer: "Une récupération sans cérémonie est possible selon la procédure prévue, notamment par un employé muni des justificatifs requis." },
  { question: "Puis-je consulter mes distinctions personnelles ?", answer: "Un récipiendaire disposant d'un compte personnel activé peut consulter ses distinctions, les cérémonies auxquelles il est convié et les informations disponibles concernant ses remises." },
  { question: "Comment sont gérées les distinctions non remises pendant une cérémonie ?", answer: "Les distinctions non distribuées restent entre les mains de l'entreprise après la cérémonie. L'entreprise peut effectuer les démarches de relance prévues par le dispositif." },
  { question: "Comment obtenir de l'aide ?", answer: "Consultez la rubrique de contact et d'assistance du portail." },
];

/** Navigation de l'en-tête (identique à `NAV` du composant Header). */
const HOME_NAV = [
  { label: "Accueil", id: "accueil" },
  { label: "Processus", id: "processus" },
  { label: "Médailles", id: "medailles" },
  { label: "Valeurs", id: "valeurs" },
  { label: "Cas particuliers", id: "situations" },
  { label: "Chiffres", id: "chiffres" },
  { label: "FAQ", id: "faq" },
  { label: "Contact", id: "contact" },
];

/* -------------------- Gravures et tracés de la page d'accueil --------------------
   Tous les dessins ci-dessous sont purement décoratifs, aria-hidden et
   pointer-events:none. Le contour du pays provient de Natural Earth 1:50m
   (données du domaine public) et a été simplifié pour une gravure légère.
   Les façades sont des études graphiques : aucun sceau ni blason officiel
   n'est simulé. L'opacité et les masques restent pilotés par le CSS.
------------------------------------------------------------------ */

const GABON_OUTLINE = "M50 102 L448 100 Q470 102 472 120 L470 200 Q465 240 458 280 Q448 320 432 360 Q415 400 390 425 Q360 445 320 452 Q280 458 230 460 Q180 460 140 450 Q100 440 70 410 Q40 380 28 340 Q22 290 30 240 Q38 200 32 170 Q30 140 40 115 Q45 105 50 102 Z";

function homeArt(name, className = "") {
  const wrap = (viewBox, shapes) =>
    `<svg viewBox="${viewBox}" class="home-art ${className}" fill="none"
          aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">${shapes}</svg>`;

  if (name === "cartography") {
    // Silhouette du Gabon : tracé continu, propre, en un seul path fermé.
    // Trois groupes : ombre (très pâle), tracé principal, repères discrets.
    return wrap("0 0 520 500", `
      <g stroke="#5b7791" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <g>
          <path d="${GABON_OUTLINE}" stroke-width="6" stroke-opacity=".08" />
        </g>
        <g>
          <path d="${GABON_OUTLINE}" stroke-width="1.6" stroke-opacity=".80" />
        </g>
        <g stroke-width=".7" stroke-opacity=".34">
          <path d="M129 169h88M217 169v-88M270 272h77M347 272v-78" stroke-dasharray="3 7" />
          <path d="M24 156h100M88 94v126M383 394h108M436 357v90" stroke-dasharray="3 7" />
        </g>
        <g fill="#5b7791" stroke="none" fill-opacity=".55">
          <circle cx="106.6" cy="155.9" r="3" />
        </g>
        <g stroke-width=".7" stroke-opacity=".55" fill="none">
          <circle cx="106.6" cy="155.9" r="8.5" />
        </g>
      </g>`);
  }

  if (name === "national-flow") {
    // Faisceau de lignes ondulées fines, tricolores (vert/jaune/bleu),
    // parallèles et entrelacées, évoquant un ruban de drapeau flottant.
    const waves = [
      { color: "#009e60", op: ".62" },  // vert (premier)
      { color: "#009e60", op: ".40" },
      { color: "#f0bd23", op: ".70" },  // jaune
      { color: "#f0bd23", op: ".48" },
      { color: "#3a75c4", op: ".58" },  // bleu
      { color: "#3a75c4", op: ".38" },
    ];
    const wavePaths = waves.map((w, i) => {
      const offset = -20 + i * 8;  // décalage vertical
      return `<path d="M-40 ${200 + offset} C100 ${150 + offset} 200 ${290 + offset} 380 ${220 + offset} S620 ${130 + offset} 760 ${200 + offset} 1010 ${160 + offset}" stroke="${w.color}" stroke-width="1.4" stroke-opacity="${w.op}" />`;
    }).join("");
    return wrap("0 0 970 420", `
      <g fill="none" stroke-linecap="round">
        ${wavePaths}
      </g>`);
  }

  if (name === "senate") {
    // Arc institutionnel à fronton : 4 colonnes, entablement complet,
    // fronton triangulaire plus discret. Échelles rééquilibrées.
    // Huit <g> top-level pour préserver l'animation ink-draw échelonnée :
    //   1. Plinthe principale
    //   2. Soubassement secondaire
    //   3. 2 premières colonnes (regroupées)
    //   4. 2 dernières colonnes (regroupées)
    //   5. Entablement — architrave + frise
    //   6. Entablement — corniches
    //   7. Fronton triangulaire
    //   8. Acrotères + ombre au sol (détails finaux)
    // Le keyframe home-ink-draw (CSS) anime chaque sous-groupe successivement
    // via nth-of-type(1..8) avec un delay de 0s à 1.05s (cf. css/theme.css).
    const colY = 180;          // haut des colonnes (sous l'architrave)
    const colBot = 280;        // bas des colonnes (sur la plinthe)
    const colXs = [120, 200, 320, 400];   // 4 colonnes
    const colW = 16;
    const pedimentY = 110;     // ligne d'entablement sous le fronton
    const apexY = 50;          // pointe du fronton
    return wrap("0 0 520 320", `
      <g stroke="#5b7791" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <!-- Groupe 1 : plinthe principale (soubassement extérieur) -->
        <g>
          <path d="M40 290h440" stroke-width="1.6" stroke-opacity=".88" />
        </g>
        <!-- Groupe 2 : soubassement secondaire (deux lignes intérieures) -->
        <g>
          <path d="M55 282h410" stroke-width="1.0" stroke-opacity=".55" />
          <path d="M75 274h370" stroke-width=".6" stroke-opacity=".32" />
        </g>
        <!-- Groupe 3 : 2 premières colonnes (gauche, regroupées en 1 sous-groupe) -->
        <g>
          ${[colXs[0], colXs[1]].map((x) => `
            <path d="M${x - colW} ${colBot}v${colY - colBot}" stroke-width="1.6" stroke-opacity=".88" />
            <path d="M${x + colW} ${colBot}v${colY - colBot}" stroke-width="1.6" stroke-opacity=".88" />
            <path d="M${x - colW - 3} ${colBot - 4}h${(colW + 3) * 2}" stroke-width="1.0" stroke-opacity=".60" />
            <path d="M${x - colW - 5} ${colY + 2}h${(colW + 5) * 2}" stroke-width="1.1" stroke-opacity=".65" />
          `).join("")}
        </g>
        <!-- Groupe 4 : 2 dernières colonnes (droite, regroupées en 1 sous-groupe) -->
        <g>
          ${[colXs[2], colXs[3]].map((x) => `
            <path d="M${x - colW} ${colBot}v${colY - colBot}" stroke-width="1.6" stroke-opacity=".88" />
            <path d="M${x + colW} ${colBot}v${colY - colBot}" stroke-width="1.6" stroke-opacity=".88" />
            <path d="M${x - colW - 3} ${colBot - 4}h${(colW + 3) * 2}" stroke-width="1.0" stroke-opacity=".60" />
            <path d="M${x - colW - 5} ${colY + 2}h${(colW + 5) * 2}" stroke-width="1.1" stroke-opacity=".65" />
          `).join("")}
        </g>
        <!-- Groupe 5 : entablement — architrave + frise (deux lignes fines) -->
        <g>
          <path d="M50 ${pedimentY}h420" stroke-width="1.6" stroke-opacity=".88" />
          <path d="M50 ${pedimentY + 5}h420" stroke-width=".6" stroke-opacity=".36" />
        </g>
        <!-- Groupe 6 : entablement — corniches (deux lignes épaissies) -->
        <g>
          <path d="M46 ${pedimentY + 9}h428" stroke-width="1.2" stroke-opacity=".72" />
          <path d="M40 ${pedimentY + 16}h440" stroke-width="1.4" stroke-opacity=".82" />
        </g>
        <!-- Groupe 7 : fronton triangulaire (pentes) -->
        <g>
          <path d="M40 ${pedimentY + 16}L260 ${apexY} 480 ${pedimentY + 16}" stroke-width="1.7" stroke-opacity=".92" />
          <path d="M50 ${pedimentY + 22}L260 ${apexY + 6} 470 ${pedimentY + 22}" stroke-width=".7" stroke-opacity=".40" />
        </g>
        <!-- Groupe 8 : acrotères + ombre au sol (détails finaux) -->
        <g>
          <path d="M36 ${pedimentY + 18}v-10M484 ${pedimentY + 18}v-10" stroke-width="1.0" stroke-opacity=".62" />
          <path d="M40 305h440" stroke-width=".5" stroke-opacity=".22" stroke-dasharray="2 7" />
        </g>
      </g>`);
  }

  if (name === "cathedral") {
    // Façade néoclassique d'un édifice institutionnel gabonais :
    // fronton triangulaire central, 8 colonnes corinthiennes, escalier,
    // soubassement. Tracé en plusieurs groupes pour préserver le dessin
    // progressif (chaque <g> se trace successivement).
    const w = 480, h = 520;
    const colY = 240;          // haut des colonnes
    const colBot = 400;        // bas des colonnes
    const colW = 12;           // largeur d'une colonne
    // 8 colonnes réparties symétriquement
    const colXs = [50, 100, 150, 200, 280, 330, 380, 430];
    // Fronton
    const pedimentY = 170;     // base du fronton (sous corniche)
    const apexY = 70;          // pointe du fronton
    const centerX = w / 2;
    return wrap("0 0 " + w + " " + h, `
      <g stroke="#5b7791" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <!-- Groupe 1 : soubassement et sol -->
        <g stroke-width="1.4" stroke-opacity=".72">
          <path d="M30 470h420" />
          <path d="M48 458h384" stroke-width=".8" stroke-opacity=".55" />
          <path d="M68 446h344" stroke-width=".6" stroke-opacity=".35" />
        </g>
        <!-- Groupe 2 : escalier central (5 marches) -->
        <g stroke-width="1.0" stroke-opacity=".62">
          <path d="M180 446h120" />
          <path d="M188 436h104" stroke-width=".9" stroke-opacity=".50" />
          <path d="M196 426h88" stroke-width=".8" stroke-opacity=".40" />
        </g>
        <!-- Groupe 3 : 8 colonnes -->
        <g>
          ${colXs.map((x) => `
            <path d="M${x - colW} ${colBot}V${colY}" stroke-width="1.5" stroke-opacity=".82" />
            <path d="M${x + colW} ${colBot}V${colY}" stroke-width="1.5" stroke-opacity=".82" />
            <path d="M${x - colW - 3} ${colBot - 5}h${(colW + 3) * 2}" stroke-width=".9" stroke-opacity=".55" />
            <path d="M${x - colW - 5} ${colY + 5}h${(colW + 5) * 2}" stroke-width="1.0" stroke-opacity=".65" />
          `).join("")}
        </g>
        <!-- Groupe 4 : entablement (architrave, frise, corniche) -->
        <g stroke-width="1.5" stroke-opacity=".88">
          <path d="M30 ${pedimentY}h420" />
        </g>
        <g stroke-width=".7" stroke-opacity=".42">
          <path d="M30 ${pedimentY + 5}h420" />
        </g>
        <g stroke-width="1.2" stroke-opacity=".72">
          <path d="M22 ${pedimentY + 11}h436" />
        </g>
        <g stroke-width="1.4" stroke-opacity=".85">
          <path d="M18 ${pedimentY + 18}h444" />
        </g>
        <!-- Groupe 5 : fronton triangulaire -->
        <g>
          <path d="M18 ${pedimentY + 18}L${centerX} ${apexY} 462 ${pedimentY + 18}" stroke-width="1.7" stroke-opacity=".92" />
          <path d="M30 ${pedimentY + 24}L${centerX} ${apexY + 8} 450 ${pedimentY + 24}" stroke-width=".6" stroke-opacity=".36" />
        </g>
        <!-- Groupe 6 : acrotères aux angles du fronton -->
        <g stroke-width="1.0" stroke-opacity=".65">
          <path d="M14 ${pedimentY + 20}v-12M466 ${pedimentY + 20}v-12" />
        </g>
        <!-- Groupe 7 : drapeau au sommet du fronton -->
        <g>
          <path d="M${centerX} ${apexY - 18}v-14" stroke-width="1.0" stroke-opacity=".70" />
          <path d="M${centerX} ${apexY - 32}h12v8h-12z" stroke-width=".8" stroke-opacity=".62" />
        </g>
        <!-- Groupe 8 : entrée centrale (porte en arc) -->
        <g stroke-width="1.0" stroke-opacity=".62">
          <path d="M${centerX - 30} ${colBot}V${colY + 30}" />
          <path d="M${centerX + 30} ${colBot}V${colY + 30}" />
          <path d="M${centerX - 30} ${colY + 30}Q${centerX} ${colY + 12} ${centerX + 30} ${colY + 30}" />
        </g>
        <!-- Ombre au sol très discrète -->
        <g stroke-width=".5" stroke-opacity=".22">
          <path d="M30 484h420" stroke-dasharray="2 7" />
        </g>
      </g>`);
  }

  if (name === "palm-frond") {
    const leaflets = Array.from({ length: 19 }, (_, i) => {
      const t = i / 18;
      const x = 35 + t * 400;
      const y = 401 - (t * 327 - t * t * 110);
      const length = (1 - Math.abs(t - .47) * 1.35) * 155;
      return `<path d="M${x.toFixed(1)} ${y.toFixed(1)} Q${(x + length*.18).toFixed(1)} ${(y - length*.72).toFixed(1)} ${(x + length*.83).toFixed(1)} ${(y - length).toFixed(1)}M${x.toFixed(1)} ${y.toFixed(1)} Q${(x - length*.34).toFixed(1)} ${(y - length*.21).toFixed(1)} ${(x - length*.57).toFixed(1)} ${(y - length*.70).toFixed(1)}" />`;
    }).join("");
    return wrap("0 0 600 450", `<g stroke="#82949d" stroke-width="1.1" stroke-linecap="round" stroke-opacity=".58">
      <path d="M8 434Q180 119 548 80" stroke-width="1.65" />${leaflets}
    </g>`);
  }

  if (name === "river") {
    return wrap("0 0 850 420", `
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M-30 324 C114 283 127 145 287 180 S484 359 626 207 766 72 892 97" stroke="#a0b9cf" stroke-width="1.2" stroke-opacity=".52" />
        <path d="M-24 340 C121 298 142 163 293 195 S493 373 639 224 771 84 892 112" stroke="#a0b9cf" stroke-width=".85" stroke-opacity=".38" />
        <path d="M-20 355 C129 317 149 180 300 211 S500 385 652 239 780 99 894 129" stroke="#a0b9cf" stroke-width=".8" stroke-opacity=".30" />
        <path d="M-12 371 C136 335 157 196 309 226 S505 401 665 256 795 116 906 146" stroke="#009e60" stroke-width=".8" stroke-opacity=".22" />
        <path d="M92 223C147 164 197 150 244 161M596 125C665 89 723 67 802 79" stroke="#8baac8" stroke-width=".7" stroke-dasharray="2 8" stroke-opacity=".35" />
      </g>`);
  }

  if (name === "forest") {
    // Étude botanique : feuilles, nervures, jeunes pousses et cimes.
    const leaves = [
      [187, 252, -36], [207, 224, 38], [221, 185, -40], [244, 158, 30],
      [265, 127, -38], [292, 101, 28], [170, 309, 32], [143, 331, -39],
      [366, 315, 35], [390, 278, -39], [421, 250, 30], [448, 220, -35],
    ].map(([x, y, turn]) => `<g transform="translate(${x} ${y}) rotate(${turn})">
        <path d="M0 0C-22-27-20-54 0-73 20-54 22-27 0 0Z" />
        <path d="M0 0v-67M0-25l-11-17M0-35l11-17" stroke-width=".65" />
      </g>`).join("");
    return wrap("0 0 600 470", `
      <g stroke="#7b9997" stroke-width="1.4" stroke-opacity=".78" stroke-linecap="round" stroke-linejoin="round">
        <path d="M156 456C177 377 218 233 300 77M319 453C339 368 391 255 472 197" />
        <path d="M93 459c37-31 79-35 123-24M321 453c57-32 125-32 192-4" stroke-opacity=".35" />
        ${leaves}
        <path d="M98 371c-30-28-29-67-13-91 28 17 42 46 34 73m0 3c3-35 22-59 52-69 0 28-12 48-38 65" />
        <path d="M346 394c-6-42 11-73 45-94 7 38-6 72-32 89" />
      </g>`);
  }

  if (name === "horizon") {
    return wrap("0 0 1180 455", `
      <g stroke="#6889a0" stroke-width="1.45" stroke-opacity=".78" stroke-linecap="round" stroke-linejoin="round">
        <path d="M0 332C136 313 242 324 360 344s209-20 345-18 318 15 475-24M0 346c151-20 266 12 374 18 129 7 215-28 338-22s289 19 468-18" />
        <path d="M407 329V183h303v143M429 183v-42h256v42M453 141v-24h209v24M560 117V84h5v33" />
        <path d="M434 219h269M447 265h245M478 326v-98m44 98v-98m44 98v-98m44 98v-98m44 98v-98" />
        <path d="M96 329v-111m0 0C58 214 39 193 31 161c29 9 53 25 65 57m0 0c30-28 59-35 89-28-19 26-49 37-89 28m0 0c-10-35-5-65 14-90 14 34 9 62-14 90" />
        <path d="M1062 305v-78m0 0c-27-14-41-34-40-61 22 11 34 29 40 61m0 0c23-26 48-39 78-36-17 27-43 38-78 36" />
        <path d="M318 352c99-5 185 18 268 15 91-4 164-13 255-8" stroke-opacity=".35" stroke-dasharray="2 8" />
      </g>`);
  }

  if (name === "medals-engraving") {
    return wrap("0 0 500 400", `
      <g stroke="#ba9b65" stroke-linecap="round" stroke-opacity=".72" fill="none">
        <path d="M498 23C350-18 158 53 53 201M498 43C359 7 180 71 78 208M498 63C369 31 199 89 103 215" stroke-width="1.2" />
        <path d="M477 346C351 303 189 320 56 394M471 361C342 322 196 336 80 402" stroke-width=".9" stroke-dasharray="2 8" />
        <circle cx="347" cy="133" r="78" stroke-width=".85" /><circle cx="347" cy="133" r="91" stroke-width=".65" stroke-dasharray="2 9" />
        <path d="M347 25v26m0 164v26M239 133h26m164 0h26M276 62l16 16m111 110 17 17m-144 0 16-16m111-111 17-17" stroke-width=".9" />
        <path d="M347 110l8 15 16 8-16 8-8 15-8-15-16-8 16-8Z" stroke="#d6a72c" stroke-width="1.1" />
      </g>`);
  }

  if (name === "engraved-column") {
    // Colonne toscane isolée, chapiteau et base généreux.
    const cx = 200;
    const fTop = 150;          // sommet du fût
    const fBot = 410;          // base du fût
    const shaftW = 40;
    return wrap("0 0 400 540", `
      <g stroke="#5b7791" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <!-- Sol : ligne d'horizon + 2 lignes d'ancrage -->
        <path d="M40 470h320" stroke-width="1.6" stroke-opacity=".88" />
        <path d="M58 480h284" stroke-width=".7" stroke-opacity=".36" />
        <path d="M88 490h224" stroke-width=".5" stroke-opacity=".22" />
        <!-- Base : plinthe (3 degrés) + tore -->
        <path d="M${cx - 80} 470h160" stroke-width="1.5" stroke-opacity=".85" />
        <path d="M${cx - 72} 462h144" stroke-width="1.3" stroke-opacity=".72" />
        <path d="M${cx - 64} 454h128" stroke-width="1.1" stroke-opacity=".60" />
        <path d="M${cx - shaftW - 6} ${fBot - 22}v-22" stroke-width="1.1" stroke-opacity=".60" />
        <path d="M${cx + shaftW + 6} ${fBot - 22}v-22" stroke-width="1.1" stroke-opacity=".60" />
        <!-- Fût : deux bords verticaux nets -->
        <path d="M${cx - shaftW} ${fBot}V${fTop}" stroke-width="1.7" stroke-opacity=".90" />
        <path d="M${cx + shaftW} ${fBot}V${fTop}" stroke-width="1.7" stroke-opacity=".90" />
        <!-- Chapiteau généreux : astragale, collier, échine (courbe), abaque (2 paliers) -->
        <path d="M${cx - shaftW - 4} ${fTop}h${(shaftW + 4) * 2}" stroke-width="1.2" stroke-opacity=".72" />
        <path d="M${cx - shaftW - 8} ${fTop - 8}h${(shaftW + 8) * 2}" stroke-width="1.3" stroke-opacity=".78" />
        <path d="M${cx - shaftW - 14} ${fTop - 18}Q${cx} ${fTop - 38} ${cx + shaftW + 14} ${fTop - 18}" stroke-width="1.5" stroke-opacity=".85" />
        <path d="M${cx - shaftW - 22} ${fTop - 44}h${(shaftW + 22) * 2}" stroke-width="1.6" stroke-opacity=".90" />
        <path d="M${cx - shaftW - 26} ${fTop - 54}h${(shaftW + 26) * 2}" stroke-width="1.3" stroke-opacity=".72" />
        <!-- Ombre au sol très discrète -->
        <path d="M${cx - 100} 510h200" stroke-width=".5" stroke-opacity=".22" stroke-dasharray="2 7" />
      </g>`);
  }

  if (name === "faq-ornament") {
    return wrap("0 0 420 570", `
      <g stroke="#829caf" fill="none" stroke-linecap="round" stroke-opacity=".72">
        <circle cx="212" cy="281" r="168" stroke-width="1" />
        <circle cx="212" cy="281" r="143" stroke-width=".8" stroke-dasharray="2 8" />
        <circle cx="212" cy="281" r="119" stroke-width="1" />
        <path d="M212 54v43m0 368v43M-12 281h64m318 0h62M83 152l33 33m211 211 33 33M341 152l-33 33M116 395l-33 33" stroke-width="1" />
        <path d="M211 172c25 57 48 90 92 109-44 19-67 52-92 109-25-57-48-90-92-109 44-19 67-52 92-109Z" stroke-width="1.2" />
        <path d="M146 280h130M211 216v129M164 201a112 112 0 0 1 93 0m-93 161a112 112 0 0 0 93 0" stroke-width=".8" />
        <circle cx="212" cy="281" r="8" stroke="#cda757" stroke-width="1.4" />
      </g>`);
  }

  if (name === "fern") {
    const leaves = Array.from({ length: 12 }, (_, i) => {
      const x = 48 + i * 26, y = 530 - i * 33;
      const size = 72 - i * 2;
      return `<path d="M${x} ${y}q-${size} -12 -${size+18} -${size} q${size} -2 ${size+18} ${size} M${x} ${y}q${size} -34 ${size+15} -${size+24} q-${size} 16 -${size+15} ${size+24}" />`;
    }).join("");
    return wrap("0 0 550 570", `<g stroke="#819c96" stroke-width="1.15" stroke-opacity=".72" stroke-linecap="round" fill="none">
      <path d="M18 564C93 394 223 209 436 33" stroke-width="1.65" />${leaves}
      <path d="M49 543C95 409 231 208 425 44" stroke-width=".6" stroke-dasharray="2 7" />
    </g>`);
  }

  if (name === "corner-arc") {
    return wrap("0 0 520 400", `
      <g stroke="#a8c0d8" stroke-linecap="round" stroke-opacity=".48">
        <path d="M530 64C322-20 107 45 36 254M530 87C335 16 140 62 69 260M530 110C345 42 169 81 105 266" stroke-width=".9" />
        <path d="M146 348c87-55 200-78 356-45M177 365c95-52 204-57 338-31" stroke-width=".75" stroke-dasharray="2 7" />
        <circle cx="145" cy="348" r="7" stroke-width=".8" /><path d="M131 348h28M145 334v28" stroke-width=".7" />
      </g>`);
  }

  return "";
}

/** Cercles de construction autour des médailles, derrière le SVG interactif. */
function medalGeometry(type) {
  const ink = type === "bronze" ? "#c78957" : type === "argent" ? "#91a9c4" : "#d2ae45";
  return `<svg viewBox="0 0 270 270" fill="none" class="home-medal-geometry" aria-hidden="true" focusable="false">
    <circle cx="135" cy="132" r="101" stroke="${ink}" stroke-opacity=".32" stroke-width=".8" />
    <circle cx="135" cy="132" r="118" stroke="${ink}" stroke-opacity=".20" stroke-width=".8" stroke-dasharray="2 9" />
    <circle cx="135" cy="132" r="88" stroke="${ink}" stroke-opacity=".18" stroke-width=".7" />
    <path d="M135 7v12m0 225v12M10 132h12m226 0h12" stroke="${ink}" stroke-opacity=".35" stroke-width=".9" />
    <path d="M52 55a118 118 0 0 1 62-35m94 190a118 118 0 0 1-52 32" stroke="${ink}" stroke-opacity=".46" stroke-width="1.2" />
  </svg>`;
}

/* --------------------------- Petits blocs --------------------------- */

function sectionTitle({ eyebrow: eyebrowText, title, description, centered = false }) {
  return `<div class="${cn("max-w-2xl", centered && "mx-auto text-center")}">
    ${eyebrow(eyebrowText, { className: centered ? "justify-center" : "" })}
    <h2 class="mt-3 text-[1.6rem] leading-[1.16] font-semibold tracking-[-0.035em] text-ink-900 sm:text-[2.05rem]">${esc(title)}</h2>
    <p class="mt-3 text-[0.92rem] leading-relaxed text-muted">${esc(description)}</p>
  </div>`;
}

/* ------------------------- Carrousel héroïque ------------------------- */

const ROTATOR_SLIDES = [
  { type: "bronze", label: "Médaille de bronze", threshold: "10 à 19 ans", accent: "green" },
  { type: "argent", label: "Médaille d'argent", threshold: "20 à 29 ans", accent: "blue" },
  { type: "or", label: "Médaille d'or", threshold: "30 ans et plus", accent: "gold" },
];

const ROTATOR_BADGE_STYLES = {
  green: "border-republic-green-200 bg-white/95 text-republic-green-700",
  blue: "border-republic-blue-200 bg-white/95 text-republic-blue-700",
  gold: "border-gold-200 bg-gold-50/95 text-gold-800",
};

/** État local du carrousel (équivalent des `useState` du composant React). */
const rotator = { index: 0, timer: null };

/** Même silhouette que l'icône utilisateur existante, avec deux formes
 * séparées afin d'animer la tête sans déformer le corps. */
function homeUserIcon(size = "size-4") {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" class="${size} home-user-icon">
    <circle class="home-user-head" cx="12" cy="8.2" r="3.7" />
    <path class="home-user-body" d="M4.8 20c.7-3.7 3.6-6 7.2-6s6.5 2.3 7.2 6" />
  </svg>`;
}

function rotatorBadgeHtml(slide) {
  return `<span class="${cn(
    "block rounded-full border px-3 py-2 text-[0.625rem] font-semibold shadow-card backdrop-blur-sm transition-colors",
    ROTATOR_BADGE_STYLES[slide.accent]
  )}">${esc(slide.label)}<span class="ml-1 font-normal opacity-75">· ${esc(slide.threshold)}</span></span>`;
}

function rotatorKindHtml(slide) {
  return `<span class="rounded-full border border-line bg-white/95 px-3 py-2 text-[0.625rem] font-medium text-ink-700 shadow-card backdrop-blur-sm">${
    slide.type === "or" ? "Distinction supérieure" : "Reconnaissance nationale"
  }</span>`;
}

/**
 * Composition héroïque autonome : rotation automatique et arrêt de l'autoplay
 * lorsque la préférence système réduit les mouvements.
 */
function heroMedalRotator() {
  const slide = ROTATOR_SLIDES[rotator.index];
  return `
    <div class="relative flex min-h-[340px] w-full items-center justify-center lg:min-h-[460px]" data-rotator>
      <div class="absolute size-[19rem] rounded-full border border-republic-green-100/80 sm:size-[22rem] lg:size-[26rem]" aria-hidden="true"></div>
      <div class="absolute size-[15rem] rounded-full border border-gold-200/60 [transform:rotate(16deg)] sm:size-[18rem] lg:size-[21rem]" aria-hidden="true"></div>
      <div class="absolute size-[11rem] rounded-full border border-republic-blue-100/70 [transform:rotate(-12deg)] sm:size-[14rem]" aria-hidden="true"></div>

      <div class="absolute top-[7%] left-0 z-20 sm:left-[5%]" data-rotator-badge>${rotatorBadgeHtml(slide)}</div>
      <div class="absolute top-[19%] right-0 z-20 sm:right-[5%]">
        <span class="rounded-full border border-line bg-white/95 px-3 py-1.5 text-[0.6rem] font-medium text-ink-700 shadow-card backdrop-blur-sm" data-rotator-counter>${pad2(rotator.index + 1)} / 03</span>
      </div>
      <div class="absolute right-0 bottom-[16%] z-20 sm:right-[4%]" data-rotator-kind>${rotatorKindHtml(slide)}</div>

      <div class="relative z-10 flex flex-col items-center [perspective:900px]" aria-live="polite">
        <div class="home-medal-float">
          <div class="home-medal-arrive" data-rotator-medal>
            ${medal({ type: slide.type, size: "lg", showRibbon: true, label: `${slide.label}, représentation conceptuelle` })}
          </div>
        </div>
        <p class="mt-1 text-[0.625rem] tracking-[0.14em] text-muted uppercase">Représentation conceptuelle</p>
      </div>
    </div>`;
}

/** Applique l'index courant aux seules zones dynamiques du carrousel. */
function updateRotator() {
  const slide = ROTATOR_SLIDES[rotator.index];
  const set = (selector, html) => {
    const node = document.querySelector(selector);
    if (node) node.innerHTML = html;
  };
  set("[data-rotator-badge]", rotatorBadgeHtml(slide));
  set("[data-rotator-counter]", `${pad2(rotator.index + 1)} / 03`);
  set("[data-rotator-kind]", rotatorKindHtml(slide));
  // Le remplacement du nœud relance l'apparition sans ajouter de contrôle visible.
  set("[data-rotator-medal]", `<div class="home-medal-arrive">${medal({
    type: slide.type,
    size: "lg",
    showRibbon: true,
    label: `${slide.label}, représentation conceptuelle`,
  })}</div>`);
  const wrapper = document.querySelector("[data-rotator-medal]");
  if (wrapper) wrapper.className = "";
}

function moveRotator(direction) {
  rotator.index = (rotator.index + direction + ROTATOR_SLIDES.length) % ROTATOR_SLIDES.length;
  updateRotator();
}

/** Démarre l'autoplay (4500 ms) sauf si les mouvements sont réduits. */
function startRotator() {
  stopRotator();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  rotator.timer = window.setInterval(() => moveRotator(1), 4500);
}

function stopRotator() {
  if (rotator.timer) {
    window.clearInterval(rotator.timer);
    rotator.timer = null;
  }
}

/* ------------------------------- Sections ------------------------------- */

function heroSection() {
  return `
    <section id="accueil" class="relative isolate overflow-hidden bg-white">
      ${homeArt("cartography", "home-art--hero-map")}
      ${homeArt("national-flow", "home-art--hero-flow")}
      ${homeArt("cathedral", "home-art--hero-monument")}
      <div class="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 lg:min-h-[520px] lg:grid-cols-[0.95fr_1.05fr] lg:gap-2 lg:py-16">
        <div class="animate-rise max-w-[600px]">
          ${eyebrow("MEDITRA · médailles du travail")}
          <h1 class="mt-4 text-[2.2rem] leading-[1.05] font-semibold tracking-[-0.045em] text-ink-900 sm:text-[3.2rem] lg:text-[3.5rem]">Reconnaître l&apos;excellence,<br /><span class="font-serif font-medium italic text-republic-green-600">honorer l&apos;engagement.</span></h1>
          <p class="mt-5 max-w-xl text-[1rem] leading-relaxed text-ink-600">MEDITRA — Médaille et Distinctions du Travail — accompagne les entreprises et les organismes habilités dans la constitution des dossiers, l&apos;instruction des demandes et l&apos;organisation des cérémonies de remise des distinctions professionnelles au Gabon.</p>
          <div class="mt-7 flex flex-col gap-3 sm:flex-row">
            ${button({ size: "lg", html: homeUserIcon("size-[18px]") + "Se connecter", attrs: { "data-action": "nav", "data-path": "/login" } })}
            ${button({ size: "lg", variant: "secondary", html: "Découvrir le processus" + icon("arrowRight", "size-4"), attrs: { "data-action": "scroll", "data-target": "processus" } })}
          </div>
          <div class="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[0.8125rem] text-muted">
            <span class="inline-flex items-center gap-2">${icon("shield", "size-4 text-republic-green-600")}Cadre sécurisé</span>
            <span class="inline-flex items-center gap-2">${icon("transparency", "size-4 text-republic-blue-600")}Suivi transparent</span>
            <span class="inline-flex items-center gap-2">${icon("award", "size-4 text-gold-700")}Mérite reconnu</span>
          </div>
        </div>
        <div class="relative flex min-h-[340px] items-center justify-center lg:min-h-[460px]">
          ${heroMedalRotator()}
        </div>
      </div>
    </section>`;
}

function processSection() {
  return `
    <section id="processus" class="relative isolate scroll-mt-24 overflow-hidden border-y border-line bg-white py-14 lg:py-20">
      ${homeArt("senate", "home-art--process-facade")}
      ${homeArt("river", "home-art--process-margin")}
      ${homeArt("palm-frond", "home-art--process-palm")}
      <div class="relative mx-auto max-w-7xl px-5 sm:px-8">
        ${sectionTitle({
          eyebrow: "Une procédure claire et encadrée",
          title: "Du dossier initial à la cérémonie officielle",
          description: "Le dispositif organise les interventions successives des entreprises, des autorités compétentes, du Service des Distinctions et du Trésor.",
        })}
        <div class="home-process-wrap relative mt-10" data-process-visual aria-label="Illustration animée du circuit général, sans lien avec un dossier particulier">
          <div class="home-process-rail" aria-hidden="true"><span class="home-process-fill"></span></div>
          <ol class="home-process-steps space-y-1 lg:flex lg:space-y-0 lg:gap-0">
            ${HOME_PROCESS.map((step, index) =>
              timelineStep({ index: index + 1, icon: step.icon, title: step.title, description: step.description, last: index === HOME_PROCESS.length - 1 })
            ).join("")}
          </ol>
        </div>
        <p class="relative mt-5 text-[0.73rem] text-muted">Parcours illustratif : l’animation ne représente pas l’état d’un dossier particulier.</p>
      </div>
    </section>`;
}

function medalsSection() {
  const cards = HOME_MEDALS.map((item) => {
    return card({
      interactive: true,
      className: cn("relative overflow-hidden p-5 sm:p-6", item.type === "or" && "border-gold-200"),
      html: `
        ${medalGeometry(item.type)}
        ${
          item.type === "or"
            ? '<span class="absolute top-4 right-4 rounded-full bg-gold-100 px-2.5 py-0.5 text-[0.6rem] font-bold tracking-[0.12em] text-gold-800 uppercase">Distinction supérieure</span>'
            : ""
        }
        <div class="relative flex min-h-[210px] items-center justify-center">
          ${medal({ type: item.type, size: "md", showRibbon: true, label: `${item.title}, représentation conceptuelle` })}
        </div>
        <div class="relative mt-4 border-t border-line pt-4">
          <p class="text-[0.65rem] font-bold tracking-[0.18em] text-gold-700 uppercase">${esc(item.duration)}</p>
          <h3 class="mt-1 text-[1rem] font-semibold text-ink-900">${esc(item.title)}</h3>
          <p class="mt-1 text-[0.72rem] font-medium text-ink-600">${esc(item.finish)}</p>
          <p class="mt-2 text-[0.82rem] leading-relaxed text-muted">${esc(item.description)}</p>
        </div>`,
    });
  }).join("");

  return `
    <section id="medailles" class="relative isolate scroll-mt-24 overflow-hidden border-b border-line bg-canvas py-14 lg:py-20">
      ${homeArt("river", "home-art--medals-coast")}
      ${homeArt("medals-engraving", "home-art--medals-engraving")}
      <div class="relative mx-auto max-w-7xl px-5 sm:px-8">
        ${sectionTitle({
          centered: true,
          eyebrow: "Les distinctions nationales",
          title: "Une reconnaissance qui suit le temps",
          description: "Trois niveaux de décoration rendent hommage à la durée, à la constance et à la qualité de l'engagement professionnel.",
        })}
        <div class="mt-10 grid gap-4 md:grid-cols-3">${cards}</div>
        <p class="mx-auto mt-6 max-w-2xl text-center text-[0.73rem] leading-relaxed text-muted">Les seuils d&apos;ancienneté sont présentés à titre informatif. Les conditions particulières et les éventuels assouplissements sont examinés selon les règles applicables ; l&apos;ancienneté seule ne garantit pas l&apos;attribution d&apos;une distinction.</p>
      </div>
    </section>`;
}

function valuesSection() {
  const cards = HOME_VALUES.map((value) => {
    const style = ACCENT_STYLES[value.accent];
    const rule =
      value.accent === "green" ? "bg-republic-green-500" : value.accent === "gold" ? "bg-gold-400" : "bg-republic-blue-500";
    return card({
      interactive: true,
      className: cn("relative z-10 bg-white/95 p-5 sm:p-6", style.border),
      html: `
        <span class="${cn("flex size-10 items-center justify-center rounded-xl", style.icon)}">${icon(value.icon, "size-5")}</span>
        <h3 class="mt-4 text-[0.95rem] font-semibold text-ink-900">${esc(value.title)}</h3>
        <p class="mt-2 text-[0.82rem] leading-relaxed text-muted">${esc(value.description)}</p>
        <span class="${cn("mt-4 block h-px w-7", rule)}"></span>`,
    });
  }).join("");

  return `
    <section id="valeurs" class="relative isolate scroll-mt-24 overflow-hidden bg-white py-14 lg:py-20">
      ${homeArt("forest", "home-art--values-forest")}
      ${homeArt("corner-arc", "home-art--values-arc")}
      <div class="relative mx-auto max-w-7xl px-5 sm:px-8">
        ${sectionTitle({
          eyebrow: "Le sens du dispositif",
          title: "Le mérite, une valeur nationale",
          description: "Les distinctions nationales valorisent l'engagement professionnel et reconnaissent les parcours qui contribuent au développement du Gabon. Le dispositif vise à encadrer l'examen des demandes, le suivi des dossiers et l'organisation des cérémonies dans un cadre administratif structuré.",
        })}
        <div class="mt-9 grid gap-4 md:grid-cols-3">${cards}</div>
      </div>
    </section>`;
}

function adjustmentsSection() {
  const cards = HOME_ADJUSTMENTS.map((item) => {
    const style = ACCENT_STYLES[item.accent];
    return card({
      interactive: true,
      className: cn("relative bg-white/95 p-5 sm:p-6", style.border),
      html: `
        <span class="${cn("flex size-10 items-center justify-center rounded-xl", style.icon)}">${icon(item.icon, "size-5")}</span>
        <h3 class="mt-4 text-[0.95rem] leading-snug font-semibold text-ink-900">${esc(item.title)}</h3>
        <p class="mt-2.5 text-[0.82rem] leading-relaxed text-muted">${esc(item.description)}</p>`,
    });
  }).join("");

  return `
    <section id="situations" class="relative isolate scroll-mt-24 overflow-hidden border-y border-line bg-canvas py-14 lg:py-16">
      ${homeArt("river", "home-art--adjustments-river")}
      ${homeArt("engraved-column", "home-art--adjustments-column")}
      <div class="relative mx-auto max-w-7xl px-5 sm:px-8">
        ${sectionTitle({
          eyebrow: "Un cadre attentif",
          title: "Des situations particulières examinées avec soin",
          description: "Les cas particuliers sont documentés et soumis à l'examen du service compétent. Ces indications ne préjugent pas de l'issue d'une demande.",
        })}
        <div class="mt-9 grid gap-4 md:grid-cols-3">${cards}</div>
      </div>
    </section>`;
}

function statsSection() {
  return `
    <section id="chiffres" class="relative isolate scroll-mt-24 overflow-hidden bg-ink-900 py-14 lg:py-16">
      ${homeArt("horizon", "home-art--stats-horizon")}
      ${homeArt("forest", "home-art--stats-forest")}
      <div class="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div class="max-w-2xl">
          ${eyebrow("Quelques repères")}
          <h2 class="mt-3 text-[1.6rem] leading-tight font-semibold tracking-[-0.03em] text-ink-900 sm:text-[2.05rem]">Le dispositif en quelques chiffres.</h2>
          <p class="mt-3 text-[0.9rem] leading-relaxed text-ink-600">Données de démonstration présentées pour illustrer les indicateurs que le portail pourra suivre. Elles ne constituent pas des statistiques officielles.</p>
        </div>
        <div class="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          ${statCard({ value: 2480, label: "Dossiers traités", detail: "Donnée de démonstration", icon: "folder", accent: "green" })}
          ${statCard({ value: 1864, label: "Récipiendaires recensés", detail: "Donnée de démonstration", icon: "users", accent: "blue" })}
          ${statCard({ value: 1320, label: "Distinctions attribuées", detail: "Donnée de démonstration", icon: "medal", accent: "gold" })}
          ${statCard({ value: 12, label: "Cérémonies organisées", detail: "Donnée de démonstration", icon: "calendar", accent: "green" })}
        </div>
      </div>
    </section>`;
}

function faqSection() {
  return `
    <section id="faq" class="relative isolate scroll-mt-24 overflow-hidden py-14 lg:py-20">
      ${homeArt("faq-ornament", "home-art--faq-ornament")}
      ${homeArt("fern", "home-art--faq-fern")}
      <div class="relative mx-auto max-w-5xl px-5 sm:px-8">
        ${sectionTitle({
          eyebrow: "Pour vous accompagner",
          title: "Questions fréquentes",
          description: "Les réponses essentielles pour préparer votre dossier, suivre son instruction et organiser la remise des distinctions.",
        })}
        <div class="home-faq-list mt-9 border-t border-line">
          ${HOME_FAQ.map((item, index) => `
            <details class="home-faq-item border-b border-line" data-faq-item>
              <summary class="home-faq-question">
                <span class="home-faq-index">${pad2(index + 1)}</span>
                <span class="home-faq-title">${esc(item.question)}</span>
                <span class="home-faq-toggle" aria-hidden="true">${icon("plus", "size-4")}</span>
              </summary>
              <div class="home-faq-answer"><div class="home-faq-answer-inner">
                ${item.answer}
                ${index === 11 ? '<button type="button" data-action="scroll" data-target="contact" class="home-faq-contact">Aller à la rubrique contact ' + icon("arrowRight", "size-4") + '</button>' : ''}
              </div></div>
            </details>`).join("")}
        </div>
      </div>
    </section>`;
}

function contactSection() {
  return `
    <section id="contact" class="relative isolate scroll-mt-24 overflow-hidden bg-white py-14 lg:py-16">
      ${homeArt("national-flow", "home-art--contact-flow")}
      <div class="relative mx-auto max-w-5xl px-5 sm:px-8">
        <div class="relative overflow-hidden rounded-[2rem] border border-line bg-canvas/95 px-6 py-10 text-center sm:px-12 sm:py-12">
          ${homeArt("corner-arc", "home-art--contact-corner")}
          <div class="relative">
            ${tricolor({ className: "mx-auto", segment: 20 })}
            <h2 class="mx-auto mt-5 max-w-2xl text-[1.6rem] leading-tight font-semibold tracking-[-0.03em] text-ink-900 sm:text-[2.05rem]">Vous représentez une entreprise reconnue ?</h2>
            <p class="mx-auto mt-3 max-w-xl text-[0.92rem] leading-relaxed text-muted">Accédez à votre espace pour déposer une demande, suivre son instruction et préparer la remise officielle des distinctions.</p>
            ${button({ size: "lg", className: "mt-6", html: "Accéder à mon espace" + icon("arrowRight", "size-4"), attrs: { "data-action": "nav", "data-path": "/login" } })}
          </div>
        </div>
      </div>
    </section>`;
}

/* -------------------------------- En-tête -------------------------------- */

/** @param {SessionUser | null} session */
function siteHeader(session) {
  const nav = HOME_NAV.map(
    (item) => `
      <button type="button" data-action="scroll" data-target="${item.id}" data-nav-desktop="${item.id}"
              class="relative flex items-center px-2.5 text-[0.78rem] font-medium transition-colors text-ink-600 hover:text-ink-900">
        ${esc(item.label)}
        <span class="absolute inset-x-2.5 bottom-0 h-[2.5px] rounded-full bg-republic-green-500 transition-all duration-300 scale-x-0 opacity-0" aria-hidden="true"></span>
      </button>`
  ).join("");

  const account = session
    ? `<div class="hidden items-center gap-2 sm:flex">
         <span class="flex h-9 w-9 items-center justify-center rounded-full bg-ink-50 text-[0.8125rem] font-semibold text-ink-700 ring-1 ring-line" title="${esc(session.email)}">${esc(session.email.slice(0, 1).toUpperCase())}</span>
         ${button({ variant: "ghost", size: "sm", html: "Se déconnecter", attrs: { "data-action": "signout" } })}
       </div>`
    : `<a class="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line-strong bg-white px-4 text-[0.8125rem] font-medium text-ink-800 transition-colors hover:bg-canvas" href="/connexion/">${homeUserIcon("size-4 text-republic-blue-600")}Se connecter</a>`;

  const mobileAccount = session
    ? button({ variant: "secondary", fullWidth: true, html: "Se déconnecter", attrs: { "data-action": "signout" } })
    : `<a class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-republic-green-600 px-4 py-3 text-[0.875rem] font-semibold text-white" href="/connexion/">${homeUserIcon("size-4")}Se connecter</a>`;

  const mobileNav = HOME_NAV.map(
    (item) => `
      <li>
        <button type="button" data-action="scroll" data-target="${item.id}" data-nav-mobile="${item.id}"
                class="flex w-full items-center justify-between py-3.5 text-left text-[0.9375rem] font-medium text-ink-800">
          ${esc(item.label)}
          ${icon("arrowRight", "size-4 text-ink-300")}
        </button>
      </li>`
  ).join("");

  return `
    <header data-site-header class="home-site-header sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-shadow duration-300 shadow-[0_1px_0_#E5EAF0]">
      ${homeArt("national-flow", "home-art--header-flow")}
      <div class="relative mx-auto flex h-[64px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <a href="/" class="group flex min-w-0 items-center gap-3 text-left"
                aria-label="Accueil — MEDITRA, Médaille et Distinctions du Travail">
          ${meditraBrand({ size: 40, sub: "République Gabonaise" })}
        </a>

        <nav class="hidden h-full items-stretch gap-0 xl:flex" aria-label="Navigation principale">${nav}</nav>

        <div class="flex items-center gap-2">
          ${account}
          <button type="button" data-action="toggle-menu" aria-expanded="false" aria-controls="menu-mobile" aria-label="Ouvrir le menu"
                  class="flex size-9 items-center justify-center rounded-lg border border-line text-ink-700 transition-colors hover:bg-canvas xl:hidden">
            ${icon("menu", "size-5")}
          </button>
        </div>
      </div>

      <div id="menu-mobile" hidden class="animate-fade border-t border-line bg-white xl:hidden">
        <nav class="mx-auto max-w-7xl px-5 py-2 sm:px-8" aria-label="Navigation mobile">
          <ul class="divide-y divide-line">${mobileNav}</ul>
          <div class="py-3">${mobileAccount}</div>
        </nav>
      </div>
    </header>`;
}

/* ------------------------------- Pied de page ------------------------------ */

const FOOTER_LINKS = [
  { label: "Les médailles", id: "medailles" },
  { label: "Le processus", id: "processus" },
  { label: "Questions fréquentes", id: "faq" },
  { label: "Contact", id: "contact" },
];

const FOOTER_PENDING = ["Mentions légales", "Conditions d'utilisation", "Données personnelles"];

function siteFooter() {
  const year = new Date().getFullYear();

  return `
    <footer class="home-footer relative isolate overflow-hidden border-t border-line bg-canvas">
      ${homeArt("river", "home-art--footer-river")}
      ${homeArt("national-flow", "home-art--footer-tricolor")}
      ${homeArt("forest", "home-art--footer-forest")}
      ${homeArt("palm-frond", "home-art--footer-palm")}
      <div class="relative mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr] lg:gap-12">
        <div>
          <div class="flex items-center gap-3">
            ${meditraBrand({ size: 40, sub: "République Gabonaise" })}
          </div>
          <p class="mt-4 max-w-sm text-[0.82rem] leading-relaxed text-muted">MEDITRA — portail de dépôt, de suivi et d&apos;attribution des médailles et diplômes honorifiques du travail, réservé aux entreprises reconnues et aux services administratifs habilités.</p>
          ${tricolor({ className: "mt-4", segment: 18 })}
        </div>

        <div>
          <h3 class="text-[0.65rem] font-semibold tracking-[0.2em] text-ink-700 uppercase">Le portail</h3>
          <ul class="mt-3 space-y-2 text-[0.82rem]">
            ${FOOTER_LINKS.map(
              (link) =>
                `<li><button type="button" data-action="scroll" data-target="${link.id}" class="text-muted transition-colors hover:text-ink-900">${esc(link.label)}</button></li>`
            ).join("")}
            <li><a href="/connexion/" class="font-medium text-republic-green-700 transition-colors hover:text-republic-green-600">Se connecter</a></li>
          </ul>
        </div>

        <div>
          <h3 class="text-[0.65rem] font-semibold tracking-[0.2em] text-ink-700 uppercase">Informations</h3>
          <ul class="mt-3 space-y-2 text-[0.82rem]">
            <li>
              <button type="button" data-action="scroll" data-target="contact" class="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-ink-900">
                ${icon("info", "size-4")}Contact et assistance
              </button>
            </li>
            ${FOOTER_PENDING.map(
              (item) =>
                `<li class="flex flex-wrap items-center gap-2 text-slate-500">${esc(item)}
                  <span class="rounded-full border border-line-strong bg-white px-2 py-0.5 text-[0.6rem] font-medium tracking-wide text-slate-500 uppercase">à publier</span>
                </li>`
            ).join("")}
          </ul>
        </div>
      </div>

      <div class="home-footer-bottom relative border-t border-line bg-white/90">
        <div class="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-4 text-[0.72rem] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© ${year} République Gabonaise — MEDITRA, Médaille et Distinctions du Travail.</p>
          <p>Visuels de présentation non contractuels.</p>
        </div>
      </div>
    </footer>`;
}

/* --------------------------------- Vue --------------------------------- */

/** Lien d'évitement (identique à celui de `src/App.tsx`). */
function skipLink() {
  return `<a href="#contenu" class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white">Aller au contenu principal</a>`;
}

/** @param {SessionUser | null} session */
function renderHome(session) {
  return `
    <div class="home-page flex min-h-dvh flex-col bg-white">
      <div class="home-progress" role="progressbar" aria-label="Progression de lecture" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-home-progress>
        <span class="home-progress-track"><span data-home-segment="green"></span></span>
        <span class="home-progress-track"><span data-home-segment="yellow"></span></span>
        <span class="home-progress-track"><span data-home-segment="blue"></span></span>
      </div>
      ${skipLink()}
      ${siteHeader(session)}
      <main id="contenu" class="flex-1">
        ${heroSection()}
        ${processSection()}
        ${medalsSection()}
        ${valuesSection()}
        ${adjustmentsSection()}
        ${statsSection()}
        ${faqSection()}
        ${contactSection()}
      </main>
      ${siteFooter()}
      <button type="button" data-action="home-top" data-back-to-top
        aria-label="Revenir en haut" aria-hidden="true" tabindex="-1"
        class="home-back-top"><span class="home-back-top-icon">${icon("arrowRight", "size-4 -rotate-90")}</span></button>
    </div>`;
}

/** Nettoyables installés après montage de la page d'accueil. */
let homeCleanups = [];

/** Libère le carrousel, le scroll-spy et les écouteurs avant de quitter l'accueil. */
function unmountHome() {
  homeCleanups.forEach((cleanup) => cleanup());
  homeCleanups = [];
}

/**
 * Active les comportements de la page d'accueil :
 * ombre de l'en-tête au défilement, scroll-spy, carrousel, compteurs.
 */
function mountHome() {
  unmountHome();

  // Un seul passage par frame pour la barre, le bouton, l'ombre et le
  // scroll-spy. Les identifiants suivent l'ordre réel des sections du DOM.
  const header = document.querySelector("[data-site-header]");
  const progress = document.querySelector("[data-home-progress]");
  const backTop = document.querySelector("[data-back-to-top]");
  const sections = HOME_NAV.map((item) => document.getElementById(item.id)).filter(Boolean);
  let frame = 0;
  let activeId = "";
  const updateScrollUI = () => {
    frame = 0;
    const y = window.scrollY;
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const amount = max ? Math.min(1, Math.max(0, y / max)) : 0;
    if (progress) {
      // Trois portions réellement distinctes : seule la couleur du tiers
      // atteint par le défilement commence à apparaître.
      const fills = progress.querySelectorAll("[data-home-segment]");
      fills.forEach((fill, i) => {
        const filled = Math.max(0, Math.min(1, amount * 3 - i));
        fill.style.transform = `scaleX(${filled})`;
      });
      progress.setAttribute("aria-valuenow", String(Math.round(amount * 100)));
    }
    if (header) {
      header.classList.toggle("shadow-[0_1px_0_#E5EAF0,0_8px_24px_-18px_rgba(16,42,80,0.25)]", y > 8);
      header.classList.toggle("shadow-[0_1px_0_#E5EAF0]", y <= 8);
    }
    if (backTop) {
      const show = y > 460;
      backTop.classList.toggle("is-visible", show);
      backTop.setAttribute("aria-hidden", String(!show));
      backTop.tabIndex = show ? 0 : -1;
    }
    const readingLine = (header?.offsetHeight || 76) + Math.min(130, window.innerHeight * .19);
    let current = sections[0]?.id || "";
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= readingLine) current = section.id;
      else break;
    }
    if (max - y < 3) current = sections.at(-1)?.id || current;
    if (current && current !== activeId) {
      activeId = current;
      setActiveSection(current);
    }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(updateScrollUI); };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
  if (resizeObserver) {
    resizeObserver.observe(document.querySelector("main") || document.body);
    resizeObserver.observe(document.querySelector("footer") || document.body);
  }
  updateScrollUI();
  homeCleanups.push(() => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    resizeObserver?.disconnect();
    if (frame) cancelAnimationFrame(frame);
  });

  // Révélation à usage unique. Sans JS, sans Observer ou en mouvement réduit,
  // tous les contenus restent visibles et immédiatement accessibles.
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
    const targets = document.querySelectorAll("main section h2, main section h2 + p, #processus ol > li, #medailles .grid > div, #valeurs .grid > div, #situations .grid > div, #chiffres .grid > div");
    const reveal = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.remove("is-pending");
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: .06, rootMargin: "0px 0px -5% 0px" });
    targets.forEach((element) => {
      element.classList.add("home-reveal");
      // Stagger plafonné à 360 ms pour ne pas faire attendre l'utilisateur ;
      // au-delà de quatre frères, on garde le délai du dernier.
      const index = Array.from(element.parentElement.children).indexOf(element);
      const staggerIndex = Math.min(index, 4);
      const delay = element.matches("h2 + p") ? 100
        : element.matches("h2") ? 0
        : staggerIndex * 90;
      element.style.setProperty("--reveal-delay", `${delay}ms`);
      if (element.getBoundingClientRect().top > window.innerHeight * .88) {
        element.classList.add("is-pending");
        reveal.observe(element);
      }
    });
    homeCleanups.push(() => reveal.disconnect());
  }

  // 3. Carrousel de médailles.
  startRotator();
  homeCleanups.push(stopRotator);

  // 4. Compteurs animés.
  homeCleanups.push(animateStats(document));

  // Illustration séquentielle du circuit, suspendue hors écran.
  homeCleanups.push(mountProcessVisual());

  // Un seul panneau FAQ ouvert à la fois ; le navigateur garde les
  // sémantiques et interactions clavier natives de <details>/<summary>.
  const faq = document.getElementById("faq");
  if (faq) {
    const onFaqToggle = (event) => {
      const detail = event.target;
      if (!detail.matches?.("[data-faq-item]") || !detail.open) return;
      faq.querySelectorAll("[data-faq-item]").forEach((other) => {
        if (other !== detail && other.open) other.open = false;
      });
    };
    faq.addEventListener("toggle", onFaqToggle, true);
    homeCleanups.push(() => faq.removeEventListener("toggle", onFaqToggle, true));
  }
}

/** Progression illustrative : un seul marqueur actif et une ligne qui
 * avance jusqu'à lui. Aucun état métier n'est lu ou modifié. */
function mountProcessVisual() {
  const wrap = document.querySelector("[data-process-visual]");
  if (!wrap) return () => {};
  const items = Array.from(wrap.querySelectorAll(".home-process-steps > li"));
  const markers = items.map((item) => item.querySelector(":scope > span:last-of-type"));
  const rail = wrap.querySelector(".home-process-rail");
  let current = 0;
  let timeout = 0;
  let visible = false;
  let frame = 0;

  const positionRail = () => {
    frame = 0;
    if (!markers[0] || !markers.at(-1)) return;
    const box = wrap.getBoundingClientRect();
    const first = markers[0].getBoundingClientRect();
    const last = markers.at(-1).getBoundingClientRect();
    const x1 = first.left + first.width / 2 - box.left;
    const y1 = first.top + first.height / 2 - box.top;
    const x2 = last.left + last.width / 2 - box.left;
    const y2 = last.top + last.height / 2 - box.top;
    rail.style.left = `${x1}px`;
    rail.style.top = `${y1}px`;
    if (window.matchMedia("(min-width: 1024px)").matches) {
      rail.style.width = `${Math.max(0, x2 - x1)}px`;
      rail.style.height = "2px";
    } else {
      rail.style.width = "2px";
      rail.style.height = `${Math.max(0, y2 - y1)}px`;
    }
  };
  const measure = () => { if (!frame) frame = requestAnimationFrame(positionRail); };
  const activate = () => items.forEach((item, index) => {
    item.classList.toggle("is-active", index === current);
    item.classList.toggle("is-complete", index < current);
  });
  const queue = (ms) => { timeout = window.setTimeout(advance, ms); };
  const advance = () => {
    timeout = 0;
    if (!visible) return;
    if (current === items.length - 1) {
      rail.classList.add("is-resetting");
      current = 0;
      rail.style.setProperty("--process-progress", "0");
      activate();
      // Fixer immédiatement la piste à zéro avant de réactiver la transition.
      void rail.offsetWidth;
      requestAnimationFrame(() => rail.classList.remove("is-resetting"));
      queue(1250);
    } else {
      rail.style.setProperty("--process-progress", String((current + 1) / (items.length - 1)));
      timeout = window.setTimeout(() => {
        timeout = 0;
        if (!visible) return;
        current++;
        activate();
        queue(860);
      }, 440);
    }
  };
  positionRail();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    wrap.classList.add("is-reduced");
    return () => { if (frame) cancelAnimationFrame(frame); };
  }
  wrap.classList.add("is-animated");
  activate();
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !timeout) queue(1000);
    if (!visible && timeout) {
      window.clearTimeout(timeout);
      timeout = 0;
      rail.style.setProperty("--process-progress", String(current / (items.length - 1)));
    }
  }, { threshold: .08 });
  observer.observe(wrap);
  window.addEventListener("resize", measure, { passive: true });
  return () => {
    observer.disconnect();
    window.removeEventListener("resize", measure);
    if (timeout) window.clearTimeout(timeout);
    if (frame) cancelAnimationFrame(frame);
  };
}

function setActiveSection(id) {
  HOME_NAV.forEach((item) => {
    const isActive = item.id === id;

    const desktop = document.querySelector(`[data-nav-desktop="${item.id}"]`);
    if (desktop) {
      desktop.classList.toggle("text-ink-900", isActive);
      desktop.classList.toggle("text-ink-600", !isActive);
      if (isActive) desktop.setAttribute("aria-current", "true");
      else desktop.removeAttribute("aria-current");
      const rule = desktop.querySelector("span");
      if (rule) {
        rule.classList.toggle("scale-x-100", isActive);
        rule.classList.toggle("opacity-100", isActive);
        rule.classList.toggle("scale-x-0", !isActive);
        rule.classList.toggle("opacity-0", !isActive);
      }
    }

    const mobile = document.querySelector(`[data-nav-mobile="${item.id}"]`);
    if (mobile) {
      mobile.classList.toggle("text-republic-green-700", isActive);
      mobile.classList.toggle("text-ink-800", !isActive);
      if (isActive) mobile.setAttribute("aria-current", "true");
      else mobile.removeAttribute("aria-current");
    }
  });
}
