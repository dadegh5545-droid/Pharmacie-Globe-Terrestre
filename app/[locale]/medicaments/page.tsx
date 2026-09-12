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
    title: dict['medicines.title'],
    description: dict['medicines.subtitle'],
    alternates: { canonical: `/${locale}/medicaments` },
  };
}

export default async function MedicinesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : 'fr');

  // Produits soumis a une validation pharmaceutique possible.
  const medicines = products.filter(
    (product) => product.published && product.pharmacistValidation === 'MAY_BE_REQUIRED',
  );

  return (
    <>
      <PageHeader title={dict['medicines.title']} subtitle={dict['medicines.subtitle']} />
      <div className="container py-10">
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm leading-relaxed text-amber-900">
          {dict['product.rxNotice']}
        </div>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <CatalogBrowser products={medicines} />
        </Suspense>
      </div>
    </>
  );
}
