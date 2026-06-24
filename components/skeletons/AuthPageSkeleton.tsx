import { Skeleton } from "../../components/skeletons/Skeleton";

export default function AuthLoading() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md items-center px-3 py-10 sm:px-6">
      <div className="yt-card w-full rounded-xl p-6">
        <Skeleton className="mx-auto h-8 w-40" />
        <Skeleton className="mx-auto mt-2 h-4 w-56" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="mt-2 h-10 w-full" />
        </div>
      </div>
    </main>
  );
}
