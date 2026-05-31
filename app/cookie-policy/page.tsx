import { Metadata } from "next";
import Link from "next/link";
import { SEO, absoluteUrl } from "../../lib/seo";

const pagePath = "/cookie-policy";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `Learn how ${SEO.siteName} uses cookies and similar technologies.`,
  alternates: { canonical: pagePath },
  openGraph: {
    title: `Cookie Policy | ${SEO.siteName}`,
    description: `Learn how ${SEO.siteName} uses cookies and similar technologies.`,
    url: absoluteUrl(pagePath),
  },
  twitter: {
    title: `Cookie Policy | ${SEO.siteName}`,
    description: `Learn how ${SEO.siteName} uses cookies and similar technologies.`,
  },
};

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1000px] px-3 py-6 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Cookie Policy</h1>
      <p className="yt-muted mt-2 text-sm">Last updated: May 7, 2026</p>

      <div className="mt-6 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">What Are Cookies</h2>
          <p className="yt-muted text-sm">
            Cookies are small text files stored on your device that help websites remember preferences and improve user experience.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">How We Use Cookies</h2>
          <p className="yt-muted text-sm">
            We use cookies and similar technologies to keep sessions active, remember settings, measure feature usage, and improve video
            recommendations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Types of Cookies</h2>
          <p className="yt-muted text-sm">
            Essential cookies are required for core functionality. Performance cookies help us understand traffic and improve reliability.
            Preference cookies remember display and interaction settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Managing Cookies</h2>
          <p className="yt-muted text-sm">
            You can control cookies through your browser settings. Disabling some cookies may affect certain features of the platform.
          </p>
        </section>
      </div>

      <Link href="/" className="yt-link mt-5 inline-block text-sm font-semibold">
        Back to Home
      </Link>
    </main>
  );
}
