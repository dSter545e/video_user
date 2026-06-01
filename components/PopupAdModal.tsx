"use client";

import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { AdItem } from "../lib/ads";
import { useAds } from "./AdProvider";
import AdBanner from "./AdBanner";

const POPUP_STORAGE_KEY = "xhub4u_popup_ad_last_shown";

const shouldShowPopup = (ad: AdItem) => {
  if (typeof window === "undefined") return false;
  const raw = sessionStorage.getItem(POPUP_STORAGE_KEY);
  if (!raw) return true;
  try {
    const parsed = JSON.parse(raw) as { adId: string; at: number };
    if (parsed.adId !== ad._id) return true;
    const cooldownMs = Math.max(0, (ad.popupCooldownMinutes ?? 30) * 60 * 1000);
    if (cooldownMs === 0) return false;
    return Date.now() - parsed.at >= cooldownMs;
  } catch {
    return true;
  }
};

const markPopupShown = (ad: AdItem) => {
  sessionStorage.setItem(
    POPUP_STORAGE_KEY,
    JSON.stringify({ adId: ad._id, at: Date.now() })
  );
};

export default function PopupAdModal() {
  const { getAdsForSlot, loading } = useAds();
  const popupAd = getAdsForSlot("popup")[0];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading || !popupAd) return;
    if (!shouldShowPopup(popupAd)) return;

    const delayMs = Math.max(0, (popupAd.popupDelaySeconds ?? 5) * 1000);
    const timer = window.setTimeout(() => {
      setVisible(true);
      markPopupShown(popupAd);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [loading, popupAd]);

  if (!visible || !popupAd) return null;

  return (
    <div className="popup-ad-overlay fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-lg text-center" role="dialog" aria-modal="true" aria-label="Advertisement">
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute -right-1 -top-1 z-10 rounded-full bg-black/80 p-2 text-white hover:bg-black"
          aria-label="Close"
        >
          <FiX />
        </button>
        <AdBanner ad={popupAd} />
      </div>
    </div>
  );
}
