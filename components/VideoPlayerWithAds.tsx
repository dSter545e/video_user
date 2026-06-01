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
        <div className="pointer-events-none absolute bottom-14 right-2 z-10 max-w-[min(100%,320px)]">
          <div className="pointer-events-auto">
            <AdBanner ad={overlayAd} className="border-white/20 bg-black/80 p-1" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
