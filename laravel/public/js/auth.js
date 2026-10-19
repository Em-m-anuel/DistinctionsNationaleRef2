/* ==================================================================
   js/auth.js
   Service d'authentification — conversion de `src/lib/auth.ts`.

   Aucun backend n'est inclus dans cette version statique. La connexion
   reste indisponible sans window.DN_AUTH_ENDPOINT : aucun compte fictif
   ne peut ouvrir une session. Les appels réels restent isolés ici.

   @typedef {{ id: string, email: string, company: string, role: string }} SessionUser
   @typedef {{ field: "email"|"password"|"form", message: string }} AuthError
   @typedef {{ ok: true, user: SessionUser } | { ok: false, error: AuthError }} SignInResult
================================================================== */

const AUTH_ENDPOINT = window.DN_AUTH_ENDPOINT || null;
const STORAGE_KEY = "distinctions-nationales.session";

/* ------------------------------- Session ------------------------------- */

const authListeners = new Set();
/** Solution de repli lorsque le stockage navigateur est indisponible. */
let memorySession = null;

/** @returns {SessionUser | null} */
function readSession() {
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ??
      window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.email === "string") return parsed;
    }
  } catch {
    /* stockage refusé ou contenu corrompu : repli en mémoire */
  }
  return memorySession;
}

/** @param {SessionUser} user @param {boolean} remember */
function persistSession(user, remember) {
  memorySession = user;
  try {
    // Si l'utilisateur change « Se souvenir de moi », ne pas laisser une
    // ancienne session persistante dans le second type de stockage.
    const store = remember ? window.localStorage : window.sessionStorage;
    const other = remember ? window.sessionStorage : window.localStorage;
    other.removeItem(STORAGE_KEY);
    store.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    /* stockage indisponible (navigation privée) : session en mémoire */
  }
}

function clearSession() {
  memorySession = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(`${STORAGE_KEY}.token`);
    window.sessionStorage.removeItem(`${STORAGE_KEY}.token`);
  } catch {
    /* ignoré */
  }
}

function emitAuth() {
  authListeners.forEach((listener) => listener());
}

/** @returns {SessionUser | null} */
function getSession() {
  return readSession();
}

/** @param {() => void} listener @returns {() => void} */
function subscribeAuth(listener) {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

function signOut() {
  clearSession();
  emitAuth();
}

/* ------------------------------- Connexion ------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** @returns {AuthError | null} */
function validateCredentials(email, password) {
  if (!email.trim()) {
    return { field: "email", message: "Veuillez saisir votre adresse e-mail." };
  }
  if (!EMAIL_RE.test(email.trim())) {
    return { field: "email", message: "Le format de l'adresse e-mail semble incorrect." };
  }
  if (!password) {
    return { field: "password", message: "Veuillez saisir votre mot de passe." };
  }
  if (password.length < 6) {
    return { field: "password", message: "Le mot de passe doit contenir au moins 6 caractères." };
  }
  return null;
}

/** @param {{email:string,password:string,remember:boolean,space?:string}} input */
async function requestRemoteSession(input) {
  try {
    const response = await fetch(AUTH_ENDPOINT, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        email: input.email.trim(),
        password: input.password,
        remember: input.remember,
        // Le formulaire commun n'impose aucun profil. Conserver le paramètre
        // historique uniquement pour les anciens appels qui le précisent.
        ...(input.space ? { space: input.space } : {}),
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        error: {
          field: "form",
          message:
            (payload && payload.message) ??
            "Connexion impossible. Vérifiez vos identifiants puis réessayez.",
        },
      };
    }

    const raw = (payload && payload.user) || payload || {};
    /** @type {SessionUser} */
    const user = {
      id: String(raw.id ?? "inconnu"),
      email: String(raw.email ?? input.email.trim()),
      company: String(raw.company ?? "—"),
      role: String(raw.role ?? "representant_entreprise"),
    };

    if (input.remember && payload && payload.token) {
      try {
        window.localStorage.setItem(`${STORAGE_KEY}.token`, payload.token);
      } catch {
        /* ignoré */
      }
    }

    persistSession(user, input.remember);
    emitAuth();
    return { ok: true, user };
  } catch {
    return {
      ok: false,
      error: {
        field: "form",
        message:
          "Le service d'authentification est momentanément indisponible. Merci de réessayer dans quelques instants.",
      },
    };
  }
}

/** @param {{email:string,password:string,remember:boolean,space?:string}} input */
async function signIn(input) {
  const invalid = validateCredentials(input.email, input.password);
  if (invalid) return { ok: false, error: invalid };
  if (!AUTH_ENDPOINT) return { ok: false, error: {
    field: "form", message: "Connexion indisponible : aucun service d'authentification n'est configuré."
  } };
  return requestRemoteSession(input);
}
