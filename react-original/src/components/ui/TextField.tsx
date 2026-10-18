import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Icon, type IconName } from "@/components/icons";

interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  icon?: IconName;
  trailing?: ReactNode;
  className?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { id, label, hint, error, icon, trailing, className, ...props },
    ref
  ) {
    const describedBy = error
      ? `${id}-error`
      : hint
        ? `${id}-hint`
        : undefined;

    return (
      <div className={cn("w-full", className)}>
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-ink-800"
        >
          {label}
        </label>
        <div className="relative">
          {icon ? (
            <Icon
              name={icon}
              className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-400"
            />
          ) : null}
          <input
            id={id}
            ref={ref}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "h-12 w-full rounded-xl border bg-white text-[0.9375rem] text-ink-900",
              "placeholder:text-slate-400 outline-none transition-all duration-200",
              "focus:ring-4",
              icon ? "pl-11" : "pl-4",
              trailing ? "pr-12" : "pr-4",
              error
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-line-strong hover:border-ink-300 focus:border-republic-green-500 focus:ring-republic-green-100/70",
              "disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted"
            )}
            {...props}
          />
          {trailing ? (
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
              {trailing}
            </div>
          ) : null}
        </div>
        {hint && !error ? (
          <p id={`${id}-hint`} className="mt-1.5 text-xs leading-relaxed text-muted">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p
            id={`${id}-error`}
            className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-red-600"
          >
            <Icon name="alert" className="mt-px size-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    );
  }
);
