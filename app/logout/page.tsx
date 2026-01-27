"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageShell } from "@/components/ui/PageShell";
import { supabase } from "@/lib/supabaseClient";

export default function LogoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      setStatus(error.message);
      return;
    }
    router.push("/signin");
  };

  return (
    <PageShell
      eyebrow="Account"
      title="Sign out"
      subtitle="Confirm that you want to end your current session."
    >
      <div className="space-y-4 text-sm text-ink-muted">
        <p>Signing out will stop syncing until you sign in again.</p>
        {status ? <p className="text-sm text-rust">{status}</p> : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={handleSignOut} disabled={loading}>
            {loading ? "Signing out..." : "Confirm sign out"}
          </Button>
          <ButtonLink href="/" variant="secondary">
            Back to dashboard
          </ButtonLink>
        </div>
      </div>
    </PageShell>
  );
}
