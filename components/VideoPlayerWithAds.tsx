"use client";

import { useState } from "react";
import { useAds } from "./AdProvider";
import VideoJsPlayer from "./VideoJsPlayer";
import PrerollAd from "./PrerollAd";
import AdBanner from "./AdBanner";

type VideoSource = {
  src: string;
  label?: string;
  height?: number;
};

type VideoPlayerWithAdsProps = {
  src: string;
  poster?: string;
  qualityVariants?: VideoSource[];
  onPlayedSeconds?: (seconds: number) => void;
};

export default function VideoPlayerWithAds(props: VideoPlayerWithAdsProps) {
  const { getAdsForSlot, loading } = useAds();
  const prerollAd = getAdsForSlot("watch_video_preroll")[0];
  const overlayAd = getAdsForSlot("watch_video_overlay")[0];
  const [prerollDone, setPrerollDone] = useState(false);

  const showPreroll = !loading && prerollAd && !prerollDone;
  const showMainPlayer = !prerollAd || prerollDone;

  return (
    <div className="video-player-with-ads relative">
      <div className="video-player-shell relative min-h-[220px] bg-black">
        {showPreroll ? <PrerollAd ad={prerollAd} onComplete={() => setPrerollDone(true)} /> : null}
        {showMainPlayer ? <VideoJsPlayer {...props} /> : <div className="aspect-video w-full bg-black" aria-hidden />}
      </div>
      {!loading && overlayAd && prerollDone ? (
        <div className="pointer-events-none absolute bottom-14 left-1/2 z-10 w-full max-w-[min(100%,320px)] -translate-x-1/2">
          <div className="pointer-events-auto flex justify-center">
            <AdBanner ad={overlayAd} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
