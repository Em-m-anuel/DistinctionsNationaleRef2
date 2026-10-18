import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { cn } from "@/utils/cn";

interface StatCardProps {
  value: number;
  suffix?: string;
  label: string;
  detail: string;
  icon: IconName;
  accent: "green" | "gold" | "blue";
}

const ACCENTS = {
  green: "bg-republic-green-50 text-republic-green-600",
  gold: "bg-gold-100 text-gold-700",
  blue: "bg-republic-blue-50 text-republic-blue-600",
};

export function StatCard({ value, suffix = "", label, detail, icon, accent }: StatCardProps) {
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (reduce) {
            setDisplay(value);
            return;
          }
          const start = performance.now();
          const duration = 1050;
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(value * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [started, value]);

  return (
    <div ref={ref} className="flex items-start gap-4 rounded-2xl border border-white/15 bg-white/[0.06] p-5">
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", ACCENTS[accent])}>
        <Icon name={icon} className="size-[21px]" />
      </span>
      <div>
        <p className="text-2xl font-semibold tracking-[-0.03em] text-white">
          {display.toLocaleString("fr-FR")}{suffix}
        </p>
        <p className="mt-0.5 text-[0.875rem] font-medium text-white">{label}</p>
        <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-100/65">{detail}</p>
      </div>
    </div>
  );
}