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
    title: dict['about.title'],
    description: dict['about.intro'],
    alternates: { canonical: `/${locale}/a-propos` },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : 'fr');

  return (
    <>
      <PageHeader title={dict['about.title']} />
      <div className="container max-w-3xl py-12">
        <p className="text-lg leading-relaxed">{dict['about.intro']}</p>

        <h2 className="mt-10 text-xl font-semibold">{dict['about.approach.title']}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{dict['about.approach.text']}</p>

        <h2 className="mt-10 text-xl font-semibold">{dict['about.info.title']}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{dict['about.info.text']}</p>

        <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
          <h2 className="text-sm font-semibold text-amber-900">{dict['disclaimer.title']}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-amber-800">{dict['disclaimer.full']}</p>
        </div>
      </div>
    </>
  );
}
