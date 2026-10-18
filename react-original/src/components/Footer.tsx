import { Emblem } from "@/components/Emblem";
import { Icon } from "@/components/icons";
import { Tricolor } from "@/components/ui/Tricolor";
import { InstitutionalMotifs } from "@/components/landing/InstitutionalMotifs";
import { LandingBackdrop } from "@/components/landing/LandingBackdrop";
import { navigateTo, scrollToSection } from "@/lib/router";

const LINKS = [
  { label: "Les médailles", id: "medailles" },
  { label: "Le processus", id: "processus" },
  { label: "Contact", id: "contact" },
];

const PENDING = ["Mentions légales", "Conditions d'utilisation", "Données personnelles"];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden border-t border-line bg-canvas">
      <LandingBackdrop scene="footer" className="absolute inset-0 h-full w-full opacity-55" />
      <InstitutionalMotifs variant="panorama" tone="neutral" className="absolute -right-28 bottom-[-9rem] hidden w-[34rem] opacity-55 sm:block" />
      <InstitutionalMotifs variant="curves" className="absolute -left-40 top-[-9rem] hidden w-[32rem] opacity-45 md:block" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr] lg:gap-16">
        <div>
          <div className="flex items-center gap-3">
            <Emblem size={44} />
            <div>
              <p className="text-[0.875rem] font-bold tracking-[0.12em] text-ink-900 uppercase">
                République Gabonaise
              </p>
              <p className="text-[0.6875rem] font-medium tracking-[0.22em] text-ink-600 uppercase">
                Distinctions Nationales
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-[0.875rem] leading-relaxed text-muted">
            Portail officiel de dépôt, de suivi et d&apos;attribution des
            médailles et diplômes honorifiques, réservé aux entreprises
            reconnues et aux services administratifs habilités.
          </p>
          <Tricolor className="mt-5" segment={18} />
        </div>

        <div>
          <h3 className="text-[0.6875rem] font-semibold tracking-[0.2em] text-ink-700 uppercase">
            Le portail
          </h3>
          <ul className="mt-4 space-y-2.5 text-[0.875rem]">
            {LINKS.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className="text-muted transition-colors hover:text-ink-900"
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => navigateTo("/login")}
                className="font-medium text-republic-green-700 transition-colors hover:text-republic-green-600"
              >
                Se connecter
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[0.6875rem] font-semibold tracking-[0.2em] text-ink-700 uppercase">
            Informations
          </h3>
          <ul className="mt-4 space-y-2.5 text-[0.875rem]">
            <li>
              <button
                type="button"
                onClick={() => scrollToSection("contact")}
                className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-ink-900"
              >
                <Icon name="info" className="size-4" />
                Contact et assistance
              </button>
            </li>
            {PENDING.map((item) => (
              <li key={item} className="flex flex-wrap items-center gap-2 text-slate-500">
                {item}
                <span className="rounded-full border border-line-strong bg-white px-2 py-0.5 text-[0.625rem] font-medium tracking-wide text-slate-500 uppercase">
                  à publier
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-line bg-white/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-[0.75rem] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {year} République Gabonaise — Portail des Distinctions Nationales.</p>
          <p>Visuels de présentation non contractuels.</p>
        </div>
      </div>
    </footer>
  );
}
