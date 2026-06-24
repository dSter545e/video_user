import { Skeleton } from "../../components/skeletons/Skeleton";
import VideoGridSkeleton from "../../components/skeletons/VideoGridSkeleton";

export default function DashboardPageSkeleton() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1100px] px-3 py-6 sm:px-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      <section className="yt-card mt-6 rounded-xl p-4 sm:p-5">
        <Skeleton className="h-6 w-32" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </section>
      <section className="yt-card mt-6 rounded-xl p-4 sm:p-5">
        <Skeleton className="h-6 w-40" />
        <div className="mt-4">
          <VideoGridSkeleton count={4} />
        </div>
      </section>
    </main>
  );
}
