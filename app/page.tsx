import { Metadata } from "next";
import { getCategoriesApi, getVideosApi } from "../lib/api";
import HomeSections from "../components/HomeSections";
import { SEO } from "../lib/seo";

export const metadata: Metadata = {
  title: "Home",
  description: "Discover recommended, latest, and most viewed videos by category.",
  openGraph: {
    title: `${SEO.siteName} - Home`,
    description: "Discover recommended, latest, and most viewed videos by category.",
    url: SEO.siteUrl,
  },
  twitter: {
    title: `${SEO.siteName} - Home`,
    description: "Discover recommended, latest, and most viewed videos by category.",
  },
};

export default async function Home() {
  const [videos, categories] = await Promise.all([getVideosApi(), getCategoriesApi()]);
  return <HomeSections videos={videos} categories={categories} />;
}
