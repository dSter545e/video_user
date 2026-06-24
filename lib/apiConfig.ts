const trimSlash = (value: string) => value.replace(/\/$/, "");

/** JSON API origin (/api/videos, etc.). */
export const getPublicApiUrl = () => trimSlash(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");

/** User-facing site origin. */
export const getPublicSiteUrl = () => trimSlash(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

/**
 * Origin that serves /api/media (HLS).
 * Set NEXT_PUBLIC_MEDIA_API_URL explicitly if media is served from a different host than NEXT_PUBLIC_API_URL.
 * Otherwise falls back to NEXT_PUBLIC_API_URL (the JSON API host also serves media).
 */
export const getMediaApiUrl = () => {
  const explicit = process.env.NEXT_PUBLIC_MEDIA_API_URL?.trim();
  if (explicit) return trimSlash(explicit);
  return getPublicApiUrl();
};
