import { cn } from '@/lib/utils';

/** Bloc de chargement neutre, utilise pendant la recuperation des donnees. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-xl bg-muted', className)}
      {...props}
    />
  );
}
