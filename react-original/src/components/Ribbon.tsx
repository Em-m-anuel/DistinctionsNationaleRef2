import { useId } from "react";
import { cn } from "@/utils/cn";

interface RibbonProps {
  className?: string;
  compact?: boolean;
}

/** Ruban conceptuel aux couleurs du Gabon, avec un léger effet tissu. */
export function Ribbon({ className, compact = false }: RibbonProps) {
  const id = useId().replace(/:/g, "");
  const width = compact ? 78 : 112;
  const height = compact ? 112 : 158;

  return (
    <svg
      viewBox="0 0 112 158"
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
      role="img"
      aria-label="Ruban conceptuel aux couleurs du Gabon"
    >
      <defs>
        <linearGradient id={`ribbon-shine-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#071f32" stopOpacity="0.2" />
          <stop offset="0.22" stopColor="#FFFFFF" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.04" />
          <stop offset="0.8" stopColor="#001c32" stopOpacity="0.16" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.12" />
        </linearGradient>
        <pattern id={`ribbon-weave-${id}`} width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 0 4 4M4 0 0 4" stroke="#FFFFFF" strokeOpacity="0.16" strokeWidth="0.45" />
        </pattern>
      </defs>
      <path d="M18 4h76l-9 113-29 30-29-30Z" fill="#009E60" />
      <path d="M18 4h76L88 59H24Z" fill="#009E60" />
      <path d="M24 59h64l-4 53-28 29-28-29Z" fill="#FCD116" />
      <path d="M28 112h56l-4 5-24 30-24-30Z" fill="#3A75C4" />
      <path d="M18 4h76l-9 113-29 30-29-30Z" fill={`url(#ribbon-shine-${id})`} />
      <path d="M18 4h76l-9 113-29 30-29-30Z" fill={`url(#ribbon-weave-${id})`} opacity="0.55" />
      <path d="M18 4h76l-9 113-29 30-29-30Z" fill="none" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="1" />
      <path d="M24 59h64M28 112h56" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="0.8" />
    </svg>
  );
}