import Link from "next/link";
import VideoGridWithAds from "../../components/VideoGridWithAds";
import { getPaginatedVideosApi } from "../../lib/api";
import { buildPageMetadata } from "../../lib/pageMetadata";
import { SEO } from "../../lib/seo";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
    sort?: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const title = q.trim() ? `Search: ${q.trim()}` : "Search Videos";
  return buildPageMetadata({
    title,
    description: `Search videos on ${SEO.siteName} by video ID, title, or category.`,
    canonicalPath: "/search",
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", page = "1", sort = "recent" } = await searchParams;
  const query = q.trim();
  const currentPage = Number.parseInt(page, 10) > 0 ? Number.parseInt(page, 10) : 1;

  const data = query
    ? await getPaginatedVideosApi({
        q: query,
        sort: sort as "recent" | "most_viewed" | "top_rated" | "long_duration" | "short_duration",
        page: currentPage,
        limit: 30,
      })
    : {
        items: [],
        pagination: {
          page: 1,
          limit: 30,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams({
      q: query,
      sort,
      page: String(targetPage),
    });
    return `/search?${params.toString()}`;
  };

  const pagination = data.pagination;
  const pageWindowStart = Math.max(1, pagination.page - 2);
  const pageWindowEnd = Math.min(pagination.totalPages, pagination.page + 2);
  const pageNumbers = Array.from({ length: pageWindowEnd - pageWindowStart + 1 }, (_, index) => pageWindowStart + index);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-3 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Search Videos</h1>
          <p className="yt-muted mt-1 text-sm">
            {query ? `Results for "${query}"` : "Use the search bar to find videos by ID, title, or category."}
          </p>
        </div>
        <Link href="/" className="yt-link text-sm font-semibold">
          Back to Home
        </Link>
      </div>

      {query && data.items.length ? (
        <>
          <VideoGridWithAds videos={data.items} />

          {pagination.totalPages > 1 ? (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {pagination.hasPrevPage ? (
                <Link href={buildHref(pagination.page - 1)} className="yt-card rounded px-3 py-2 text-sm">
                  Previous
                </Link>
              ) : null}
              {pageNumbers.map((pageNumber) => (
                <Link
                  key={pageNumber}
                  href={buildHref(pageNumber)}
                  className={`rounded px-3 py-2 text-sm ${
                    pageNumber === pagination.page ? "bg-[var(--brand)] text-white" : "yt-card"
                  }`}
                >
                  {pageNumber}
                </Link>
              ))}
              {pagination.hasNextPage ? (
                <Link href={buildHref(pagination.page + 1)} className="yt-card rounded px-3 py-2 text-sm">
                  Next
                </Link>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}

      {query && !data.items.length ? (
        <div className="yt-card rounded-xl p-6 text-center text-sm">
          <p className="font-medium">No videos found</p>
          <p className="yt-muted mt-1">Try a different video ID, title, or category name.</p>
        </div>
      ) : null}
    </main>
  );
}
