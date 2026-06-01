const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const SEO = {
  siteName: "xHub4u",
  defaultTitle: "xHub4u - World's Biggest HD Porn Tube",
  defaultDescription:
    "xHub4u is the world's biggest HD porn tube. The site has been building their collection of free sex videos for a decade now, and has 100+ videos.",
  siteUrl: SITE_URL,
  defaultImage: `${SITE_URL}/favicon.ico`,
};

export const absoluteUrl = (path: string) => {
  if (!path) return SEO.siteUrl;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SEO.siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
};
