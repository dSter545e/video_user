"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getHlsModule, preloadHlsModule, type HlsConstructor } from "../lib/hlsPreviewLoader";
import { claimVideoPreview, VIDEO_PREVIEW_CLAIM_EVENT, VideoPreviewClaimDetail } from "../lib/videoPreviewCoordinator";
import { isHlsSource, isPlayablePreviewUrl, pickPreviewSource } from "../lib/videoPreviewSource";
import { Video } from "../lib/types";

const PREVIEW_IDLE_MS = 45000;

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

type UseVideoPreviewOptions = {
  video: Video;
  videoHref: string;
  onPreviewActiveChange?: (active: boolean) => void;
};

export const useVideoPreview = ({ video, videoHref, onPreviewActiveChange }: UseVideoPreviewOptions) => {
  const router = useRouter();
  const hoverPreview = useHoverPreview();
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<InstanceType<HlsConstructor> | null>(null);
  const activeSourceRef = useRef("");
  const segmentBoundsRef = useRef<Array<{ start: number; end: number }>>([]);
  const segmentIndexRef = useRef(0);
  const loadingRef = useRef(false);
  const warmedRef = useRef(false);
  const mobilePinnedRef = useRef(false);
  const idleCleanupRef = useRef<number | null>(null);

  const [previewActive, setPreviewActive] = useState(false);

  const previewSource = pickPreviewSource(video);
  const usesPreviewClip = Boolean(video.previewUrl && previewSource === video.previewUrl);
  const canPreview = isPlayablePreviewUrl(previewSource);

  useEffect(() => {
    void preloadHlsModule();
  }, []);

  useEffect(() => {
    onPreviewActiveChange?.(previewActive);
  }, [onPreviewActiveChange, previewActive]);

  const clearIdleCleanup = useCallback(() => {
    if (idleCleanupRef.current !== null) {
      window.clearTimeout(idleCleanupRef.current);
      idleCleanupRef.current = null;
    }
  }, []);

  const scheduleIdleCleanup = useCallback(() => {
    clearIdleCleanup();
    idleCleanupRef.current = window.setTimeout(() => {
      if (previewRef.current && !previewRef.current.paused) return;
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
      warmedRef.current = false;
    }, PREVIEW_IDLE_MS);
  }, [clearIdleCleanup]);

  const cleanupPreview = useCallback(() => {
    clearIdleCleanup();
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
    warmedRef.current = false;
    mobilePinnedRef.current = false;
  }, [clearIdleCleanup]);

  useEffect(() => () => cleanupPreview(), [cleanupPreview]);

  useEffect(() => {
    if (activeSourceRef.current && activeSourceRef.current !== previewSource) {
      cleanupPreview();
      setPreviewActive(false);
    }
  }, [cleanupPreview, previewSource]);

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
      }, 8000);

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
        const Hls = await getHlsModule();
        if (!Hls.isSupported()) {
          throw new Error("HLS is not supported");
        }
        await new Promise<void>((resolve, reject) => {
          const hls = new Hls({
            enableWorker: true,
            startLevel: 0,
            autoStartLoad: true,
            maxBufferLength: 4,
            maxMaxBufferLength: 8,
            maxLoadingDelay: 2,
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
      videoElement.preload = "auto";
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
    segmentBoundsRef.current = usesPreviewClip ? [{ start: 0, end: duration || 6 }] : buildPreviewSegments(duration);
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

  const warmPreview = useCallback(async () => {
    if (!canPreview || !previewRef.current || loadingRef.current || warmedRef.current) return;

    loadingRef.current = true;
    const videoElement = previewRef.current;

    try {
      await attachPreviewSource(videoElement, previewSource);
      prepareSegments(videoElement);
      videoElement.currentTime = segmentBoundsRef.current[0]?.start || 0;
      videoElement.pause();
      warmedRef.current = true;
    } catch {
      warmedRef.current = false;
    } finally {
      loadingRef.current = false;
    }
  }, [canPreview, previewSource, usesPreviewClip, video.durationSeconds]);

  const playPreview = useCallback(async (): Promise<boolean> => {
    if (!canPreview || !previewRef.current || loadingRef.current) return false;

    claimVideoPreview(video._id);
    clearIdleCleanup();

    const videoElement = previewRef.current;

    if (warmedRef.current && activeSourceRef.current === previewSource) {
      setPreviewActive(true);
      unlockPlayback(videoElement);
      await jumpToSegment(videoElement, 0);
      return true;
    }

    loadingRef.current = true;
    setPreviewActive(true);
    unlockPlayback(videoElement);

    try {
      await attachPreviewSource(videoElement, previewSource);
      prepareSegments(videoElement);
      warmedRef.current = true;
      await jumpToSegment(videoElement, 0);
      return true;
    } catch {
      cleanupPreview();
      setPreviewActive(false);
      return false;
    } finally {
      loadingRef.current = false;
    }
  }, [canPreview, cleanupPreview, clearIdleCleanup, previewSource, usesPreviewClip, video._id, video.durationSeconds]);

  const pausePreview = useCallback(() => {
    const videoElement = previewRef.current;
    if (videoElement) {
      videoElement.pause();
    }
    setPreviewActive(false);
    scheduleIdleCleanup();
  }, [scheduleIdleCleanup]);

  const stopPreview = useCallback(() => {
    cleanupPreview();
    setPreviewActive(false);
  }, [cleanupPreview]);

  useEffect(() => {
    const onPreviewClaim = (event: Event) => {
      const ownerId = (event as CustomEvent<VideoPreviewClaimDetail>).detail?.ownerId;
      if (!ownerId || ownerId === video._id) return;
      stopPreview();
    };

    window.addEventListener(VIDEO_PREVIEW_CLAIM_EVENT, onPreviewClaim);
    return () => window.removeEventListener(VIDEO_PREVIEW_CLAIM_EVENT, onPreviewClaim);
  }, [video._id, stopPreview]);

  useEffect(() => {
    if (!hoverPreview || !canPreview) return;
    const node = mediaRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          void warmPreview();
        }
      },
      { rootMargin: "120px 0px", threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [canPreview, hoverPreview, warmPreview]);

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
    pausePreview();
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
        if (usesPreviewClip) {
          videoElement.currentTime = 0;
          void videoElement.play().catch(() => {});
          return;
        }
        videoElement.pause();
        videoElement.currentTime = currentSegment.start;
        return;
      }
      await jumpToSegment(videoElement, nextIndex);
    }
  };

  return {
    mediaRef,
    previewRef,
    previewActive,
    canPreview,
    hoverPreview,
    handleMediaPointerEnter,
    handleMediaPointerLeave,
    handleMediaClick,
    handleTimeUpdate,
    startMobilePreview,
  };
};
