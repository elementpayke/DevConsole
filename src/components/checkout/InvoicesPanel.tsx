"use client";

import { ComingSoonPanel } from "@/components/checkout/ComingSoonPanel";

export function InvoicesPanel() {
  return (
    <ComingSoonPanel
      title="Invoices"
      description="Create and send invoices with a pay link once the aggregator payment-request APIs ship. Send is disabled until then — nothing is emailed from this screen."
    />
  );
}
