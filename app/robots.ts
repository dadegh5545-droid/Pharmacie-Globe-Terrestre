import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Espaces prives : back-office et pages liees a une demande en cours.
        disallow: ['/admin', '/api/', '/*/demande'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
