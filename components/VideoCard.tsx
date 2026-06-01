"use client";

import Link from "next/link";
import Image from "next/image";
import { MouseEvent, TouchEvent, useEffect, useRef, useState } from "react";
import { FiPause, FiPlay } from "react-icons/fi";
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

type HlsConstructor = typeof import("hls.js").default;

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

const isHlsSource = (url: string) => url.includes(".m3u8");

const pickPreviewSource = (video: Video) => {
  const variants = [...(video.qualityVariants || [])].sort((a, b) => (a.height || 0) - (b.height || 0));
  if (!variants.length) return video.videoUrl;

  if (isSlowNetwork()) {
    const low = variants.find((variant) => (variant.height || 0) > 0 && (variant.height || 0) <= 360);
    return low?.url || variants[0].url || video.videoUrl;
  }

  const preferred =
    variants.find((variant) => (variant.height || 0) >= 360 && (variant.height || 0) <= 480) ||
    variants.find((variant) => (variant.height || 0) > 0) ||
    variants[0];

  return preferred?.url || video.videoUrl;
};

const buildPreviewSegments = (duration: number) => {
  if (!duration || Number.isNaN(duration) || duration <= 0) {
    return [];
  }

  const clipLength = Math.min(5, duration);
  const safeStart = (time: number) => Math.max(0, Math.min(time, Math.max(0, duration - clipLength)));
  const makeSegment = (start: number) => ({
    start: safeStart(start),
    end: safeStart(start) + clipLength,
  });

  if (duration <= clipLength) {
    return [{ start: 0, end: duration }];
  }

  const rawStarts =
    duration <= 30
      ? [0, Math.floor(duration / 2), Math.max(0, duration - clipLength)]
      : duration <= 180
        ? [Math.floor(duration * 0.15), Math.floor(duration / 2), Math.max(0, duration - clipLength - 2)]
        : [60, Math.floor(duration / 2), Math.max(0, duration - 180)];

  const uniqueSegments: Array<{ start: number; end: number }> = [];
  for (const start of rawStarts) {
    const segment = makeSegment(start);
    const duplicate = uniqueSegments.some((item) => Math.abs(item.start - segment.start) < 1);
    if (!duplicate) uniqueSegments.push(segment);
  }

  return uniqueSegments;
};

export default function VideoCard({ video }: VideoCardProps) {
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<InstanceType<HlsConstructor> | null>(null);
  const hlsModuleRef = useRef<HlsConstructor | null>(null);
  const activeSourceRef = useRef("");
  const segmentBoundsRef = useRef<Array<{ start: number; end: number }>>([]);
  const segmentIndexRef = useRef(0);
  const [previewActive, setPreviewActive] = useState(false);
  const touchInteractingRef = useRef(false);

  const canPreview = Boolean(video.videoUrl);

  const cleanupPreview = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const videoElement = previewRef.current;
    if (videoElement) {
      videoElement.pause();
      videoElement.removeAttribute("src");
      videoElement.load();
    }
    activeSourceRef.current = "";
    segmentBoundsRef.current = [];
    segmentIndexRef.current = 0;
  };

  useEffect(() => cleanupPreview, []);

  const waitForLoadedMetadata = (videoElement: HTMLVideoElement) =>
    new Promise<void>((resolve) => {
      if (Number.isFinite(videoElement.duration) && videoElement.duration > 0) {
        resolve();
        return;
      }
      const onLoadedMetadata = () => {
        videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
        resolve();
      };
      videoElement.addEventListener("loadedmetadata", onLoadedMetadata);
    });

  const attachPreviewSource = async (videoElement: HTMLVideoElement, source: string) => {
    if (activeSourceRef.current === source && Number.isFinite(videoElement.duration) && videoElement.duration > 0) {
      return;
    }

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    videoElement.pause();
    videoElement.removeAttribute("src");
    videoElement.load();

    if (isHlsSource(source)) {
      if (!hlsModuleRef.current) {
        const module = await import("hls.js");
        hlsModuleRef.current = module.default;
      }
      const Hls = hlsModuleRef.current;

      if (Hls.isSupported()) {
        await new Promise<void>((resolve, reject) => {
          const hls = new Hls({
            enableWorker: true,
            maxBufferLength: 8,
            maxMaxBufferLength: 16,
          });
          hlsRef.current = hls;
          hls.loadSource(source);
          hls.attachMedia(videoElement);
          hls.on(Hls.Events.MANIFEST_PARSED, () => resolve());
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) reject(new Error("Preview stream failed"));
          });
        });
      } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
        videoElement.src = source;
        videoElement.load();
        await waitForLoadedMetadata(videoElement);
      } else {
        throw new Error("HLS preview is not supported in this browser");
      }
    } else {
      videoElement.src = source;
      videoElement.load();
      await waitForLoadedMetadata(videoElement);
    }

    activeSourceRef.current = source;
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

  const startPreview = async () => {
    if (!previewRef.current || !video.videoUrl) return;
    const videoElement = previewRef.current;
    const sourceForPreview = pickPreviewSource(video);

    try {
      await attachPreviewSource(videoElement, sourceForPreview);
      const duration = videoElement.duration || video.durationSeconds || 0;
      segmentBoundsRef.current = buildPreviewSegments(duration);
      segmentIndexRef.current = 0;
      setPreviewActive(true);
      await jumpToSegment(videoElement, 0);
    } catch (_error) {
      cleanupPreview();
      setPreviewActive(false);
    }
  };

  const stopPreview = () => {
    cleanupPreview();
    setPreviewActive(false);
  };

  const handleEnter = async () => {
    if (touchInteractingRef.current || previewActive) return;
    await startPreview();
  };

  const handleLeave = () => {
    if (touchInteractingRef.current) return;
    stopPreview();
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (!canPreview) return;
    event.stopPropagation();
    touchInteractingRef.current = true;
    void startPreview();
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    stopPreview();
    window.setTimeout(() => {
      touchInteractingRef.current = false;
    }, 400);
  };

  const handleCardClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (previewActive) {
      event.preventDefault();
      stopPreview();
    }
  };

  const handleTimeUpdate = async () => {
    const videoElement = previewRef.current;
    if (!videoElement || !previewActive) return;
    const segments = segmentBoundsRef.current;
    if (!segments.length) return;

    const currentSegment = segments[segmentIndexRef.current];
    if (!currentSegment) return;

    if (videoElement.currentTime >= currentSegment.end - 0.05) {
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
      onClick={handleCardClick}
      className="group block overflow-hidden border border-[var(--border)] bg-[var(--surface)] transition duration-300 hover:-translate-y-1 hover:border-[var(--brand)]/40 hover:shadow-[0_18px_36px_rgba(0,0,0,0.22)]"
    >
      <article>
        <div
          className="relative aspect-video w-full overflow-hidden bg-[var(--surface-muted)] touch-manipulation"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
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
          {canPreview ? (
            <video
              ref={previewRef}
              muted
              playsInline
              preload="none"
              onTimeUpdate={handleTimeUpdate}
              className={`absolute inset-0 h-full w-full object-cover object-center ${previewActive ? "block" : "hidden"}`}
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-90 transition group-hover:opacity-100" />
          <span className="absolute bottom-2 right-2 rounded bg-black/85 px-2 py-1 text-xs font-semibold text-white">
            {formatDuration(video.durationSeconds, video.duration)}
          </span>
          {canPreview ? (
            <span
              className="pointer-events-none absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-white shadow-md"
              aria-hidden
            >
              {previewActive ? <FiPause className="h-4 w-4" /> : <FiPlay className="ml-0.5 h-4 w-4" />}
            </span>
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
