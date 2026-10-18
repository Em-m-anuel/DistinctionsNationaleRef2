import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "onDark";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-republic-green-500 " +
  "disabled:cursor-not-allowed disabled:opacity-55 select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-republic-green-500 text-white shadow-[0_1px_2px_rgba(0,104,63,0.25)] " +
    "hover:bg-republic-green-600 hover:shadow-[0_8px_20px_-10px_rgba(0,104,63,0.6)] " +
    "active:bg-republic-green-700",
  secondary:
    "border border-line-strong bg-white text-ink-800 hover:border-ink-300 hover:bg-canvas " +
    "active:bg-ink-50",
  outline:
    "border border-republic-blue-500/70 bg-white text-ink-900 hover:border-republic-blue-500 hover:bg-republic-blue-50 " +
    "active:bg-republic-blue-100",
  ghost: "text-ink-700 hover:bg-ink-50 active:bg-ink-100",
  onDark:
    "border border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/20 " +
    "active:bg-white/25",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[0.8125rem]",
  md: "h-11 px-5 text-sm",
  lg: "h-[52px] px-7 text-[0.9375rem]",
};

interface SharedProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
}

type AsButton = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type AsLink = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    href: string;
  };

export function Button(props: AsButton | AsLink) {
  const {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    className,
    children,
    ...rest
  } = props as AsButton & { href?: string };

  const classes = cn(
    base,
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className
  );

  const content = (
    <>
      {loading && (
        <svg
          className="size-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="2.4"
            opacity="0.28"
          />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      )}
      {children}
    </>
  );

  const isDisabled = loading || Boolean((rest as { disabled?: boolean }).disabled);

  if (rest.href) {
    const { href, onClick, ...anchorRest } = rest;
    const anchorProps =
      anchorRest as unknown as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a
        href={href}
        onClick={onClick as AnchorHTMLAttributes<HTMLAnchorElement>["onClick"]}
        className={classes}
        aria-disabled={isDisabled || undefined}
        {...anchorProps}
      >
        {content}
      </a>
    );
  }

  const {
    href: _unused,
    disabled,
    type,
    onClick,
    ...buttonRest
  } = rest;
  void _unused;

  return (
    <button
      type={type ?? "button"}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading || undefined}
      className={classes}
      {...buttonRest}
    >
      {content}
    </button>
  );
}
