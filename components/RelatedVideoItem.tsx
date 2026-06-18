"use client";

import Link from "next/link";
import { useState } from "react";
import { Video } from "../lib/types";
import VideoPreviewMedia from "./VideoPreviewMedia";

type RelatedVideoItemProps = {
  video: Video;
};

const formatViews = (count?: number) => {
  const value = count || 0;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M views`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K views`;
  return `${value} views`;
};

export default function RelatedVideoItem({ video }: RelatedVideoItemProps) {
  const [previewActive, setPreviewActive] = useState(false);
  const href = `/videos/${video.slug || video._id}`;

  return (
    <div className={`related-video-item group flex gap-2 py-2 ${previewActive ? "video-card--previewing" : ""}`}>
      <div className="related-video-item__thumb relative aspect-video w-[42%] max-w-[168px] shrink-0 overflow-hidden bg-black">
        <VideoPreviewMedia
          video={video}
          className="video-card__media h-full w-full"
          imageSizes="168px"
          onPreviewActiveChange={setPreviewActive}
        />
      </div>
      <Link href={href} className="related-video-item__body min-w-0 flex-1 pt-0.5">
        <h3 className="related-video-item__title line-clamp-2 text-sm font-medium leading-snug text-[var(--foreground)] group-hover:text-[var(--brand)]">
          {video.title}
        </h3>
        <p className="yt-muted mt-1 text-xs">{video.category?.name || "General"}</p>
        <p className="yt-muted text-xs">{formatViews(video.viewsCount)}</p>
      </Link>
    </div>
  );
}
