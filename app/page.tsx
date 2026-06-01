import { Metadata } from "next";
import { getCategoriesApi, getVideosApi } from "../lib/api";
import HomeSections from "../components/HomeSections";
import { SEO } from "../lib/seo";

export const metadata: Metadata = {
  title: "Home",
  description: SEO.defaultDescription,
  openGraph: {
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
    url: SEO.siteUrl,
  },
  twitter: {
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
  },
};

export default async function Home() {
  const [videos, categories] = await Promise.all([getVideosApi(), getCategoriesApi()]);
  return <HomeSections videos={videos} categories={categories} />;
}
