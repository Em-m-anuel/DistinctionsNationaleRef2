import { useId } from "react";
import { cn } from "@/utils/cn";

export type MedalType = "bronze" | "argent" | "or";
export type MedalSize = "sm" | "md" | "lg";

interface MedalProps {
  type: MedalType;
  size?: MedalSize;
  showRibbon?: boolean;
  className?: string;
  label?: string;
}

const METALS: Record<MedalType, { dark: string; mid: string; light: string; name: string }> = {
  bronze: { dark: "#74401F", mid: "#CD7F32", light: "#F0B36D", name: "bronze" },
  argent: { dark: "#74808D", mid: "#C0C0C0", light: "#F7FAFC", name: "argent" },
  or: { dark: "#8C5D0A", mid: "#FFD700", light: "#FFF2A8", name: "or" },
};

const SIZE_CLASSES: Record<MedalSize, string> = {
  sm: "w-24 sm:w-28",
  md: "w-36 sm:w-44",
  lg: "w-64 sm:w-72 lg:w-[22rem]",
};

function starPoints(cx: number, cy: number, outer: number, inner: number, count: number) {
  return Array.from({ length: count * 2 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / count;
    const radius = index % 2 === 0 ? outer : inner;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(" ");
}

function gearPoints(cx: number, cy: number, outer: number, inner: number, count: number) {
  return Array.from({ length: count * 2 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / count;
    const radius = index % 2 === 0 ? outer : inner;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(" ");
}

/**
 * Médaille conceptuelle : elle n'imite aucun emblème officiel. Les textes
 * gravés et le médaillon abstrait servent uniquement à la maquette.
 */
export function Medal({ type, size = "md", showRibbon = true, className, label }: MedalProps) {
  const uid = useId().replace(/:/g, "");
  const metal = METALS[type];
  const metalId = `metal-${uid}`;
  const metalSheenId = `sheen-${uid}`;
  const ribbonId = `ribbon-${uid}`;
  const textArcId = `arc-${uid}`;
  const shadowId = `shadow-${uid}`;
  const text = type === "or" ? "HONNEUR ET MÉRITE" : "DISTINCTIONS NATIONALES";

  return (
    <div className={cn("medal-object relative shrink-0", SIZE_CLASSES[size], className)}>
      <svg
        viewBox="0 0 260 350"
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={label ?? `Médaille de ${metal.name}, représentation conceptuelle`}
      >
        <title>{label ?? `Médaille de ${metal.name} — représentation conceptuelle`}</title>
        <defs>
          <radialGradient id={metalId} cx="32%" cy="24%" r="78%">
            <stop offset="0" stopColor={metal.light} />
            <stop offset="0.28" stopColor={metal.mid} />
            <stop offset="0.68" stopColor={metal.dark} />
            <stop offset="1" stopColor="#281707" />
          </radialGradient>
          <linearGradient id={metalSheenId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.72" />
            <stop offset="0.35" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="0.58" stopColor="#000000" stopOpacity="0.1" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id={ribbonId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#001F31" stopOpacity="0.28" />
            <stop offset="0.22" stopColor="#FFFFFF" stopOpacity="0.2" />
            <stop offset="0.52" stopColor="#FFFFFF" stopOpacity="0.04" />
            <stop offset="0.8" stopColor="#001F31" stopOpacity="0.16" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.1" />
          </linearGradient>
          <filter id={shadowId} x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="7" stdDeviation="7" floodColor="#102A50" floodOpacity="0.24" />
          </filter>
          <path id={textArcId} d="M 60 224 A 70 70 0 0 1 200 224" fill="none" />
        </defs>

        {showRibbon ? (
          <g>
            <path d="M82 6h96l-13 112-35 38-35-38Z" fill="#009E60" />
            <path d="M82 6h96l-7 57H89Z" fill="#009E60" />
            <path d="M89 63h82l-6 54-35 39-35-39Z" fill="#FCD116" />
            <path d="M95 117h70l-6 1-29 38-29-38Z" fill="#3A75C4" />
            <path d="M82 6h96l-13 112-35 38-35-38Z" fill={`url(#${ribbonId})`} />
            <path d="M82 6h96l-13 112-35 38-35-38Z" fill="none" stroke="#FFFFFF" strokeOpacity="0.32" strokeWidth="1.2" />
            <path d="M86 10h88M89 63h82M95 117h70" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="1" />
            {Array.from({ length: 18 }, (_, index) => (
              <path key={index} d={`M${86 + index * 5} 8l-${index * 0.7} 125`} stroke="#FFFFFF" strokeOpacity="0.07" strokeWidth="0.7" />
            ))}
          </g>
        ) : null}

        <g transform="translate(0 6)" filter={`url(#${shadowId})`}>
          <circle cx="130" cy="222" r="95" fill="#F8FAFC" fillOpacity="0.7" />
          <polygon points={gearPoints(130, 222, 99, 86, 28)} fill={`url(#${metalId})`} stroke={metal.dark} strokeWidth="2" />
          <polygon points={gearPoints(130, 222, 91, 86, 28)} fill={`url(#${metalSheenId})`} opacity="0.62" />
          <circle cx="130" cy="222" r="82" fill={`url(#${metalId})`} stroke={metal.light} strokeOpacity="0.65" strokeWidth="2" />
          <circle cx="130" cy="222" r="75" fill="none" stroke={metal.dark} strokeOpacity="0.65" strokeWidth="3" strokeDasharray="1 5" strokeLinecap="round" />
          <circle cx="130" cy="222" r="69" fill="none" stroke={metal.light} strokeOpacity="0.5" strokeWidth="1.1" />

          {/* Lauriers abstraits */}
          <g fill="none" stroke={metal.light} strokeOpacity="0.72" strokeWidth="2" strokeLinecap="round">
            <path d="M77 253c-18-22-20-48-9-72" />
            <path d="M183 253c18-22 20-48 9-72" />
          </g>
          <g fill={metal.light} fillOpacity="0.58">
            <ellipse cx="71" cy="239" rx="5" ry="2.2" transform="rotate(35 71 239)" />
            <ellipse cx="66" cy="225" rx="5" ry="2.2" transform="rotate(18 66 225)" />
            <ellipse cx="65" cy="211" rx="5" ry="2.2" transform="rotate(-8 65 211)" />
            <ellipse cx="69" cy="196" rx="5" ry="2.2" transform="rotate(-28 69 196)" />
            <ellipse cx="189" cy="239" rx="5" ry="2.2" transform="rotate(-35 189 239)" />
            <ellipse cx="194" cy="225" rx="5" ry="2.2" transform="rotate(-18 194 225)" />
            <ellipse cx="195" cy="211" rx="5" ry="2.2" transform="rotate(8 195 211)" />
            <ellipse cx="191" cy="196" rx="5" ry="2.2" transform="rotate(28 191 196)" />
          </g>

          <text fill={metal.light} fontSize="7.2" fontWeight="700" letterSpacing="1.3">
            <textPath href={`#${textArcId}`} startOffset="50%" textAnchor="middle">
              {text}
            </textPath>
          </text>

          <circle cx="130" cy="222" r="42" fill="#F8FAFC" fillOpacity="0.9" stroke={metal.light} strokeWidth="2" />
          <polygon points={starPoints(130, 222, 32, 14, 12)} fill={`url(#${metalId})`} stroke={metal.dark} strokeWidth="1.2" />
          <circle cx="130" cy="222" r="14" fill="#009E60" />
          <path d="M130 209v26M117 222h26" stroke="#FCD116" strokeWidth="2" strokeOpacity="0.9" />
          <path d="M130 211 134 218 142 222 134 226 130 233 126 226 118 222 126 218Z" fill="#3A75C4" fillOpacity="0.9" />

          <text x="130" y="278" textAnchor="middle" fill={metal.light} fontSize="6.5" fontWeight="700" letterSpacing="1.1">
            HONNEUR ET MÉRITE
          </text>
          <path d="M92 290h76" stroke={metal.light} strokeOpacity="0.55" strokeWidth="1" />
        </g>

        {showRibbon ? (
          <g>
            <rect x="111" y="143" width="38" height="14" rx="6" fill={`url(#${metalId})`} stroke={metal.dark} strokeWidth="1.2" />
            <circle cx="130" cy="161" r="13" fill="none" stroke={metal.mid} strokeWidth="5" />
          </g>
        ) : null}
      </svg>
    </div>
  );
}