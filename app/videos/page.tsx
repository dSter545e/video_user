import Link from "next/link";
import VideoGridWithAds from "../../components/VideoGridWithAds";
import { buildPageMetadata } from "../../lib/pageMetadata";
import { getPaginatedVideos } from "../../lib/serverData";

type VideosPageProps = {
  searchParams: Promise<{ sort?: string; page?: string }>;
};

const SORT_OPTIONS = [
  { id: "recent", label: "Recent" },
  { id: "most_viewed", label: "Most Viewed" },
  { id: "top_rated", label: "Top Rated" },
  { id: "long_duration", label: "Long Duration" },
  { id: "short_duration", label: "Short Duration" },
];

export const revalidate = 60;

export const metadata = buildPageMetadata({
  title: "All Videos",
  description: "Browse all videos with filters like recent, most viewed, top rated, and duration.",
  canonicalPath: "/videos",
});

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const { sort = "recent", page = "1" } = await searchParams;
  const currentPage = Number.parseInt(page, 10) > 0 ? Number.parseInt(page, 10) : 1;
  const data = await getPaginatedVideos({
    sort: sort as "recent" | "most_viewed" | "top_rated" | "long_duration" | "short_duration",
    page: currentPage,
    limit: 30,
  });
  const sortedVideos = data.items;
  const pagination = data.pagination;

  const getPageHref = (targetPage: number) => `/videos?sort=${encodeURIComponent(sort)}&page=${targetPage}`;
  const pageWindowStart = Math.max(1, pagination.page - 2);
  const pageWindowEnd = Math.min(pagination.totalPages, pagination.page + 2);
  const pageNumbers = Array.from({ length: pageWindowEnd - pageWindowStart + 1 }, (_, index) => pageWindowStart + index);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-3 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">All Videos</h1>
          <p className="yt-muted mt-1 text-sm">Filter by recency, views, rating, and duration.</p>
        </div>
        <Link href="/" className="yt-link text-sm font-semibold">
          Back to Home
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {SORT_OPTIONS.map((option) => {
          const active = sort === option.id;
          return (
            <Link
              key={option.id}
              href={`/videos?sort=${option.id}`}
              className={`rounded px-3 py-2 text-sm font-medium ${
                active ? "bg-[var(--brand)] text-white" : "yt-card"
              }`}
            >
              {option.label}
            </Link>
          );
        })}
      </div>

      {sortedVideos.length ? (
        <>
          <VideoGridWithAds videos={sortedVideos} />
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
              {pageWindowStart > 1 ? (
                <>
                  <Link href={getPageHref(1)} className="yt-card rounded px-3 py-2 text-sm font-medium">
                    1
                  </Link>
                  {pageWindowStart > 2 ? <span className="yt-muted px-1 text-sm">...</span> : null}
                </>
              ) : null}
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
              {pageWindowEnd < pagination.totalPages ? (
                <>
                  {pageWindowEnd < pagination.totalPages - 1 ? <span className="yt-muted px-1 text-sm">...</span> : null}
                  <Link href={getPageHref(pagination.totalPages)} className="yt-card rounded px-3 py-2 text-sm font-medium">
                    {pagination.totalPages}
                  </Link>
                </>
              ) : null}
              {pagination.hasNextPage ? (
                <Link href={getPageHref(pagination.page + 1)} className="yt-card rounded px-3 py-2 text-sm font-medium">
                  Next
                </Link>
              ) : (
                <span className="yt-muted rounded px-3 py-2 text-sm">Next</span>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="yt-card p-8 text-center yt-muted">No videos available.</p>
      )}
    </main>
  );
}
