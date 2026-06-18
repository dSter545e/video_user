"use client";

import Link from "next/link";
import { useState } from "react";
import { Video } from "../lib/types";
import VideoPreviewMedia from "./VideoPreviewMedia";

const formatViews = (count?: number) => {
  const value = count || 0;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M views`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K views`;
  return `${value} views`;
};

type VideoCardProps = {
  video: Video;
};

export default function VideoCard({ video }: VideoCardProps) {
  const [previewActive, setPreviewActive] = useState(false);
  const videoHref = `/videos/${video.slug || video._id}`;

  return (
    <article className={`video-card group ${previewActive ? "video-card--previewing" : ""}`}>
      <VideoPreviewMedia video={video} onPreviewActiveChange={setPreviewActive} />

      <Link href={videoHref} className="video-card__body block">
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
      </Link>
    </article>
  );
}
