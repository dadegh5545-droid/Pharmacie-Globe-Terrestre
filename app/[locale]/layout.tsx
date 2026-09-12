import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Arabic } from 'next/font/google';
import { notFound } from 'next/navigation';
import '@/app/globals.css';

import { I18nProvider } from '@/lib/i18n/context';
import { RequestProvider } from '@/lib/request-store';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { FloatingContact } from '@/components/floating-whatsapp';
import { SkipLink } from '@/components/skip-link';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale, localeDir, locales, type Locale } from '@/lib/i18n/config';
import { siteConfig } from '@/config/site';
import { organizationJsonLd } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-arabic',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#0d8f6d',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name} — ${dict['brand.tagline']}`,
      template: `%s — ${siteConfig.name}`,
    },
    description: dict['hero.subtitle'],
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(locales.map((code) => [code, `/${code}`])),
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title: `${siteConfig.name} — ${dict['brand.tagline']}`,
      description: dict['hero.subtitle'],
      locale,
      url: `/${locale}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.name,
      description: dict['hero.subtitle'],
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale = locale as Locale;

  return (
    <html
      lang={typedLocale}
      dir={localeDir[typedLocale]}
      className={`${inter.variable} ${notoArabic.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-sans">
        <script
          type="application/ld+json"
          // Données structurées LocalBusiness limitées aux informations vérifiées.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(typedLocale)) }}
        />
        <I18nProvider locale={typedLocale}>
          <RequestProvider>
            <SkipLink />
            <SiteHeader />
            <main id="contenu" className="flex-1">
              {children}
            </main>
            <SiteFooter />
            <FloatingContact />
          </RequestProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
