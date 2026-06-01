import { buildPageMetadata } from "../../../lib/pageMetadata";
import { SEO } from "../../../lib/seo";

export const metadata = buildPageMetadata({
  title: "Sign Up",
  description: `Create a ${SEO.siteName} account.`,
  canonicalPath: "/auth/signup",
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
