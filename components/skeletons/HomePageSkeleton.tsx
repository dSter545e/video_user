import CategoryGridSkeleton from "./CategoryGridSkeleton";
import { Skeleton } from "./Skeleton";
import VideoGridSkeleton from "./VideoGridSkeleton";

function SectionSkeleton({ titleWidth = "w-48" }: { titleWidth?: string }) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Skeleton className={`h-7 ${titleWidth}`} />
        <Skeleton className="h-4 w-20" />
      </div>
      <VideoGridSkeleton count={8} />
    </section>
  );
}

export default function HomePageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-3 py-5 sm:px-6">
      <SectionSkeleton titleWidth="w-56" />
      <Skeleton className="mx-auto mb-8 h-24 w-full max-w-3xl" />
      <SectionSkeleton titleWidth="w-40" />
      <Skeleton className="mx-auto mb-8 h-24 w-full max-w-3xl" />
      <SectionSkeleton titleWidth="w-52" />
      <section className="mb-8">
        <div className="mb-4">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="mt-2 h-3 w-64" />
        </div>
        <CategoryGridSkeleton count={6} />
      </section>
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:p-5">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-6 h-28 w-full" />
      </section>
    </main>
  );
}
