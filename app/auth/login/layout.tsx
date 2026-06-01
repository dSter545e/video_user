import { buildPageMetadata } from "../../../lib/pageMetadata";
import { SEO } from "../../../lib/seo";

export const metadata = buildPageMetadata({
  title: "Login",
  description: `Sign in to your ${SEO.siteName} account.`,
  canonicalPath: "/auth/login",
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
