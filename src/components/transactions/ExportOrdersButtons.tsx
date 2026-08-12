"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { downloadOrdersCsv, downloadOrdersPdf } from "@/lib/export/ordersExport";
import type { Order } from "@/lib/types";

export function ExportOrdersButtons({
  orders,
  environment,
  periodLabel = "all time",
  loading = false,
}: {
  orders: Order[];
  environment: string;
  periodLabel?: string;
  loading?: boolean;
}) {
  const [busy, setBusy] = useState<"csv" | "pdf" | null>(null);
  const disabled = loading || orders.length === 0 || busy !== null;

  async function run(kind: "csv" | "pdf") {
    setBusy(kind);
    try {
      // Yield so the button can show a busy state before sync PDF work blocks.
      await new Promise((r) => setTimeout(r, 0));
      const meta = { environment, periodLabel };
      if (kind === "csv") downloadOrdersCsv(orders, meta);
      else downloadOrdersPdf(orders, meta);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[12px] text-muted">
        {loading ? "…" : `${orders.length} order${orders.length === 1 ? "" : "s"}`}
        <span className="text-faint"> · {periodLabel}</span>
      </span>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        onClick={() => run("csv")}
        aria-label={`Export ${orders.length} orders (${periodLabel}) as CSV`}
      >
        {busy === "csv" ? "Exporting…" : "Export CSV"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        onClick={() => run("pdf")}
        aria-label={`Export ${orders.length} orders (${periodLabel}) as PDF`}
      >
        {busy === "pdf" ? "Exporting…" : "Export PDF"}
      </Button>
    </div>
  );
}
