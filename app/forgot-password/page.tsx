"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageShell } from "@/components/ui/PageShell";
import { TextField } from "@/components/ui/TextField";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    setLoading(false);
    setStatus(
      error
        ? error.message
        : "Check your inbox for a reset link. It may take a minute to arrive."
    );
  };

  return (
    <PageShell
      eyebrow="Account"
      title="Forgot password"
      subtitle="We will email you a secure link to reset your password."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          name="email"
          placeholder="you@domain.com"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        {status ? <p className="text-sm text-ink-muted">{status}</p> : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
          <ButtonLink href="/signin" variant="secondary">
            Back to sign in
          </ButtonLink>
        </div>
      </form>
    </PageShell>
  );
}
