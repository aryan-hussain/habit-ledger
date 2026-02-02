"use client";

import { useState, type InputHTMLAttributes, type SVGProps } from "react";
import { cn } from "@/lib/cn";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
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

type IconProps = SVGProps<SVGSVGElement>;

function IconEye(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path
        d="M3 5l18 14"
        strokeLinecap="round"
      />
      <path
        d="M10.6 10.1a3 3 0 004.2 3.9"
        strokeLinecap="round"
      />
      <path
        d="M7.7 7.4C5.1 8.9 3.5 12 3.5 12s3.5 6 9.5 6c2 0 3.7-.6 5.2-1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.6 5.3c.8-.2 1.6-.3 2.4-.3 6 0 9.5 6 9.5 6a17.6 17.6 0 01-3.2 4.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PasswordField({
  label,
  helperText,
  className,
  id,
  name,
  ...props
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const inputId = buildFieldId(label, name, id);

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-subtle"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={show ? "text" : "password"}
          className={cn(
            "w-full rounded-[var(--radius-soft)] border border-border bg-surface px-3 py-2 pr-10 text-sm text-ink shadow-[var(--shadow-soft)] focus:outline-none focus:ring-2 focus:ring-accent/30",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((current) => !current)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[var(--radius-pill)] p-1 text-ink-muted transition hover:text-ink"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <IconEyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <IconEye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {helperText ? <p className="text-xs text-ink-subtle">{helperText}</p> : null}
    </div>
  );
}
