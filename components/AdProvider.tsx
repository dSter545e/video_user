"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AdItem, AdPageKey, AdSlotId, AdsBySlot, resolveAdPageFromPath } from "../lib/ads";
import { AdDeviceKey, resolveAdDevice, resolveAdDeviceFromWidth } from "../lib/adDevice";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type AdContextValue = {
  adsBySlot: AdsBySlot;
  page: AdPageKey;
  loading: boolean;
  getAdsForSlot: (slot: AdSlotId) => AdItem[];
};

const AdContext = createContext<AdContextValue>({
  adsBySlot: {},
  page: "all",
  loading: true,
  getAdsForSlot: () => [],
});

export const useAds = () => useContext(AdContext);

type AdProviderProps = {
  children: ReactNode;
};

export default function AdProvider({ children }: AdProviderProps) {
  const pathname = usePathname();
  const page = useMemo(() => resolveAdPageFromPath(pathname || "/"), [pathname]);
  const [adsBySlot, setAdsBySlot] = useState<AdsBySlot>({});
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<AdDeviceKey>(() => resolveAdDevice());

  useEffect(() => {
    const onResize = () => {
      const next = resolveAdDeviceFromWidth(window.innerWidth);
      setDevice((prev) => (prev === next ? prev : next));
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const url = `${BACKEND_URL}/api/ads?page=${encodeURIComponent(page)}&device=${encodeURIComponent(device)}`;
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { ads?: AdsBySlot };
        if (!cancelled && data.ads) setAdsBySlot(data.ads);
      } catch {
        if (!cancelled) setAdsBySlot({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [page, device]);

  const getAdsForSlot = (slot: AdSlotId) => adsBySlot[slot] || [];

  const value = useMemo(
    () => ({ adsBySlot, page, loading, getAdsForSlot }),
    [adsBySlot, page, loading]
  );

  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
}
