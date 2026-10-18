import { useState } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { navigateTo } from "@/lib/router";
import { ROLE_CONFIGS } from "@/demo/roles";
import { workspacePath } from "@/demo/navigation";
import type { DemoPage, DemoRole } from "@/demo/types";

export function WorkspaceTopbar({ role, page, onMenu, unread, onReadAll }: { role: DemoRole; page: DemoPage; onMenu: () => void; unread: number; onReadAll: () => void }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const config = ROLE_CONFIGS[role];
  const pageTitle = config.nav.find((item) => item.page === page)?.label ?? "Vue d'ensemble";

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-4 border-b border-line bg-white/95 px-4 backdrop-blur-md sm:px-8">
      <div className="flex min-w-0 items-center gap-3"><button type="button" onClick={onMenu} className="flex size-9 items-center justify-center rounded-lg border border-line text-ink-700 lg:hidden"><Icon name="menu" className="size-5" /></button><div className="min-w-0"><div className="hidden items-center gap-2 text-[0.6875rem] text-muted sm:flex"><span>Portail</span><Icon name="chevronRight" className="size-3" /><span>{config.shortLabel}</span></div><h1 className="truncate text-[1.05rem] font-semibold text-ink-900 sm:mt-1">{pageTitle}</h1></div></div>
      <div className="flex items-center gap-2 sm:gap-3">
        <label className="relative hidden lg:block"><span className="sr-only">Rechercher</span><Icon name="search" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><input className="h-10 w-52 rounded-xl border border-line bg-canvas pl-9 pr-3 text-[0.75rem] outline-none transition focus:border-republic-green-500 focus:ring-4 focus:ring-republic-green-100" placeholder="Rechercher…" /></label>
        <div className="relative"><button type="button" onClick={() => setNotificationsOpen((current) => !current)} aria-label="Notifications" className="relative flex size-10 items-center justify-center rounded-xl border border-line text-ink-700 hover:bg-canvas"><Icon name="bell" className="size-[18px]" />{unread ? <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-republic-green-500 text-[0.55rem] font-bold text-white ring-2 ring-white">{unread}</span> : null}</button>{notificationsOpen ? <div className="absolute top-12 right-0 z-40 w-80 rounded-2xl border border-line bg-white p-4 shadow-raised"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-ink-900">Notifications</p><button type="button" onClick={onReadAll} className="text-[0.6875rem] font-medium text-republic-green-700">Tout marquer lu</button></div><p className="mt-3 text-[0.75rem] leading-relaxed text-muted">Consultez les alertes de démonstration dans la rubrique dédiée.</p><Button size="sm" variant="secondary" fullWidth className="mt-4" onClick={() => { setNotificationsOpen(false); navigateTo(workspacePath(role, "notifications")); }}>Voir les notifications</Button></div> : null}</div>
        <button type="button" onClick={() => navigateTo(workspacePath(role, "profile"))} className="flex items-center gap-2 rounded-xl border border-transparent p-1.5 pr-2 transition-colors hover:border-line hover:bg-canvas"><span className="flex size-9 items-center justify-center rounded-full bg-ink-900 text-[0.75rem] font-semibold text-white">{role === "demandeur" ? "DM" : config.shortLabel.slice(0, 2).toUpperCase()}</span><span className="hidden text-left sm:block"><span className="block max-w-28 truncate text-[0.75rem] font-semibold text-ink-900">{config.shortLabel}</span><span className="block text-[0.625rem] text-muted">Mode démo</span></span></button>
      </div>
    </header>
  );
}