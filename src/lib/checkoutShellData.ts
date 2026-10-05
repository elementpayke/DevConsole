/**
 * Checkout collect surfaces (payment links, invoices, embed) await aggregator
 * collect-profile APIs. This module no longer seeds fake shareable data.
 */

export type PaymentLink = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  type: "One-time" | "Reusable";
  active: boolean;
  paidCount: number;
};

export type Invoice = {
  id: string;
  number: string;
  client: string;
  email: string;
  item: string;
  amount: number;
  currency: string;
  due: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
};

/** Empty until payment-link CRUD is backed by the aggregator. */
export function seedLinks(): PaymentLink[] {
  return [];
}

/** Empty until invoice CRUD is backed by the aggregator. */
export function seedInvoices(): Invoice[] {
  return [];
}
