'use client';

import { useCallback, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
import { Input, Label } from '@/components/ui/input';
import { adminData, type CategoryRow } from '@/lib/admin-data';
import { sanitizeText } from '@/lib/utils';

const EMPTY = { slug: '', nameFr: '', nameAr: '', nameEn: '', icon: '', sortOrder: '0' };

export default function AdminCategoriesPage() {
  const load = useCallback(() => adminData.categories(), []);
  const { data, error, loading, reload } = useAdminResource(load);

  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  function startCreate() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function startEdit(category: CategoryRow) {
    setEditing(category);
    setForm({
      slug: category.slug,
      nameFr: category.nameFr,
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      icon: category.icon ?? '',
      sortOrder: String(category.sortOrder ?? 0),
    });
    setOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      slug: sanitizeText(form.slug, 80) || sanitizeText(form.nameFr, 80).toLowerCase(),
      nameFr: sanitizeText(form.nameFr, 120),
      nameAr: sanitizeText(form.nameAr, 120),
      nameEn: sanitizeText(form.nameEn, 120),
      icon: sanitizeText(form.icon, 40) || null,
      sortOrder: Number(form.sortOrder) || 0,
    };
    if (!payload.nameFr) return;

    setSaving(true);
    try {
      if (editing) await adminData.updateCategory({ id: editing.id, ...payload });
      else await adminData.createCategory(payload);
      setOpen(false);
      reload();
    } finally {
      setSaving(false);
    }
  }

  async function remove(category: CategoryRow) {
    if (!window.confirm(`Supprimer la catégorie « ${category.nameFr} » ?`)) return;
    await adminData.deleteCategory(category.id);
    reload();
  }

  return (
    <>
      <AdminPageTitle
        title="Catégories"
        description="Rayons affichés sur l’accueil et dans les filtres du catalogue."
        action={
          <Button onClick={startCreate}>
            <Plus className="size-4" />
            Ajouter
          </Button>
        }
      />

      {error && <ErrorState message={error} />}

      {open && (
        <AdminCard className="mb-6 p-6">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Nom (FR) *</Label>
              <Input
                value={form.nameFr}
                onChange={(event) => setForm((f) => ({ ...f, nameFr: event.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Nom (AR)</Label>
              <Input
                dir="rtl"
                value={form.nameAr}
                onChange={(event) => setForm((f) => ({ ...f, nameAr: event.target.value }))}
              />
            </div>
            <div>
              <Label>Nom (EN)</Label>
              <Input
                value={form.nameEn}
                onChange={(event) => setForm((f) => ({ ...f, nameEn: event.target.value }))}
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                dir="ltr"
                value={form.slug}
                onChange={(event) => setForm((f) => ({ ...f, slug: event.target.value }))}
              />
            </div>
            <div>
              <Label>Icône (nom Lucide)</Label>
              <Input
                dir="ltr"
                placeholder="Pill, Baby, Leaf…"
                value={form.icon}
                onChange={(event) => setForm((f) => ({ ...f, icon: event.target.value }))}
              />
            </div>
            <div>
              <Label>Ordre d’affichage</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(event) => setForm((f) => ({ ...f, sortOrder: event.target.value }))}
              />
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Annuler
              </Button>
            </div>
          </form>
        </AdminCard>
      )}

      <AdminCard>
        {loading ? (
          <TableSkeleton />
        ) : !data || data.length === 0 ? (
          <EmptyState label="Aucune catégorie enregistrée." />
        ) : (
          <DataTable headers={['Français', 'العربية', 'English', 'Ordre', 'Actions']}>
            {[...data]
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              .map((category) => (
                <tr key={category.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-medium">{category.nameFr}</span>
                    <span className="ms-2 text-xs text-muted-foreground" dir="ltr">
                      {category.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" dir="rtl">
                    {category.nameAr}
                  </td>
                  <td className="px-4 py-3 text-sm">{category.nameEn}</td>
                  <td className="px-4 py-3">
                    <Badge variant="neutral">{category.sortOrder ?? 0}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(category)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => remove(category)}
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
