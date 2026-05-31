"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { Category, Video } from "../lib/types";

type FeaturedCategoriesSectionProps = {
  categories: Category[];
  videos?: Video[];
  showViewAllLink?: boolean;
};

export default function FeaturedCategoriesSection({
  categories,
  videos = [],
  showViewAllLink = true,
}: FeaturedCategoriesSectionProps) {
  const featuredCategories = useMemo(
    () => categories.filter((category) => category.featured).slice(0, 6),
    [categories]
  );

  const videoCountByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const video of videos) {
      const categoryId = video.category?._id;
      if (!categoryId) continue;
      counts.set(categoryId, (counts.get(categoryId) || 0) + 1);
    }
    return counts;
  }, [videos]);

  if (!featuredCategories.length) return null;

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Featured Categories</h2>
          <p className="yt-muted mt-1 text-xs sm:text-sm">Browse videos by your favorite topics.</p>
        </div>
        {showViewAllLink ? (
          <Link href="/categories" className="yt-link text-sm font-semibold">
            View all
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {featuredCategories.map((category) => {
          const videoCount = videoCountByCategory.get(category._id) || 0;
          return (
            <Link
              key={category._id}
              href={`/categories/${category.slug || category._id}`}
              className="yt-card group block overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-[var(--brand)]/40 hover:shadow-lg"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-[var(--surface-muted)]">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    unoptimized
                    className="object-cover object-center transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-muted)] text-xs yt-muted">
                    No image
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-transparent" />
              </div>
              <div className="p-3 text-center">
                <h3 className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-[var(--brand)]">
                  {category.name}
                </h3>
                <p className="yt-muted mt-0.5 text-[11px] font-medium">
                  {videoCount > 0 ? `${videoCount} video${videoCount === 1 ? "" : "s"}` : "Explore"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
