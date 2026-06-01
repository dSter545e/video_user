"use client";

import { Video } from "../lib/types";
import VideoCard from "./VideoCard";
import { AdInFeed } from "./AdSlot";

type VideoGridWithAdsProps = {
  videos: Video[];
  indexOffset?: number;
};

export default function VideoGridWithAds({ videos, indexOffset = 0 }: VideoGridWithAdsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
      {videos.map((video, index) => (
        <div key={video._id} className="contents">
          <VideoCard video={video} />
          <AdInFeed index={index + indexOffset} />
        </div>
      ))}
    </div>
  );
}
