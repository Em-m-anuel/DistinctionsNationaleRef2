import type { ReactNode } from "react";
import { Icon } from "@/components/icons";

export function Modal({ open, title, description, children, onClose }: { open: boolean; title: string; description?: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-950/30 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Fermer la fenêtre" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-white shadow-raised">
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5"><div><h2 id="modal-title" className="text-lg font-semibold text-ink-900">{title}</h2>{description ? <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p> : null}</div><button type="button" onClick={onClose} aria-label="Fermer" className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink-900"><Icon name="x" className="size-5" /></button></div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}