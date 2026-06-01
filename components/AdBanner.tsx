"use client";

import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { AdItem } from "../lib/ads";
import { parseAdDimensionsFromHtml, resolveAdDimensions } from "../lib/adDimensions";

type AdBannerProps = {
  ad: AdItem;
  className?: string;
};

const runEmbedScripts = (container: HTMLElement) => {
  container.querySelectorAll("script").forEach((oldScript) => {
    const script = document.createElement("script");
    Array.from(oldScript.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
    script.textContent = oldScript.textContent;
    oldScript.replaceWith(script);
  });
};

export default function AdBanner({ ad, className = "" }: AdBannerProps) {
  const htmlRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  const htmlDimensions = useMemo((): { width?: number; height?: number } => {
    if (ad.type === "html" && ad.htmlContent) {
      return parseAdDimensionsFromHtml(ad.htmlContent);
    }
    return {};
  }, [ad.htmlContent, ad.type]);

  const creativeSize = useMemo(() => {
    if (ad.type === "image" && imageSize) {
      return resolveAdDimensions(imageSize.width, imageSize.height);
    }
    return resolveAdDimensions(htmlDimensions.width, htmlDimensions.height);
  }, [ad.type, htmlDimensions.height, htmlDimensions.width, imageSize]);

  const creativeStyle = {
    "--ad-w": creativeSize.width,
    "--ad-h": creativeSize.height,
  } as CSSProperties;

  useEffect(() => {
    if (ad.type !== "html" || !htmlRef.current) return;
    runEmbedScripts(htmlRef.current);
  }, [ad._id, ad.htmlContent, ad.type]);

  if (ad.type === "image" && ad.imageUrl) {
    const image = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={ad.imageUrl}
        alt={ad.altText || "Advertisement"}
        className="ad-slot__image"
        loading="lazy"
        decoding="async"
        onLoad={(event) => {
          const target = event.currentTarget;
          if (target.naturalWidth > 0 && target.naturalHeight > 0) {
            setImageSize({ width: target.naturalWidth, height: target.naturalHeight });
          }
        }}
      />
    );

    return (
      <div className={`ad-slot ${className}`.trim()}>
        <div className="ad-slot-creative" style={creativeStyle}>
          {ad.linkUrl ? (
            <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer sponsored" className="ad-slot__link">
              {image}
            </a>
          ) : (
            image
          )}
        </div>
      </div>
    );
  }

  if (ad.type === "html" && ad.htmlContent) {
    return (
      <div className={`ad-slot ${className}`.trim()}>
        <div
          ref={htmlRef}
          className="ad-slot-creative ad-slot-creative--html"
          style={creativeStyle}
          dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
        />
      </div>
    );
  }

  return null;
}
