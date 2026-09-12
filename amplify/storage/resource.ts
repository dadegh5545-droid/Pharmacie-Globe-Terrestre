import { defineStorage } from '@aws-amplify/backend';

/**
 * Stockage S3.
 *
 * `ordonnances/` contient des données de santé : le préfixe est strictement
 * privé. Chaque client n'accède qu'à son propre sous-dossier (`{entity_id}`
 * = son identité Cognito) et seul le groupe `admin` peut lire l'ensemble.
 * Aucun accès invité n'y est ouvert, en lecture comme en écriture.
 *
 * `produits/` est au contraire public en lecture : ce sont les photos du
 * catalogue.
 */
export const storage = defineStorage({
  name: 'pgtMedia',
  access: (allow) => ({
    'ordonnances/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write']),
      allow.groups(['admin']).to(['read', 'delete']),
    ],
    'produits/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
      allow.groups(['admin']).to(['read', 'write', 'delete']),
    ],
  }),
});
