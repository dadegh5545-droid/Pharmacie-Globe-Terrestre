'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Product } from '@/data/catalog';

const STORAGE_KEY = 'pgt.request';
export const MAX_QUANTITY = 99;

/**
 * « Ma demande » — liste de produits que le client soumet à la pharmacie.
 * Ce n'est volontairement pas un panier d'achat : aucun paiement n'a lieu en
 * ligne, la pharmacie confirme disponibilité et prix avant toute délivrance.
 */
export type RequestLine = {
  productId: string;
  slug: string;
  name: string;
  strength: string | null;
  quantity: number;
  needsValidation: boolean;
};

type RequestValue = {
  lines: RequestLine[];
  count: number;
  ready: boolean;
  add: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  has: (productId: string) => boolean;
};

const RequestContext = createContext<RequestValue | null>(null);

function readStored(): RequestLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line): line is RequestLine =>
        typeof line === 'object' &&
        line !== null &&
        typeof (line as RequestLine).productId === 'string' &&
        typeof (line as RequestLine).quantity === 'number',
    );
  } catch {
    return [];
  }
}

export function RequestProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<RequestLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(readStored());
    setReady(true);
  }, []);

  // L'écriture n'a lieu qu'après hydratation, sinon l'état initial vide
  // écraserait la demande sauvegardée.
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* stockage indisponible : la demande reste en mémoire pour la session */
    }
  }, [lines, ready]);

  const add = useCallback((product: Product, quantity = 1) => {
    setLines((current) => {
      const existing = current.find((line) => line.productId === product.id);
      if (existing) {
        return current.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: Math.min(line.quantity + quantity, MAX_QUANTITY) }
            : line,
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          strength: product.strength,
          quantity: Math.min(quantity, MAX_QUANTITY),
          needsValidation: product.pharmacistValidation === 'MAY_BE_REQUIRED',
        },
      ];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((current) =>
      current.flatMap((line) => {
        if (line.productId !== productId) return [line];
        const next = Math.max(0, Math.min(quantity, MAX_QUANTITY));
        return next === 0 ? [] : [{ ...line, quantity: next }];
      }),
    );
  }, []);

  const remove = useCallback(
    (productId: string) =>
      setLines((current) => current.filter((line) => line.productId !== productId)),
    [],
  );

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<RequestValue>(
    () => ({
      lines,
      ready,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
      has: (productId) => lines.some((line) => line.productId === productId),
    }),
    [lines, ready, add, setQuantity, remove, clear],
  );

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>;
}

export function useRequest(): RequestValue {
  const ctx = useContext(RequestContext);
  if (!ctx) throw new Error('useRequest doit être utilisé dans <RequestProvider>');
  return ctx;
}
