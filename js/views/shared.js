/* ==================================================================
   js/views/shared.js — Composants partagés entre tous les espaces.

   Responsabilités :
   1. Sélecteur de profil de démo (visible uniquement en mode présentation,
      explicitement labellé comme tel).
   2. Assistant flottant : panneau commun qui répond à des questions
      sur l'utilisation, avec réponses préparées selon le rôle.
   3. État partagé cross-profils (localStorage) : les actions d'un profil
      sont visibles aux autres lors d'un changement de profil.

   Aucune valeur administrative : tout est fictif.
================================================================== */

(function () {
  "use strict";

  // ----- 1) État partagé cross-profils via localStorage -----
  const SHARED_KEY = "dn.shared.v1";
  const SHARED_DEFAULT = {
    dossiersMutations: {},   // { ref: { status, lastUpdate, by, comment } }
    ceremoniesMutations: {}, // { id: { status, lastUpdate } }
    notices: [],             // notifications cross-profils supplémentaires
    lastSwitchAt: null,      // horodatage du dernier switch
  };

  function sharedLoad() {
    try {
      const raw = localStorage.getItem(SHARED_KEY);
      if (!raw) return JSON.parse(JSON.stringify(SHARED_DEFAULT));
      const parsed = JSON.parse(raw);
      return Object.assign(JSON.parse(JSON.stringify(SHARED_DEFAULT)), parsed);
    } catch {
      return JSON.parse(JSON.stringify(SHARED_DEFAULT));
    }
  }

  function sharedSave(state) {
    try { localStorage.setItem(SHARED_KEY, JSON.stringify(state)); }
    catch { /* quota / disabled */ }
  }

  const Shared = {
    load: sharedLoad,
    save: sharedSave,
    /** Met à jour un dossier dans l'état partagé. */
    updateDossier(ref, patch, by) {
      const s = sharedLoad();
      s.dossiersMutations[ref] = Object.assign(
        { lastUpdate: new Date().toISOString().slice(0, 10), by: by || "—" },
        s.dossiersMutations[ref] || {},
        patch
      );
      sharedSave(s);
    },
    /** Met à jour une cérémonie. */
    updateCeremony(id, patch) {
      const s = sharedLoad();
      s.ceremoniesMutations[id] = Object.assign(
        { lastUpdate: new Date().toISOString().slice(0, 10) },
        s.ceremoniesMutations[id] || {},
        patch
      );
      sharedSave(s);
    },
    /** Ajoute une notification cross-profils. */
    pushNotice(notice) {
      const s = sharedLoad();
      s.notices.unshift(Object.assign(
        { id: "N" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
          date: new Date().toISOString().slice(0, 10),
          read: false },
        notice
      ));
      // Limite à 50
      s.notices = s.notices.slice(0, 50);
      sharedSave(s);
    },
    /** Lit les mutations appliquées à un dossier. */
    dossierMutation(ref) {
      return sharedLoad().dossiersMutations[ref] || null;
    },
    ceremonyMutation(id) {
      return sharedLoad().ceremoniesMutations[id] || null;
    },
    extraNotices() {
      return sharedLoad().notices;
    },
    reset() {
      try { localStorage.removeItem(SHARED_KEY); } catch { /* noop */ }
    },
  };
  window.DNShared = Shared;

  // ----- 2) Sélecteur de profil de démo -----
  // Génère le HTML du popover "Changer de profil" qui s'affiche
  // quand wsState.switcherOpen === true.
  function isPresentationMode() {
    try {
      if (typeof PRESENTATION_MODE !== "undefined" && PRESENTATION_MODE) return true;
    } catch {}
    try {
      if (typeof window !== "undefined" && window.PRESENTATION_MODE) return true;
    } catch {}
    return false;
  }
  function renderProfileSwitcher(currentRole) {
    if (!isPresentationMode()) return "";
    const roles = [
      { role: "demandeur", label: "Demandeur Entreprise", email: "demo.entreprise@example.test", accent: "green" },
      { role: "demandeur", label: "Demandeur Ministère", email: "demo.ministere@example.test", accent: "green" },
      { role: "recipient", label: "Récipiendaire / Personne", email: "demo.personne@example.test", accent: "gold" },
      { role: "secretariat_ministre", label: "Secrétariat du Ministre", email: "demo.secretariat.ministre@example.test", accent: "blue" },
      { role: "secretariat_dgt", label: "Secrétariat de la DGT", email: "demo.secretariat.dgt@example.test", accent: "blue" },
      { role: "secretariat_dr", label: "Secrétariat de la DR", email: "demo.secretariat.dr@example.test", accent: "blue" },
      { role: "ministre", label: "Ministre", email: "demo.ministre@example.test", accent: "blue" },
      { role: "dgt", label: "DGT", email: "demo.dgt@example.test", accent: "blue" },
      { role: "dr", label: "Direction Régionale", email: "demo.dr@example.test", accent: "green" },
      { role: "service_agent", label: "Service — Agent", email: "demo.service.agent@example.test", accent: "green" },
      { role: "service_inspecteur", label: "Service — Inspecteur", email: "demo.service.inspecteur@example.test", accent: "green" },
      { role: "service_chef", label: "Service — Chef", email: "demo.service.chef@example.test", accent: "green" },
      { role: "regisseur", label: "Régisseur des Médailles", email: "demo.regisseur@example.test", accent: "gold" },
      { role: "admin", label: "Administrateur", email: "demo.admin@example.test", accent: "blue" },
    ];
    const accentBg = (a) => a === "green" ? "bg-republic-green-50 text-republic-green-700 border-republic-green-200"
      : a === "gold" ? "bg-gold-50 text-gold-800 border-gold-200"
      : "bg-republic-blue-50 text-republic-blue-700 border-republic-blue-200";
    return `<div class="ws-popover ws-switcher-popover" role="region" aria-label="Changer de profil">
      <div class="ws-popover-title">
        <strong>Changer de profil</strong>
        <span class="ws-popover-meta">14 profils</span>
      </div>
      <p class="ws-switcher-hint">Sélectionnez un profil pour basculer dans son espace.</p>
      <div class="ws-switcher-grid">${roles.map((r) => {
        const isCurrent = r.email === (window.__demoEmail || "") && r.role === currentRole;
        return `<button type="button" data-action="ws-switch-role" data-role="${r.role}" data-email="${r.email}" class="ws-switcher-item ${isCurrent ? "is-current" : ""}">
          <span class="ws-switcher-accent ${accentBg(r.accent)}">${r.label.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</span>
          <span class="ws-switcher-body">
            <strong>${r.label}</strong>
            <small>${r.email}</small>
          </span>
        </button>`;
      }).join("")}</div>
    </div>`;
  }

  // Action de switch : met à jour l'email de démo + navigation
  function doSwitchProfile(role, email) {
    try {
      if (typeof enterPresentation === "function") enterPresentation(role, email);
      else if (email) window.sessionStorage.setItem("dn.presentation.email", email);
      window.__demoEmail = email;
    } catch { /* noop */ }
    // Ferme le switcher et navigue
    if (typeof window.workspaceState !== "undefined" && window.workspaceState) {
      window.workspaceState.switcherOpen = false;
    }
    if (typeof navigateTo === "function") {
      navigateTo("/app/" + role + "/overview");
    } else {
      window.location.hash = "#/app/" + role + "/overview";
    }
  }

  // ----- 3) Assistant flottant (panneau commun) -----
  // Base de réponses préparées, filtrées par rôle.
  const ASSISTANT_RESPONSES = {
    demandeur: [
      { q: ["dossier", "déposer"], a: "Pour déposer un nouveau dossier, utilisez l'assistant en 5 étapes accessible depuis le bouton « Nouveau dossier » de votre tableau de bord." },
      { q: ["paiement", "quittance", "ordre de recette"], a: "Vos ordres de recette et quittances sont listés sur la page « Ordres de recette ». Vous pouvez télécharger l'aperçu de chaque ordre." },
      { q: ["cérémonie"], a: "Les cérémonies de votre organisation sont listées sur la page « Cérémonies » et apparaissent également sur le calendrier partagé." },
      { q: ["employé", "affiliation"], a: "Vos employés et affiliations sont visibles sur la page « Employés ». Seuls les salariés actifs peuvent être ajoutés à un nouveau dossier." },
      { q: ["recours"], a: "Le nombre de recours n'est pas limité. Déposez un recours depuis la fiche d'un dossier rejeté." },
    ],
    recipient: [
      { q: ["distinction", "médaille"], a: "Vos distinctions personnelles sont listées sur la page « Mes distinctions » avec le métal, la campagne et l'employeur concerné." },
      { q: ["affiliation"], a: "Vos affiliations passées sont figées en lecture seule. Vous pouvez confirmer une affiliation proposée depuis la page « Mes affiliations »." },
      { q: ["cérémonie"], a: "Vos cérémonies sont visibles sur la page « Mes cérémonies » et sur le calendrier." },
    ],
    secretariat_ministre: [
      { q: ["transmission", "transmettre"], a: "Pour transmettre un courrier à l'autorité compétente, ouvrez-le depuis la boîte et utilisez le bouton « Transmettre »." },
      { q: ["localisation"], a: "La localisation physique des dossiers est visible uniquement sur votre page « Localisation »." },
    ],
    secretariat_dgt: [
      { q: ["transmission", "transmettre"], a: "Pour transmettre un courrier à l'autorité compétente, ouvrez-le depuis la boîte et utilisez le bouton « Transmettre »." },
    ],
    secretariat_dr: [
      { q: ["transmission", "transmettre"], a: "Pour transmettre un courrier à l'autorité compétente, ouvrez-le depuis la boîte et utilisez le bouton « Transmettre »." },
    ],
    ministre: [
      { q: ["décision", "approuver", "rejeter"], a: "Vos décisions sont prises sur la page « Décisions ». Chaque action est consignée dans le journal d'activité." },
      { q: ["recours"], a: "Les recours reçus à votre niveau sont visibles sur la page « Recours »." },
    ],
    dgt: [
      { q: ["décision", "approuver", "rejeter"], a: "Vos décisions sont prises sur la page « Décisions »." },
    ],
    dr: [
      { q: ["décision", "approuver", "rejeter"], a: "En tant que DR, vous êtes l'autorité de décision finale sur le dossier initial. Utilisez la page « Décisions »." },
      { q: ["rejet", "motif"], a: "Le motif de rejet est facultatif. Saisissez-le dans le champ de décision avant de confirmer." },
    ],
    service_agent: [
      { q: ["instruction", "instruire"], a: "L'instruction d'un dossier se fait sur la page « Dossiers à instruire ». Sélectionnez un dossier pour accéder à la fiche d'instruction." },
      { q: ["complément"], a: "Pour demander un complément, ouvrez un dossier en instruction et utilisez le bouton « Demander un complément »." },
      { q: ["récipiendaire", "valider", "refuser"], a: "La validation ou le refus d'un récipiendaire se fait individuellement sur la page « Récipiendaires » du dossier. Le refus exige un motif." },
    ],
    service_inspecteur: [
      { q: ["contrôle", "contrôler"], a: "Vos contrôles de justificatifs sont gérés sur la page « Contrôles »." },
      { q: ["anomalie"], a: "Pour signaler une anomalie, ouvrez un contrôle et utilisez le bouton « Signaler une anomalie »." },
    ],
    service_chef: [
      { q: ["valider", "validation"], a: "Les validations relevant de votre poste se font sur la page « Dossiers à valider »." },
      { q: ["ordre de recette"], a: "L'émission des ordres de recette se fait sur la page « Ordres de recette ». Le montant est calculé uniquement sur les récipiendaires validés." },
      { q: ["cérémonie"], a: "La planification des cérémonies se fait sur la page « Cérémonies » et le calendrier partagé." },
    ],
    regisseur: [
      { q: ["stock"], a: "Le stock des médailles est visible sur la page « Stock » par métal." },
      { q: ["remise", "quittance"], a: "Pour enregistrer une remise, ouvrez une remise depuis la page « Remises » et saisissez le retirant et la pièce d'identité." },
      { q: ["commande", "fournisseur"], a: "La gestion des fournisseurs et des commandes se fait sur les pages « Fournisseurs » et « Bons de commande »." },
    ],
    admin: [
      { q: ["compte", "utilisateur"], a: "La gestion des comptes internes se fait sur la page « Comptes internes »." },
      { q: ["audit", "journal"], a: "Le journal d'audit est consultable en lecture seule sur la page « Journal »." },
    ],
  };

  // Réponse par défaut
  const DEFAULT_RESPONSES = [
    { q: ["mot de passe"], a: "La procédure de mot de passe oublié se trouve sur la page de connexion, sous le formulaire." },
    { q: ["notification"], a: "Vos notifications sont accessibles depuis la cloche en haut à droite, et en lecture complète sur la page « Notifications »." },
    { q: ["calendrier"], a: "Le calendrier partagé liste les cérémonies visibles selon votre rôle. Cliquez sur une pastille pour ouvrir le détail." },
    { q: ["profil", "rôle", "changer"], a: "Vous pouvez changer de profil à tout moment via le sélecteur de démo dans l'en-tête (en mode présentation)." },
  ];

  function assistantAnswer(role, question) {
    const lower = question.toLowerCase();
    const responses = (ASSISTANT_RESPONSES[role] || []).concat(DEFAULT_RESPONSES);
    for (const r of responses) {
      if (r.q.some((k) => lower.includes(k))) return r.a;
    }
    return "Je peux vous aider sur la navigation, les notifications, le calendrier, les dossiers et les actions selon votre rôle. Essayez : « comment transmettre un courrier ? » ou « comment déposer un dossier ? ».";
  }

  // Plus de bulle d’assistant dans les espaces métier.
  function renderAssistant() {
    return "";
  }

  function escapeAssistant(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Actions de l'assistant
  function assistantToggle() {
    const s = window.__assistantState || { open: false, history: [] };
    s.open = !s.open;
    window.__assistantState = s;
    // Repaint : on ne peut pas re-render toute la page, donc on réinjecte
    if (typeof wsPaint === "function") {
      // re-render du composant seul : on remplace le bloc assistant
      const node = document.querySelector("[data-assistant]");
      if (node) node.outerHTML = renderAssistant(currentRoleFromPath());
    }
  }
  function currentRoleFromPath() {
    const path = (window.location.hash || "").replace(/^#\/?/, "/");
    const m = path.match(/\/app\/([^/]+)/);
    return m ? m[1] : "";
  }
  function assistantSubmit(form) {
    const input = form.querySelector("input[name=q]");
    const q = (input && input.value || "").trim();
    if (!q) return false;
    const s = window.__assistantState || { open: true, history: [] };
    s.history.push({ role: "user", text: q });
    const role = currentRoleFromPath();
    s.history.push({ role: "assistant", text: assistantAnswer(role, q) });
    window.__assistantState = s;
    input.value = "";
    const node = document.querySelector("[data-assistant]");
    if (node) node.outerHTML = renderAssistant(role);
    const newInput = document.getElementById("ws-assistant-input");
    if (newInput) newInput.focus();
    return false;
  }
  function assistantClear() {
    window.__assistantState = { open: true, history: [] };
    const node = document.querySelector("[data-assistant]");
    if (node) node.outerHTML = renderAssistant(currentRoleFromPath());
  }

  // Expose helpers globally (et au scope global pour les <script> classiques)
  if (typeof globalThis !== "undefined") {
    globalThis.renderProfileSwitcher = renderProfileSwitcher;
    globalThis.doSwitchProfile = doSwitchProfile;
    globalThis.renderAssistant = renderAssistant;
    globalThis.assistantToggle = assistantToggle;
    globalThis.assistantSubmit = assistantSubmit;
    globalThis.assistantClear = assistantClear;
  }
  window.renderProfileSwitcher = renderProfileSwitcher;
  window.doSwitchProfile = doSwitchProfile;
  window.renderAssistant = renderAssistant;
  window.assistantToggle = assistantToggle;
  window.assistantSubmit = assistantSubmit;
  window.assistantClear = assistantClear;
})();
