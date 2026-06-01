import { buildPageMetadata } from "../../../lib/pageMetadata";
import { SEO } from "../../../lib/seo";

export const metadata = buildPageMetadata({
  title: "Reset Password",
  description: `Choose a new password for your ${SEO.siteName} account.`,
  canonicalPath: "/auth/reset-password",
});

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
