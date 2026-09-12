import { defineAuth } from '@aws-amplify/backend';

/**
 * Authentification des clients de la boutique.
 * Le groupe `admin` donne accès au back-office (/admin) et à la gestion du catalogue.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    preferredUsername: { required: false, mutable: true },
    phoneNumber: { required: false, mutable: true },
  },
  groups: ['admin'],
});
