import { Video } from "./types";
import { normalizeMediaUrl } from "./mediaUrl";

const isHlsUrl = (url: string) => /\.m3u8(\?|$)/i.test(url);

export const isPreviewClipUrl = (url?: string) => Boolean(url?.trim() && /\/previews\//i.test(url.trim()));

/** Pick the full-length stream for the watch page (never the short card preview clip). */
export const resolveWatchPlaybackSrc = (
  video: Pick<Video, "videoUrl" | "previewUrl" | "qualityVariants">
): string => {
  const videoUrl = (video.videoUrl || "").trim();
  const previewUrl = (video.previewUrl || "").trim();
  const variants = (video.qualityVariants || []).filter((v) => v?.url?.trim());

  const pickHls = () => {
    const master = variants.find((v) => /master\.m3u8/i.test(v.url));
    if (master?.url) return normalizeMediaUrl(master.url);

    const hls = variants
      .filter((v) => isHlsUrl(v.url))
      .sort((a, b) => (a.height || 0) - (b.height || 0));

    return hls[0]?.url ? normalizeMediaUrl(hls[0].url) : "";
  };

  if (videoUrl && isHlsUrl(videoUrl) && !isPreviewClipUrl(videoUrl)) {
    return normalizeMediaUrl(videoUrl);
  }

  const isPreview =
    isPreviewClipUrl(videoUrl) ||
    (previewUrl && videoUrl === previewUrl) ||
    (!isHlsUrl(videoUrl) && isPreviewClipUrl(videoUrl));

  if (isPreview) {
    const hls = pickHls();
    if (hls) return hls;
  }

  if (videoUrl && !isPreview) {
    return normalizeMediaUrl(videoUrl);
  }

  return pickHls() || normalizeMediaUrl(videoUrl);
};

export const isVideoPlayable = (
  video: Pick<Video, "videoUrl" | "processingStatus" | "qualityVariants" | "previewUrl">
) => {
  if (video.processingStatus === "processing") return false;

  const src = resolveWatchPlaybackSrc(video);
  if (!src || src === "about:blank") return false;

  return isHlsUrl(src) || /\.(mp4|webm)(\?|$)/i.test(src);
};
