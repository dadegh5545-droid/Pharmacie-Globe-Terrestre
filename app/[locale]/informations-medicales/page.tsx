import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
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
    title: dict['footer.medical'],
    description: dict['disclaimer.short'],
    alternates: { canonical: `/${locale}/informations-medicales` },
  };
}

export default async function MedicalInfoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : 'fr');

  return (
    <>
      <PageHeader title={dict['footer.medical']} />
      <div className="container max-w-3xl py-12">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6">
          <h2 className="text-base font-semibold text-amber-900">{dict['disclaimer.title']}</h2>
          <p className="mt-2 leading-relaxed text-amber-800">{dict['disclaimer.full']}</p>
        </div>

        <h2 className="mt-10 text-xl font-semibold">{dict['product.unknown']}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          {dict['product.rxNotice']}
        </p>

        <h2 className="mt-10 text-xl font-semibold">{dict['rx.privacy']}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{dict['rx.privacyText']}</p>
      </div>
    </>
  );
}
