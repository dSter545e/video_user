"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { AdItem } from "../lib/ads";

type AdBannerProps = {
  ad: AdItem;
  className?: string;
};

export default function AdBanner({ ad, className = "" }: AdBannerProps) {
  const htmlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ad.type !== "html" || !htmlRef.current) return;
    const container = htmlRef.current;
    const scripts = container.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const script = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
      script.textContent = oldScript.textContent;
      oldScript.replaceWith(script);
    });
  }, [ad._id, ad.htmlContent, ad.type]);

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
      <div
        ref={htmlRef}
        className={wrapperClass}
        dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
      />
    );
  }

  return null;
}
