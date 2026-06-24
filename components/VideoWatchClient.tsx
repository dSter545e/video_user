"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import VideoPlayerWithAds from "./VideoPlayerWithAds";
import RelatedVideoItem from "./RelatedVideoItem";
import { addVideoCommentApi, getRecommendedVideosApi, reactToVideoApi, trackVideoViewApi } from "../lib/api";
import { getPublicApiUrl } from "../lib/apiConfig";
import { isMediaDebugEnabled } from "../lib/mediaDebug";
import { Video, VideoComment } from "../lib/types";
import MediaDebugPanel from "./MediaDebugPanel";
import { normalizeVideoMedia } from "../lib/mediaUrl";
import { getVideoPosterImageUrl } from "../lib/videoPoster";
import { isVideoPlayable, resolveWatchPlaybackSrc } from "../lib/videoPlayback";
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
  const [video, setVideo] = useState(() => normalizeVideoMedia(initialVideo));
  const [recommendedVideos, setRecommendedVideos] = useState<Video[]>(
    () => (initialVideo.recommendedVideos || []).map((item) => normalizeVideoMedia(item))
  );
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("User");
  const [viewer] = useState(getViewerUser());
  const [rawApiVideo, setRawApiVideo] = useState<Video | null>(null);
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

  useEffect(() => {
    if (!isMediaDebugEnabled()) return;

    const loadRawApiVideo = async () => {
      try {
        const response = await fetch(`${getPublicApiUrl()}/api/videos/${video.slug || video._id}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          console.warn("[media-debug] raw API fetch failed", response.status, response.statusText);
          return;
        }
        const raw = (await response.json()) as Video;
        setRawApiVideo(raw);
        console.log("[media-debug] raw API videoUrl", raw.videoUrl);
      } catch (error) {
        console.warn("[media-debug] raw API fetch error", error);
      }
    };

    void loadRawApiVideo();
  }, [video._id, video.slug]);

  const tagsText = useMemo(() => (video.tags || []).map((tag) => `#${tag.displayName}`).join(" "), [video.tags]);
  const posterUrl = useMemo(() => getVideoPosterImageUrl(video), [video]);
  const playbackSrc = useMemo(() => resolveWatchPlaybackSrc(video), [video]);
  const playable = useMemo(() => isVideoPlayable(video), [video]);
  const qualityVariants = useMemo(
    () =>
      (video.qualityVariants || []).map((item) => ({
        src: item.url,
        label: item.label,
        height: item.height,
      })),
    [video.qualityVariants]
  );

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
  }, [video._id, video.slug]);

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
    <main className="watch-page mx-auto w-full max-w-[1600px]">
      <div className="watch-page__layout flex flex-col lg:flex-row lg:items-start">
        <div className="watch-page__primary min-w-0 lg:w-3/4">
          <MediaDebugPanel video={video} rawVideo={rawApiVideo || video} playbackSrc={playbackSrc} />

          {playable ? (
            <VideoPlayerWithAds
              src={playbackSrc}
              poster={posterUrl || undefined}
              qualityVariants={qualityVariants}
              onPlayedSeconds={handlePlayedSeconds}
            />
          ) : (
            <div className="watch-player-frame flex min-h-[220px] items-center justify-center bg-black px-6 py-10 text-center text-white">
              <div>
                <p className="text-base font-semibold sm:text-lg">
                  {video.processingStatus === "processing" ? "Video is processing" : "Video unavailable"}
                </p>
                <p className="mt-2 text-sm text-white/70">
                  {video.processingStatus === "processing"
                    ? "Encoding is still running. Refresh this page in a few minutes."
                    : "This upload did not finish processing. Re-upload from Admin or check the server logs."}
                </p>
              </div>
            </div>
          )}

          <div className="watch-page__details">
            <AdSlot slot="watch_below_player" />

            <h1 className="text-xl font-semibold leading-snug sm:text-2xl">{video.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="yt-muted">{video.viewsCount || 0} views</span>
              <span className="yt-muted">{video.category?.name || "General"}</span>
              <span className="yt-muted">{video.commentsCount || 0} comments</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <button
                type="button"
                className="watch-page__action flex items-center gap-2 text-sm"
                onClick={() => {
                  if (!viewer) return;
                  void handleReaction("like");
                }}
              >
                <FiThumbsUp /> {video.likesCount || 0}
              </button>
              <button
                type="button"
                className="watch-page__action flex items-center gap-2 text-sm"
                onClick={() => {
                  if (!viewer) return;
                  void handleReaction("dislike");
                }}
              >
                <FiThumbsDown /> {video.dislikesCount || 0}
              </button>
              {!viewer ? (
                <p className="yt-muted text-sm">
                  <Link href="/auth/login" className="yt-link">
                    Login
                  </Link>{" "}
                  to react.
                </p>
              ) : null}
            </div>

            {video.description ? (
              <p className="yt-muted mt-4 whitespace-pre-wrap text-sm leading-relaxed">{video.description}</p>
            ) : null}

            {(video.tags || []).length ? (
              <p className="yt-muted mt-3 text-sm">
                {(video.tags || []).map((tag) => `#${tag.displayName}`).join(" ")}
              </p>
            ) : tagsText ? (
              <p className="yt-muted mt-3 text-sm">{tagsText}</p>
            ) : null}

            <AdSlot slot="watch_before_comments" />

            <section className="watch-page__comments mt-6">
              <h2 className="text-base font-semibold">{video.commentsCount || 0} Comments</h2>
              {viewer ? (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={authorName}
                    onChange={(event) => setAuthorName(event.target.value)}
                    placeholder="Your name"
                    className="yt-input rounded px-3 py-2 text-sm sm:w-44"
                  />
                  <input
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Add a comment"
                    className="yt-input w-full flex-1 rounded px-3 py-2 text-sm"
                  />
                  <button type="button" className="watch-page__action px-4 py-2 text-sm font-medium" onClick={handleComment}>
                    Post
                  </button>
                </div>
              ) : (
                <p className="mt-3 text-sm yt-muted">
                  <Link href="/auth/login" className="yt-link">
                    Login
                  </Link>{" "}
                  to comment.
                </p>
              )}
              <div className="mt-4 divide-y divide-[var(--border)]">
                {comments.map((comment) => (
                  <div key={comment._id} className="py-3">
                    <p className="text-sm font-semibold">{comment.authorName}</p>
                    <p className="yt-muted mt-1 text-sm">{comment.message}</p>
                  </div>
                ))}
                {!comments.length ? <p className="yt-muted py-3 text-sm">No comments yet.</p> : null}
              </div>
            </section>

            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link href="/" className="yt-link font-medium">
                Back to Home
              </Link>
              <Link
                href={`/report-removal?video=${encodeURIComponent(video.slug || video._id)}`}
                className="yt-link font-medium"
              >
                Request video removal
              </Link>
            </div>
          </div>
        </div>

        {recommendedVideos.length ? (
          <aside className="watch-page__sidebar min-w-0 lg:w-1/4">
            <AdSlot slot="watch_before_recommendations" />
            <h2 className="mb-1 text-sm font-semibold">Related videos</h2>
            <div className="watch-page__related-list">
              {recommendedVideos.map((item, index) => (
                <div key={item._id}>
                  <RelatedVideoItem video={item} />
                  <AdInFeed index={index} />
                </div>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
    </main>
  );
}
