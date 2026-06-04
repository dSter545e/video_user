"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CSSProperties, FormEvent, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { getPaginatedVideosApi } from "../lib/api";
import { Video } from "../lib/types";
import { getVideoPosterUrl } from "../lib/videoPoster";

type HeaderSearchDropdownProps = {
  onNavigate?: () => void;
  className?: string;
  /** Use in narrow sidebars so the panel stays on screen */
  dropdownAlign?: "left" | "right";
};

const DEBOUNCE_MS = 300;
const SUGGESTION_LIMIT = 6;
const PANEL_MAX_WIDTH = 416;
const VIEWPORT_GUTTER = 12;

const getPanelWidth = () =>
  typeof window === "undefined" ? PANEL_MAX_WIDTH : Math.min(window.innerWidth - VIEWPORT_GUTTER * 2, PANEL_MAX_WIDTH);

export default function HeaderSearchDropdown({
  onNavigate,
  className = "",
  dropdownAlign = "left",
}: HeaderSearchDropdownProps) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const goToSearchPage = useCallback(
    (rawQuery: string) => {
      const trimmed = rawQuery.trim();
      if (!trimmed) return;
      close();
      onNavigate?.();
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [close, onNavigate, router]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    goToSearchPage(query);
  };

  const updatePanelPosition = useCallback(() => {
    if (!rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const width = getPanelWidth();
    let left =
      dropdownAlign === "right"
        ? rect.right - width
        : rect.left;

    left = Math.max(VIEWPORT_GUTTER, Math.min(left, window.innerWidth - width - VIEWPORT_GUTTER));

    setPanelStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left,
      width,
      zIndex: 105,
    });
  }, [dropdownAlign]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);
    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const data = await getPaginatedVideosApi({ q: trimmed, page: 1, limit: SUGGESTION_LIMIT, sort: "recent" });
          if (cancelled) return;
          setResults(data.items || []);
          setHasSearched(true);
        } catch {
          if (!cancelled) {
            setResults([]);
            setHasSearched(true);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, open]);

  const videoHref = (video: Video) => `/videos/${video.slug || video._id}`;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full border border-[var(--border)] p-2 text-lg hover:bg-[var(--surface-muted)]"
        aria-label={open ? "Close search" : "Open search"}
        aria-expanded={open}
        aria-controls={listId}
      >
        {open ? <FiX /> : <FiSearch />}
      </button>

      {open ? (
        <div className="header-search-panel" style={panelStyle}>
          <form onSubmit={handleSubmit} className="p-3">
            <div className="relative flex items-center">
              <FiSearch
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 shrink-0 -translate-y-1/2 yt-muted"
                aria-hidden
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="yt-input block w-full rounded-full py-2.5 pl-10 pr-4 text-sm leading-normal outline-none"
                placeholder="Search by video ID, title, or category"
                aria-label="Search videos"
                autoComplete="off"
              />
            </div>
          </form>

          <div id={listId} className="max-h-[min(60vh,320px)] overflow-y-auto border-t border-[var(--border)]">
            {loading ? (
              <p className="yt-muted px-4 py-3 text-sm">Searching…</p>
            ) : !query.trim() ? (
              <p className="yt-muted px-4 py-3 text-sm">Type to find videos instantly.</p>
            ) : hasSearched && results.length === 0 ? (
              <p className="yt-muted px-4 py-3 text-sm">No videos found for &quot;{query.trim()}&quot;.</p>
            ) : (
              <ul className="py-1">
                {results.map((video) => {
                  const posterUrl = getVideoPosterUrl(video);
                  return (
                  <li key={video._id}>
                    <Link
                      href={videoHref(video)}
                      onClick={() => {
                        close();
                        onNavigate?.();
                      }}
                      className="flex gap-3 px-3 py-2 hover:bg-[var(--surface-muted)]"
                    >
                      <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded bg-[var(--surface-muted)]">
                        {posterUrl ? (
                          <Image
                            src={posterUrl}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium leading-snug">{video.title}</p>
                        <p className="yt-muted mt-0.5 truncate text-xs">
                          {video.videoId ? `${video.videoId} · ` : ""}
                          {video.category?.name || "Video"}
                        </p>
                      </div>
                    </Link>
                  </li>
                  );
                })}
              </ul>
            )}

            {query.trim() ? (
              <button
                type="button"
                onClick={() => goToSearchPage(query)}
                className="w-full border-t border-[var(--border)] px-4 py-3 text-left text-sm font-semibold text-[var(--brand)] hover:bg-[var(--surface-muted)]"
              >
                See all results for &quot;{query.trim()}&quot;
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
