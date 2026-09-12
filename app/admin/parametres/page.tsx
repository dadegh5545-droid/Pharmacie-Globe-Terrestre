'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Check, Info } from 'lucide-react';
import {
  AdminCard,
  AdminPageTitle,
  ErrorState,
  TableSkeleton,
  useAdminResource,
} from '@/components/admin/admin-ui';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { adminData } from '@/lib/admin-data';
import { siteConfig } from '@/config/site';
import { sanitizeText } from '@/lib/utils';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

type Hours = Record<string, { open: string; close: string }>;

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-border px-6 py-6 last:border-0">
      <h2 className="text-sm font-semibold">{title}</h2>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

/**
 * Informations de l'établissement.
 *
 * Ces valeurs prennent le pas sur `config/site.ts` une fois enregistrées :
 * la pharmacie peut ainsi corriger adresse, horaires, devise et indicatif
 * sans redéploiement.
 */
export default function AdminSettingsPage() {
  const load = useCallback(() => adminData.settings(), []);
  const { data, error, loading, reload } = useAdminResource(load);

  const [form, setForm] = useState({
    businessName: '',
    phone1: '',
    phone2: '',
    countryCode: '',
    whatsappPhone: '',
    email: '',
    address: '',
    city: '',
    country: '',
    mapsUrl: '',
    mapsEmbedUrl: '',
    facebook: '',
    instagram: '',
    currencyCode: '',
    currencySymbol: '',
    currencyName: '',
    showPrices: false,
    lowStockThreshold: '10',
  });
  const [hours, setHours] = useState<Hours>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm({
      businessName: data.businessName ?? siteConfig.name,
      phone1: data.phones?.[0] ?? siteConfig.contact.phones[0],
      phone2: data.phones?.[1] ?? siteConfig.contact.phones[1] ?? '',
      countryCode: data.countryCode ?? '',
      whatsappPhone: data.whatsappPhone ?? '',
      email: data.email ?? '',
      address: data.address ?? '',
      city: data.city ?? '',
      country: data.country ?? '',
      mapsUrl: data.mapsUrl ?? '',
      mapsEmbedUrl: data.mapsEmbedUrl ?? '',
      facebook: data.facebook ?? '',
      instagram: data.instagram ?? '',
      currencyCode: data.currencyCode ?? '',
      currencySymbol: data.currencySymbol ?? '',
      currencyName: data.currencyName ?? '',
      showPrices: data.showPrices ?? false,
      lowStockThreshold: String(data.lowStockThreshold ?? siteConfig.lowStockThreshold),
    });

    try {
      const parsed = data.openingHours ? (JSON.parse(data.openingHours) as Hours) : {};
      setHours(parsed);
    } catch {
      setHours({});
    }
  }, [data]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await adminData.saveSettings({
        ...(data?.id ? { id: data.id } : {}),
        businessName: sanitizeText(form.businessName, 160),
        phones: [form.phone1, form.phone2].map((p) => sanitizeText(p, 40)).filter(Boolean),
        countryCode: sanitizeText(form.countryCode, 6).replace(/\D/g, ''),
        whatsappPhone: sanitizeText(form.whatsappPhone, 40),
        email: sanitizeText(form.email, 160),
        address: sanitizeText(form.address, 240),
        city: sanitizeText(form.city, 120),
        country: sanitizeText(form.country, 120),
        mapsUrl: sanitizeText(form.mapsUrl, 500),
        mapsEmbedUrl: sanitizeText(form.mapsEmbedUrl, 500),
        facebook: sanitizeText(form.facebook, 300),
        instagram: sanitizeText(form.instagram, 300),
        currencyCode: sanitizeText(form.currencyCode, 8).toUpperCase(),
        currencySymbol: sanitizeText(form.currencySymbol, 8),
        currencyName: sanitizeText(form.currencyName, 60),
        showPrices: form.showPrices,
        lowStockThreshold: Number(form.lowStockThreshold) || 10,
        openingHours: JSON.stringify(hours),
      } as never);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
      reload();
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <TableSkeleton rows={6} />;

  return (
    <>
      <AdminPageTitle
        title="Paramètres"
        description="Informations de l’établissement, devise et configuration WhatsApp."
      />

      {error && <ErrorState message={error} />}

      <form onSubmit={handleSubmit}>
        <AdminCard>
          <Section title="Établissement">
            <div className="sm:col-span-2">
              <Label>Nom commercial</Label>
              <Input
                value={form.businessName}
                onChange={(event) => set('businessName', event.target.value)}
              />
            </div>
            <div>
              <Label>Adresse</Label>
              <Input value={form.address} onChange={(event) => set('address', event.target.value)} />
            </div>
            <div>
              <Label>Ville</Label>
              <Input value={form.city} onChange={(event) => set('city', event.target.value)} />
            </div>
            <div>
              <Label>Pays</Label>
              <Input value={form.country} onChange={(event) => set('country', event.target.value)} />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input
                type="email"
                dir="ltr"
                value={form.email}
                onChange={(event) => set('email', event.target.value)}
              />
            </div>
            <div>
              <Label>Lien Google Maps (itinéraire)</Label>
              <Input
                dir="ltr"
                value={form.mapsUrl}
                onChange={(event) => set('mapsUrl', event.target.value)}
              />
            </div>
            <div>
              <Label>URL d’intégration de la carte</Label>
              <Input
                dir="ltr"
                placeholder="https://www.google.com/maps/embed?..."
                value={form.mapsEmbedUrl}
                onChange={(event) => set('mapsEmbedUrl', event.target.value)}
              />
            </div>
          </Section>

          <Section
            title="Téléphone et WhatsApp"
            hint="Sans indicatif international, les boutons WhatsApp restent désactivés — un lien wa.me exige un numéro complet."
          >
            <div>
              <Label>Téléphone 1</Label>
              <Input
                dir="ltr"
                value={form.phone1}
                onChange={(event) => set('phone1', event.target.value)}
              />
            </div>
            <div>
              <Label>Téléphone 2</Label>
              <Input
                dir="ltr"
                value={form.phone2}
                onChange={(event) => set('phone2', event.target.value)}
              />
            </div>
            <div>
              <Label>Indicatif international</Label>
              <Input
                dir="ltr"
                placeholder="216, 212, 213, 33…"
                value={form.countryCode}
                onChange={(event) => set('countryCode', event.target.value)}
              />
            </div>
            <div>
              <Label>Numéro WhatsApp (si différent)</Label>
              <Input
                dir="ltr"
                value={form.whatsappPhone}
                onChange={(event) => set('whatsappPhone', event.target.value)}
              />
            </div>
          </Section>

          <Section title="Horaires d’ouverture" hint="Laisser vide un jour de fermeture.">
            <div className="grid gap-2 sm:col-span-2">
              {DAYS.map((day) => (
                <div key={day} className="grid grid-cols-[110px_1fr_1fr] items-center gap-2">
                  <span className="text-sm">{DAY_LABELS[day]}</span>
                  <Input
                    type="time"
                    className="h-9"
                    value={hours[day]?.open ?? ''}
                    onChange={(event) =>
                      setHours((current) => ({
                        ...current,
                        [day]: { open: event.target.value, close: current[day]?.close ?? '' },
                      }))
                    }
                  />
                  <Input
                    type="time"
                    className="h-9"
                    value={hours[day]?.close ?? ''}
                    onChange={(event) =>
                      setHours((current) => ({
                        ...current,
                        [day]: { open: current[day]?.open ?? '', close: event.target.value },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </Section>

          <Section
            title="Devise et affichage des prix"
            hint="Tant que l’affichage est désactivé, les fiches indiquent « Prix sur demande »."
          >
            <div>
              <Label>Code (ISO)</Label>
              <Input
                dir="ltr"
                placeholder="TND, MAD, DZD, EUR…"
                value={form.currencyCode}
                onChange={(event) => set('currencyCode', event.target.value)}
              />
            </div>
            <div>
              <Label>Symbole</Label>
              <Input
                value={form.currencySymbol}
                onChange={(event) => set('currencySymbol', event.target.value)}
              />
            </div>
            <div>
              <Label>Nom de la devise</Label>
              <Input
                value={form.currencyName}
                onChange={(event) => set('currencyName', event.target.value)}
              />
            </div>
            <div>
              <Label>Seuil d’alerte stock</Label>
              <Input
                type="number"
                min={0}
                value={form.lowStockThreshold}
                onChange={(event) => set('lowStockThreshold', event.target.value)}
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-medium sm:col-span-2">
              <input
                type="checkbox"
                checked={form.showPrices}
                onChange={(event) => set('showPrices', event.target.checked)}
                className="size-4 accent-[hsl(162_72%_32%)]"
              />
              Afficher les prix sur le site
            </label>
          </Section>

          <Section title="Réseaux sociaux">
            <div>
              <Label>Facebook</Label>
              <Input
                dir="ltr"
                value={form.facebook}
                onChange={(event) => set('facebook', event.target.value)}
              />
            </div>
            <div>
              <Label>Instagram</Label>
              <Input
                dir="ltr"
                value={form.instagram}
                onChange={(event) => set('instagram', event.target.value)}
              />
            </div>
          </Section>
        </AdminCard>

        <div className="mt-6 flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
              <Check className="size-4" />
              Paramètres enregistrés
            </span>
          )}
        </div>

        <p className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Ces réglages sont lus au chargement du site. Les valeurs de{' '}
          <code>config/site.ts</code> servent de repli tant qu’un champ reste vide ici.
        </p>
      </form>
    </>
  );
}
