import { getCategoriesApi, getVideosApi } from "../lib/api";
import HomeSections from "../components/HomeSections";
import { buildPageMetadata } from "../lib/pageMetadata";
import { SEO } from "../lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: SEO.defaultTitle,
  description: SEO.defaultDescription,
  canonicalPath: "/",
  absoluteTitle: true,
});

export default async function Home() {
  const [videos, categories] = await Promise.all([getVideosApi(), getCategoriesApi()]);
  return <HomeSections videos={videos} categories={categories} />;
}
