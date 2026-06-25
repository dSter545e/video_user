"use client";

import videojs from "video.js";
import "video.js/dist/video-js.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildPlayerSources,
  buildQualityOptions,
  getVhsPlaybackOptions,
  installVhsMediaHook,
  type PlayerSource,
} from "../lib/videoPlayer";
import { VIDEO_PREVIEW_CLAIM_EVENT, type VideoPreviewClaimDetail } from "../lib/videoPreviewCoordinator";

type VideoJsPlayerProps = {
  src: string;
  poster?: string;
  qualityVariants?: PlayerSource[];
  onPlayedSeconds?: (seconds: number) => void;
};

type VideoJsPlayerInstance = ReturnType<typeof videojs>;

const isImagePoster = (url?: string) => Boolean(url && /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(url));

/** Mobile + tablet: single combined time display (below Tailwind `lg`). */
const COMPACT_CONTROLS_MAX_WIDTH = 1023;

const useCompactPlayerControls = () =>
  typeof window !== "undefined" &&
  window.matchMedia(`(max-width: ${COMPACT_CONTROLS_MAX_WIDTH}px)`).matches;

const formatPlaybackTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`;
};

const getMobileTimeEl = (player: VideoJsPlayerInstance) => {
  const controlBarEl = player.getChild("controlBar")?.el();
  if (!controlBarEl) return null;

  let mobileTime = controlBarEl.querySelector(".vjs-mobile-time") as HTMLElement | null;
  if (!mobileTime) {
    mobileTime = document.createElement("div");
    mobileTime.className = "vjs-mobile-time vjs-control";
    mobileTime.innerHTML = '<span class="vjs-mobile-time-display" aria-live="off">0:00 / 0:00</span>';

    const progressControl = controlBarEl.querySelector(".vjs-progress-control");
    if (progressControl?.nextSibling) {
      controlBarEl.insertBefore(mobileTime, progressControl.nextSibling);
    } else {
      controlBarEl.appendChild(mobileTime);
    }
  }

  return mobileTime.querySelector(".vjs-mobile-time-display") as HTMLElement | null;
};

const updateMobileTimeDisplay = (player: VideoJsPlayerInstance) => {
  const el = getMobileTimeEl(player);
  if (!el) return;

  const current = player.currentTime() || 0;
  const duration = player.duration() || 0;
  el.textContent = `${formatPlaybackTime(current)} / ${formatPlaybackTime(duration)}`;
};

const applyViewportControlLayout = (player: VideoJsPlayerInstance) => {
  const controlBar = player.getChild("controlBar");
  const remaining = controlBar?.getChild("RemainingTimeDisplay");
  if (controlBar && remaining) controlBar.removeChild(remaining);

  const root = player.el() as HTMLElement | undefined;
  if (!root) return;

  const compact = useCompactPlayerControls();
  root.classList.toggle("vjs-layout-mobile", compact);
  if (compact) getMobileTimeEl(player);
  updateMobileTimeDisplay(player);
};

const SEEK_STEP_SECONDS = 10;
const DOUBLE_TAP_WINDOW_MS = 280;
const TAP_MOVE_TOLERANCE_PX = 14;

const seekBy = (player: VideoJsPlayerInstance, delta: number) => {
  if (!player || (typeof player.isDisposed === "function" && player.isDisposed())) return;
  const current = player.currentTime() || 0;
  const duration = player.duration() || current + Math.abs(delta);
  player.currentTime(Math.min(duration, Math.max(0, current + delta)));
};

const togglePlayPause = (player: VideoJsPlayerInstance) => {
  if (!player || (typeof player.isDisposed === "function" && player.isDisposed())) return;
  if (player.paused()) void player.play();
  else player.pause();
};

const showTouchFeedback = (root: HTMLElement, side: "left" | "right") => {
  root.querySelector(".vjs-touch-feedback")?.remove();

  const el = document.createElement("div");
  el.className = `vjs-touch-feedback vjs-touch-feedback--${side}`;
  el.setAttribute("aria-hidden", "true");
  el.textContent = side === "left" ? "« 10s" : "10s »";
  root.appendChild(el);

  requestAnimationFrame(() => el.classList.add("vjs-touch-feedback--visible"));
  window.setTimeout(() => el.remove(), 550);
};

const attachTouchGestures = (player: VideoJsPlayerInstance) => {
  const root = player.el() as HTMLElement | undefined;
  if (!root || root.dataset.touchGesturesBound === "true") return;
  root.dataset.touchGesturesBound = "true";

  let lastTapAt = 0;
  let lastTapX = 0;
  let singleTapTimer: ReturnType<typeof setTimeout> | null = null;
  let touchStartX = 0;
  let touchStartY = 0;

  const clearSingleTapTimer = () => {
    if (!singleTapTimer) return;
    clearTimeout(singleTapTimer);
    singleTapTimer = null;
  };

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    return Boolean(
      target.closest(
        ".vjs-control-bar, .vjs-big-play-button, .vjs-quality-control, .vjs-quality-select, button, select, input, a"
      )
    );
  };

  const getRelativeX = (clientX: number) => {
    const rect = root.getBoundingClientRect();
    if (!rect.width) return 0.5;
    return (clientX - rect.left) / rect.width;
  };

  const handleTap = (clientX: number) => {
    const now = Date.now();
    const x = getRelativeX(clientX);
    const isDoubleTap = now - lastTapAt <= DOUBLE_TAP_WINDOW_MS && Math.abs(clientX - lastTapX) < 48;

    clearSingleTapTimer();

    if (isDoubleTap) {
      lastTapAt = 0;
      if (x < 0.4) {
        seekBy(player, -SEEK_STEP_SECONDS);
        showTouchFeedback(root, "left");
      } else if (x > 0.6) {
        seekBy(player, SEEK_STEP_SECONDS);
        showTouchFeedback(root, "right");
      }
      return;
    }

    lastTapAt = now;
    lastTapX = clientX;

    singleTapTimer = setTimeout(() => {
      singleTapTimer = null;
      togglePlayPause(player);
    }, DOUBLE_TAP_WINDOW_MS);
  };

  const onTouchStart = (event: TouchEvent) => {
    if (event.touches.length !== 1) {
      clearSingleTapTimer();
      return;
    }
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (isInteractiveTarget(event.target)) return;
    if (event.changedTouches.length !== 1) return;

    const touch = event.changedTouches[0];
    const dx = Math.abs(touch.clientX - touchStartX);
    const dy = Math.abs(touch.clientY - touchStartY);
    if (dx > TAP_MOVE_TOLERANCE_PX || dy > TAP_MOVE_TOLERANCE_PX) return;

    event.preventDefault();
    handleTap(touch.clientX);
  };

  const onClick = (event: MouseEvent) => {
    if (isInteractiveTarget(event.target)) return;
    if ("ontouchstart" in window) return;
    handleTap(event.clientX);
  };

  root.addEventListener("touchstart", onTouchStart, { passive: true });
  root.addEventListener("touchend", onTouchEnd, { passive: false });
  root.addEventListener("click", onClick);

  player.on("dispose", () => {
    clearSingleTapTimer();
    root.removeEventListener("touchstart", onTouchStart);
    root.removeEventListener("touchend", onTouchEnd);
    root.removeEventListener("click", onClick);
    delete root.dataset.touchGesturesBound;
  });
};

const attachSkipControls = (player: VideoJsPlayerInstance) => {
  const controlBarEl = player.getChild("controlBar")?.el();
  if (!controlBarEl) return;

  controlBarEl.querySelector(".vjs-skip-controls")?.remove();

  const wrapper = document.createElement("div");
  wrapper.className = "vjs-skip-controls vjs-control";

  const seek = (delta: number) => seekBy(player, delta);

  const back = document.createElement("button");
  back.type = "button";
  back.className = "vjs-skip-10 vjs-skip-backward";
  back.setAttribute("aria-label", "Back 10 seconds");
  back.innerHTML = '<span aria-hidden="true">&laquo;10</span>';
  back.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    seek(-10);
  });

  const forward = document.createElement("button");
  forward.type = "button";
  forward.className = "vjs-skip-10 vjs-skip-forward";
  forward.setAttribute("aria-label", "Forward 10 seconds");
  forward.innerHTML = '<span aria-hidden="true">10&raquo;</span>';
  forward.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    seek(10);
  });

  wrapper.append(back, forward);
  const playControl = controlBarEl.querySelector(".vjs-play-control");
  if (playControl?.nextSibling) {
    controlBarEl.insertBefore(wrapper, playControl.nextSibling);
  } else {
    controlBarEl.appendChild(wrapper);
  }
};

const attachTimeControls = (player: VideoJsPlayerInstance) => {
  const controlBar = player.getChild("controlBar");
  if (!controlBar) return;

  const remaining = controlBar.getChild("RemainingTimeDisplay");
  if (remaining) controlBar.removeChild(remaining);

  if (!controlBar.getChild("CurrentTimeDisplay")) controlBar.addChild("CurrentTimeDisplay", {}, 4);
  if (!controlBar.getChild("TimeDivider")) controlBar.addChild("TimeDivider", {}, 5);
  if (!controlBar.getChild("DurationDisplay")) controlBar.addChild("DurationDisplay", {}, 6);
};

const attachQualityControl = (
  player: VideoJsPlayerInstance,
  options: PlayerSource[],
  selected: string,
  onChange: (value: string) => void
) => {
  const controlBarEl = player.getChild("controlBar")?.el();
  if (!controlBarEl) return;

  controlBarEl.querySelector(".vjs-quality-control")?.remove();

  const wrapper = document.createElement("div");
  wrapper.className = "vjs-quality-control vjs-control";

  const select = document.createElement("select");
  select.className = "vjs-quality-select";
  select.setAttribute("aria-label", "Video quality");

  const auto = document.createElement("option");
  auto.value = "auto";
  auto.textContent = "Auto";
  select.append(auto);

  for (const option of options) {
    const el = document.createElement("option");
    el.value = option.src;
    el.textContent = option.label || (option.height ? `${option.height}p` : "Source");
    select.append(el);
  }

  select.value = selected;
  select.addEventListener("change", (e) => onChange((e.target as HTMLSelectElement).value));
  wrapper.addEventListener("click", (e) => e.stopPropagation());
  wrapper.append(select);
  controlBarEl.appendChild(wrapper);
};

const fixWatchLayout = (player: VideoJsPlayerInstance) => {
  if (!player || (typeof player.isDisposed === "function" && player.isDisposed())) return;

  if (typeof player.fill === "function") player.fill(true);
  if (typeof player.fluid === "function") player.fluid(false);

  const root = player.el() as HTMLElement | undefined;
  if (!root) return;

  root.classList.remove("vjs-9-16", "vjs-1-1", "vjs-4-3", "vjs-16-9", "vjs-fluid");
  root.classList.add("vjs-fill", "watch-video-js");
  root.style.width = "100%";
  root.style.height = "100%";
  root.style.paddingTop = "0";

  const posterEl = root.querySelector(":scope > .vjs-poster") as HTMLElement | null;
  if (!posterEl) return;

  posterEl.style.backgroundImage = "none";
  posterEl.style.backgroundColor = "#000";

  const img = posterEl.querySelector("img") as HTMLImageElement | null;
  if (!img) return;

  img.style.cssText =
    "position:static;transform:none;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;object-position:center";
};

const hidePoster = (player: VideoJsPlayerInstance) => {
  const posterEl = (player.el() as HTMLElement | undefined)?.querySelector(":scope > .vjs-poster") as HTMLElement | null;
  if (!posterEl) return;
  posterEl.style.display = "none";
  posterEl.style.visibility = "hidden";
  posterEl.style.opacity = "0";
  posterEl.style.pointerEvents = "none";
};

const bindLayoutEvents = (player: VideoJsPlayerInstance) => {
  const refresh = () => {
    fixWatchLayout(player);
    applyViewportControlLayout(player);
  };
  player.on("loadedmetadata", refresh);
  player.on("loadeddata", refresh);
  player.on("posterchange", refresh);
  player.on("ready", refresh);
  player.on("durationchange", () => updateMobileTimeDisplay(player));
  player.on("play", () => hidePoster(player));
  player.on("playing", () => hidePoster(player));
};

const bindViewportControlEvents = (player: VideoJsPlayerInstance) => {
  const onViewportChange = () => applyViewportControlLayout(player);
  const onCardPreviewClaim = (event: Event) => {
    const ownerId = (event as CustomEvent<VideoPreviewClaimDetail>).detail?.ownerId;
    if (!ownerId || !player || (typeof player.isDisposed === "function" && player.isDisposed())) return;
    if (!player.paused()) player.pause();
  };

  window.addEventListener("resize", onViewportChange);
  window.addEventListener("orientationchange", onViewportChange);
  window.addEventListener(VIDEO_PREVIEW_CLAIM_EVENT, onCardPreviewClaim);
  player.on("dispose", () => {
    window.removeEventListener("resize", onViewportChange);
    window.removeEventListener("orientationchange", onViewportChange);
    window.removeEventListener(VIDEO_PREVIEW_CLAIM_EVENT, onCardPreviewClaim);
  });
};

export default function VideoJsPlayer({ src, poster, qualityVariants = [], onPlayedSeconds }: VideoJsPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<VideoJsPlayerInstance | null>(null);
  const onPlayedSecondsRef = useRef(onPlayedSeconds);
  const [selectedSource, setSelectedSource] = useState("auto");
  const posterUrl = isImagePoster(poster) ? poster : undefined;

  onPlayedSecondsRef.current = onPlayedSeconds;

  const qualityOptions = useMemo(() => buildQualityOptions(src, qualityVariants), [src, qualityVariants]);
  const sources = useMemo(
    () => buildPlayerSources(src, qualityVariants, selectedSource),
    [src, qualityVariants, selectedSource]
  );

  useEffect(() => {
    if (!containerRef.current || !sources.length || !src.trim()) return;

    installVhsMediaHook();

    if (!playerRef.current) {
      const element = document.createElement("video-js");
      element.classList.add("vjs-big-play-centered");
      containerRef.current.appendChild(element);

      const player = videojs(element, {
        controls: true,
        responsive: false,
        fluid: false,
        fill: true,
        preload: "auto",
        poster: posterUrl,
        sources,
        playsinline: true,
        userActions: {
          click: false,
          doubleClick: false,
        },
        html5: { vhs: getVhsPlaybackOptions() },
        fullscreen: { options: { navigationUI: "hide" } },
      });

      playerRef.current = player;
      player.ready(() => {
        attachTimeControls(player);
        attachSkipControls(player);
        attachTouchGestures(player);
        applyViewportControlLayout(player);
      });
      fixWatchLayout(player);
      bindLayoutEvents(player);
      bindViewportControlEvents(player);

      const controlBar = player.getChild("controlBar");
      if (controlBar && !controlBar.getChild("FullscreenToggle")) {
        controlBar.addChild("FullscreenToggle", {}, controlBar.children().length);
      }

      attachQualityControl(player, qualityOptions, selectedSource, setSelectedSource);
      player.on("timeupdate", () => {
        updateMobileTimeDisplay(player);
        onPlayedSecondsRef.current?.(player.currentTime() || 0);
      });
      return;
    }

    const player = playerRef.current;
    if (!player || (typeof player.isDisposed === "function" && player.isDisposed())) return;

    const resumeAt = player.currentTime() || 0;
    player.poster(posterUrl || "");
    fixWatchLayout(player);
    player.src(sources);
    player.one("loadedmetadata", () => {
      if (typeof player.isDisposed === "function" && player.isDisposed()) return;
      if ((player.duration() || 0) > resumeAt) player.currentTime(resumeAt);
    });
    attachTimeControls(player);
    attachQualityControl(player, qualityOptions, selectedSource, setSelectedSource);
    applyViewportControlLayout(player);
  }, [src, posterUrl, sources, qualityOptions, selectedSource]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return <div data-vjs-player ref={containerRef} className="video-player-shell" />;
}
