import { Skeleton } from "./Skeleton";
import RelatedVideoSkeleton from "./RelatedVideoSkeleton";
import VideoPlayerSkeleton from "./VideoPlayerSkeleton";

export default function VideoWatchSkeleton() {
  return (
    <main className="watch-page mx-auto w-full max-w-[1600px]">
      <div className="watch-page__layout flex flex-col lg:flex-row lg:items-start">
        <div className="watch-page__primary min-w-0 lg:w-3/4">
          <VideoPlayerSkeleton />

          <div className="watch-page__details space-y-4">
            <Skeleton className="watch-page-skeleton__ad h-[72px] w-full max-w-md rounded" />

            <Skeleton className="h-7 w-[88%] max-w-2xl sm:h-8" />

            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[94%]" />
              <Skeleton className="h-4 w-[78%]" />
            </div>

            <Skeleton className="h-4 w-40" />

            <Skeleton className="watch-page-skeleton__ad h-[72px] w-full max-w-md rounded" />

            <section className="watch-page-skeleton__comments space-y-4">
              <Skeleton className="h-5 w-28" />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Skeleton className="h-10 w-full rounded sm:w-44" />
                <Skeleton className="h-10 min-w-0 flex-1 rounded" />
                <Skeleton className="h-10 w-20 rounded sm:w-24" />
              </div>
              <div className="divide-y divide-[var(--border)]">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-2 py-4 first:pt-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[85%]" />
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap gap-4 pt-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        </div>

        <aside className="watch-page__sidebar min-w-0 lg:w-1/4">
          <Skeleton className="watch-page-skeleton__ad mb-3 hidden h-[72px] w-full rounded lg:block" />
          <Skeleton className="mb-2 h-5 w-32" />
          <RelatedVideoSkeleton count={6} />
        </aside>
      </div>
    </main>
  );
}
