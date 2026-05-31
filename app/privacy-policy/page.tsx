import { Metadata } from "next";
import Link from "next/link";
import { SEO, absoluteUrl } from "../../lib/seo";

const pagePath = "/privacy-policy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Read how ${SEO.siteName} collects, uses, and protects your information.`,
  alternates: { canonical: pagePath },
  openGraph: {
    title: `Privacy Policy | ${SEO.siteName}`,
    description: `Read how ${SEO.siteName} collects, uses, and protects your information.`,
    url: absoluteUrl(pagePath),
  },
  twitter: {
    title: `Privacy Policy | ${SEO.siteName}`,
    description: `Read how ${SEO.siteName} collects, uses, and protects your information.`,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1000px] px-3 py-6 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Privacy Policy</h1>
      <p className="yt-muted mt-2 text-sm">Last updated: May 7, 2026</p>

      <div className="mt-6 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Information We Collect</h2>
          <p className="yt-muted text-sm">
            We may collect account information such as your name and email, usage information like watched videos and interactions, and
            technical data such as device and browser details.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">How We Use Information</h2>
          <p className="yt-muted text-sm">
            We use information to provide and improve the platform, personalize video recommendations, secure user accounts, and respond
            to support requests.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Data Sharing</h2>
          <p className="yt-muted text-sm">
            We do not sell personal data. Information may be shared with trusted service providers only to operate the platform and with
            legal authorities when required by law.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Data Security</h2>
          <p className="yt-muted text-sm">
            We apply reasonable administrative and technical safeguards to protect your data. No method of storage or transfer is fully
            secure, so we cannot guarantee absolute security.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Your Choices</h2>
          <p className="yt-muted text-sm">
            You can update account details, manage your content activity, or request account deletion by contacting support through the
            platform channels.
          </p>
        </section>
      </div>

      <Link href="/" className="yt-link mt-5 inline-block text-sm font-semibold">
        Back to Home
      </Link>
    </main>
  );
}
