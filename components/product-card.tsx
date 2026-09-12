'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, MessageCircle, Plus, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/product-image';
import { AvailabilityBadge } from '@/components/availability-badge';
import { useI18n } from '@/lib/i18n/context';
import { useRequest } from '@/lib/request-store';
import { siteConfig, whatsappHref } from '@/config/site';
import { singleProductMessage } from '@/lib/whatsapp';
import type { Product } from '@/data/catalog';

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { t, locale, href, pick } = useI18n();
  const { add, has } = useRequest();
  const [justAdded, setJustAdded] = useState(false);

  const needsValidation = product.pharmacistValidation === 'MAY_BE_REQUIRED';
  const wa = whatsappHref(singleProductMessage(product, locale));
  const inRequest = has(product.id);

  const details = [product.strength, pick(product.form), pick(product.packageSize)].filter(Boolean);

  function handleAdd() {
    add(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lift">
      <Link
        href={href(`/products/${product.slug}`)}
        className="rounded-xl focus-visible:ring-2 focus-visible:ring-ring"
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductImage src={product.image} alt={product.name} priority={priority} />
      </Link>

      <div className="mt-3.5 flex flex-1 flex-col">
        <h3 className="text-[15px] font-semibold leading-snug">
          <Link
            href={href(`/products/${product.slug}`)}
            className="after:absolute focus-visible:underline"
          >
            {product.name}
          </Link>
        </h3>

        {details.length > 0 ? (
          <p className="mt-1 text-[13px] text-muted-foreground">{details.join(' · ')}</p>
        ) : (
          <p className="mt-1 text-[13px] italic text-muted-foreground">{t('product.unknown')}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          <AvailabilityBadge value={product.availability} />
          {needsValidation && (
            <Badge variant="warning" title={t('product.rxBadge')}>
              <ShieldAlert aria-hidden="true" />
              {t('product.rxShort')}
            </Badge>
          )}
        </div>

        <div className="mt-3 text-sm font-semibold text-primary-700">
          {siteConfig.currency.showPrices && product.price != null
            ? `${product.promoPrice ?? product.price} ${siteConfig.currency.symbol}`
            : t('product.priceHidden')}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Button asChild variant="outline" size="sm" className="relative z-10 w-full">
            <Link href={href(`/products/${product.slug}`)}>{t('products.details')}</Link>
          </Button>

          {needsValidation ? (
            /* Aucun ajout direct pour un produit à validation pharmacien :
               le client passe obligatoirement par un échange avec l'équipe. */
            wa ? (
              <Button asChild variant="whatsapp" size="sm" className="relative z-10 w-full">
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden="true" />
                  {t('products.contact')}
                </a>
              </Button>
            ) : (
              <Button asChild variant="secondary" size="sm" className="relative z-10 w-full">
                <Link href={href('/contact')}>{t('products.contact')}</Link>
              </Button>
            )
          ) : (
            <Button
              type="button"
              size="sm"
              variant={inRequest ? 'secondary' : 'default'}
              onClick={handleAdd}
              className="relative z-10 w-full"
            >
              {justAdded || inRequest ? (
                <>
                  <Check aria-hidden="true" />
                  {t('products.addedToRequest')}
                </>
              ) : (
                <>
                  <Plus aria-hidden="true" />
                  {t('products.addToRequest')}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
