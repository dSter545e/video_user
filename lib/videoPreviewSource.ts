import { Video } from "./types";

const isHlsSource = (url: string) => /\.m3u8(\?|$)/i.test(url);

export const isPlayablePreviewUrl = (url?: string) =>
  Boolean(url && url !== "about:blank" && url.startsWith("http"));

/** Prefer a tiny MP4 preview clip, then progressive video, then the lowest HLS variant. */
export const pickPreviewSource = (video: Video) => {
  if (isPlayablePreviewUrl(video.previewUrl)) {
    return video.previewUrl!;
  }

  const variants = [...(video.qualityVariants || [])]
    .filter((variant) => isPlayablePreviewUrl(variant.url))
    .sort((a, b) => (a.height || 0) - (b.height || 0));

  const progressive = variants.find((variant) => !isHlsSource(variant.url));
  if (progressive?.url) return progressive.url;

  const lowHls = variants.find((variant) => (variant.height || 0) <= 480) || variants[0];
  if (lowHls?.url) return lowHls.url;

  if (isPlayablePreviewUrl(video.videoUrl)) return video.videoUrl;
  return "";
};

export { isHlsSource };
