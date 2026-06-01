"use client";

import { useEffect, useRef, useState } from "react";
import { AdItem } from "../lib/ads";
import AdBanner from "./AdBanner";

type PrerollAdProps = {
  ad: AdItem;
  onComplete: () => void;
};

export default function PrerollAd({ ad, onComplete }: PrerollAdProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canSkip, setCanSkip] = useState((ad.skipAfterSeconds ?? 5) <= 0);
  const [remaining, setRemaining] = useState(ad.skipAfterSeconds ?? 5);

  const skipAfter = Math.max(0, ad.skipAfterSeconds ?? 5);

  useEffect(() => {
    if (skipAfter <= 0) {
      setCanSkip(true);
      return;
    }
    setRemaining(skipAfter);
    const interval = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [skipAfter, ad._id]);

  useEffect(() => {
    if (ad.type !== "video" || !videoRef.current) return;
    const video = videoRef.current;
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay may be blocked until user interaction.
      });
    }
  }, [ad.type, ad.videoUrl, ad._id]);

  const handleSkip = () => {
    if (!canSkip) return;
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onComplete();
  };

  return (
    <div className="video-preroll-ad absolute inset-0 z-20 flex flex-col bg-black">
      {ad.type === "video" && ad.videoUrl ? (
        <video
          ref={videoRef}
          src={ad.videoUrl}
          className="h-full w-full object-contain"
          playsInline
          muted
          controls={false}
          onEnded={onComplete}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <AdBanner ad={ad} />
        </div>
      )}

      <div className="absolute right-3 top-3 z-30 flex items-center gap-2">
        {!canSkip ? (
          <span className="rounded bg-black/70 px-2 py-1 text-xs text-white">Skip in {remaining}s</span>
        ) : null}
        <button
          type="button"
          onClick={handleSkip}
          disabled={!canSkip}
          className="rounded bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Skip Ad
        </button>
      </div>
    </div>
  );
}
