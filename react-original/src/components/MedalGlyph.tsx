import { useId } from "react";
import { cn } from "@/utils/cn";

export type MedalTone = "bronze" | "argent" | "or";

const metals: Record<
  MedalTone,
  { base: string; mid: string; light: string; rim: string; label: string }
> = {
  bronze: {
    base: "#7A4A22",
    mid: "#B9743C",
    light: "#E4A870",
    rim: "#5C3718",
    label: "Bronze",
  },
  argent: {
    base: "#7F8C9A",
    mid: "#C3CEDA",
    light: "#F3F7FB",
    rim: "#5E6B7A",
    label: "Argent",
  },
  or: {
    base: "#9A6C12",
    mid: "#D9A62F",
    light: "#FBDE84",
    rim: "#7A550E",
    label: "Or",
  },
};

interface MedalGlyphProps {
  tone: MedalTone;
  className?: string;
  title?: string;
}

/**
 * Représentation conceptuelle d'une décoration nationale
 * (maquette) : ruban aux couleurs du Gabon, bélière, médaillon
 * métallique et reliefs. Ces visuels n'imitent aucune décoration
 * officielle existante ; ils devront être remplacés par les visuels
 * institutionnels validés.
 */
export function MedalGlyph({ tone, className, title }: MedalGlyphProps) {
  const uid = useId().replace(/:/g, "");
  const metal = metals[tone];
  const gradId = `metal-${uid}`;
  const sheenId = `sheen-${uid}`;
  const ribbonId = `ribbon-${uid}`;

  const ribbon = ["#009E60", "#FCD116", "#3A75C4"];

  // Ruban effilé : bord supérieur de 32 unités, bord inférieur de 20 unités.
  const ribbonTop = [44, 54.67, 65.33, 76];
  const ribbonBottom = [50, 56.67, 63.33, 70];

  return (
    <svg
      viewBox="0 0 120 190"
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label={`Médaille de ${metal.label.toLowerCase()} — représentation conceptuelle`}
    >
      {title ? <title>{title}</title> : null}

      <defs>
        <linearGradient id={ribbonId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0.16" />
          <stop offset="18%" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="55%" stopColor="#000" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.2" />
        </linearGradient>

        <linearGradient id={gradId} x1="0.15" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor={metal.light} />
          <stop offset="38%" stopColor={metal.mid} />
          <stop offset="62%" stopColor={metal.base} />
          <stop offset="100%" stopColor={metal.rim} />
        </linearGradient>

        <radialGradient id={sheenId} cx="0.32" cy="0.26" r="0.72">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.12" />
        </radialGradient>
      </defs>

      {/* Ruban tissé aux couleurs nationales (ruban effilé) */}
      <g>
        <path d="M44 6h32l-6 60H50Z" fill="#fff" />
        {ribbon.map((color, index) => {
          const topX = ribbonTop[index];
          const topW = ribbonTop[index + 1] - topX;
          return (
            <path
              key={color}
              d={`M${topX} 6h${topW}L${ribbonBottom[index + 1]} 66H${ribbonBottom[index]}Z`}
              fill={color}
            />
          );
        })}
        <path d="M44 6h32l-6 60H50Z" fill={`url(#${ribbonId})`} />
        {/* trame du tissage */}
        <g stroke="#000" strokeOpacity="0.08" strokeWidth="0.7">
          {Array.from({ length: 13 }).map((_, index) => {
            const x = 44 + index * (32 / 12);
            const xb = 50 + (x - 60) * 0.625;
            return <line key={index} x1={x} y1="6" x2={xb} y2="66" />;
          })}
        </g>
        {/* liseré du ruban */}
        <path
          d="M44 6h32l-6 60H50Z"
          fill="none"
          stroke="#000"
          strokeOpacity="0.12"
          strokeWidth="0.6"
        />
      </g>

      {/* Bélière et anneau de suspension */}
      <rect x="42" y="60" width="36" height="9" rx="4" fill={`url(#${gradId})`} />
      <rect
        x="42"
        y="60"
        width="36"
        height="9"
        rx="4"
        fill="none"
        stroke={metal.rim}
        strokeOpacity="0.5"
        strokeWidth="0.8"
      />
      <path
        d="M60 69c-6.2 0-11.2 5-11.2 11.2S53.8 91.4 60 91.4s11.2-5 11.2-11.2"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="4.4"
      />

      {/* Médaillon */}
      <circle
        cx="60"
        cy="130"
        r="42"
        fill={`url(#${gradId})`}
        stroke={metal.rim}
        strokeOpacity="0.55"
        strokeWidth="1.4"
      />
      <circle
        cx="60"
        cy="130"
        r="42"
        fill={`url(#${sheenId})`}
        pointerEvents="none"
      />

      {/* Cordon perlé (relief) */}
      <circle
        cx="60"
        cy="130"
        r="36"
        fill="none"
        stroke={metal.light}
        strokeOpacity="0.65"
        strokeWidth="1.1"
        strokeDasharray="0.4 2.6"
        strokeLinecap="round"
      />

      {/* Rayons gravés */}
      <g
        stroke={metal.rim}
        strokeOpacity="0.35"
        strokeWidth="1"
        strokeLinecap="round"
      >
        {Array.from({ length: 24 }).map((_, index) => {
          const angle = (index * Math.PI * 2) / 24;
          const inner = 27;
          const outer = 33.5;
          return (
            <line
              key={index}
              x1={60 + Math.cos(angle) * inner}
              y1={130 + Math.sin(angle) * inner}
              x2={60 + Math.cos(angle) * outer}
              y2={130 + Math.sin(angle) * outer}
            />
          );
        })}
      </g>

      {/* Couronne de lauriers stylisée */}
      <path
        d="M39 152c-5-11-5-24 0-35"
        fill="none"
        stroke={metal.base}
        strokeOpacity="0.6"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M81 152c5-11 5-24 0-35"
        fill="none"
        stroke={metal.rim}
        strokeOpacity="0.45"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Médaillon central émaillé aux couleurs nationales */}
      <circle cx="60" cy="130" r="20" fill="#F8FAFC" fillOpacity="0.92" />
      <circle
        cx="60"
        cy="130"
        r="20"
        fill="none"
        stroke={metal.mid}
        strokeOpacity="0.8"
        strokeWidth="1.2"
      />
      <path d="M60 111.5a18.5 18.5 0 0 0-18.5 18.5h37A18.5 18.5 0 0 0 60 111.5Z" fill="#3A75C4" />
      <path d="M60 111.5a18.5 18.5 0 0 1 18.5 18.5h-6.2A12.3 12.3 0 0 0 60 117.7Z" fill="#009E60" />
      <circle cx="60" cy="130" r="6.4" fill="#FCD116" stroke={metal.rim} strokeOpacity="0.4" strokeWidth="0.8" />
      <circle cx="57.6" cy="127.4" r="2" fill="#fff" fillOpacity="0.75" />
    </svg>
  );
}
