"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import {
  PartnerCustomerIncompleteError,
  submitPartnerCustomer,
  updatePartnerCustomerProfile,
} from "@/lib/api/partnerCustomer";
import type { PartnerCustomer } from "@/lib/types";

const STEPS = [
  { n: "1", title: "Tell us what you are building", note: "One paragraph." },
  { n: "2", title: "KYB documents", note: "Company docs and ID. Under 24 hours." },
  { n: "3", title: "Live keys issued", note: "Swap the key. Nothing else changes." },
];

export function RequestLiveAccessModal({
  partnerCustomer,
  onClose,
  onSubmitted,
}: {
  partnerCustomer: PartnerCustomer;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [company, setCompany] = useState(String(partnerCustomer.profile.legal_name ?? ""));
  const [volume, setVolume] = useState(
    String(partnerCustomer.profile.expected_monthly_volume ?? ""),
  );
  const [useCase, setUseCase] = useState(String(partnerCustomer.profile.use_case ?? ""));
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMissing(null);
    setLoading(true);
    try {
      await updatePartnerCustomerProfile({
        legal_name: company,
        expected_monthly_volume: volume,
        use_case: useCase,
      });
      await submitPartnerCustomer();
      setSubmitted(true);
      onSubmitted();
    } catch (err) {
      if (err instanceof PartnerCustomerIncompleteError) {
        setMissing(err.missing);
      } else {
        setError(err instanceof ApiError ? err.message : "Failed to submit request.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Modal onClose={onClose}>
        <div className="mb-1.5 text-base font-extrabold">Request sent</div>
        <p className="mb-5 text-[13.5px] text-muted">
          Submitted. Reviews usually take under a day.
        </p>
        <Button onClick={onClose} className="w-full">
          Done
        </Button>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} width={560}>
      <div className="mb-1 text-base font-extrabold">Request live access</div>
      <p className="mb-5 text-[13.5px] text-muted">
        We review every account. Test mode stays open.
      </p>

      <div className="mb-5 flex flex-col gap-3">
        {STEPS.map((s) => (
          <div key={s.n} className="flex items-start gap-3">
            <span
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
              style={{ background: "var(--indigo-tint)", color: "var(--indigo-text)" }}
            >
              {s.n}
            </span>
            <span>
              <span className="block text-[13.5px] font-semibold">{s.title}</span>
              <span className="block text-xs text-muted">{s.note}</span>
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 text-[12.5px] font-bold">Company</div>
          <input
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full box-border rounded-lg border border-line-strong px-3.5 py-2.5 font-sans text-[13.5px]"
          />
        </div>
        <div>
          <div className="mb-1.5 text-[12.5px] font-bold">Expected monthly volume</div>
          <input
            required
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            placeholder="KES 4M / month"
            className="w-full box-border rounded-lg border border-line-strong px-3.5 py-2.5 font-sans text-[13.5px]"
          />
        </div>
        <div>
          <div className="mb-1.5 text-[12.5px] font-bold">What are you building?</div>
          <textarea
            required
            rows={3}
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            placeholder="Hosted checkout for our storefront, settling to USDC on Base."
            className="w-full box-border resize-none rounded-lg border border-line-strong px-3.5 py-2.5 font-sans text-[13.5px]"
          />
        </div>

        {missing && missing.length > 0 && (
          <div
            className="rounded-lg p-3 text-[12.5px]"
            style={{ border: "1px solid var(--warn-text)", background: "var(--warn-bg)", color: "var(--warn-text)" }}
          >
            <div className="mb-1 font-bold">Still missing before we can review:</div>
            <ul className="list-disc pl-4">
              {missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}
        {error && <p className="text-[12.5px] font-medium" style={{ color: "var(--bad-text)" }}>{error}</p>}

        <div className="mt-1 flex flex-wrap gap-2.5">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Sending…" : "Send request"}
          </Button>
          <a
            href="mailto:live@elementpay.net?subject=Live%20access%20request"
            className="flex-1 rounded-[var(--radius-md)] border border-line-strong px-4 py-2.5 text-center text-[13.5px] font-bold no-underline text-ink"
          >
            Email live@elementpay.net
          </a>
        </div>
      </form>
    </Modal>
  );
}
