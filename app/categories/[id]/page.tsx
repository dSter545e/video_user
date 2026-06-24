import Link from "next/link";
import VideoGridWithAds from "../../../components/VideoGridWithAds";
import { buildPageMetadata } from "../../../lib/pageMetadata";
import { SEO } from "../../../lib/seo";
import { getCategories, getPaginatedVideos } from "../../../lib/serverData";

type CategoryVideosPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
};

const SORT_OPTIONS = [
  { id: "recent", label: "Recent" },
  { id: "most_viewed", label: "Most Viewed" },
  { id: "top_rated", label: "Top Rated" },
  { id: "long_duration", label: "Long Duration" },
  { id: "short_duration", label: "Short Duration" },
] as const;

export const revalidate = 60;

export async function generateMetadata({ params }: CategoryVideosPageProps) {
  const { id } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item._id === id || item.slug === id);
  const title = category?.name ? `${category.name} Videos` : "Category Videos";
  const categoryPath = `/categories/${category?.slug || id}`;

  return buildPageMetadata({
    title,
    description: SEO.defaultDescription,
    canonicalPath: categoryPath,
    ogImage: category?.imageUrl,
  });
}

export default async function CategoryVideosPage({ params, searchParams }: CategoryVideosPageProps) {
  const { id } = await params;
  const { sort = "recent", page = "1" } = await searchParams;
  const currentPage = Number.parseInt(page, 10) > 0 ? Number.parseInt(page, 10) : 1;
  const [categories, data] = await Promise.all([
    getCategories(),
    getPaginatedVideos({
      categoryId: id,
      sort: sort as "recent" | "most_viewed" | "top_rated" | "long_duration" | "short_duration",
      page: currentPage,
      limit: 30,
    }),
  ]);
  const category = categories.find((item) => item._id === id || item.slug === id);
  const categoryPath = `/categories/${category?.slug || id}`;
  const sortedVideos = data.items;
  const pagination = data.pagination;

  const getPageHref = (targetPage: number) => `${categoryPath}?sort=${encodeURIComponent(sort)}&page=${targetPage}`;
  const pageWindowStart = Math.max(1, pagination.page - 2);
  const pageWindowEnd = Math.min(pagination.totalPages, pagination.page + 2);
  const pageNumbers = Array.from({ length: pageWindowEnd - pageWindowStart + 1 }, (_, index) => pageWindowStart + index);

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
        <>
          <VideoGridWithAds videos={sortedVideos} />
          {pagination.totalPages > 1 ? (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <p className="yt-muted text-sm">
                Page {pagination.page} of {pagination.totalPages} | Total Videos: {pagination.totalItems}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {pagination.hasPrevPage ? (
                  <Link href={getPageHref(pagination.page - 1)} className="yt-card rounded px-3 py-2 text-sm font-medium">
                    Previous
                  </Link>
                ) : (
                  <span className="yt-muted rounded px-3 py-2 text-sm">Previous</span>
                )}
                {pageNumbers.map((pageNumber) => (
                  <Link
                    key={pageNumber}
                    href={getPageHref(pageNumber)}
                    className={`rounded px-3 py-2 text-sm font-medium ${
                      pageNumber === pagination.page ? "bg-[var(--brand)] text-white" : "yt-card"
                    }`}
                  >
                    {pageNumber}
                  </Link>
                ))}
                {pagination.hasNextPage ? (
                  <Link href={getPageHref(pagination.page + 1)} className="yt-card rounded px-3 py-2 text-sm font-medium">
                    Next
                  </Link>
                ) : (
                  <span className="yt-muted rounded px-3 py-2 text-sm">Next</span>
                )}
              </div>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
