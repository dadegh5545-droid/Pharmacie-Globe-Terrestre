'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { defaultLocale } from '@/lib/i18n/config';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dict = getDictionary(defaultLocale);

  useEffect(() => {
    // Le detail technique reste dans la console : jamais affiche au patient.
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <AlertTriangle className="size-12 text-amber-500" aria-hidden="true" />
      <h1 className="mt-6 text-2xl font-bold">{dict['state.error']}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">{dict['state.networkError']}</p>
      <Button onClick={reset} className="mt-7">
        {dict['state.retry']}
      </Button>
    </div>
  );
}
