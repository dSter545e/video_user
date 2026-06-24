const trimSlash = (value: string) => value.replace(/\/$/, "");

const parseOrigin = (raw: string) => {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
};

const isLocalHost = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";

const stripWww = (hostname: string) => hostname.replace(/^www\./i, "");

const hasApiSubdomain = (hostname: string) => /^api\./i.test(stripWww(hostname));

/** Build https://api.{domain} from a site or API origin (generic, not domain-specific). */
const deriveApiOrigin = (origin: URL) => {
  const baseHost = stripWww(origin.hostname);
  if (isLocalHost(baseHost) || hasApiSubdomain(baseHost)) return null;
  return `${origin.protocol}//api.${baseHost}`;
};

/** JSON API origin (/api/videos, etc.). */
export const getPublicApiUrl = () => trimSlash(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");

/** User-facing site origin. */
export const getPublicSiteUrl = () => trimSlash(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

/**
 * Origin that serves /api/media (HLS). Prefer NEXT_PUBLIC_MEDIA_API_URL.
 * When API + site share a host, or API points at the site domain, derives api.{domain}.
 */
export const getMediaApiUrl = () => {
  const explicit = process.env.NEXT_PUBLIC_MEDIA_API_URL?.trim();
  if (explicit) return trimSlash(explicit);

  const apiUrl = getPublicApiUrl();
  const siteUrl = getPublicSiteUrl();
  const apiOrigin = parseOrigin(apiUrl);
  const siteOrigin = parseOrigin(siteUrl);

  if (apiOrigin && siteOrigin && apiOrigin.host === siteOrigin.host) {
    const derived = deriveApiOrigin(siteOrigin);
    if (derived) return derived;
    return apiUrl;
  }

  if (apiOrigin && hasApiSubdomain(apiOrigin.hostname)) {
    return apiUrl;
  }

  if (apiOrigin) {
    const derived = deriveApiOrigin(apiOrigin);
    if (derived) return derived;
  }

  return apiUrl;
};
