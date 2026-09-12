'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useCatalog } from '@/lib/catalog-context';
import { searchProducts } from '@/lib/search';
import { cn } from '@/lib/utils';

const MAX_SUGGESTIONS = 6;

/**
 * Barre de recherche avec autocomplétion clavier (combobox ARIA).
 * Taper « Amoxi » propose immédiatement Amoxi-Denk 500 et Amoxi-Denk 1000.
 */
export function SearchBar({
  size = 'default',
  autoFocus = false,
  className,
}: {
  size?: 'default' | 'hero';
  autoFocus?: boolean;
  className?: string;
}) {
  const { t, locale, href } = useI18n();
  const { products } = useCatalog();
  const router = useRouter();
  const listId = useId();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(
    () =>
      query.trim().length < 1
        ? []
        : searchProducts(products, query, locale, MAX_SUGGESTIONS),
    [query, locale, products],
  );

  // Ferme la liste lors d'un clic à l'extérieur.
  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  function goToResults() {
    setOpen(false);
    router.push(`${href('/produits')}?q=${encodeURIComponent(query.trim())}`);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, -1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const picked = suggestions[active];
      if (picked) {
        setOpen(false);
        router.push(href(`/products/${picked.slug}`));
      } else if (query.trim()) {
        goToResults();
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  const isHero = size === 'hero';

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute top-1/2 size-5 -translate-y-1/2 text-muted-foreground',
            'start-4',
          )}
        />
        <input
          type="search"
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label={t('search.label')}
          autoFocus={autoFocus}
          value={query}
          placeholder={t('search.placeholder')}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            'w-full rounded-2xl border border-border bg-white ps-12 pe-11 shadow-soft transition-shadow',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'focus:shadow-lift [&::-webkit-search-cancel-button]:hidden',
            isHero ? 'h-14 text-base' : 'h-11 text-sm',
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setActive(-1);
            }}
            aria-label={t('common.close')}
            className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {open && query.trim().length > 0 && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-white shadow-lift animate-fade-in">
          {suggestions.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-medium">{t('search.noResults')}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t('search.noResultsHint')}</p>
            </div>
          ) : (
            <>
              <ul id={listId} role="listbox" aria-label={t('search.suggestions')} className="py-1.5">
                {suggestions.map((product, index) => (
                  <li key={product.id} role="option" aria-selected={index === active}>
                    <Link
                      href={href(`/products/${product.slug}`)}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setActive(index)}
                      className={cn(
                        'flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors',
                        index === active ? 'bg-primary-50' : 'hover:bg-muted',
                      )}
                    >
                      <span className="font-medium">{product.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {[product.strength, product.form?.[locale]].filter(Boolean).join(' · ')}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={goToResults}
                className="w-full border-t border-border px-4 py-2.5 text-start text-xs font-semibold text-primary-700 hover:bg-muted"
              >
                {t('search.seeAll')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
