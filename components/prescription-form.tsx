'use client';

import { useRef, useState, type FormEvent } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { CheckCircle2, FileUp, Lock, MessageCircle, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n/context';
import { backendReady, getClient } from '@/lib/amplify-client';
import { siteConfig, telHref, whatsappHref } from '@/config/site';
import { generalMessage } from '@/lib/whatsapp';
import { sanitizeText } from '@/lib/utils';

/** Types réellement acceptés — validés côté client ET côté règles S3. */
const ACCEPTED = ['image/jpeg', 'image/png', 'application/pdf'] as const;
const MAX_BYTES = 8 * 1024 * 1024; // 8 Mo

function reference(): string {
  const now = new Date();
  const stamp =
    String(now.getFullYear()).slice(2) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  return `RX-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function PrescriptionForm() {
  const { t, locale } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentRef, setSentRef] = useState<string | null>(null);

  const wa = whatsappHref(generalMessage(locale));

  function pickFile(selected: File | null) {
    setError(null);
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ACCEPTED.includes(selected.type as (typeof ACCEPTED)[number])) {
      setError(t('rx.errorFile'));
      setFile(null);
      return;
    }
    if (selected.size > MAX_BYTES) {
      setError(t('rx.errorSize'));
      setFile(null);
      return;
    }
    setFile(selected);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const name = sanitizeText(form.name, 120);
    const phone = sanitizeText(form.phone, 40);

    if (!name || !phone) {
      setError(t('rx.errorRequired'));
      return;
    }
    if (!file) {
      setError(t('rx.errorFile'));
      return;
    }

    const client = getClient();
    if (!client) {
      setError(t('rx.offline'));
      return;
    }

    setSending(true);
    const ref = reference();

    try {
      // Nom de fichier assaini : jamais de chemin ni de caractère de contrôle.
      const safeName = file.name.replace(/[^\w.\-]/g, '_').slice(-80);
      const upload = await uploadData({
        path: ({ identityId }) => `ordonnances/${identityId}/${ref}-${safeName}`,
        data: file,
        options: { contentType: file.type },
      }).result;

      const { errors } = await client.models.PrescriptionRequest.create({
        reference: ref,
        customerName: name,
        phone,
        message: sanitizeText(form.message, 1000) || undefined,
        fileKey: upload.path,
        fileType: file.type,
        fileSize: file.size,
        locale,
        status: 'NEW',
      });

      if (errors?.length) throw new Error(errors[0].message);

      setSentRef(ref);
      setFile(null);
      setForm({ name: '', phone: '', message: '' });
    } catch (cause) {
      console.error(cause);
      setError(t('rx.errorSend'));
    } finally {
      setSending(false);
    }
  }

  if (sentRef) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-emerald-600" aria-hidden="true" />
        <p className="mt-4 font-semibold text-emerald-900">{t('rx.success')}</p>
        <p className="mt-2 text-sm text-emerald-800" dir="ltr">
          {sentRef}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {!backendReady && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-relaxed text-amber-900">
          {t('rx.offline')}
          <div className="mt-3 flex flex-wrap gap-2">
            {wa && (
              <Button asChild size="sm" variant="whatsapp">
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" />
                  {t('contact.whatsapp')}
                </a>
              </Button>
            )}
            <Button asChild size="sm" variant="outline">
              <a href={telHref(siteConfig.contact.phones[0])} dir="ltr">
                <Phone className="size-4" />
                {siteConfig.contact.phones[0]}
              </a>
            </Button>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="rx-file">{t('rx.file')}</Label>
        <input
          ref={inputRef}
          id="rx-file"
          type="file"
          accept={ACCEPTED.join(',')}
          onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
          className="sr-only"
        />

        {file ? (
          <div className="flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
            <FileUp className="size-5 shrink-0 text-primary-700" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{file.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(1)} Mo
            </span>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              aria-label={t('common.close')}
              className="rounded-full p-1 text-muted-foreground hover:bg-white"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-white px-4 py-8 text-center transition-colors hover:border-primary hover:bg-primary-50/40"
          >
            <FileUp className="size-7 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm font-medium">{t('rx.file')}</span>
            <span className="text-xs text-muted-foreground">{t('rx.fileHint')}</span>
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="rx-name">{t('rx.name')}</Label>
          <Input
            id="rx-name"
            value={form.name}
            onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
            maxLength={120}
            autoComplete="name"
            required
          />
        </div>
        <div>
          <Label htmlFor="rx-phone">{t('rx.phone')}</Label>
          <Input
            id="rx-phone"
            type="tel"
            dir="ltr"
            value={form.phone}
            onChange={(event) => setForm((f) => ({ ...f, phone: event.target.value }))}
            maxLength={40}
            autoComplete="tel"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="rx-message">{t('rx.message')}</Label>
        <Textarea
          id="rx-message"
          value={form.message}
          onChange={(event) => setForm((f) => ({ ...f, message: event.target.value }))}
          maxLength={1000}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4">
        <Lock className="mt-0.5 size-5 shrink-0 text-primary-700" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">{t('rx.privacy')}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t('rx.privacyText')}</p>
        </div>
      </div>

      <Button type="submit" size="lg" disabled={sending || !backendReady} className="w-full sm:w-auto">
        {sending ? t('rx.sending') : t('rx.submit')}
      </Button>
    </form>
  );
}
