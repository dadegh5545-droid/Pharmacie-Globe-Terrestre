'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AlertCircle, Inbox } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { defaultLocale } from '@/lib/i18n/config';
import { BackendUnavailable } from '@/lib/admin-data';
import { cn } from '@/lib/utils';

const dict = getDictionary(defaultLocale);

export function AdminPageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('rounded-2xl border border-border bg-white shadow-soft', className)}>
      {children}
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="px-6 py-16 text-center">
      <Inbox className="mx-auto size-9 text-muted-foreground/40" aria-hidden="true" />
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
      <p className="text-sm text-red-800">{message}</p>
    </div>
  );
}

/** Table responsive : défilement horizontal plutôt que colonnes écrasées. */
export function DataTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b border-border">
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

const STATUS_STYLE: Record<string, BadgeProps['variant']> = {
  NEW: 'warning',
  IN_PROGRESS: 'info',
  ANSWERED: 'success',
  CLOSED: 'neutral',
  CANCELLED: 'danger',
};

const STATUS_LABEL: Record<string, string> = {
  NEW: 'Nouvelle',
  IN_PROGRESS: 'En cours',
  ANSWERED: 'Répondu',
  CLOSED: 'Clôturée',
  CANCELLED: 'Annulée',
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const key = status ?? 'NEW';
  return <Badge variant={STATUS_STYLE[key] ?? 'neutral'}>{STATUS_LABEL[key] ?? key}</Badge>;
}

export const STATUS_OPTIONS = Object.keys(STATUS_LABEL).map((value) => ({
  value,
  label: STATUS_LABEL[value],
}));

/**
 * Charge une ressource du back-office et gère les trois états visuels :
 * chargement, erreur (dont backend absent), données prêtes.
 */
export function useAdminResource<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    loader()
      .then(setData)
      .catch((cause: unknown) => {
        console.error(cause);
        setError(
          cause instanceof BackendUnavailable ? dict['state.demoMode'] : dict['admin.restricted'],
        );
      })
      .finally(() => setLoading(false));
    // `loader` est recréé à chaque rendu par les appelants : on l'exclut
    // volontairement pour ne pas boucler.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(reload, [reload]);

  return { data, error, loading, reload, setData };
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-12" />
      ))}
    </div>
  );
}
