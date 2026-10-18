import { useEffect } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useAppPath } from "@/lib/router";
import { parseWorkspacePath } from "@/demo/navigation";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import WorkspacePage from "@/pages/WorkspacePage";

export default function App() {
  const path = useAppPath();
  const workspace = parseWorkspacePath(path);
  const route = path === "/login" ? "/login" : path === "/" ? "/" : workspace ? "workspace" : "/";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    document.title =
      route === "/login"
        ? "Connexion — Distinctions Nationales · République Gabonaise"
        : "Distinctions Nationales — République Gabonaise";
  }, [route]);

  const skipLink = (
    <a
      href="#contenu"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
    >
      Aller au contenu principal
    </a>
  );

  if (workspace) {
    return <WorkspacePage role={workspace.role} page={workspace.page} />;
  }

  if (route === "/login") {
    return (
      <>
        {skipLink}
        <LoginPage />
      </>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {skipLink}
      <Header />
      <main id="contenu" className="flex-1">
        <HomePage />
      </main>
      <Footer />
    </div>
  );
}
