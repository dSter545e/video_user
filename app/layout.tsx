import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import UserHeader from "../components/UserHeader";
import UserFooter from "../components/UserFooter";
import UserAnalyticsTracker from "../components/UserAnalyticsTracker";
import { AuthProvider } from "../components/AuthProvider";
import AgeGateModal from "../components/AgeGateModal";
import SiteAdShell from "../components/SiteAdShell";
import { SEO, absoluteUrl } from "../lib/seo";
import { getSiteVerificationMetadata } from "../lib/siteVerification";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteVerification = getSiteVerificationMetadata();

export const metadata: Metadata = {
  metadataBase: new URL(SEO.siteUrl),
  title: {
    default: SEO.defaultTitle,
    template: `%s | ${SEO.siteName}`,
  },
  description: SEO.defaultDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
    siteName: SEO.siteName,
    url: SEO.siteUrl,
    images: [{ url: absoluteUrl(SEO.defaultImage) }],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO.defaultTitle,
    description: SEO.defaultDescription,
    images: [absoluteUrl(SEO.defaultImage)],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  ...siteVerification,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <AuthProvider>
          <div className="yt-shell">
            <AgeGateModal />
            <UserAnalyticsTracker />
            <UserHeader />
            <SiteAdShell>{children}</SiteAdShell>
            <UserFooter />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
