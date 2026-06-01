import Link from "next/link";
import { buildPageMetadata } from "../../lib/pageMetadata";
import { SEO } from "../../lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Cookie Policy",
  description: `Cookie policy for ${SEO.siteName}, including age verification and preferences on our adult platform.`,
  canonicalPath: "/cookie-policy",
});

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1000px] px-3 py-6 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Cookie Policy</h1>
      <p className="yt-muted mt-2 text-sm">Last updated: June 1, 2026</p>

      <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">Adults-only website</h2>
        <p className="yt-muted mt-2 text-sm leading-relaxed">
          {SEO.siteName} is an adult video platform. Cookies and similar technologies help us confirm that visitors are adults,
          remember your preferences, and operate a safe experience for users accessing mature content. This policy explains how we
          use these technologies in connection with our 18+ service.
        </p>
      </div>

      <div className="mt-6 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">What Are Cookies</h2>
          <p className="yt-muted text-sm leading-relaxed">
            Cookies are small text files stored on your device that help websites remember preferences and improve user experience.
            On an adult site, they may also be used to record that you have confirmed you are of legal age to view explicit content.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">How We Use Cookies</h2>
          <p className="yt-muted text-sm leading-relaxed">
            We use cookies and similar technologies to: verify age before showing adult content; keep sessions active; remember display
            and theme settings; measure feature usage and traffic; improve video recommendations; and support security and fraud
            prevention. Some cookies are set by third-party partners (for example, analytics or advertising providers) when you
            interact with embedded content or ads on the site.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Types of Cookies</h2>
          <ul className="yt-muted list-inside list-disc space-y-1 text-sm leading-relaxed">
            <li>
              <strong className="text-[var(--foreground)]">Essential cookies</strong> — required for core functionality, including
              age-gate confirmation and secure login.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Preference cookies</strong> — remember settings such as theme, language, or
              layout on the adult platform.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Analytics cookies</strong> — help us understand how visitors use the site
              so we can improve performance and content discovery.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Advertising cookies</strong> — may be used where third-party ads are shown;
              these partners may use cookies under their own policies.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Age Verification Cookie</h2>
          <p className="yt-muted text-sm leading-relaxed">
            When you confirm that you are 18 or older, we may store a cookie (for example, <code className="text-xs">xhub4u_age_gate</code>)
            so you are not asked on every visit. If you indicate you are under 18, we may store a value that prevents access to adult
            content. You can clear this cookie in your browser settings; you will need to confirm your age again on your next visit.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Managing Cookies</h2>
          <p className="yt-muted text-sm leading-relaxed">
            You can control or delete cookies through your browser settings. Disabling essential cookies may prevent age verification
            from working and block access to adult videos. Disabling analytics or advertising cookies may reduce personalization but
            will not necessarily stop all mature content from being displayed once you have passed the age gate.
          </p>
        </section>
      </div>

      <p className="yt-muted mt-4 text-sm">
        See also:{" "}
        <Link href="/privacy-policy" className="yt-link">
          Privacy Policy
        </Link>
        ,{" "}
        <Link href="/terms-and-conditions" className="yt-link">
          Terms and Conditions
        </Link>
      </p>

      <Link href="/" className="yt-link mt-5 inline-block text-sm font-semibold">
        Back to Home
      </Link>
    </main>
  );
}
