import { Metadata } from "next";
import Link from "next/link";
import VideoCard from "../../../components/VideoCard";
import { getCategoriesApi, getVideosByCategoryApi } from "../../../lib/api";
import { SEO, absoluteUrl } from "../../../lib/seo";

type CategoryVideosPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort?: string }>;
};

const SORT_OPTIONS = [
  { id: "recent", label: "Recent" },
  { id: "most_viewed", label: "Most Viewed" },
  { id: "top_rated", label: "Top Rated" },
  { id: "long_duration", label: "Long Duration" },
  { id: "short_duration", label: "Short Duration" },
] as const;

export async function generateMetadata({ params }: CategoryVideosPageProps): Promise<Metadata> {
  const { id } = await params;
  const categories = await getCategoriesApi();
  const category = categories.find((item) => item._id === id || item.slug === id);
  const title = category?.name ? `${category.name} Videos` : "Category Videos";
  const description = category?.name
    ? `Watch videos from ${category.name} category on ${SEO.siteName}.`
    : `Watch category videos on ${SEO.siteName}.`;
  const categoryPath = `/categories/${category?.slug || id}`;

  return {
    title,
    description,
    alternates: { canonical: categoryPath },
    openGraph: {
      title,
      description,
      url: absoluteUrl(categoryPath),
      images: category?.imageUrl ? [{ url: absoluteUrl(category.imageUrl) }] : undefined,
    },
    twitter: {
      title,
      description,
      images: category?.imageUrl ? [absoluteUrl(category.imageUrl)] : undefined,
    },
  };
}

export default async function CategoryVideosPage({ params, searchParams }: CategoryVideosPageProps) {
  const { id } = await params;
  const { sort = "recent" } = await searchParams;
  const [categories, videos] = await Promise.all([getCategoriesApi(), getVideosByCategoryApi(id)]);
  const category = categories.find((item) => item._id === id || item.slug === id);
  const categoryPath = `/categories/${category?.slug || id}`;
  const sortedVideos = [...videos].sort((a, b) => {
    switch (sort) {
      case "most_viewed":
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      case "top_rated":
        return (b.likesCount || 0) - (a.likesCount || 0);
      case "long_duration":
        return (b.durationSeconds || 0) - (a.durationSeconds || 0);
      case "short_duration":
        return (a.durationSeconds || 0) - (b.durationSeconds || 0);
      case "recent":
      default: {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      }
    }
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-3 py-6 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">{category?.name || "Category Videos"}</h1>
      <Link href="/categories" className="yt-link mb-8 inline-block text-sm font-semibold">
        Back to Categories
      </Link>

      <div className="mb-6 flex flex-wrap gap-2">
        {SORT_OPTIONS.map((option) => {
          const active = sort === option.id;
          return (
            <Link
              key={option.id}
              href={`${categoryPath}?sort=${option.id}`}
              className={`rounded px-3 py-2 text-sm font-medium ${active ? "bg-[var(--brand)] text-white" : "yt-card"}`}
            >
              {option.label}
            </Link>
          );
        })}
      </div>

      {sortedVideos.length === 0 ? (
        <p className="yt-card p-8 text-center yt-muted">No videos in this category.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {sortedVideos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </main>
  );
}
