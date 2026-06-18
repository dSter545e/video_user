"use client";

import Image from "next/image";
import { FiPlay } from "react-icons/fi";
import { getVideoPosterUrl } from "../lib/videoPoster";
import { Video } from "../lib/types";
import { useVideoPreview } from "../hooks/useVideoPreview";

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

type VideoPreviewMediaProps = {
  video: Video;
  className?: string;
  imageSizes?: string;
  showPlayHint?: boolean;
  showDuration?: boolean;
  onPreviewActiveChange?: (active: boolean) => void;
};

export default function VideoPreviewMedia({
  video,
  className = "video-card__media",
  imageSizes = "(max-width: 767px) 46vw, 25vw",
  showPlayHint = true,
  showDuration = true,
  onPreviewActiveChange,
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
    hoverPreview,
    handleMediaPointerEnter,
    handleMediaPointerLeave,
    handleMediaClick,
    handleTimeUpdate,
    startMobilePreview,
  } = useVideoPreview({ video, videoHref, onPreviewActiveChange });

  return (
    <div
      ref={mediaRef}
      className={className}
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
      {useVideoFramePoster ? (
        <video src={posterUrl} muted playsInline preload="metadata" className="video-card__thumb" aria-hidden />
      ) : posterUrl ? (
        <Image src={posterUrl} alt="" fill unoptimized className="video-card__thumb" sizes={imageSizes} />
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
    </div>
  );
}
