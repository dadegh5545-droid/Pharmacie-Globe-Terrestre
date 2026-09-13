/**
 * ────────────────────────────────────────────────────────────────────────────
 *  FICHIER DE CONFIGURATION UNIQUE — Pharmacie Globe Terrestre
 * ────────────────────────────────────────────────────────────────────────────
 *
 *  Tout ce qui dépend de l'établissement se règle ICI (ou depuis l'admin,
 *  qui écrit dans le modèle `BusinessSettings` et prend alors le dessus).
 *
 *  Les champs laissés vides ("") ne sont PAS inventés : l'interface les masque
 *  simplement tant qu'ils ne sont pas renseignés.
 */

export type Availability =
  | 'IN_STOCK'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'ON_ORDER'
  | 'CONTACT_PHARMACY';

export const siteConfig = {
  name: 'Pharmacie Globe Terrestre',
  /** Utilisé pour les URL canoniques, le sitemap et Open Graph. */
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://pharmacie-globe-terrestre.example',

  contact: {
    /**
     * Numéros tels que fournis par la pharmacie, au format local.
     * NE PAS y ajouter d'indicatif : il est défini séparément ci-dessous.
     */
    phones: ['62 18 10 30', '97 43 41 11'],

    /**
     * Indicatif international : 235 (Tchad), communiqué par la pharmacie.
     * Sans lui, les boutons WhatsApp seraient désactivés — `wa.me` exige un
     * numéro complet. Surchargeable par NEXT_PUBLIC_COUNTRY_CODE.
     */
    countryCode: process.env.NEXT_PUBLIC_COUNTRY_CODE || '235',

    /** Numéro recevant les demandes WhatsApp (index dans `phones`). */
    whatsappPhoneIndex: 0,

    email: '',
    address: '',
    city: '',
    country: '',
    /** Lien « Itinéraire » Google Maps, ou URL d'iframe d'intégration. */
    mapsUrl: '',
    mapsEmbedUrl: '',
  },

  /**
   * Horaires d'ouverture. Laisser le tableau vide tant qu'ils ne sont pas
   * communiqués : la section correspondante disparaît alors du site.
   * Format attendu : { day: 'monday' … 'sunday', open: '08:30', close: '22:00' }
   */
  openingHours: [] as { day: string; open: string; close: string }[],

  social: {
    facebook: '',
    instagram: '',
  },

  currency: {
    /** Aucune devise n'a été communiquée : les prix restent masqués. */
    code: process.env.NEXT_PUBLIC_CURRENCY_CODE || '',
    symbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '',
    name: process.env.NEXT_PUBLIC_CURRENCY_NAME || '',
    /**
     * Passer à `true` une fois la devise et les tarifs saisis.
     * Tant que c'est `false`, les cartes produit affichent
     * « Contacter la pharmacie » à la place du prix.
     */
    showPrices: process.env.NEXT_PUBLIC_SHOW_PRICES === 'true',
  },

  /** Seuil d'alerte « stock faible » du tableau de bord. */
  lowStockThreshold: 10,
} as const;

export type SiteConfig = typeof siteConfig;

/** Numéro international compact (ex. « 21662181030 »), ou `null` si inconnu. */
export function internationalNumber(localNumber: string): string | null {
  const code = siteConfig.contact.countryCode.replace(/\D/g, '');
  const local = localNumber.replace(/\D/g, '');
  if (!code || !local) return null;
  return `${code}${local}`;
}

/** Cible d'un lien `tel:` — toujours disponible, même sans indicatif. */
export function telHref(localNumber: string): string {
  const full = internationalNumber(localNumber);
  return full ? `tel:+${full}` : `tel:${localNumber.replace(/\s/g, '')}`;
}

/**
 * Lien `wa.me` avec message pré-rempli, ou `null` si l'indicatif international
 * n'est pas configuré (WhatsApp ne fonctionne pas avec un numéro local).
 */
export function whatsappHref(message: string, phoneIndex?: number): string | null {
  const index = phoneIndex ?? siteConfig.contact.whatsappPhoneIndex;
  const full = internationalNumber(siteConfig.contact.phones[index] ?? '');
  if (!full) return null;
  return `https://wa.me/${full}?text=${encodeURIComponent(message)}`;
}

export const whatsappConfigured = Boolean(siteConfig.contact.countryCode);
