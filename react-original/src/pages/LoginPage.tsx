import { useRef, useState, type FormEvent } from "react";
import { Emblem } from "@/components/Emblem";
import { Icon } from "@/components/icons";
import { Medal } from "@/components/Medal";
import { Ribbon } from "@/components/Ribbon";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Tricolor } from "@/components/ui/Tricolor";
import { RoleTabs } from "@/components/RoleTabs";
import {
  demoCredentials,
  isDemoMode,
  signIn,
  signOut,
  type AccessSpace,
  type AuthError,
} from "@/lib/auth";
import { navigateTo } from "@/lib/router";
import { useSession } from "@/lib/useSession";
import type { DemoRole } from "@/demo/types";

export default function LoginPage() {
  const session = useSession();
  const emailRef = useRef<HTMLInputElement>(null);
  const [space, setSpace] = useState<AccessSpace>("entreprise");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [notice, setNotice] = useState("");

  const demo = demoCredentials?.[space];
  const isAdministration = space === "administration";
  const sessionRole: DemoRole = session?.role === "agent_administration" ? "service" : "demandeur";

  const onChangeSpace = (next: AccessSpace) => {
    setSpace(next);
    setError(null);
    setNotice("");
    setPassword("");
    window.setTimeout(() => emailRef.current?.focus(), 0);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setError(null);
    setNotice("");
    setLoading(true);
    const result = await signIn({ email, password, remember, space });
    setLoading(false);
    if (result.ok) {
      setPassword("");
      return;
    }
    setError(result.error);
  };

  const showNotice = (message: string) => {
    setNotice(message);
    setError(null);
  };

  return (
    <div className="min-h-dvh bg-canvas text-ink-900 lg:grid lg:grid-cols-[1.02fr_0.98fr]">
      <aside className="relative isolate hidden min-h-dvh overflow-hidden border-r border-line bg-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -top-36 -left-24 size-[32rem] rounded-full bg-republic-green-50 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute right-[-8rem] bottom-[-6rem] size-[28rem] rounded-full bg-republic-blue-50/80 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute top-[38%] right-[22%] size-44 rounded-full bg-gold-50 blur-3xl" aria-hidden="true" />
        <Ribbon className="pointer-events-none absolute -top-2 left-[8%] opacity-80" compact />

        <div className="relative px-12 pt-10 xl:px-16">
          <button type="button" onClick={() => navigateTo("/")} className="group flex items-center gap-3 text-left">
            <Emblem size={48} className="transition-transform duration-300 group-hover:scale-[1.03]" />
            <span>
              <span className="block text-[0.875rem] font-bold tracking-[0.12em] text-ink-900 uppercase">République Gabonaise</span>
              <span className="mt-0.5 block text-[0.6875rem] font-medium tracking-[0.22em] text-ink-600 uppercase">Distinctions Nationales</span>
            </span>
          </button>
        </div>

        <div className="relative flex flex-col items-center px-10 py-8 text-center xl:px-16">
          <div className="relative flex h-[370px] w-full items-center justify-center">
            <div className="absolute size-[23rem] rounded-full border border-republic-green-100 bg-gradient-to-br from-republic-green-50/75 via-white to-gold-50/75" aria-hidden="true" />
            <div className="absolute size-[18rem] rounded-full border border-gold-200/70 [transform:rotate(-15deg)]" aria-hidden="true" />
            <Medal type="or" size="lg" showRibbon label="Médaille d'or conceptuelle" />
          </div>
          <Tricolor className="mt-4" segment={18} />
          <blockquote className="mt-7 max-w-md font-serif text-[1.4rem] leading-relaxed text-ink-900 italic">
            « L&apos;honneur se construit dans la durée. »
          </blockquote>
          <p className="mt-3 text-[0.75rem] tracking-[0.16em] text-muted uppercase">Principe du dispositif national</p>
        </div>

        <div className="relative flex items-end justify-between gap-6 border-t border-line px-12 py-8 xl:px-16">
          <div className="flex items-end gap-1">
            <Medal type="bronze" size="sm" showRibbon={false} label="Bronze conceptuel" />
            <Medal type="argent" size="sm" showRibbon={false} label="Argent conceptuel" />
            <Medal type="or" size="sm" showRibbon={false} label="Or conceptuel" />
          </div>
          <p className="max-w-[210px] text-right text-[0.6875rem] leading-relaxed text-muted">Bronze, argent, or : trois niveaux de reconnaissance.</p>
        </div>
      </aside>

      <main id="contenu" className="relative flex min-h-dvh flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12 lg:py-8">
          <button type="button" onClick={() => navigateTo("/")} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[0.8125rem] font-medium text-ink-700 transition-colors hover:border-ink-200 hover:bg-ink-50">
            <Icon name="arrowLeft" className="size-4" />
            Retour à l&apos;accueil
          </button>
          <span className="hidden items-center gap-2 text-[0.75rem] text-muted sm:inline-flex">
            <Icon name="lock" className="size-4 text-republic-green-600" />
            Accès sécurisé
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-6 sm:px-10 sm:py-10 lg:px-16">
          <div className="w-full max-w-[470px] animate-rise">
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <Emblem size={58} />
              <p className="mt-3 text-[0.875rem] font-bold tracking-[0.16em] text-ink-900 uppercase">République Gabonaise</p>
              <p className="mt-1 text-[0.625rem] font-medium tracking-[0.22em] text-ink-600 uppercase">Distinctions Nationales</p>
              <Tricolor className="mt-4" segment={18} />
            </div>

            {session ? (
              <section className="rounded-2xl border border-republic-green-200 bg-republic-green-50/60 p-7 text-center sm:p-9" aria-labelledby="login-success">
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-republic-green-500 text-white">
                  <Icon name="checkCircle" className="size-7" />
                </span>
                <h1 id="login-success" className="mt-6 text-[1.65rem] font-semibold tracking-[-0.03em]">Connexion réussie</h1>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">Bienvenue, <span className="font-medium text-ink-800">{session.company}</span>. Votre espace sera disponible lors de la prochaine phase du déploiement.</p>
                <div className="mt-7 rounded-xl border border-line bg-white p-4 text-left">
                  <p className="text-[0.75rem] text-muted">Compte actif</p>
                  <p className="mt-1 truncate text-[0.875rem] font-medium text-ink-900">{session.email}</p>
                </div>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button variant="secondary" fullWidth onClick={() => navigateTo("/")}>Retour à l&apos;accueil</Button>
                  <Button fullWidth onClick={() => navigateTo(`/app/${sessionRole}/overview`)}>Ouvrir mon espace</Button>
                </div>
                <button type="button" onClick={() => signOut()} className="mt-4 text-xs font-medium text-muted hover:text-ink-900 hover:underline">Se déconnecter</button>
              </section>
            ) : (
              <>
                <header>
                  <EyebrowLogin />
                  <h1 className="mt-4 text-[2rem] leading-tight font-semibold tracking-[-0.04em] text-ink-900 sm:text-[2.25rem]">Connexion</h1>
                  <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-muted">Accès réservé aux entreprises reconnues et agents habilités.</p>
                </header>

                <div className="mt-7">
                  <RoleTabs value={space} onChange={onChangeSpace} disabled={loading} />
                </div>

                {isDemoMode && demo ? (
                  <div className="mt-5 rounded-xl border border-gold-200 bg-gold-50/70 px-4 py-3 text-[0.75rem] leading-relaxed text-ink-700">
                    <span className="font-semibold text-ink-900">Mode démo :</span> {demo.email} / {demo.password}{" "}
                    <button type="button" onClick={() => { setEmail(demo.email); setPassword(demo.password); setNotice(""); setError(null); }} className="font-semibold text-gold-800 underline underline-offset-4">Pré-remplir</button>
                  </div>
                ) : null}

                <form onSubmit={submit} noValidate className="mt-7 space-y-5">
                  {error?.field === "form" ? (
                    <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
                      <Icon name="alert" className="mt-0.5 size-[18px] shrink-0 text-red-500" />
                      <div>
                        <p className="text-[0.8125rem] font-semibold text-red-800">Connexion impossible</p>
                        <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-red-700">{error.message}</p>
                      </div>
                    </div>
                  ) : null}
                  {notice ? (
                    <div role="status" className="flex items-start gap-3 rounded-xl border border-republic-blue-200 bg-republic-blue-50 px-4 py-3.5 text-[0.8125rem] leading-relaxed text-republic-blue-700">
                      <Icon name="info" className="mt-0.5 size-4 shrink-0" />
                      {notice}
                    </div>
                  ) : null}

                  <TextField
                    ref={emailRef}
                    id="email"
                    name="email"
                    type="email"
                    label="Adresse e-mail"
                    placeholder={isAdministration ? "agent@administration.ga" : "votre@email.com"}
                    icon="mail"
                    autoComplete="username"
                    inputMode="email"
                    required
                    value={email}
                    onChange={(event) => { setEmail(event.target.value); setError(null); }}
                    error={error?.field === "email" ? error.message : undefined}
                    disabled={loading}
                  />
                  <TextField
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    label="Mot de passe"
                    placeholder="Votre mot de passe"
                    icon="lock"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => { setPassword(event.target.value); setError(null); }}
                    error={error?.field === "password" ? error.message : undefined}
                    disabled={loading}
                    trailing={(
                      <button type="button" onClick={() => setShowPassword((current) => !current)} aria-pressed={showPassword} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} className="mr-1 flex size-9 items-center justify-center rounded-lg text-ink-500 hover:bg-canvas hover:text-ink-900">
                        <Icon name={showPassword ? "eyeOff" : "eye"} className="size-[18px]" />
                      </button>
                    )}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label htmlFor="remember" className="flex cursor-pointer items-center gap-2.5 text-[0.8125rem] text-ink-700">
                      <input id="remember" name="remember" type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} disabled={loading} className="size-[17px] cursor-pointer rounded accent-republic-green-500" />
                      Se souvenir de moi
                    </label>
                    <button type="button" onClick={() => showNotice("La réinitialisation sera disponible auprès du service habilité de votre organisation.")} className="text-[0.8125rem] font-medium text-republic-blue-600 hover:text-republic-blue-700 hover:underline hover:underline-offset-4">
                      Mot de passe oublié ?
                    </button>
                  </div>

                  <Button type="submit" size="lg" fullWidth loading={loading} className="mt-1">
                    {loading ? "Connexion en cours…" : "Se connecter"}
                  </Button>
                </form>

                <div className="my-6 flex items-center gap-4" aria-hidden="true">
                  <span className="h-px flex-1 bg-line" />
                  <span className="text-[0.75rem] text-muted">ou</span>
                  <span className="h-px flex-1 bg-line" />
                </div>

                <Button variant="outline" size="lg" fullWidth onClick={() => showNotice("Pour demander un accès, rapprochez-vous du service des Distinctions Nationales de votre administration.")}>
                  <Icon name="building" className="size-[18px] text-republic-blue-600" />
                  Demander un accès
                </Button>

                <p className="mt-6 text-center text-[0.75rem] leading-relaxed text-muted">
                  <Icon name="lock" className="mr-1 inline size-3.5 align-[-2px] text-republic-green-600" />
                  Vos identifiants sont traités dans un cadre sécurisé. Aucun compte public n&apos;est créé depuis ce formulaire.
                </p>
              </>
            )}
          </div>
        </div>

        <footer className="px-5 pb-6 text-center text-[0.75rem] text-muted sm:px-8">
          <p>© {new Date().getFullYear()} République Gabonaise — Distinctions Nationales</p>
        </footer>
      </main>
    </div>
  );
}

function EyebrowLogin() {
  return (
    <div className="flex items-center gap-3 text-[0.6875rem] font-semibold tracking-[0.22em] text-ink-600 uppercase">
      <span>Portail sécurisé</span>
      <Tricolor segment={14} />
    </div>
  );
}