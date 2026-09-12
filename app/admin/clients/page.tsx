'use client';

import { useCallback } from 'react';
import { Phone } from 'lucide-react';
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
import { adminData } from '@/lib/admin-data';
import { telHref } from '@/config/site';

type Customer = {
  phone: string;
  name: string;
  requests: number;
  prescriptions: number;
  lastSeen: string;
};

/**
 * Il n'existe pas de compte client sur ce site : la fiche client est deduite
 * des demandes et ordonnances recues, regroupees par numero de telephone.
 */
export default function AdminCustomersPage() {
  const load = useCallback(async (): Promise<Customer[]> => {
    const [requests, prescriptions] = await Promise.all([
      adminData.orderRequests(),
      adminData.prescriptions(),
    ]);

    const byPhone = new Map<string, Customer>();

    function record(phone: string, name: string, date: string, kind: 'request' | 'prescription') {
      const key = phone.replace(/\s/g, '');
      const existing = byPhone.get(key);
      if (existing) {
        existing.requests += kind === 'request' ? 1 : 0;
        existing.prescriptions += kind === 'prescription' ? 1 : 0;
        if (date > existing.lastSeen) existing.lastSeen = date;
        return;
      }
      byPhone.set(key, {
        phone,
        name,
        requests: kind === 'request' ? 1 : 0,
        prescriptions: kind === 'prescription' ? 1 : 0,
        lastSeen: date,
      });
    }

    requests.forEach((item) => record(item.phone, item.customerName, item.createdAt, 'request'));
    prescriptions.forEach((item) =>
      record(item.phone, item.customerName, item.createdAt, 'prescription'),
    );

    return Array.from(byPhone.values()).sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
  }, []);

  const { data, error, loading } = useAdminResource(load);

  return (
    <>
      <AdminPageTitle
        title="Clients"
        description="Personnes ayant contacte la pharmacie, regroupees par numero de telephone."
      />

      {error && <ErrorState message={error} />}

      <AdminCard>
        {loading ? (
          <TableSkeleton />
        ) : !data || data.length === 0 ? (
          <EmptyState label="Aucun client enregistre." />
        ) : (
          <DataTable headers={['Nom', 'Telephone', 'Demandes', 'Ordonnances', 'Dernier contact']}>
            {data.map((customer) => (
              <tr key={customer.phone} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm font-medium">{customer.name}</td>
                <td className="px-4 py-3">
                  <a
                    href={telHref(customer.phone)}
                    dir="ltr"
                    className="inline-flex items-center gap-1 text-sm hover:text-primary-700"
                  >
                    <Phone className="size-3.5" aria-hidden="true" />
                    {customer.phone}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="neutral">{customer.requests}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={customer.prescriptions > 0 ? 'warning' : 'neutral'}>
                    {customer.prescriptions}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {new Date(customer.lastSeen).toLocaleString('fr-FR')}
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </AdminCard>
    </>
  );
}
