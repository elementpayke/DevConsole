/**
 * Sanitize catch-all proxy path segments.
 * Rejects traversal and empty segments so the BFF cannot be abused as an open relay.
 */
export function sanitizeProxyPath(segments: string[]): string {
  if (!segments.length) {
    throw new Error("Missing proxy path");
  }
  for (const segment of segments) {
    if (!segment || segment === "." || segment === "..") {
      throw new Error("Invalid proxy path");
    }
    if (segment.includes("/") || segment.includes("\\") || segment.includes("\0")) {
      throw new Error("Invalid proxy path");
    }
  }
  return segments.join("/");
}
