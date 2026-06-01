"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FiSun, FiMoon, FiMenu, FiX, FiGrid, FiUser, FiHome, FiFolder } from "react-icons/fi";
import { VIEWER_AUTH_CHANGED_EVENT, getViewerUser, ViewerUser } from "../lib/auth";
import HeaderSearchBar from "./HeaderSearchBar";
import HeaderSearchDropdown from "./HeaderSearchDropdown";
import MobileGridSidebarControl from "./MobileGridSidebarControl";
import MobileThemeSidebarControl from "./MobileThemeSidebarControl";
import { useTheme } from "./ThemeProvider";

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
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewer, setViewer] = useState<ViewerUser | null>(null);
  const [logoUnavailable, setLogoUnavailable] = useState(false);

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

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const accountActions = (options: { showLabel?: boolean; includeTheme?: boolean }) => (
    <>
      {options.showLabel ? (
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
      {options.includeTheme ? (
        <button
          onClick={toggleTheme}
          className="rounded-full border border-[var(--border)] p-2 text-sm hover:bg-[var(--surface-muted)]"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <FiMoon /> : <FiSun />}
        </button>
      ) : null}
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
          <div className="flex shrink-0 items-center gap-2">
            {accountActions({ showLabel: true, includeTheme: true })}
          </div>
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
          className="fixed inset-0 z-[110] bg-black/40 lg:hidden"
          aria-label="Close menu overlay"
          onClick={closeMobileMenu}
        />
      ) : null}

      <aside
        className={`fixed right-0 top-0 z-[120] h-full w-[300px] max-w-[85vw] border-l border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl transition-transform duration-300 lg:hidden ${
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

        <nav className="mobile-sidebar-nav">
          <Link href="/" onClick={closeMobileMenu} className="mobile-sidebar-nav__row mobile-sidebar-nav__row--link">
            <span className="mobile-sidebar-nav__row-main">
              <span className="mobile-sidebar-nav__row-icon" aria-hidden>
                <FiHome />
              </span>
              <span className="mobile-sidebar-nav__row-label">Home</span>
            </span>
          </Link>
          <Link href="/categories" onClick={closeMobileMenu} className="mobile-sidebar-nav__row mobile-sidebar-nav__row--link">
            <span className="mobile-sidebar-nav__row-main">
              <span className="mobile-sidebar-nav__row-icon" aria-hidden>
                <FiFolder />
              </span>
              <span className="mobile-sidebar-nav__row-label">Categories</span>
            </span>
          </Link>
          {viewer ? (
            <Link href="/dashboard" onClick={closeMobileMenu} className="mobile-sidebar-nav__row mobile-sidebar-nav__row--link">
              <span className="mobile-sidebar-nav__row-main">
                <span className="mobile-sidebar-nav__row-icon" aria-hidden>
                  <FiGrid />
                </span>
                <span className="mobile-sidebar-nav__row-label">Dashboard</span>
              </span>
            </Link>
          ) : (
            <Link href="/auth/login" onClick={closeMobileMenu} className="mobile-sidebar-nav__row mobile-sidebar-nav__row--link">
              <span className="mobile-sidebar-nav__row-main">
                <span className="mobile-sidebar-nav__row-icon" aria-hidden>
                  <FiUser />
                </span>
                <span className="mobile-sidebar-nav__row-label">Login</span>
              </span>
            </Link>
          )}
          <MobileThemeSidebarControl />
          <MobileGridSidebarControl />
        </nav>
      </aside>
    </header>
  );
}
