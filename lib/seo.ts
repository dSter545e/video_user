const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const SEO = {
  siteName: "xhub4u",
  defaultTitle: "xhub4u - Watch Videos Online",
  defaultDescription: "Watch trending and latest videos with categories, recommendations, and fast playback.",
  siteUrl: SITE_URL,
  defaultImage: `${SITE_URL}/favicon.ico`,
};

export const absoluteUrl = (path: string) => {
  if (!path) return SEO.siteUrl;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SEO.siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
};
