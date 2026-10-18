import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

export function Card({ children, className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-white",
        interactive && "transition-all duration-300 hover:-translate-y-1 hover:border-ink-100 hover:shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}