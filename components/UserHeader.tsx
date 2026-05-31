"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FiSearch, FiSun, FiMoon, FiMenu, FiX, FiGrid, FiUser } from "react-icons/fi";
import { VIEWER_AUTH_CHANGED_EVENT, getViewerUser, ViewerUser } from "../lib/auth";

type ThemeMode = "light" | "dark";

export default function UserHeader() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [searchType, setSearchType] = useState("title");
  const [menuOpen, setMenuOpen] = useState(false);
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

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("user_theme", nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <header className="yt-header">
      <div className="mx-auto max-w-[1400px] px-3 py-3 sm:px-6">
        <div className="hidden items-center lg:grid lg:grid-cols-3">
          <div className="flex justify-start">
            <Link href="/" className="flex items-center gap-2 font-bold" aria-label="Go to home">
              {logoUnavailable ? (
                <span className="text-sm">xHub4u</span>
              ) : (
                <div className="flex h-[42px] w-[162px] items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="xHub4u logo"
                    width={270}
                    height={70}
                    priority
                    className="w-full object-contain"
                    style={{ height: "auto" }}
                    onError={() => setLogoUnavailable(true)}
                  />
                </div>
              )}
            </Link>
          </div>

          <nav className="flex items-center justify-center gap-2 text-sm">
            <Link href="/" className="rounded px-3 py-2 hover:bg-[var(--surface-muted)]">
              Home
            </Link>
            <Link href="/categories" className="rounded px-3 py-2 hover:bg-[var(--surface-muted)]">
              Categories
            </Link>
          </nav>

          <div className="flex items-center justify-end gap-2">
            <span className="yt-muted text-sm">{viewer ? `Hi, ${viewer.name}` : "Guest"}</span>
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
              onClick={() => setMenuOpen(true)}
              className="rounded-full border border-[var(--border)] p-2 text-sm hover:bg-[var(--surface-muted)]"
              aria-label="Open search"
            >
              <FiSearch />
            </button>
            <button
              onClick={toggleTheme}
              className="rounded-full border border-[var(--border)] p-2 text-sm hover:bg-[var(--surface-muted)]"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <FiMoon /> : <FiSun />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 lg:hidden">
          <Link href="/" className="flex items-center gap-2 font-bold" aria-label="Go to home">
            {logoUnavailable ? (
              <span className="text-sm">xHub4u</span>
            ) : (
              <div className="flex h-[35px] w-[135px] items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="xHub4u logo"
                  width={270}
                  height={70}
                  priority
                  className="w-full object-contain"
                  style={{ height: "auto" }}
                  onError={() => setLogoUnavailable(true)}
                />
              </div>
            )}
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-full border border-[var(--border)] p-2 text-sm hover:bg-[var(--surface-muted)]"
              aria-label="Open search"
            >
              <FiSearch />
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-full border border-[var(--border)] p-2 text-sm hover:bg-[var(--surface-muted)]"
              aria-label="Open menu"
            >
              <FiMenu />
            </button>
          </div>
        </div>
      </div>

      {menuOpen ? (
        <button
          className="fixed inset-0 z-[60] bg-black/40"
          aria-label="Close menu overlay"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed right-0 top-0 z-[70] h-full w-[300px] max-w-[85vw] border-l border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-lg font-semibold">Menu</p>
          <button
            onClick={() => setMenuOpen(false)}
            className="rounded-full p-2 hover:bg-[var(--surface-muted)]"
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>

        <div className="mb-5 space-y-2">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 yt-muted" />
            <input
              className="yt-input w-full rounded-full py-2 pl-9 pr-4 text-sm outline-none"
              placeholder="Search videos (UI only)"
            />
          </div>
          <select
            value={searchType}
            onChange={(event) => setSearchType(event.target.value)}
            className="yt-input w-full rounded-full px-3 py-2 text-sm outline-none"
          >
            <option value="title">Title</option>
            <option value="category">Category</option>
            <option value="latest">Latest</option>
          </select>
        </div>

        <nav className="mb-5 space-y-1 text-sm lg:hidden">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="block rounded px-3 py-2 hover:bg-[var(--surface-muted)]"
          >
            Home
          </Link>
          <Link
            href="/categories"
            onClick={() => setMenuOpen(false)}
            className="block rounded px-3 py-2 hover:bg-[var(--surface-muted)]"
          >
            Categories
          </Link>
        </nav>

        <button
          onClick={toggleTheme}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
        >
          {theme === "light" ? <FiMoon /> : <FiSun />}
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
      </aside>
    </header>
  );
}
