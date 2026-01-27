"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageShell } from "@/components/ui/PageShell";
import { TextField } from "@/components/ui/TextField";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return;
      }
      setEmail(user.email ?? "");
      setName((user.user_metadata?.full_name as string) ?? "");
      setTimezone((user.user_metadata?.timezone as string) ?? "");
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      email: email || undefined,
      data: {
        full_name: name,
        timezone,
      },
    });
    setLoading(false);
    setStatus(error ? error.message : "Profile updated.");
  };

  return (
    <PageShell
      eyebrow="Account"
      title="Profile"
      subtitle="Update your account details and keep your habit streaks safe."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextField
          label="Full name"
          name="name"
          placeholder="Your name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          label="Email"
          type="email"
          name="email"
          placeholder="you@domain.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label="Timezone"
          name="timezone"
          placeholder="e.g. America/New_York"
          autoComplete="off"
          value={timezone}
          onChange={(event) => setTimezone(event.target.value)}
        />
        {status ? <p className="text-sm text-ink-muted">{status}</p> : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
          <ButtonLink href="/logout" variant="ghost">
            Sign out
          </ButtonLink>
        </div>
      </form>
    </PageShell>
  );
}
