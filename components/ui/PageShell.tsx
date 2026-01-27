import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

type PageShellProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function PageShell({ eyebrow, title, subtitle, children }: PageShellProps) {
  return (
    <div className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-ink-subtle">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-[var(--font-display)] font-semibold text-ink sm:text-5xl">
            {title}
          </h1>
          {subtitle ? <p className="text-sm text-ink-muted">{subtitle}</p> : null}
        </header>
        <Card>{children}</Card>
      </div>
    </div>
  );
}
