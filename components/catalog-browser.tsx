'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { PackageSearch, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n/context';
import { searchProducts } from '@/lib/search';
import { useCatalog } from '@/lib/catalog-context';
import type { CategoryId, Product } from '@/data/catalog';
import { cn } from '@/lib/utils';

/**
 * Vue catalogue : recherche plein texte + filtre par catégorie.
 * L'état est reflété dans l'URL (`?q=`, `?categorie=`) pour que les résultats
 * restent partageables et que le retour navigateur fonctionne.
 */
export function CatalogBrowser({ products }: { products: Product[] }) {
  const { t, locale } = useI18n();
  const { categories } = useCatalog();
  const router = useRouter();
  const params = useSearchParams();

  const [query, setQuery] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState<CategoryId | null>(
    (params.get('categorie') as CategoryId | null) ?? null,
  );

  // Seules les categories effectivement representees sont proposees en filtre.
  const available = useMemo(() => {
    const used = new Set(products.map((product) => product.categoryId));
    return categories.filter((category) => used.has(category.id));
  }, [products, categories]);

  const results = useMemo(() => {
    const scoped = category ? products.filter((p) => p.categoryId === category) : products;
    return searchProducts(scoped, query, locale);
  }, [products, category, query, locale]);

  function updateUrl(next: { q?: string; categorie?: CategoryId | null }) {
    const search = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q) search.set('q', next.q);
      else search.delete('q');
    }
    if (next.categorie !== undefined) {
      if (next.categorie) search.set('categorie', next.categorie);
      else search.delete('categorie');
    }
    router.replace(search.toString() ? `?${search}` : '?', { scroll: false });
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4">
        <Input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            updateUrl({ q: event.target.value });
          }}
          placeholder={t('search.placeholder')}
          aria-label={t('search.label')}
          className="h-12"
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <SlidersHorizontal className="size-3.5" aria-hidden="true" />
            {t('products.filters')}
          </span>

          <button
            type="button"
            aria-pressed={category === null}
            onClick={() => {
              setCategory(null);
              updateUrl({ categorie: null });
            }}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors',
              category === null
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-white text-muted-foreground hover:border-primary hover:text-primary-700',
            )}
          >
            {t('products.all')}
          </button>

          {available.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              onClick={() => {
                setCategory(item.id);
                updateUrl({ categorie: item.id });
              }}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                category === item.id
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-white text-muted-foreground hover:border-primary hover:text-primary-700',
              )}
            >
              {item.name[locale]}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground" aria-live="polite">
          {results.length} {t('products.count')}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <PackageSearch className="mx-auto size-10 text-muted-foreground/40" aria-hidden="true" />
          <p className="mt-4 font-medium">{t('products.empty')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('search.noResultsHint')}</p>
          <Button
            variant="outline"
            className="mt-5"
            onClick={() => {
              setQuery('');
              setCategory(null);
              updateUrl({ q: '', categorie: null });
            }}
          >
            {t('products.all')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {results.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      )}
    </>
  );
}
