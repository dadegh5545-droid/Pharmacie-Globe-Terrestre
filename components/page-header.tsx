import { cn } from '@/lib/utils';

/** Bandeau de titre commun aux pages interieures. */
export function PageHeader({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('border-b border-border bg-gradient-to-b from-muted/70 to-background', className)}>
      <div className="container py-10 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}
