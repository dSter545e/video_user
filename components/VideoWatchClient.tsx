"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import VideoPlayerWithAds from "./VideoPlayerWithAds";
import VideoCard from "./VideoCard";
import { addVideoCommentApi, getRecommendedVideosApi, reactToVideoApi, trackVideoViewApi } from "../lib/api";
import { Video, VideoComment } from "../lib/types";
import { getViewerUser } from "../lib/auth";
import { emitAnalyticsEvent } from "../lib/analytics";
import AdSlot, { AdInFeed } from "./AdSlot";

type VideoWatchClientProps = {
  initialVideo: Video;
  initialComments: VideoComment[];
};

const getUserIdentifier = () => {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem("viewer_id");
  if (existing) return existing;
  const generated = `viewer_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  localStorage.setItem("viewer_id", generated);
  return generated;
};

export default function VideoWatchClient({ initialVideo, initialComments }: VideoWatchClientProps) {
  const [video, setVideo] = useState(initialVideo);
  const [recommendedVideos, setRecommendedVideos] = useState<Video[]>(initialVideo.recommendedVideos || []);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("User");
  const [viewer] = useState(getViewerUser());
  const lastLoggedWatchSecondRef = useRef(0);
  const previousPlayedSecondsRef = useRef(0);
  const crossedViewThresholdRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storageKey = "recent_viewed_video_ids";
    const existingRaw = localStorage.getItem(storageKey);
    const existingIds = existingRaw ? JSON.parse(existingRaw) : [];
    const sanitized = Array.isArray(existingIds) ? existingIds.filter((item) => typeof item === "string") : [];
    const merged = [video._id, ...sanitized.filter((id) => id !== video._id)].slice(0, 20);
    localStorage.setItem(storageKey, JSON.stringify(merged));
  }, [video._id]);

  useEffect(() => {
    const loadRecommendations = async () => {
      const visitorId = getUserIdentifier();
      const data = await getRecommendedVideosApi({
        visitorId,
        currentVideoId: video._id,
        limit: 12,
      });
      if (data.length) {
        setRecommendedVideos(data);
        return;
      }
      setRecommendedVideos(video.recommendedVideos || []);
    };
    void loadRecommendations();
  }, [video._id, video.recommendedVideos]);

  const tagsText = useMemo(() => (video.tags || []).map((tag) => `#${tag.displayName}`).join(" "), [video.tags]);

  const handlePlayedSeconds = useCallback(async (seconds: number) => {
    const rounded = Math.round(seconds);
    if (rounded > 0 && rounded % 10 === 0 && rounded !== lastLoggedWatchSecondRef.current) {
      lastLoggedWatchSecondRef.current = rounded;
      emitAnalyticsEvent("video_watch_progress", {
        videoId: video._id,
        videoSlug: video.slug || "",
        watchedSeconds: rounded,
      });
    }
    const previous = previousPlayedSecondsRef.current;
    if (seconds + 1 < previous) {
      crossedViewThresholdRef.current = false;
    }
    previousPlayedSecondsRef.current = seconds;

    if (crossedViewThresholdRef.current || seconds < 5) return;
    const userIdentifier = getUserIdentifier();
    const result = await trackVideoViewApi(video._id, userIdentifier, seconds);
    if (result?.counted) {
      setVideo((prev) => ({ ...prev, viewsCount: result.viewsCount }));
      crossedViewThresholdRef.current = true;
    }
  }, [video._id]);

  const handleReaction = async (reaction: "like" | "dislike") => {
    const userIdentifier = getUserIdentifier();
    const result = await reactToVideoApi(video._id, userIdentifier, reaction);
    if (!result) return;
    setVideo((prev) => ({
      ...prev,
      likesCount: result.likesCount,
      dislikesCount: result.dislikesCount,
      userReaction: result.userReaction,
    }));
    emitAnalyticsEvent("video_reaction", { videoId: video._id, reaction });
  };

  const handleComment = async () => {
    const message = commentText.trim();
    if (!message) return;
    const userIdentifier = getUserIdentifier();
    const created = await addVideoCommentApi(video._id, {
      userIdentifier,
      authorName: authorName.trim() || "User",
      message,
    });
    if (!created) return;
    setComments((prev) => [created, ...prev]);
    setCommentText("");
    setVideo((prev) => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }));
    emitAnalyticsEvent("video_comment", { videoId: video._id });
  };

  return (
    <main className="mx-auto w-full max-w-[1200px] px-3 py-6 sm:px-6">
      <div className="yt-card rounded-none p-1 sm:p-2">
        <VideoPlayerWithAds
          src={video.videoUrl}
          poster={video.thumbnail}
          qualityVariants={(video.qualityVariants || []).map((item) => ({
            src: item.url,
            label: item.label,
            height: item.height,
          }))}
          onPlayedSeconds={handlePlayedSeconds}
        />
      </div>

      <AdSlot slot="watch_below_player" />

      <div className="mt-4">
        <h1 className="text-2xl font-bold">{video.title}</h1>
        <p className="yt-muted mt-2 text-sm">{video.description || "No description available."}</p>
        <div className="yt-muted mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded bg-[var(--surface-muted)] px-2 py-1">{video.category?.name || "General"}</span>
          <span className="rounded bg-[var(--surface-muted)] px-2 py-1">Views {video.viewsCount || 0}</span>
          <span className="rounded bg-[var(--surface-muted)] px-2 py-1">Comments {video.commentsCount || 0}</span>
        </div>
        <div className="mt-4 rounded border border-[var(--border)] p-3">
          <p className="mb-2 text-sm font-semibold">Tags</p>
          {(video.tags || []).length ? (
            <div className="flex flex-wrap gap-2">
              {(video.tags || []).map((tag) => (
                <span key={tag._id} className="rounded bg-[var(--surface-muted)] px-2 py-1 text-xs">
                  #{tag.displayName}
                </span>
              ))}
            </div>
          ) : (
            <p className="yt-muted text-sm">{tagsText || "No tags available."}</p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="yt-card flex items-center gap-2 px-4 py-2 text-sm"
            onClick={() => {
              if (!viewer) return;
              void handleReaction("like");
            }}
          >
            <FiThumbsUp /> ({video.likesCount || 0})
          </button>
          <button
            className="yt-card flex items-center gap-2 px-4 py-2 text-sm"
            onClick={() => {
              if (!viewer) return;
              void handleReaction("dislike");
            }}
          >
            <FiThumbsDown /> ({video.dislikesCount || 0})
          </button>
          {!viewer ? (
            <p className="yt-muted self-center text-sm">
              <Link href="/auth/login" className="yt-link">Login</Link> to react.
            </p>
          ) : null}
        </div>

        <AdSlot slot="watch_before_comments" />

        <div className="mt-6 yt-card p-4">
          <h2 className="text-lg font-semibold">Comments</h2>
          {viewer ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={authorName}
                onChange={(event) => setAuthorName(event.target.value)}
                placeholder="Your name"
                className="yt-input rounded px-3 py-2 text-sm sm:w-52"
              />
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Add a comment"
                className="yt-input w-full rounded px-3 py-2 text-sm"
              />
              <button className="yt-card px-4 py-2 text-sm" onClick={handleComment}>
                Post
              </button>
            </div>
          ) : (
            <p className="mt-3 text-sm yt-muted">
              <Link href="/auth/login" className="yt-link">Login</Link> to comment.
            </p>
          )}
          <div className="mt-4 space-y-3">
            {comments.map((comment) => (
              <div key={comment._id} className="rounded border border-[var(--border)] p-3">
                <p className="text-sm font-semibold">{comment.authorName}</p>
                <p className="yt-muted mt-1 text-sm">{comment.message}</p>
              </div>
            ))}
            {!comments.length ? <p className="yt-muted text-sm">No comments yet.</p> : null}
          </div>
        </div>

        <Link href="/" className="yt-link mt-4 inline-block text-sm font-semibold">
          Back to Home
        </Link>
        <Link
          href={`/report-removal?video=${encodeURIComponent(video.slug || video._id)}`}
          className="yt-link ml-4 mt-4 inline-block text-sm font-semibold"
        >
          Request video removal
        </Link>
      </div>

      {recommendedVideos.length ? (
        <section className="mt-8">
          <AdSlot slot="watch_before_recommendations" />
          <h2 className="mb-3 text-xl font-semibold">Recommended For You</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {recommendedVideos.map((item, index) => (
              <div key={item._id} className="contents">
                <VideoCard video={item} />
                <AdInFeed index={index} />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
