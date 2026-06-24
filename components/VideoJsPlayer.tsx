"use client";

import videojs from "video.js";
import "video.js/dist/video-js.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildPlayerSources,
  buildQualityOptions,
  installVhsMediaHook,
  type PlayerSource,
} from "../lib/videoPlayer";

type VideoJsPlayerProps = {
  src: string;
  poster?: string;
  qualityVariants?: PlayerSource[];
  onPlayedSeconds?: (seconds: number) => void;
};

type VideoJsPlayerInstance = ReturnType<typeof videojs>;

const isImagePoster = (url?: string) => Boolean(url && /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(url));

const attachSkipControls = (player: VideoJsPlayerInstance) => {
  const controlBarEl = player.getChild("controlBar")?.el();
  if (!controlBarEl) return;

  controlBarEl.querySelector(".vjs-skip-controls")?.remove();

  const wrapper = document.createElement("div");
  wrapper.className = "vjs-skip-controls vjs-control";

  const seek = (delta: number) => {
    if (!player || (typeof player.isDisposed === "function" && player.isDisposed())) return;
    const current = player.currentTime() || 0;
    const duration = player.duration() || current + Math.abs(delta);
    player.currentTime(Math.min(duration, Math.max(0, current + delta)));
  };

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
  const refresh = () => fixWatchLayout(player);
  player.on("loadedmetadata", refresh);
  player.on("loadeddata", refresh);
  player.on("posterchange", refresh);
  player.on("ready", refresh);
  player.on("play", () => hidePoster(player));
  player.on("playing", () => hidePoster(player));
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
        html5: { vhs: { withCredentials: false } },
        fullscreen: { options: { navigationUI: "hide" } },
      });

      playerRef.current = player;
      fixWatchLayout(player);
      bindLayoutEvents(player);
      attachTimeControls(player);
      attachSkipControls(player);

      const controlBar = player.getChild("controlBar");
      if (controlBar && !controlBar.getChild("FullscreenToggle")) {
        controlBar.addChild("FullscreenToggle", {}, controlBar.children().length);
      }

      attachQualityControl(player, qualityOptions, selectedSource, setSelectedSource);
      player.on("timeupdate", () => {
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
