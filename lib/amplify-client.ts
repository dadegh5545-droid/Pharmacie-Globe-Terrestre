'use client';

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import outputs from '@/amplify_outputs.json';
import type { Schema } from '@/amplify/data/resource';

/**
 * `amplify_outputs.json` vaut `{}` tant qu'aucun backend n'a été déployé
 * (cf. `scripts/ensure-outputs.mjs`). Le site fonctionne alors en mode
 * démonstration : catalogue statique de `data/catalog.ts`, et les
 * fonctionnalités nécessitant AWS (envoi d'ordonnance, back-office) affichent
 * un message explicite plutôt que d'échouer silencieusement.
 */
const raw = outputs as Record<string, unknown>;

export const backendReady = Object.keys(raw).length > 0;

if (backendReady) {
  Amplify.configure(raw as Parameters<typeof Amplify.configure>[0], { ssr: true });
}

let cached: ReturnType<typeof generateClient<Schema>> | null = null;

/** Client de données typé, ou `null` en mode démonstration. */
export function getClient() {
  if (!backendReady) return null;
  if (!cached) cached = generateClient<Schema>();
  return cached;
}
