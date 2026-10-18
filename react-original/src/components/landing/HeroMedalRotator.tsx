import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Medal, type MedalType } from "@/components/Medal";
import { cn } from "@/utils/cn";

interface MedalSlide {
  type: MedalType;
  label: string;
  threshold: string;
  accent: "green" | "blue" | "gold";
}

const SLIDES: MedalSlide[] = [
  { type: "bronze", label: "Médaille de bronze", threshold: "10 à 19 ans", accent: "green" },
  { type: "argent", label: "Médaille d'argent", threshold: "20 à 29 ans", accent: "blue" },
  { type: "or", label: "Médaille d'or", threshold: "30 ans et plus", accent: "gold" },
];

const BADGE_STYLES = {
  green: "border-republic-green-200 bg-white/95 text-republic-green-700",
  blue: "border-republic-blue-200 bg-white/95 text-republic-blue-700",
  gold: "border-gold-200 bg-gold-50/95 text-gold-800",
};

/**
 * Composition héroïque autonome : rotation automatique, contrôle manuel et
 * arrêt de l'autoplay lorsque la préférence système réduit les mouvements.
 */
export function HeroMedalRotator() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const active = SLIDES[activeIndex];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % SLIDES.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const move = (direction: -1 | 1) => {
    setActiveIndex((current) => (current + direction + SLIDES.length) % SLIDES.length);
  };

  return (
    <div className="relative flex min-h-[410px] w-full items-center justify-center lg:min-h-[560px]">
      <div className="absolute size-[22rem] rounded-full border border-republic-green-100/80 bg-gradient-to-br from-republic-green-50/80 via-white to-gold-50/70 sm:size-[26rem] lg:size-[31rem]" aria-hidden="true" />
      <div className="absolute size-[17rem] rounded-full border border-gold-200/60 [transform:rotate(16deg)] sm:size-[21rem] lg:size-[25rem]" aria-hidden="true" />
      <div className="absolute size-[13rem] rounded-full border border-republic-blue-100/70 [transform:rotate(-12deg)] sm:size-[17rem]" aria-hidden="true" />

      <div className="absolute top-[7%] left-0 z-20 sm:left-[5%]">
        <span className={cn("block rounded-full border px-3 py-2 text-[0.625rem] font-semibold shadow-card backdrop-blur-sm transition-colors", BADGE_STYLES[active.accent])}>
          {active.label}
          <span className="ml-1 font-normal opacity-75">· {active.threshold}</span>
        </span>
      </div>
      <div className="absolute top-[19%] right-0 z-20 sm:right-[5%]">
        <span className="rounded-full border border-line bg-white/95 px-3 py-2 text-[0.625rem] font-medium text-muted shadow-card backdrop-blur-sm">
          {String(activeIndex + 1).padStart(2, "0")} / 03
        </span>
      </div>
      <div className="absolute right-0 bottom-[16%] z-20 sm:right-[4%]">
        <span className="rounded-full border border-line bg-white/95 px-3 py-2 text-[0.625rem] font-medium text-ink-700 shadow-card backdrop-blur-sm">
          {active.type === "or" ? "Distinction supérieure" : "Reconnaissance nationale"}
        </span>
      </div>

      <div className="relative z-10 flex flex-col items-center [perspective:900px]" aria-live="polite">
        <div key={active.type} className="animate-fade">
          <Medal type={active.type} size="lg" showRibbon label={`${active.label}, représentation conceptuelle`} />
        </div>
        <div className="mt-[-0.25rem] flex items-center gap-2 rounded-full border border-line bg-white/85 px-2 py-1 shadow-card backdrop-blur-sm">
          <button type="button" onClick={() => move(-1)} aria-label="Médaille précédente" className="flex size-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink-900"><Icon name="arrowLeft" className="size-3.5" /></button>
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Choisir une médaille">
            {SLIDES.map((slide, index) => (
              <button key={slide.type} type="button" role="tab" aria-selected={index === activeIndex} aria-label={`Afficher la ${slide.label}`} onClick={() => setActiveIndex(index)} className={cn("rounded-full transition-all duration-300", index === activeIndex ? "h-2 w-7 bg-republic-green-500" : "size-2 bg-ink-200 hover:bg-ink-400")} />
            ))}
          </div>
          <button type="button" onClick={() => move(1)} aria-label="Médaille suivante" className="flex size-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink-900"><Icon name="arrowRight" className="size-3.5" /></button>
        </div>
        <p className="mt-3 text-[0.625rem] tracking-[0.14em] text-muted uppercase">Représentation conceptuelle</p>
      </div>
    </div>
  );
}