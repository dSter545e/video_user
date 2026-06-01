import { Skeleton } from "./Skeleton";
import VideoGridSkeleton from "./VideoGridSkeleton";

type ListPageSkeletonProps = {
  showFilters?: boolean;
};

export default function ListPageSkeleton({ showFilters = true }: ListPageSkeletonProps) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-3 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
      {showFilters ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-24" />
          ))}
        </div>
      ) : null}
      <VideoGridSkeleton count={12} />
    </main>
  );
}
