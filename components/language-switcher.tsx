'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { localeNames, locales, isLocale, type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

/** Sélecteur de langue : conserve la page courante en changeant le préfixe. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  function switchTo(next: Locale) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && isLocale(segments[0])) segments[0] = next;
    else segments.unshift(next);
    setOpen(false);
    router.push(`/${segments.join('/')}`);
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('nav.language')}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary-700"
      >
        <Globe className="size-4" />
        <span className="uppercase">{locale}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-lift animate-fade-in"
        >
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={code === locale}
              onClick={() => switchTo(code)}
              className={cn(
                'flex w-full items-center justify-between gap-2 px-3.5 py-2 text-sm transition-colors hover:bg-muted',
                code === locale && 'font-semibold text-primary-700',
              )}
            >
              <span lang={code}>{localeNames[code]}</span>
              {code === locale && <Check className="size-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
