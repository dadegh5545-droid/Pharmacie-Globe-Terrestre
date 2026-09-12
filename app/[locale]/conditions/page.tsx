import type { Metadata } from 'next';
import { LegalPageView } from '@/components/legal-page';
import { termsPage } from '@/data/legal';
import { isLocale } from '@/lib/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = termsPage[isLocale(locale) ? locale : 'fr'];
  return {
    title: page.title,
    description: page.intro,
    alternates: { canonical: `/${locale}/conditions` },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <LegalPageView page={termsPage[isLocale(locale) ? locale : 'fr']} />;
}
