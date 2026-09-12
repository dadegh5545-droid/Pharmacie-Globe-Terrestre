import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { locales } from '@/lib/i18n/config';
import { products } from '@/data/catalog';

const ROUTES = [
  '',
  '/medicaments',
  '/produits',
  '/ordonnance',
  '/services',
  '/a-propos',
  '/contact',
  '/confidentialite',
  '/conditions',
  '/informations-medicales',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages = locales.flatMap((locale) =>
    ROUTES.map((route) => ({
      url: `${siteConfig.url}/${locale}${route}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((code) => [code, `${siteConfig.url}/${code}${route}`]),
        ),
      },
    })),
  );

  const productPages = locales.flatMap((locale) =>
    products
      .filter((product) => product.published)
      .map((product) => ({
        url: `${siteConfig.url}/${locale}/products/${product.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
  );

  return [...pages, ...productPages];
}
