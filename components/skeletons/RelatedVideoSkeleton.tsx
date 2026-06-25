import { Skeleton } from "./Skeleton";

type RelatedVideoSkeletonProps = {
  count?: number;
};

export default function RelatedVideoSkeleton({ count = 6 }: RelatedVideoSkeletonProps) {
  return (
    <>
      <div className="watch-page__related-list video-grid video-grid--cols-2 grid w-full grid-cols-2 gap-2 md:gap-5 lg:hidden">
        {Array.from({ length: count }).map((_, index) => (
          <article key={index} className="min-w-0 overflow-hidden">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="space-y-2 px-1 py-3">
              <Skeleton className="h-4 w-[92%]" />
              <Skeleton className="h-3 w-[55%]" />
            </div>
          </article>
        ))}
      </div>
      <div className="hidden space-y-1 lg:block">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex gap-2 py-2">
            <Skeleton className="aspect-video w-[42%] max-w-[168px] shrink-0 rounded-none" />
            <div className="min-w-0 flex-1 space-y-2 pt-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
