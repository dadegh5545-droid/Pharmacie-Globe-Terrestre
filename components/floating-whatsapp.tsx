'use client';

import { MessageCircle, Phone } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { siteConfig, telHref, whatsappHref } from '@/config/site';
import { generalMessage } from '@/lib/whatsapp';

/**
 * Bouton d'action flottant, prioritairement WhatsApp.
 * Tant que l'indicatif international n'est pas configuré, WhatsApp est
 * impossible : on propose alors l'appel téléphonique, jamais un lien mort.
 */
export function FloatingContact() {
  const { t, locale } = useI18n();
  const wa = whatsappHref(generalMessage(locale));
  const phone = siteConfig.contact.phones[0];

  return (
    <a
      href={wa ?? telHref(phone)}
      target={wa ? '_blank' : undefined}
      rel={wa ? 'noopener noreferrer' : undefined}
      aria-label={wa ? t('contact.whatsapp') : t('contact.call')}
      className="fixed bottom-5 end-5 z-40 inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:size-[52px]"
    >
      {wa ? <MessageCircle className="size-7" /> : <Phone className="size-6" />}
    </a>
  );
}
