'use client';

import Link from 'next/link';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/search-bar';
import { ProductCard } from '@/components/product-card';
import { useI18n } from '@/lib/i18n/context';
import { siteConfig, telHref, whatsappHref } from '@/config/site';
import { generalMessage } from '@/lib/whatsapp';
import { useCatalog } from '@/lib/catalog-context';
import { cn } from '@/lib/utils';

/** Titre de section réutilisable, avec lien d'action facultatif. */
export function SectionHeading({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div className={cn('mb-8 flex flex-wrap items-end justify-between gap-4', className)}>
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1.5 text-muted-foreground">{subtitle}</p>}
      </div>
      {action && (
        <Button asChild variant="ghost" size="sm">
          <Link href={action.href}>
            {action.label}
            <Icons.ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </Button>
      )}
    </div>
  );
}

export function Hero() {
  const { t, locale, href } = useI18n();
  const { products } = useCatalog();
  const wa = whatsappHref(generalMessage(locale));

  const badges = [t('hero.badge1'), t('hero.badge2'), t('hero.badge3'), t('hero.badge4')];

  return (
    <section className="hero-pattern relative overflow-hidden border-b border-border">
      <div className="container grid gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3.5 py-1.5 text-xs font-semibold text-primary-700">
            <Icons.HeartPulse className="size-3.5" />
            {t('brand.tagline')}
          </span>

          <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            {t('hero.title')}
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-[17px] leading-relaxed text-muted-foreground">
            {t('hero.subtitle')}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={href('/produits')}>
                {t('hero.ctaPrimary')}
                <Icons.ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={href('/contact')}>
                <Icons.Phone className="size-4" />
                {t('hero.ctaSecondary')}
              </Link>
            </Button>
          </div>

          <ul className="mt-9 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {badges.map((badge) => (
              <li key={badge} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icons.CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden="true" />
                {badge}
              </li>
            ))}
          </ul>
        </div>

        {/* Composition visuelle : produits mis en avant du catalogue. */}
        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="grid grid-cols-2 gap-4">
            {products
              .filter((product) => product.featured)
              .slice(0, 4)
              .map((product, index) => (
                <Link
                  key={product.id}
                  href={href(`/products/${product.slug}`)}
                  className={cn(
                    'group rounded-2xl border border-border bg-white p-4 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift',
                    index % 2 === 1 && 'translate-y-6',
                  )}
                >
                  <div className="grid aspect-square place-items-center rounded-xl bg-gradient-to-br from-primary-50 to-muted text-primary-200">
                    <Icons.Pill className="size-10" strokeWidth={1.25} aria-hidden="true" />
                  </div>
                  <p className="mt-3 truncate text-sm font-semibold">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.strength ?? t('product.priceHidden')}
                  </p>
                </Link>
              ))}
          </div>

          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium shadow-soft transition-colors hover:border-[#25D366]"
            >
              <Icons.MessageCircle className="size-5 text-[#25D366]" />
              {t('contact.whatsapp')}
              <span dir="ltr" className="text-muted-foreground">
                {siteConfig.contact.phones[0]}
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export function SearchSection() {
  const { t } = useI18n();
  return (
    <section className="border-b border-border bg-white py-8">
      <div className="container max-w-3xl">
        <SearchBar size="hero" />
        <p className="mt-3 text-center text-xs text-muted-foreground">{t('disclaimer.short')}</p>
      </div>
    </section>
  );
}

export function CategoriesSection() {
  const { t, locale, href } = useI18n();
  const { categories, usedCategories } = useCatalog();
  const shown = usedCategories();

  return (
    <section className="section-muted py-16">
      <div className="container">
        <SectionHeading title={t('home.categories.title')} subtitle={t('home.categories.subtitle')} />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {(shown.length > 0 ? shown : categories.slice(0, 8)).map((category) => {
            const Icon = (Icons[category.icon as keyof typeof Icons] ??
              Icons.Package) as typeof Icons.Package;
            return (
              <li key={category.id}>
                <Link
                  href={`${href('/produits')}?categorie=${category.id}`}
                  className="group flex h-full flex-col items-center gap-3 rounded-2xl border border-border bg-white p-5 text-center shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lift"
                >
                  <span className="grid size-12 place-items-center rounded-xl bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold leading-snug">
                    {category.name[locale]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function PopularSection() {
  const { t, href } = useI18n();
  const { products } = useCatalog();
  const shown = products.slice(0, 8);

  return (
    <section className="py-16">
      <div className="container">
        <SectionHeading
          title={t('home.popular.title')}
          subtitle={t('home.popular.subtitle')}
          action={{ label: t('home.popular.all'), href: href('/produits') }}
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {shown.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhySection() {
  const { t } = useI18n();
  const items = [
    { Icon: Icons.Stethoscope, title: t('home.why.1.title'), text: t('home.why.1.text') },
    { Icon: Icons.SearchCheck, title: t('home.why.2.title'), text: t('home.why.2.text') },
    { Icon: Icons.ClipboardList, title: t('home.why.3.title'), text: t('home.why.3.text') },
    { Icon: Icons.Headset, title: t('home.why.4.title'), text: t('home.why.4.text') },
  ];

  return (
    <section className="section-muted py-16">
      <div className="container">
        <SectionHeading title={t('home.why.title')} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-white p-6 shadow-soft transition-shadow hover:shadow-lift"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-primary-50 text-primary-700">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PrescriptionSection() {
  const { t, href } = useI18n();
  return (
    <section className="py-16">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 to-[hsl(190_70%_30%)] px-6 py-12 text-white sm:px-12">
          <Icons.FileHeart
            aria-hidden="true"
            className="pointer-events-none absolute -end-6 -top-6 size-48 opacity-10"
          />
          <div className="relative max-w-2xl">
            <h2 className="text-2xl font-bold sm:text-3xl">{t('home.prescription.title')}</h2>
            <p className="mt-3 text-white/85">{t('home.prescription.text')}</p>
            <Button asChild size="lg" variant="secondary" className="mt-6 bg-white text-primary-700 hover:bg-white/90">
              <Link href={href('/ordonnance')}>
                <Icons.Upload className="size-4" />
                {t('home.prescription.cta')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  const { t, locale } = useI18n();
  const wa = whatsappHref(generalMessage(locale));

  return (
    <section className="section-muted py-16">
      <div className="container grid gap-8 lg:grid-cols-2">
        <div>
          <SectionHeading title={t('home.contact.title')} subtitle={t('home.contact.text')} />
          <div className="flex flex-wrap gap-3">
            {siteConfig.contact.phones.map((phone) => (
              <Button key={phone} asChild variant="outline" size="lg">
                <a href={telHref(phone)} dir="ltr">
                  <Icons.Phone className="size-4" />
                  {phone}
                </a>
              </Button>
            ))}
            {wa && (
              <Button asChild size="lg" variant="whatsapp">
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  <Icons.MessageCircle className="size-4" />
                  {t('contact.whatsapp')}
                </a>
              </Button>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">{t('home.map.title')}</h2>
          {siteConfig.contact.mapsEmbedUrl ? (
            <iframe
              src={siteConfig.contact.mapsEmbedUrl}
              title={t('home.map.title')}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-[16/10] w-full rounded-2xl border border-border"
            />
          ) : (
            <div className="grid aspect-[16/10] w-full place-items-center rounded-2xl border border-dashed border-border bg-white p-6 text-center">
              <div>
                <Icons.MapPin className="mx-auto size-8 text-muted-foreground/50" aria-hidden="true" />
                <p className="mt-3 text-sm text-muted-foreground">{t('home.map.pending')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
