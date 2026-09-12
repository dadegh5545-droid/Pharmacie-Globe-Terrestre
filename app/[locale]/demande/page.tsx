import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { RequestView } from '@/components/request-view';
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
    title: dict['request.title'],
    description: dict['request.subtitle'],
    alternates: { canonical: `/${locale}/demande` },
    robots: { index: false, follow: true },
  };
}

export default async function RequestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : 'fr');
  return (
    <>
      <PageHeader title={dict['request.title']} subtitle={dict['request.subtitle']} />
      <div className="container py-10">
        <RequestView />
      </div>
    </>
  );
}
