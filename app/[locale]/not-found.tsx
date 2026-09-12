'use client';

import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { defaultLocale } from '@/lib/i18n/config';

/**
 * `not-found` est rendu hors du contexte i18n (aucun parametre de route
 * garanti) : on utilise donc le dictionnaire par defaut, en francais.
 */
export default function NotFound() {
  const dict = getDictionary(defaultLocale);
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <FileQuestion className="size-12 text-muted-foreground/40" aria-hidden="true" />
      <h1 className="mt-6 text-3xl font-bold">{dict['state.notFound']}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">{dict['state.notFoundText']}</p>
      <Button asChild className="mt-7">
        <Link href={`/${defaultLocale}`}>{dict['state.backHome']}</Link>
      </Button>
    </div>
  );
}
