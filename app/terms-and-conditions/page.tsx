import { Metadata } from "next";
import Link from "next/link";
import { SEO, absoluteUrl } from "../../lib/seo";

const pagePath = "/terms-and-conditions";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: `Review the terms and conditions for using ${SEO.siteName}.`,
  alternates: { canonical: pagePath },
  openGraph: {
    title: `Terms and Conditions | ${SEO.siteName}`,
    description: `Review the terms and conditions for using ${SEO.siteName}.`,
    url: absoluteUrl(pagePath),
  },
  twitter: {
    title: `Terms and Conditions | ${SEO.siteName}`,
    description: `Review the terms and conditions for using ${SEO.siteName}.`,
  },
};

export default function TermsAndConditionsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1000px] px-3 py-6 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Terms and Conditions</h1>
      <p className="yt-muted mt-2 text-sm">Last updated: May 7, 2026</p>

      <div className="mt-6 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Acceptance of Terms</h2>
          <p className="yt-muted text-sm">
            By using this platform, you agree to these terms. If you do not agree, you should stop using the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">User Responsibilities</h2>
          <p className="yt-muted text-sm">
            You are responsible for the content and activity associated with your account. You agree not to misuse the platform or
            violate applicable laws.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Content and Intellectual Property</h2>
          <p className="yt-muted text-sm">
            Platform branding, design, and software are protected by intellectual property laws. You may not copy, distribute, or reuse
            protected content without permission.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Service Availability</h2>
          <p className="yt-muted text-sm">
            We may update, suspend, or discontinue any part of the service at any time. We do not guarantee uninterrupted availability.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Limitation of Liability</h2>
          <p className="yt-muted text-sm">
            To the maximum extent permitted by law, we are not liable for indirect or consequential damages arising from use of the
            platform.
          </p>
        </section>
      </div>

      <Link href="/" className="yt-link mt-5 inline-block text-sm font-semibold">
        Back to Home
      </Link>
    </main>
  );
}
