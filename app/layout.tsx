import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import UserHeader from "../components/UserHeader";
import UserFooter from "../components/UserFooter";
import DeferredClientShell from "../components/DeferredClientShell";
import { AuthProvider } from "../components/AuthProvider";
import MobileGridProvider from "../components/MobileGridProvider";
import ThemeProvider from "../components/ThemeProvider";
import SiteAdShell from "../components/SiteAdShell";
import ThemeInit from "../components/ThemeInit";
import { getMediaApiUrl, getPublicApiUrl, logApiConfigWarnings } from "../lib/apiConfig";
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
  const apiBaseUrl = getPublicApiUrl();
  const mediaApiBaseUrl = getMediaApiUrl();

  logApiConfigWarnings();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="api-base-url" content={apiBaseUrl} />
        <meta name="media-api-base-url" content={mediaApiBaseUrl} />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <ThemeInit />
        <AuthProvider>
          <ThemeProvider>
            <MobileGridProvider>
              <div className="yt-shell">
                <DeferredClientShell />
                <UserHeader />
                <SiteAdShell>{children}</SiteAdShell>
                <UserFooter />
              </div>
            </MobileGridProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
