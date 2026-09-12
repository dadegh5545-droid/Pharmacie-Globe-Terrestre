export const locales = ['fr', 'ar', 'en'] as const;
export type Locale = (typeof locales)[number];

/** Le français est la langue par défaut du site. */
export const defaultLocale: Locale = 'fr';

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  ar: 'العربية',
  en: 'English',
};

export const localeShort: Record<Locale, string> = {
  fr: 'FR',
  ar: 'ع',
  en: 'EN',
};

export const localeDir: Record<Locale, 'ltr' | 'rtl'> = {
  fr: 'ltr',
  ar: 'rtl',
  en: 'ltr',
};

/** Balise `hreflang` / attribut `lang` correspondant. */
export const localeHtmlLang: Record<Locale, string> = {
  fr: 'fr',
  ar: 'ar',
  en: 'en',
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
