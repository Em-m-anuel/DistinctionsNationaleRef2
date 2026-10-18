/* ------------------------------------------------------------------
   Service d'authentification du portail des Distinctions Nationales.

   ⚠️ Aucun mécanisme d'authentification n'existait dans le projet au
   moment de la refonte. Ce module isole donc TOUTE la logique d'accès
   derrière une seule fonction `signIn` afin de pouvoir être branché sur
   le backend réel sans toucher aux composants d'interface.

   Deux modes :

   1. Mode connecté (production) — définir la variable d'environnement :
        VITE_AUTH_ENDPOINT=https://<api>/auth/login
      L'appel est un POST JSON classique, cookies de session inclus.
      Réponse attendue : { user: { id, email, company, role } }
      (ou { token, user } pour un JWT — le token est conservé côté
      navigateur uniquement si « Se souvenir de moi » est coché).

   2. Mode démonstration — si aucun endpoint n'est configuré, un compte
      d'essai explicitement signalé dans l'interface permet de valider
      les états de chargement, de succès et d'échec de la maquette.
------------------------------------------------------------------ */

export interface SessionUser {
  id: string;
  email: string;
  company: string;
  role: string;
}

export type AuthField = "email" | "password" | "form";

export interface AuthError {
  field: AuthField;
  message: string;
}

export type SignInResult =
  | { ok: true; user: SessionUser }
  | { ok: false; error: AuthError };

export type AccessSpace = "entreprise" | "administration";

export interface SignInInput {
  email: string;
  password: string;
  remember: boolean;
  /** Espace demandé : entreprise (par défaut) ou services administratifs. */
  space?: AccessSpace;
}

const AUTH_ENDPOINT = import.meta.env.VITE_AUTH_ENDPOINT as string | undefined;
const STORAGE_KEY = "distinctions-nationales.session";

const DEMO_ACCOUNT = {
  email: "demo@distinctions.ga",
  password: "Gabon2026",
  user: {
    id: "demo-entreprise-001",
    email: "demo@distinctions.ga",
    company: "Entreprise partenaire (démonstration)",
    role: "representant_entreprise",
  } satisfies SessionUser,
};

const DEMO_ADMIN_ACCOUNT = {
  email: "admin@distinctions.ga",
  password: "Gabon2026",
  user: {
    id: "demo-administration-001",
    email: "admin@distinctions.ga",
    company: "Service administratif (démonstration)",
    role: "agent_administration",
  } satisfies SessionUser,
};

export const isDemoMode = !AUTH_ENDPOINT;
export const demoCredentials = isDemoMode
  ? {
      entreprise: { email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password },
      administration: {
        email: DEMO_ADMIN_ACCOUNT.email,
        password: DEMO_ADMIN_ACCOUNT.password,
      },
    }
  : null;

/* ----------------------------- Session ----------------------------- */

const listeners = new Set<() => void>();

function readSession(): SessionUser | null {
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ??
      window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionUser;
    return parsed && typeof parsed.email === "string" ? parsed : null;
  } catch {
    return null;
  }
}

function persistSession(user: SessionUser, remember: boolean) {
  const store = remember ? window.localStorage : window.sessionStorage;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    /* stockage indisponible (navigation privée) : session en mémoire */
  }
}

function clearSession() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignoré */
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function getSession(): SessionUser | null {
  return readSession();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function signOut() {
  clearSession();
  emit();
}

/* ------------------------------ Signs In ----------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function validateCredentials(email: string, password: string): AuthError | null {
  if (!email.trim()) {
    return { field: "email", message: "Veuillez saisir votre adresse e-mail." };
  }
  if (!EMAIL_RE.test(email.trim())) {
    return {
      field: "email",
      message: "Le format de l'adresse e-mail semble incorrect.",
    };
  }
  if (!password) {
    return { field: "password", message: "Veuillez saisir votre mot de passe." };
  }
  if (password.length < 6) {
    return {
      field: "password",
      message: "Le mot de passe doit contenir au moins 6 caractères.",
    };
  }
  return null;
}

async function requestRemoteSession(input: SignInInput): Promise<SignInResult> {
  try {
    const response = await fetch(AUTH_ENDPOINT as string, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: input.email.trim(),
        password: input.password,
        remember: input.remember,
        space: input.space ?? "entreprise",
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | (Partial<SessionUser> & { user?: Partial<SessionUser>; token?: string })
      | null;

    if (!response.ok) {
      return {
        ok: false,
        error: {
          field: "form",
          message:
            (payload as { message?: string } | null)?.message ??
            "Connexion impossible. Vérifiez vos identifiants puis réessayez.",
        },
      };
    }

    const raw = payload?.user ?? payload ?? {};
    const user: SessionUser = {
      id: String(raw.id ?? "inconnu"),
      email: String(raw.email ?? input.email.trim()),
      company: String(raw.company ?? "—"),
      role: String(raw.role ?? "representant_entreprise"),
    };

    if (input.remember && payload?.token) {
      try {
        window.localStorage.setItem(`${STORAGE_KEY}.token`, payload.token);
      } catch {
        /* ignoré */
      }
    }

    persistSession(user, input.remember);
    emit();
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

async function requestDemoSession(input: SignInInput): Promise<SignInResult> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  const account =
    input.space === "administration" ? DEMO_ADMIN_ACCOUNT : DEMO_ACCOUNT;
  const matches =
    input.email.trim().toLowerCase() === account.email &&
    input.password === account.password;

  if (!matches) {
    return {
      ok: false,
      error: {
        field: "form",
        message:
          "Identifiants non reconnus. Vérifiez votre adresse e-mail et votre mot de passe.",
      },
    };
  }

  persistSession(account.user, input.remember);
  emit();
  return { ok: true, user: account.user };
}

export async function signIn(input: SignInInput): Promise<SignInResult> {
  const invalid = validateCredentials(input.email, input.password);
  if (invalid) return { ok: false, error: invalid };

  return AUTH_ENDPOINT ? requestRemoteSession(input) : requestDemoSession(input);
}
