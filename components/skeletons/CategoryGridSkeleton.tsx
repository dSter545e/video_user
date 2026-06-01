import { Skeleton } from "./Skeleton";

type CategoryGridSkeletonProps = {
  count?: number;
};

export default function CategoryGridSkeleton({ count = 12 }: CategoryGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden border border-[var(--border)]">
          <Skeleton className="aspect-video w-full" />
          <div className="p-3">
            <Skeleton className="mx-auto h-4 w-[70%]" />
            <Skeleton className="mx-auto mt-2 h-3 w-[45%]" />
          </div>
        </div>
      ))}
    </div>
  );
}
