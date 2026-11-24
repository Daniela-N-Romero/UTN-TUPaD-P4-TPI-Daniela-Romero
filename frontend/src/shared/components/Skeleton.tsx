interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = "h-4 w-full", count = 1 }: SkeletonProps) {
  return (
    <div className="space-y-2.5" aria-busy="true" aria-label="Cargando contenido">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-800 ${className}`.trim()}
        />
      ))}
    </div>
  );
}