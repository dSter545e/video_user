import { Video } from "./types";
import { getMediaApiUrl, getPublicApiUrl } from "./apiConfig";

const parseOrigin = (raw?: string | null): URL | null => {
  if (!raw?.trim()) return null;
  try {
    return new URL(raw.trim());
  } catch {
    return null;
  }
};

/** JSON API origin (meta api-base-url or NEXT_PUBLIC_API_URL). */
export const getApiOrigin = (): URL | null => {
  if (typeof document !== "undefined") {
    const metaOrigin = parseOrigin(document.querySelector('meta[name="api-base-url"]')?.getAttribute("content"));
    if (metaOrigin) return metaOrigin;
  }
  return parseOrigin(getPublicApiUrl());
};

/** HLS /api/media origin (meta media-api-base-url or derived media API URL). */
export const getMediaApiOrigin = (): URL | null => {
  if (typeof document !== "undefined") {
    const metaOrigin = parseOrigin(
      document.querySelector('meta[name="media-api-base-url"]')?.getAttribute("content")
    );
    if (metaOrigin) return metaOrigin;
  }
  return parseOrigin(getMediaApiUrl());
};

const isLocalHostname = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";

const isMediaProxyPath = (pathname: string) => pathname.includes("/api/media/");

/**
 * Routes /api/media/* to the media API origin (may differ from NEXT_PUBLIC_API_URL when both share the site host).
 */
export const normalizeMediaUrl = (url?: string): string => {
  const trimmed = (url || "").trim();
  if (!trimmed || trimmed === "about:blank") return trimmed;

  const mediaOrigin = getMediaApiOrigin();

  let parsed: URL;
  try {
    if (trimmed.startsWith("/") && mediaOrigin) {
      parsed = new URL(trimmed, mediaOrigin);
    } else {
      parsed = new URL(trimmed);
    }
  } catch {
    return trimmed;
  }

  if (isMediaProxyPath(parsed.pathname) && mediaOrigin && parsed.host !== mediaOrigin.host) {
    parsed.protocol = mediaOrigin.protocol;
    parsed.host = mediaOrigin.host;
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
