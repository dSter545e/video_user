import { Video } from "./types";
import { normalizeMediaUrl } from "./mediaUrl";

const isHlsUrl = (url: string) => /\.m3u8(\?|$)/i.test(url);

const isUsableMediaUrl = (url?: string): url is string =>
  Boolean(url && url.trim() && url !== "about:blank" && url.startsWith("http"));

const isImagePosterUrl = (url?: string) => {
  if (!isUsableMediaUrl(url)) return false;
  return /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(url.trim());
};

/** Image thumbnail only — safe for the watch-page player (no video URL fallback). */
export const getVideoPosterImageUrl = (video: Video) => {
  if (isImagePosterUrl(video.thumbnail)) {
    return normalizeMediaUrl(video.thumbnail.trim());
  }
  return "";
};

/** Thumbnail URL, or a progressive MP4 frame source when thumbnail was not uploaded. */
export const getVideoPosterUrl = (video: Video) => {
  if (isUsableMediaUrl(video.thumbnail)) {
    return normalizeMediaUrl(video.thumbnail.trim());
  }

  const progressiveVariant = [...(video.qualityVariants || [])]
    .filter((variant) => isUsableMediaUrl(variant.url) && !isHlsUrl(variant.url))
    .sort((a, b) => (b.height || 0) - (a.height || 0))[0];

  if (progressiveVariant?.url) {
    return normalizeMediaUrl(progressiveVariant.url);
  }

  if (isUsableMediaUrl(video.videoUrl) && !isHlsUrl(video.videoUrl)) {
    return normalizeMediaUrl(video.videoUrl.trim());
  }

  if (isUsableMediaUrl(video.previewUrl)) {
    return normalizeMediaUrl(video.previewUrl.trim());
  }

  return "";
};
