'use client';

import { useCallback, useMemo, useState } from 'react';
import { Eye, EyeOff, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import {
  AdminCard,
  AdminPageTitle,
  DataTable,
  EmptyState,
  ErrorState,
  TableSkeleton,
  useAdminResource,
} from '@/components/admin/admin-ui';
import { ProductForm } from '@/components/admin/product-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminData, type CategoryRow, type ProductRow } from '@/lib/admin-data';
import { normalize } from '@/lib/utils';

export default function AdminProductsPage() {
  const load = useCallback(
    async () => ({
      products: await adminData.products(),
      categories: await adminData.categories(),
    }),
    [],
  );

  const { data, error, loading, reload } = useAdminResource(load);
  const [editing, setEditing] = useState<ProductRow | null | 'new'>(null);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const categories: CategoryRow[] = data?.categories ?? [];
  const categoryName = (id: string | null | undefined) =>
    categories.find((category) => category.id === id)?.nameFr ?? '—';

  const rows = useMemo(() => {
    const list = data?.products ?? [];
    const needle = normalize(query.trim());
    if (!needle) return list;
    return list.filter((product) =>
      normalize([product.name, product.sku, product.activeIngredient].filter(Boolean).join(' ')).includes(
        needle,
      ),
    );
  }, [data, query]);

  async function togglePublished(product: ProductRow) {
    setBusyId(product.id);
    try {
      await adminData.updateProduct({ id: product.id, published: !product.published });
      reload();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(product: ProductRow) {
    // Suppression definitive : on demande une confirmation explicite.
    if (!window.confirm(`Supprimer définitivement « ${product.name} » ?`)) return;
    setBusyId(product.id);
    try {
      await adminData.deleteProduct(product.id);
      reload();
    } finally {
      setBusyId(null);
    }
  }

  if (editing !== null) {
    return (
      <>
        <AdminPageTitle
          title={editing === 'new' ? 'Nouveau produit' : `Modifier « ${editing.name} »`}
        />
        <AdminCard className="p-6">
          <ProductForm
            product={editing === 'new' ? null : editing}
            categories={categories}
            onDone={() => {
              setEditing(null);
              reload();
            }}
            onCancel={() => setEditing(null)}
          />
        </AdminCard>
      </>
    );
  }

  return (
    <>
      <AdminPageTitle
        title="Produits"
        description="Catalogue publié sur le site."
        action={
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" />
            Ajouter un produit
          </Button>
        }
      />

      {error && <ErrorState message={error} />}

      <AdminCard>
        <div className="border-b border-border p-4">
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher par nom, SKU ou substance active…"
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState label="Aucun produit enregistré." />
        ) : (
          <DataTable
            headers={['Produit', 'Catégorie', 'Dosage', 'Stock', 'Statut', 'Actions']}
          >
            {rows.map((product) => (
              <tr key={product.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{product.name}</span>
                    {product.featured && (
                      <Star className="size-3.5 fill-amber-400 text-amber-400" aria-label="Mis en avant" />
                    )}
                  </div>
                  {product.sku && (
                    <span className="text-xs text-muted-foreground" dir="ltr">
                      {product.sku}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">{categoryName(product.categoryId)}</td>
                <td className="px-4 py-3 text-sm">{product.strength ?? '—'}</td>
                <td className="px-4 py-3 text-sm">
                  {typeof product.stockQuantity === 'number' ? product.stockQuantity : '—'}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={product.published === false ? 'neutral' : 'success'}>
                    {product.published === false ? 'Masqué' : 'Visible'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title={product.published === false ? 'Afficher' : 'Masquer'}
                      disabled={busyId === product.id}
                      onClick={() => togglePublished(product)}
                    >
                      {product.published === false ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Modifier"
                      onClick={() => setEditing(product)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Supprimer"
                      className="text-destructive"
                      disabled={busyId === product.id}
                      onClick={() => remove(product)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </AdminCard>
    </>
  );
}
