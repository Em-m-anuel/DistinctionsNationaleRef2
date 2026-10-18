import { useId } from "react";
import { OFFICIAL_EMBLEM_SRC } from "@/config/brand";
import { cn } from "@/utils/cn";

interface EmblemProps {
  size?: number;
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Emblème de la République Gabonaise.
 *
 * - Si `OFFICIAL_EMBLEM_SRC` est renseigné (src/config/brand.ts), le
 *   fichier officiel validé est affiché.
 * - Sinon, un emplacement réservé discret est rendu : sceau abstrait aux
 *   couleurs nationales, qui n'imite volontairement aucun emblème
 *   institutionnel (ni panthères, ni okoumé, ni devise).
 */
export function Emblem({ size = 44, tone = "light", className }: EmblemProps) {
  const uid = useId().replace(/:/g, "");

  if (OFFICIAL_EMBLEM_SRC) {
    return (
      <img
        src={OFFICIAL_EMBLEM_SRC}
        width={size}
        height={size}
        alt="Emblème de la République Gabonaise"
        className={cn("shrink-0 object-contain", className)}
      />
    );
  }

  const ringId = `ring-${uid}`;
  const clipId = `clip-${uid}`;
  const dark = tone === "dark";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Emplacement réservé à l'emblème officiel de la République Gabonaise"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id={ringId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDEA99" />
          <stop offset="50%" stopColor="#E9B900" />
          <stop offset="100%" stopColor="#97720A" />
        </linearGradient>
        <clipPath id={clipId}>
          <path d="M24 12.5 33 15.6v7.6c0 6-3.8 10.4-9 12.6-5.2-2.2-9-6.6-9-12.6v-7.6Z" />
        </clipPath>
      </defs>

      <circle cx="24" cy="24" r="23" fill={dark ? "rgba(255,255,255,0.08)" : "#FFFFFF"} />
      <circle cx="24" cy="24" r="22" fill="none" stroke={`url(#${ringId})`} strokeWidth="1.6" />
      <circle
        cx="24"
        cy="24"
        r="18.6"
        fill="none"
        stroke={dark ? "rgba(255,255,255,0.25)" : "#E5EAF0"}
        strokeWidth="0.8"
        strokeDasharray="0.6 2.2"
        strokeLinecap="round"
      />

      {/* Écu abstrait tricolore — emplacement réservé */}
      <g clipPath={`url(#${clipId})`}>
        <rect x="14" y="12" width="20" height="8.2" fill="#009E60" />
        <rect x="14" y="20.2" width="20" height="7.6" fill="#FCD116" />
        <rect x="14" y="27.8" width="20" height="9" fill="#3A75C4" />
      </g>
      <path
        d="M24 12.5 33 15.6v7.6c0 6-3.8 10.4-9 12.6-5.2-2.2-9-6.6-9-12.6v-7.6Z"
        fill="none"
        stroke={`url(#${ringId})`}
        strokeWidth="1.2"
      />
    </svg>
  );
}
