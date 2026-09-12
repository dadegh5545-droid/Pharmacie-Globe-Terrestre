import { getCategory, type Product } from '@/data/catalog';
import type { Locale } from '@/lib/i18n/config';
import { normalize } from '@/lib/utils';

/**
 * Recherche produit : nom commercial, substance active, dosage, forme,
 * conditionnement, fabricant, référence et catégorie sont tous indexés,
 * dans les trois langues.
 */
function haystack(product: Product, locale: Locale): string {
  const category = getCategory(product.categoryId);
  return normalize(
    [
      product.name,
      product.activeIngredient,
      product.strength,
      product.form?.[locale],
      product.form?.fr,
      product.packageSize?.[locale],
      product.manufacturer,
      product.sku,
      product.barcode,
      category.name[locale],
      category.name.fr,
      category.name.en,
    ]
      .filter(Boolean)
      .join(' '),
  );
}

export type SearchHit = { product: Product; score: number };

/**
 * Classe les résultats : une correspondance en début de nom passe avant une
 * correspondance ailleurs, elle-même avant une correspondance sur un champ
 * secondaire (substance active, catégorie…).
 */
export function searchProducts(
  products: Product[],
  query: string,
  locale: Locale,
  limit?: number,
): Product[] {
  const needle = normalize(query.trim());
  if (!needle) return limit ? products.slice(0, limit) : products;

  const hits: SearchHit[] = [];

  for (const product of products) {
    const name = normalize(product.name);
    const full = haystack(product, locale);
    if (!full.includes(needle)) continue;

    let score = 1;
    if (name.includes(needle)) score = 2;
    if (name.startsWith(needle)) score = 3;
    hits.push({ product, score });
  }

  hits.sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));
  const ranked = hits.map((hit) => hit.product);
  return limit ? ranked.slice(0, limit) : ranked;
}
