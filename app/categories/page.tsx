import Link from "next/link";
import FeaturedCategoriesSection from "../../components/FeaturedCategoriesSection";
import { buildPageMetadata } from "../../lib/pageMetadata";
import { SEO } from "../../lib/seo";
import { getCategories, getPaginatedVideos } from "../../lib/serverData";

export const revalidate = 60;

export const metadata = buildPageMetadata({
  title: "Categories",
  description: SEO.defaultDescription,
  canonicalPath: "/categories",
});

export default async function CategoriesPage() {
  const [categories, sampleVideos] = await Promise.all([
    getCategories(),
    getPaginatedVideos({ limit: 100, sort: "recent", page: 1 }),
  ]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-3 py-6 sm:px-6">
      <Link href="/" className="yt-link mb-6 inline-block text-sm font-semibold">
        Back to Home
      </Link>

      {categories.length ? (
        <FeaturedCategoriesSection
          categories={categories}
          videos={sampleVideos.items}
          mode="all"
          showViewAllLink={false}
          priorityLeadingImage
        />
      ) : (
        <p className="yt-card p-8 text-center yt-muted">No categories available.</p>
      )}
    </main>
  );
}
