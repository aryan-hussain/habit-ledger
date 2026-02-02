"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageShell } from "@/components/ui/PageShell";
import { PasswordField } from "@/components/ui/PasswordField";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }
      setHasSession(Boolean(data.session));
      setReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session));
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    if (password.length < 6) {
      setStatus("Password should be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setStatus("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setStatus(error.message);
      return;
    }
    setStatus("Password updated. You can sign in now.");
    router.push("/signin");
  };

  return (
    <PageShell
      eyebrow="Account"
      title="Reset password"
      subtitle="Create a new password to regain access."
    >
      {!ready ? (
        <p className="text-sm text-ink-muted">Loading reset session...</p>
      ) : !hasSession ? (
        <div className="space-y-3 text-sm text-ink-muted">
          <p>Your reset link is missing or expired. Request a new one.</p>
          <ButtonLink href="/forgot-password" variant="secondary">
            Request new link
          </ButtonLink>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <PasswordField
            label="New password"
            name="new-password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <PasswordField
            label="Confirm new password"
            name="confirm-password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
          {status ? <p className="text-sm text-ink-muted">{status}</p> : null}
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </Button>
            <ButtonLink href="/signin" variant="ghost">
              Back to sign in
            </ButtonLink>
          </div>
        </form>
      )}
    </PageShell>
  );
}
