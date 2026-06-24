import { Video } from "./types";

const getApiOrigin = (): URL | null => {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  try {
    return new URL(raw);
  } catch {
    return null;
  }
};

const isLocalHostname = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";

const isMediaProxyPath = (pathname: string) => pathname.includes("/api/media/");

/**
 * Ensures HTTPS and routes /api/media/* through NEXT_PUBLIC_API_URL (api.xhub4u.online).
 * Fixes mixed-content and wrong-host 404s when the API returns the user-site domain.
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
    parsed.protocol = apiOrigin.protocol;
    parsed.host = apiOrigin.host;
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
