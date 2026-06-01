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
    <div className="popup-ad-overlay fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
      <div
        className="popup-ad-modal relative w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Advertisement"
      >
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute right-2 top-2 z-10 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1.5 hover:bg-[var(--surface-muted)]"
          aria-label="Close advertisement"
        >
          <FiX />
        </button>
        <p className="yt-muted mb-2 pr-8 text-center text-[10px] uppercase tracking-wide">Advertisement</p>
        <AdBanner ad={popupAd} className="border-0 bg-transparent" />
      </div>
    </div>
  );
}
