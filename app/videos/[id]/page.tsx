import Link from "next/link";
import VideoWatchClient from "../../../components/VideoWatchClient";
import { buildPageMetadata } from "../../../lib/pageMetadata";
import { SEO, absoluteUrl } from "../../../lib/seo";
import { getVideoPosterUrl } from "../../../lib/videoPoster";
import { getVideoById, getVideoComments } from "../../../lib/serverData";

export const revalidate = 30;

type VideoWatchPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: VideoWatchPageProps) {
  const { id } = await params;
  const video = await getVideoById(id);

  if (!video) {
    return buildPageMetadata({
      title: "Video Not Found",
      description: "Requested video could not be found.",
      canonicalPath: `/videos/${id}`,
    });
  }

  const path = `/videos/${video.slug || id}`;
  const description = video.description?.trim()
    ? video.description.slice(0, 160)
    : `Watch ${video.title} on ${SEO.siteName}.`;

  return buildPageMetadata({
    title: video.title,
    description,
    canonicalPath: path,
    ogImage: getVideoPosterUrl(video) || undefined,
    ogType: "video.other",
  });
}

export default async function VideoWatchPage({ params }: VideoWatchPageProps) {
  const { id } = await params;
  const [video, comments] = await Promise.all([getVideoById(id), getVideoComments(id)]);

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

  const posterUrl = getVideoPosterUrl(video);

  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description || `Watch ${video.title} on ${SEO.siteName}.`,
    thumbnailUrl: posterUrl ? [absoluteUrl(posterUrl)] : undefined,
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
