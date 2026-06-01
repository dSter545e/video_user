import Link from "next/link";
import FeaturedCategoriesSection from "../../components/FeaturedCategoriesSection";
import { getCategoriesApi, getVideosApi } from "../../lib/api";
import { buildPageMetadata } from "../../lib/pageMetadata";
import { SEO } from "../../lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Categories",
  description: SEO.defaultDescription,
  canonicalPath: "/categories",
});

export default async function CategoriesPage() {
  const [categories, videos] = await Promise.all([getCategoriesApi(), getVideosApi()]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-3 py-6 sm:px-6">
      <Link href="/" className="yt-link mb-6 inline-block text-sm font-semibold">
        Back to Home
      </Link>

      {categories.length ? (
        <FeaturedCategoriesSection
          categories={categories}
          videos={videos}
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
