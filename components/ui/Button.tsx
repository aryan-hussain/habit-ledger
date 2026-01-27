import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white shadow-[var(--shadow-soft)] hover:bg-accent-strong",
  secondary:
    "border border-border bg-surface-3 text-ink hover:bg-surface-2 hover:text-ink",
  ghost: "text-ink-muted hover:bg-surface-3 hover:text-ink",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs tracking-wide",
  md: "h-11 px-4 text-sm tracking-wide",
};

export function getButtonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={getButtonClasses({ variant, size, className })}
      {...props}
    />
  );
}
