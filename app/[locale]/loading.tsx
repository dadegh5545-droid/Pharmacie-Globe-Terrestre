import { Skeleton } from '@/components/ui/skeleton';

/** Squelette de chargement generique des pages du site. */
export default function Loading() {
  return (
    <div className="container py-12">
      <Skeleton className="h-10 w-2/3 max-w-sm" />
      <Skeleton className="mt-4 h-5 w-full max-w-lg" />
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-[340px]" />
        ))}
      </div>
    </div>
  );
}
