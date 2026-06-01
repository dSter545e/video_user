import { Metadata } from "next";
import Link from "next/link";
import FeaturedCategoriesSection from "../../components/FeaturedCategoriesSection";
import { getCategoriesApi, getVideosApi } from "../../lib/api";
import { SEO } from "../../lib/seo";

export const metadata: Metadata = {
  title: "Categories",
  description: SEO.defaultDescription,
  openGraph: {
    title: `${SEO.siteName} - Categories`,
    description: SEO.defaultDescription,
    url: `${SEO.siteUrl}/categories`,
  },
  twitter: {
    title: `${SEO.siteName} - Categories`,
    description: SEO.defaultDescription,
  },
};

export default async function CategoriesPage() {
  const [categories, videos] = await Promise.all([getCategoriesApi(), getVideosApi()]);
  const hasFeaturedCategories = categories.some((category) => category.featured);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-3 py-6 sm:px-6">
      <Link href="/" className="yt-link mb-6 inline-block text-sm font-semibold">
        Back to Home
      </Link>

      {hasFeaturedCategories ? (
        <FeaturedCategoriesSection
          categories={categories}
          videos={videos}
          showViewAllLink={false}
          priorityLeadingImage
        />
      ) : (
        <p className="yt-card p-8 text-center yt-muted">No categories available.</p>
      )}
    </main>
  );
}
