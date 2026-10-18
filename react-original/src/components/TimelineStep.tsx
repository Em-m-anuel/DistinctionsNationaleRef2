import { Icon, type IconName } from "@/components/icons";

interface TimelineStepProps {
  index: number;
  icon: IconName;
  title: string;
  description: string;
  last?: boolean;
}

export function TimelineStep({ index, icon, title, description, last = false }: TimelineStepProps) {
  return (
    <li className="relative flex gap-4 lg:block lg:flex-1 lg:text-center">
      {!last ? (
        <span className="absolute top-12 left-5 h-[calc(100%+1.5rem)] w-px bg-line-strong lg:top-6 lg:left-[calc(50%+2.2rem)] lg:h-px lg:w-[calc(100%-4.4rem)]" aria-hidden="true" />
      ) : null}
      <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-republic-green-200 bg-white text-republic-green-600 shadow-[0_0_0_5px_rgba(0,158,96,0.07)] lg:mx-auto">
        <Icon name={icon} className="size-[18px]" />
      </span>
      <div className="pb-6 lg:pt-5 lg:pb-0 lg:px-2">
        <p className="text-[0.6875rem] font-bold tracking-[0.16em] text-republic-green-600 uppercase">
          Étape {String(index).padStart(2, "0")}
        </p>
        <h3 className="mt-1.5 text-[0.9375rem] font-semibold leading-snug text-ink-900">{title}</h3>
        <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted">{description}</p>
      </div>
    </li>
  );
}