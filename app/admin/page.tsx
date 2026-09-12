'use client';

import Link from 'next/link';
import { useCallback } from 'react';
import {
  AlertTriangle,
  Boxes,
  FileHeart,
  Inbox,
  MessageSquare,
  Package,
  TrendingDown,
} from 'lucide-react';
import {
  AdminCard,
  AdminPageTitle,
  ErrorState,
  StatusBadge,
  TableSkeleton,
  useAdminResource,
} from '@/components/admin/admin-ui';
import { Badge } from '@/components/ui/badge';
import { adminData } from '@/lib/admin-data';
import { siteConfig } from '@/config/site';

type Overview = {
  products: number;
  published: number;
  lowStock: { id: string; name: string; stock: number }[];
  requests: { total: number; pending: number };
  prescriptions: { total: number; pending: number };
  messages: number;
};

function StatCard({
  Icon,
  label,
  value,
  hint,
  href,
}: {
  Icon: typeof Package;
  label: string;
  value: number | string;
  hint?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary-700">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-4 text-2xl font-bold">{value}</p>
      <p className="text-sm font-medium">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </Link>
  );
}

export default function AdminDashboard() {
  const load = useCallback(async (): Promise<Overview> => {
    const [products, requests, prescriptions, messages] = await Promise.all([
      adminData.products(),
      adminData.orderRequests(),
      adminData.prescriptions(),
      adminData.messages(),
    ]);

    const threshold = siteConfig.lowStockThreshold;

    return {
      products: products.length,
      published: products.filter((product) => product.published !== false).length,
      lowStock: products
        .filter(
          (product) =>
            typeof product.stockQuantity === 'number' &&
            product.stockQuantity <= (product.minimumStock ?? threshold),
        )
        .map((product) => ({
          id: product.id,
          name: product.name,
          stock: product.stockQuantity ?? 0,
        }))
        .sort((a, b) => a.stock - b.stock),
      requests: {
        total: requests.length,
        pending: requests.filter((request) => (request.status ?? 'NEW') === 'NEW').length,
      },
      prescriptions: {
        total: prescriptions.length,
        pending: prescriptions.filter((item) => (item.status ?? 'NEW') === 'NEW').length,
      },
      messages: messages.filter((message) => (message.status ?? 'NEW') === 'NEW').length,
    };
  }, []);

  const { data, error, loading } = useAdminResource(load);

  return (
    <>
      <AdminPageTitle
        title="Tableau de bord"
        description="Vue d'ensemble du catalogue et des demandes reçues."
      />

      {error && <ErrorState message={error} />}
      {loading && !error && <TableSkeleton rows={3} />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              Icon={Package}
              label="Produits"
              value={data.products}
              hint={`${data.published} publié(s)`}
              href="/admin/produits"
            />
            <StatCard
              Icon={Inbox}
              label="Demandes"
              value={data.requests.total}
              hint={`${data.requests.pending} nouvelle(s)`}
              href="/admin/demandes"
            />
            <StatCard
              Icon={FileHeart}
              label="Ordonnances"
              value={data.prescriptions.total}
              hint={`${data.prescriptions.pending} à traiter`}
              href="/admin/ordonnances"
            />
            <StatCard
              Icon={MessageSquare}
              label="Messages non lus"
              value={data.messages}
              href="/admin/messages"
            />
          </div>

          <AdminCard className="mt-6">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <TrendingDown className="size-4 text-amber-600" aria-hidden="true" />
              <h2 className="text-sm font-semibold">Stock faible</h2>
              <Badge variant="warning" className="ms-auto">
                seuil : {siteConfig.lowStockThreshold}
              </Badge>
            </div>

            {data.lowStock.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                Aucun produit sous le seuil d&apos;alerte.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {data.lowStock.slice(0, 8).map((product) => (
                  <li key={product.id} className="flex items-center gap-3 px-5 py-3">
                    <AlertTriangle className="size-4 shrink-0 text-amber-500" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {product.name}
                    </span>
                    <Badge variant={product.stock === 0 ? 'danger' : 'warning'}>
                      <Boxes aria-hidden="true" />
                      {product.stock}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>

          {/* Rappel de configuration : sans indicatif, WhatsApp reste inactif. */}
          {!siteConfig.contact.countryCode && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold">Indicatif international non configuré</p>
                <p className="mt-1 leading-relaxed">
                  Les boutons WhatsApp sont désactivés tant que{' '}
                  <code className="rounded bg-white/70 px-1.5 py-0.5">NEXT_PUBLIC_COUNTRY_CODE</code>{' '}
                  n&apos;est pas renseigné (ou <code>countryCode</code> dans{' '}
                  <code>config/site.ts</code>). Les liens d&apos;appel restent fonctionnels.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
