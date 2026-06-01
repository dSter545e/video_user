import ReportRemovalClient from "./ReportRemovalClient";
import { buildPageMetadata } from "../../lib/pageMetadata";
import { SEO } from "../../lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  title: "Video Removal Request",
  description: `Submit a request to remove a video from ${SEO.siteName}.`,
  canonicalPath: "/report-removal",
});

export default function ReportRemovalPage() {
  return <ReportRemovalClient />;
}
