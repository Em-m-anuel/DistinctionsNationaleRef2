import { useEffect, useState } from "react";

/* ------------------------------------------------------------------
   Routage minimaliste basé sur le hash.
   Aucune dépendance externe : le projet ne dispose pas de react-router,
   ce module garde donc la navigation isolée et remplaçable par le
   routeur de votre choix (react-router, next/router, etc.).
------------------------------------------------------------------ */

export type RoutePath = "/" | "/login";

const KNOWN_ROUTES: RoutePath[] = ["/", "/login"];

function normalizePath(pathname: string): RoutePath {
  const path = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  if (path === "/connexion") return "/login";
  return (KNOWN_ROUTES.find((route) => route === path) ?? "/") as RoutePath;
}

function normalizeHash(hash: string): RoutePath {
  return normalizePath(hash.replace(/^#/, ""));
}

function currentRoute(): RoutePath {
  const hashRoute = window.location.hash;
  if (hashRoute) return normalizeHash(hashRoute);
  return normalizePath(window.location.pathname);
}

export function useHashRoute(): RoutePath {
  const [path, setPath] = useState<RoutePath>(() => currentRoute());

  useEffect(() => {
    const handleRouteChange = () => setPath(currentRoute());
    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("hashchange", handleHashChange);

    function handleHashChange() {
      handleRouteChange();
    }

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return path;
}

/** URL courante pour les pages de démonstration sans dépendance de routeur. */
export function useAppPath(): string {
  const [path, setPath] = useState(() => window.location.pathname || "/");

  useEffect(() => {
    const update = () => setPath(window.location.pathname || "/");
    window.addEventListener("popstate", update);
    window.addEventListener("hashchange", update);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("hashchange", update);
    };
  }, []);

  return path;
}

export function navigateTo(path: string) {
  if (currentRoute() === path) return;
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

/** Défilement doux vers une section de la page d'accueil. */
export function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = element.getBoundingClientRect().top + window.scrollY - 88;
  window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
}
