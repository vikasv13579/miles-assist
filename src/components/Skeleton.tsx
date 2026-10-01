interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-slate-100 ${className}`} />;
}

interface SkeletonRowsProps extends SkeletonProps {
  count?: number;
}

export function SkeletonRows({ count = 3, className = '' }: SkeletonRowsProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="h-8 w-full" />
      ))}
    </div>
  );
}