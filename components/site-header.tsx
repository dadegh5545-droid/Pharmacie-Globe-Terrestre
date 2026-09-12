'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, ClipboardList, Phone } from 'lucide-react';
import { Logo } from '@/components/logo';
import { SearchBar } from '@/components/search-bar';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { useI18n, type TranslationKey } from '@/lib/i18n/context';
import { useRequest } from '@/lib/request-store';
import { siteConfig, telHref } from '@/config/site';
import { cn } from '@/lib/utils';

const NAV: { path: string; key: TranslationKey }[] = [
  { path: '/', key: 'nav.home' },
  { path: '/medicaments', key: 'nav.medicines' },
  { path: '/produits', key: 'nav.products' },
  { path: '/ordonnance', key: 'nav.prescription' },
  { path: '/services', key: 'nav.services' },
  { path: '/a-propos', key: 'nav.about' },
  { path: '/contact', key: 'nav.contact' },
];

export function SiteHeader() {
  const { t, href } = useI18n();
  const { count, ready } = useRequest();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Le menu mobile se referme à chaque navigation.
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Empêche le défilement de l'arrière-plan quand le tiroir est ouvert.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const isActive = (path: string) =>
    path === '/' ? pathname === href('/') : pathname.startsWith(href(path));

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md transition-shadow',
        scrolled ? 'border-border shadow-soft' : 'border-transparent',
      )}
    >
      <div className="container">
        <div className="flex h-[68px] items-center gap-4">
          <Link href={href('/')} aria-label={t('brand.name')} className="shrink-0">
            <Logo tagline={t('brand.tagline')} />
          </Link>

          <nav aria-label={t('nav.menu')} className="ms-auto hidden items-center gap-0.5 xl:flex">
            {NAV.map((item) => (
              <Link
                key={item.path}
                href={href(item.path)}
                aria-current={isActive(item.path) ? 'page' : undefined}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="ms-auto flex items-center gap-2 xl:ms-0">
            <div className="hidden w-64 lg:block">
              <SearchBar />
            </div>

            <LanguageSwitcher className="hidden sm:block" />

            <Link
              href={href('/demande')}
              aria-label={`${t('nav.request')}${count > 0 ? ` (${count})` : ''}`}
              className="relative inline-flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary-700"
            >
              <ClipboardList className="size-5" />
              {ready && count > 0 && (
                <span className="absolute -end-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t('nav.menu')}
              aria-expanded={menuOpen}
              className="inline-flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground xl:hidden"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>

        <div className="pb-3 lg:hidden">
          <SearchBar />
        </div>
      </div>

      {/* Tiroir de navigation mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 animate-fade-in"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 end-0 flex w-[min(320px,85vw)] flex-col bg-white shadow-lift">
            <div className="flex items-center justify-between border-b border-border p-4">
              <Logo showText={false} />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t('nav.close')}
                className="inline-flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav aria-label={t('nav.menu')} className="flex-1 overflow-y-auto p-3">
              {NAV.map((item) => (
                <Link
                  key={item.path}
                  href={href(item.path)}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                  className={cn(
                    'block rounded-xl px-4 py-3 text-[15px] font-medium transition-colors',
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>

            <div className="space-y-3 border-t border-border p-4">
              <LanguageSwitcher className="sm:hidden" />
              <Button asChild variant="outline" className="w-full">
                <a href={telHref(siteConfig.contact.phones[0])}>
                  <Phone className="size-4" />
                  {siteConfig.contact.phones[0]}
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
