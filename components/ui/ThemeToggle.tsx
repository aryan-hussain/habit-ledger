"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type ThemeToggleProps = {
  collapsed?: boolean;
};

const STORAGE_KEY = "theme";

function getPreferredTheme() {
  if (typeof window === "undefined") {
    return "light";
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: "light" | "dark") {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeToggle({ collapsed }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const next = getPreferredTheme();
    setTheme(next);
    applyTheme(next);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
    applyTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-soft)] border border-border bg-surface/90 px-3 py-2 text-sm font-semibold text-ink transition hover:border-accent/50 hover:bg-surface",
        collapsed && "justify-center px-2"
      )}
      aria-pressed={theme === "dark"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-pill)] bg-surface-3 text-ink">
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
            <path
              d="M21 14.5a8.5 8.5 0 0 1-10.5-10.5 9 9 0 1 0 10.5 10.5Z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
            <circle cx="12" cy="12" r="4.5" fill="currentColor" />
            <path
              d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12h2.5M19 12h2.5M4.2 19.8l1.8-1.8M18 6l1.8-1.8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
      {collapsed ? null : <span>{theme === "dark" ? "Dark mode" : "Light mode"}</span>}
    </button>
  );
}
