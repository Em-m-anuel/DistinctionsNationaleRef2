import { Icon } from "@/components/icons";

export function DemoBanner() {
  return (
    <div className="flex items-start gap-3 border-b border-gold-200 bg-gold-50 px-5 py-2.5 text-[0.6875rem] leading-relaxed text-gold-800 sm:items-center sm:px-8">
      <Icon name="info" className="mt-0.5 size-4 shrink-0 sm:mt-0" />
      <span><strong>MODE DÉMONSTRATION</strong> — données fictives, aucune opération réelle n&apos;est exécutée.</span>
    </div>
  );
}