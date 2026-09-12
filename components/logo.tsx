import { cn } from '@/lib/utils';

/**
 * Logo temporaire — croix pharmaceutique inscrite dans un globe terrestre,
 * pour exprimer « santé + pharmacie + confiance internationale ».
 * À remplacer par le logo définitif de l'établissement lorsqu'il existera.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-hidden="true"
      className={cn('size-10', className)}
    >
      <defs>
        <linearGradient id="pgt-globe" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(172 65% 40%)" />
          <stop offset="100%" stopColor="hsl(164 80% 22%)" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="url(#pgt-globe)" />
      {/* Méridiens et parallèles : le globe. */}
      <g fill="none" stroke="white" strokeOpacity="0.38" strokeWidth="1.4">
        <ellipse cx="24" cy="24" rx="10" ry="22" />
        <path d="M2.6 17h42.8M2.6 31h42.8" />
      </g>
      {/* Croix pharmaceutique. */}
      <path
        d="M20.4 10.5h7.2v9.9h9.9v7.2h-9.9v9.9h-7.2v-9.9h-9.9v-7.2h9.9z"
        fill="white"
      />
    </svg>
  );
}

export function Logo({
  className,
  showText = true,
  tagline,
}: {
  className?: string;
  showText?: boolean;
  tagline?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      {showText && (
        <span className="flex flex-col leading-tight">
          <span className="text-[15px] font-bold tracking-tight text-primary-700">
            Pharmacie Globe Terrestre
          </span>
          {tagline && (
            <span className="text-[11px] font-medium text-muted-foreground">{tagline}</span>
          )}
        </span>
      )}
    </span>
  );
}
