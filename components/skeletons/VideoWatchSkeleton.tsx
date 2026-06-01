import { Skeleton } from "./Skeleton";
import VideoGridSkeleton from "./VideoGridSkeleton";

export default function VideoWatchSkeleton() {
  return (
    <main className="mx-auto w-full max-w-[1100px] px-3 py-6 sm:px-6">
      <Skeleton className="aspect-[9/16] w-full max-h-[82vh] sm:aspect-video sm:max-h-none" />
      <div className="mt-4 space-y-3">
        <Skeleton className="h-8 w-[85%] max-w-xl" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
      </div>
      <div className="mt-8">
        <Skeleton className="mb-4 h-7 w-48" />
        <VideoGridSkeleton count={4} />
      </div>
    </main>
  );
}
