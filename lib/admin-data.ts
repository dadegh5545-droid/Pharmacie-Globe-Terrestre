'use client';

import { getClient } from '@/lib/amplify-client';
import type { Schema } from '@/amplify/data/resource';

/**
 * Accès aux données du back-office.
 *
 * Toutes les écritures passent par AppSync, dont les règles d'autorisation
 * (groupe `admin`) sont appliquées côté serveur : l'interface ne fait que
 * refléter ces droits, elle ne les accorde pas.
 */

export type ProductRow = Schema['Product']['type'];
export type CategoryRow = Schema['Category']['type'];
export type OrderRequestRow = Schema['OrderRequest']['type'];
export type OrderItemRow = Schema['OrderItem']['type'];
export type PrescriptionRow = Schema['PrescriptionRequest']['type'];
export type MessageRow = Schema['ContactMessage']['type'];
export type SettingsRow = Schema['BusinessSettings']['type'];

export class BackendUnavailable extends Error {
  constructor() {
    super('backend-unavailable');
    this.name = 'BackendUnavailable';
  }
}

function client() {
  const instance = getClient();
  if (!instance) throw new BackendUnavailable();
  return instance;
}

/** Récupère toutes les pages d'une collection (le back-office reste modeste). */
async function listAll<T>(
  fetchPage: (token?: string) => Promise<{ data: T[]; nextToken?: string | null }>,
): Promise<T[]> {
  const all: T[] = [];
  let token: string | undefined;
  do {
    const page = await fetchPage(token);
    all.push(...page.data);
    token = page.nextToken ?? undefined;
  } while (token);
  return all;
}

export const adminData = {
  products: () =>
    listAll<ProductRow>((nextToken) =>
      client().models.Product.list({ limit: 200, nextToken }) as never,
    ),

  categories: () =>
    listAll<CategoryRow>((nextToken) =>
      client().models.Category.list({ limit: 200, nextToken }) as never,
    ),

  orderRequests: () =>
    listAll<OrderRequestRow>((nextToken) =>
      client().models.OrderRequest.list({ limit: 200, nextToken }) as never,
    ),

  prescriptions: () =>
    listAll<PrescriptionRow>((nextToken) =>
      client().models.PrescriptionRequest.list({ limit: 200, nextToken }) as never,
    ),

  messages: () =>
    listAll<MessageRow>((nextToken) =>
      client().models.ContactMessage.list({ limit: 200, nextToken }) as never,
    ),

  settings: async (): Promise<SettingsRow | null> => {
    const { data } = await client().models.BusinessSettings.list({ limit: 1 });
    return data[0] ?? null;
  },

  saveSettings: async (input: Partial<SettingsRow> & { id?: string }) => {
    const models = client().models.BusinessSettings;
    if (input.id) return models.update(input as never);
    return models.create(input as never);
  },

  createProduct: (input: Record<string, unknown>) =>
    client().models.Product.create(input as never),
  updateProduct: (input: Record<string, unknown>) =>
    client().models.Product.update(input as never),
  deleteProduct: (id: string) => client().models.Product.delete({ id }),

  createCategory: (input: Record<string, unknown>) =>
    client().models.Category.create(input as never),
  updateCategory: (input: Record<string, unknown>) =>
    client().models.Category.update(input as never),
  deleteCategory: (id: string) => client().models.Category.delete({ id }),

  setRequestStatus: (id: string, status: OrderRequestRow['status']) =>
    client().models.OrderRequest.update({ id, status } as never),

  setPrescriptionStatus: (id: string, status: PrescriptionRow['status']) =>
    client().models.PrescriptionRequest.update({ id, status } as never),

  setMessageStatus: (id: string, status: MessageRow['status']) =>
    client().models.ContactMessage.update({ id, status } as never),

  orderItems: (orderRequestId: string) =>
    client().models.OrderItem.list({
      filter: { orderRequestId: { eq: orderRequestId } },
      limit: 200,
    }),
};
