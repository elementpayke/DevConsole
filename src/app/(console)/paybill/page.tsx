"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";

export default function PaybillPage() {
  return (
    <>
      <Header title="Paybill" />
      <div className="flex flex-col gap-5 p-5 md:p-7">
        <Link href="/checkout" className="text-[12.5px] font-semibold no-underline" style={{ color: "var(--muted)" }}>
          ← Checkout
        </Link>
        <section
          className="flex flex-col gap-3 rounded-xl p-5"
          style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
        >
          <h1 className="m-0 text-[18px] font-bold">M-Pesa Paybill</h1>
          <p className="m-0 text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>
            Account numbers and posters will be available after paybill references are provisioned
            on your collect profile. Nothing on this page is registered with M-Pesa yet.
          </p>
          <div
            className="rounded-lg px-3 py-2.5 text-[12.5px] leading-relaxed"
            style={{ background: "var(--warn-bg)", color: "var(--warn-text)" }}
          >
            Coming soon — do not share paybill or account numbers from the Console until this feature is live.
          </div>
        </section>
      </div>
    </>
  );
}
