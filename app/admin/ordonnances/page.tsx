'use client';

import { useCallback, useState } from 'react';
import { getUrl } from 'aws-amplify/storage';
import { Download, Loader2, Lock, Phone } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { adminData } from '@/lib/admin-data';
import { telHref } from '@/config/site';

/** Durée de validité du lien signé, volontairement courte. */
const LINK_TTL_SECONDS = 120;

export default function AdminPrescriptionsPage() {
  const load = useCallback(() => adminData.prescriptions(), []);
  const { data, error, loading, reload } = useAdminResource(load);
  const [busyId, setBusyId] = useState<string | null>(null);

  /**
   * Le fichier n'est jamais servi publiquement : on génère à la demande une
   * URL S3 signée, valable deux minutes, ouverte dans un nouvel onglet.
   */
  async function openFile(id: string, fileKey: string) {
    setBusyId(id);
    try {
      const { url } = await getUrl({
        path: fileKey,
        options: { expiresIn: LINK_TTL_SECONDS },
      });
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    } catch (cause) {
      console.error(cause);
      window.alert("Le fichier n'a pas pu être ouvert.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <AdminPageTitle
        title="Ordonnances"
        description="Documents transmis par les patients. Accès strictement interne."
      />

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-soft">
        <Lock className="mt-0.5 size-5 shrink-0 text-primary-700" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Les ordonnances sont stockées dans un espace privé. Chaque ouverture génère un lien
          temporaire valable {LINK_TTL_SECONDS} secondes : ne le partagez pas et ne le collez pas
          dans un canal externe.
        </p>
      </div>

      {error && <ErrorState message={error} />}

      <AdminCard>
        {loading ? (
          <TableSkeleton />
        ) : !data || data.length === 0 ? (
          <EmptyState label="Aucune ordonnance reçue." />
        ) : (
          <DataTable headers={['Référence', 'Patient', 'Reçue le', 'Statut', 'Fichier']}>
            {[...data]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium" dir="ltr">
                    {item.reference}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {item.customerName}
                    <a
                      href={telHref(item.phone)}
                      dir="ltr"
                      className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary-700"
                    >
                      <Phone className="size-3" aria-hidden="true" />
                      {item.phone}
                    </a>
                    {item.message && (
                      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{item.message}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.status as string} />
                      <Select
                        value={(item.status as string) ?? 'NEW'}
                        onChange={async (event) => {
                          await adminData.setPrescriptionStatus(
                            item.id,
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
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === item.id}
                      onClick={() => openFile(item.id, item.fileKey)}
                    >
                      {busyId === item.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Download className="size-4" />
                      )}
                      Ouvrir
                    </Button>
                  </td>
                </tr>
              ))}
          </DataTable>
        )}
      </AdminCard>
    </>
  );
}
