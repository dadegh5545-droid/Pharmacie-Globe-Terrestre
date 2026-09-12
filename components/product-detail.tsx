'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Info,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  ShieldAlert,
  Upload,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/product-image';
import { AvailabilityBadge } from '@/components/availability-badge';
import { ProductCard } from '@/components/product-card';
import { SectionHeading } from '@/components/sections';
import { useI18n } from '@/lib/i18n/context';
import { useRequest, MAX_QUANTITY } from '@/lib/request-store';
import { siteConfig, telHref, whatsappHref } from '@/config/site';
import { singleProductMessage } from '@/lib/whatsapp';
import { useCatalog } from '@/lib/catalog-context';
import type { Product } from '@/data/catalog';

/** Ligne « libellé / valeur » ; affiche le repli pharmacien si la valeur manque. */
function Spec({ label, value }: { label: string; value: string | null | undefined }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-border py-3 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={value ? 'text-sm font-medium' : 'text-sm italic text-muted-foreground'}>
        {value || t('product.unknown')}
      </dd>
    </div>
  );
}

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const { t, locale, href, pick } = useI18n();
  const { add, has } = useRequest();
  const { getCategory } = useCatalog();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const needsValidation = product.pharmacistValidation === 'MAY_BE_REQUIRED';
  const wa = whatsappHref(singleProductMessage(product, locale, quantity));
  const category = getCategory(product.categoryId);

  return (
    <div className="container py-8 sm:py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ms-2">
        <Link href={href('/produits')}>
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t('product.backToProducts')}
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,440px)_1fr] lg:gap-14">
        <div className="rounded-3xl border border-border bg-white p-5 shadow-soft">
          <ProductImage
            src={product.image}
            alt={product.name}
            priority
            sizes="(max-width: 1024px) 90vw, 440px"
          />
        </div>

        <div>
          <Link
            href={`${href('/produits')}?categorie=${category.id}`}
            className="text-xs font-semibold uppercase tracking-wide text-primary-700 hover:underline"
          >
            {category.name[locale]}
          </Link>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>

          <div className="mt-4 flex flex-wrap gap-2">
            <AvailabilityBadge value={product.availability} />
            {needsValidation && (
              <Badge variant="warning">
                <ShieldAlert aria-hidden="true" />
                {t('product.rxBadge')}
              </Badge>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-5">
            <p className="text-lg font-semibold text-primary-700">
              {siteConfig.currency.showPrices && product.price != null
                ? `${product.promoPrice ?? product.price} ${siteConfig.currency.symbol}`
                : t('product.priceHidden')}
            </p>
            {!siteConfig.currency.showPrices && (
              <p className="mt-1 text-sm text-muted-foreground">{t('product.priceHiddenHint')}</p>
            )}
          </div>

          {needsValidation && (
            <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-amber-900">{t('product.rxNotice')}</p>
            </div>
          )}

          {/* Actions : jamais d'achat direct pour un produit à validation. */}
          <div className="mt-6 space-y-3">
            {!needsValidation && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{t('request.quantity')}</span>
                <div className="inline-flex items-center rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    disabled={quantity <= 1}
                    aria-label="-"
                    className="grid size-10 place-items-center text-primary-700 disabled:text-muted-foreground/40"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="min-w-10 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.min(MAX_QUANTITY, value + 1))}
                    disabled={quantity >= MAX_QUANTITY}
                    aria-label="+"
                    className="grid size-10 place-items-center text-primary-700 disabled:text-muted-foreground/40"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {wa ? (
                <Button asChild size="lg" variant="whatsapp">
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="size-4" />
                    {t('product.askAvailability')}
                  </a>
                </Button>
              ) : (
                <Button asChild size="lg">
                  <a href={telHref(siteConfig.contact.phones[0])}>
                    <Phone className="size-4" />
                    {t('contact.call')}
                  </a>
                </Button>
              )}

              {needsValidation ? (
                <Button asChild size="lg" variant="outline">
                  <Link href={href('/ordonnance')}>
                    <Upload className="size-4" />
                    {t('product.uploadPrescription')}
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant={has(product.id) ? 'secondary' : 'outline'}
                  onClick={() => {
                    add(product, quantity);
                    setAdded(true);
                    window.setTimeout(() => setAdded(false), 1800);
                  }}
                >
                  {added || has(product.id) ? (
                    <>
                      <Check className="size-4" />
                      {t('products.addedToRequest')}
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" />
                      {t('products.addToRequest')}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <dl className="mt-8 rounded-2xl border border-border bg-white px-5 shadow-soft">
            <Spec label={t('product.activeIngredient')} value={product.activeIngredient} />
            <Spec label={t('product.strength')} value={product.strength} />
            <Spec label={t('product.form')} value={pick(product.form)} />
            <Spec label={t('product.package')} value={pick(product.packageSize)} />
            <Spec label={t('product.manufacturer')} value={product.manufacturer} />
            {product.sku && <Spec label={t('product.sku')} value={product.sku} />}
          </dl>

          <div className="mt-6 flex gap-3 rounded-2xl border border-border bg-muted/40 p-4">
            <Info className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-muted-foreground">{t('disclaimer.short')}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading title={t('products.related')} />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
