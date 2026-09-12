'use client';

import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useI18n, type TranslationKey } from '@/lib/i18n/context';
import { siteConfig, telHref, whatsappHref } from '@/config/site';
import { generalMessage } from '@/lib/whatsapp';

const FOOTER_NAV: { path: string; key: TranslationKey }[] = [
  { path: '/', key: 'nav.home' },
  { path: '/produits', key: 'nav.products' },
  { path: '/ordonnance', key: 'nav.prescription' },
  { path: '/a-propos', key: 'nav.about' },
  { path: '/contact', key: 'nav.contact' },
];

const LEGAL_NAV: { path: string; key: TranslationKey }[] = [
  { path: '/confidentialite', key: 'footer.privacy' },
  { path: '/conditions', key: 'footer.terms' },
  { path: '/informations-medicales', key: 'footer.medical' },
];

export function SiteFooter() {
  const { t, locale, href } = useI18n();
  const wa = whatsappHref(generalMessage(locale));

  return (
    <footer className="mt-20 border-t border-border bg-muted/50">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo tagline={t('brand.tagline')} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t('about.intro')}
            </p>
          </div>

          <nav aria-label={t('footer.navigation')}>
            <h2 className="mb-3 text-sm font-semibold">{t('footer.navigation')}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {FOOTER_NAV.map((item) => (
                <li key={item.path}>
                  <Link href={href(item.path)} className="transition-colors hover:text-primary-700">
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-3 text-sm font-semibold">{t('footer.contact')}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {siteConfig.contact.phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={telHref(phone)}
                    dir="ltr"
                    className="inline-flex items-center gap-2 transition-colors hover:text-primary-700"
                  >
                    <Phone className="size-4 shrink-0" />
                    {phone}
                  </a>
                </li>
              ))}
              {wa && (
                <li>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 transition-colors hover:text-primary-700"
                  >
                    <MessageCircle className="size-4 shrink-0" />
                    {t('contact.whatsapp')}
                  </a>
                </li>
              )}
              {siteConfig.contact.email && (
                <li>
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="inline-flex items-center gap-2 transition-colors hover:text-primary-700"
                  >
                    <Mail className="size-4 shrink-0" />
                    {siteConfig.contact.email}
                  </a>
                </li>
              )}
              {siteConfig.contact.address && (
                <li className="inline-flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  <span>
                    {siteConfig.contact.address}
                    {siteConfig.contact.city ? `, ${siteConfig.contact.city}` : ''}
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold">{t('footer.legal')}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {LEGAL_NAV.map((item) => (
                <li key={item.path}>
                  <Link href={href(item.path)} className="transition-colors hover:text-primary-700">
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="mb-3 mt-6 text-sm font-semibold">{t('footer.follow')}</h2>
            <div className="flex gap-2">
              {[
                { url: siteConfig.social.facebook, Icon: Facebook, label: 'Facebook' },
                { url: siteConfig.social.instagram, Icon: Instagram, label: 'Instagram' },
                { url: wa, Icon: MessageCircle, label: 'WhatsApp' },
              ].map(({ url, Icon, label }) =>
                url ? (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground transition-colors hover:border-primary hover:text-primary-700"
                  >
                    <Icon className="size-4" />
                  </a>
                ) : (
                  <span
                    key={label}
                    title={label}
                    aria-hidden="true"
                    className="inline-flex size-9 items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground/40"
                  >
                    <Icon className="size-4" />
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Avertissement médical, visible sur toutes les pages. */}
        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
          <h2 className="text-sm font-semibold text-amber-900">{t('disclaimer.title')}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-amber-800">{t('disclaimer.full')}</p>
        </div>

        <p className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name} — {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}
