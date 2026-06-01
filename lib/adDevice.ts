export type AdDeviceKey = "mobile" | "tablet" | "desktop";

/** Tailwind-aligned breakpoints: mobile <768, tablet 768–1023, desktop ≥1024 */
export const resolveAdDeviceFromWidth = (width: number): AdDeviceKey => {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
};

export const resolveAdDevice = (): AdDeviceKey => {
  if (typeof window === "undefined") return "desktop";
  return resolveAdDeviceFromWidth(window.innerWidth);
};
