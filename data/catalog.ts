import type { Availability } from '@/config/site';
import availableImages from './product-images.generated.json';

/**
 * ────────────────────────────────────────────────────────────────────────────
 *  CATALOGUE INITIAL
 * ────────────────────────────────────────────────────────────────────────────
 *
 *  RÈGLE MÉDICALE ABSOLUE : aucun champ n'est rempli « au jugé ».
 *  Posologie, indications, contre-indications, effets indésirables,
 *  substance active et fabricant ne sont renseignés que lorsqu'ils ont été
 *  fournis ou lus sur l'emballage. Sinon la valeur reste `null` et
 *  l'interface affiche « Informations détaillées disponibles auprès du
 *  pharmacien. »
 *
 *  Ce fichier sert de jeu de départ : dès que le backend Amplify est déployé,
 *  le catalogue est lu depuis la base et administrable depuis /admin.
 */

/**
 * Photos produit : `scripts/ensure-outputs.mjs` inventorie `public/products/`
 * avant chaque build. Un produit dont la photo n'a pas encore été déposée
 * reçoit `null` et s'affiche avec le visuel neutre — jamais une image cassée.
 * Il suffit de nommer le fichier d'après le slug du produit pour l'activer
 * (ex. `public/products/amoxi-denk-500.jpg`).
 */
function resolveImage(slug: string): string | null {
  return (availableImages as Record<string, string>)[slug] ?? null;
}

/** Niveau de contrôle pharmaceutique affiché sur la fiche produit. */
export type PharmacistValidation =
  /** Ordonnance ou validation du pharmacien susceptible d'être exigée. */
  | 'MAY_BE_REQUIRED'
  /** Aucun contrôle particulier connu (parapharmacie, hygiène…). */
  | 'NONE';

export type CategoryId =
  | 'medicaments'
  | 'douleur-fievre'
  | 'digestif'
  | 'vitamines'
  | 'sirops'
  | 'hygiene'
  | 'bebe-maman'
  | 'premiers-secours'
  | 'dermatologie'
  | 'bien-etre'
  | 'autres';

export type Category = {
  id: CategoryId;
  slug: string;
  icon: string;
  name: { fr: string; ar: string; en: string };
};

export const categories: Category[] = [
  { id: 'medicaments', slug: 'medicaments', icon: 'Pill', name: { fr: 'Médicaments', ar: 'أدوية', en: 'Medicines' } },
  { id: 'douleur-fievre', slug: 'douleur-fievre', icon: 'Thermometer', name: { fr: 'Douleur & Fièvre', ar: 'الألم والحمّى', en: 'Pain & Fever' } },
  { id: 'digestif', slug: 'digestif', icon: 'Activity', name: { fr: 'Digestif', ar: 'الجهاز الهضمي', en: 'Digestive' } },
  { id: 'vitamines', slug: 'vitamines', icon: 'Leaf', name: { fr: 'Vitamines & Compléments', ar: 'فيتامينات ومكمّلات', en: 'Vitamins & Supplements' } },
  { id: 'sirops', slug: 'sirops', icon: 'FlaskConical', name: { fr: 'Sirops', ar: 'أشربة', en: 'Syrups' } },
  { id: 'hygiene', slug: 'hygiene', icon: 'Droplets', name: { fr: 'Hygiène & Soins', ar: 'النظافة والعناية', en: 'Hygiene & Care' } },
  { id: 'bebe-maman', slug: 'bebe-maman', icon: 'Baby', name: { fr: 'Bébé & Maman', ar: 'الأم والطفل', en: 'Baby & Mother' } },
  { id: 'premiers-secours', slug: 'premiers-secours', icon: 'BriefcaseMedical', name: { fr: 'Premiers secours', ar: 'الإسعافات الأولية', en: 'First Aid' } },
  { id: 'dermatologie', slug: 'dermatologie', icon: 'Sparkles', name: { fr: 'Dermatologie', ar: 'الأمراض الجلدية', en: 'Dermatology' } },
  { id: 'bien-etre', slug: 'bien-etre', icon: 'HeartPulse', name: { fr: 'Bien-être', ar: 'الصحة والعافية', en: 'Wellness' } },
  { id: 'autres', slug: 'autres', icon: 'Package', name: { fr: 'Autres produits pharmaceutiques', ar: 'منتجات صيدلانية أخرى', en: 'Other pharmaceutical products' } },
];

export type Product = {
  id: string;
  slug: string;
  /** Nom commercial — identique dans les trois langues (marque déposée). */
  name: string;
  /** Substance active, uniquement si lue sur l'emballage. */
  activeIngredient: string | null;
  /** Dosage tel qu'imprimé (« 500 mg »). */
  strength: string | null;
  /** Forme galénique : comprimé, sirop… `null` si non vérifiée. */
  form: { fr: string; ar: string; en: string } | null;
  /** Conditionnement (« 20 comprimés »). */
  packageSize: { fr: string; ar: string; en: string } | null;
  /** Fabricant, uniquement s'il figure sur la boîte. */
  manufacturer: string | null;
  categoryId: CategoryId;
  pharmacistValidation: PharmacistValidation;
  availability: Availability;
  stockQuantity: number | null;
  /** Prix : `null` tant qu'aucun tarif n'a été communiqué. */
  price: number | null;
  promoPrice: number | null;
  sku: string | null;
  barcode: string | null;
  /**
   * Photo produit. Déposer le fichier dans `public/products/`.
   * Si le fichier est absent, la carte affiche automatiquement un visuel
   * neutre — aucun lien cassé n'apparaît.
   */
  image: string | null;
  featured: boolean;
  published: boolean;
};

export const products: Product[] = [
  {
    id: 'amoxi-denk-500',
    slug: 'amoxi-denk-500',
    name: 'Amoxi-Denk 500',
    activeIngredient: 'Amoxicilline',
    strength: '500 mg',
    form: { fr: 'Comprimés', ar: 'أقراص', en: 'Tablets' },
    packageSize: { fr: '20 comprimés', ar: '٢٠ قرصاً', en: '20 tablets' },
    manufacturer: null,
    categoryId: 'medicaments',
    pharmacistValidation: 'MAY_BE_REQUIRED',
    availability: 'CONTACT_PHARMACY',
    stockQuantity: null,
    price: null,
    promoPrice: null,
    sku: null,
    barcode: null,
    image: resolveImage('amoxi-denk-500'),
    featured: true,
    published: true,
  },
  {
    id: 'amoxi-denk-1000',
    slug: 'amoxi-denk-1000',
    name: 'Amoxi-Denk 1000',
    activeIngredient: 'Amoxicilline',
    strength: '1000 mg',
    form: { fr: 'Comprimés', ar: 'أقراص', en: 'Tablets' },
    packageSize: { fr: '10 comprimés', ar: '١٠ أقراص', en: '10 tablets' },
    manufacturer: null,
    categoryId: 'medicaments',
    pharmacistValidation: 'MAY_BE_REQUIRED',
    availability: 'CONTACT_PHARMACY',
    stockQuantity: null,
    price: null,
    promoPrice: null,
    sku: null,
    barcode: null,
    image: resolveImage('amoxi-denk-1000'),
    featured: true,
    published: true,
  },
  {
    id: 'nexium-40',
    slug: 'nexium-40',
    name: 'Nexium',
    activeIngredient: 'Ésoméprazole',
    strength: '40 mg',
    form: {
      fr: 'Comprimés gastro-résistants',
      ar: 'أقراص مقاومة لحموضة المعدة',
      en: 'Gastro-resistant tablets',
    },
    packageSize: {
      fr: '14 comprimés gastro-résistants',
      ar: '١٤ قرصاً مقاوماً لحموضة المعدة',
      en: '14 gastro-resistant tablets',
    },
    manufacturer: 'AstraZeneca',
    categoryId: 'medicaments',
    pharmacistValidation: 'MAY_BE_REQUIRED',
    availability: 'CONTACT_PHARMACY',
    stockQuantity: null,
    price: null,
    promoPrice: null,
    sku: null,
    barcode: null,
    image: resolveImage('nexium-40'),
    featured: true,
    published: true,
  },
  {
    id: 'rabetok-d',
    slug: 'rabetok-d',
    name: 'Rabetok D',
    activeIngredient: null,
    strength: null,
    form: null,
    packageSize: null,
    manufacturer: null,
    categoryId: 'autres',
    pharmacistValidation: 'MAY_BE_REQUIRED',
    availability: 'CONTACT_PHARMACY',
    stockQuantity: null,
    price: null,
    promoPrice: null,
    sku: null,
    barcode: null,
    image: resolveImage('rabetok-d'),
    featured: false,
    published: true,
  },
  {
    id: 'amaday-5',
    slug: 'amaday-5',
    name: 'Amaday',
    activeIngredient: null,
    strength: '5 mg',
    form: null,
    packageSize: null,
    manufacturer: null,
    categoryId: 'autres',
    pharmacistValidation: 'MAY_BE_REQUIRED',
    availability: 'CONTACT_PHARMACY',
    stockQuantity: null,
    price: null,
    promoPrice: null,
    sku: null,
    barcode: null,
    image: resolveImage('amaday-5'),
    featured: false,
    published: true,
  },
  {
    id: 'ibumol-sirop',
    slug: 'ibumol-sirop',
    name: 'Ibumol',
    activeIngredient: null,
    strength: null,
    form: { fr: 'Sirop', ar: 'شراب', en: 'Syrup' },
    packageSize: null,
    manufacturer: null,
    categoryId: 'sirops',
    pharmacistValidation: 'MAY_BE_REQUIRED',
    availability: 'CONTACT_PHARMACY',
    stockQuantity: null,
    price: null,
    promoPrice: null,
    sku: null,
    barcode: null,
    image: resolveImage('ibumol-sirop'),
    featured: true,
    published: true,
  },
  {
    id: 'nuravit-sirop',
    slug: 'nuravit-sirop',
    name: 'Nuravit',
    activeIngredient: null,
    strength: null,
    form: { fr: 'Sirop', ar: 'شراب', en: 'Syrup' },
    packageSize: null,
    manufacturer: null,
    categoryId: 'sirops',
    pharmacistValidation: 'MAY_BE_REQUIRED',
    availability: 'CONTACT_PHARMACY',
    stockQuantity: null,
    price: null,
    promoPrice: null,
    sku: null,
    barcode: null,
    image: resolveImage('nuravit-sirop'),
    featured: false,
    published: true,
  },
  {
    id: 'litacol-sirop',
    slug: 'litacol-sirop',
    name: 'Litacol',
    activeIngredient: null,
    strength: null,
    form: { fr: 'Sirop', ar: 'شراب', en: 'Syrup' },
    packageSize: null,
    manufacturer: null,
    categoryId: 'sirops',
    pharmacistValidation: 'MAY_BE_REQUIRED',
    availability: 'CONTACT_PHARMACY',
    stockQuantity: null,
    price: null,
    promoPrice: null,
    sku: null,
    barcode: null,
    image: resolveImage('litacol-sirop'),
    featured: false,
    published: true,
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getCategory(id: CategoryId): Category {
  return categories.find((category) => category.id === id) ?? categories[categories.length - 1];
}

/** Catégories effectivement représentées dans le catalogue. */
export function usedCategories(list: Product[] = products): Category[] {
  const ids = new Set(list.filter((p) => p.published).map((p) => p.categoryId));
  return categories.filter((category) => ids.has(category.id));
}
