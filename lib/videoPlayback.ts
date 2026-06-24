import { Video } from "./types";
import { ensureSecureMediaUrl } from "./mediaUrl";

const isHlsUrl = (url: string) => /\.m3u8(\?|$)/i.test(url);

export const isPreviewClipUrl = (url?: string) => {
  const trimmed = (url || "").trim();
  if (!trimmed) return false;
  return /\/previews\//i.test(trimmed);
};

/** Full watch page should never play card preview clips (~6s). Prefer HLS master/variants. */
export const resolveWatchPlaybackSrc = (
  video: Pick<Video, "videoUrl" | "previewUrl" | "qualityVariants">
) => {
  const videoUrl = (video.videoUrl || "").trim();
  const previewUrl = (video.previewUrl || "").trim();
  const variants = [...(video.qualityVariants || [])].filter((variant) => variant?.url?.trim());

  if (videoUrl && isHlsUrl(videoUrl) && !isPreviewClipUrl(videoUrl)) {
    return ensureSecureMediaUrl(videoUrl);
  }

  const looksLikePreview =
    isPreviewClipUrl(videoUrl) || (previewUrl && videoUrl === previewUrl) || (!isHlsUrl(videoUrl) && isPreviewClipUrl(videoUrl));

  const pickHls = () => {
    const master = variants.find((variant) => /master\.m3u8/i.test(variant.url));
    if (master?.url) return ensureSecureMediaUrl(master.url.trim());
    const sorted = [...variants]
      .filter((variant) => isHlsUrl(variant.url))
      .sort((a, b) => (a.height || 0) - (b.height || 0));
    return ensureSecureMediaUrl(sorted[0]?.url?.trim() || "");
  };

  if (looksLikePreview) {
    const hls = pickHls();
    if (hls) return hls;
  }

  if (videoUrl && !looksLikePreview) {
    return ensureSecureMediaUrl(videoUrl);
  }

  const fallbackHls = pickHls();
  if (fallbackHls) return fallbackHls;

  return ensureSecureMediaUrl(videoUrl);
};

export const isVideoPlayable = (video: Pick<Video, "videoUrl" | "processingStatus" | "qualityVariants">) => {
  if (video.processingStatus === "processing") return false;

  const src = resolveWatchPlaybackSrc(video);
  if (!src || src === "about:blank") return false;

  return isHlsUrl(src) || /\.(mp4|webm)(\?|$)/i.test(src);
};
