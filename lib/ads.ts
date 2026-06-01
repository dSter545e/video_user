export type AdPageKey = "all" | "home" | "watch" | "videos" | "categories" | "search" | "auth" | "legal";

export type AdSlotId =
  | "header_leaderboard"
  | "home_between_sections"
  | "watch_below_player"
  | "watch_video_preroll"
  | "watch_video_overlay"
  | "watch_before_comments"
  | "watch_before_recommendations"
  | "listing_in_feed"
  | "footer_above"
  | "popup";

export type AdItem = {
  _id: string;
  name: string;
  slot: AdSlotId;
  type: "html" | "image" | "video";
  htmlContent: string;
  imageUrl: string;
  videoUrl: string;
  linkUrl: string;
  altText: string;
  pages: AdPageKey[];
  inFeedEvery: number;
  skipAfterSeconds: number;
  popupDelaySeconds: number;
  popupCooldownMinutes: number;
  priority: number;
  isActive: boolean;
  startAt?: string | null;
  endAt?: string | null;
};

export type AdsBySlot = Partial<Record<AdSlotId, AdItem[]>>;

export const resolveAdPageFromPath = (pathname: string): AdPageKey => {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/videos/") && pathname !== "/videos") return "watch";
  if (pathname.startsWith("/videos")) return "videos";
  if (pathname.startsWith("/categories")) return "categories";
  if (pathname.startsWith("/search")) return "search";
  if (pathname.startsWith("/auth")) return "auth";
  if (
    pathname.startsWith("/privacy-policy") ||
    pathname.startsWith("/terms-and-conditions") ||
    pathname.startsWith("/cookie-policy") ||
    pathname.startsWith("/report-removal")
  ) {
    return "legal";
  }
  return "all";
};
