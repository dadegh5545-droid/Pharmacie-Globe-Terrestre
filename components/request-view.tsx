'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ClipboardList,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n/context';
import { useRequest, MAX_QUANTITY } from '@/lib/request-store';
import { siteConfig, telHref, whatsappHref } from '@/config/site';
import { requestMessage } from '@/lib/whatsapp';
import { sanitizeText } from '@/lib/utils';
import { getClient } from '@/lib/amplify-client';
import type { RequestLine } from '@/lib/request-store';

/** Référence lisible d'une demande, du type `DEM-260912-4831`. */
function buildReference(): string {
  const now = new Date();
  const stamp =
    String(now.getFullYear()).slice(2) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  return `DEM-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * Enregistre la demande côté back-office en plus de l'envoi WhatsApp, afin
 * qu'elle apparaisse dans /admin/demandes même si le client n'envoie jamais
 * le message. L'échec de cet enregistrement ne doit jamais bloquer le client :
 * WhatsApp reste le canal principal.
 */
async function persistRequest(
  lines: RequestLine[],
  locale: string,
  customer: { name: string; phone: string; note: string },
): Promise<void> {
  const client = getClient();
  if (!client || !customer.name || !customer.phone) return;

  try {
    const { data: request, errors } = await client.models.OrderRequest.create({
      reference: buildReference(),
      customerName: customer.name,
      phone: customer.phone,
      note: customer.note || undefined,
      channel: 'WHATSAPP',
      locale,
      status: 'NEW',
    });
    if (errors?.length || !request) return;

    await Promise.all(
      lines.map((line) =>
        client.models.OrderItem.create({
          orderRequestId: request.id,
          productId: line.productId,
          productName: line.name,
          strength: line.strength ?? undefined,
          quantity: line.quantity,
        }),
      ),
    );
  } catch (cause) {
    console.error(cause);
  }
}

/**
 * « Ma demande » : liste de produits envoyée à la pharmacie par WhatsApp.
 * Aucun paiement, aucune confirmation de vente — la pharmacie répond avec la
 * disponibilité et le prix.
 */
export function RequestView() {
  const { t, locale, href } = useI18n();
  const { lines, count, ready, setQuantity, remove, clear } = useRequest();
  const [customer, setCustomer] = useState({ name: '', phone: '', note: '' });

  const message = useMemo(
    () =>
      requestMessage(lines, locale, {
        name: sanitizeText(customer.name, 120),
        phone: sanitizeText(customer.phone, 40),
        note: sanitizeText(customer.note, 500),
      }),
    [lines, locale, customer],
  );

  const wa = whatsappHref(message);

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-2xl bg-muted" aria-hidden="true" />;
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center">
        <ClipboardList className="mx-auto size-10 text-muted-foreground/40" aria-hidden="true" />
        <p className="mt-4 font-medium">{t('request.empty')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('request.emptyHint')}</p>
        <Button asChild className="mt-5">
          <Link href={href('/produits')}>{t('request.browse')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
      <div className="rounded-2xl border border-border bg-white shadow-soft">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <p className="text-sm font-semibold">
            {count} {t('request.items')}
          </p>
          <Button variant="ghost" size="sm" onClick={clear}>
            <Trash2 className="size-4" />
            {t('request.clear')}
          </Button>
        </div>

        <ul>
          {lines.map((line) => (
            <li
              key={line.productId}
              className="flex flex-wrap items-center gap-4 border-b border-border px-5 py-4 last:border-0"
            >
              <div className="min-w-[160px] flex-1">
                <Link
                  href={href(`/products/${line.slug}`)}
                  className="font-medium hover:text-primary-700 hover:underline"
                >
                  {line.name}
                </Link>
                {line.strength && (
                  <p className="text-sm text-muted-foreground">{line.strength}</p>
                )}
                {line.needsValidation && (
                  <Badge variant="warning" className="mt-1.5">
                    <ShieldAlert aria-hidden="true" />
                    {t('product.rxShort')}
                  </Badge>
                )}
              </div>

              <div
                className="inline-flex items-center rounded-xl border border-border"
                aria-label={t('request.quantity')}
              >
                <button
                  type="button"
                  onClick={() => setQuantity(line.productId, line.quantity - 1)}
                  aria-label="-"
                  className="grid size-9 place-items-center text-primary-700"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-9 text-center text-sm font-semibold">{line.quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(line.productId, line.quantity + 1)}
                  disabled={line.quantity >= MAX_QUANTITY}
                  aria-label="+"
                  className="grid size-9 place-items-center text-primary-700 disabled:text-muted-foreground/40"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => remove(line.productId)}
                className="text-sm text-destructive underline-offset-4 hover:underline"
              >
                {t('request.remove')}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          <h2 className="mb-4 text-base font-semibold">{t('request.yourInfo')}</h2>

          <div className="mb-4">
            <Label htmlFor="req-name">{t('request.name')}</Label>
            <Input
              id="req-name"
              value={customer.name}
              onChange={(event) => setCustomer((c) => ({ ...c, name: event.target.value }))}
              maxLength={120}
              autoComplete="name"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="req-phone">{t('request.phone')}</Label>
            <Input
              id="req-phone"
              type="tel"
              dir="ltr"
              value={customer.phone}
              onChange={(event) => setCustomer((c) => ({ ...c, phone: event.target.value }))}
              maxLength={40}
              autoComplete="tel"
            />
          </div>

          <div>
            <Label htmlFor="req-note">{t('request.message')}</Label>
            <Textarea
              id="req-note"
              value={customer.note}
              onChange={(event) => setCustomer((c) => ({ ...c, note: event.target.value }))}
              maxLength={500}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          {wa ? (
            <Button asChild size="lg" variant="whatsapp" className="w-full">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  persistRequest(lines, locale, {
                    name: sanitizeText(customer.name, 120),
                    phone: sanitizeText(customer.phone, 40),
                    note: sanitizeText(customer.note, 500),
                  })
                }
              >
                <MessageCircle className="size-4" />
                {t('request.sendWhatsapp')}
              </a>
            </Button>
          ) : (
            <>
              <p className="mb-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                {t('request.waUnavailable')}
              </p>
              <Button asChild size="lg" className="w-full">
                <a href={telHref(siteConfig.contact.phones[0])} dir="ltr">
                  <Phone className="size-4" />
                  {siteConfig.contact.phones[0]}
                </a>
              </Button>
            </>
          )}

          <details className="mt-4 rounded-xl border border-border bg-muted/40 p-3">
            <summary className="cursor-pointer text-sm font-medium">
              {t('request.preview')}
            </summary>
            <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-muted-foreground">
              {message}
            </pre>
          </details>
        </div>
      </aside>
    </div>
  );
}
