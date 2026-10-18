import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

export function WorkspaceCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(16,42,80,0.025)]", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
      <div>
        {eyebrow ? <p className="text-[0.625rem] font-bold tracking-[0.16em] text-muted uppercase">{eyebrow}</p> : null}
        <h2 className="mt-1 text-[0.95rem] font-semibold text-ink-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}