"use client";

import { useCallback, useEffect, useRef } from "react";
import Script from "next/script";
import { getTurnstileSiteKey } from "@/lib/turnstile";

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "compact" | "flexible";
    },
  ) => string | null | undefined;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

const getTurnstileApi = (): TurnstileApi | undefined =>
  (window as unknown as { turnstile?: TurnstileApi }).turnstile;

type TurnstileWidgetProps = {
  onToken: (token: string | null) => void;
  className?: string;
};

/**
 * Renders Cloudflare Turnstile when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set.
 * No-op when the site key is missing so rollout can ship FE first.
 */
export function TurnstileWidget({ onToken, className }: TurnstileWidgetProps) {
  const siteKey = getTurnstileSiteKey();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  const renderWidget = useCallback(() => {
    const api = getTurnstileApi();
    if (!siteKey || !containerRef.current || !api) return;
    if (widgetIdRef.current) return;

    containerRef.current.innerHTML = "";
    const widgetId = api.render(containerRef.current, {
      sitekey: siteKey,
      theme: "auto",
      size: "flexible",
      callback: (token: string) => {
        onTokenRef.current(token);
      },
      "expired-callback": () => {
        onTokenRef.current(null);
      },
      "error-callback": () => {
        onTokenRef.current(null);
      },
    });
    widgetIdRef.current = widgetId ?? null;
  }, [siteKey]);

  useEffect(() => {
    if (!siteKey) {
      onTokenRef.current(null);
      return;
    }
    if (getTurnstileApi()) {
      renderWidget();
    }
    return () => {
      const api = getTurnstileApi();
      if (widgetIdRef.current && api) {
        try {
          api.remove(widgetIdRef.current);
        } catch {
          // ignore teardown races
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, renderWidget]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className={className}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={renderWidget}
      />
      <div ref={containerRef} className="flex min-h-[65px] justify-center" />
    </div>
  );
}
