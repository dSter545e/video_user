import { Video } from "./types";
import { getPublicApiUrl, getPublicSiteUrl } from "./apiConfig";

const parseOrigin = (raw?: string | null): URL | null => {
  if (!raw?.trim()) return null;
  try {
    return new URL(raw.trim());
  } catch {
    return null;
  }
};

/** Backend origin for /api/media — from layout meta (runtime) or NEXT_PUBLIC_API_URL. */
export const getApiOrigin = (): URL | null => {
  if (typeof document !== "undefined") {
    const metaOrigin = parseOrigin(document.querySelector('meta[name="api-base-url"]')?.getAttribute("content"));
    if (metaOrigin) return metaOrigin;
  }
  return parseOrigin(getPublicApiUrl());
};

const isLocalHostname = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";

const isMediaProxyPath = (pathname: string) => pathname.includes("/api/media/");

const mediaUrlTargetsFrontend = (mediaHost: string, apiOrigin: URL) => {
  if (mediaHost === apiOrigin.host) return false;

  if (typeof window !== "undefined" && mediaHost === window.location.host) {
    return true;
  }

  const siteOrigin = parseOrigin(getPublicSiteUrl());
  return Boolean(siteOrigin && mediaHost === siteOrigin.host);
};

/**
 * Routes /api/media/* to the configured backend origin.
 * Fixes API responses that used the user-site Host header instead of the API host.
 */
export const normalizeMediaUrl = (url?: string): string => {
  const trimmed = (url || "").trim();
  if (!trimmed || trimmed === "about:blank") return trimmed;

  const apiOrigin = getApiOrigin();

  let parsed: URL;
  try {
    if (trimmed.startsWith("/") && apiOrigin) {
      parsed = new URL(trimmed, apiOrigin);
    } else {
      parsed = new URL(trimmed);
    }
  } catch {
    return trimmed;
  }

  if (isMediaProxyPath(parsed.pathname) && apiOrigin) {
    if (mediaUrlTargetsFrontend(parsed.host, apiOrigin)) {
      parsed.protocol = apiOrigin.protocol;
      parsed.host = apiOrigin.host;
    }
    return parsed.toString();
  }

  if (parsed.protocol === "http:" && !isLocalHostname(parsed.hostname)) {
    parsed.protocol = "https:";
    return parsed.toString();
  }

  return parsed.toString();
};

/** @deprecated Use normalizeMediaUrl */
export const ensureSecureMediaUrl = normalizeMediaUrl;

export const normalizeVideoMedia = <T extends Video>(video: T): T => {
  if (!video) return video;

  return {
    ...video,
    videoUrl: normalizeMediaUrl(video.videoUrl),
    previewUrl: video.previewUrl ? normalizeMediaUrl(video.previewUrl) : video.previewUrl,
    thumbnail: video.thumbnail ? normalizeMediaUrl(video.thumbnail) : video.thumbnail,
    qualityVariants: (video.qualityVariants || []).map((variant) => ({
      ...variant,
      url: normalizeMediaUrl(variant.url),
    })),
    recommendedVideos: video.recommendedVideos?.map((item) => normalizeVideoMedia(item)),
    category: video.category
      ? {
          ...video.category,
          imageUrl: video.category.imageUrl ? normalizeMediaUrl(video.category.imageUrl) : video.category.imageUrl,
        }
      : video.category,
  };
};

export const normalizeVideoList = (videos: Video[]) => videos.map((video) => normalizeVideoMedia(video));
