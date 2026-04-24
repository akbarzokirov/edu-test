import { cn } from "../../utils/helpers";

export const Skeleton = ({ className = "", style }) => (
  <div className={cn("animate-pulse bg-ink-100 rounded-md", className)} style={style} />
);

export const SkeletonText = ({ lines = 3, className = "" }) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className="h-3" style={{ width: `${60 + ((i * 17) % 40)}%` }} />
    ))}
  </div>
);

export const SkeletonCard = ({ className = "" }) => (
  <div className={cn("card p-5", className)}>
    <Skeleton className="h-4 w-24 mb-3" />
    <Skeleton className="h-8 w-20 mb-4" />
    <Skeleton className="h-3 w-full mb-2" />
    <Skeleton className="h-3 w-3/4" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="card">
    <div className="p-4 border-b border-ink-100"><Skeleton className="h-4 w-48" /></div>
    <div className="divide-y divide-ink-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);
export default Skeleton;
