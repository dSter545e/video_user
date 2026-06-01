type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`skeleton ${className}`.trim()} aria-hidden />;
}

export function SkeletonText({ className = "" }: SkeletonProps) {
  return <Skeleton className={`h-4 rounded ${className}`.trim()} />;
}
