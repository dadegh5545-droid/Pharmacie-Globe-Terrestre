'use client';

import { useCallback, useState } from 'react';
import { ChevronDown, Phone } from 'lucide-react';
import {
  AdminCard,
  AdminPageTitle,
  DataTable,
  EmptyState,
  ErrorState,
  STATUS_OPTIONS,
  StatusBadge,
  TableSkeleton,
  useAdminResource,
} from '@/components/admin/admin-ui';
import { Select } from '@/components/ui/input';
import { adminData, type OrderItemRow } from '@/lib/admin-data';
import { telHref } from '@/config/site';

export default function AdminRequestsPage() {
  const load = useCallback(() => adminData.orderRequests(), []);
  const { data, error, loading, reload } = useAdminResource(load);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, OrderItemRow[]>>({});

  async function toggle(id: string) {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    if (!items[id]) {
      const { data: rows } = await adminData.orderItems(id);
      setItems((current) => ({ ...current, [id]: rows ?? [] }));
    }
  }

  return (
    <>
      <AdminPageTitle
        title="Demandes"
        description="Demandes de disponibilité envoyées depuis le site."
      />

      {error && <ErrorState message={error} />}

      <AdminCard>
        {loading ? (
          <TableSkeleton />
        ) : !data || data.length === 0 ? (
          <EmptyState label="Aucune demande reçue pour le moment." />
        ) : (
          <DataTable headers={['Référence', 'Client', 'Reçue le', 'Statut', '']}>
            {[...data]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((request) => (
                <>
                  <tr key={request.id} className="border-b border-border">
                    <td className="px-4 py-3 font-medium" dir="ltr">
                      {request.reference}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {request.customerName}
                      <a
                        href={telHref(request.phone)}
                        dir="ltr"
                        className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary-700"
                      >
                        <Phone className="size-3" aria-hidden="true" />
                        {request.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(request.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={request.status as string} />
                        <Select
                          value={(request.status as string) ?? 'NEW'}
                          onChange={async (event) => {
                            await adminData.setRequestStatus(
                              request.id,
                              event.target.value as never,
                            );
                            reload();
                          }}
                          className="h-9 w-36"
                          aria-label="Changer le statut"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggle(request.id)}
                        aria-expanded={expanded === request.id}
                        className="inline-flex items-center gap-1 text-sm text-primary-700 hover:underline"
                      >
                        Détail
                        <ChevronDown
                          className={`size-4 transition-transform ${
                            expanded === request.id ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </td>
                  </tr>

                  {expanded === request.id && (
                    <tr key={`${request.id}-detail`} className="border-b border-border bg-muted/40">
                      <td colSpan={5} className="px-4 py-4">
                        {request.note && (
                          <p className="mb-3 text-sm">
                            <span className="font-semibold">Remarque : </span>
                            {request.note}
                          </p>
                        )}
                        <ul className="space-y-1 text-sm">
                          {(items[request.id] ?? []).map((item) => (
                            <li key={item.id} className="flex justify-between gap-4">
                              <span>
                                {item.productName}
                                {item.strength ? ` — ${item.strength}` : ''}
                              </span>
                              <span className="text-muted-foreground">× {item.quantity}</span>
                            </li>
                          ))}
                          {(items[request.id] ?? []).length === 0 && (
                            <li className="text-muted-foreground">Aucune ligne enregistrée.</li>
                          )}
                        </ul>
                      </td>
                    </tr>
                  )}
                </>
              ))}
          </DataTable>
        )}
      </AdminCard>
    </>
  );
}
