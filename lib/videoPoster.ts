import { Video } from "./types";

const isHlsUrl = (url: string) => /\.m3u8(\?|$)/i.test(url);

const isUsableMediaUrl = (url?: string) => Boolean(url && url.trim() && url !== "about:blank" && url.startsWith("http"));

/** Thumbnail URL, or a progressive MP4 frame source when thumbnail was not uploaded. */
export const getVideoPosterUrl = (video: Video) => {
  if (isUsableMediaUrl(video.thumbnail)) {
    return video.thumbnail.trim();
  }

  const progressiveVariant = [...(video.qualityVariants || [])]
    .filter((variant) => isUsableMediaUrl(variant.url) && !isHlsUrl(variant.url))
    .sort((a, b) => (b.height || 0) - (a.height || 0))[0];

  if (progressiveVariant?.url) {
    return progressiveVariant.url;
  }

  if (isUsableMediaUrl(video.videoUrl) && !isHlsUrl(video.videoUrl)) {
    return video.videoUrl.trim();
  }

  return "";
};
