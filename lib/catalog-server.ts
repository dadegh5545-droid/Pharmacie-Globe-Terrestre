import 'server-only';
import outputs from '@/amplify_outputs.json';
import {
  categories as seedCategories,
  products as seedProducts,
  type Category,
  type CategoryId,
  type Product,
} from '@/data/catalog';
import type { Availability } from '@/config/site';

/**
 * Chargement du catalogue côté serveur.
 *
 * Le site public est rendu statiquement : le catalogue est donc lu depuis
 * AppSync au moment du build (puis revalidé), et non dans le navigateur —
 * les fiches produit restent indexables et instantanées.
 *
 * Si le backend n'est pas déployé, ne répond pas, ou ne contient encore aucun
 * produit, on retombe sur le catalogue initial de `data/catalog.ts`. Le site
 * ne se retrouve jamais vide.
 */

type Outputs = {
  data?: { url?: string; api_key?: string };
};

const config = outputs as Outputs;
const endpoint = config.data?.url;
const apiKey = config.data?.api_key;

/** Le catalogue est reconstruit au plus toutes les 5 minutes. */
export const CATALOG_REVALIDATE_SECONDS = 300;

const QUERY = /* GraphQL */ `
  query Catalog {
    listProducts(limit: 500) {
      items {
        id
        slug
        name
        activeIngredient
        strength
        formFr
        formAr
        formEn
        packageSizeFr
        packageSizeAr
        packageSizeEn
        manufacturer
        sku
        barcode
        imageUrl
        price
        promoPrice
        stockQuantity
        availability
        pharmacistValidation
        categoryId
        featured
        published
      }
    }
    listCategories(limit: 100) {
      items {
        id
        slug
        nameFr
        nameAr
        nameEn
        icon
        sortOrder
        published
      }
    }
  }
`;

type RawProduct = {
  id: string;
  slug: string | null;
  name: string;
  activeIngredient: string | null;
  strength: string | null;
  formFr: string | null;
  formAr: string | null;
  formEn: string | null;
  packageSizeFr: string | null;
  packageSizeAr: string | null;
  packageSizeEn: string | null;
  manufacturer: string | null;
  sku: string | null;
  barcode: string | null;
  imageUrl: string | null;
  price: number | null;
  promoPrice: number | null;
  stockQuantity: number | null;
  availability: string | null;
  pharmacistValidation: string | null;
  categoryId: string | null;
  featured: boolean | null;
  published: boolean | null;
};

type RawCategory = {
  id: string;
  slug: string;
  nameFr: string;
  nameAr: string;
  nameEn: string;
  icon: string | null;
  sortOrder: number | null;
  published: boolean | null;
};

/** Un champ traduit n'est retenu que si la version française existe. */
function localized(fr: string | null, ar: string | null, en: string | null) {
  if (!fr) return null;
  return { fr, ar: ar || fr, en: en || fr };
}

function toProduct(raw: RawProduct): Product {
  return {
    id: raw.id,
    slug: raw.slug || raw.id,
    name: raw.name,
    activeIngredient: raw.activeIngredient,
    strength: raw.strength,
    form: localized(raw.formFr, raw.formAr, raw.formEn),
    packageSize: localized(raw.packageSizeFr, raw.packageSizeAr, raw.packageSizeEn),
    manufacturer: raw.manufacturer,
    categoryId: (raw.categoryId as CategoryId) ?? 'autres',
    pharmacistValidation: raw.pharmacistValidation === 'NONE' ? 'NONE' : 'MAY_BE_REQUIRED',
    availability: (raw.availability as Availability) ?? 'CONTACT_PHARMACY',
    stockQuantity: raw.stockQuantity,
    price: raw.price,
    promoPrice: raw.promoPrice,
    sku: raw.sku,
    barcode: raw.barcode,
    image: raw.imageUrl,
    featured: raw.featured ?? false,
    published: raw.published ?? true,
  };
}

function toCategory(raw: RawCategory): Category {
  return {
    id: raw.id as CategoryId,
    slug: raw.slug,
    icon: raw.icon || 'Package',
    name: { fr: raw.nameFr, ar: raw.nameAr || raw.nameFr, en: raw.nameEn || raw.nameFr },
  };
}

export type Catalog = {
  products: Product[];
  categories: Category[];
  /** `true` quand les données viennent de `data/catalog.ts` et non de la base. */
  fromSeed: boolean;
};

const seedCatalog: Catalog = {
  products: seedProducts.filter((product) => product.published),
  categories: seedCategories,
  fromSeed: true,
};

export async function loadCatalog(): Promise<Catalog> {
  if (!endpoint || !apiKey) return seedCatalog;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ query: QUERY }),
      next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ['catalog'] },
    });

    if (!response.ok) return seedCatalog;

    const payload = (await response.json()) as {
      data?: {
        listProducts?: { items: RawProduct[] };
        listCategories?: { items: RawCategory[] };
      };
      errors?: unknown[];
    };

    if (payload.errors?.length) {
      console.error('[catalog] AppSync a renvoyé des erreurs', payload.errors);
      return seedCatalog;
    }

    const products = (payload.data?.listProducts?.items ?? [])
      .filter((item) => item.published !== false)
      .map(toProduct);

    // Base encore vide : le catalogue initial reste la meilleure réponse.
    if (products.length === 0) return seedCatalog;

    const categories = (payload.data?.listCategories?.items ?? [])
      .filter((item) => item.published !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map(toCategory);

    return {
      products,
      categories: categories.length > 0 ? categories : seedCategories,
      fromSeed: false,
    };
  } catch (cause) {
    console.error('[catalog] lecture AppSync impossible, repli sur les données initiales', cause);
    return seedCatalog;
  }
}
