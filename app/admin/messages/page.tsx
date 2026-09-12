'use client';

import { useCallback } from 'react';
import { Phone } from 'lucide-react';
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
import { adminData } from '@/lib/admin-data';
import { telHref } from '@/config/site';

export default function AdminMessagesPage() {
  const load = useCallback(() => adminData.messages(), []);
  const { data, error, loading, reload } = useAdminResource(load);

  return (
    <>
      <AdminPageTitle title="Messages" description="Messages envoyes depuis le formulaire de contact." />

      {error && <ErrorState message={error} />}

      <AdminCard>
        {loading ? (
          <TableSkeleton />
        ) : !data || data.length === 0 ? (
          <EmptyState label="Aucun message recu." />
        ) : (
          <DataTable headers={['Expediteur', 'Message', 'Recu le', 'Statut']}>
            {[...data]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((message) => (
                <tr key={message.id} className="border-b border-border last:border-0 align-top">
                  <td className="px-4 py-3 text-sm">
                    <span className="font-medium">{message.name}</span>
                    {message.phone && (
                      <a
                        href={telHref(message.phone)}
                        dir="ltr"
                        className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary-700"
                      >
                        <Phone className="size-3" aria-hidden="true" />
                        {message.phone}
                      </a>
                    )}
                  </td>
                  <td className="max-w-md px-4 py-3 text-sm">{message.message}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(message.createdAt).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={message.status as string} />
                      <Select
                        value={(message.status as string) ?? 'NEW'}
                        onChange={async (event) => {
                          await adminData.setMessageStatus(message.id, event.target.value as never);
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
                </tr>
              ))}
          </DataTable>
        )}
      </AdminCard>
    </>
  );
}
