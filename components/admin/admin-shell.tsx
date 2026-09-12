'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { signOut } from 'aws-amplify/auth';
import {
  Boxes,
  ExternalLink,
  FileHeart,
  FolderTree,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { LogoMark } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { defaultLocale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

const dict = getDictionary(defaultLocale);

const NAV = [
  { href: '/admin', label: dict['admin.dashboard'], Icon: LayoutDashboard, exact: true },
  { href: '/admin/produits', label: dict['admin.products'], Icon: Package },
  { href: '/admin/categories', label: dict['admin.categories'], Icon: FolderTree },
  { href: '/admin/inventaire', label: dict['admin.inventory'], Icon: Boxes },
  { href: '/admin/demandes', label: dict['admin.requests'], Icon: Inbox },
  { href: '/admin/ordonnances', label: dict['admin.prescriptions'], Icon: FileHeart },
  { href: '/admin/clients', label: dict['admin.customers'], Icon: Users },
  { href: '/admin/messages', label: dict['admin.messages'], Icon: MessageSquare },
  { href: '/admin/parametres', label: dict['admin.settings'], Icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const nav = (
    <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
      {NAV.map(({ href, label, Icon, exact }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          aria-current={isActive(href, exact) ? 'page' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
            isActive(href, exact)
              ? 'bg-primary-50 text-primary-700'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-muted/40" dir="ltr">
      {/* Colonne latérale — bureau */}
      <aside className="hidden w-64 shrink-0 flex-col border-e border-border bg-white lg:flex">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
          <LogoMark className="size-8" />
          <span className="text-sm font-bold text-primary-700">{dict['admin.title']}</span>
        </div>
        {nav}
        <div className="space-y-2 border-t border-border p-3">
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <Link href={`/${defaultLocale}`} target="_blank">
              <ExternalLink className="size-4" />
              {dict['admin.backToSite']}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive"
            onClick={() => signOut()}
          >
            <LogOut className="size-4" />
            {dict['admin.signOut']}
          </Button>
        </div>
      </aside>

      {/* Tiroir mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 start-0 flex w-[280px] flex-col bg-white shadow-lift">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <LogoMark className="size-8" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={dict['common.close']}
                className="grid size-9 place-items-center rounded-xl border border-border"
              >
                <X className="size-4" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={dict['nav.menu']}
            className="grid size-10 place-items-center rounded-xl border border-border"
          >
            <Menu className="size-5" />
          </button>
          <span className="text-sm font-bold text-primary-700">{dict['admin.title']}</span>
        </header>

        <main className="min-w-0 flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
