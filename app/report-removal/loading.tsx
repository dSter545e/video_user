import { Skeleton } from "../../components/skeletons/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[720px] px-3 py-6 sm:px-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-full" />
      <div className="mt-8 space-y-4">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-36" />
      </div>
    </main>
  );
}
