/** Primary console destinations shared by developers and merchants. */
export const PRIMARY_CONSOLE_NAV = [
  "/dashboard",
  "/transactions",
  "/wallets",
  "/checkout",
  "/api-keys",
  "/reference",
  "/profile",
] as const;

export type PrimaryConsoleNavHref = (typeof PRIMARY_CONSOLE_NAV)[number];

/** Both roles see the same primary routes; capability empty-states gate actions. */
export function primaryNavForRole(_role: string | undefined | null): readonly PrimaryConsoleNavHref[] {
  return PRIMARY_CONSOLE_NAV;
}
