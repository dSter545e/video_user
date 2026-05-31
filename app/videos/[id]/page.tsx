import { Metadata } from "next";
import Link from "next/link";
import VideoWatchClient from "../../../components/VideoWatchClient";
import { getVideoByIdApi, getVideoCommentsApi } from "../../../lib/api";
import { SEO, absoluteUrl } from "../../../lib/seo";

type VideoWatchPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: VideoWatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideoByIdApi(id);

  if (!video) {
    return {
      title: "Video Not Found",
      description: "Requested video could not be found.",
    };
  }

  const path = `/videos/${video.slug || id}`;
  const description = video.description?.trim()
    ? video.description.slice(0, 160)
    : `Watch ${video.title} on ${SEO.siteName}.`;

  return {
    title: video.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "video.other",
      title: video.title,
      description,
      url: absoluteUrl(path),
      images: video.thumbnail ? [{ url: absoluteUrl(video.thumbnail) }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: video.title,
      description,
      images: video.thumbnail ? [absoluteUrl(video.thumbnail)] : undefined,
    },
  };
}

export default async function VideoWatchPage({ params }: VideoWatchPageProps) {
  const { id } = await params;
  const video = await getVideoByIdApi(id);
  const comments = await getVideoCommentsApi(id);

  if (!video) {
    return (
      <main className="mx-auto w-full max-w-[1100px] px-3 py-6 sm:px-6">
        <p className="yt-card p-8 text-center yt-muted">Video not found.</p>
        <Link href="/" className="yt-link mt-4 inline-block text-sm font-semibold">
          Back to Home
        </Link>
      </main>
    );
  }

  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description || `Watch ${video.title} on ${SEO.siteName}.`,
    thumbnailUrl: video.thumbnail ? [absoluteUrl(video.thumbnail)] : undefined,
    uploadDate: video.createdAt,
    contentUrl: absoluteUrl(`/videos/${video.slug || video._id}`),
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: { "@type": "WatchAction" },
      userInteractionCount: video.viewsCount || 0,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }} />
      <VideoWatchClient initialVideo={video} initialComments={comments} />
    </>
  );
}
