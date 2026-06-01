"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiPlay } from "react-icons/fi";
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

const formatViews = (count?: number) => {
  const value = count || 0;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M views`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K views`;
  return `${value} views`;
};

type VideoCardProps = {
  video: Video;
};

type HlsConstructor = typeof import("hls.js").default;

const isHlsSource = (url: string) => /\.m3u8(\?|$)/i.test(url);

const isPlayableUrl = (url?: string) => Boolean(url && url !== "about:blank" && url.startsWith("http"));

const pickPreviewSource = (video: Video) => {
  const variants = [...(video.qualityVariants || [])]
    .filter((variant) => isPlayableUrl(variant.url))
    .sort((a, b) => (a.height || 0) - (b.height || 0));

  const progressive = variants.find((variant) => !isHlsSource(variant.url));
  if (progressive?.url) return progressive.url;

  const lowHls = variants.find((variant) => (variant.height || 0) <= 480) || variants[0];
  if (lowHls?.url) return lowHls.url;

  if (isPlayableUrl(video.videoUrl)) return video.videoUrl;
  return "";
};

const buildPreviewSegments = (duration: number) => {
  if (!duration || Number.isNaN(duration) || duration <= 0) {
    return [{ start: 0, end: 5 }];
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

const useHoverPreview = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return enabled;
};

export default function VideoCard({ video }: VideoCardProps) {
  const router = useRouter();
  const hoverPreview = useHoverPreview();
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<InstanceType<HlsConstructor> | null>(null);
  const hlsModuleRef = useRef<HlsConstructor | null>(null);
  const activeSourceRef = useRef("");
  const segmentBoundsRef = useRef<Array<{ start: number; end: number }>>([]);
  const segmentIndexRef = useRef(0);
  const loadingRef = useRef(false);
  const mobilePinnedRef = useRef(false);

  const [previewActive, setPreviewActive] = useState(false);

  const previewSource = pickPreviewSource(video);
  const canPreview = isPlayableUrl(previewSource);
  const videoHref = `/videos/${video.slug || video._id}`;

  const cleanupPreview = useCallback(() => {
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
    loadingRef.current = false;
    mobilePinnedRef.current = false;
  }, []);

  useEffect(() => cleanupPreview, [cleanupPreview]);

  const waitForLoadedMetadata = (videoElement: HTMLVideoElement) =>
    new Promise<void>((resolve, reject) => {
      if (Number.isFinite(videoElement.duration) && videoElement.duration > 0) {
        resolve();
        return;
      }

      const timeout = window.setTimeout(() => {
        videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
        videoElement.removeEventListener("error", onError);
        reject(new Error("Metadata timeout"));
      }, 12000);

      const onLoadedMetadata = () => {
        window.clearTimeout(timeout);
        videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
        videoElement.removeEventListener("error", onError);
        resolve();
      };

      const onError = () => {
        window.clearTimeout(timeout);
        videoElement.removeEventListener("loadedmetadata", onLoadedMetadata);
        videoElement.removeEventListener("error", onError);
        reject(new Error("Video load failed"));
      };

      videoElement.addEventListener("loadedmetadata", onLoadedMetadata);
      videoElement.addEventListener("error", onError);
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
      if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
        videoElement.src = source;
        videoElement.load();
        await waitForLoadedMetadata(videoElement);
      } else {
        if (!hlsModuleRef.current) {
          const module = await import("hls.js");
          hlsModuleRef.current = module.default;
        }
        const Hls = hlsModuleRef.current;
        if (!Hls.isSupported()) {
          throw new Error("HLS is not supported");
        }
        await new Promise<void>((resolve, reject) => {
          const hls = new Hls({
            enableWorker: true,
            maxBufferLength: 10,
            maxMaxBufferLength: 20,
          });
          hlsRef.current = hls;
          hls.loadSource(source);
          hls.attachMedia(videoElement);
          hls.on(Hls.Events.MANIFEST_PARSED, () => resolve());
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) reject(new Error("HLS preview failed"));
          });
        });
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
    } catch {
      // Autoplay blocked or interrupted.
    }
  };

  const prepareSegments = (videoElement: HTMLVideoElement) => {
    const duration = videoElement.duration || video.durationSeconds || 0;
    segmentBoundsRef.current = buildPreviewSegments(duration);
    segmentIndexRef.current = 0;
  };

  const unlockPlayback = (videoElement: HTMLVideoElement) => {
    videoElement.muted = true;
    videoElement.defaultMuted = true;
    videoElement.playsInline = true;
    videoElement.setAttribute("playsinline", "");
    videoElement.setAttribute("webkit-playsinline", "true");
    void videoElement.play().catch(() => {});
  };

  const playPreview = useCallback(async (): Promise<boolean> => {
    if (!canPreview || !previewRef.current || loadingRef.current) return false;

    loadingRef.current = true;
    const videoElement = previewRef.current;
    setPreviewActive(true);
    unlockPlayback(videoElement);

    try {
      await attachPreviewSource(videoElement, previewSource);
      prepareSegments(videoElement);
      await jumpToSegment(videoElement, 0);
      return true;
    } catch {
      cleanupPreview();
      setPreviewActive(false);
      return false;
    } finally {
      loadingRef.current = false;
    }
  }, [canPreview, cleanupPreview, previewSource]);

  const stopPreview = useCallback(() => {
    cleanupPreview();
    setPreviewActive(false);
  }, [cleanupPreview]);

  const startMobilePreview = () => {
    if (!canPreview || loadingRef.current) return;
    mobilePinnedRef.current = true;
    void playPreview();
  };

  const handleMediaPointerEnter = () => {
    if (!hoverPreview || !canPreview) return;
    void playPreview();
  };

  const handleMediaPointerLeave = () => {
    if (!hoverPreview || !previewActive) return;
    stopPreview();
  };

  const handleMediaClick = () => {
    if (hoverPreview) {
      router.push(videoHref);
      stopPreview();
      return;
    }

    if (!canPreview) {
      router.push(videoHref);
      return;
    }

    if (previewActive) {
      router.push(videoHref);
      return;
    }

    startMobilePreview();
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
    <article className={`video-card group ${previewActive ? "video-card--previewing" : ""}`}>
      <div
        className="video-card__media"
        onPointerEnter={handleMediaPointerEnter}
        onPointerLeave={handleMediaPointerLeave}
        onTouchStart={() => {
          if (hoverPreview) return;
          startMobilePreview();
        }}
        onClick={(event) => {
          event.preventDefault();
          handleMediaClick();
        }}
        role="button"
        tabIndex={0}
        aria-label={previewActive ? `Previewing ${video.title}. Tap again to watch.` : `Preview ${video.title}`}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleMediaClick();
          }
        }}
      >
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt=""
            fill
            unoptimized
            className="video-card__thumb"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="video-card__thumb flex items-center justify-center yt-muted" aria-hidden>
            No thumbnail
          </div>
        )}

        {canPreview ? (
          <video
            ref={previewRef}
            muted
            playsInline
            disablePictureInPicture
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            className="video-card__preview"
          />
        ) : null}

        <div className="video-card__shade" />

        {!previewActive && canPreview ? (
          <span className="pointer-events-none absolute inset-0 z-[4] flex items-center justify-center opacity-0 transition group-hover:opacity-100">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
              <FiPlay className="ml-0.5 h-5 w-5" />
            </span>
          </span>
        ) : null}

        {previewActive ? <span className="video-card__badge">Preview</span> : null}

        <span className="video-card__duration">{formatDuration(video.durationSeconds, video.duration)}</span>
      </div>

      <Link href={videoHref} className="video-card__body block">
        <h2 className="video-card__title">{video.title}</h2>
        <div className="video-card__meta">
          {video.category?.name ? <span>{video.category.name}</span> : null}
          <span>{formatViews(video.viewsCount)}</span>
          {video.videoId ? <span>ID {video.videoId}</span> : null}
        </div>
      </Link>
    </article>
  );
}
