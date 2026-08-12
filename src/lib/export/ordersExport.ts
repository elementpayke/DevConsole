import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import type { Order } from "@/lib/types";

const ORDER_TYPE_LABEL: Record<number, string> = {
  0: "On-ramp",
  1: "Off-ramp",
};

export type ExportMeta = {
  environment: string;
  /** Human-readable period, e.g. "all time" or "2026-08-01 → 2026-08-12". */
  periodLabel?: string;
  exportedAt?: Date;
};

function orderTypeLabel(orderType: number) {
  return ORDER_TYPE_LABEL[orderType] ?? String(orderType);
}

function recipient(order: Order) {
  return order.phone_number ?? order.wallet_address ?? "";
}

function formatIso(iso: string) {
  try {
    return new Date(iso).toISOString();
  } catch {
    return iso;
  }
}

function stamp(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string | number | null | undefined) {
  const raw = value == null ? "" : String(value);
  if (/[",\n\r]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

/** Build status counts + fiat totals by currency for the export header. */
export function buildOrderAnalytics(orders: Order[]) {
  const byStatus: Record<string, number> = {};
  const fiatByCurrency: Record<string, number> = {};
  const cryptoByToken: Record<string, number> = {};

  for (const order of orders) {
    byStatus[order.status] = (byStatus[order.status] ?? 0) + 1;
    fiatByCurrency[order.currency] = (fiatByCurrency[order.currency] ?? 0) + order.amount_fiat;
    cryptoByToken[order.token] = (cryptoByToken[order.token] ?? 0) + order.amount_crypto;
  }

  return { byStatus, fiatByCurrency, cryptoByToken, total: orders.length };
}

const CSV_HEADERS = [
  "order_id",
  "status",
  "order_type",
  "token",
  "amount_crypto",
  "amount_fiat",
  "currency",
  "exchange_rate",
  "recipient",
  "wallet_address",
  "phone_number",
  "fee_charged",
  "client_ref",
  "created_at",
  "updated_at",
] as const;

export function ordersToCsv(orders: Order[], meta: ExportMeta): string {
  const analytics = buildOrderAnalytics(orders);
  const exportedAt = (meta.exportedAt ?? new Date()).toISOString();

  const summaryLines = [
    `# ElementPay orders export`,
    `# environment=${meta.environment}`,
    `# period=${meta.periodLabel ?? "all time"}`,
    `# exported_at=${exportedAt}`,
    `# total_orders=${analytics.total}`,
    `# status_counts=${JSON.stringify(analytics.byStatus)}`,
    `# fiat_totals=${JSON.stringify(analytics.fiatByCurrency)}`,
    `# crypto_totals=${JSON.stringify(analytics.cryptoByToken)}`,
  ];

  const rows = orders.map((o) =>
    [
      o.order_id,
      o.status,
      orderTypeLabel(o.order_type),
      o.token,
      o.amount_crypto,
      o.amount_fiat,
      o.currency,
      o.exchange_rate ?? "",
      recipient(o),
      o.wallet_address ?? "",
      o.phone_number ?? "",
      o.fee_charged ?? "",
      o.client_ref ?? "",
      formatIso(o.created_at),
      o.updated_at ? formatIso(o.updated_at) : "",
    ]
      .map(csvEscape)
      .join(","),
  );

  return [...summaryLines, CSV_HEADERS.join(","), ...rows].join("\n");
}

export function downloadOrdersCsv(orders: Order[], meta: ExportMeta) {
  const csv = ordersToCsv(orders, meta);
  downloadBlob(
    `elementpay-orders-${meta.environment}-${stamp()}.csv`,
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
}

export function downloadOrdersPdf(orders: Order[], meta: ExportMeta) {
  const analytics = buildOrderAnalytics(orders);
  const exportedAt = meta.exportedAt ?? new Date();
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const margin = 40;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("ElementPay — Orders analytics", margin, 36);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text(
    `Environment: ${meta.environment}  ·  Period: ${meta.periodLabel ?? "all time"}  ·  Exported: ${exportedAt.toLocaleString()}  ·  Rows: ${analytics.total}`,
    margin,
    54,
  );

  const statusSummary = Object.entries(analytics.byStatus)
    .map(([k, v]) => `${k}: ${v}`)
    .join("  ·  ");
  const fiatSummary = Object.entries(analytics.fiatByCurrency)
    .map(([k, v]) => `${v.toLocaleString()} ${k}`)
    .join("  ·  ");

  doc.setTextColor(40);
  doc.text(`Status: ${statusSummary || "—"}`, margin, 72);
  doc.text(`Fiat totals: ${fiatSummary || "—"}`, margin, 88);

  autoTable(doc, {
    startY: 104,
    head: [
      [
        "Order",
        "Type",
        "Token",
        "Crypto",
        "Fiat",
        "Recipient",
        "Status",
        "Created",
      ],
    ],
    body: orders.map((o) => [
      o.order_id,
      orderTypeLabel(o.order_type),
      o.token,
      o.amount_crypto.toLocaleString(),
      `${o.amount_fiat.toLocaleString()} ${o.currency}`,
      recipient(o) || "—",
      o.status,
      new Date(o.created_at).toLocaleString(),
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 4,
      overflow: "ellipsize",
    },
    headStyles: {
      fillColor: [65, 51, 215],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [246, 246, 252] },
    margin: { left: margin, right: margin },
  });

  doc.save(`elementpay-orders-${meta.environment}-${stamp()}.pdf`);
}
