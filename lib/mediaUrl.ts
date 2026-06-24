import { Video } from "./types";
import { getMediaApiUrl, getPublicSiteUrl } from "./apiConfig";

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

export const getMediaApiOrigin = (): URL | null =>
  readMetaOrigin("media-api-base-url") ?? parseUrl(getMediaApiUrl());

const isLocalHost = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";

const stripWww = (hostname: string) => hostname.replace(/^www\./i, "");

const isMediaPath = (pathname: string) => pathname.includes("/api/media/");

const deriveApiOriginFromHostname = (hostname: string, protocol: string) => {
  const base = stripWww(hostname);
  if (isLocalHost(base) || /^api\./i.test(base)) return null;
  return parseUrl(`${protocol}//api.${base}`);
};

const shouldRewriteMediaUrl = (resolved: URL, mediaOrigin: URL | null): mediaOrigin is URL => {
  if (!mediaOrigin || !isMediaPath(resolved.pathname)) return false;
  if (resolved.host === mediaOrigin.host) return false;

  const siteOrigin = parseUrl(getPublicSiteUrl());
  if (siteOrigin && resolved.host === siteOrigin.host) return true;

  if (typeof window !== "undefined") {
    const pageHost = window.location.host;
    const pageHostname = stripWww(window.location.hostname);
    if (resolved.host === pageHost && !/^api\./i.test(pageHostname)) return true;
  }

  return true;
};

const applyMediaOrigin = (resolved: URL, mediaOrigin: URL) => {
  const pathAndQuery = `${resolved.pathname}${resolved.search}`;
  return new URL(pathAndQuery, mediaOrigin);
};

/** Resolve /api/media URLs to the media API host and upgrade HTTP→HTTPS off localhost. */
export const normalizeMediaUrl = (url?: string): string => {
  const input = (url || "").trim();
  if (!input || input === "about:blank") return input;

  let mediaOrigin = getMediaApiOrigin();
  let resolved: URL;

  try {
    if (input.startsWith("/") && mediaOrigin) {
      resolved = new URL(input, mediaOrigin);
    } else {
      resolved = new URL(input);
    }
  } catch {
    return input;
  }

  if (isMediaPath(resolved.pathname)) {
    if (!mediaOrigin && typeof window !== "undefined") {
      mediaOrigin = deriveApiOriginFromHostname(window.location.hostname, window.location.protocol);
    }

    if (mediaOrigin && shouldRewriteMediaUrl(resolved, mediaOrigin)) {
      resolved = applyMediaOrigin(resolved, mediaOrigin);
    } else if (!mediaOrigin && typeof window !== "undefined") {
      const derived = deriveApiOriginFromHostname(window.location.hostname, window.location.protocol);
      if (derived && resolved.host === window.location.host) {
        resolved = applyMediaOrigin(resolved, derived);
      }
    }
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
