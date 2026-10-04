"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  absoluteCollectUrl,
  createCollectProfile,
  getMyCollectProfile,
  type CollectProfile,
} from "@/lib/api/collect";
import { ApiError } from "@/lib/api/client";

export function CollectProfileCard() {
  const [profile, setProfile] = useState<CollectProfile | null | undefined>(undefined);
  const [slug, setSlug] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [kind, setKind] = useState<"solo" | "company">("solo");
  const [legalName, setLegalName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getMyCollectProfile()
      .then(setProfile)
      .catch((err) => {
        setProfile(null);
        setError(err instanceof ApiError ? err.message : "Failed to load collect profile");
      });
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setProfile(
        await createCollectProfile({
          slug: slug.trim(),
          display_name: displayName.trim(),
          kind,
          legal_name: kind === "company" ? legalName.trim() || undefined : undefined,
        }),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create collect profile");
    } finally {
      setBusy(false);
    }
  }

  if (profile === undefined) {
    return (
      <GlassCard className="p-[22px]">
        <p className="m-0 text-[13px]" style={{ color: "var(--muted)" }}>Loading collect profile…</p>
      </GlassCard>
    );
  }

  if (profile) {
    return (
      <GlassCard className="p-[22px]">
        <div className="mb-1 text-[14.5px] font-bold">Collect profile</div>
        <p className="mb-4 text-[12.5px]" style={{ color: "var(--muted)" }}>
          Public checkout lives at your shop slug. Roles are unchanged — this is additive storefront identity.
        </p>
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <div className="mb-1.5 text-[11px] font-bold tracking-wide text-faint uppercase">Display name</div>
            <div className="text-[13px]">{profile.display_name}</div>
          </div>
          <div>
            <div className="mb-1.5 text-[11px] font-bold tracking-wide text-faint uppercase">Kind</div>
            <div className="text-[13px]">{profile.kind}</div>
          </div>
          <div className="col-span-2">
            <div className="mb-1.5 text-[11px] font-bold tracking-wide text-faint uppercase">Public URL</div>
            <div className="mono break-all text-[13px]">{absoluteCollectUrl(profile.public_path)}</div>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-[22px]">
      <div className="mb-1 text-[14.5px] font-bold">Start collecting</div>
      <p className="mb-4 text-[12.5px]" style={{ color: "var(--muted)" }}>
        Create a solo shop or company profile to get elementpay.net/&#123;slug&#125; and payment links.
      </p>
      <form onSubmit={onCreate} className="flex flex-col gap-3.5">
        <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
          Display name
          <input
            required
            minLength={2}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="rounded-lg px-3 py-2.5 text-[13.5px] font-normal"
            style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)", color: "var(--ink)" }}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
          Slug
          <input
            required
            minLength={3}
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="acme-studio"
            className="mono rounded-lg px-3 py-2.5 text-[13.5px] font-normal"
            style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)", color: "var(--ink)" }}
          />
        </label>
        <div className="flex gap-1 rounded-lg p-1" style={{ background: "var(--surface)", width: "fit-content" }}>
          {(["solo", "company"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className="rounded-md px-3 py-1.5 text-[12.5px] font-bold"
              style={kind === k ? { background: "var(--panel)" } : { color: "var(--muted)" }}
            >
              {k === "solo" ? "Solo" : "Company"}
            </button>
          ))}
        </div>
        {kind === "company" && (
          <label className="flex flex-col gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--muted)" }}>
            Legal name
            <input
              required
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              className="rounded-lg px-3 py-2.5 text-[13.5px] font-normal"
              style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)", color: "var(--ink)" }}
            />
          </label>
        )}
        {error && <p className="m-0 text-[12.5px]" style={{ color: "var(--bad-text)" }}>{error}</p>}
        <Button type="submit" disabled={busy} className="w-fit">
          {busy ? "Creating…" : "Create collect profile"}
        </Button>
      </form>
    </GlassCard>
  );
}
