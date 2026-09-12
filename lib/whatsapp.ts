import { siteConfig } from '@/config/site';
import type { Locale } from '@/lib/i18n/config';
import type { Product } from '@/data/catalog';
import type { RequestLine } from '@/lib/request-store';

/**
 * Rédaction des messages WhatsApp.
 *
 * Le vocabulaire est volontairement celui d'une DEMANDE DE DISPONIBILITÉ :
 * la pharmacie confirme le produit, le prix et, le cas échéant, l'ordonnance
 * nécessaire. Aucun message ne présente une vente de médicament comme acquise.
 */

const greeting: Record<Locale, string> = {
  fr: `Bonjour ${siteConfig.name},`,
  ar: `مرحباً ${siteConfig.name}،`,
  en: `Hello ${siteConfig.name},`,
};

const labels: Record<Locale, Record<string, string>> = {
  fr: {
    single: 'Je souhaite demander la disponibilité du produit suivant :',
    multiple: 'Je souhaite demander la disponibilité des produits suivants :',
    product: 'Produit',
    strength: 'Dosage',
    quantity: 'Quantité souhaitée',
    name: 'Nom',
    phone: 'Téléphone',
    note: 'Remarque',
    closing: 'Merci de me confirmer la disponibilité et le prix.',
    rxNote:
      "Je comprends qu'une ordonnance ou la validation du pharmacien peut être nécessaire pour certains de ces produits.",
  },
  ar: {
    single: 'أودّ الاستفسار عن توفّر المنتج التالي:',
    multiple: 'أودّ الاستفسار عن توفّر المنتجات التالية:',
    product: 'المنتج',
    strength: 'التركيز',
    quantity: 'الكمية المطلوبة',
    name: 'الاسم',
    phone: 'الهاتف',
    note: 'ملاحظة',
    closing: 'يرجى تأكيد التوفّر والسعر.',
    rxNote: 'أدرك أنّ بعض هذه المنتجات قد يتطلّب وصفة طبية أو موافقة الصيدلي.',
  },
  en: {
    single: 'I would like to ask about the availability of the following product:',
    multiple: 'I would like to ask about the availability of the following products:',
    product: 'Product',
    strength: 'Strength',
    quantity: 'Requested quantity',
    name: 'Name',
    phone: 'Phone',
    note: 'Note',
    closing: 'Please confirm availability and price.',
    rxNote:
      'I understand that a prescription or pharmacist validation may be required for some of these products.',
  },
};

/** Message pour un seul produit (bouton « Demander la disponibilité »). */
export function singleProductMessage(product: Product, locale: Locale, quantity = 1): string {
  const l = labels[locale];
  const lines = [greeting[locale], '', l.single, '', `${l.product}: ${product.name}`];
  if (product.strength) lines.push(`${l.strength}: ${product.strength}`);
  lines.push(`${l.quantity}: ${quantity}`, '', `${l.name}:`, `${l.phone}:`, '');
  if (product.pharmacistValidation === 'MAY_BE_REQUIRED') lines.push(l.rxNote, '');
  lines.push(l.closing);
  return lines.join('\n');
}

/** Message récapitulatif de « Ma demande ». */
export function requestMessage(
  lines: RequestLine[],
  locale: Locale,
  customer: { name?: string; phone?: string; note?: string } = {},
): string {
  const l = labels[locale];
  const out = [greeting[locale], '', lines.length > 1 ? l.multiple : l.single, ''];

  lines.forEach((line, index) => {
    const strength = line.strength ? ` — ${line.strength}` : '';
    out.push(`${index + 1}. ${line.name}${strength} — ${l.quantity}: ${line.quantity}`);
  });

  out.push('', `${l.name}: ${customer.name ?? ''}`, `${l.phone}: ${customer.phone ?? ''}`);
  if (customer.note) out.push(`${l.note}: ${customer.note}`);
  out.push('');
  if (lines.some((line) => line.needsValidation)) out.push(l.rxNote, '');
  out.push(l.closing);
  return out.join('\n');
}

/** Message générique du bouton flottant / de la page contact. */
export function generalMessage(locale: Locale): string {
  const fallback: Record<Locale, string> = {
    fr: `Bonjour ${siteConfig.name}, j'aurais besoin d'un renseignement.`,
    ar: `مرحباً ${siteConfig.name}، أحتاج إلى استفسار.`,
    en: `Hello ${siteConfig.name}, I would like some information.`,
  };
  return fallback[locale];
}
