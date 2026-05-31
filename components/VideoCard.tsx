"use client";

import Link from "next/link";
import Image from "next/image";
import { MouseEvent, useRef, useState } from "react";
import { Video } from "../lib/types";

const formatDuration = (seconds?: number, fallback?: string) => {
  if (!seconds || Number.isNaN(seconds)) return fallback || "00:00";
  const total = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const formatAddedDate = (value?: string) => {
  if (!value) return "recently";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "recently";
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
};

type VideoCardProps = {
  video: Video;
};

const isSlowNetwork = () => {
  if (typeof navigator === "undefined") return false;
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number } }).connection;
  if (!connection) return false;
  const slowTypes = ["slow-2g", "2g", "3g"];
  if (connection.effectiveType && slowTypes.includes(connection.effectiveType)) {
    return true;
  }
  if (typeof connection.downlink === "number" && connection.downlink > 0 && connection.downlink < 1.5) {
    return true;
  }
  return false;
};

const pickPreviewSource = (video: Video) => {
  const variants = [...(video.qualityVariants || [])].sort((a, b) => (a.height || 0) - (b.height || 0));
  if (!variants.length) return video.videoUrl;
  if (isSlowNetwork()) {
    const low = variants.find((variant) => (variant.height || 0) > 0 && (variant.height || 0) <= 360);
    return low?.url || variants[0].url || video.videoUrl;
  }
  return variants[variants.length - 1]?.url || video.videoUrl;
};

const supportsInlinePreview = (video: Video) => {
  if (!video.videoUrl) return false;
  return !video.videoUrl.endsWith(".m3u8");
};

export default function VideoCard({ video }: VideoCardProps) {
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const [previewActive, setPreviewActive] = useState(false);
  const segmentBoundsRef = useRef<Array<{ start: number; end: number }>>([]);
  const segmentIndexRef = useRef(0);
  const [touchPreviewMode, setTouchPreviewMode] = useState(false);

  const buildPreviewSegments = (duration: number) => {
    if (!duration || Number.isNaN(duration) || duration <= 0) {
      return [];
    }
    const clipLength = 5;
    const oneMinutePoint = 60;
    const middlePoint = Math.floor(duration / 2);
    const threeMinutesBeforeEndPoint = Math.max(0, duration - 180);
    const starts = [oneMinutePoint, middlePoint, threeMinutesBeforeEndPoint].map((start) =>
      Math.max(0, Math.min(start, Math.max(0, duration - clipLength)))
    );

    return starts.map((start) => ({
      start,
      end: Math.min(duration, start + clipLength),
    }));
  };

  const jumpToSegment = async (videoElement: HTMLVideoElement, nextSegmentIndex: number) => {
    const segments = segmentBoundsRef.current;
    if (!segments.length || nextSegmentIndex >= segments.length) return;
    segmentIndexRef.current = nextSegmentIndex;
    videoElement.currentTime = segments[nextSegmentIndex].start;
    try {
      await videoElement.play();
    } catch (_error) {
      // Ignore autoplay rejection.
    }
  };

  const handleEnter = async () => {
    if (touchPreviewMode) return;
    if (!previewRef.current || !video.videoUrl) return;
    const videoElement = previewRef.current;
    const sourceForPreview = pickPreviewSource(video);
    if (videoElement.src !== sourceForPreview) {
      videoElement.src = sourceForPreview;
    }
    setPreviewActive(true);

    const startPreview = async () => {
      const duration = videoElement.duration;
      segmentBoundsRef.current = buildPreviewSegments(duration);
      segmentIndexRef.current = 0;
      await jumpToSegment(videoElement, 0);
    };

    if (Number.isFinite(videoElement.duration) && videoElement.duration > 0) {
      await startPreview();
      return;
    }

    const onLoadedMetadata = async () => {
      videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
      await startPreview();
    };
    videoElement.addEventListener("loadedmetadata", onLoadedMetadata);
    videoElement.load();
  };

  const handleLeave = () => {
    if (touchPreviewMode) return;
    const videoElement = previewRef.current;
    if (!videoElement) {
      setPreviewActive(false);
      return;
    }
    videoElement.pause();
    videoElement.currentTime = 0;
    segmentBoundsRef.current = [];
    segmentIndexRef.current = 0;
    setPreviewActive(false);
  };

  const toggleMobilePreview = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const videoElement = previewRef.current;
    if (!videoElement || !video.videoUrl) return;

    if (previewActive) {
      videoElement.pause();
      videoElement.currentTime = 0;
      segmentBoundsRef.current = [];
      segmentIndexRef.current = 0;
      setPreviewActive(false);
      setTouchPreviewMode(false);
      return;
    }

    setTouchPreviewMode(true);
    await handleEnter();
  };

  const handleTimeUpdate = async () => {
    const videoElement = previewRef.current;
    if (!videoElement || !previewActive) return;
    const segments = segmentBoundsRef.current;
    if (!segments.length) return;

    const currentSegment = segments[segmentIndexRef.current];
    if (!currentSegment) return;

    if (videoElement.currentTime >= currentSegment.end) {
      const nextIndex = segmentIndexRef.current + 1;
      if (nextIndex >= segments.length) {
        videoElement.pause();
        videoElement.currentTime = currentSegment.start;
        return;
      }
      await jumpToSegment(videoElement, nextIndex);
    }
  };

  return (
    <Link
      href={`/videos/${video.slug || video._id}`}
      className="group block overflow-hidden border border-[var(--border)] bg-[var(--surface)] transition duration-300 hover:-translate-y-1 hover:border-[var(--brand)]/40 hover:shadow-[0_18px_36px_rgba(0,0,0,0.22)]"
    >
      <article onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
        <div className="relative aspect-video w-full overflow-hidden bg-[var(--surface-muted)]">
          {video.thumbnail ? (
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              unoptimized
              className={`object-cover object-center transition duration-500 group-hover:scale-105 ${previewActive ? "hidden" : "block"}`}
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          ) : (
            <div
              className={`absolute inset-0 items-center justify-center bg-[var(--surface-muted)] yt-muted ${
                previewActive ? "hidden" : "flex"
              }`}
            >
              No thumbnail
            </div>
          )}
          {supportsInlinePreview(video) ? (
            <video
              ref={previewRef}
              src={video.videoUrl}
              muted
              playsInline
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              className={`absolute inset-0 h-full w-full object-cover object-center ${previewActive ? "block" : "hidden"}`}
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-90 transition group-hover:opacity-100" />
          <span className="absolute bottom-2 right-2 rounded bg-black/85 px-2 py-1 text-xs font-semibold text-white">
            {formatDuration(video.durationSeconds, video.duration)}
          </span>
          {supportsInlinePreview(video) ? (
            <button
              type="button"
              onClick={toggleMobilePreview}
              className="absolute bottom-2 left-2 rounded bg-black/85 px-2 py-1 text-xs font-semibold text-white sm:hidden"
            >
              {previewActive ? "Stop Preview" : "Preview"}
            </button>
          ) : null}
        </div>
        <div className="p-4">
          <h2 className="line-clamp-2 text-base font-semibold transition-colors group-hover:text-[var(--brand)]">{video.title}</h2>
          <p className="yt-muted mt-1 line-clamp-2 text-sm">{video.description || "No description available."}</p>
          <div className="yt-muted mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-[var(--surface-muted)] px-2 py-1">Likes {video.likesCount || 0}</span>
            <span className="rounded-full bg-[var(--surface-muted)] px-2 py-1">
              Added {formatAddedDate(video.createdAt)}
            </span>
            <span className="rounded-full bg-[var(--surface-muted)] px-2 py-1">Views {video.viewsCount || 0}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
