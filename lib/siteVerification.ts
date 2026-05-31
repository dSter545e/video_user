import type { Metadata } from "next";

const trim = (value?: string) => (value || "").trim();

/**
 * Site verification meta tags from environment variables.
 *
 * Supported env vars:
 * - NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
 * - NEXT_PUBLIC_BING_SITE_VERIFICATION
 * - NEXT_PUBLIC_YANDEX_SITE_VERIFICATION
 * - NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION
 * - NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION
 * - NEXT_PUBLIC_SITE_VERIFICATION_META (JSON array: [{ "name": "...", "content": "..." }])
 */
export const getSiteVerificationMetadata = (): Pick<Metadata, "verification" | "other"> => {
  const verification: NonNullable<Metadata["verification"]> = {};
  const other: Record<string, string> = {};

  const google = trim(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION);
  if (google) verification.google = google;

  const yandex = trim(process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION);
  if (yandex) verification.yandex = yandex;

  const bing = trim(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION);
  if (bing) other["msvalidate.01"] = bing;

  const facebook = trim(process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION);
  if (facebook) other["facebook-domain-verification"] = facebook;

  const pinterest = trim(process.env.NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION);
  if (pinterest) other["p:domain_verify"] = pinterest;

  const rawMeta = trim(process.env.NEXT_PUBLIC_SITE_VERIFICATION_META);
  if (rawMeta) {
    try {
      const entries = JSON.parse(rawMeta) as Array<{ name?: string; content?: string }>;
      if (Array.isArray(entries)) {
        for (const entry of entries) {
          const name = trim(entry?.name);
          const content = trim(entry?.content);
          if (name && content) other[name] = content;
        }
      }
    } catch {
      // Ignore invalid JSON — verification codes are optional.
    }
  }

  const result: Pick<Metadata, "verification" | "other"> = {};
  if (Object.keys(verification).length) result.verification = verification;
  if (Object.keys(other).length) result.other = other;
  return result;
};
