export type MobileGridColumns = 1 | 2;

export const MOBILE_GRID_STORAGE_KEY = "user_mobile_grid_columns";
export const MOBILE_GRID_CHANGED_EVENT = "user-mobile-grid-changed";

export const getStoredMobileGridColumns = (): MobileGridColumns => {
  if (typeof window === "undefined") return 1;
  return localStorage.getItem(MOBILE_GRID_STORAGE_KEY) === "2" ? 2 : 1;
};

export const persistMobileGridColumns = (columns: MobileGridColumns) => {
  localStorage.setItem(MOBILE_GRID_STORAGE_KEY, String(columns));
};

export const getVideoGridClassName = (columns: MobileGridColumns) =>
  columns === 2
    ? "video-grid video-grid--cols-2 grid grid-cols-2 gap-2 md:grid-cols-2 md:gap-5 lg:grid-cols-4"
    : "video-grid video-grid--cols-1 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4";
