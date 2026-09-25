import { redirect } from "next/navigation";

/** Legacy path — merchant account setup lives at /account/setup. */
export default function WalletSetupRedirectPage() {
  redirect("/account/setup");
}
