import type { Metadata } from 'next';
import { LegalPageView } from '@/components/legal-page';
import { privacyPage } from '@/data/legal';
import { isLocale } from '@/lib/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = privacyPage[isLocale(locale) ? locale : 'fr'];
  return {
    title: page.title,
    description: page.intro,
    alternates: { canonical: `/${locale}/confidentialite` },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPageView page={privacyPage[isLocale(locale) ? locale : 'fr']} />;
}
