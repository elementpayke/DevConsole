/**
 * Payment links, invoices and embed config have no aggregator-backed API yet.
 * This module is an in-memory shell so the Checkout UI is fully interactive
 * without pretending data survives a reload or reaches a server.
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

export function seedLinks(): PaymentLink[] {
  return [
    { id: "l1", name: "Standard cart", amount: 5000, currency: "KES", type: "Reusable", active: true, paidCount: 12 },
    { id: "l2", name: "Consulting deposit", amount: 20000, currency: "KES", type: "One-time", active: true, paidCount: 1 },
  ];
}

export function seedInvoices(): Invoice[] {
  return [
    {
      id: "i1",
      number: "INV-1042",
      client: "Kesho Foods Ltd",
      email: "accounts@kesho.co.ke",
      item: "September supply — 40 crates",
      amount: 84000,
      currency: "KES",
      due: "Net 14 days",
      status: "Sent",
    },
  ];
}

export function newId(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 8)}`;
}
