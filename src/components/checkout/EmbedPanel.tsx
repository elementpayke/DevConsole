"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { addEmbedDomain, getMyCollectProfile, listEmbedDomains, type CollectProfile } from "@/lib/api/collect";
import { ApiError } from "@/lib/api/client";
import { ComingSoonPanel } from "@/components/checkout/ComingSoonPanel";

export function EmbedPanel() {
  const [profile, setProfile] = useState<CollectProfile | null | undefined>(undefined);
  const [domains, setDomains] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyCollectProfile()
      .then(async (me) => {
        setProfile(me);
        if (me) setDomains(await listEmbedDomains());
      })
      .catch((err) => {
        setProfile(null);
        setError(err instanceof ApiError ? err.message : "Failed to load embed domains");
      });
  }, []);

  if (profile === undefined) {
    return <p className="text-[13px]" style={{ color: "var(--muted)" }}>Loading…</p>;
  }

  if (!profile) {
    return (
      <ComingSoonPanel
        title="Embed on your site"
        description="Create a collect profile first, then allowlist domains for the checkout SDK."
      />
    );
  }

  async function add() {
    setError(null);
    try {
      setDomains(await addEmbedDomain(draft));
      setDraft("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add domain");
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl p-[18px]" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
      <span className="text-[16px] font-bold">Embed domains</span>
      <p className="m-0 text-[12.5px]" style={{ color: "var(--muted)" }}>
        Domains allowed to load checkout for {profile.slug}. The JS SDK host ships separately.
      </p>
      {error && <p className="m-0 text-[12.5px]" style={{ color: "var(--bad-text)" }}>{error}</p>}
      <div className="flex flex-wrap gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="checkout.yourshop.co.ke"
          className="min-w-[200px] flex-1 rounded-lg px-3 py-2.5 text-[13px]"
          style={{ border: "1px solid var(--border-strong)", background: "var(--panel-solid)", color: "var(--ink)" }}
        />
        <Button type="button" onClick={add}>Add domain</Button>
      </div>
      {domains.length === 0 ? (
        <p className="m-0 text-[13px]" style={{ color: "var(--muted)" }}>No domains allowlisted yet.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {domains.map((d) => (
            <li key={d} className="rounded-lg px-3 py-2 text-[13px] font-semibold" style={{ border: "1px solid var(--line)" }}>
              {d}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
