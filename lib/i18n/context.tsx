'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { getDictionary, type TranslationKey } from './dictionaries';
import { localeDir, type Locale } from './config';

type I18nValue = {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  t: (key: TranslationKey) => string;
  /** Choisit la variante linguistique d'un champ de catalogue. */
  pick: (value: { fr: string; ar: string; en: string } | null | undefined) => string | null;
  /** Préfixe une route interne avec la langue courante (`/fr/produits`). */
  href: (path: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<I18nValue>(() => {
    const dict = getDictionary(locale);
    return {
      locale,
      dir: localeDir[locale],
      t: (key) => dict[key] ?? key,
      pick: (field) => (field ? field[locale] : null),
      href: (path) => `/${locale}${path === '/' ? '' : path}`,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n doit être utilisé dans <I18nProvider>');
  return ctx;
}

export type { TranslationKey };
