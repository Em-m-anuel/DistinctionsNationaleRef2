import { cn } from "@/utils/cn";

type MotifVariant = "map" | "architecture" | "botanical" | "curves" | "panorama";

interface InstitutionalMotifsProps {
  className?: string;
  tone?: "blue" | "green" | "neutral";
  variant?: MotifVariant;
}

const TONES = { blue: "#3A75C4", green: "#009E60", neutral: "#64748B" };

function NationalCurves({ opacity = 0.22 }: { opacity?: number }) {
  return <g fill="none" strokeLinecap="round"><path d="M-20 260C100 178 185 328 318 238S514 194 590 237" stroke="#009E60" strokeOpacity={opacity} strokeWidth="2" /><path d="M-16 271C106 189 190 339 322 249S518 205 594 248" stroke="#FCD116" strokeOpacity={opacity + 0.04} strokeWidth="2" /><path d="M-12 282C112 200 196 350 328 260S522 216 598 259" stroke="#3A75C4" strokeOpacity={opacity} strokeWidth="2" /></g>;
}

function MapMotif({ stroke }: { stroke: string }) {
  return <><g transform="translate(112 20) scale(.78)" fill="none" stroke={stroke} strokeOpacity="0.14" strokeWidth="2.2" strokeLinejoin="round"><path d="M214 25 276 30l20 24 44 4 20 35-7 31 21 39-12 43 12 36-28 31-7 45-35 29-40 4-24 30-47-5-33-31-45-13-16-38-37-24-7-46-29-35 20-38-4-45 30-29 15-42 46-6 30-28Z" /><path d="M80 195c24 8 43 25 54 47M107 94c36 22 54 55 56 97M178 52c-11 70-4 134 19 193M158 326c54-29 98-29 154-6" strokeOpacity="0.07" strokeWidth="1.2" /><circle cx="132" cy="154" r="4" fill={stroke} fillOpacity="0.12" stroke="none" /></g><NationalCurves opacity={0.18} /></>;
}

function ArchitectureMotif({ stroke }: { stroke: string }) {
  return <><g stroke={stroke} strokeOpacity="0.1" strokeWidth="1.35" fill="none"><path d="M42 365h440M72 348h380" /><path d="M122 348V170h38v178M180 348V144h38v204M238 348V170h38v178M296 348V144h38v204M354 348V170h38v178" /><path d="M101 170h292M98 154h298M144 142c4-44 45-73 86-73s82 29 86 73" /><path d="M210 69c4-23 25-41 50-41s46 18 50 41M238 28v-14M282 28v-14M238 14h44" /><path d="M206 348V244h68v104M223 348V264h34v84" /></g><NationalCurves opacity={0.13} /></>;
}

function BotanicalMotif({ stroke }: { stroke: string }) {
  return <><g fill="none" stroke={stroke} strokeOpacity="0.11" strokeWidth="1.25" strokeLinecap="round"><path d="M78 402c4-126 67-244 174-330M158 328c-7-67 8-136 50-197M250 378c46-99 113-168 211-224M346 332c16-56 49-102 102-139" /><path d="M113 318c-54-20-72-60-74-103 48 11 78 41 82 86M148 253c-39-33-44-72-34-107 39 21 57 55 48 93M185 184c-20-37-12-71 7-98 27 27 32 58 13 87" /><path d="M282 319c11-50 43-81 85-98-2 46-26 80-69 98M331 253c22-43 57-64 98-68-12 42-40 70-83 76M383 202c24-34 55-48 90-44-15 34-44 54-80 55" /><path d="M74 401c81-27 159-27 235 0M238 405c82-31 165-29 248 5" /></g><NationalCurves opacity={0.11} /></>;
}

function PanoramaMotif({ stroke }: { stroke: string }) {
  return <><g fill="none" stroke={stroke} strokeOpacity="0.1" strokeWidth="1.2"><path d="M0 345c62-25 121-20 177 6 52-36 112-41 181-14 54-21 108-21 162 2" /><path d="M15 348v-55h44v52M73 348v-82h62v80M151 351v-45h50v42M371 346v-70h49v69M436 346v-48h58v50" /><path d="M274 348V146M255 348h38M263 146h22M269 146V78h10v68M267 78l7-42 7 42M257 205h34M260 253h28" /><path d="M0 376c85-18 166-16 244 5s169 21 276-3" /></g><g stroke="#64748B" strokeOpacity="0.08" fill="none"><path d="M18 354c20-20 23-47 10-68 22 10 35 29 37 50 8-17 21-31 41-39-4 24-19 43-40 54M471 354c-17-17-20-39-9-58-18 9-30 24-32 42-7-15-18-26-34-34 3 20 16 36 34 46" /></g><NationalCurves opacity={0.12} /></>;
}

function CurvesWithLandmark({ stroke }: { stroke: string }) {
  return <><NationalCurves opacity={0.2} /><g transform="translate(404 62)" fill="none" stroke={stroke} strokeOpacity="0.09" strokeWidth="1.15"><path d="M44 290V104M29 290h30M33 104h22M38 104V45h12v59M40 45l4-30 4 30M34 147h20M31 195h26M25 290c8-22 12-45 13-70M63 290c-8-22-12-45-13-70" /><circle cx="44" cy="10" r="8" /><path d="M7 291h84" /></g><g transform="translate(48 205)" fill="none" stroke="#64748B" strokeOpacity="0.07" strokeWidth="1"><path d="M0 146C5 96 8 53 4 14M4 16c-24-8-43 0-60 18M4 16c23-14 44-13 62 1M4 16c-14-23-32-31-53-29M4 16c14-25 34-37 57-36" /></g></>;
}

export function InstitutionalMotifs({ className, tone = "blue", variant = "architecture" }: InstitutionalMotifsProps) {
  const stroke = TONES[tone];
  return <svg viewBox="0 0 520 420" fill="none" className={cn("pointer-events-none select-none", className)} aria-hidden="true">{variant === "map" ? <MapMotif stroke={stroke} /> : null}{variant === "architecture" ? <ArchitectureMotif stroke={stroke} /> : null}{variant === "botanical" ? <BotanicalMotif stroke={stroke} /> : null}{variant === "panorama" ? <PanoramaMotif stroke={stroke} /> : null}{variant === "curves" ? <CurvesWithLandmark stroke={stroke} /> : null}</svg>;
}