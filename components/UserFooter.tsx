import Link from "next/link";

export default function UserFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6">
        <div className="grid gap-6 text-sm md:grid-cols-3">
          <div>
            <h3 className="mb-2 text-base font-semibold">About</h3>
            <p className="yt-muted">
              xHub4u is a modern video platform to discover trending, latest, and category-based content.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold">Quick Link</h3>
            <div className="flex flex-col gap-2">
              <Link href="/" className="yt-link">
                Home
              </Link>
              <Link href="/videos" className="yt-link">
                Videos
              </Link>
              <Link href="/categories" className="yt-link">
                Categories
              </Link>
              <Link href="/auth/login" className="yt-link">
                Login
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold">Legal</h3>
            <div className="flex flex-col gap-2">
              <Link href="/privacy-policy" className="yt-link">
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="yt-link">
                Terms & Conditions
              </Link>
              <Link href="/cookie-policy" className="yt-link">
                Cookie Policy
              </Link>
              <Link href="/report-removal" className="yt-link">
                Video Removal Request
              </Link>
            </div>
          </div>
        </div>

        <p className="yt-muted mt-8 border-t border-[var(--border)] pt-4 text-sm">© {year} xHub4u. All rights reserved.</p>
      </div>
    </footer>
  );
}
