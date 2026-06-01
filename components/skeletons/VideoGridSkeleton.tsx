import { Skeleton } from "./Skeleton";

type VideoGridSkeletonProps = {
  count?: number;
};

export default function VideoGridSkeleton({ count = 12 }: VideoGridSkeletonProps) {
  return (
    <div className="video-grid-skeleton grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <article key={index} className="overflow-hidden">
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="space-y-2 px-1 py-3">
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-3 w-[55%]" />
          </div>
        </article>
      ))}
    </div>
  );
}
