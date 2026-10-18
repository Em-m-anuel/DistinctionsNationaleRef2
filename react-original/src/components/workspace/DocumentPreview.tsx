import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

export function DocumentPreview({ type = "Ordre de recette", reference = "OR-2026-00418", compact = false }: { type?: string; reference?: string; compact?: boolean }) {
  return (
    <div className={cn("rounded-xl border border-line bg-canvas p-3", compact ? "max-w-xs" : "") }>
      <div className={cn("relative bg-white shadow-[0_2px_8px_rgba(16,42,80,0.08)]", compact ? "aspect-[3/4] p-4" : "min-h-[400px] p-7 sm:p-10")}>
        <div className="flex items-start justify-between border-b-2 border-ink-900 pb-4"><div><p className="text-[0.55rem] font-bold tracking-[0.16em] text-ink-900 uppercase">République Gabonaise</p><p className="mt-1 text-[0.5rem] tracking-[0.16em] text-muted uppercase">Distinctions Nationales</p></div><span className="flex size-7 items-center justify-center rounded-full border border-gold-400 text-[0.45rem] font-bold text-gold-700">RG</span></div>
        <div className="py-7 text-center"><p className="text-[0.6rem] font-bold tracking-[0.2em] text-muted uppercase">Document de démonstration</p><h3 className="mt-3 text-sm font-semibold text-ink-900">{type}</h3><p className="mt-1 text-[0.625rem] text-muted">Référence {reference}</p></div>
        <div className="space-y-2.5"><div className="h-2 w-3/4 rounded bg-ink-100" /><div className="h-2 w-full rounded bg-ink-100" /><div className="h-2 w-5/6 rounded bg-ink-100" /><div className="mt-5 grid grid-cols-3 gap-2"><div className="h-14 rounded border border-line bg-canvas" /><div className="h-14 rounded border border-line bg-canvas" /><div className="h-14 rounded border border-line bg-canvas" /></div></div>
        <p className="absolute right-4 bottom-4 text-[0.5rem] text-muted">MAQUETTE — SANS VALEUR ADMINISTRATIVE</p>
      </div>
      {!compact ? <div className="mt-3 flex justify-end"><Button variant="secondary" size="sm" onClick={() => window.print()}><Icon name="printer" className="size-3.5" />Imprimer l&apos;aperçu</Button></div> : null}
    </div>
  );
}