"use client";

import Image from "next/image";
import { AdItem } from "../lib/ads";

type AdBannerProps = {
  ad: AdItem;
  className?: string;
};

export default function AdBanner({ ad, className = "" }: AdBannerProps) {
  const wrapperClass = `ad-slot mx-auto flex w-full max-w-full flex-col items-center justify-center text-center ${className}`.trim();

  if (ad.type === "image" && ad.imageUrl) {
    const image = (
      <Image
        src={ad.imageUrl}
        alt={ad.altText || "Advertisement"}
        width={728}
        height={90}
        className="mx-auto h-auto w-full max-w-full object-contain"
        unoptimized
      />
    );
    return (
      <div className={wrapperClass}>
        {ad.linkUrl ? (
          <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer sponsored" className="mx-auto block w-fit max-w-full">
            {image}
          </a>
        ) : (
          image
        )}
      </div>
    );
  }

  if (ad.type === "html" && ad.htmlContent) {
    return (
      <div className={wrapperClass}>
        <iframe
          title={ad.altText || "Advertisement"}
          srcDoc={ad.htmlContent}
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          className="ad-slot__html-frame mx-auto block w-full max-w-full border-0 bg-transparent"
          scrolling="no"
        />
      </div>
    );
  }

  return null;
}
