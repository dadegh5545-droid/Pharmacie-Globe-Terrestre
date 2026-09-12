import { siteConfig } from '@/config/site';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import type { Product } from '@/data/catalog';

/**
 * Données structurées schema.org.
 *
 * Principe : on ne publie QUE des informations vérifiées. Adresse, horaires,
 * géolocalisation et prix sont omis tant qu'ils n'ont pas été communiqués —
 * un balisage inventé induirait en erreur les moteurs de recherche autant que
 * les patients.
 */
export function organizationJsonLd(locale: Locale) {
  const dict = getDictionary(locale);
  const { contact, openingHours } = siteConfig;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Pharmacy',
    name: siteConfig.name,
    description: dict['about.intro'],
    url: `${siteConfig.url}/${locale}`,
    telephone: contact.phones.map((phone) =>
      contact.countryCode ? `+${contact.countryCode}${phone.replace(/\D/g, '')}` : phone,
    ),
  };

  if (contact.email) jsonLd.email = contact.email;

  if (contact.address || contact.city || contact.country) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      ...(contact.address ? { streetAddress: contact.address } : {}),
      ...(contact.city ? { addressLocality: contact.city } : {}),
      ...(contact.country ? { addressCountry: contact.country } : {}),
    };
  }

  if (openingHours.length > 0) {
    jsonLd.openingHoursSpecification = openingHours.map((slot) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${slot.day[0].toUpperCase()}${slot.day.slice(1)}`,
      opens: slot.open,
      closes: slot.close,
    }));
  }

  const social = [siteConfig.social.facebook, siteConfig.social.instagram].filter(Boolean);
  if (social.length > 0) jsonLd.sameAs = social;

  return jsonLd;
}

/** Balisage `Product` — sans `offers` tant qu'aucun prix n'est publié. */
export function productJsonLd(product: Product, locale: Locale) {
  const dict = getDictionary(locale);

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    url: `${siteConfig.url}/${locale}/products/${product.slug}`,
    description: [product.name, product.strength, product.form?.[locale]]
      .filter(Boolean)
      .join(' — ') || dict['product.unknown'],
  };

  if (product.manufacturer) {
    jsonLd.brand = { '@type': 'Brand', name: product.manufacturer };
  }
  if (product.sku) jsonLd.sku = product.sku;
  if (product.barcode) jsonLd.gtin = product.barcode;
  if (product.image) jsonLd.image = `${siteConfig.url}${product.image}`;

  if (siteConfig.currency.showPrices && product.price != null && siteConfig.currency.code) {
    jsonLd.offers = {
      '@type': 'Offer',
      price: product.promoPrice ?? product.price,
      priceCurrency: siteConfig.currency.code,
      availability:
        product.availability === 'IN_STOCK'
          ? 'https://schema.org/InStock'
          : product.availability === 'OUT_OF_STOCK'
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/LimitedAvailability',
    };
  }

  return jsonLd;
}
