'use client';

import { useState, type FormEvent } from 'react';
import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n/context';
import { getClient } from '@/lib/amplify-client';
import { siteConfig, telHref, whatsappHref } from '@/config/site';
import { generalMessage } from '@/lib/whatsapp';
import { sanitizeText } from '@/lib/utils';

/** Carte d'information ; n'est rendue que si la valeur existe réellement. */
function InfoRow({
  Icon,
  label,
  children,
}: {
  Icon: typeof Phone;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 border-b border-border py-4 last:border-0">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 text-sm">{children}</div>
      </div>
    </div>
  );
}

export function ContactView() {
  const { t, locale } = useI18n();
  const { contact, openingHours } = siteConfig;
  const wa = whatsappHref(generalMessage(locale));

  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const name = sanitizeText(form.name, 120);
    const message = sanitizeText(form.message, 2000);
    if (!name || !message) return;

    const client = getClient();
    if (!client) {
      // Sans backend, on bascule sur WhatsApp plutôt que d'échouer.
      setStatus('error');
      return;
    }

    setStatus('sending');
    try {
      const { errors } = await client.models.ContactMessage.create({
        name,
        phone: sanitizeText(form.phone, 40) || undefined,
        message,
        locale,
        status: 'NEW',
      });
      if (errors?.length) throw new Error(errors[0].message);
      setStatus('sent');
      setForm({ name: '', phone: '', message: '' });
    } catch (cause) {
      console.error(cause);
      setStatus('error');
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <div className="rounded-2xl border border-border bg-white px-5 shadow-soft">
          <InfoRow Icon={Phone} label={t('contact.phone')}>
            <div className="flex flex-col gap-1">
              {contact.phones.map((phone) => (
                <a
                  key={phone}
                  href={telHref(phone)}
                  dir="ltr"
                  className="font-medium hover:text-primary-700 hover:underline"
                >
                  {phone}
                </a>
              ))}
            </div>
          </InfoRow>

          {contact.email && (
            <InfoRow Icon={Mail} label={t('contact.email')}>
              <a href={`mailto:${contact.email}`} className="hover:text-primary-700 hover:underline">
                {contact.email}
              </a>
            </InfoRow>
          )}

          <InfoRow Icon={MapPin} label={t('contact.address')}>
            {contact.address ? (
              <span>
                {contact.address}
                {contact.city ? `, ${contact.city}` : ''}
                {contact.country ? `, ${contact.country}` : ''}
              </span>
            ) : (
              <span className="italic text-muted-foreground">{t('contact.addressPending')}</span>
            )}
          </InfoRow>

          <InfoRow Icon={Clock} label={t('contact.hours')}>
            {openingHours.length > 0 ? (
              <ul className="space-y-0.5">
                {openingHours.map((slot) => (
                  <li key={slot.day} className="flex justify-between gap-6">
                    <span className="capitalize">{slot.day}</span>
                    <span dir="ltr" className="text-muted-foreground">
                      {slot.open} – {slot.close}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="italic text-muted-foreground">{t('contact.hoursPending')}</span>
            )}
          </InfoRow>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href={telHref(contact.phones[0])} dir="ltr">
              <Phone className="size-4" />
              {t('contact.call')}
            </a>
          </Button>
          {wa && (
            <Button asChild size="lg" variant="whatsapp">
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" />
                {t('contact.whatsapp')}
              </a>
            </Button>
          )}
          {contact.mapsUrl && (
            <Button asChild size="lg" variant="outline">
              <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="size-4" />
                {t('contact.directions')}
              </a>
            </Button>
          )}
        </div>

        {contact.mapsEmbedUrl && (
          <iframe
            src={contact.mapsEmbedUrl}
            title={t('home.map.title')}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="mt-5 aspect-[16/10] w-full rounded-2xl border border-border"
          />
        )}
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
        <h2 className="mb-5 text-lg font-semibold">{t('contact.form.title')}</h2>

        <div className="mb-4">
          <Label htmlFor="ct-name">{t('contact.form.name')}</Label>
          <Input
            id="ct-name"
            value={form.name}
            onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
            maxLength={120}
            autoComplete="name"
            required
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="ct-phone">{t('contact.form.phone')}</Label>
          <Input
            id="ct-phone"
            type="tel"
            dir="ltr"
            value={form.phone}
            onChange={(event) => setForm((f) => ({ ...f, phone: event.target.value }))}
            maxLength={40}
            autoComplete="tel"
          />
        </div>

        <div className="mb-5">
          <Label htmlFor="ct-message">{t('contact.form.message')}</Label>
          <Textarea
            id="ct-message"
            value={form.message}
            onChange={(event) => setForm((f) => ({ ...f, message: event.target.value }))}
            maxLength={2000}
            required
          />
        </div>

        {status === 'sent' && (
          <p role="status" className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {t('contact.form.success')}
          </p>
        )}
        {status === 'error' && (
          <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t('contact.form.error')}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="ms-1 font-semibold underline"
              >
                {t('contact.whatsapp')}
              </a>
            )}
          </div>
        )}

        <Button type="submit" size="lg" disabled={status === 'sending'} className="w-full">
          {status === 'sending' ? t('rx.sending') : t('contact.form.send')}
        </Button>
      </form>
    </div>
  );
}
