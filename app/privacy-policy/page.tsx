import Link from "next/link";
import { buildPageMetadata } from "../../lib/pageMetadata";
import { SEO } from "../../lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: `Privacy policy for ${SEO.siteName}, an adults-only video platform. Learn how we handle your data.`,
  canonicalPath: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1000px] px-3 py-6 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Privacy Policy</h1>
      <p className="yt-muted mt-2 text-sm">Last updated: June 1, 2026</p>

      <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">Adults-only website</h2>
        <p className="yt-muted mt-2 text-sm leading-relaxed">
          {SEO.siteName} is an adult-oriented video platform. We host and display sexually explicit and other mature content intended
          solely for viewers who are at least 18 years of age (or the age of majority in their jurisdiction, whichever is higher). By
          using this site, you confirm that you meet this age requirement and that accessing adult material is legal where you are
          located.
        </p>
      </div>

      <div className="mt-6 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Information We Collect</h2>
          <p className="yt-muted text-sm leading-relaxed">
            We may collect account information such as your name and email, usage information like watched videos and interactions
            (including viewing history on adult content), and technical data such as device and browser details. Age-verification
            choices may be stored locally on your device (for example, via cookies) to remember that you confirmed you are an adult.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">How We Use Information</h2>
          <p className="yt-muted text-sm leading-relaxed">
            We use information to provide and improve the platform, personalize video recommendations (including mature content you
            have shown interest in), secure user accounts, enforce our age and content policies, and respond to support or removal
            requests.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Adult Content and Sensitive Data</h2>
          <p className="yt-muted text-sm leading-relaxed">
            Because this is an adult site, some data we process relates to your access to sexually explicit or otherwise mature
            material. We treat this information as sensitive and use it only for purposes described in this policy. We do not knowingly
            collect personal information from anyone under 18. If we learn that a minor has provided data or accessed the service, we
            will take steps to delete that information and restrict access.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Data Sharing</h2>
          <p className="yt-muted text-sm leading-relaxed">
            We do not sell personal data. Information may be shared with trusted service providers only to operate the platform (such
            as hosting, analytics, or payment processors where applicable) and with legal authorities when required by law, including in
            connection with illegal content reports or age-related compliance obligations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Data Security</h2>
          <p className="yt-muted text-sm leading-relaxed">
            We apply reasonable administrative and technical safeguards to protect your data. No method of storage or transfer is fully
            secure, so we cannot guarantee absolute security.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Your Choices</h2>
          <p className="yt-muted text-sm leading-relaxed">
            You can update account details, manage your content activity, or request account deletion by contacting support through the
            platform channels. You may clear age-verification and preference cookies in your browser; doing so may require you to
            confirm your age again before viewing adult content.
          </p>
        </section>
      </div>

      <p className="yt-muted mt-4 text-sm">
        See also:{" "}
        <Link href="/terms-and-conditions" className="yt-link">
          Terms and Conditions
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
