"use client";

import videojs from "video.js";
import "video.js/dist/video-js.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { normalizeMediaUrl } from "../lib/mediaUrl";

type VideoSource = {
  src: string;
  label?: string;
  height?: number;
};

type VideoJsPlayerProps = {
  src: string;
  poster?: string;
  qualityVariants?: VideoSource[];
  onPlayedSeconds?: (seconds: number) => void;
};

type VideoJsPlayerInstance = ReturnType<typeof videojs>;

type VhsXhrOptions = { uri?: string };
type VhsXhr = { beforeRequest?: (options: VhsXhrOptions) => VhsXhrOptions | void };

let vhsMediaRewriteInstalled = false;

const installVhsMediaUrlRewrite = () => {
  if (vhsMediaRewriteInstalled || typeof window === "undefined") return;

  const videojsLib = videojs as typeof videojs & { Vhs?: { xhr?: VhsXhr } };
  const xhr = videojsLib.Vhs?.xhr;
  if (!xhr) return;

  const previous = xhr.beforeRequest;
  xhr.beforeRequest = (options) => {
    const next = previous ? previous(options) || options : options;
    if (next?.uri) {
      next.uri = normalizeMediaUrl(next.uri);
    }
    return next;
  };

  vhsMediaRewriteInstalled = true;
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

const getSourceType = (url: string) => (url.endsWith(".m3u8") ? "application/x-mpegURL" : "video/mp4");

const buildOrderedSources = (src: string, qualityVariants: VideoSource[] = []) => {
  const normalizedSrc = normalizeMediaUrl(src);
  if (normalizedSrc && normalizedSrc.endsWith(".m3u8")) {
    return [{ src: normalizedSrc, type: "application/x-mpegURL" }];
  }
  const uniqueBySrc = new Map<string, VideoSource>();
  for (const item of qualityVariants) {
    if (item?.src) {
      uniqueBySrc.set(normalizeMediaUrl(item.src), { ...item, src: normalizeMediaUrl(item.src) });
    }
  }
  if (normalizedSrc) {
    uniqueBySrc.set(normalizedSrc, { src: normalizedSrc });
  }
  const all = Array.from(uniqueBySrc.values());
  if (all.length === 0) return [];

  const slow = isSlowNetwork();
  const sortedByHeight = [...all].sort((a, b) => (a.height || 0) - (b.height || 0));
  const preferred = slow
    ? sortedByHeight.find((item) => (item.height || 0) > 0 && (item.height || 0) <= 360) || sortedByHeight[0]
    : sortedByHeight[sortedByHeight.length - 1];

  const ordered = [preferred, ...all.filter((item) => item.src !== preferred.src)];
  return ordered.map((item) => ({
    src: item.src,
    type: getSourceType(item.src),
  }));
};

const attachSkipControls = (player: VideoJsPlayerInstance) => {
  const controlBar = player.getChild("controlBar");
  if (!controlBar) return;

  const controlBarEl = controlBar.el();
  if (!controlBarEl) return;

  const existing = controlBarEl.querySelector(".vjs-skip-controls");
  if (existing) {
    existing.remove();
  }

  const wrapper = document.createElement("div");
  wrapper.className = "vjs-skip-controls vjs-control";

  const backButton = document.createElement("button");
  backButton.type = "button";
  backButton.className = "vjs-skip-10 vjs-skip-backward";
  backButton.setAttribute("aria-label", "Back 10 seconds");
  backButton.innerHTML = '<span aria-hidden="true">&laquo;10</span>';
  backButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!player || (typeof player.isDisposed === "function" && player.isDisposed())) return;
    const current = player.currentTime() || 0;
    player.currentTime(Math.max(0, current - 10));
  });

  const forwardButton = document.createElement("button");
  forwardButton.type = "button";
  forwardButton.className = "vjs-skip-10 vjs-skip-forward";
  forwardButton.setAttribute("aria-label", "Forward 10 seconds");
  forwardButton.innerHTML = '<span aria-hidden="true">10&raquo;</span>';
  forwardButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!player || (typeof player.isDisposed === "function" && player.isDisposed())) return;
    const current = player.currentTime() || 0;
    player.currentTime(Math.min(player.duration() || current + 10, current + 10));
  });

  wrapper.appendChild(backButton);
  wrapper.appendChild(forwardButton);
  const playControl = controlBarEl.querySelector(".vjs-play-control");
  if (playControl?.nextSibling) {
    controlBarEl.insertBefore(wrapper, playControl.nextSibling);
    return;
  }
  controlBarEl.appendChild(wrapper);
};

const attachTimeControls = (player: VideoJsPlayerInstance) => {
  const controlBar = player.getChild("controlBar");
  if (!controlBar) return;

  if (!controlBar.getChild("CurrentTimeDisplay")) {
    controlBar.addChild("CurrentTimeDisplay", {}, 4);
  }
  if (!controlBar.getChild("TimeDivider")) {
    controlBar.addChild("TimeDivider", {}, 5);
  }
  if (!controlBar.getChild("DurationDisplay")) {
    controlBar.addChild("DurationDisplay", {}, 6);
  }
};

const attachQualityControl = (
  player: VideoJsPlayerInstance,
  qualityOptions: VideoSource[],
  selectedSource: string,
  onSourceChange: (value: string) => void
) => {
  const controlBar = player.getChild("controlBar");
  if (!controlBar) return;

  const controlBarEl = controlBar.el();
  if (!controlBarEl) return;

  const existing = controlBarEl.querySelector(".vjs-quality-control");
  if (existing) {
    existing.remove();
  }

  const wrapper = document.createElement("div");
  wrapper.className = "vjs-quality-control vjs-control";

  const select = document.createElement("select");
  select.className = "vjs-quality-select";
  select.setAttribute("aria-label", "Video quality");

  const autoOption = document.createElement("option");
  autoOption.value = "auto";
  autoOption.textContent = "Auto";
  select.appendChild(autoOption);

  for (const option of qualityOptions) {
    const optionEl = document.createElement("option");
    optionEl.value = option.src;
    optionEl.textContent = option.label || (option.height ? `${option.height}p` : "Source");
    select.appendChild(optionEl);
  }

  select.value = selectedSource;
  select.addEventListener("change", (event) => {
    const target = event.target as HTMLSelectElement;
    onSourceChange(target.value);
  });

  wrapper.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  wrapper.appendChild(select);
  controlBarEl.appendChild(wrapper);
};

const isImagePosterUrl = (url?: string) =>
  Boolean(url && /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(url));

const attachFullscreenControl = (player: VideoJsPlayerInstance) => {
  const controlBar = player.getChild("controlBar");
  if (!controlBar) return;

  if (!controlBar.getChild("FullscreenToggle")) {
    controlBar.addChild("FullscreenToggle", {}, controlBar.children().length);
  }
};

const fixWatchPlayerLayout = (player: VideoJsPlayerInstance) => {
  if (!player || (typeof player.isDisposed === "function" && player.isDisposed())) return;

  if (typeof player.fill === "function") {
    player.fill(true);
  }
  if (typeof player.fluid === "function") {
    player.fluid(false);
  }

  const root = player.el() as HTMLElement | undefined;
  if (!root) return;

  root.classList.remove("vjs-9-16", "vjs-1-1", "vjs-4-3", "vjs-16-9", "vjs-fluid");
  root.classList.add("vjs-fill", "watch-video-js");
  root.style.width = "100%";
  root.style.height = "100%";
  root.style.paddingTop = "0";

  const posterEl = root.querySelector(":scope > .vjs-poster") as HTMLElement | null;
  if (posterEl) {
    posterEl.style.backgroundImage = "none";
    posterEl.style.backgroundColor = "#000";

    const picture = posterEl.querySelector("picture") as HTMLElement | null;
    if (picture) {
      picture.style.position = "static";
      picture.style.width = "100%";
      picture.style.height = "100%";
      picture.style.display = "flex";
      picture.style.alignItems = "center";
      picture.style.justifyContent = "center";
      picture.style.margin = "0";
      picture.style.padding = "0";
    }

    const centerPosterImage = (img: HTMLImageElement) => {
      img.style.position = "static";
      img.style.transform = "none";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.maxWidth = "100%";
      img.style.maxHeight = "100%";
      img.style.objectFit = "contain";
      img.style.objectPosition = "center center";
    };

    const img = posterEl.querySelector("img") as HTMLImageElement | null;
    if (img) {
      centerPosterImage(img);
      if (!img.dataset.centerBound) {
        img.dataset.centerBound = "true";
        img.addEventListener("load", () => centerPosterImage(img));
      }
    }
  }
};

const hidePosterOnPlay = (player: VideoJsPlayerInstance) => {
  const root = player.el() as HTMLElement | undefined;
  const posterEl = root?.querySelector(":scope > .vjs-poster") as HTMLElement | null;
  if (posterEl) {
    posterEl.style.display = "none";
    posterEl.style.visibility = "hidden";
    posterEl.style.opacity = "0";
    posterEl.style.pointerEvents = "none";
  }
};

const bindWatchPlayerLayout = (player: VideoJsPlayerInstance, attachEvents = false) => {
  fixWatchPlayerLayout(player);
  if (!attachEvents) return;
  player.on("loadedmetadata", () => fixWatchPlayerLayout(player));
  player.on("loadeddata", () => fixWatchPlayerLayout(player));
  player.on("posterchange", () => fixWatchPlayerLayout(player));
  player.on("ready", () => fixWatchPlayerLayout(player));
  player.on("play", () => hidePosterOnPlay(player));
  player.on("playing", () => hidePosterOnPlay(player));

  const root = player.el() as HTMLElement | undefined;
  const posterEl = root?.querySelector(":scope > .vjs-poster");
  if (posterEl && typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver(() => fixWatchPlayerLayout(player));
    observer.observe(posterEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", "style"] });
    player.on("dispose", () => observer.disconnect());
  }
};

export default function VideoJsPlayer({ src, poster, qualityVariants = [], onPlayedSeconds }: VideoJsPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<VideoJsPlayerInstance | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>("auto");
  const safePoster = isImagePosterUrl(poster) ? poster : undefined;
  const normalizedSrc = useMemo(() => normalizeMediaUrl(src), [src]);

  const qualityOptions = useMemo(() => {
    const uniqueBySrc = new Map<string, VideoSource>();
    for (const item of qualityVariants) {
      if (item?.src) {
        const normalized = normalizeMediaUrl(item.src);
        uniqueBySrc.set(normalized, { ...item, src: normalized });
      }
    }
    if (normalizedSrc) uniqueBySrc.set(normalizedSrc, { src: normalizedSrc, label: "Source", height: 0 });

    const list = Array.from(uniqueBySrc.values()).sort((a, b) => (a.height || 0) - (b.height || 0));
    return list;
  }, [qualityVariants, normalizedSrc]);

  useEffect(() => {
    installVhsMediaUrlRewrite();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !normalizedSrc || normalizedSrc === "about:blank" || !normalizedSrc.includes(".")) return;
    const orderedSources = buildOrderedSources(normalizedSrc, qualityVariants);
    const sources =
      selectedSource === "auto"
        ? orderedSources
        : [
            { src: normalizeMediaUrl(selectedSource), type: getSourceType(normalizeMediaUrl(selectedSource)) },
            ...orderedSources.filter((item) => item.src !== normalizeMediaUrl(selectedSource)),
          ];

    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      containerRef.current.appendChild(videoElement);

      playerRef.current = videojs(videoElement, {
        controls: true,
        responsive: false,
        fluid: false,
        fill: true,
        preload: "auto",
        poster: safePoster,
        sources,
        playsinline: true,
        fullscreen: {
          options: {
            navigationUI: "hide",
          },
        },
      });
      bindWatchPlayerLayout(playerRef.current, true);
      attachTimeControls(playerRef.current);
      attachSkipControls(playerRef.current);
      attachFullscreenControl(playerRef.current);
      attachQualityControl(playerRef.current, qualityOptions, selectedSource, setSelectedSource);
      playerRef.current.on("timeupdate", () => {
        const current = playerRef.current;
        if (!current || !onPlayedSeconds) return;
        onPlayedSeconds(current.currentTime() || 0);
      });
      return;
    }

    const player = playerRef.current;
    if (!player || (typeof player.isDisposed === "function" && player.isDisposed())) {
      return;
    }

    player.poster(safePoster || "");
    fixWatchPlayerLayout(player);
    const currentTime = player.currentTime() || 0;
    player.src(sources);
    if (typeof player.one === "function") {
      player.one("loadedmetadata", () => {
        if (!player || (typeof player.isDisposed === "function" && player.isDisposed())) {
          return;
        }
        if ((player.duration() || 0) > currentTime) {
          player.currentTime(currentTime);
        }
      });
    }
    if (!player || (typeof player.isDisposed === "function" && player.isDisposed())) {
      return;
    }
    attachTimeControls(player);
    attachFullscreenControl(player);
    attachQualityControl(player, qualityOptions, selectedSource, setSelectedSource);
  }, [normalizedSrc, safePoster, qualityVariants, selectedSource, qualityOptions, onPlayedSeconds]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return <div data-vjs-player ref={containerRef} className="video-player-shell" />;
};
