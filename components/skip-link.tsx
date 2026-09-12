'use client';

import { useI18n } from '@/lib/i18n/context';

/** Lien d'evitement clavier, premier element focusable de la page. */
export function SkipLink() {
  const { t } = useI18n();
  return (
    <a href="#contenu" className="skip-link">
      {t('common.skipToContent')}
    </a>
  );
}
