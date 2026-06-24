"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getVideosByIdsApi } from "../../lib/api";
import { clearViewerSession, getViewerUser, updateViewerUser, ViewerUser } from "../../lib/auth";
import { Video } from "../../lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [viewer, setViewer] = useState<ViewerUser | null>(null);
  const [videosMap, setVideosMap] = useState<Map<string, Video>>(new Map());
  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const user = getViewerUser();
    setViewer(user);
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      const user = getViewerUser();
      if (!user) {
        setLoadingHistory(false);
        return;
      }
      const storedRaw = localStorage.getItem("recent_viewed_video_ids");
      const storedIds = storedRaw ? JSON.parse(storedRaw) : [];
      const validIds = Array.isArray(storedIds) ? storedIds.filter((item) => typeof item === "string") : [];
      setHistoryIds(validIds);
      const videos = await getVideosByIdsApi(validIds);
      setVideosMap(new Map(videos.map((video) => [video._id, video])));
      setLoadingHistory(false);
    };
    void loadHistory();
  }, []);

  const historyVideos = useMemo(
    () => historyIds.map((id) => videosMap.get(id)).filter(Boolean) as Video[],
    [historyIds, videosMap]
  );

  const onSaveProfile = () => {
    if (!viewer) return;
    const nextUser: ViewerUser = {
      ...viewer,
      name: name.trim() || viewer.name,
      email: email.trim() || viewer.email,
    };
    updateViewerUser(nextUser);
    setViewer(nextUser);
    setEditMode(false);
    setStatusMessage("Profile updated.");
  };

  const onLogout = () => {
    clearViewerSession();
    setViewer(null);
    router.push("/auth/login");
    router.refresh();
  };

  if (!viewer) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[1000px] px-3 py-6 sm:px-6">
        <div className="yt-card p-6 text-center">
          <h1 className="text-2xl font-bold">User Dashboard</h1>
          <p className="yt-muted mt-2 text-sm">Please login to view your dashboard and watch history.</p>
          <Link href="/auth/login" className="yt-link mt-4 inline-block text-sm font-semibold">
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1100px] px-3 py-6 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">User Dashboard</h1>
      <p className="yt-muted mt-2 text-sm">Manage your details and view your complete watch history.</p>

      <section className="yt-card mt-6 rounded-xl p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">User Details</h2>
          <div className="flex items-center gap-2">
            <button className="yt-card rounded px-3 py-2 text-sm" onClick={() => setEditMode((prev) => !prev)}>
              {editMode ? "Cancel" : "Edit"}
            </button>
            <button className="rounded border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-muted)]" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        {editMode ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={name} onChange={(event) => setName(event.target.value)} className="yt-input rounded px-3 py-2 text-sm" />
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="yt-input rounded px-3 py-2 text-sm" />
            <div className="sm:col-span-2">
              <button className="yt-card rounded px-4 py-2 text-sm" onClick={onSaveProfile}>
                Save Details
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-semibold">Name:</span> {viewer.name}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {viewer.email}
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link href="/auth/reset-password" className="yt-link text-sm font-semibold">
            Reset Password
          </Link>
          <Link href="/videos?sort=recent" className="yt-link text-sm font-semibold">
            Explore Videos
          </Link>
        </div>
        {statusMessage ? <p className="mt-3 text-sm text-green-600">{statusMessage}</p> : null}
      </section>

      <section className="yt-card mt-6 rounded-xl p-4 sm:p-5">
        <h2 className="text-lg font-semibold">Watch History</h2>
        {loadingHistory ? (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]" />
            ))}
          </div>
        ) : null}
        {!loadingHistory && !historyVideos.length ? <p className="yt-muted mt-3 text-sm">No watched videos yet.</p> : null}
        {!loadingHistory && historyVideos.length ? (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {historyVideos.map((video, index) => (
              <Link
                key={`${video._id}-${index}`}
                href={`/videos/${video.slug || video._id}`}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 hover:border-[var(--brand)]/40"
              >
                <p className="yt-muted text-xs">#{index + 1} recently watched</p>
                <h3 className="mt-1 line-clamp-2 text-sm font-semibold">{video.title}</h3>
                <p className="yt-muted mt-1 line-clamp-2 text-xs">{video.description || "Continue watching this video."}</p>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
