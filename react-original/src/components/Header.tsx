import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { Emblem } from "@/components/Emblem";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { LandingBackdrop } from "@/components/landing/LandingBackdrop";
import { navigateTo, scrollToSection } from "@/lib/router";
import { signOut } from "@/lib/auth";
import { useSession } from "@/lib/useSession";

const NAV = [
  { label: "Accueil", id: "accueil" },
  { label: "Les médailles", id: "medailles" },
  { label: "Le processus", id: "processus" },
  { label: "Contact", id: "contact" },
] as const;

type SectionId = (typeof NAV)[number]["id"];

/** Section visible à l'écran (scroll-spy léger). */
function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>("accueil");

  useEffect(() => {
    const elements = NAV.map((item) => document.getElementById(item.id)).filter(
      (element): element is HTMLElement => Boolean(element)
    );
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id as SectionId);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return active;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const session = useSession();
  const active = useActiveSection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: SectionId) => {
    setOpen(false);
    if (id === "accueil") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    scrollToSection(id);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-shadow duration-300",
        scrolled ? "shadow-[0_1px_0_#E5EAF0,0_8px_24px_-18px_rgba(16,42,80,0.25)]" : "shadow-[0_1px_0_#E5EAF0]"
      )}
    >
      <LandingBackdrop scene="footer" className="pointer-events-none absolute inset-x-0 top-0 hidden h-[76px] w-full opacity-35 md:block" />
      <div className="relative mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <button
          type="button"
          onClick={() => go("accueil")}
          className="group flex min-w-0 items-center gap-3 text-left"
          aria-label="Accueil — République Gabonaise, Distinctions Nationales"
        >
          <Emblem size={46} className="transition-transform duration-300 group-hover:scale-[1.03]" />
          <span className="min-w-0">
            <span className="block truncate text-[0.875rem] leading-tight font-bold tracking-[0.12em] text-ink-900 uppercase sm:text-[0.9375rem]">
              République Gabonaise
            </span>
            <span className="mt-0.5 block truncate text-[0.625rem] leading-tight font-medium tracking-[0.22em] text-ink-600 uppercase sm:text-[0.6875rem]">
              Distinctions Nationales
            </span>
          </span>
        </button>

        <nav className="hidden h-full items-stretch gap-1 lg:flex" aria-label="Navigation principale">
          {NAV.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative flex items-center px-3.5 text-[0.84rem] font-medium transition-colors",
                  isActive ? "text-ink-900" : "text-ink-600 hover:text-ink-900"
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute inset-x-3.5 bottom-0 h-[2.5px] rounded-full bg-republic-green-500 transition-all duration-300",
                    isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                  )}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-50 text-[0.8125rem] font-semibold text-ink-700 ring-1 ring-line"
                title={session.email}
              >
                {session.email.slice(0, 1).toUpperCase()}
              </span>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Se déconnecter
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateTo("/login")}
              className="hidden h-10 px-4 sm:inline-flex"
            >
              <Icon name="user" className="size-4 text-republic-blue-600" />
              Se connecter
            </Button>
          )}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className="flex size-10 items-center justify-center rounded-lg border border-line text-ink-700 transition-colors hover:bg-canvas lg:hidden"
          >
            <Icon name={open ? "close" : "menu"} className="size-5" />
          </button>
        </div>
      </div>

      <div id="menu-mobile" hidden={!open} className="animate-fade border-t border-line bg-white lg:hidden">
        <nav className="mx-auto max-w-7xl px-5 py-2 sm:px-8" aria-label="Navigation mobile">
          <ul className="divide-y divide-line">
            {NAV.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item.id)}
                  className={cn(
                    "flex w-full items-center justify-between py-3.5 text-left text-[0.9375rem] font-medium",
                    active === item.id ? "text-republic-green-700" : "text-ink-800"
                  )}
                >
                  {item.label}
                  <Icon name="arrowRight" className="size-4 text-ink-300" />
                </button>
              </li>
            ))}
          </ul>
          <div className="py-4">
            {session ? (
              <Button variant="secondary" fullWidth onClick={() => signOut()}>
                Se déconnecter
              </Button>
            ) : (
              <Button fullWidth onClick={() => navigateTo("/login")}>
                <Icon name="user" className="size-4" />
                Se connecter
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
