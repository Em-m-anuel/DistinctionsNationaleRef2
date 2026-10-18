import { useState } from "react";
import { Emblem } from "@/components/Emblem";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { navigateTo } from "@/lib/router";
import { ROLE_CONFIGS, ROLE_ORDER } from "@/demo/roles";
import { workspacePath } from "@/demo/navigation";
import type { DemoPage, DemoRole } from "@/demo/types";
import { cn } from "@/utils/cn";

export function WorkspaceSidebar({ role, page, open, onClose }: { role: DemoRole; page: DemoPage; open: boolean; onClose: () => void }) {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const config = ROLE_CONFIGS[role];
  const activeItem = config.nav.find((item) => item.page === page);

  return (
    <>
      {open ? <button type="button" aria-label="Fermer le menu" onClick={onClose} className="fixed inset-0 z-40 bg-ink-950/20 lg:hidden" /> : null}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-[275px] flex-col border-r border-line bg-white transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-[76px] items-center gap-3 border-b border-line px-5">
          <Emblem size={40} />
          <div className="min-w-0"><p className="truncate text-[0.75rem] font-bold tracking-[0.1em] text-ink-900 uppercase">Distinctions</p><p className="truncate text-[0.625rem] tracking-[0.16em] text-muted uppercase">République Gabonaise</p></div>
          <button type="button" onClick={onClose} className="ml-auto flex size-8 items-center justify-center rounded-lg text-muted hover:bg-canvas lg:hidden"><Icon name="x" className="size-4" /></button>
        </div>

        <div className="relative border-b border-line px-4 py-4">
          <button type="button" onClick={() => setSwitcherOpen((current) => !current)} className="flex w-full items-center gap-3 rounded-xl border border-line bg-canvas p-3 text-left transition-colors hover:border-ink-200">
            <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold", config.accent === "green" ? "bg-republic-green-50 text-republic-green-700" : config.accent === "blue" ? "bg-republic-blue-50 text-republic-blue-700" : "bg-gold-100 text-gold-800")}>{config.shortLabel.slice(0, 2).toUpperCase()}</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-[0.75rem] font-semibold text-ink-900">{config.shortLabel}</span><span className="mt-0.5 block truncate text-[0.625rem] text-muted">Profil de démonstration</span></span>
            <Icon name="chevronDown" className={cn("size-4 text-muted transition-transform", switcherOpen && "rotate-180")} />
          </button>
          {switcherOpen ? <div className="absolute inset-x-4 top-[82px] z-20 max-h-[360px] overflow-y-auto rounded-xl border border-line bg-white p-1.5 shadow-raised"><p className="px-3 py-2 text-[0.6rem] font-bold tracking-[0.14em] text-muted uppercase">Changer de profil (démo)</p>{ROLE_ORDER.map((candidate) => <button key={candidate} type="button" onClick={() => { setSwitcherOpen(false); onClose(); navigateTo(workspacePath(candidate)); }} className={cn("flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[0.75rem] transition-colors hover:bg-canvas", candidate === role && "bg-republic-green-50 text-republic-green-700")}><span className="size-2 rounded-full bg-current" />{ROLE_CONFIGS[candidate].shortLabel}</button>)}</div> : null}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navigation de l'espace connecté">
          <p className="px-3 pb-2 text-[0.6rem] font-bold tracking-[0.16em] text-muted uppercase">Espace de travail</p>
          <ul className="space-y-0.5">{config.nav.map((item) => <li key={`${item.page}-${item.label}`}><button type="button" onClick={() => { navigateTo(workspacePath(role, item.page)); onClose(); }} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[0.78rem] transition-colors", activeItem === item ? "bg-republic-green-50 font-semibold text-republic-green-700" : "text-ink-700 hover:bg-canvas hover:text-ink-900")}><Icon name={item.icon} className="size-[17px] shrink-0" />{item.label}</button></li>)}</ul>
        </nav>

        <div className="border-t border-line p-4"><Button variant="secondary" size="sm" fullWidth onClick={() => navigateTo("/")}><Icon name="arrowLeft" className="size-4" />Retour au portail</Button></div>
      </aside>
    </>
  );
}