import HomeSections from "../components/HomeSections";
import { buildPageMetadata } from "../lib/pageMetadata";
import { SEO } from "../lib/seo";
import { getCategories, getPaginatedVideos } from "../lib/serverData";

export const revalidate = 60;

export const metadata = buildPageMetadata({
  title: SEO.defaultTitle,
  description: SEO.defaultDescription,
  canonicalPath: "/",
  absoluteTitle: true,
});

export default async function Home() {
  const [latestData, mostViewedData, categories] = await Promise.all([
    getPaginatedVideos({ limit: 20, sort: "recent", page: 1 }),
    getPaginatedVideos({ limit: 20, sort: "most_viewed", page: 1 }),
    getCategories(),
  ]);

  const categoryCountVideos = [...latestData.items, ...mostViewedData.items].filter(
    (video, index, list) => list.findIndex((item) => item._id === video._id) === index
  );

  return (
    <HomeSections
      latestVideos={latestData.items}
      mostViewedVideos={mostViewedData.items}
      categories={categories}
      categoryCountVideos={categoryCountVideos}
    />
  );
}
