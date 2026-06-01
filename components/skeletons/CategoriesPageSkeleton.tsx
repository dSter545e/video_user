import CategoryGridSkeleton from "./CategoryGridSkeleton";
import { Skeleton } from "./Skeleton";

export default function CategoriesPageSkeleton() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-3 py-6 sm:px-6">
      <Skeleton className="mb-6 h-4 w-28" />
      <div className="mb-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-3 w-64" />
      </div>
      <CategoryGridSkeleton count={12} />
    </main>
  );
}
