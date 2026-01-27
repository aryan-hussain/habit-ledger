"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageShell } from "@/components/ui/PageShell";
import { TextField } from "@/components/ui/TextField";
import { supabase } from "@/lib/supabaseClient";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push("/");
  };

  return (
    <PageShell
      eyebrow="Account"
      title="Sign in"
      subtitle="Welcome back. Keep your habit ledger synced across devices."
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
        <TextField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error ? <p className="text-sm text-rust">{error}</p> : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <ButtonLink href="/signup" variant="secondary">
            Create account
          </ButtonLink>
        </div>
      </form>
    </PageShell>
  );
}
