"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageShell } from "@/components/ui/PageShell";
import { TextField } from "@/components/ui/TextField";
import { supabase } from "@/lib/supabaseClient";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
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
      title="Sign up"
      subtitle="Create an account to save your habits and check-ins."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextField
          label="Full name"
          name="name"
          placeholder="Your name"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
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
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <TextField
          label="Confirm password"
          type="password"
          name="confirm-password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
        {error ? <p className="text-sm text-rust">{error}</p> : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </Button>
          <ButtonLink href="/signin" variant="secondary">
            Already have an account
          </ButtonLink>
        </div>
      </form>
    </PageShell>
  );
}
