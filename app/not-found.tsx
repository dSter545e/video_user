import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center justify-center px-4 py-12">
      <div className="yt-card w-full rounded-xl p-8 text-center">
        <p className="yt-muted text-sm font-semibold">404</p>
        <h1 className="mt-2 text-3xl font-bold">Page Not Found</h1>
        <p className="yt-muted mt-3 text-sm">The page you are looking for does not exist or may have been moved.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="yt-link text-sm font-semibold">
            Go to Home
          </Link>
          <Link href="/dashboard" className="yt-link text-sm font-semibold">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
