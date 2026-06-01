import type { Metadata } from "next";
import { SEO, absoluteUrl } from "./seo";

/** Browser tab title with site name (matches root layout template). */
export const formatPageTitle = (pageTitle: string) => `${pageTitle} | ${SEO.siteName}`;

type PageMetadataOptions = {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: "website" | "video.other";
  /** Skip layout template — use for home default title only. */
  absoluteTitle?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  canonicalPath,
  ogImage,
  ogType = "website",
  absoluteTitle = false,
}: PageMetadataOptions): Metadata {
  const socialTitle = absoluteTitle ? title : formatPageTitle(title);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(canonicalPath ? { alternates: { canonical: canonicalPath } } : {}),
    openGraph: {
      type: ogType,
      title: socialTitle,
      description,
      siteName: SEO.siteName,
      ...(canonicalPath ? { url: absoluteUrl(canonicalPath) } : {}),
      ...(ogImage ? { images: [{ url: absoluteUrl(ogImage) }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: socialTitle,
      description,
      ...(ogImage ? { images: [absoluteUrl(ogImage)] } : {}),
    },
  };
}
