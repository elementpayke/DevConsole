export type ConsoleEnvironment = "sandbox" | "live";

function trimUrl(value: string | undefined): string {
  return (value ?? "").trim().replace(/\/$/, "");
}

/** Opposite console origin from NEXT_PUBLIC_*_CONSOLE_URL. */
export function getOppositeConsoleUrl(environment: ConsoleEnvironment): string {
  if (environment === "sandbox") {
    return trimUrl(process.env.NEXT_PUBLIC_LIVE_CONSOLE_URL);
  }
  return trimUrl(process.env.NEXT_PUBLIC_SANDBOX_CONSOLE_URL);
}

/** Login path on the opposite console, or empty when that URL is unset. */
export function getOppositeConsoleLoginUrl(environment: ConsoleEnvironment): string {
  const base = getOppositeConsoleUrl(environment);
  return base ? `${base}/login` : "";
}

export function oppositeEnvironmentLabel(
  environment: ConsoleEnvironment,
): "Live" | "Sandbox" {
  return environment === "sandbox" ? "Live" : "Sandbox";
}
