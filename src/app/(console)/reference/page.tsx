"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { TokensTable } from "@/components/reference/TokensTable";
import { ApiExplorer } from "@/components/reference/ApiExplorer";
import { useEnvironment } from "@/lib/env/EnvContext";
import { getTokens } from "@/lib/api/meta";
import { ApiError } from "@/lib/api/client";
import type { TokenMeta } from "@/lib/types";

export default function ReferencePage() {
  const { environment } = useEnvironment();
  const [tab, setTab] = useState<"tokens" | "explorer">("tokens");
  const [tokens, setTokens] = useState<TokenMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Re-shows the loading state whenever the sandbox/live environment changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getTokens(environment)
      .then((data) => {
        if (!cancelled) {
          setTokens(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Failed to load tokens.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [environment]);

  return (
    <>
      <Header title="Reference" />
      <div className="p-7">
        <div className="mb-[22px] flex w-fit gap-1.5 rounded-lg bg-[oklch(0.95_0.004_264)] p-1">
          {(["tokens", "explorer"] as const).map((t) => (
            <span
              key={t}
              onClick={() => setTab(t)}
              className="cursor-pointer rounded-md px-4 py-2 text-[13px] font-bold"
              style={{
                background: tab === t ? "#fff" : "transparent",
                color: tab === t ? "var(--ink)" : "var(--subtle)",
              }}
            >
              {t === "tokens" ? "Chains & tokens" : "API Explorer"}
            </span>
          ))}
        </div>

        {tab === "tokens" ? (
          <div>
            <h1 className="mb-1 text-[22px] font-extrabold tracking-tight">
              Supported chains &amp; tokens
            </h1>
            <p className="mb-[22px] max-w-[560px] text-sm text-muted">
              Live reference for the {environment} environment — the same data your integration
              gets back from{" "}
              <code className="mono rounded bg-[oklch(0.96_0.004_264)] px-1.5 py-0.5">
                GET /meta/tokens
              </code>
              .
            </p>

            {error && (
              <p className="mb-4 rounded-lg border border-line-strong bg-white p-3 text-[13px] text-[oklch(0.55_0.19_25)]">
                {error}
              </p>
            )}

            {loading ? (
              <p className="text-sm text-muted">Loading tokens…</p>
            ) : (
              <>
                <TokensTable tokens={tokens} />
                <div className="rounded-[14px] px-[26px] py-6" style={{ background: "oklch(0.16 0.014 264)" }}>
                  <div
                    className="mb-3 text-[13px] font-bold"
                    style={{ color: "oklch(0.9 0.01 264)" }}
                  >
                    GET /meta/tokens?env={environment}
                  </div>
                  <pre
                    className="mono m-0 text-[12.5px] leading-relaxed whitespace-pre-wrap"
                    style={{ color: "oklch(0.85 0.01 264)" }}
                  >
                    {JSON.stringify({ status: "success", data: tokens.slice(0, 4) }, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        ) : (
          <ApiExplorer />
        )}
      </div>
    </>
  );
}
