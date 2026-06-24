const trimSlash = (value: string) => value.replace(/\/$/, "");

/** Public backend origin — must serve both /api/videos and /api/media (not the Next.js user site). */
export const getPublicApiUrl = () => trimSlash(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");

/** Optional internal URL for server-side fetches only (e.g. http://127.0.0.1:5000). */
export const getBackendFetchUrl = () => {
  if (typeof window === "undefined") {
    const internal = process.env.API_URL || process.env.BACKEND_INTERNAL_URL;
    if (internal?.trim()) return trimSlash(internal.trim());
  }
  return getPublicApiUrl();
};

export const getPublicSiteUrl = () => trimSlash(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

export const logApiConfigWarnings = () => {
  if (typeof window !== "undefined") return;

  try {
    const apiHost = new URL(getPublicApiUrl()).host;
    const siteHost = new URL(getPublicSiteUrl()).host;
    if (apiHost === siteHost) {
      console.warn(
        `[apiConfig] NEXT_PUBLIC_API_URL and NEXT_PUBLIC_SITE_URL use the same host (${apiHost}). ` +
          "Video media will 404 unless your reverse proxy forwards /api/media to the Express backend. " +
          "Prefer a dedicated API host (e.g. api.yourdomain.com) for NEXT_PUBLIC_API_URL and API_PUBLIC_URL."
      );
    }
  } catch {
    // Ignore invalid URL values during local setup.
  }
};
