import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { AdminGuard } from '@/components/admin/admin-guard';
import { AdminShell } from '@/components/admin/admin-shell';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Administration — Pharmacie Globe Terrestre',
  // Le back-office ne doit jamais apparaitre dans les resultats de recherche.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans">
        <AdminGuard>
          <AdminShell>{children}</AdminShell>
        </AdminGuard>
      </body>
    </html>
  );
}
