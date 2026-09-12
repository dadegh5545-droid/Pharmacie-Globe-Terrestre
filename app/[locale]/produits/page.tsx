import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CatalogBrowser } from '@/components/catalog-browser';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { products } from '@/data/catalog';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale } from '@/lib/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict['products.title'],
    description: dict['products.subtitle'],
    alternates: { canonical: `/${locale}/produits` },
  };
}

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="h-[340px]" />
      ))}
    </div>
  );
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : 'fr');
  const published = products.filter((product) => product.published);

  return (
    <>
      <PageHeader title={dict['products.title']} subtitle={dict['products.subtitle']} />
      <div className="container py-10">
        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogBrowser products={published} />
        </Suspense>
      </div>
    </>
  );
}
