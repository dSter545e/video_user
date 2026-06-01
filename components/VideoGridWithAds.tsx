"use client";

import { Fragment } from "react";
import { Video } from "../lib/types";
import VideoCard from "./VideoCard";
import { AdInFeed } from "./AdSlot";
import { useMobileGrid } from "./MobileGridProvider";

type VideoGridWithAdsProps = {
  videos: Video[];
  indexOffset?: number;
};

export default function VideoGridWithAds({ videos, indexOffset = 0 }: VideoGridWithAdsProps) {
  const { gridClassName } = useMobileGrid();

  return (
    <div className={gridClassName}>
      {videos.map((video, index) => (
        <Fragment key={video._id}>
          <VideoCard video={video} />
          <AdInFeed index={index + indexOffset} />
        </Fragment>
      ))}
    </div>
  );
}
