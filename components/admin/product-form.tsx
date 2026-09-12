'use client';

import { useState, type FormEvent } from 'react';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import { adminData, type CategoryRow, type ProductRow } from '@/lib/admin-data';
import { sanitizeText } from '@/lib/utils';

const AVAILABILITY = [
  { value: 'IN_STOCK', label: 'En stock' },
  { value: 'LOW_STOCK', label: 'Stock limité' },
  { value: 'OUT_OF_STOCK', label: 'Indisponible' },
  { value: 'ON_ORDER', label: 'Sur commande' },
  { value: 'CONTACT_PHARMACY', label: 'Contacter la pharmacie' },
];

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Transforme un nom commercial en identifiant d'URL stable. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/**
 * Formulaire de création / modification d'un produit.
 *
 * Les champs médicaux (substance active, dosage, fabricant) restent
 * facultatifs et vides par défaut : mieux vaut une fiche incomplète, où le
 * site affiche « informations disponibles auprès du pharmacien », qu'une
 * fiche remplie au jugé.
 */
export function ProductForm({
  product,
  categories,
  onDone,
  onCancel,
}: {
  product: ProductRow | null;
  categories: CategoryRow[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    activeIngredient: product?.activeIngredient ?? '',
    strength: product?.strength ?? '',
    formFr: product?.formFr ?? '',
    formAr: product?.formAr ?? '',
    formEn: product?.formEn ?? '',
    packageSizeFr: product?.packageSizeFr ?? '',
    packageSizeAr: product?.packageSizeAr ?? '',
    packageSizeEn: product?.packageSizeEn ?? '',
    manufacturer: product?.manufacturer ?? '',
    sku: product?.sku ?? '',
    barcode: product?.barcode ?? '',
    categoryId: product?.categoryId ?? '',
    imageUrl: product?.imageUrl ?? '',
    price: product?.price?.toString() ?? '',
    promoPrice: product?.promoPrice?.toString() ?? '',
    stockQuantity: product?.stockQuantity?.toString() ?? '',
    minimumStock: product?.minimumStock?.toString() ?? '',
    availability: (product?.availability as string) ?? 'CONTACT_PHARMACY',
    pharmacistValidation: (product?.pharmacistValidation as string) ?? 'MAY_BE_REQUIRED',
    featured: product?.featured ?? false,
    published: product?.published ?? true,
    descriptionFr: product?.descriptionFr ?? '',
    descriptionAr: product?.descriptionAr ?? '',
    descriptionEn: product?.descriptionEn ?? '',
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleImage(file: File | null) {
    if (!file) return;
    setError(null);
    if (!IMAGE_TYPES.includes(file.type)) {
      setError('Format d’image accepté : JPG, PNG ou WebP.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('L’image dépasse 5 Mo.');
      return;
    }

    setUploading(true);
    try {
      const safeName = file.name.replace(/[^\w.\-]/g, '_').slice(-80);
      const result = await uploadData({
        path: `produits/${Date.now()}-${safeName}`,
        data: file,
        options: { contentType: file.type },
      }).result;
      const url = await getUrl({ path: result.path });
      // On conserve l'URL sans les paramètres de signature : le préfixe
      // `produits/` est public en lecture.
      set('imageUrl', url.url.toString().split('?')[0]);
    } catch (cause) {
      console.error(cause);
      setError("Le téléversement de l’image a échoué.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const name = sanitizeText(form.name, 160);
    if (!name) {
      setError('Le nom du produit est obligatoire.');
      return;
    }

    const numeric = (value: string) => (value.trim() === '' ? null : Number(value));

    const payload: Record<string, unknown> = {
      name,
      slug: sanitizeText(form.slug, 160) || slugify(name),
      activeIngredient: sanitizeText(form.activeIngredient, 160) || null,
      strength: sanitizeText(form.strength, 60) || null,
      formFr: sanitizeText(form.formFr, 80) || null,
      formAr: sanitizeText(form.formAr, 80) || null,
      formEn: sanitizeText(form.formEn, 80) || null,
      packageSizeFr: sanitizeText(form.packageSizeFr, 80) || null,
      packageSizeAr: sanitizeText(form.packageSizeAr, 80) || null,
      packageSizeEn: sanitizeText(form.packageSizeEn, 80) || null,
      manufacturer: sanitizeText(form.manufacturer, 120) || null,
      sku: sanitizeText(form.sku, 60) || null,
      barcode: sanitizeText(form.barcode, 60) || null,
      categoryId: form.categoryId || null,
      imageUrl: form.imageUrl || null,
      price: numeric(form.price),
      promoPrice: numeric(form.promoPrice),
      stockQuantity: numeric(form.stockQuantity),
      minimumStock: numeric(form.minimumStock),
      availability: form.availability,
      pharmacistValidation: form.pharmacistValidation,
      featured: form.featured,
      published: form.published,
      descriptionFr: sanitizeText(form.descriptionFr, 2000) || null,
      descriptionAr: sanitizeText(form.descriptionAr, 2000) || null,
      descriptionEn: sanitizeText(form.descriptionEn, 2000) || null,
    };

    setSaving(true);
    try {
      const result = product
        ? await adminData.updateProduct({ id: product.id, ...payload })
        : await adminData.createProduct(payload);
      if (result.errors?.length) throw new Error(result.errors[0].message);
      onDone();
    } catch (cause) {
      console.error(cause);
      setError("L'enregistrement a échoué.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold">Identité</legend>
        <Field label="Nom commercial *">
          <Input
            value={form.name}
            onChange={(event) => set('name', event.target.value)}
            required
            maxLength={160}
          />
        </Field>
        <Field label="Slug (URL)" hint="Laisser vide pour le générer depuis le nom.">
          <Input
            value={form.slug}
            onChange={(event) => set('slug', event.target.value)}
            placeholder={slugify(form.name) || 'amoxi-denk-500'}
            maxLength={160}
          />
        </Field>
        <Field label="Catégorie">
          <Select
            value={form.categoryId}
            onChange={(event) => set('categoryId', event.target.value)}
          >
            <option value="">Autres produits pharmaceutiques</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nameFr}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Fabricant" hint="Uniquement s’il figure sur l’emballage.">
          <Input
            value={form.manufacturer}
            onChange={(event) => set('manufacturer', event.target.value)}
            maxLength={120}
          />
        </Field>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold">Données pharmaceutiques</legend>
        <Field
          label="Substance active"
          hint="À ne renseigner que si elle est lisible sur la boîte."
        >
          <Input
            value={form.activeIngredient}
            onChange={(event) => set('activeIngredient', event.target.value)}
            maxLength={160}
          />
        </Field>
        <Field label="Dosage">
          <Input
            value={form.strength}
            onChange={(event) => set('strength', event.target.value)}
            placeholder="500 mg"
            maxLength={60}
          />
        </Field>
        <Field label="Forme (FR)">
          <Input value={form.formFr} onChange={(event) => set('formFr', event.target.value)} />
        </Field>
        <Field label="Forme (AR)">
          <Input
            value={form.formAr}
            onChange={(event) => set('formAr', event.target.value)}
            dir="rtl"
          />
        </Field>
        <Field label="Forme (EN)">
          <Input value={form.formEn} onChange={(event) => set('formEn', event.target.value)} />
        </Field>
        <Field label="Conditionnement (FR)">
          <Input
            value={form.packageSizeFr}
            onChange={(event) => set('packageSizeFr', event.target.value)}
            placeholder="20 comprimés"
          />
        </Field>
        <Field label="Conditionnement (AR)">
          <Input
            value={form.packageSizeAr}
            onChange={(event) => set('packageSizeAr', event.target.value)}
            dir="rtl"
          />
        </Field>
        <Field label="Conditionnement (EN)">
          <Input
            value={form.packageSizeEn}
            onChange={(event) => set('packageSizeEn', event.target.value)}
          />
        </Field>
        <Field
          label="Contrôle pharmaceutique"
          hint="« Validation possible » affiche le bandeau ordonnance et retire l’ajout direct."
        >
          <Select
            value={form.pharmacistValidation}
            onChange={(event) => set('pharmacistValidation', event.target.value)}
          >
            <option value="MAY_BE_REQUIRED">Ordonnance / validation possible</option>
            <option value="NONE">Aucun contrôle particulier</option>
          </Select>
        </Field>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold">Stock, référence et prix</legend>
        <Field label="SKU">
          <Input value={form.sku} onChange={(event) => set('sku', event.target.value)} />
        </Field>
        <Field label="Code-barres">
          <Input
            value={form.barcode}
            onChange={(event) => set('barcode', event.target.value)}
            dir="ltr"
          />
        </Field>
        <Field label="Disponibilité">
          <Select
            value={form.availability}
            onChange={(event) => set('availability', event.target.value)}
          >
            {AVAILABILITY.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Quantité en stock">
          <Input
            type="number"
            min={0}
            value={form.stockQuantity}
            onChange={(event) => set('stockQuantity', event.target.value)}
          />
        </Field>
        <Field label="Stock minimum" hint="Déclenche l’alerte du tableau de bord.">
          <Input
            type="number"
            min={0}
            value={form.minimumStock}
            onChange={(event) => set('minimumStock', event.target.value)}
          />
        </Field>
        <Field label="Prix" hint="Affiché seulement si l’affichage des prix est activé.">
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(event) => set('price', event.target.value)}
          />
        </Field>
        <Field label="Prix promotionnel">
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.promoPrice}
            onChange={(event) => set('promoPrice', event.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Photo</legend>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium hover:border-primary">
            {uploading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="size-4" aria-hidden="true" />
            )}
            Téléverser une image
            <input
              type="file"
              accept={IMAGE_TYPES.join(',')}
              className="sr-only"
              onChange={(event) => handleImage(event.target.files?.[0] ?? null)}
            />
          </label>
          {form.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.imageUrl}
              alt=""
              className="size-16 rounded-xl border border-border object-contain"
            />
          )}
        </div>
        <Input
          className="mt-3"
          value={form.imageUrl}
          onChange={(event) => set('imageUrl', event.target.value)}
          placeholder="/products/amoxi-denk-500.jpg"
          dir="ltr"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Un chemin local (<code>/products/…</code>) est accepté si la photo est déposée dans{' '}
          <code>public/products/</code>.
        </p>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="mb-2 text-sm font-semibold">Description (facultative)</legend>
        <Field label="Français">
          <Textarea
            value={form.descriptionFr}
            onChange={(event) => set('descriptionFr', event.target.value)}
            maxLength={2000}
          />
        </Field>
        <Field label="العربية">
          <Textarea
            value={form.descriptionAr}
            onChange={(event) => set('descriptionAr', event.target.value)}
            dir="rtl"
            maxLength={2000}
          />
        </Field>
        <Field label="English">
          <Textarea
            value={form.descriptionEn}
            onChange={(event) => set('descriptionEn', event.target.value)}
            maxLength={2000}
          />
        </Field>
        <p className="text-xs text-muted-foreground">
          N’y indiquez ni posologie, ni indication, ni contre-indication : ces informations
          relèvent de la notice et du pharmacien.
        </p>
      </fieldset>

      <fieldset className="flex flex-wrap gap-6">
        <label className="inline-flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(event) => set('published', event.target.checked)}
            className="size-4 accent-[hsl(162_72%_32%)]"
          />
          Visible sur le site
        </label>
        <label className="inline-flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => set('featured', event.target.checked)}
            className="size-4 accent-[hsl(162_72%_32%)]"
          />
          Mis en avant sur l’accueil
        </label>
      </fieldset>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving || uploading}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
