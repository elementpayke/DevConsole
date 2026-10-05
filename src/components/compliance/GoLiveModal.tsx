"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useEnvironment } from "@/lib/env/EnvContext";
import { getOppositeConsoleLoginUrl } from "@/lib/consoleUrls";

const FACTS = [
  { title: "Customers pay you for real", body: "Payment links, WhatsApp and QR codes now collect real money." },
  { title: "Payouts can't be undone", body: "Once money reaches someone, only they can send it back." },
  { title: "Your test data stays separate", body: "Test payments won't mix with your live ones." },
  { title: "Developers need live keys", body: "If you use the API, swap your test keys for live ones." },
];

export function GoLiveModal({ onClose }: { onClose: () => void }) {
  const { environment } = useEnvironment();
  const [acked, setAcked] = useState(false);
  const liveLoginUrl = getOppositeConsoleLoginUrl(environment);

  return (
    <Modal onClose={onClose} width={560}>
      <div className="mb-1 text-base font-extrabold">You&apos;re approved. Ready to go live?</div>
      <p className="mb-5 text-[13.5px] text-muted">
        From here on, payments use real money. A few things to know:
      </p>

      <div className="mb-5 flex flex-col gap-2.5">
        {FACTS.map((f) => (
          <div
            key={f.title}
            className="rounded-lg p-3"
            style={{ border: "1px solid var(--border)", background: "var(--surface-soft)" }}
          >
            <div className="flex items-start gap-2">
              <span
                className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{ background: "var(--indigo)" }}
              />
              <span>
                <span className="block text-[13.5px] font-semibold">{f.title}</span>
                <span className="block text-xs text-muted">{f.body}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <label className="mb-4 flex items-start gap-2.5 text-[12.5px]">
        <input
          type="checkbox"
          checked={acked}
          onChange={(e) => setAcked(e.target.checked)}
          className="mt-0.5"
        />
        I understand that payments and payouts will use real money.
      </label>

      {!liveLoginUrl && (
        <p className="mb-3 text-[12.5px]" style={{ color: "var(--warn-text)" }}>
          The live console isn&apos;t configured for this environment yet — ask an admin to set
          it up before switching.
        </p>
      )}

      <div className="flex gap-2.5">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Not yet
        </Button>
        <Button
          type="button"
          disabled={!acked || !liveLoginUrl}
          onClick={() => {
            if (liveLoginUrl) window.location.href = liveLoginUrl;
          }}
          className="flex-1"
        >
          Go live
        </Button>
      </div>
    </Modal>
  );
}
