"use client";

import { useState } from "react";
import { Video } from "../lib/types";
import { useVideoPreview } from "../hooks/useVideoPreview";
import VideoPreviewMedia from "./VideoPreviewMedia";

const formatViews = (count?: number) => {
  const value = count || 0;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M views`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K views`;
  return `${value} views`;
};

type VideoCardProps = {
  video: Video;
  className?: string;
};

export default function VideoCard({ video, className = "" }: VideoCardProps) {
  const [previewActive, setPreviewActive] = useState(false);
  const videoHref = `/videos/${video.slug || video._id}`;
  const preview = useVideoPreview({ video, videoHref, onPreviewActiveChange: setPreviewActive });

  return (
    <article
      className={`video-card group ${previewActive ? "video-card--previewing" : ""} ${className}`.trim()}
      onContextMenu={preview.handleCardContextMenu}
    >
      <VideoPreviewMedia video={video} preview={preview} />

      <div
        className="video-card__body block cursor-pointer"
        onTouchEnd={(event) => {
          if (!("ontouchstart" in window) || event.changedTouches.length !== 1) return;
          event.preventDefault();
          preview.handleCardInteraction();
        }}
        onClick={() => {
          if ("ontouchstart" in window) return;
          preview.handleCardInteraction();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            preview.handleCardInteraction();
          }
        }}
        role="link"
        tabIndex={0}
      >
        <h2 className="video-card__title">{video.title}</h2>
        <p className="video-card__meta">
          {video.category?.name ? (
            <>
              <span className="video-card__meta-category">{video.category.name}</span>
              <span className="video-card__meta-sep" aria-hidden>
                {" "}
                ·{" "}
              </span>
            </>
          ) : null}
          <span className="video-card__meta-views">{formatViews(video.viewsCount)}</span>
          {video.videoId ? <span className="video-card__meta-id">ID {video.videoId}</span> : null}
        </p>
      </div>
    </article>
  );
}
