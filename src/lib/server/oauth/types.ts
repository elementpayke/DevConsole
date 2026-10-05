export type OAuthProvider = "github" | "google";

export type VerifiedOAuthIdentity = {
  subject: string;
  email: string;
  name?: string;
};

export function isOAuthProvider(value: string): value is OAuthProvider {
  return value === "github" || value === "google";
}
