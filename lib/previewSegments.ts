export type PreviewSegment = {
  start: number;
  end: number;
};

const PREVIEW_SEGMENT_SECONDS = 5;
const PREVIEW_MIN_MULTI_SEGMENT_DURATION = 15;
const PREVIEW_LONG_VIDEO_SECONDS = 120;

export const buildPreviewSegments = (duration: number): PreviewSegment[] => {
  if (!duration || Number.isNaN(duration) || duration <= 0) {
    return [{ start: 0, end: PREVIEW_SEGMENT_SECONDS }];
  }

  if (duration < PREVIEW_MIN_MULTI_SEGMENT_DURATION) {
    return [{ start: 0, end: duration }];
  }

  const midStart = Math.max(0, duration / 2 - PREVIEW_SEGMENT_SECONDS / 2);
  const lastStart =
    duration >= PREVIEW_LONG_VIDEO_SECONDS
      ? Math.max(0, duration - 60)
      : Math.max(0, duration - PREVIEW_SEGMENT_SECONDS);

  return [
    { start: 0, end: Math.min(PREVIEW_SEGMENT_SECONDS, duration) },
    { start: midStart, end: Math.min(midStart + PREVIEW_SEGMENT_SECONDS, duration) },
    { start: lastStart, end: Math.min(lastStart + PREVIEW_SEGMENT_SECONDS, duration) },
  ].filter((segment) => segment.end > segment.start);
};
