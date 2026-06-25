"use client";

import Image from "next/image";
import Link from "next/link";
import { FiPlay } from "react-icons/fi";
import { getVideoPosterUrl } from "../lib/videoPoster";
import { Video } from "../lib/types";
import type { useVideoPreview } from "../hooks/useVideoPreview";

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

type VideoPreviewControls = ReturnType<typeof useVideoPreview>;

type VideoPreviewMediaProps = {
  video: Video;
  preview: VideoPreviewControls;
  className?: string;
  imageSizes?: string;
  showPlayHint?: boolean;
  showDuration?: boolean;
};

export default function VideoPreviewMedia({
  video,
  preview,
  className = "video-card__media",
  imageSizes = "(max-width: 767px) 46vw, 25vw",
  showPlayHint = true,
  showDuration = true,
}: VideoPreviewMediaProps) {
  const videoHref = `/videos/${video.slug || video._id}`;
  const posterUrl = getVideoPosterUrl(video);
  const useVideoFramePoster =
    Boolean(posterUrl) && !video.thumbnail?.trim() && /\.(mp4|webm|mov)(\?|$)/i.test(posterUrl);

  const {
    mediaRef,
    previewRef,
    previewActive,
    canPreview,
    handleMediaPointerEnter,
    handleMediaPointerLeave,
    handleCardInteraction,
    handleTimeUpdate,
  } = preview;

  const handleActivate = (event: { preventDefault: () => void; metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; button?: number }) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || (typeof event.button === "number" && event.button !== 0)) {
      return;
    }
    event.preventDefault();
    handleCardInteraction();
  };

  return (
    <Link
      ref={mediaRef}
      href={videoHref}
      className={className}
      onPointerEnter={handleMediaPointerEnter}
      onPointerLeave={handleMediaPointerLeave}
      onTouchEnd={(event) => {
        if (event.changedTouches.length !== 1) return;
        handleActivate(event);
      }}
      onClick={(event) => {
        if ("ontouchstart" in window) return;
        handleActivate(event);
      }}
      aria-label={previewActive ? `Previewing ${video.title}` : `Watch ${video.title}`}
    >
      {useVideoFramePoster ? (
        <video
          src={posterUrl}
          muted
          playsInline
          preload="metadata"
          className="video-card__thumb"
          aria-hidden
          tabIndex={-1}
        />
      ) : posterUrl ? (
        <Image
          src={posterUrl}
          alt=""
          fill
          unoptimized
          draggable={false}
          loading="lazy"
          className="video-card__thumb"
          sizes={imageSizes}
        />
      ) : (
        <div className="video-card__thumb flex items-center justify-center yt-muted" aria-hidden>
          No preview
        </div>
      )}

      {canPreview ? (
        <video
          ref={previewRef}
          muted
          playsInline
          disablePictureInPicture
          preload="auto"
          tabIndex={-1}
          onTimeUpdate={handleTimeUpdate}
          className="video-card__preview"
        />
      ) : null}

      <div className="video-card__shade" />

      {showPlayHint && !previewActive && canPreview ? (
        <span className="pointer-events-none absolute inset-0 z-[4] flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center bg-black/55 text-white backdrop-blur-sm">
            <FiPlay className="ml-0.5 h-5 w-5" />
          </span>
        </span>
      ) : null}

      {previewActive ? <span className="video-card__badge">Preview</span> : null}

      {showDuration ? (
        <span className="video-card__duration">{formatDuration(video.durationSeconds, video.duration)}</span>
      ) : null}
    </Link>
  );
}
