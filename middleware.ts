import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, locales } from '@/lib/i18n/config';

const PUBLIC_FILE = /\.[^/]+$/;

/**
 * Redirige toute URL sans préfixe de langue vers la meilleure langue
 * disponible (préférence du navigateur, français par défaut) et pose les
 * en-têtes de sécurité communs à toutes les réponses.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsLocale =
    !PUBLIC_FILE.test(pathname) &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/admin') &&
    !locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));

  if (needsLocale) {
    const preferred =
      request.headers
        .get('accept-language')
        ?.split(',')
        .map((part) => part.split(';')[0].trim().slice(0, 2).toLowerCase())
        .find((code) => (locales as readonly string[]).includes(code)) ?? defaultLocale;

    const url = request.nextUrl.clone();
    url.pathname = `/${preferred}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|robots.txt|sitemap.xml|products|images).*)'],
};
