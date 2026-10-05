import { getAggregatorBaseUrl, getConsolePartnerApiKey } from "./env";

export type PartnerFetchOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
};

/** Server → aggregator /partner/* request, authenticated with the console's tenant API key. */
export async function partnerFetch(
  path: string,
  options: PartnerFetchOptions = {},
): Promise<Response> {
  const { method = "GET", body } = options;
  const url = `${getAggregatorBaseUrl()}/partner/${path.replace(/^\//, "")}`;
  return fetch(url, {
    method,
    headers: {
      "X-API-Key": getConsolePartnerApiKey(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
}
