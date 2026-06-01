import { buildPageMetadata } from "../../../lib/pageMetadata";
import { SEO } from "../../../lib/seo";

export const metadata = buildPageMetadata({
  title: "Forgot Password",
  description: `Reset your ${SEO.siteName} account password.`,
  canonicalPath: "/auth/forgot-password",
});

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
