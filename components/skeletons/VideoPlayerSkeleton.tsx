import { Skeleton } from "./Skeleton";

export default function VideoPlayerSkeleton() {
  return (
    <div className="watch-player-frame watch-player-skeleton" aria-hidden>
      <div className="watch-player-skeleton__stage relative h-full min-h-[inherit] w-full bg-black">
        <div className="watch-player-skeleton__shine absolute inset-0" />

        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="watch-player-skeleton__play h-14 w-14 rounded-full" />
        </div>

        <div className="watch-player-skeleton__controls absolute inset-x-0 bottom-0 px-3 pb-3 pt-10">
          <Skeleton className="watch-player-skeleton__progress mb-2.5 h-1 w-full rounded-full" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="watch-player-skeleton__control h-7 w-7 rounded-full" />
              <Skeleton className="watch-player-skeleton__control h-3 w-14 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="watch-player-skeleton__control h-7 w-12 rounded" />
              <Skeleton className="watch-player-skeleton__control h-7 w-7 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
