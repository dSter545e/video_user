import { Video } from "./types";
import { getMediaApiUrl, getPublicApiUrl } from "./apiConfig";

const parseUrl = (raw?: string | null): URL | null => {
  if (!raw?.trim()) return null;
  try {
    return new URL(raw.trim());
  } catch {
    return null;
  }
};

const readMetaOrigin = (name: string): URL | null => {
  if (typeof document === "undefined") return null;
  return parseUrl(document.querySelector(`meta[name="${name}"]`)?.getAttribute("content"));
};

export const getApiOrigin = (): URL | null => readMetaOrigin("api-base-url") ?? parseUrl(getPublicApiUrl());

export const getMediaApiOrigin = (): URL | null =>
  readMetaOrigin("media-api-base-url") ?? parseUrl(getMediaApiUrl());

const isLocalHost = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";

const isMediaPath = (pathname: string) => pathname.includes("/api/media/");

/** Resolve /api/media URLs to the correct media API host and upgrade HTTP→HTTPS off localhost. */
export const normalizeMediaUrl = (url?: string): string => {
  const input = (url || "").trim();
  if (!input || input === "about:blank") return input;

  const mediaOrigin = getMediaApiOrigin();
  let resolved: URL;

  try {
    resolved = input.startsWith("/") && mediaOrigin ? new URL(input, mediaOrigin) : new URL(input);
  } catch {
    return input;
  }

  if (isMediaPath(resolved.pathname) && mediaOrigin && resolved.host !== mediaOrigin.host) {
    resolved.protocol = mediaOrigin.protocol;
    resolved.host = mediaOrigin.host;
  }

  if (resolved.protocol === "http:" && !isLocalHost(resolved.hostname)) {
    resolved.protocol = "https:";
  }

  return resolved.toString();
};

export const normalizeVideoMedia = <T extends Video>(video: T): T => ({
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
});

export const normalizeVideoList = (videos: Video[]) => videos.map((video) => normalizeVideoMedia(video));
