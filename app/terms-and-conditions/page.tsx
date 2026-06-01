import { Metadata } from "next";
import Link from "next/link";
import { SEO, absoluteUrl } from "../../lib/seo";

const pagePath = "/terms-and-conditions";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: `Terms of use for ${SEO.siteName}, an adults-only video platform with mature and explicit content.`,
  alternates: { canonical: pagePath },
  openGraph: {
    title: `Terms and Conditions | ${SEO.siteName}`,
    description: `Terms of use for ${SEO.siteName}, an adults-only video platform.`,
    url: absoluteUrl(pagePath),
  },
  twitter: {
    title: `Terms and Conditions | ${SEO.siteName}`,
    description: `Terms of use for ${SEO.siteName}, an adults-only video platform.`,
  },
};

export default function TermsAndConditionsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1000px] px-3 py-6 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Terms and Conditions</h1>
      <p className="yt-muted mt-2 text-sm">Last updated: June 1, 2026</p>

      <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">Adult website — 18+ only</h2>
        <p className="yt-muted mt-2 text-sm leading-relaxed">
          {SEO.siteName} is an adult entertainment website. The service contains sexually explicit nudity, adult themes, and other
          mature material that is not suitable for minors. You must be at least 18 years old (or the legal age of majority in your
          country) to access or use this platform. By entering or using the site, you represent that you meet this requirement and that
          viewing adult content is permitted in your location.
        </p>
      </div>

      <div className="mt-6 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Acceptance of Terms</h2>
          <p className="yt-muted text-sm leading-relaxed">
            By using this platform, you agree to these terms and acknowledge that you are accessing an adult-oriented service. If you
            do not agree, or if you are under the age of 18, you must not use the service and must leave the site immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Adult Content</h2>
          <p className="yt-muted text-sm leading-relaxed">
            Videos and related materials on {SEO.siteName} may depict sexually explicit conduct, nudity, or other adult subject matter.
            All content is intended for consenting adult audiences. You access such material voluntarily and at your own discretion.
            We do not guarantee that any particular video matches your expectations or preferences.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Prohibited Use</h2>
          <p className="yt-muted text-sm leading-relaxed">
            You agree not to: (a) allow minors to access your account or this site; (b) upload, share, or promote illegal content,
            including child sexual abuse material, non-consensual content, or content that violates applicable law; (c) misuse the
            platform, harass others, or infringe intellectual property rights; or (d) attempt to circumvent age verification or
            geographic restrictions. We may remove content and terminate accounts that violate these rules.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">User Responsibilities</h2>
          <p className="yt-muted text-sm leading-relaxed">
            You are responsible for the content and activity associated with your account, for keeping your login credentials secure,
            and for ensuring your use complies with local laws regarding adult material. You understand that adult content may be
            offensive to some viewers and waive any claim against us arising from your voluntary access to such material, except where
            prohibited by law.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Content Removal</h2>
          <p className="yt-muted text-sm leading-relaxed">
            If you believe a video should be removed (for example, due to copyright, privacy, or legal concerns), you may submit a
            request through our{" "}
            <Link href="/report-removal" className="yt-link">
              Video Removal Request
            </Link>{" "}
            page. We review reports in good faith but do not guarantee removal in every case.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Content and Intellectual Property</h2>
          <p className="yt-muted text-sm leading-relaxed">
            Platform branding, design, and software are protected by intellectual property laws. Third-party videos and thumbnails
            remain the property of their respective rights holders. You may not copy, distribute, or reuse protected content without
            permission.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Service Availability</h2>
          <p className="yt-muted text-sm leading-relaxed">
            We may update, suspend, or discontinue any part of the service at any time. We do not guarantee uninterrupted availability
            of adult content or any specific catalog of videos.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Limitation of Liability</h2>
          <p className="yt-muted text-sm leading-relaxed">
            To the maximum extent permitted by law, we are not liable for indirect or consequential damages arising from use of the
            platform, including damages related to your access to or reliance on adult content. Nothing in these terms limits liability
            where it cannot be excluded under applicable law.
          </p>
        </section>
      </div>

      <p className="yt-muted mt-4 text-sm">
        See also:{" "}
        <Link href="/privacy-policy" className="yt-link">
          Privacy Policy
        </Link>
        ,{" "}
        <Link href="/cookie-policy" className="yt-link">
          Cookie Policy
        </Link>
      </p>

      <Link href="/" className="yt-link mt-5 inline-block text-sm font-semibold">
        Back to Home
      </Link>
    </main>
  );
}
