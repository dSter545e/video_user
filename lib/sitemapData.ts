import type { MetadataRoute } from "next";
import { getCategoriesApi, getPaginatedVideosApi } from "./api";
import { Category, Video } from "./types";
import { absoluteUrl } from "./seo";

const SITEMAP_VIDEO_PAGE_SIZE = 100;
const MAX_SITEMAP_VIDEO_PAGES = 200;

export const fetchAllPublicVideos = async (): Promise<Video[]> => {
  const all: Video[] = [];
  let page = 1;

  while (page <= MAX_SITEMAP_VIDEO_PAGES) {
    const data = await getPaginatedVideosApi({
      page,
      limit: SITEMAP_VIDEO_PAGE_SIZE,
      sort: "recent",
    });
    all.push(...data.items);
    if (!data.pagination.hasNextPage) break;
    page += 1;
  }

  return all;
};

const parseLastModified = (value?: string) => {
  if (!value) return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const videoPath = (video: Video) => `/videos/${video.slug || video._id}`;

const categoryPath = (category: Category) => `/categories/${category.slug || category._id}`;

const staticRoutes: MetadataRoute.Sitemap = [
  { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
  { url: absoluteUrl("/videos"), changeFrequency: "daily", priority: 0.9 },
  { url: absoluteUrl("/categories"), changeFrequency: "daily", priority: 0.9 },
  { url: absoluteUrl("/search"), changeFrequency: "weekly", priority: 0.5 },
  { url: absoluteUrl("/privacy-policy"), changeFrequency: "monthly", priority: 0.3 },
  { url: absoluteUrl("/terms-and-conditions"), changeFrequency: "monthly", priority: 0.3 },
  { url: absoluteUrl("/cookie-policy"), changeFrequency: "monthly", priority: 0.3 },
  { url: absoluteUrl("/report-removal"), changeFrequency: "monthly", priority: 0.3 },
];

export const buildSitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const [categories, videos] = await Promise.all([getCategoriesApi(), fetchAllPublicVideos()]);

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(categoryPath(category)),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const videoEntries: MetadataRoute.Sitemap = videos.map((video) => ({
    url: absoluteUrl(videoPath(video)),
    lastModified: parseLastModified(video.createdAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryEntries, ...videoEntries];
};

export const getSitemapIndexUrl = () => absoluteUrl("/sitemap.xml");
