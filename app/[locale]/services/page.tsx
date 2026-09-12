import type { Metadata } from 'next';
import Link from 'next/link';
import { ClipboardList, FileHeart, PackageSearch, Stethoscope } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
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
    title: dict['services.title'],
    description: dict['services.subtitle'],
    alternates: { canonical: `/${locale}/services` },
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const code = isLocale(locale) ? locale : 'fr';
  const dict = getDictionary(code);

  const services = [
    { Icon: Stethoscope, title: dict['services.1.title'], text: dict['services.1.text'] },
    { Icon: FileHeart, title: dict['services.2.title'], text: dict['services.2.text'] },
    { Icon: PackageSearch, title: dict['services.3.title'], text: dict['services.3.text'] },
    { Icon: ClipboardList, title: dict['services.4.title'], text: dict['services.4.text'] },
  ];

  return (
    <>
      <PageHeader title={dict['services.title']} subtitle={dict['services.subtitle']} />
      <div className="container py-12">
        <div className="grid gap-5 sm:grid-cols-2">
          {services.map(({ Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-white p-7 shadow-soft transition-shadow hover:shadow-lift"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-primary-50 text-primary-700">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold">{title}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={`/${code}/produits`}>{dict['hero.ctaPrimary']}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={`/${code}/ordonnance`}>{dict['home.prescription.cta']}</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
