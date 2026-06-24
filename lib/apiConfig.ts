const trimSlash = (value: string) => value.replace(/\/$/, "");

const parseOrigin = (raw: string) => {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
};

/** Public backend origin for JSON API calls (/api/videos, etc.). */
export const getPublicApiUrl = () => trimSlash(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");

export const getPublicSiteUrl = () => trimSlash(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

/**
 * Origin that serves /api/media (HLS). When API + site share one host (reverse proxy),
 * media is usually on api.{domain} — override with NEXT_PUBLIC_MEDIA_API_URL if different.
 */
export const getMediaApiUrl = () => {
  const explicit = process.env.NEXT_PUBLIC_MEDIA_API_URL?.trim();
  if (explicit) return trimSlash(explicit);

  const apiUrl = getPublicApiUrl();
  const siteUrl = getPublicSiteUrl();
  const apiOrigin = parseOrigin(apiUrl);
  const siteOrigin = parseOrigin(siteUrl);

  if (!apiOrigin || !siteOrigin) return apiUrl;
  if (apiOrigin.host !== siteOrigin.host) return apiUrl;

  const baseHost = siteOrigin.hostname.replace(/^www\./i, "");
  if (/^api\./i.test(baseHost)) return apiUrl;

  return `${siteOrigin.protocol}//api.${baseHost}`;
};

export const logApiConfigWarnings = () => {
  if (typeof window !== "undefined") return;

  try {
    const apiHost = new URL(getPublicApiUrl()).host;
    const siteHost = new URL(getPublicSiteUrl()).host;
    const mediaHost = new URL(getMediaApiUrl()).host;

    if (apiHost === siteHost) {
      console.warn(
        `[apiConfig] NEXT_PUBLIC_API_URL and NEXT_PUBLIC_SITE_URL share host (${apiHost}). ` +
          `Media requests will use ${mediaHost}. Set NEXT_PUBLIC_MEDIA_API_URL or API_PUBLIC_URL on the backend if that is wrong.`
      );
    }
  } catch {
    // Ignore invalid URL values during local setup.
  }
};
