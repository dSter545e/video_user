import { Skeleton } from "./Skeleton";
import RelatedVideoSkeleton from "./RelatedVideoSkeleton";

export default function VideoWatchSkeleton() {
  return (
    <main className="watch-page mx-auto w-full max-w-[1600px]">
      <div className="watch-page__layout flex flex-col lg:flex-row lg:items-start">
        <div className="watch-page__primary min-w-0 lg:w-3/4">
          <div className="watch-player-frame">
            <Skeleton className="h-full w-full rounded-none" />
          </div>
          <div className="watch-page__details space-y-3">
            <Skeleton className="h-8 w-[85%] max-w-xl" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
          </div>
        </div>
        <aside className="watch-page__sidebar min-w-0 lg:w-1/4">
          <Skeleton className="mb-3 h-5 w-32" />
          <RelatedVideoSkeleton count={6} />
        </aside>
      </div>
    </main>
  );
}
