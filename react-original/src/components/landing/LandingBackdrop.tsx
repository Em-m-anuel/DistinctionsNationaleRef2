import { cn } from "@/utils/cn";

type BackdropScene = "hero" | "process" | "medals" | "values" | "footer";

interface LandingBackdropProps {
  scene: BackdropScene;
  className?: string;
}

function TricolorWaves({ position }: { position: "top" | "bottom" }) {
  const y = position === "top" ? 70 : 780;
  const direction = position === "top" ? 1 : -1;
  return (
    <g fill="none" strokeLinecap="round">
      <path d={`M-30 ${y}C160 ${y + 125 * direction} 260 ${y - 70 * direction} 470 ${y + 20 * direction}S820 ${y + 90 * direction} 1040 ${y - 5 * direction} 1390 ${y + 80 * direction} 1660 ${y - 15 * direction}`} stroke="#009E60" strokeOpacity="0.24" strokeWidth="1.7" />
      <path d={`M-30 ${y + 12 * direction}C160 ${y + 137 * direction} 260 ${y - 58 * direction} 470 ${y + 32 * direction}S820 ${y + 102 * direction} 1040 ${y + 7 * direction} 1390 ${y + 92 * direction} 1660 ${y - 3 * direction}`} stroke="#FCD116" strokeOpacity="0.32" strokeWidth="1.7" />
      <path d={`M-30 ${y + 24 * direction}C160 ${y + 149 * direction} 260 ${y - 46 * direction} 470 ${y + 44 * direction}S820 ${y + 114 * direction} 1040 ${y + 19 * direction} 1390 ${y + 104 * direction} 1660 ${y + 9 * direction}`} stroke="#3A75C4" strokeOpacity="0.24" strokeWidth="1.7" />
    </g>
  );
}

function GabonOutline() {
  return (
    <g transform="translate(22 158) scale(.62)" fill="none" stroke="#3A75C4" strokeOpacity="0.18" strokeWidth="2.1" strokeLinejoin="round">
      <path d="M214 25 276 30l20 24 44 4 20 35-7 31 21 39-12 43 12 36-28 31-7 45-35 29-40 4-24 30-47-5-33-31-45-13-16-38-37-24-7-46-29-35 20-38-4-45 30-29 15-42 46-6 30-28Z" />
      <path d="M80 195c24 8 43 25 54 47M107 94c36 22 54 55 56 97M178 52c-11 70-4 134 19 193M158 326c54-29 98-29 154-6" strokeOpacity="0.07" strokeWidth="1" />
    </g>
  );
}

function Monument() {
  return (
    <g transform="translate(1360 185)" fill="none" stroke="#3A75C4" strokeOpacity="0.11" strokeWidth="1.2">
      <path d="M72 535V187M44 535h56M52 187h40M61 187V80h22v107M64 80 72 24l8 56M60 123h25M50 264h44M47 344h50M38 535c13-35 21-76 22-122M106 535c-13-35-21-76-22-122" />
      <circle cx="72" cy="17" r="14" />
      <path d="M52 205h40M44 535h56" />
    </g>
  );
}

function Palm({ x, y, scale = 1, flip = false }: { x: number; y: number; scale?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`} fill="none" stroke="#64748B" strokeOpacity="0.09" strokeWidth="1.2" strokeLinecap="round">
      <path d="M0 210C9 139 15 83 8 22" />
      <path d="M8 25C-27 17-52 29-72 52M8 25C39 6 67 8 92 25M8 25C-12-7-38-18-69-14M8 25C28-10 56-26 88-25M8 25C4-10 13-38 34-62M8 25C-4-12-21-37-48-52" />
      <path d="M-70 52c22-8 43-9 64-2M91 25c-27 4-50 13-69 29M-68-14c22 8 40 20 53 38M87-25C60-12 40 5 25 29M34-62C17-36 10-9 9 18M-48-52c25 18 42 41 52 69" />
    </g>
  );
}

function Architecture() {
  return (
    <g transform="translate(1040 475)" fill="none" stroke="#3A75C4" strokeOpacity="0.075" strokeWidth="1.1">
      <path d="M0 245h500M32 226h431M62 226V105h50v121M132 226V72h50v154M202 226V105h50v121M272 226V72h50v154M342 226V105h50v121" />
      <path d="M42 105h360M39 89h366M98 78c7-49 53-78 95-78s88 29 95 78" />
      <path d="M173 226v-74h52v74M187 226v-57h24v57" />
    </g>
  );
}

export function LandingBackdrop({ scene, className }: LandingBackdropProps) {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className={cn("pointer-events-none select-none", className)} aria-hidden="true">
      {scene === "hero" ? <><TricolorWaves position="top" /><TricolorWaves position="bottom" /><GabonOutline /><Monument /><Palm x={80} y={645} scale={1.15} /><Palm x={1550} y={630} scale={0.9} flip /><Architecture /></> : null}
      {scene === "process" ? <><Palm x={50} y={560} scale={1.2} /><Palm x={1560} y={590} scale={0.85} flip /><Architecture /><TricolorWaves position="bottom" /></> : null}
      {scene === "medals" ? <><GabonOutline /><TricolorWaves position="top" /><Palm x={1520} y={620} scale={0.8} flip /></> : null}
      {scene === "values" ? <><Palm x={80} y={610} scale={1.1} /><Palm x={1510} y={620} scale={1} flip /><Architecture /><TricolorWaves position="bottom" /></> : null}
      {scene === "footer" ? <><TricolorWaves position="top" /><Architecture /><Palm x={60} y={625} scale={0.9} /></> : null}
    </svg>
  );
}