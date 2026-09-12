'use client';

import { useCallback, useMemo, useState } from 'react';
import { AlertTriangle, Check, Save } from 'lucide-react';
import {
  AdminCard,
  AdminPageTitle,
  DataTable,
  EmptyState,
  ErrorState,
  TableSkeleton,
  useAdminResource,
} from '@/components/admin/admin-ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { adminData } from '@/lib/admin-data';
import { siteConfig } from '@/config/site';

const AVAILABILITY = [
  { value: 'IN_STOCK', label: 'En stock' },
  { value: 'LOW_STOCK', label: 'Stock limité' },
  { value: 'OUT_OF_STOCK', label: 'Indisponible' },
  { value: 'ON_ORDER', label: 'Sur commande' },
  { value: 'CONTACT_PHARMACY', label: 'Contacter la pharmacie' },
];

type Draft = { stockQuantity: string; minimumStock: string; availability: string };

/**
 * Édition rapide du stock et de la disponibilité, produit par produit.
 * Chaque ligne s'enregistre indépendamment : pas de sauvegarde globale qui
 * risquerait d'écraser le travail d'un collègue.
 */
export default function AdminInventoryPage() {
  const load = useCallback(() => adminData.products(), []);
  const { data, error, loading, reload } = useAdminResource(load);

  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savedId, setSavedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = useMemo(
    () => [...(data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [data],
  );

  function draftFor(id: string, fallback: Draft): Draft {
    return drafts[id] ?? fallback;
  }

  function update(id: string, patch: Partial<Draft>, fallback: Draft) {
    setDrafts((current) => ({ ...current, [id]: { ...draftFor(id, fallback), ...patch } }));
  }

  async function save(id: string, fallback: Draft) {
    const draft = draftFor(id, fallback);
    setBusyId(id);
    try {
      await adminData.updateProduct({
        id,
        stockQuantity: draft.stockQuantity === '' ? null : Number(draft.stockQuantity),
        minimumStock: draft.minimumStock === '' ? null : Number(draft.minimumStock),
        availability: draft.availability,
      });
      setSavedId(id);
      window.setTimeout(() => setSavedId(null), 1800);
      reload();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <AdminPageTitle
        title="Inventaire"
        description={`Stock et disponibilité. Alerte sous le seuil défini (défaut : ${siteConfig.lowStockThreshold}).`}
      />

      {error && <ErrorState message={error} />}

      <AdminCard>
        {loading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState label="Aucun produit à gérer." />
        ) : (
          <DataTable
            headers={['Produit', 'SKU / code-barres', 'Stock', 'Seuil', 'Disponibilité', '']}
          >
            {rows.map((product) => {
              const fallback: Draft = {
                stockQuantity:
                  typeof product.stockQuantity === 'number' ? String(product.stockQuantity) : '',
                minimumStock:
                  typeof product.minimumStock === 'number' ? String(product.minimumStock) : '',
                availability: (product.availability as string) ?? 'CONTACT_PHARMACY',
              };
              const draft = draftFor(product.id, fallback);
              const threshold = Number(draft.minimumStock || siteConfig.lowStockThreshold);
              const stock = Number(draft.stockQuantity);
              const low = draft.stockQuantity !== '' && stock <= threshold;

              return (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {low && (
                        <AlertTriangle
                          className="size-4 shrink-0 text-amber-500"
                          aria-label="Stock faible"
                        />
                      )}
                      <span className="font-medium">{product.name}</span>
                    </div>
                    {product.strength && (
                      <span className="text-xs text-muted-foreground">{product.strength}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground" dir="ltr">
                    {product.sku ?? '—'}
                    {product.barcode ? ` · ${product.barcode}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min={0}
                      value={draft.stockQuantity}
                      onChange={(event) =>
                        update(product.id, { stockQuantity: event.target.value }, fallback)
                      }
                      className="h-9 w-24"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min={0}
                      value={draft.minimumStock}
                      onChange={(event) =>
                        update(product.id, { minimumStock: event.target.value }, fallback)
                      }
                      placeholder={String(siteConfig.lowStockThreshold)}
                      className="h-9 w-24"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={draft.availability}
                      onChange={(event) =>
                        update(product.id, { availability: event.target.value }, fallback)
                      }
                      className="h-9 w-48"
                    >
                      {AVAILABILITY.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    {savedId === product.id ? (
                      <Badge variant="success">
                        <Check aria-hidden="true" />
                        Enregistré
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === product.id}
                        onClick={() => save(product.id, fallback)}
                      >
                        <Save className="size-4" />
                        Enregistrer
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </DataTable>
        )}
      </AdminCard>
    </>
  );
}
