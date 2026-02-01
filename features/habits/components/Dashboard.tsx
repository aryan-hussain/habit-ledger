"use client";

import { JSX, useState, type SVGProps } from "react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { useHabits } from "../store";
import { formatDisplayDate, getTodayKey } from "../utils";
import { HabitForm } from "./HabitForm";
import { HabitList } from "./HabitList";
import { MonthlyTrends } from "./MonthlyTrends";

type IconProps = SVGProps<SVGSVGElement>;

function IconCheckCircle(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l2.5 2.5L16 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconAlertCircle(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6" strokeLinecap="round" />
      <path d="M12 16h.01" strokeLinecap="round" />
    </svg>
  );
}

function IconCalendar(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" strokeLinecap="round" />
    </svg>
  );
}

function IconMenu(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function IconClose(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
    </svg>
  );
}

type NavItem = {
  id: string;
  label: string;
  hint: string;
  icon: (props: IconProps) => JSX.Element;
};

export function Dashboard() {
  const { habits, userId, userProfile } = useHabits();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const todayKey = getTodayKey();
  const todayEntries = habits.filter((habit) => habit.entries[todayKey]);
  const todaySuccess = habits.filter(
    (habit) => habit.entries[todayKey]?.status === "success"
  ).length;
  const successRate = habits.length
    ? Math.round((todaySuccess / habits.length) * 100)
    : 0;

  const goodHabits = habits.filter((habit) => habit.kind === "good");
  const badHabits = habits.filter((habit) => habit.kind === "bad");
  const navItems: NavItem[] = [
    { id: "good-habits", label: "Good habits", hint: `${goodHabits.length} tracked`, icon: IconCheckCircle },
    { id: "bad-habits", label: "Bad habits", hint: `${badHabits.length} tracked`, icon: IconAlertCircle },
    { id: "monthly-trends", label: "Monthly trends", hint: "Calendar view", icon: IconCalendar },
  ];

  const initials = userProfile?.fullName
    ? userProfile.fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : userProfile?.email?.slice(0, 2).toUpperCase();

  return (
    <div className="relative min-h-screen lg:flex">
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/30 backdrop-blur-sm transition lg:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col gap-6 overflow-y-auto border-b border-border/70 bg-surface/80 backdrop-blur-xl px-6 py-8 shadow-[var(--shadow-card)] transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:border-b-0 lg:border-r lg:bg-surface/85 lg:shadow-none lg:transition-[width]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          sidebarCollapsed ? "lg:w-20 lg:items-center lg:px-3" : "lg:w-80"
        )}
      >
        <div className="flex items-center justify-between lg:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-ink-subtle">
            Habit ledger
          </p>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          >
            <IconClose className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className={cn("flex items-center gap-3", sidebarCollapsed && "lg:justify-center")}>
          <Logo className="h-8 w-8 shrink-0" />
          <h1
            className={cn(
              "text-xl font-[var(--font-display)] font-semibold text-ink",
              sidebarCollapsed && "lg:hidden"
            )}
          >
            Habit Ledger
          </h1>
        </div>

        <ThemeToggle collapsed={sidebarCollapsed} />

        <nav className={cn("space-y-3", sidebarCollapsed && "lg:w-full")}>
          <p
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-subtle",
              sidebarCollapsed && "lg:hidden"
            )}
          >
            Sections
          </p>
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  title={`${item.label} - ${item.hint}`}
                  aria-label={`${item.label} - ${item.hint}`}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--radius-soft)] border border-border bg-surface/90 px-3 py-2 text-sm text-ink transition hover:border-accent/50 hover:bg-surface",
                    sidebarCollapsed && "lg:justify-center lg:px-2"
                  )}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-pill)] bg-surface-3 text-ink">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className={cn("flex-1", sidebarCollapsed && "lg:hidden")}>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-xs text-ink-subtle">{item.hint}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </nav>

        {userProfile ? (
          <div
            className={cn(
              "mt-auto w-full space-y-3 rounded-[var(--radius-soft)] border border-border bg-surface/80 p-4 text-sm text-ink",
              sidebarCollapsed && "lg:flex lg:flex-col lg:items-center lg:p-3"
            )}
          >
            <div className={cn("flex items-center gap-3", sidebarCollapsed && "lg:flex-col")}>
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-pill)] bg-surface-3 text-sm font-semibold text-ink">
                {initials || "U"}
              </div>
              <div className={cn("min-w-0", sidebarCollapsed && "lg:hidden")}>
                <p className="truncate font-semibold">{userProfile.fullName ?? "Account"}</p>
                <p className="truncate text-xs text-ink-subtle">{userProfile.email ?? ""}</p>
              </div>
            </div>
            <ButtonLink
              href="/logout"
              variant="ghost"
              size="sm"
              className={cn("w-full justify-start", sidebarCollapsed && "lg:justify-center")}
            >
              Logout
            </ButtonLink>
          </div>
        ) : null}

        <div className="hidden lg:block">
          <Button
            size="sm"
            variant="secondary"
            type="button"
            className={cn("w-full", sidebarCollapsed && "px-2")}
            onClick={() => setSidebarCollapsed((current) => !current)}
          >
            {sidebarCollapsed ? "Expand" : "Collapse"}
          </Button>
        </div>
      </aside>

      <main className="flex-1 px-3 py-10 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-8">
          <header className="space-y-4 motion-rise">
            <div className="flex items-center justify-between lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-ink-subtle">
                Daily habit ledger
              </p>
              <Button
                size="sm"
                variant="secondary"
                type="button"
                aria-expanded={sidebarOpen}
                aria-controls="sidebar"
                onClick={() => setSidebarOpen(true)}
              >
                <IconMenu className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Open menu</span>
              </Button>
            </div>
            <div className="hidden items-center justify-between gap-4 lg:flex">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-ink-subtle">
                Daily habit ledger
              </p>
              <div className="flex items-center gap-2">
                {!userId ? (
                  <>
                    <ButtonLink href="/signin" variant="secondary" size="sm">
                      Sign in
                    </ButtonLink>
                    <ButtonLink href="/signup" variant="primary" size="sm">
                      Sign up
                    </ButtonLink>
                  </>
                ) : (
                  <>
                    <ButtonLink href="/profile" variant="ghost" size="sm">
                      Profile
                    </ButtonLink>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:hidden">
              {!userId ? (
                <>
                  <ButtonLink href="/signin" variant="secondary" size="sm">
                    Sign in
                  </ButtonLink>
                  <ButtonLink href="/signup" variant="primary" size="sm">
                    Sign up
                  </ButtonLink>
                </>
              ) : (
                <>
                  <ButtonLink href="/profile" variant="ghost" size="sm">
                    Profile
                  </ButtonLink>
                </>
              )}
            </div>
            <h2 className="text-4xl font-[var(--font-display)] font-semibold text-ink sm:text-5xl">
              Make every check-in a conscious choice.
            </h2>
            <p className="max-w-xl text-base text-ink-muted">
              Build a steady rhythm with simple daily proof and clearer momentum.
            </p>
          </header>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] motion-rise motion-rise-delay-1">
            <div className="grid gap-4 grid-cols-3">
              <StatTile label="Today" value={formatDisplayDate()} hint="Local time" />
              <StatTile label="Habits" value={`${habits.length}`} hint="Active tracking" />
              <StatTile
                label="Check-ins"
                value={`${todayEntries.length}/${habits.length || 0}`}
                hint={`${successRate}% success today`}
              />
            </div>
            <div className="space-y-6">
              <Card>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-subtle">
                    Create habit
                  </p>
                  <h2 className="text-xl font-[var(--font-display)] font-semibold text-ink">
                    Add a new daily habit.
                  </h2>
                  <p className="text-sm text-ink-muted">
                    Keep the name simple and measurable so check-ins stay fast.
                  </p>
                </div>
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                  >
                    New habit
                  </Button>
                </div>
              </Card>
            </div>
          </section>

          <section className="space-y-6 motion-rise motion-rise-delay-2">
            <div id="good-habits" className="scroll-mt-24">
              <Card>
                <HabitList
                  title="Good habits"
                  description="Build the rituals you want to keep."
                  habits={goodHabits}
                  emptyCopy="Add your first good habit to begin tracking daily wins."
                />
              </Card>
            </div>
            <div id="bad-habits" className="scroll-mt-24">
              <Card>
                <HabitList
                  title="Bad habits"
                  description="Track what you want to avoid, day by day."
                  habits={badHabits}
                  emptyCopy="Add a bad habit to track and reduce over time."
                />
              </Card>
            </div>
            <div id="monthly-trends" className="scroll-mt-24">
              <Card>
                <MonthlyTrends />
              </Card>
            </div>
          </section>
        </div>
      </main>

      {createOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setCreateOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Create habit"
            className="relative w-full max-w-lg rounded-[var(--radius-card)] border border-border bg-surface/80 backdrop-blur-xl p-6 shadow-[var(--shadow-card)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-subtle">
                  Create habit
                </p>
                <h2 className="mt-2 text-xl font-[var(--font-display)] font-semibold text-ink">
                  Add a new daily habit.
                </h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Close"
                onClick={() => setCreateOpen(false)}
              >
                <IconClose className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <p className="mt-2 text-sm text-ink-muted">
              Keep the name simple and measurable so check-ins stay fast.
            </p>
            <div className="mt-4">
              <HabitForm onSubmitted={() => setCreateOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
