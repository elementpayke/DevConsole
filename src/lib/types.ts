export type ApiEnvelope<T> = {
  status: "success" | "error";
  message: string;
  data: T;
};

export type UserRole = "user" | "admin" | "internal" | "developer";

export type User = {
  id: number;
  email: string;
  role: UserRole;
  is_active: boolean;
  kyc_verified: boolean;
  created_at: string;
  updated_at?: string | null;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type DashboardSummary = {
  total_transactions: number;
  pending_orders: number;
  settled_orders: number;
  total_currencies: number;
  total_tokens: number;
};

export type CurrencyStats = {
  total_volume: number;
  settled_amount: number;
  transaction_count: number;
  weekly_growth: number;
};

export type DashboardStats = {
  summary: DashboardSummary;
  fiat_currencies: string[];
  crypto_tokens: string[];
  fiat_breakdown: Record<string, CurrencyStats>;
  crypto_breakdown: Record<string, CurrencyStats>;
};

export type ApiKeyEnvironment = "sandbox" | "live" | "staging";

export type ApiKeyInfo = {
  id: number;
  name: string;
  environment: ApiKeyEnvironment;
  revoked: boolean;
  created_at: string;
  last_used_at: string | null;
  updated_at?: string | null;
  webhook_url: string | null;
  has_webhook_config: boolean;
  send_sms_notifications: boolean;
};

export type ApiKeyCreated = {
  name: string;
  key: string;
  environment: ApiKeyEnvironment;
  created_at: string;
  webhook_url: string | null;
  has_webhook_secret: boolean;
};

export type ApiKeyCreateRequest = {
  name: string;
  rotate_existing?: boolean;
  webhook_url?: string;
  webhook_secret?: string;
};

export type OrderType = 0 | 1; // 0 = OnRamp, 1 = OffRamp
export type OrderStatus =
  | "pending"
  | "processing"
  | "failed"
  | "settled"
  | "completed"
  | "settled_unverified"
  | "refunded";

export type Order = {
  order_id: string;
  status: OrderStatus;
  amount_crypto: number;
  amount_fiat: number;
  currency: string;
  exchange_rate?: number | null;
  token: string;
  invoice_id?: string | null;
  file_id?: string | null;
  phone_number?: string | null;
  client_ref?: string | null;
  client_metadata?: Record<string, unknown> | null;
  creation_transaction_hash?: string | null;
  settlement_transaction_hash?: string | null;
  refund_transaction_hash?: string | null;
  order_type: OrderType;
  wallet_address?: string | null;
  created_at: string;
  updated_at?: string | null;
  fee_charged?: number | null;
  receiver_name?: string | null;
  mpesa_receipt_number?: string | null;
  transaction_time?: string | null;
  till_number?: string | null;
  paybill_number?: string | null;
  account_number?: string | null;
};

export type MetaEnv = "live" | "sandbox" | "all";

export type ChainMeta = {
  chain_id: number;
  name: string;
  env: MetaEnv;
};

export type TokenMeta = {
  symbol: string;
  decimals: number;
  address: string;
  chain_id: number;
  chain_name: string;
  env: MetaEnv;
};
