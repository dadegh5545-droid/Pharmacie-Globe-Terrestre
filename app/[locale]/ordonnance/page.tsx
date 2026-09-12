import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { PrescriptionForm } from '@/components/prescription-form';
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
    title: dict['rx.title'],
    description: dict['rx.subtitle'],
    alternates: {
      canonical: `/${locale}/ordonnance`,
      languages: Object.fromEntries(locales.map((code) => [code, `/${code}/ordonnance`])),
    },
  };
}

export default async function PrescriptionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : 'fr');
  return (
    <>
      <PageHeader title={dict['rx.title']} subtitle={dict['rx.subtitle']} />
      <div className="container max-w-2xl py-10">
        <PrescriptionForm />
      </div>
    </>
  );
}
