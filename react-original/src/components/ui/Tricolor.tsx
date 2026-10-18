import { cn } from "@/utils/cn";

interface TricolorProps {
  className?: string;
  /** Largeur de chaque segment en pixels. */
  segment?: number;
  thickness?: number;
}

/** Liseré aux couleurs nationales (vert, jaune, bleu). */
export function Tricolor({ className, segment = 16, thickness = 3 }: TricolorProps) {
  return (
    <span
      className={cn("inline-flex shrink-0 overflow-hidden rounded-full", className)}
      style={{ height: thickness }}
      aria-hidden="true"
    >
      <span className="h-full bg-republic-green-500" style={{ width: segment }} />
      <span className="h-full bg-gold-400" style={{ width: segment }} />
      <span className="h-full bg-republic-blue-500" style={{ width: segment }} />
    </span>
  );
}

interface EyebrowProps {
  children: string;
  className?: string;
  tone?: "light" | "dark";
}

/** Sur-titre espacé suivi du liseré tricolore. */
export function Eyebrow({ children, className, tone = "light" }: EyebrowProps) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-[0.6875rem] font-semibold tracking-[0.24em] uppercase",
        tone === "dark" ? "text-ink-100" : "text-ink-700",
        className
      )}
    >
      <span>{children}</span>
      <Tricolor segment={14} />
    </p>
  );
}
