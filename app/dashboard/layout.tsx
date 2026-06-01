import { buildPageMetadata } from "../../lib/pageMetadata";
import { SEO } from "../../lib/seo";

export const metadata = buildPageMetadata({
  title: "Dashboard",
  description: `Your ${SEO.siteName} watch history and account.`,
  canonicalPath: "/dashboard",
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
