import Link from "next/link";
import Image from "next/image";
import { Video } from "../lib/types";
import { getVideoPosterUrl } from "../lib/videoPoster";

type RelatedVideoItemProps = {
  video: Video;
};

const formatViews = (count?: number) => {
  const value = count || 0;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M views`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K views`;
  return `${value} views`;
};

export default function RelatedVideoItem({ video }: RelatedVideoItemProps) {
  const href = `/videos/${video.slug || video._id}`;
  const posterUrl = getVideoPosterUrl(video);

  return (
    <Link href={href} className="related-video-item group flex gap-2 py-2">
      <div className="related-video-item__thumb relative aspect-video w-[42%] max-w-[168px] shrink-0 overflow-hidden bg-black">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt=""
            fill
            unoptimized
            className="object-cover"
            sizes="168px"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <h3 className="related-video-item__title line-clamp-2 text-sm font-medium leading-snug text-[var(--foreground)] group-hover:text-[var(--brand)]">
          {video.title}
        </h3>
        <p className="yt-muted mt-1 text-xs">{video.category?.name || "General"}</p>
        <p className="yt-muted text-xs">{formatViews(video.viewsCount)}</p>
      </div>
    </Link>
  );
}
