'use client';

import { AlertTriangle, CheckCircle2, Clock, PhoneCall, XCircle } from 'lucide-react';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { useI18n, type TranslationKey } from '@/lib/i18n/context';
import type { Availability } from '@/config/site';

const STYLES: Record<Availability, { variant: BadgeProps['variant']; Icon: typeof CheckCircle2 }> = {
  IN_STOCK: { variant: 'success', Icon: CheckCircle2 },
  LOW_STOCK: { variant: 'warning', Icon: AlertTriangle },
  OUT_OF_STOCK: { variant: 'neutral', Icon: XCircle },
  ON_ORDER: { variant: 'info', Icon: Clock },
  CONTACT_PHARMACY: { variant: 'default', Icon: PhoneCall },
};

export function AvailabilityBadge({ value }: { value: Availability }) {
  const { t } = useI18n();
  const { variant, Icon } = STYLES[value];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden="true" />
      {t(`availability.${value}` as TranslationKey)}
    </Badge>
  );
}
