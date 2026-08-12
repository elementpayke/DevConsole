import { jsPDF } from "jspdf";
import type { Order, OrderStatus } from "@/lib/types";

const BRAND = {
  purple: [65, 51, 215] as [number, number, number],
  ink: [20, 20, 28] as [number, number, number],
  muted: [120, 122, 132] as [number, number, number],
  line: [230, 230, 236] as [number, number, number],
  footerBg: [245, 245, 248] as [number, number, number],
  successBg: [220, 245, 230] as [number, number, number],
  successText: [30, 140, 70] as [number, number, number],
  link: [65, 51, 215] as [number, number, number],
};

const PAGE_W = 340;
const MARGIN_X = 22;
const HEADER_H = 52;
const FOOTER_H = 36;

function statusLabel(status: OrderStatus) {
  if (status === "settled" || status === "completed" || status === "settled_unverified") {
    return "SUCCESS";
  }
  return status.replace(/_/g, " ").toUpperCase();
}

function isSuccess(status: OrderStatus) {
  return status === "settled" || status === "completed" || status === "settled_unverified";
}

function formatAmountSent(order: Order) {
  // Off-ramp (1) is fiat leaving the user; on-ramp (0) is fiat received.
  const sign = order.order_type === 0 ? "+" : "-";
  const amount = order.amount_fiat.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${order.currency} ${amount}`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  const date = d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return sameDay ? `Today, ${date} at ${time}` : `${date} at ${time}`;
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function truncateMiddle(value: string, head = 14, tail = 10) {
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

function truncateEnd(value: string, max = 28) {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}...`;
}

function humanToken(token: string) {
  // BASE_USDC → BASE USDC, POLYGON_USDT → POLYGON USDT
  return token.replace(/_/g, " ");
}

function paymentMethod(order: Order) {
  if (order.mpesa_receipt_number || order.phone_number) return "M-pesa";
  if (order.wallet_address) return "Crypto wallet";
  return "—";
}

function recipient(order: Order) {
  return order.receiver_name?.trim() || order.phone_number || order.wallet_address || "—";
}

function rateLine(order: Order, includeCrypto: boolean) {
  if (includeCrypto && order.exchange_rate != null && order.exchange_rate > 0) {
    const rate = order.exchange_rate.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
    return `1 ${humanToken(order.token)} = ${rate} ${order.currency}`;
  }
  return `1 ${order.currency} = 1 ${order.currency}`;
}

type DetailRow = {
  label: string;
  value: string;
  accent?: "link" | "mono";
};

export type ReceiptOptions = {
  /** When true, show crypto amount, token rate, and on-chain tx hash. */
  includeCrypto?: boolean;
};

function buildRows(order: Order, includeCrypto: boolean): DetailRow[] {
  const rows: DetailRow[] = [
    { label: "To", value: recipient(order) },
    { label: "Date & Time", value: formatDateTime(order.created_at) },
  ];

  if (order.mpesa_receipt_number) {
    rows.push({
      label: "M-Pesa Receipt",
      value: order.mpesa_receipt_number,
      accent: "link",
    });
  }

  rows.push({ label: "Payment Method", value: paymentMethod(order) });

  if (includeCrypto) {
    rows.push({
      label: "Crypto",
      value: `${order.amount_crypto.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
      })} ${humanToken(order.token)}`,
    });
  } else {
    rows.push({ label: "Currency", value: order.currency });
  }

  rows.push({ label: "Rate", value: rateLine(order, includeCrypto) });
  rows.push({
    label: "Order ID",
    value: truncateEnd(order.order_id, 30),
    accent: "mono",
  });

  if (includeCrypto) {
    const txHash =
      order.settlement_transaction_hash ||
      order.creation_transaction_hash ||
      order.refund_transaction_hash;
    if (txHash) {
      rows.push({
        label: "Tx Hash",
        value: truncateMiddle(txHash, 12, 10),
        accent: "mono",
      });
    } else if (order.client_ref) {
      rows.push({
        label: "Transaction Reference",
        value: order.client_ref,
        accent: "mono",
      });
    }
  } else if (order.client_ref) {
    rows.push({
      label: "Transaction Reference",
      value: order.client_ref,
      accent: "mono",
    });
  }

  return rows;
}

function drawLogoMark(doc: jsPDF, x: number, y: number, size = 22) {
  // White mark on purple header — rounded square with inner circle.
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, size, size, 5, 5, "F");
  doc.setDrawColor(65, 51, 215);
  doc.setLineWidth(1.6);
  const cx = x + size / 2;
  const cy = y + size / 2;
  doc.circle(cx, cy, size * 0.22, "S");
}

function drawSuccessBadge(doc: jsPDF, x: number, y: number, label: string) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const padX = 10;
  const w = doc.getTextWidth(label) + padX * 2;
  const h = 18;
  doc.setFillColor(...BRAND.successBg);
  doc.roundedRect(x, y, w, h, 9, 9, "F");
  doc.setTextColor(...BRAND.successText);
  doc.text(label, x + padX, y + 12);
  return h;
}

function drawMutedBadge(doc: jsPDF, x: number, y: number, label: string) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const padX = 10;
  const w = doc.getTextWidth(label) + padX * 2;
  const h = 18;
  doc.setFillColor(...BRAND.footerBg);
  doc.roundedRect(x, y, w, h, 9, 9, "F");
  doc.setTextColor(...BRAND.muted);
  doc.text(label, x + padX, y + 12);
  return h;
}

/** Render a single ElementPay transaction receipt PDF matching product receipts. */
export function downloadOrderReceipt(order: Order, options: ReceiptOptions = {}) {
  const includeCrypto = options.includeCrypto ?? true;
  const rows = buildRows(order, includeCrypto);
  const contentTop = HEADER_H + 28;
  const amountBlockH = 78;
  const rowH = 28;
  const rowsH = rows.length * rowH + 12;
  const pageH = contentTop + amountBlockH + rowsH + FOOTER_H + 24;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [PAGE_W, pageH],
  });

  // Header
  doc.setFillColor(...BRAND.purple);
  doc.rect(0, 0, PAGE_W, HEADER_H, "F");
  drawLogoMark(doc, MARGIN_X, (HEADER_H - 22) / 2, 22);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("ElementPay", MARGIN_X + 30, HEADER_H / 2 + 4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("TRANSACTION RECEIPT", PAGE_W - MARGIN_X, HEADER_H / 2 + 3, { align: "right" });

  // Amount block
  let y = contentTop;
  doc.setTextColor(...BRAND.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("AMOUNT SENT", MARGIN_X, y);

  y += 22;
  doc.setTextColor(...BRAND.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text(formatAmountSent(order), MARGIN_X, y);

  y += 16;
  if (isSuccess(order.status)) {
    y += drawSuccessBadge(doc, MARGIN_X, y, statusLabel(order.status));
  } else {
    y += drawMutedBadge(doc, MARGIN_X, y, statusLabel(order.status));
  }

  y += 22;
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.6);
  doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
  y += 18;

  // Detail rows
  const valueX = PAGE_W - MARGIN_X;
  for (const row of rows) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.muted);
    doc.text(row.label, MARGIN_X, y);

    doc.setFont("helvetica", row.accent === "link" ? "bold" : "normal");
    if (row.accent === "link") doc.setTextColor(...BRAND.link);
    else doc.setTextColor(...BRAND.ink);
    doc.setFontSize(10);
    doc.text(row.value, valueX, y, { align: "right" });

    y += rowH;
  }

  // Footer
  const footerY = pageH - FOOTER_H;
  doc.setFillColor(...BRAND.footerBg);
  doc.rect(0, footerY, PAGE_W, FOOTER_H, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text("elementpay.io", MARGIN_X, footerY + FOOTER_H / 2 + 3);
  doc.text(formatShortDate(order.created_at), PAGE_W - MARGIN_X, footerY + FOOTER_H / 2 + 3, {
    align: "right",
  });

  const receiptTag = order.mpesa_receipt_number || order.order_id.slice(0, 12);
  doc.save(`ElementPay-Receipt-${receiptTag}.pdf`);
}
