'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Category, CategoryId, Product } from '@/data/catalog';

/**
 * Catalogue chargé une seule fois côté serveur (`loadCatalog`) puis mis à
 * disposition des composants client — barre de recherche, cartes produit,
 * sections d'accueil. Aucun de ces composants n'interroge la base lui-même :
 * l'affichage reste cohérent d'un bout à l'autre de la page.
 */
type CatalogValue = {
  products: Product[];
  categories: Category[];
  getCategory: (id: CategoryId | string | null | undefined) => Category;
  /** Catégories effectivement représentées dans le catalogue publié. */
  usedCategories: () => Category[];
};

const CatalogContext = createContext<CatalogValue | null>(null);

const FALLBACK_CATEGORY: Category = {
  id: 'autres',
  slug: 'autres',
  icon: 'Package',
  name: {
    fr: 'Autres produits pharmaceutiques',
    ar: 'منتجات صيدلانية أخرى',
    en: 'Other pharmaceutical products',
  },
};

export function CatalogProvider({
  products,
  categories,
  children,
}: {
  products: Product[];
  categories: Category[];
  children: ReactNode;
}) {
  const value = useMemo<CatalogValue>(
    () => ({
      products,
      categories,
      getCategory: (id) =>
        categories.find((category) => category.id === id) ?? FALLBACK_CATEGORY,
      usedCategories: () => {
        const used = new Set(products.map((product) => product.categoryId));
        return categories.filter((category) => used.has(category.id));
      },
    }),
    [products, categories],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog doit être utilisé dans <CatalogProvider>');
  return ctx;
}
