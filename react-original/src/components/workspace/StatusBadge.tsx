import type { DemoStatus, StatusTone } from "@/demo/types";
import { cn } from "@/utils/cn";

const TONES: Record<StatusTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  info: "border-republic-blue-200 bg-republic-blue-50 text-republic-blue-700",
  warning: "border-gold-200 bg-gold-50 text-gold-800",
  success: "border-republic-green-200 bg-republic-green-50 text-republic-green-700",
  danger: "border-red-200 bg-red-50 text-red-700",
};

export function StatusBadge({ status, dot = true }: { status: DemoStatus; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold", TONES[status.tone])}>
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {status.label}
    </span>
  );
}

export function ToneBadge({ label, tone }: { label: string; tone: StatusTone }) {
  return <StatusBadge status={{ label, tone }} />;
}