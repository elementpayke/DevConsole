# ElementPay Dev Console

Next.js console for ElementPay merchants (dashboard, API keys, transactions).

## Architecture

Browser calls go to same-origin BFF routes. The Next.js server forwards to the
aggregator and attaches `X-FE-Client-Secret` from server-only env. JWTs are
stored in **httpOnly** cookies (`ep_access_token`, `ep_refresh_token`) — never
in `localStorage` or the JS bundle. The secret must never use `NEXT_PUBLIC_*`.

```
Browser → /api/auth/*     → Aggregator (+ X-FE-Client-Secret; sets httpOnly cookies on login)
Browser → /api/proxy/...  → Aggregator (+ secret + Bearer from cookie)
```

## Getting Started

```bash
cp .env.example .env.local
# set FE_CLIENT_SECRET and AGGREGATOR_BASE_URL
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| Variable | Client? | Purpose |
|----------|---------|---------|
| `FE_CLIENT_SECRET` | **No** (server only) | Shared with aggregator; sent as `X-FE-Client-Secret` |
| `AGGREGATOR_BASE_URL` | **No** (server only) | Aggregator API root, e.g. `https://sandbox.elementpay.net/api/v1` |
| `NEXT_PUBLIC_ENVIRONMENT` | Yes | `sandbox` or `live` badge in the UI |
| `NEXT_PUBLIC_LIVE_CONSOLE_URL` | Yes | Live console origin; sandbox shows “Log in to Live” |
| `NEXT_PUBLIC_SANDBOX_CONSOLE_URL` | Yes | Sandbox console origin; live shows “Log in to Sandbox” |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes | Cloudflare Turnstile site key; widget omitted when empty |

### Cloudflare Turnstile

Login and register send `turnstile_token` to the aggregator (via the BFF).
The aggregator verifies with `TURNSTILE_SECRET_KEY` when
`TURNSTILE_REQUIRED=true`. Rollout: set the site key here → deploy → then flip
the aggregator flag. Password reset / email verify are not Turnstile-gated.

Aggregator debug signals (when `TURNSTILE_REQUIRED=true`):

| Status | Detail | Meaning |
|--------|--------|---------|
| 400 | Captcha verification failed | Missing/invalid token (check widget + site key) |
| 503 | Captcha is not configured | `TURNSTILE_SECRET_KEY` missing on aggregator |
| 503 | Captcha verification unavailable | Cloudflare siteverify error / bad JSON |

Aggregator logs: `Turnstile verification failed error_codes=…` and siteverify
warnings under `app.utils.auth.turnstile`.

### Staging / production (Vercel)

Set `FE_CLIENT_SECRET` and `AGGREGATOR_BASE_URL` as server env vars (not
`NEXT_PUBLIC_`). Use the same `FE_CLIENT_SECRET` value as the aggregator.
Do not set `NEXT_PUBLIC_FE_CLIENT_SECRET`. Set
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` to the same Turnstile site key used by the
dapp (secret stays on the aggregator only).

When the aggregator enables `FE_CLIENT_SECRET_REQUIRED` and
`JWT_ORIGIN_CHECK_REQUIRED`, dapp auth and JWT flows continue to work because
the BFF supplies the secret (Origin check is skipped on that path).

## Scripts

```bash
npm run lint
npm run typecheck
npm run test          # unit + security checks
npm run test:security # secret-leak / cookie flag checks
npm run build
```

## Real vs coming soon

**Wired to the aggregator today:** auth/session, dashboard, transactions, API keys,
reference tokens, merchant onboarding / vault attach, wallets balance (when linked),
off-ramp quote/accept, collect profile create/`me`, payment links, invoices (pay link +
client email; no email send yet), checkout method toggles, embed domain allowlist,
paybill account-number generation, refund-request recording.

**Hosted vanity pages:** `elementpay-checkout` serves `/{slug}` and `/{slug}/l/{link}`
against aggregator public APIs. Apex rewrite on `elementpay.net` is a deploy follow-up.
M-Pesa STK / card capture on pay sessions is not attached yet — sessions are created and
polled only.

**Still shell / ops-gated:** team invites, alert destinations, live C2B paybill
provisioning (account numbers alone do not move money until ops provisions the shared
paybill).
