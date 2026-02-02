import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helperText?: string;
};

function buildFieldId(label: string, name?: string, id?: string) {
  if (id) {
    return id;
  }
  if (name) {
    return name;
  }
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function TextField({
  label,
  helperText,
  className,
  id,
  name,
  ...props
}: TextFieldProps) {
  const inputId = buildFieldId(label, name, id);

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-subtle"
      >
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={cn(
          "w-full rounded-[var(--radius-soft)] border border-border bg-surface px-3 py-2 text-sm text-ink shadow-[var(--shadow-soft)] focus:outline-none focus:ring-2 focus:ring-accent/30",
          className
        )}
        {...props}
      />
      {helperText ? <p className="text-xs text-ink-subtle">{helperText}</p> : null}
    </div>
  );
}
