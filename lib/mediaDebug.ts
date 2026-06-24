import { getMediaApiUrl, getPublicApiUrl, getPublicSiteUrl } from "./apiConfig";
import { getApiOrigin, getMediaApiOrigin, normalizeMediaUrl } from "./mediaUrl";
import { Video } from "./types";

const DEBUG_PREFIX = "[media-debug]";

export const isMediaDebugEnabled = () => {
  if (process.env.NEXT_PUBLIC_MEDIA_DEBUG === "true") return true;
  if (process.env.NODE_ENV === "development") return true;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1";
  }
  return false;
};

const parseUrl = (value?: string) => {
  if (!value?.trim()) return null;
  try {
    return new URL(value.trim());
  } catch {
    return null;
  }
};

export type MediaUrlCheck = {
  label: string;
  raw: string;
  normalized: string;
  changed: boolean;
  host: string;
  isMediaProxy: boolean;
  pointsAtSite: boolean;
  pointsAtApi: boolean;
};

export type MediaDebugSnapshot = {
  enabled: boolean;
  runtime: "server" | "client";
  pageOrigin: string;
  configuredApiUrl: string;
  configuredSiteUrl: string;
  configuredMediaApiUrl: string;
  metaApiUrl: string;
  metaMediaApiUrl: string;
  resolvedApiOrigin: string;
  resolvedMediaApiOrigin: string;
  apiHostMatchesSite: boolean;
  issues: string[];
  urlChecks: MediaUrlCheck[];
  playbackSrc: string;
  videoId: string;
  videoTitle: string;
};

const buildUrlCheck = (label: string, raw?: string): MediaUrlCheck | null => {
  const value = (raw || "").trim();
  if (!value || value === "about:blank") return null;

  const normalized = normalizeMediaUrl(value);
  const parsed = parseUrl(normalized);
  const mediaOrigin = getMediaApiOrigin();
  const siteOrigin = parseUrl(getPublicSiteUrl());

  return {
    label,
    raw: value,
    normalized,
    changed: value !== normalized,
    host: parsed?.host || "(invalid)",
    isMediaProxy: parsed?.pathname.includes("/api/media/") ?? false,
    pointsAtSite: Boolean(parsed && siteOrigin && parsed.host === siteOrigin.host),
    pointsAtApi: Boolean(parsed && mediaOrigin && parsed.host === mediaOrigin.host),
  };
};

export const collectMediaIssues = (checks: MediaUrlCheck[], apiHostMatchesSite: boolean) => {
  const issues: string[] = [];

  if (apiHostMatchesSite) {
    issues.push(
      "NEXT_PUBLIC_API_URL equals NEXT_PUBLIC_SITE_URL — JSON API may be proxied through the site, but /api/media must reach Express. Media URLs are rewritten to the derived media API host (api.*). Set NEXT_PUBLIC_MEDIA_API_URL if your API host is different."
    );
  }

  for (const check of checks) {
    if (check.isMediaProxy && check.pointsAtSite && !check.pointsAtApi) {
      issues.push(`${check.label} still points at the user site (${check.host}) after normalization.`);
    }
    if (check.raw.startsWith("http://") && !check.raw.includes("localhost") && !check.raw.includes("127.0.0.1")) {
      issues.push(`${check.label} uses HTTP — browsers block this on HTTPS pages.`);
    }
    if (check.isMediaProxy && check.host === "(invalid)") {
      issues.push(`${check.label} is not a valid URL.`);
    }
  }

  return issues;
};

export const buildMediaDebugSnapshot = (
  video: Video,
  playbackSrc: string,
  rawVideo?: Video
): MediaDebugSnapshot => {
  const configuredApiUrl = getPublicApiUrl();
  const configuredSiteUrl = getPublicSiteUrl();
  const configuredMediaApiUrl = getMediaApiUrl();
  const apiOrigin = getApiOrigin();
  const mediaOrigin = getMediaApiOrigin();
  const metaApiUrl =
    typeof document !== "undefined"
      ? document.querySelector('meta[name="api-base-url"]')?.getAttribute("content") || ""
      : "";
  const metaMediaApiUrl =
    typeof document !== "undefined"
      ? document.querySelector('meta[name="media-api-base-url"]')?.getAttribute("content") || ""
      : "";

  let apiHostMatchesSite = false;
  try {
    apiHostMatchesSite = new URL(configuredApiUrl).host === new URL(configuredSiteUrl).host;
  } catch {
    apiHostMatchesSite = false;
  }

  const source = rawVideo || video;
  const urlChecks = [
    buildUrlCheck("videoUrl (from API)", source.videoUrl),
    buildUrlCheck("videoUrl (normalized)", video.videoUrl),
    buildUrlCheck("previewUrl", source.previewUrl),
    buildUrlCheck("thumbnail", source.thumbnail),
    ...(source.qualityVariants || []).map((variant, index) =>
      buildUrlCheck(`qualityVariants[${index}] ${variant.label}`, variant.url)
    ),
    buildUrlCheck("playbackSrc", playbackSrc),
  ].filter(Boolean) as MediaUrlCheck[];

  const issues = collectMediaIssues(urlChecks, apiHostMatchesSite);

  return {
    enabled: isMediaDebugEnabled(),
    runtime: typeof window === "undefined" ? "server" : "client",
    pageOrigin: typeof window !== "undefined" ? window.location.origin : "(server)",
    configuredApiUrl,
    configuredSiteUrl,
    configuredMediaApiUrl,
    metaApiUrl,
    metaMediaApiUrl,
    resolvedApiOrigin: apiOrigin?.origin || "",
    resolvedMediaApiOrigin: mediaOrigin?.origin || "",
    apiHostMatchesSite,
    issues,
    urlChecks,
    playbackSrc,
    videoId: video._id,
    videoTitle: video.title,
  };
};

export const logMediaDebug = (label: string, snapshot: MediaDebugSnapshot) => {
  if (!snapshot.enabled) return;

  console.group(`${DEBUG_PREFIX} ${label}`);
  console.log("config", {
    configuredApiUrl: snapshot.configuredApiUrl,
    configuredSiteUrl: snapshot.configuredSiteUrl,
    configuredMediaApiUrl: snapshot.configuredMediaApiUrl,
    metaApiUrl: snapshot.metaApiUrl,
    metaMediaApiUrl: snapshot.metaMediaApiUrl,
    resolvedApiOrigin: snapshot.resolvedApiOrigin,
    resolvedMediaApiOrigin: snapshot.resolvedMediaApiOrigin,
    pageOrigin: snapshot.pageOrigin,
    runtime: snapshot.runtime,
  });
  console.log("video", { id: snapshot.videoId, title: snapshot.videoTitle });
  console.table(
    snapshot.urlChecks.map((check) => ({
      label: check.label,
      host: check.host,
      media: check.isMediaProxy,
      site: check.pointsAtSite,
      api: check.pointsAtApi,
      changed: check.changed,
      normalized: check.normalized,
    }))
  );
  if (snapshot.issues.length) {
    console.warn("issues", snapshot.issues);
  } else {
    console.log("issues", "none detected");
  }
  console.groupEnd();
};

export type MediaProbeResult = {
  url: string;
  ok: boolean;
  status: number;
  statusText: string;
  contentType: string;
  preview: string;
  error?: string;
};

export const probeMediaUrl = async (url: string): Promise<MediaProbeResult> => {
  const target = normalizeMediaUrl(url);
  try {
    const response = await fetch(target, { method: "GET", cache: "no-store" });
    const contentType = response.headers.get("content-type") || "";
    const body = await response.text();
    return {
      url: target,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType,
      preview: body.slice(0, 280),
    };
  } catch (error) {
    return {
      url: target,
      ok: false,
      status: 0,
      statusText: "Network error",
      contentType: "",
      preview: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const logApiVideoFetch = (endpoint: string, raw: Video | null) => {
  if (!isMediaDebugEnabled() || !raw) return;

  console.group(`${DEBUG_PREFIX} API response ${endpoint}`);
  console.log("raw videoUrl", raw.videoUrl);
  console.log("normalized videoUrl", normalizeMediaUrl(raw.videoUrl));
  if (raw.qualityVariants?.length) {
    console.table(
      raw.qualityVariants.map((variant) => ({
        label: variant.label,
        raw: variant.url,
        normalized: normalizeMediaUrl(variant.url),
      }))
    );
  }
  console.groupEnd();
};
