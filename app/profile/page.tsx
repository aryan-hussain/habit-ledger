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
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [joinedAt, setJoinedAt] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
      setUserId(user.id);
      setEmail(user.email ?? "");
      setName((user.user_metadata?.full_name as string) ?? "");
      setTimezone((user.user_metadata?.timezone as string) ?? "");
      setAvatarUrl((user.user_metadata?.avatar_url as string) ?? "");
      setJoinedAt(user.created_at ?? null);
    };
    fetchProfile();
  }, []);

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || email.slice(0, 2).toUpperCase();
  const joinedLabel = joinedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(joinedAt))
    : "—";

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) {
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${userId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true, cacheControl: "3600" });
      if (uploadError) {
        setUploadError(uploadError.message);
        return;
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      setAvatarUrl(publicUrl);
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (updateError) {
        setUploadError(updateError.message);
      }
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      email: email || undefined,
      data: {
        full_name: name,
        timezone,
        avatar_url: avatarUrl || null,
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
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 rounded-[var(--radius-soft)] border border-border bg-surface/80 p-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[var(--radius-pill)] bg-surface-3 text-lg font-semibold text-ink">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={name ? `${name} profile` : "Profile photo"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{initials || "U"}</span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-ink">{name || "Your profile"}</p>
            <p className="text-xs text-ink-muted">{email || "No email set"}</p>
            <p className="text-xs text-ink-subtle">Joined {joinedLabel}</p>
          </div>
        </div>

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
          label="Profile photo"
          name="avatar"
          type="file"
          accept="image/*"
          helperText="Upload a square image for best results."
          onChange={handleAvatarUpload}
          disabled={uploading}
        />
        {uploadError ? <p className="text-xs text-rust">{uploadError}</p> : null}
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
      </div>
    </PageShell>
  );
}
