const trimSlash = (value: string) => value.replace(/\/$/, "");

const parseOrigin = (raw: string) => {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
};

/** JSON API origin (/api/videos, etc.). */
export const getPublicApiUrl = () => trimSlash(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");

/** User-facing site origin. */
export const getPublicSiteUrl = () => trimSlash(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

/**
 * Origin for /api/media (HLS segments). When API and site share one host, media is usually on api.{domain}.
 * Override with NEXT_PUBLIC_MEDIA_API_URL when your setup differs.
 */
export const getMediaApiUrl = () => {
  const explicit = process.env.NEXT_PUBLIC_MEDIA_API_URL?.trim();
  if (explicit) return trimSlash(explicit);

  const apiUrl = getPublicApiUrl();
  const siteUrl = getPublicSiteUrl();
  const apiOrigin = parseOrigin(apiUrl);
  const siteOrigin = parseOrigin(siteUrl);

  if (!apiOrigin || !siteOrigin || apiOrigin.host !== siteOrigin.host) {
    return apiUrl;
  }

  const baseHost = siteOrigin.hostname.replace(/^www\./i, "");
  if (/^api\./i.test(baseHost)) return apiUrl;

  return `${siteOrigin.protocol}//api.${baseHost}`;
};
