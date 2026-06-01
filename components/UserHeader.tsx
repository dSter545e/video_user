"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useLayoutEffect, useState } from "react";
import { FiSun, FiMoon, FiMenu, FiX, FiGrid, FiUser } from "react-icons/fi";
import { VIEWER_AUTH_CHANGED_EVENT, getViewerUser, ViewerUser } from "../lib/auth";
import {
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  persistTheme,
  readThemeFromDocument,
  ThemeMode,
} from "../lib/theme";
import HeaderSearchBar from "./HeaderSearchBar";
import HeaderSearchDropdown from "./HeaderSearchDropdown";
import MobileGridSidebarControl from "./MobileGridSidebarControl";

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
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewer, setViewer] = useState<ViewerUser | null>(null);
  const [logoUnavailable, setLogoUnavailable] = useState(false);

  useLayoutEffect(() => {
    setTheme(readThemeFromDocument());
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (getStoredTheme()) return;
      const next = getSystemTheme();
      setTheme(next);
      applyTheme(next);
    };

    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

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
    persistTheme(nextTheme);
    applyTheme(nextTheme);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

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

  const logoNode = logoUnavailable ? (
    <Link href="/" className="shrink-0 text-sm font-bold">
      xHub4u
    </Link>
  ) : (
    <Logo onError={() => setLogoUnavailable(true)} />
  );

  return (
    <header className="yt-header">
      <div className="mx-auto max-w-[1400px] px-3 py-3 sm:px-6">
        <div className="hidden items-center gap-4 lg:flex">
          {logoNode}
          <div className="flex min-w-0 flex-1 justify-center px-2">
            <HeaderSearchBar />
          </div>
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
          <div className="min-w-0 shrink-0">
            {logoUnavailable ? logoNode : <Logo compact onError={() => setLogoUnavailable(true)} />}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <HeaderSearchDropdown onNavigate={closeMobileMenu} dropdownAlign="right" />
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
          onClick={closeMobileMenu}
        />
      ) : null}

      <aside
        className={`fixed right-0 top-0 z-[70] h-full w-[300px] max-w-[85vw] border-l border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="text-lg font-semibold">Menu</p>
          <button
            onClick={closeMobileMenu}
            className="shrink-0 rounded-full p-2 hover:bg-[var(--surface-muted)]"
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>

        <MobileGridSidebarControl />

        <nav className="mb-5 space-y-1 text-sm">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="block rounded px-3 py-2 hover:bg-[var(--surface-muted)]"
          >
            Home
          </Link>
          <Link
            href="/categories"
            onClick={closeMobileMenu}
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
