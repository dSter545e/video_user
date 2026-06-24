"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import VideoCard from "./VideoCard";
import FeaturedCategoriesSection from "./FeaturedCategoriesSection";
import AdSlot, { AdInFeed } from "./AdSlot";
import VideoGridSkeleton from "./skeletons/VideoGridSkeleton";
import { Category, Video } from "../lib/types";
import { getRecommendedVideosApi } from "../lib/api";
import { getOrCreateVisitorId } from "../lib/analytics";
import { VIEWER_AUTH_CHANGED_EVENT, getViewerUser } from "../lib/auth";
import { useMobileGrid } from "./MobileGridProvider";

type HomeSectionsProps = {
  latestVideos: Video[];
  mostViewedVideos: Video[];
  categories: Category[];
  categoryCountVideos?: Video[];
};

const HOME_SECTION_VIDEO_LIMIT = 20;

export default function HomeSections({
  latestVideos,
  mostViewedVideos,
  categories,
  categoryCountVideos = [],
}: HomeSectionsProps) {
  const { gridClassName } = useMobileGrid();
  const [recentViewed, setRecentViewed] = useState<Video[]>([]);
  const [personalizedRecommended, setPersonalizedRecommended] = useState<Video[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [hasFetchedRecommendations, setHasFetchedRecommendations] = useState(false);
  const [viewerLoggedIn, setViewerLoggedIn] = useState(false);

  const recommendedVideos = useMemo(() => {
    if (!hasFetchedRecommendations) return [];
    if (personalizedRecommended.length) {
      return personalizedRecommended.slice(0, HOME_SECTION_VIDEO_LIMIT);
    }
    return latestVideos.slice(0, HOME_SECTION_VIDEO_LIMIT);
  }, [hasFetchedRecommendations, personalizedRecommended, latestVideos]);

  const lookupVideos = useMemo(() => {
    const map = new Map<string, Video>();
    for (const video of [...latestVideos, ...mostViewedVideos, ...recommendedVideos, ...categoryCountVideos]) {
      map.set(video._id, video);
    }
    return map;
  }, [latestVideos, mostViewedVideos, recommendedVideos, categoryCountVideos]);

  useEffect(() => {
    const syncViewer = () => setViewerLoggedIn(Boolean(getViewerUser()));
    syncViewer();
    window.addEventListener(VIEWER_AUTH_CHANGED_EVENT, syncViewer);
    window.addEventListener("storage", syncViewer);
    return () => {
      window.removeEventListener(VIEWER_AUTH_CHANGED_EVENT, syncViewer);
      window.removeEventListener("storage", syncViewer);
    };
  }, []);

  useEffect(() => {
    const storageKey = "recent_viewed_video_ids";
    const existingRaw = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
    const existingIds = existingRaw ? JSON.parse(existingRaw) : [];
    const validIds = Array.isArray(existingIds) ? existingIds.filter((item) => typeof item === "string") : [];
    if (!validIds.length) {
      setRecentViewed([]);
      return;
    }
    const map = lookupVideos;
    const matched = validIds.map((id) => map.get(id)).filter(Boolean) as Video[];
    setRecentViewed(matched.slice(0, 6));
  }, [lookupVideos]);

  useEffect(() => {
    let cancelled = false;

    const loadRecommendations = async () => {
      setLoadingRecommended(true);
      try {
        const visitorId = getOrCreateVisitorId();
        const data = await getRecommendedVideosApi({ visitorId, limit: HOME_SECTION_VIDEO_LIMIT });
        if (!cancelled && data.length) setPersonalizedRecommended(data);
      } finally {
        if (!cancelled) {
          setHasFetchedRecommendations(true);
          setLoadingRecommended(false);
        }
      }
    };

    const scheduleLoad = () => {
      if (!cancelled) void loadRecommendations();
    };

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(scheduleLoad, { timeout: 2000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(scheduleLoad, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-[1400px] px-3 py-5 sm:px-6">
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold sm:text-2xl">Latest Videos</h2>
          <Link href="/videos?sort=recent" className="yt-link text-sm font-semibold">
            View more
          </Link>
        </div>
        {latestVideos.length ? (
          <div className={gridClassName}>
            {latestVideos.map((video, index) => (
              <Fragment key={video._id}>
                <VideoCard video={video} />
                <AdInFeed index={index} />
              </Fragment>
            ))}
          </div>
        ) : (
          <p className="yt-card p-8 text-center yt-muted">No latest videos yet.</p>
        )}
      </section>

      <AdSlot slot="home_between_sections" className="home-between-sections-ad" />

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold sm:text-2xl">Recommended Videos</h2>
          <Link href="/videos?sort=recent" className="yt-link text-sm font-semibold">
            View more
          </Link>
        </div>
        {loadingRecommended || !hasFetchedRecommendations ? (
          <VideoGridSkeleton count={8} />
        ) : recommendedVideos.length ? (
          <div className={gridClassName}>
            {recommendedVideos.map((video, index) => (
              <Fragment key={video._id}>
                <VideoCard video={video} />
                <AdInFeed index={index + latestVideos.length} />
              </Fragment>
            ))}
          </div>
        ) : (
          <p className="yt-card p-8 text-center yt-muted">No videos available. Add videos from admin panel.</p>
        )}
      </section>

      <AdSlot slot="home_between_sections" className="home-between-sections-ad" />

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold sm:text-2xl">Most Viewed Videos</h2>
          <Link href="/videos?sort=most_viewed" className="yt-link text-sm font-semibold">
            View more
          </Link>
        </div>
        {mostViewedVideos.length ? (
          <div className={gridClassName}>
            {mostViewedVideos.map((video, index) => (
              <Fragment key={video._id}>
                <VideoCard video={video} />
                <AdInFeed index={index + latestVideos.length + recommendedVideos.length} />
              </Fragment>
            ))}
          </div>
        ) : (
          <p className="yt-card p-8 text-center yt-muted">No viewed videos yet.</p>
        )}
      </section>

      <FeaturedCategoriesSection categories={categories} videos={categoryCountVideos} />

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">Recent Viewed Videos</h2>
            <p className="yt-muted mt-1 text-xs sm:text-sm">Your watch history appears here for quick resume.</p>
          </div>
          {viewerLoggedIn ? (
            <Link href="/dashboard" className="yt-link text-sm font-semibold">
              Explore all
            </Link>
          ) : (
            <p className="yt-muted text-sm font-semibold">Login to see more</p>
          )}
        </div>
        {recentViewed.length ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recentViewed.map((video, index) => (
              <Link
                key={video._id}
                href={`/videos/${video.slug || video._id}`}
                className="yt-card min-w-[260px] shrink-0 rounded-xl p-3 transition hover:-translate-y-0.5"
              >
                <p className="mb-2 text-xs font-semibold text-[var(--brand)]">Recently Watched #{index + 1}</p>
                <h3 className="line-clamp-2 text-sm font-semibold">{video.title}</h3>
                <p className="yt-muted mt-1 line-clamp-2 text-xs">{video.description || "Continue watching this video."}</p>
                <div className="yt-muted mt-3 flex items-center gap-2 text-[11px]">
                  <span className="rounded bg-[var(--surface)] px-2 py-1">Views {video.viewsCount || 0}</span>
                  <span className="rounded bg-[var(--surface)] px-2 py-1">
                    {video.durationSeconds ? `${Math.round(video.durationSeconds)}s` : "--"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="yt-card p-8 text-center yt-muted">Watch videos to build your recent list.</p>
        )}
      </section>
    </main>
  );
}
