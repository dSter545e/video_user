"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { FiSearch, FiSun, FiMoon, FiMenu, FiX, FiGrid, FiUser } from "react-icons/fi";
import { VIEWER_AUTH_CHANGED_EVENT, getViewerUser, ViewerUser } from "../lib/auth";

type ThemeMode = "light" | "dark";

const Logo = ({ compact = false, onError }: { compact?: boolean; onError: () => void }) => (
  <Link href="/" className="flex shrink-0 items-center font-bold" aria-label="Go to home">
    <div
      className={`flex items-center justify-center ${compact ? "h-[35px] w-[135px]" : "h-[42px] w-[162px]"}`}
    >
      <Image
        src="/logo.png"
        alt="xHub4u logo"
        width={270}
        height={70}
        priority
        className="w-full object-contain"
        style={{ height: "auto" }}
        onError={onError}
      />
    </div>
  </Link>
);

export default function UserHeader() {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewer, setViewer] = useState<ViewerUser | null>(null);
  const [logoUnavailable, setLogoUnavailable] = useState(false);

  const applyTheme = (nextTheme: ThemeMode) => {
    document.documentElement.setAttribute("data-theme", nextTheme);
    document.documentElement.style.colorScheme = nextTheme;
    document.body.setAttribute("data-theme", nextTheme);
  };

  useEffect(() => {
    const storedTheme = (localStorage.getItem("user_theme") as ThemeMode | null) || "light";
    setTheme(storedTheme);
    applyTheme(storedTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const syncViewer = () => setViewer(getViewerUser());
    syncViewer();
    window.addEventListener(VIEWER_AUTH_CHANGED_EVENT, syncViewer);
    window.addEventListener("storage", syncViewer);
    return () => {
      window.removeEventListener(VIEWER_AUTH_CHANGED_EVENT, syncViewer);
      window.removeEventListener("storage", syncViewer);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("user_theme", nextTheme);
    applyTheme(nextTheme);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setMobileMenuOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const searchForm = (variant: "desktop" | "mobile") => (
    <form
      onSubmit={handleSearch}
      className={variant === "desktop" ? "flex w-full max-w-2xl items-center gap-2" : "space-y-2"}
    >
      <div className={`relative ${variant === "desktop" ? "min-w-0 flex-1" : "w-full"}`}>
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 yt-muted" />
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="yt-input w-full rounded-full py-2 pl-9 pr-4 text-sm outline-none"
          placeholder="Search by video ID, title, or category"
        />
      </div>
      <button
        type="submit"
        className={
          variant === "desktop"
            ? "shrink-0 rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-white"
            : "w-full rounded-full bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white"
        }
      >
        Search
      </button>
    </form>
  );

  const accountActions = (showLabel = false) => (
    <>
      {showLabel ? (
        <span className="yt-muted hidden text-sm xl:inline">{viewer ? `Hi, ${viewer.name}` : "Guest"}</span>
      ) : null}
      {viewer ? (
        <Link
          href="/dashboard"
          className="rounded-full border border-[var(--border)] p-2 text-sm hover:bg-[var(--surface-muted)]"
          aria-label="Dashboard"
          title="Dashboard"
        >
          <FiGrid />
        </Link>
      ) : (
        <Link
          href="/auth/login"
          className="rounded-full border border-[var(--border)] p-2 text-sm hover:bg-[var(--surface-muted)]"
          aria-label="Login"
          title="Login"
        >
          <FiUser />
        </Link>
      )}
      <button
        onClick={toggleTheme}
        className="rounded-full border border-[var(--border)] p-2 text-sm hover:bg-[var(--surface-muted)]"
        aria-label="Toggle theme"
      >
        {theme === "light" ? <FiMoon /> : <FiSun />}
      </button>
    </>
  );

  return (
    <header className="yt-header">
      <div className="mx-auto max-w-[1400px] px-3 py-3 sm:px-6">
        <div className="hidden items-center gap-4 lg:flex">
          {logoUnavailable ? (
            <Link href="/" className="shrink-0 text-sm font-bold">
              xHub4u
            </Link>
          ) : (
            <Logo onError={() => setLogoUnavailable(true)} />
          )}

          <div className="flex min-w-0 flex-1 justify-center px-2">{searchForm("desktop")}</div>

          <nav className="flex shrink-0 items-center gap-1 text-sm">
            <Link href="/" className="rounded px-3 py-2 hover:bg-[var(--surface-muted)]">
              Home
            </Link>
            <Link href="/categories" className="rounded px-3 py-2 hover:bg-[var(--surface-muted)]">
              Categories
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">{accountActions(true)}</div>
        </div>

        <div className="flex items-center justify-between gap-3 lg:hidden">
          {logoUnavailable ? (
            <Link href="/" className="text-sm font-bold">
              xHub4u
            </Link>
          ) : (
            <Logo compact onError={() => setLogoUnavailable(true)} />
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-full border border-[var(--border)] p-2 text-sm hover:bg-[var(--surface-muted)]"
              aria-label="Open menu"
            >
              <FiMenu />
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen ? (
        <button
          className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
          aria-label="Close menu overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed right-0 top-0 z-[70] h-full w-[300px] max-w-[85vw] border-l border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-lg font-semibold">Menu</p>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-full p-2 hover:bg-[var(--surface-muted)]"
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>

        <div className="mb-5">{searchForm("mobile")}</div>

        <nav className="mb-5 space-y-1 text-sm">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded px-3 py-2 hover:bg-[var(--surface-muted)]"
          >
            Home
          </Link>
          <Link
            href="/categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded px-3 py-2 hover:bg-[var(--surface-muted)]"
          >
            Categories
          </Link>
        </nav>

        <div className="flex items-center gap-2">{accountActions(false)}</div>
      </aside>
    </header>
  );
}
