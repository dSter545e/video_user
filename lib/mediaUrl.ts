/** Upgrade http media URLs to https when the page is served over HTTPS (mixed-content safety net). */
export const ensureSecureMediaUrl = (url?: string) => {
  const trimmed = (url || "").trim();
  if (!trimmed || trimmed === "about:blank") return trimmed;

  const isBrowserHttps =
    typeof window !== "undefined" ? window.location.protocol === "https:" : process.env.NODE_ENV === "production";

  if (isBrowserHttps && trimmed.startsWith("http://")) {
    return `https://${trimmed.slice("http://".length)}`;
  }

  return trimmed;
};

export const ensureSecureMediaUrls = <T extends { url?: string }>(variants?: T[]) =>
  (variants || []).map((variant) => ({
    ...variant,
    url: variant.url ? ensureSecureMediaUrl(variant.url) : variant.url,
  }));
