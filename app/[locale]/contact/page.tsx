import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { ContactView } from '@/components/contact-view';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isLocale, locales } from '@/lib/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict['contact.title'],
    description: dict['contact.subtitle'],
    alternates: {
      canonical: `/${locale}/contact`,
      languages: Object.fromEntries(locales.map((code) => [code, `/${code}/contact`])),
    },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : 'fr');
  return (
    <>
      <PageHeader title={dict['contact.title']} subtitle={dict['contact.subtitle']} />
      <div className="container py-10">
        <ContactView />
      </div>
    </>
  );
}
