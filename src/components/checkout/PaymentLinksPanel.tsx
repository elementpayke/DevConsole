"use client";

import { ComingSoonPanel } from "@/components/checkout/ComingSoonPanel";

export function PaymentLinksPanel({ onPreview: _onPreview }: { onPreview: () => void }) {
  return (
    <ComingSoonPanel
      title="Payment links"
      description="Reusable and one-time links will appear here once collect profiles and hosted checkout are live. No shareable URLs are issued from this screen yet."
    />
  );
}
