"use client";

import { ReactNode } from "react";
import { AdSlotId } from "../lib/ads";
import { useAds } from "./AdProvider";
import AdBanner from "./AdBanner";

type AdSlotProps = {
  slot: AdSlotId;
  className?: string;
};

export default function AdSlot({ slot, className = "" }: AdSlotProps) {
  const { getAdsForSlot, loading } = useAds();
  const ads = getAdsForSlot(slot);
  const ad = ads[0];

  if (loading || !ad) return null;

  return (
    <div className={`my-3 flex w-full justify-center text-center ${className}`.trim()} data-ad-slot={slot}>
      <AdBanner ad={ad} />
    </div>
  );
};

type AdInFeedProps = {
  index: number;
  className?: string;
};

export function AdInFeed({ index, className = "" }: AdInFeedProps) {
  const { getAdsForSlot, loading } = useAds();
  const ads = getAdsForSlot("listing_in_feed");
  if (loading || !ads.length) return null;

  const ad = ads[0];
  const every = Math.max(4, ad.inFeedEvery || 10);
  if ((index + 1) % every !== 0) return null;

  const rotated = ads[index % ads.length] || ad;

  return (
    <div
      className={`col-span-1 flex w-full items-center justify-center text-center md:col-span-2 lg:col-span-4 ${className}`}
      data-ad-slot="listing_in_feed"
    >
      <AdBanner ad={rotated} />
    </div>
  );
}

export function insertInFeedAds<T>(items: T[], renderItem: (item: T, index: number) => ReactNode): ReactNode[] {
  const nodes: ReactNode[] = [];
  items.forEach((item, index) => {
    nodes.push(renderItem(item, index));
    nodes.push(<AdInFeed key={`ad-feed-${index}`} index={index} />);
  });
  return nodes;
}
