import { Skeleton } from "./Skeleton";

type RelatedVideoSkeletonProps = {
  count?: number;
};

export default function RelatedVideoSkeleton({ count = 6 }: RelatedVideoSkeletonProps) {
  return (
    <div className="space-y-1">
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
  );
}
